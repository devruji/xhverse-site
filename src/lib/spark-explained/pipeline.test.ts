import { describe, expect, it } from "vitest";
import {
  buildPipeline,
  computeStage,
  presetPipelines,
  INITIAL_PARTITIONS,
  INITIAL_ROW_COUNT,
  SPILL_THRESHOLD,
  SKEW_THRESHOLD,
  type Partition,
} from "./pipeline";

function createDefaultPartitions(): Partition[] {
  return Array.from({ length: INITIAL_PARTITIONS }, (_, i) => ({
    id: i,
    rowCount: INITIAL_ROW_COUNT,
    skewFactor: 1.0,
    spillToDisk: false,
  }));
}

describe("buildPipeline", () => {
  it("returns empty stages for an empty chain", () => {
    const result = buildPipeline([]);
    expect(result.stages).toHaveLength(0);
    expect(result.totalShuffles).toBe(0);
    expect(result.totalSpills).toBe(0);
    expect(result.hasSkew).toBe(false);
  });

  it("single source produces 1 stage with 8 partitions and no shuffle", () => {
    const result = buildPipeline(["source"]);
    expect(result.stages).toHaveLength(1);
    expect(result.stages[0].partitions).toHaveLength(INITIAL_PARTITIONS);
    expect(result.stages[0].shuffleOccurred).toBe(false);
    expect(result.totalShuffles).toBe(0);
  });

  it("source + filter produces 2 stages with rows reduced by 40%", () => {
    const result = buildPipeline(["source", "filter"]);
    expect(result.stages).toHaveLength(2);

    const filterStage = result.stages[1];
    expect(filterStage.shuffleOccurred).toBe(false);
    for (const p of filterStage.partitions) {
      expect(p.rowCount).toBe(Math.round(INITIAL_ROW_COUNT * 0.6));
    }
  });

  it("source + join produces shuffle and introduces skew", () => {
    const result = buildPipeline(["source", "join"]);
    expect(result.stages).toHaveLength(2);

    const joinStage = result.stages[1];
    expect(joinStage.shuffleOccurred).toBe(true);
    expect(joinStage.partitions[0].skewFactor).toBe(1.8);
    expect(joinStage.partitions[1].skewFactor).toBe(1.5);
    expect(joinStage.partitions[2].skewFactor).toBe(0.8);
    expect(result.totalShuffles).toBe(1);
  });

  it("source + join may cause spill when rowCount exceeds threshold", () => {
    const result = buildPipeline(["source", "join"]);
    const joinStage = result.stages[1];

    const partition0RowCount = Math.round(INITIAL_ROW_COUNT * 1.8);
    if (partition0RowCount > SPILL_THRESHOLD) {
      expect(joinStage.partitions[0].spillToDisk).toBe(true);
    } else {
      expect(joinStage.partitions[0].spillToDisk).toBe(false);
    }
  });

  it("source + join + repartition rebalances after skew", () => {
    const result = buildPipeline(["source", "join", "repartition"]);
    expect(result.stages).toHaveLength(3);

    const repartitionStage = result.stages[2];
    expect(repartitionStage.shuffleOccurred).toBe(true);
    expect(repartitionStage.partitions).toHaveLength(INITIAL_PARTITIONS);

    for (const p of repartitionStage.partitions) {
      expect(p.skewFactor).toBe(1.0);
      expect(p.spillToDisk).toBe(false);
    }

    const rowCounts = repartitionStage.partitions.map((p) => p.rowCount);
    const allEqual = rowCounts.every((r) => r === rowCounts[0]);
    expect(allEqual).toBe(true);
  });

  it("etl_load preset has correct number of stages and at least 1 shuffle", () => {
    const preset = presetPipelines.find((p) => p.id === "etl_load")!;
    const result = buildPipeline(preset.transformations);

    expect(result.stages).toHaveLength(preset.transformations.length);
    expect(result.totalShuffles).toBeGreaterThanOrEqual(1);
  });

  it("reports correct totalShuffles count", () => {
    const result = buildPipeline(["source", "filter", "join", "group_by"]);
    expect(result.totalShuffles).toBe(2);
  });

  it("reports hasSkew when any partition exceeds SKEW_THRESHOLD", () => {
    const result = buildPipeline(["source", "join"]);
    expect(result.hasSkew).toBe(false);

    const joinPartitions = result.stages[1].partitions;
    const anyAboveThreshold = joinPartitions.some(
      (p) => p.skewFactor >= SKEW_THRESHOLD,
    );
    expect(result.hasSkew).toBe(anyAboveThreshold);
  });

  it("reports totalSpills across all stages", () => {
    const result = buildPipeline(["source", "join"]);
    const spillCount = result.stages.reduce(
      (sum, s) => sum + s.partitions.filter((p) => p.spillToDisk).length,
      0,
    );
    expect(result.totalSpills).toBe(spillCount);
  });
});

