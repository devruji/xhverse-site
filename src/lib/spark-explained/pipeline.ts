import type { TransformationType } from "./transformations";
import { transformations } from "./transformations";
import { getAnnotation } from "./annotations";

export type Partition = {
  id: number;
  rowCount: number;
  skewFactor: number;
  spillToDisk: boolean;
};

export type PipelineStage = {
  stageIndex: number;
  transformation: TransformationType;
  partitions: Partition[];
  shuffleOccurred: boolean;
  annotation: string;
};

export type PipelineState = {
  stages: PipelineStage[];
  totalShuffles: number;
  totalSpills: number;
  hasSkew: boolean;
};

export type PresetPipeline = {
  id: string;
  name: string;
  description: string;
  transformations: TransformationType[];
};

export const presetPipelines: PresetPipeline[] = [
  {
    id: "etl_load",
    name: "ETL Load",
    description: "Classic extract-transform-load pattern",
    transformations: ["source", "filter", "join", "write"],
  },
  {
    id: "aggregation",
    name: "Aggregation Pipeline",
    description: "Group-by heavy analytics workload",
    transformations: ["source", "filter", "group_by", "write"],
  },
  {
    id: "window_analytics",
    name: "Window Analytics",
    description: "Ranking and running totals",
    transformations: ["source", "window", "filter", "write"],
  },
  {
    id: "incremental_merge",
    name: "Incremental Merge",
    description: "CDC-style upsert pattern",
    transformations: ["source", "filter", "join", "group_by", "write"],
  },
];

export const INITIAL_PARTITIONS = 8;
export const INITIAL_ROW_COUNT = 100000;
export const SPILL_THRESHOLD = 250000;
export const SKEW_THRESHOLD = 2.0;

function createInitialPartitions(): Partition[] {
  return Array.from({ length: INITIAL_PARTITIONS }, (_, i) => ({
    id: i,
    rowCount: INITIAL_ROW_COUNT,
    skewFactor: 1.0,
    spillToDisk: false,
  }));
}

function buildAnnotation(
  transformation: TransformationType,
  partitions: Partition[],
): string {
  const hasSkew = partitions.some((p) => p.skewFactor >= SKEW_THRESHOLD);
  const hasSpill = partitions.some((p) => p.spillToDisk);
  const annotation = getAnnotation(transformation, hasSkew, hasSpill);
  return annotation.body;
}

export function computeStage(
  prevPartitions: Partition[],
  transformation: TransformationType,
  stageIndex: number,
): PipelineStage {
  const def = transformations[transformation];
  let partitions: Partition[];

  switch (transformation) {
    case "source": {
      partitions = prevPartitions.map((p) => ({ ...p }));
      break;
    }
    case "filter": {
      partitions = prevPartitions.map((p) => ({
        ...p,
        rowCount: Math.round(p.rowCount * 0.6),
      }));
      break;
    }
    case "join": {
      partitions = prevPartitions.map((p, i) => {
        let skewFactor: number;
        if (i === 0) skewFactor = 1.8;
        else if (i === 1) skewFactor = 1.5;
        else skewFactor = 0.8;

        const rowCount = Math.round(p.rowCount * skewFactor);
        const spillToDisk = rowCount > SPILL_THRESHOLD;

        return { ...p, skewFactor, rowCount, spillToDisk };
      });
      break;
    }
    case "group_by": {
      const newCount = Math.ceil(prevPartitions.length / 2);
      partitions = Array.from({ length: newCount }, (_, i) => {
        const first = prevPartitions[i * 2];
        const second = prevPartitions[i * 2 + 1];
        const combinedRows = second
          ? first.rowCount + second.rowCount
          : first.rowCount;
        const rowCount = Math.round(combinedRows / 3);
        return {
          id: i,
          rowCount,
          skewFactor: 1.0,
          spillToDisk: false,
        };
      });
      break;
    }
    case "window": {
      partitions = prevPartitions.map((p, i) => {
        const skewFactor = i % 2 === 0 ? 1.3 : 0.7;
        return { ...p, skewFactor };
      });
      break;
    }
    case "repartition": {
      const totalRows = prevPartitions.reduce((sum, p) => sum + p.rowCount, 0);
      const rowsPerPartition = Math.round(totalRows / INITIAL_PARTITIONS);
      partitions = Array.from({ length: INITIAL_PARTITIONS }, (_, i) => ({
        id: i,
        rowCount: rowsPerPartition,
        skewFactor: 1.0,
        spillToDisk: false,
      }));
      break;
    }
    case "cache": {
      partitions = prevPartitions.map((p) => ({ ...p }));
      break;
    }
    case "write": {
      partitions = prevPartitions.map((p) => ({ ...p }));
      break;
    }
  }

  return {
    stageIndex,
    transformation,
    partitions,
    shuffleOccurred: def.causesShuffle,
    annotation: buildAnnotation(transformation, partitions),
  };
}

export function buildPipeline(
  transformationChain: TransformationType[],
): PipelineState {
  if (transformationChain.length === 0) {
    return { stages: [], totalShuffles: 0, totalSpills: 0, hasSkew: false };
  }

  const stages: PipelineStage[] = [];
  let currentPartitions = createInitialPartitions();

  for (let i = 0; i < transformationChain.length; i++) {
    const stage = computeStage(currentPartitions, transformationChain[i], i);
    stages.push(stage);
    currentPartitions = stage.partitions;
  }

  const totalShuffles = stages.filter((s) => s.shuffleOccurred).length;
  const totalSpills = stages.reduce(
    (sum, s) => sum + s.partitions.filter((p) => p.spillToDisk).length,
    0,
  );
  const hasSkew = stages.some((s) =>
    s.partitions.some((p) => p.skewFactor >= SKEW_THRESHOLD),
  );

  return { stages, totalShuffles, totalSpills, hasSkew };
}
