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