describe("computeStage", () => {
  it("source preserves initial partitions unchanged", () => {
    const initial = createDefaultPartitions();
    const stage = computeStage(initial, "source", 0);
    expect(stage.partitions).toHaveLength(INITIAL_PARTITIONS);
    for (const p of stage.partitions) {
      expect(p.rowCount).toBe(INITIAL_ROW_COUNT);
      expect(p.skewFactor).toBe(1.0);
      expect(p.spillToDisk).toBe(false);
    }
    expect(stage.shuffleOccurred).toBe(false);
  });

  it("filter reduces rowCount by 40%", () => {
    const initial = createDefaultPartitions();
    const stage = computeStage(initial, "filter", 1);
    for (const p of stage.partitions) {
      expect(p.rowCount).toBe(Math.round(INITIAL_ROW_COUNT * 0.6));
    }
    expect(stage.shuffleOccurred).toBe(false);
  });

  it("join introduces skew pattern", () => {
    const initial = createDefaultPartitions();
    const stage = computeStage(initial, "join", 1);
    expect(stage.partitions[0].skewFactor).toBe(1.8);
    expect(stage.partitions[0].rowCount).toBe(
      Math.round(INITIAL_ROW_COUNT * 1.8),
    );
    expect(stage.partitions[1].skewFactor).toBe(1.5);
    expect(stage.partitions[1].rowCount).toBe(
      Math.round(INITIAL_ROW_COUNT * 1.5),
    );
    for (let i = 2; i < stage.partitions.length; i++) {
      expect(stage.partitions[i].skewFactor).toBe(0.8);
      expect(stage.partitions[i].rowCount).toBe(
        Math.round(INITIAL_ROW_COUNT * 0.8),
      );
    }
    expect(stage.shuffleOccurred).toBe(true);
  });

  it("join marks spillToDisk when rowCount exceeds SPILL_THRESHOLD", () => {
    const largePartitions: Partition[] = Array.from(
      { length: INITIAL_PARTITIONS },
      (_, i) => ({
        id: i,
        rowCount: 200000,
        skewFactor: 1.0,
        spillToDisk: false,
      }),
    );
    const stage = computeStage(largePartitions, "join", 1);
    expect(stage.partitions[0].rowCount).toBe(Math.round(200000 * 1.8));
    expect(stage.partitions[0].spillToDisk).toBe(true);
  });

  it("join does not spill when rowCount is below threshold", () => {
    const smallPartitions: Partition[] = Array.from(
      { length: INITIAL_PARTITIONS },
      (_, i) => ({
        id: i,
        rowCount: 100000,
        skewFactor: 1.0,
        spillToDisk: false,
      }),
    );
    const stage = computeStage(smallPartitions, "join", 1);
    expect(stage.partitions[0].rowCount).toBe(Math.round(100000 * 1.8));
    expect(stage.partitions[0].spillToDisk).toBe(false);
  });

  it("group_by reduces partition count and row count", () => {
    const initial = createDefaultPartitions();
    const stage = computeStage(initial, "group_by", 1);
    expect(stage.partitions).toHaveLength(Math.ceil(INITIAL_PARTITIONS / 2));
    for (const p of stage.partitions) {
      expect(p.rowCount).toBe(
        Math.round((INITIAL_ROW_COUNT + INITIAL_ROW_COUNT) / 3),
      );
      expect(p.skewFactor).toBe(1.0);
    }
    expect(stage.shuffleOccurred).toBe(true);
  });

  it("group_by handles odd partition count", () => {
    const oddPartitions: Partition[] = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      rowCount: 90000,
      skewFactor: 1.0,
      spillToDisk: false,
    }));
    const stage = computeStage(oddPartitions, "group_by", 1);
    expect(stage.partitions).toHaveLength(3);
    expect(stage.partitions[2].rowCount).toBe(Math.round(90000 / 3));
  });

  it("window introduces alternating skew pattern", () => {
    const initial = createDefaultPartitions();
    const stage = computeStage(initial, "window", 1);
    expect(stage.partitions).toHaveLength(INITIAL_PARTITIONS);
    for (let i = 0; i < stage.partitions.length; i++) {
      if (i % 2 === 0) {
        expect(stage.partitions[i].skewFactor).toBe(1.3);
      } else {
        expect(stage.partitions[i].skewFactor).toBe(0.7);
      }
    }
    expect(stage.partitions[0].rowCount).toBe(INITIAL_ROW_COUNT);
    expect(stage.shuffleOccurred).toBe(true);
  });

  it("repartition resets to 8 even partitions and clears spills", () => {
    const skewedPartitions: Partition[] = [
      { id: 0, rowCount: 300000, skewFactor: 2.0, spillToDisk: true },
      { id: 1, rowCount: 50000, skewFactor: 0.5, spillToDisk: false },
      { id: 2, rowCount: 50000, skewFactor: 0.5, spillToDisk: false },
      { id: 3, rowCount: 50000, skewFactor: 0.5, spillToDisk: false },
    ];
    const stage = computeStage(skewedPartitions, "repartition", 2);
    expect(stage.partitions).toHaveLength(INITIAL_PARTITIONS);

    const totalRows = 300000 + 50000 + 50000 + 50000;
    const expectedPerPartition = Math.round(totalRows / INITIAL_PARTITIONS);
    for (const p of stage.partitions) {
      expect(p.rowCount).toBe(expectedPerPartition);
      expect(p.skewFactor).toBe(1.0);
      expect(p.spillToDisk).toBe(false);
    }
    expect(stage.shuffleOccurred).toBe(true);
  });

  it("cache preserves partitions unchanged", () => {
    const initial = createDefaultPartitions();
    const stage = computeStage(initial, "cache", 1);
    for (let i = 0; i < stage.partitions.length; i++) {
      expect(stage.partitions[i].rowCount).toBe(initial[i].rowCount);
      expect(stage.partitions[i].skewFactor).toBe(initial[i].skewFactor);
      expect(stage.partitions[i].spillToDisk).toBe(initial[i].spillToDisk);
    }
    expect(stage.shuffleOccurred).toBe(false);
  });

  it("write preserves partitions unchanged", () => {
    const initial = createDefaultPartitions();
    const stage = computeStage(initial, "write", 3);
    for (let i = 0; i < stage.partitions.length; i++) {
      expect(stage.partitions[i].rowCount).toBe(initial[i].rowCount);
    }
    expect(stage.shuffleOccurred).toBe(false);
  });

  it("every stage has a non-empty annotation string", () => {
    const initial = createDefaultPartitions();
    const types = [
      "source",
      "filter",
      "join",
      "group_by",
      "window",
      "repartition",
      "cache",
      "write",
    ] as const;
    for (const t of types) {
      const stage = computeStage(initial, t, 0);
      expect(stage.annotation.length).toBeGreaterThan(0);
    }
  });
});

