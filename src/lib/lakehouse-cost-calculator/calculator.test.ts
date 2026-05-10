import { describe, expect, it } from "vitest";
import {
  buildCostBrief,
  calculateCost,
  calculateOptimizedCost,
  calculateResult,
  type ClusterConfig,
} from "./calculator";
import { SPOT_DISCOUNT } from "./pricing";

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

describe("calculateCost", () => {
  it("produces expected output for a known input", () => {
    const result = calculateCost(baseConfig);

    // workersAvg = (2+4)/2 = 3, totalHours = 8*22 = 176
    const expectedDbu = 3 * 0.75 * 176 * 0.15; // 59.4
    const vmCostRaw = 3 * 0.266 * 176; // 140.448
    const expectedSpotSavings = vmCostRaw * (50 / 100) * SPOT_DISCOUNT; // 42.1344
    const expectedVm = vmCostRaw - expectedSpotSavings; // 98.3136
    const expectedTotal = expectedDbu + expectedVm; // 157.7136
    const expectedCostPerJob = expectedTotal / 100;

    expect(result.dbuCost).toBeCloseTo(expectedDbu, 2);
    expect(result.vmCost).toBeCloseTo(expectedVm, 2);
    expect(result.spotSavings).toBeCloseTo(expectedSpotSavings, 2);
    expect(result.totalMonthly).toBeCloseTo(expectedTotal, 2);
    expect(result.costPerJob).toBeCloseTo(expectedCostPerJob, 2);
  });

  it("returns zero cost when workers are 0", () => {
    const config: ClusterConfig = { ...baseConfig, minWorkers: 0, maxWorkers: 0 };
    const result = calculateCost(config);
    expect(result.dbuCost).toBe(0);
    expect(result.vmCost).toBe(0);
    expect(result.spotSavings).toBe(0);
    expect(result.totalMonthly).toBe(0);
    expect(result.costPerJob).toBe(0);
  });

  it("spot at 100% reduces VM cost by 60%", () => {
    const noSpot = calculateCost({ ...baseConfig, spotPercentage: 0 });
    const fullSpot = calculateCost({ ...baseConfig, spotPercentage: 100 });

    const expectedVmWithFullSpot = noSpot.vmCost * (1 - SPOT_DISCOUNT);
    expect(fullSpot.vmCost).toBeCloseTo(expectedVmWithFullSpot, 2);
  });

  it("spot at 0% produces no savings", () => {
    const result = calculateCost({ ...baseConfig, spotPercentage: 0 });
    expect(result.spotSavings).toBe(0);
  });

  it("costPerJob is 0 when jobsCount is 0", () => {
    const result = calculateCost({ ...baseConfig, jobsCount: 0 });
    expect(result.costPerJob).toBe(0);
  });

  it("returns zero for unknown node type", () => {
    const result = calculateCost({ ...baseConfig, nodeTypeId: "nonexistent" });
    expect(result.totalMonthly).toBe(0);
  });

  it("returns zero for unknown workload type", () => {
    const result = calculateCost({
      ...baseConfig,
      workloadType: "unknown" as "jobs",
    });
    expect(result.totalMonthly).toBe(0);
  });
});

