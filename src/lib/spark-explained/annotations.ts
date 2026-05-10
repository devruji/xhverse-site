import type { TransformationType } from "./transformations";

export type AnnotationContext = "normal" | "skewed" | "spill";

export type Annotation = {
  transformation: TransformationType;
  context: AnnotationContext;
  title: string;
  body: string;
};

type AnnotationEntry = {
  normal: { title: string; body: string };
  skewed: { title: string; body: string };
  spill: { title: string; body: string };
};

const annotationData: Record<TransformationType, AnnotationEntry> = {
  source: {
    normal: {
      title: "Data Source Read",
      body: "Initial scan of the data source. Partitions are assigned based on file splits or table segments.",
    },
    skewed: {
      title: "Skewed Source Read",
      body: "Source data has uneven partition sizes. Consider repartitioning after read to balance downstream work.",
    },
    spill: {
      title: "Source Read with Spill Risk",
      body: "Large partitions detected at source. Rows may spill to disk during subsequent transformations.",
    },
  },
  filter: {
    normal: {
      title: "Narrow Transformation",
      body: "Narrow transformation — each partition filtered independently. No data movement.",
    },
    skewed: {
      title: "Filter on Skewed Data",
      body: "Filter applied to skewed partitions. Skew persists because filtering doesn't redistribute data.",
    },
    spill: {
      title: "Filter with Spill Present",
      body: "Filtering reduces row count but spill state persists from prior stages. Consider caching after filter.",
    },
  },
  join: {
    normal: {
      title: "Shuffle Join",
      body: "Wide transformation — data shuffled by join key to co-locate matching rows across partitions.",
    },
    skewed: {
      title: "Skewed Join",
      body: "Skew detected after shuffle. One partition received disproportionately more data, likely due to a hot join key.",
    },
    spill: {
      title: "Join with Disk Spill",
      body: "Spill to disk triggered. Partition exceeded memory limit — consider salting the join key or increasing executor memory.",
    },
  },
  group_by: {
    normal: {
      title: "Shuffle Aggregation",
      body: "Wide transformation — data shuffled by group key. Partition count reduced as groups consolidate.",
    },
    skewed: {
      title: "Skewed Aggregation",
      body: "Group-by on a skewed key. Some partitions process significantly more groups — consider two-phase aggregation.",
    },
    spill: {
      title: "Aggregation with Spill",
      body: "Aggregation buffers exceeded memory. Partial results spilled to disk before final merge.",
    },
  },
  window: {
    normal: {
      title: "Window Shuffle",
      body: "Data shuffled by partition key for window computation. Rows within each partition are sorted for ranking.",
    },
    skewed: {
      title: "Skewed Window",
      body: "Window partition key is skewed. Some executors process far more rows — consider splitting the window into ranges.",
    },
    spill: {
      title: "Window with Spill",
      body: "Sort buffers for window function exceeded memory. Disk spill occurred during partition sorting.",
    },
  },
  repartition: {
    normal: {
      title: "Explicit Repartition",
      body: "Data redistributed evenly across partitions. Rebalances skew and resets partition count.",
    },
    skewed: {
      title: "Repartition After Skew",
      body: "Repartition corrects prior skew by redistributing rows uniformly. Downstream stages benefit from balanced work.",
    },
    spill: {
      title: "Repartition Clearing Spill",
      body: "Repartition distributes data evenly, clearing prior spill conditions by reducing per-partition memory pressure.",
    },
  },
  cache: {
    normal: {
      title: "Materialized in Memory",
      body: "Data cached in executor memory. Subsequent actions reuse this checkpoint without recomputing upstream stages.",
    },
    skewed: {
      title: "Cache on Skewed Data",
      body: "Caching skewed partitions. Some executors store more data — memory pressure may vary across the cluster.",
    },
    spill: {
      title: "Cache with Spill Risk",
      body: "Caching data that previously spilled. If memory is insufficient, Spark may use MEMORY_AND_DISK storage level.",
    },
  },
  write: {
    normal: {
      title: "Output Write",
      body: "Final write to storage. Each partition produces one output file. File count equals partition count.",
    },
    skewed: {
      title: "Skewed Write",
      body: "Writing skewed partitions produces uneven file sizes. Small files may degrade downstream read performance.",
    },
    spill: {
      title: "Write After Spill",
      body: "Writing data that spilled to disk. Output completes but overall job duration increased due to disk I/O.",
    },
  },
};

export function getAnnotation(
  transformation: TransformationType,
  hasSkew: boolean,
  hasSpill: boolean,
): Annotation {
  const entry = annotationData[transformation];

  let context: AnnotationContext;
  if (hasSpill) {
    context = "spill";
  } else if (hasSkew) {
    context = "skewed";
  } else {
    context = "normal";
  }

  const { title, body } = entry[context];

  return { transformation, context, title, body };
}
