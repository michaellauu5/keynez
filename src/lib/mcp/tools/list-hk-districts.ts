import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const REGIONS: Record<string, { label: string; districts: string[] }> = {
  hk_island: {
    label: "Hong Kong Island",
    districts: [
      "Central", "Sheung Wan", "Sai Wan", "Wan Chai", "Causeway Bay",
      "North Point", "Quarry Bay", "Tai Koo", "Sai Wan Ho", "Shau Kei Wan", "Chai Wan",
      "Aberdeen", "Ap Lei Chau", "Wong Chuk Hang", "Repulse Bay", "Stanley",
    ],
  },
  kowloon: {
    label: "Kowloon",
    districts: [
      "Tsim Sha Tsui", "Jordan", "Yau Ma Tei", "Mong Kok",
      "Sham Shui Po", "Cheung Sha Wan", "Mei Foo",
      "Hung Hom", "To Kwa Wan", "Kowloon City", "Ho Man Tin",
      "Wong Tai Sin", "Diamond Hill", "Ngau Chi Wan",
      "Kwun Tong", "Lam Tin", "Ngau Tau Kok", "Kowloon Bay",
    ],
  },
  new_territories: {
    label: "New Territories",
    districts: [
      "Tsuen Wan", "Kwai Chung", "Tsing Yi",
      "Tuen Mun", "Yuen Long", "Tin Shui Wai",
      "Sheung Shui", "Fanling", "Tai Po",
      "Sha Tin", "Ma On Shan", "Tai Wai",
      "Tseung Kwan O", "Sai Kung", "Clear Water Bay",
    ],
  },
};

export default defineTool({
  name: "list_hk_districts",
  title: "List Hong Kong districts",
  description: "List Hong Kong districts, optionally filtered by region.",
  inputSchema: {
    region: z
      .enum(["hk_island", "kowloon", "new_territories"]) 
      .optional()
      .describe("Optional region filter."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ region }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const entries = region ? [[region, REGIONS[region]] as const] : Object.entries(REGIONS);
    const lines: string[] = [];
    const structured: Record<string, string[]> = {};
    for (const [key, val] of entries) {
      lines.push(`${val.label}: ${val.districts.join(", ")}`);
      structured[key] = val.districts;
    }
    return {
      content: [{ type: "text", text: lines.join("\n") }],
      structuredContent: { regions: structured },
    };
  },
});