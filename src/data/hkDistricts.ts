/**
 * Hong Kong region → districts (Traditional Chinese).
 * Used by the IntakeForm region multi-select.
 */
export type RegionKey = "hk_island" | "kowloon" | "new_territories";

export const HK_REGIONS: {
  key: RegionKey;
  label: string;
  districts: string[];
}[] = [
  {
    key: "hk_island",
    label: "港島",
    districts: [
      "中環", "上環", "西環", "灣仔", "銅鑼灣",
      "北角", "鰂魚涌", "太古", "西灣河", "筲箕灣", "柴灣",
      "香港仔", "鴨脷洲", "黃竹坑", "淺水灣", "赤柱",
    ],
  },
  {
    key: "kowloon",
    label: "九龍",
    districts: [
      "尖沙咀", "佐敦", "油麻地", "旺角",
      "深水埗", "長沙灣", "美孚",
      "紅磡", "土瓜灣", "九龍城", "何文田",
      "黃大仙", "鑽石山", "牛池灣",
      "觀塘", "藍田", "牛頭角", "九龍灣",
    ],
  },
  {
    key: "new_territories",
    label: "新界",
    districts: [
      "荃灣", "葵涌", "青衣",
      "屯門", "元朗", "天水圍",
      "上水", "粉嶺", "大埔",
      "沙田", "馬鞍山", "大圍",
      "將軍澳", "西貢", "清水灣",
      "東涌", "愉景灣", "長洲",
    ],
  },
];

export const ALL_DISTRICTS = HK_REGIONS.flatMap(r => r.districts);

// ---------- Display localization ----------
// Canonical district values are Traditional Chinese (sent to backend).
// These maps only affect the label displayed in the UI.

type Lang = "en" | "zh-HK" | "zh-CN";

const REGION_LABELS: Record<RegionKey, Record<Lang, string>> = {
  hk_island: { "zh-HK": "港島", "zh-CN": "港岛", en: "Hong Kong Island" },
  kowloon: { "zh-HK": "九龍", "zh-CN": "九龙", en: "Kowloon" },
  new_territories: { "zh-HK": "新界", "zh-CN": "新界", en: "New Territories" },
};

const DISTRICT_LABELS_CN: Record<string, string> = {
  "中環": "中环", "上環": "上环", "西環": "西环", "灣仔": "湾仔", "銅鑼灣": "铜锣湾",
  "北角": "北角", "鰂魚涌": "鲗鱼涌", "太古": "太古", "西灣河": "西湾河", "筲箕灣": "筲箕湾",
  "柴灣": "柴湾", "香港仔": "香港仔", "鴨脷洲": "鸭脷洲", "黃竹坑": "黄竹坑",
  "淺水灣": "浅水湾", "赤柱": "赤柱",
  "尖沙咀": "尖沙咀", "佐敦": "佐敦", "油麻地": "油麻地", "旺角": "旺角",
  "深水埗": "深水埗", "長沙灣": "长沙湾", "美孚": "美孚",
  "紅磡": "红磡", "土瓜灣": "土瓜湾", "九龍城": "九龙城", "何文田": "何文田",
  "黃大仙": "黄大仙", "鑽石山": "钻石山", "牛池灣": "牛池湾",
  "觀塘": "观塘", "藍田": "蓝田", "牛頭角": "牛头角", "九龍灣": "九龙湾",
  "荃灣": "荃湾", "葵涌": "葵涌", "青衣": "青衣",
  "屯門": "屯门", "元朗": "元朗", "天水圍": "天水围",
  "上水": "上水", "粉嶺": "粉岭", "大埔": "大埔",
  "沙田": "沙田", "馬鞍山": "马鞍山", "大圍": "大围",
  "將軍澳": "将军澳", "西貢": "西贡", "清水灣": "清水湾",
  "東涌": "东涌", "愉景灣": "愉景湾", "長洲": "长洲",
};

const DISTRICT_LABELS_EN: Record<string, string> = {
  "中環": "Central", "上環": "Sheung Wan", "西環": "Sai Wan", "灣仔": "Wan Chai", "銅鑼灣": "Causeway Bay",
  "北角": "North Point", "鰂魚涌": "Quarry Bay", "太古": "Tai Koo", "西灣河": "Sai Wan Ho",
  "筲箕灣": "Shau Kei Wan", "柴灣": "Chai Wan", "香港仔": "Aberdeen", "鴨脷洲": "Ap Lei Chau",
  "黃竹坑": "Wong Chuk Hang", "淺水灣": "Repulse Bay", "赤柱": "Stanley",
  "尖沙咀": "Tsim Sha Tsui", "佐敦": "Jordan", "油麻地": "Yau Ma Tei", "旺角": "Mong Kok",
  "深水埗": "Sham Shui Po", "長沙灣": "Cheung Sha Wan", "美孚": "Mei Foo",
  "紅磡": "Hung Hom", "土瓜灣": "To Kwa Wan", "九龍城": "Kowloon City", "何文田": "Ho Man Tin",
  "黃大仙": "Wong Tai Sin", "鑽石山": "Diamond Hill", "牛池灣": "Ngau Chi Wan",
  "觀塘": "Kwun Tong", "藍田": "Lam Tin", "牛頭角": "Ngau Tau Kok", "九龍灣": "Kowloon Bay",
  "荃灣": "Tsuen Wan", "葵涌": "Kwai Chung", "青衣": "Tsing Yi",
  "屯門": "Tuen Mun", "元朗": "Yuen Long", "天水圍": "Tin Shui Wai",
  "上水": "Sheung Shui", "粉嶺": "Fanling", "大埔": "Tai Po",
  "沙田": "Sha Tin", "馬鞍山": "Ma On Shan", "大圍": "Tai Wai",
  "將軍澳": "Tseung Kwan O", "西貢": "Sai Kung", "清水灣": "Clear Water Bay",
  "東涌": "Tung Chung", "愉景灣": "Discovery Bay", "長洲": "Cheung Chau",
};

export function getRegionLabel(key: RegionKey, lang: string): string {
  const l = (lang as Lang) in REGION_LABELS[key] ? (lang as Lang) : "zh-HK";
  return REGION_LABELS[key][l];
}

export function getDistrictLabel(value: string, lang: string): string {
  if (lang === "zh-CN") return DISTRICT_LABELS_CN[value] ?? value;
  if (lang === "en") return DISTRICT_LABELS_EN[value] ?? value;
  return value;
}