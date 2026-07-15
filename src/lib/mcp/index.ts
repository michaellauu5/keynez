import { auth, defineMcp } from "@lovable.dev/mcp-js";
import whoamiTool from "./tools/whoami";
import listHkDistrictsTool from "./tools/list-hk-districts";

// Build the issuer from the project ref so it always points at the direct
// supabase.co host, never the .lovable.cloud proxy.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "keynez-mcp",
  title: "Keynez MCP",
  version: "0.1.0",
  instructions:
    "Tools for the Keynez Hong Kong property assistant. Use `whoami` to confirm the signed-in user and `list_hk_districts` to enumerate districts by region.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [whoamiTool, listHkDistrictsTool],
});