export type NodeCategory =
  | "general_purpose"
  | "memory_optimized"
  | "compute_optimized";

export type NodeType = {
  id: string;
  name: string;
  category: NodeCategory;
  dbuPerHour: number;
  vmCostPerHour: number;
};

export type WorkloadType = "jobs" | "all_purpose" | "sql_warehouse";

export type PricingTier = {
  workloadType: WorkloadType;
  dbuPricePerUnit: number;
};

export const PRICING_LAST_UPDATED = "2026-Q2";
export const SPOT_DISCOUNT = 0.6;

export const nodeTypes: NodeType[] = [
  {
    id: "ds3_v2",
    name: "Standard_DS3_v2",
    category: "general_purpose",
    dbuPerHour: 0.75,
    vmCostPerHour: 0.266,
  },
  {
    id: "ds4_v2",
    name: "Standard_DS4_v2",
    category: "general_purpose",
    dbuPerHour: 1.5,
    vmCostPerHour: 0.532,
  },
  {
    id: "ds5_v2",
    name: "Standard_DS5_v2",
    category: "general_purpose",
    dbuPerHour: 3.0,
    vmCostPerHour: 1.064,
  },
  {
    id: "ds12_v2",
    name: "Standard_DS12_v2",
    category: "memory_optimized",
    dbuPerHour: 1.0,
    vmCostPerHour: 0.371,
  },
  {
    id: "ds13_v2",
    name: "Standard_DS13_v2",
    category: "memory_optimized",
    dbuPerHour: 2.0,
    vmCostPerHour: 0.741,
  },
  {
    id: "ds14_v2",
    name: "Standard_DS14_v2",
    category: "memory_optimized",
    dbuPerHour: 4.0,
    vmCostPerHour: 1.482,
  },
  {
    id: "f4s",
    name: "Standard_F4s",
    category: "compute_optimized",
    dbuPerHour: 0.5,
    vmCostPerHour: 0.199,
  },
  {
    id: "f8s",
    name: "Standard_F8s",
    category: "compute_optimized",
    dbuPerHour: 1.0,
    vmCostPerHour: 0.399,
  },
  {
    id: "f16s",
    name: "Standard_F16s",
    category: "compute_optimized",
    dbuPerHour: 2.0,
    vmCostPerHour: 0.798,
  },
];

export const pricingTiers: PricingTier[] = [
  { workloadType: "jobs", dbuPricePerUnit: 0.15 },
  { workloadType: "all_purpose", dbuPricePerUnit: 0.4 },
  { workloadType: "sql_warehouse", dbuPricePerUnit: 0.22 },
];

export const nodeCategoryLabels: Record<NodeCategory, string> = {
  general_purpose: "General Purpose",
  memory_optimized: "Memory Optimized",
  compute_optimized: "Compute Optimized",
};

export const workloadTypeLabels: Record<WorkloadType, string> = {
  jobs: "Jobs Compute",
  all_purpose: "All-Purpose Compute",
  sql_warehouse: "SQL Warehouse",
};
