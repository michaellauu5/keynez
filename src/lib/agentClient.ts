/**
 * Streaming SSE client for the Keynez agent backend.
 *
 * Reads VITE_AGENT_URL and VITE_AGENT_SHARED_SECRET from import.meta.env and
 * POSTs the message history to `${VITE_AGENT_URL}/chat`. The response is
 * parsed as a stream of Server-Sent Events with the following event types:
 *
 *   event: token       data: { text: string } | string
 *   event: tool_start  data: { name: string, args?: unknown }
 *   event: tool_end    data: { name: string, summary?: string }
 *   event: done        data: {} (terminates the stream)
 */

export type AgentRole = "system" | "user" | "assistant";

export interface AgentMessage {
  role: AgentRole;
  content: string;
}

export interface ToolStartPayload {
  name: string;
  args?: unknown;
}

export interface ToolEndPayload {
  name: string;
  summary?: string;
}

export interface StreamAgentReplyOptions {
  messages: AgentMessage[];
  onToken?: (text: string) => void;
  onToolStart?: (payload: ToolStartPayload) => void;
  onToolEnd?: (payload: ToolEndPayload) => void;
  onDone?: () => void;
  onError?: (err: Error) => void;
  signal?: AbortSignal;
}

export interface StreamHandle {
  abort: () => void;
  done: Promise<void>;
}

function getConfig() {
  const url = import.meta.env.VITE_AGENT_URL as string | undefined;
  const secret = import.meta.env.VITE_AGENT_SHARED_SECRET as string | undefined;
  if (!url) {
    throw new Error(
      "VITE_AGENT_URL is not configured. Add it to your environment to enable the agent backend."
    );
  }
  if (!secret) {
    throw new Error(
      "VITE_AGENT_SHARED_SECRET is not configured. Add it to your environment to enable the agent backend."
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

function dispatchEvent(
  event: string,
  data: unknown,
  opts: StreamAgentReplyOptions
): boolean {
  switch (event) {
    case "token": {
      const text =
        typeof data === "string"
          ? data
          : typeof (data as { text?: unknown })?.text === "string"
            ? ((data as { text: string }).text)
            : "";
      if (text) opts.onToken?.(text);
      return false;
    }
    case "tool_start": {
      const payload = (data ?? {}) as ToolStartPayload;
      if (payload.name) opts.onToolStart?.(payload);
      return false;
    }
    case "tool_end": {
      const payload = (data ?? {}) as ToolEndPayload;
      if (payload.name) opts.onToolEnd?.(payload);
      return false;
    }
    case "done": {
      opts.onDone?.();
      return true;
    }
    default:
      return false;
  }
}

function parseFrame(frame: string, opts: StreamAgentReplyOptions): boolean {
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
  if (event === "message" && dataLines.length === 0) return false;
  const data = safeJsonParse(dataLines.join("\n"));
  return dispatchEvent(event, data, opts);
}

export function streamAgentReply(opts: StreamAgentReplyOptions): StreamHandle {
  const controller = new AbortController();
  if (opts.signal) {
    if (opts.signal.aborted) controller.abort();
    else opts.signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  const done = (async () => {
    try {
      const { url, secret } = getConfig();
      const response = await fetch(`${url}/chat`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-keynez-secret": secret,
        },
        body: JSON.stringify({ messages: opts.messages }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(
          `Agent backend returned ${response.status}${text ? `: ${text.slice(0, 200)}` : ""}`
        );
      }
      if (!response.body) {
        throw new Error("Agent backend returned an empty response body.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let stopped = false;

      while (!stopped) {
        const { value, done: streamDone } = await reader.read();
        if (value) buffer += decoder.decode(value, { stream: true });
        if (streamDone) {
          buffer += decoder.decode();
        }

        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const frame = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          if (frame.trim()) {
            if (parseFrame(frame, opts)) {
              stopped = true;
              break;
            }
          }
          boundary = buffer.indexOf("\n\n");
        }

        if (streamDone) break;
      }

      if (!stopped) opts.onDone?.();
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      const error = err instanceof Error ? err : new Error(String(err));
      if (opts.onError) opts.onError(error);
      else throw error;
    }
  })();

  return { abort: () => controller.abort(), done };
}