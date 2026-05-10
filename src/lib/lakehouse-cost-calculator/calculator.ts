import {
  nodeTypes,
  pricingTiers,
  SPOT_DISCOUNT,
  type WorkloadType,
} from "./pricing";

export type ClusterConfig = {
  nodeTypeId: string;
  minWorkers: number;
  maxWorkers: number;
  hoursPerDay: number;
  daysPerMonth: number;
  jobsCount: number;
  spotPercentage: number;
  workloadType: WorkloadType;
};

export type CostBreakdown = {
  dbuCost: number;
  vmCost: number;
  spotSavings: number;
  totalMonthly: number;
  costPerJob: number;
};

export type CalculatorResult = {
  currentCost: CostBreakdown;
  optimizedCost: CostBreakdown;
  monthlyDelta: number;
  savingsPercentage: number;
};

export function calculateCost(config: ClusterConfig): CostBreakdown {
  const nodeType = nodeTypes.find((n) => n.id === config.nodeTypeId);
  if (!nodeType) {
    return {
      dbuCost: 0,
      vmCost: 0,
      spotSavings: 0,
      totalMonthly: 0,
      costPerJob: 0,
    };
  }

  const tier = pricingTiers.find((t) => t.workloadType === config.workloadType);
  if (!tier) {
    return {
      dbuCost: 0,
      vmCost: 0,
      spotSavings: 0,
      totalMonthly: 0,
      costPerJob: 0,
    };
  }

  const workersAvg = (config.minWorkers + config.maxWorkers) / 2;
  const totalHours = config.hoursPerDay * config.daysPerMonth;

  const dbuCost =
    workersAvg * nodeType.dbuPerHour * totalHours * tier.dbuPricePerUnit;
  const vmCostRaw = workersAvg * nodeType.vmCostPerHour * totalHours;
  const spotSavings =
    vmCostRaw * (config.spotPercentage / 100) * SPOT_DISCOUNT;
  const vmCost = vmCostRaw - spotSavings;
  const totalMonthly = dbuCost + vmCost;
  const costPerJob = config.jobsCount > 0 ? totalMonthly / config.jobsCount : 0;

  return { dbuCost, vmCost, spotSavings, totalMonthly, costPerJob };
}

export function calculateOptimizedCost(config: ClusterConfig): CostBreakdown {
  const optimized = { ...config };

  if (optimized.spotPercentage < 70 && optimized.workloadType === "jobs") {
    optimized.spotPercentage = 80;
  }

  if (optimized.hoursPerDay > 16) {
    optimized.hoursPerDay = optimized.hoursPerDay * 0.75;
  }

  if (optimized.minWorkers === optimized.maxWorkers) {
    optimized.minWorkers = Math.floor(optimized.maxWorkers * 0.5);
  }

  return calculateCost(optimized);
}

export function calculateResult(config: ClusterConfig): CalculatorResult {
  const currentCost = calculateCost(config);
  const optimizedCost = calculateOptimizedCost(config);
  const monthlyDelta = currentCost.totalMonthly - optimizedCost.totalMonthly;
  const savingsPercentage =
    currentCost.totalMonthly > 0
      ? (monthlyDelta / currentCost.totalMonthly) * 100
      : 0;

  return { currentCost, optimizedCost, monthlyDelta, savingsPercentage };
}

export function buildCostBrief(
  config: ClusterConfig,
  result: CalculatorResult,
): string {
  const nodeType = nodeTypes.find((n) => n.id === config.nodeTypeId);
  const nodeName = nodeType ? nodeType.name : config.nodeTypeId;

  const lines = [
    "=== Lakehouse Cost Estimate ===",
    "",
    `Cluster: ${nodeName} (${config.minWorkers}-${config.maxWorkers} workers)`,
    `Workload: ${config.workloadType} | ${config.hoursPerDay}h/day, ${config.daysPerMonth} days/month`,
    `Spot: ${config.spotPercentage}%`,
    "",
    "--- Current Cost ---",
    `DBU: $${result.currentCost.dbuCost.toFixed(2)}`,
    `VM: $${result.currentCost.vmCost.toFixed(2)}`,
    `Spot Savings: $${result.currentCost.spotSavings.toFixed(2)}`,
    `Total Monthly: $${result.currentCost.totalMonthly.toFixed(2)}`,
    config.jobsCount > 0
      ? `Cost/Job: $${result.currentCost.costPerJob.toFixed(2)}`
      : "",
    "",
    "--- Optimized Cost ---",
    `Total Monthly: $${result.optimizedCost.totalMonthly.toFixed(2)}`,
    `Monthly Savings: $${result.monthlyDelta.toFixed(2)} (${result.savingsPercentage.toFixed(1)}%)`,
  ];

  return lines.filter((l) => l !== "").join("\n");
}
