export const transformationTypes = [
  "source",
  "filter",
  "join",
  "group_by",
  "window",
  "repartition",
  "cache",
  "write",
] as const;

export type TransformationType = (typeof transformationTypes)[number];

export type TransformationDef = {
  id: TransformationType;
  label: string;
  description: string;
  causesShuffle: boolean;
  narrowOrWide: "narrow" | "wide";
};

export const transformations: Record<TransformationType, TransformationDef> = {
  source: {
    id: "source",
    label: "Read Source",
    description: "Initial data read from storage",
    causesShuffle: false,
    narrowOrWide: "narrow",
  },
  filter: {
    id: "filter",
    label: "Filter",
    description:
      "Row filtering — reduces data without moving it between partitions",
    causesShuffle: false,
    narrowOrWide: "narrow",
  },
  join: {
    id: "join",
    label: "Join",
    description:
      "Combines two datasets — requires shuffle to co-locate matching keys",
    causesShuffle: true,
    narrowOrWide: "wide",
  },
  group_by: {
    id: "group_by",
    label: "Group By",
    description:
      "Aggregation — shuffles data so all rows with the same key land on one partition",
    causesShuffle: true,
    narrowOrWide: "wide",
  },
  window: {
    id: "window",
    label: "Window",
    description:
      "Window function — requires shuffle by partition key for ranking/ordering",
    causesShuffle: true,
    narrowOrWide: "wide",
  },
  repartition: {
    id: "repartition",
    label: "Repartition",
    description:
      "Explicit data redistribution — rebalances partitions evenly",
    causesShuffle: true,
    narrowOrWide: "wide",
  },
  cache: {
    id: "cache",
    label: "Cache",
    description:
      "Materializes data in memory — subsequent reads skip recomputation",
    causesShuffle: false,
    narrowOrWide: "narrow",
  },
  write: {
    id: "write",
    label: "Write",
    description:
      "Final output to storage — partition count determines output files",
    causesShuffle: false,
    narrowOrWide: "narrow",
  },
};
