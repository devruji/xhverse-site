import { describe, expect, it } from "vitest";
import type { ClusterConfig } from "./calculator";
import { getOptimizations } from "./optimizations";

const baseConfig: ClusterConfig = {
  nodeTypeId: "ds3_v2",
  minWorkers: 2,
  maxWorkers: 4,
  hoursPerDay: 8,
  daysPerMonth: 22,
  jobsCount: 100,
  spotPercentage: 50,
  workloadType: "jobs",
};

describe("getOptimizations", () => {
  it("returns 6 optimization items", () => {
    const optimizations = getOptimizations(baseConfig);
    expect(optimizations).toHaveLength(6);
  });

  it("all optimizations have non-empty title and description", () => {
    const optimizations = getOptimizations(baseConfig);
    for (const opt of optimizations) {
      expect(opt.title.length).toBeGreaterThan(0);
      expect(opt.description.length).toBeGreaterThan(0);
    }
  });

  it("all optimizations have projectedSavingsPercent between 0 and 100", () => {
    const optimizations = getOptimizations(baseConfig);
    for (const opt of optimizations) {
      expect(opt.projectedSavingsPercent).toBeGreaterThanOrEqual(0);
      expect(opt.projectedSavingsPercent).toBeLessThanOrEqual(100);
    }
  });

  it("all optimizations have unique IDs", () => {
    const optimizations = getOptimizations(baseConfig);
    const ids = optimizations.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("increase_spot optimization", () => {
  it("is applicable when spot < 70% and workload is jobs", () => {
    const config: ClusterConfig = {
      ...baseConfig,
      spotPercentage: 30,
      workloadType: "jobs",
    };
    const opt = getOptimizations(config).find((o) => o.id === "increase_spot")!;
    expect(opt.applicable).toBe(true);
  });

  it("is not applicable when spot >= 70%", () => {
    const config: ClusterConfig = { ...baseConfig, spotPercentage: 80 };
    const opt = getOptimizations(config).find((o) => o.id === "increase_spot")!;
    expect(opt.applicable).toBe(false);
  });

  it("is not applicable for non-jobs workload", () => {
    const config: ClusterConfig = {
      ...baseConfig,
      spotPercentage: 30,
      workloadType: "all_purpose",
    };
    const opt = getOptimizations(config).find((o) => o.id === "increase_spot")!;
    expect(opt.applicable).toBe(false);
  });
});

describe("enable_autoscaling optimization", () => {
  it("is applicable when min === max", () => {
    const config: ClusterConfig = {
      ...baseConfig,
      minWorkers: 4,
      maxWorkers: 4,
    };
    const opt = getOptimizations(config).find(
      (o) => o.id === "enable_autoscaling",
    )!;
    expect(opt.applicable).toBe(true);
  });

  it("is not applicable when min < max", () => {
    const opt = getOptimizations(baseConfig).find(
      (o) => o.id === "enable_autoscaling",
    )!;
    expect(opt.applicable).toBe(false);
  });
});

describe("tighten_run_window optimization", () => {
  it("is applicable when hoursPerDay > 16", () => {
    const config: ClusterConfig = { ...baseConfig, hoursPerDay: 20 };
    const opt = getOptimizations(config).find(
      (o) => o.id === "tighten_run_window",
    )!;
    expect(opt.applicable).toBe(true);
  });

  it("is not applicable when hoursPerDay <= 16", () => {
    const opt = getOptimizations(baseConfig).find(
      (o) => o.id === "tighten_run_window",
    )!;
    expect(opt.applicable).toBe(false);
  });
});

describe("downsize_node optimization", () => {
  it("is applicable for largest node types", () => {
    for (const nodeId of ["ds5_v2", "ds14_v2", "f16s"]) {
      const config: ClusterConfig = { ...baseConfig, nodeTypeId: nodeId };
      const opt = getOptimizations(config).find(
        (o) => o.id === "downsize_node",
      )!;
      expect(opt.applicable).toBe(true);
    }
  });

  it("is not applicable for smaller node types", () => {
    const opt = getOptimizations(baseConfig).find(
      (o) => o.id === "downsize_node",
    )!;
    expect(opt.applicable).toBe(false);
  });
});

describe("switch_to_jobs optimization", () => {
  it("is applicable when using all_purpose", () => {
    const config: ClusterConfig = {
      ...baseConfig,
      workloadType: "all_purpose",
    };
    const opt = getOptimizations(config).find(
      (o) => o.id === "switch_to_jobs",
    )!;
    expect(opt.applicable).toBe(true);
  });

  it("is not applicable when already using jobs", () => {
    const opt = getOptimizations(baseConfig).find(
      (o) => o.id === "switch_to_jobs",
    )!;
    expect(opt.applicable).toBe(false);
  });

  it("is not applicable when using sql_warehouse", () => {
    const config: ClusterConfig = {
      ...baseConfig,
      workloadType: "sql_warehouse",
    };
    const opt = getOptimizations(config).find(
      (o) => o.id === "switch_to_jobs",
    )!;
    expect(opt.applicable).toBe(false);
  });
});

describe("use_sql_warehouse optimization", () => {
  it("is applicable for all_purpose with low hours and many jobs", () => {
    const config: ClusterConfig = {
      ...baseConfig,
      workloadType: "all_purpose",
      hoursPerDay: 4,
      jobsCount: 100,
    };
    const opt = getOptimizations(config).find(
      (o) => o.id === "use_sql_warehouse",
    )!;
    expect(opt.applicable).toBe(true);
  });

  it("is not applicable when hours > 8", () => {
    const config: ClusterConfig = {
      ...baseConfig,
      workloadType: "all_purpose",
      hoursPerDay: 10,
      jobsCount: 100,
    };
    const opt = getOptimizations(config).find(
      (o) => o.id === "use_sql_warehouse",
    )!;
    expect(opt.applicable).toBe(false);
  });

  it("is not applicable when jobs < 50", () => {
    const config: ClusterConfig = {
      ...baseConfig,
      workloadType: "all_purpose",
      hoursPerDay: 4,
      jobsCount: 20,
    };
    const opt = getOptimizations(config).find(
      (o) => o.id === "use_sql_warehouse",
    )!;
    expect(opt.applicable).toBe(false);
  });

  it("is not applicable for non-all_purpose workload", () => {
    const config: ClusterConfig = {
      ...baseConfig,
      workloadType: "jobs",
      hoursPerDay: 4,
      jobsCount: 100,
    };
    const opt = getOptimizations(config).find(
      (o) => o.id === "use_sql_warehouse",
    )!;
    expect(opt.applicable).toBe(false);
  });
});

describe("already-optimal config", () => {
  it("produces minimal applicable optimizations", () => {
    const optimalConfig: ClusterConfig = {
      nodeTypeId: "ds3_v2",
      minWorkers: 2,
      maxWorkers: 4,
      hoursPerDay: 8,
      daysPerMonth: 22,
      jobsCount: 10,
      spotPercentage: 80,
      workloadType: "jobs",
    };
    const applicable = getOptimizations(optimalConfig).filter(
      (o) => o.applicable,
    );
    expect(applicable.length).toBeLessThanOrEqual(1);
  });
});
