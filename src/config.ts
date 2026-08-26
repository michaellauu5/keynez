/**
 * Runtime configuration for the Keynez agent backend.
 *
 * Prefers Vite env vars (VITE_AGENT_URL / VITE_KEYNEZ_SECRET) when defined,
 * falls back to the local development defaults declared here.
 */

export const AGENT_URL: string =
  (import.meta.env.VITE_AGENT_URL as string | undefined) ??
  "https://island-impose-either-hostel.trycloudflare.com";

export const KEYNEZ_SECRET: string =
  (import.meta.env.VITE_KEYNEZ_SECRET as string | undefined) ?? "test-secret-123";