describe("calculateOptimizedCost", () => {
  it("increases spot to 80% for jobs with low spot", () => {
    const config: ClusterConfig = {
      ...baseConfig,
      spotPercentage: 30,
      workloadType: "jobs",
    };
    const optimized = calculateOptimizedCost(config);
    const manualOptimized = calculateCost({ ...config, spotPercentage: 80 });
    expect(optimized.totalMonthly).toBeCloseTo(manualOptimized.totalMonthly, 2);
  });

  it("does not change spot for non-jobs workload even if below 70%", () => {
    const config: ClusterConfig = {
      ...baseConfig,
      spotPercentage: 30,
      workloadType: "all_purpose",
    };
    const optimized = calculateOptimizedCost(config);
    const manual = calculateCost(config);
    expect(optimized.totalMonthly).toBeCloseTo(manual.totalMonthly, 2);
  });

  it("does not change spot when already >= 70%", () => {
    const config: ClusterConfig = {
      ...baseConfig,
      spotPercentage: 75,
      workloadType: "jobs",
    };
    const optimized = calculateOptimizedCost(config);
    const manual = calculateCost(config);
    expect(optimized.totalMonthly).toBeCloseTo(manual.totalMonthly, 2);
  });

  it("reduces hours when hoursPerDay > 16", () => {
    const config: ClusterConfig = { ...baseConfig, hoursPerDay: 20 };
    const optimized = calculateOptimizedCost(config);
    const manual = calculateCost({
      ...config,
      hoursPerDay: 15,
      spotPercentage: 80,
    });
    expect(optimized.totalMonthly).toBeCloseTo(manual.totalMonthly, 2);
  });

  it("does not reduce hours when hoursPerDay <= 16", () => {
    const config: ClusterConfig = {
      ...baseConfig,
      hoursPerDay: 16,
      spotPercentage: 80,
    };
    const optimized = calculateOptimizedCost(config);
    const manual = calculateCost(config);
    expect(optimized.totalMonthly).toBeCloseTo(manual.totalMonthly, 2);
  });

  it("enables autoscaling when min === max", () => {
    const config: ClusterConfig = {
      ...baseConfig,
      minWorkers: 4,
      maxWorkers: 4,
      spotPercentage: 80,
    };
    const optimized = calculateOptimizedCost(config);
    const manual = calculateCost({ ...config, minWorkers: 2 });
    expect(optimized.totalMonthly).toBeCloseTo(manual.totalMonthly, 2);
  });

  it("does not change autoscaling when min < max", () => {
    const config: ClusterConfig = {
      ...baseConfig,
      minWorkers: 2,
      maxWorkers: 6,
      spotPercentage: 80,
    };
    const optimized = calculateOptimizedCost(config);
    const manual = calculateCost(config);
    expect(optimized.totalMonthly).toBeCloseTo(manual.totalMonthly, 2);
  });

  it("optimized cost is always <= current cost", () => {
    const configs: ClusterConfig[] = [
      baseConfig,
      { ...baseConfig, spotPercentage: 0, hoursPerDay: 24, minWorkers: 4, maxWorkers: 4 },
      { ...baseConfig, workloadType: "all_purpose", spotPercentage: 10 },
      { ...baseConfig, nodeTypeId: "f16s", hoursPerDay: 20 },
    ];

    for (const config of configs) {
      const current = calculateCost(config);
      const optimized = calculateOptimizedCost(config);
      expect(optimized.totalMonthly).toBeLessThanOrEqual(
        current.totalMonthly + 0.001,
      );
    }
  });
});

describe("calculateResult", () => {
  it("computes monthlyDelta and savingsPercentage", () => {
    const result = calculateResult(baseConfig);
    expect(result.monthlyDelta).toBeCloseTo(
      result.currentCost.totalMonthly - result.optimizedCost.totalMonthly,
      2,
    );
    expect(result.savingsPercentage).toBeCloseTo(
      (result.monthlyDelta / result.currentCost.totalMonthly) * 100,
      2,
    );
  });

  it("savingsPercentage is 0 when current cost is 0", () => {
    const config: ClusterConfig = { ...baseConfig, minWorkers: 0, maxWorkers: 0 };
    const result = calculateResult(config);
    expect(result.savingsPercentage).toBe(0);
  });
});

describe("buildCostBrief", () => {
  it("includes cluster name and workload type", () => {
    const result = calculateResult(baseConfig);
    const brief = buildCostBrief(baseConfig, result);
    expect(brief).toContain("Standard_DS3_v2");
    expect(brief).toContain("jobs");
  });

  it("includes cost figures", () => {
    const result = calculateResult(baseConfig);
    const brief = buildCostBrief(baseConfig, result);
    expect(brief).toContain("DBU: $");
    expect(brief).toContain("VM: $");
    expect(brief).toContain("Total Monthly: $");
  });

  it("includes cost per job when jobsCount > 0", () => {
    const result = calculateResult(baseConfig);
    const brief = buildCostBrief(baseConfig, result);
    expect(brief).toContain("Cost/Job: $");
  });

  it("excludes cost per job when jobsCount is 0", () => {
    const config: ClusterConfig = { ...baseConfig, jobsCount: 0 };
    const result = calculateResult(config);
    const brief = buildCostBrief(config, result);
    expect(brief).not.toContain("Cost/Job");
  });

  it("uses nodeTypeId as fallback when node not found", () => {
    const config: ClusterConfig = { ...baseConfig, nodeTypeId: "custom_node" };
    const result = calculateResult(config);
    const brief = buildCostBrief(config, result);
    expect(brief).toContain("custom_node");
  });

  it("includes savings information", () => {
    const result = calculateResult(baseConfig);
    const brief = buildCostBrief(baseConfig, result);
    expect(brief).toContain("Monthly Savings: $");
    expect(brief).toContain("Optimized Cost");
  });
});
