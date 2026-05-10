import type { ClusterConfig } from "./calculator";

export type Optimization = {
  id: string;
  title: string;
  description: string;
  projectedSavingsPercent: number;
  applicable: boolean;
};

const LARGEST_NODES = ["ds5_v2", "ds14_v2", "f16s"];

export function getOptimizations(config: ClusterConfig): Optimization[] {
  return [
    {
      id: "increase_spot",
      title: "Increase spot instance usage",
      description:
        "Spot VMs cost up to 60% less than on-demand. Jobs workloads tolerate preemption well since Databricks retries failed tasks automatically.",
      projectedSavingsPercent: 25,
      applicable:
        config.spotPercentage < 70 && config.workloadType === "jobs",
    },
    {
      id: "enable_autoscaling",
      title: "Enable cluster autoscaling",
      description:
        "Fixed-size clusters waste resources during low-utilization periods. Autoscaling adjusts worker count to match actual demand.",
      projectedSavingsPercent: 30,
      applicable: config.minWorkers === config.maxWorkers,
    },
    {
      id: "tighten_run_window",
      title: "Tighten cluster run window",
      description:
        "Clusters running more than 16 hours/day likely include idle time. Auto-termination and tighter scheduling reduce waste.",
      projectedSavingsPercent: 20,
      applicable: config.hoursPerDay > 16,
    },
    {
      id: "downsize_node",
      title: "Downsize node type",
      description:
        "Largest node SKUs are rarely fully utilized. Downsizing one tier reduces both VM and DBU costs proportionally.",
      projectedSavingsPercent: 35,
      applicable: LARGEST_NODES.includes(config.nodeTypeId),
    },
    {
      id: "switch_to_jobs",
      title: "Switch to Jobs compute",
      description:
        "Jobs compute pricing is 62% cheaper per DBU than All-Purpose. Batch workloads that don't need interactive notebooks should use Jobs clusters.",
      projectedSavingsPercent: 40,
      applicable: config.workloadType === "all_purpose",
    },
    {
      id: "use_sql_warehouse",
      title: "Use SQL Warehouse for BI queries",
      description:
        "SQL Warehouses offer serverless scaling and per-query billing. BI-style workloads with low daily hours and many short queries benefit most.",
      projectedSavingsPercent: 30,
      applicable:
        config.workloadType === "all_purpose" &&
        config.hoursPerDay <= 8 &&
        config.jobsCount >= 50,
    },
  ];
}