describe("presetPipelines", () => {
  it("contains at least 4 presets", () => {
    expect(presetPipelines.length).toBeGreaterThanOrEqual(4);
  });

  it("all presets have unique ids", () => {
    const ids = presetPipelines.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all presets have non-empty name and description", () => {
    for (const preset of presetPipelines) {
      expect(preset.name.length).toBeGreaterThan(0);
      expect(preset.description.length).toBeGreaterThan(0);
    }
  });

  it("all presets have at least 2 transformations", () => {
    for (const preset of presetPipelines) {
      expect(preset.transformations.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("all presets produce valid pipelines", () => {
    for (const preset of presetPipelines) {
      const result = buildPipeline(preset.transformations);
      expect(result.stages).toHaveLength(preset.transformations.length);
    }
  });
});

describe("constants", () => {
  it("INITIAL_PARTITIONS is 8", () => {
    expect(INITIAL_PARTITIONS).toBe(8);
  });

  it("INITIAL_ROW_COUNT is 100000", () => {
    expect(INITIAL_ROW_COUNT).toBe(100000);
  });

  it("SPILL_THRESHOLD is 250000", () => {
    expect(SPILL_THRESHOLD).toBe(250000);
  });

  it("SKEW_THRESHOLD is 2.0", () => {
    expect(SKEW_THRESHOLD).toBe(2.0);
  });
});
