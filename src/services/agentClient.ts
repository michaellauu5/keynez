/**
 * Streaming SSE client for the Keynez agent backend.
 *
 * POSTs to `${VITE_AGENT_URL}/chat` with an `x-keynez-secret` header and
 * parses a `text/event-stream` response. Uses fetch + ReadableStream (not
 * EventSource) because we need POST with custom headers.
 *
 * SSE frame shape (frames separated by a blank line):
 *   event: <name>
 *   data: <json>
 *
 * Dispatched events:
 *   tool_start      { name, args }
 *   tool_end        { name, summary }
 *   token           { text }
 *   recommendations { rows, dropped, table_markdown }
 *   error           { message }
 *   done            { assistant_content }
 *
 * Conversation history contract:
 *   The caller keeps a `messages` array of `{ role, content }`. After each
 *   turn finishes, append `{ role: "assistant", content: done.assistant_content }`
 *   using the RAW string from the done event. The next user turn sends the
 *   whole array back. Do NOT truncate or reformat `assistant_content`.
 */

export type ChatRole = "system" | "user" | "assistant";

import { AGENT_URL, KEYNEZ_SECRET } from "@/config";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ToolStartEvent {
  name: string;
  args?: unknown;
}

export interface ToolEndEvent {
  name: string;
  summary?: string;
}

export interface TokenEvent {
  text: string;
}

export interface RecommendationsEvent {
  rows: unknown[];
  dropped?: number;
  table_markdown?: string;
}

export interface ErrorEvent {
  message: string;
}

export interface DoneEvent {
  assistant_content: string;
}

export interface StreamChatHandlers {
  onToolStart?: (evt: ToolStartEvent) => void;
  onToolEnd?: (evt: ToolEndEvent) => void;
  onToken?: (evt: TokenEvent) => void;
  onRecommendations?: (evt: RecommendationsEvent) => void;
  onError?: (evt: ErrorEvent) => void;
  onDone?: (evt: DoneEvent) => void;
  signal?: AbortSignal;
}

function getConfig() {
  const url = AGENT_URL;
  const secret = KEYNEZ_SECRET;
  if (!url) {
    throw new Error(
      "AGENT_URL is not configured. Set VITE_AGENT_URL or edit src/config.ts."
    );
  }
  if (!secret) {
    throw new Error(
      "KEYNEZ_SECRET is not configured. Set VITE_KEYNEZ_SECRET or edit src/config.ts."
    );
  }
  return { url: url.replace(/\/$/, ""), secret };
}

function safeJsonParse(raw: string): unknown {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

type Dispatched = "continue" | "stop";

function dispatchFrame(
  event: string,
  data: unknown,
  handlers: StreamChatHandlers
): Dispatched {
  switch (event) {
    case "tool_start": {
      const payload = (data ?? {}) as ToolStartEvent;
      if (payload.name) handlers.onToolStart?.(payload);
      return "continue";
    }
    case "tool_end": {
      const payload = (data ?? {}) as ToolEndEvent;
      if (payload.name) handlers.onToolEnd?.(payload);
      return "continue";
    }
    case "token": {
      const text =
        typeof data === "string"
          ? data
          : typeof (data as { text?: unknown })?.text === "string"
            ? (data as { text: string }).text
            : "";
      if (text) handlers.onToken?.({ text });
      return "continue";
    }
    case "recommendations": {
      const payload = (data ?? {}) as RecommendationsEvent;
      handlers.onRecommendations?.({
        rows: Array.isArray(payload.rows) ? payload.rows : [],
        dropped: typeof payload.dropped === "number" ? payload.dropped : undefined,
        table_markdown:
          typeof payload.table_markdown === "string"
            ? payload.table_markdown
            : undefined,
      });
      return "continue";
    }
    case "error": {
      const message =
        typeof (data as { message?: unknown })?.message === "string"
          ? (data as { message: string }).message
          : typeof data === "string"
            ? data
            : "Agent backend reported an error.";
      handlers.onError?.({ message });
      return "stop";
    }
    case "done": {
      const assistant_content =
        typeof (data as { assistant_content?: unknown })?.assistant_content === "string"
          ? (data as { assistant_content: string }).assistant_content
          : "";
      handlers.onDone?.({ assistant_content });
      return "stop";
    }
    default:
      return "continue";
  }
}

function parseFrame(frame: string, handlers: StreamChatHandlers): Dispatched {
  let event = "message";
  const dataLines: string[] = [];
  for (const line of frame.split("\n")) {
    if (!line || line.startsWith(":")) continue;
    const idx = line.indexOf(":");
    const field = idx === -1 ? line : line.slice(0, idx);
    let value = idx === -1 ? "" : line.slice(idx + 1);
    if (value.startsWith(" ")) value = value.slice(1);
    if (field === "event") event = value;
    else if (field === "data") dataLines.push(value);
  }
  if (event === "message" && dataLines.length === 0) return "continue";
  const data = safeJsonParse(dataLines.join("\n"));
  return dispatchFrame(event, data, handlers);
}

export async function streamChat(
  messages: ChatMessage[],
  handlers: StreamChatHandlers = {}
): Promise<void> {
  let config: { url: string; secret: string };
  try {
    config = getConfig();
  } catch (err) {
    handlers.onError?.({
      message: err instanceof Error ? err.message : String(err),
    });
    return;
  }

  let response: Response;
  try {
    response = await fetch(`${config.url}/chat`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-keynez-secret": config.secret,
      },
      body: JSON.stringify({ messages }),
      signal: handlers.signal,
    });
  } catch (err) {
    if ((err as Error)?.name === "AbortError") return;
    handlers.onError?.({
      message: `Network error contacting agent backend: ${
        err instanceof Error ? err.message : String(err)
      }`,
    });
    return;
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    handlers.onError?.({
      message: `Agent backend returned ${response.status}${
        text ? `: ${text.slice(0, 500)}` : ""
      }`,
    });
    return;
  }
  if (!response.body) {
    handlers.onError?.({ message: "Agent backend returned an empty response body." });
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let stopped = false;

  try {
    while (!stopped) {
      const { value, done: streamDone } = await reader.read();
      if (value) buffer += decoder.decode(value, { stream: true });
      if (streamDone) buffer += decoder.decode();

      // SSE frames end on a blank line. Accept both \n\n and \r\n\r\n.
      let boundary = findFrameBoundary(buffer);
      while (boundary !== -1) {
        const frame = buffer.slice(0, boundary.index);
        buffer = buffer.slice(boundary.index + boundary.length);
        if (frame.trim()) {
          if (parseFrame(frame, handlers) === "stop") {
            stopped = true;
            break;
          }
        }
        boundary = findFrameBoundary(buffer);
      }

      if (streamDone) break;
    }
  } catch (err) {
    if ((err as Error)?.name === "AbortError") return;
    handlers.onError?.({
      message: `Stream interrupted: ${err instanceof Error ? err.message : String(err)}`,
    });
    return;
  }

  // Flush any trailing frame that didn't end with a blank line.
  if (!stopped && buffer.trim()) {
    parseFrame(buffer, handlers);
  }
}

function findFrameBoundary(
  buffer: string
): { index: number; length: number } | -1 {
  const lf = buffer.indexOf("\n\n");
  const crlf = buffer.indexOf("\r\n\r\n");
  if (lf === -1 && crlf === -1) return -1;
  if (lf === -1) return { index: crlf, length: 4 };
  if (crlf === -1) return { index: lf, length: 2 };
  return lf < crlf ? { index: lf, length: 2 } : { index: crlf, length: 4 };
}