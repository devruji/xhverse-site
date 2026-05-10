export const stackCategories = [
  "storage",
  "orchestrator",
  "compute",
  "bi",
  "governance",
  "team_size",
] as const;

export type StackCategory = (typeof stackCategories)[number];

export type StackOption = {
  id: string;
  label: string;
};

export type StackSelections = Record<StackCategory, string>;

export const stackOptions: Record<StackCategory, StackOption[]> = {
  storage: [
    { id: "delta_lake", label: "Delta Lake" },
    { id: "iceberg", label: "Iceberg" },
    { id: "hive", label: "Hive" },
    { id: "parquet_blob", label: "Parquet on blob storage" },
    { id: "snowflake", label: "Snowflake" },
    { id: "bigquery", label: "BigQuery" },
  ],
  orchestrator: [
    { id: "airflow", label: "Airflow" },
    { id: "databricks_workflows", label: "Databricks Workflows" },
    { id: "adf", label: "Azure Data Factory" },
    { id: "prefect", label: "Prefect" },
    { id: "dagster", label: "Dagster" },
    { id: "none", label: "None / manual" },
  ],
  compute: [
    { id: "databricks", label: "Databricks" },
    { id: "synapse", label: "Synapse" },
    { id: "emr", label: "Spark on EMR" },
    { id: "snowflake", label: "Snowflake" },
    { id: "bigquery", label: "BigQuery" },
    { id: "local", label: "Local scripts" },
  ],
  bi: [
    { id: "power_bi", label: "Power BI" },
    { id: "tableau", label: "Tableau" },
    { id: "looker", label: "Looker" },
    { id: "metabase", label: "Metabase" },
    { id: "superset", label: "Superset" },
    { id: "excel", label: "Excel" },
  ],
  governance: [
    { id: "unity_catalog", label: "Unity Catalog" },
    { id: "purview", label: "Purview" },
    { id: "collibra", label: "Collibra" },
    { id: "alation", label: "Alation" },
    { id: "none", label: "We don't" },
    { id: "manual", label: "Manual / spreadsheet" },
  ],
  team_size: [
    { id: "1_3", label: "1-3 people" },
    { id: "4_10", label: "4-10 people" },
    { id: "11_30", label: "11-30 people" },
    { id: "30_plus", label: "30+ people" },
  ],
};

export const categoryLabels: Record<StackCategory, string> = {
  storage: "Storage layer",
  orchestrator: "Orchestration",
  compute: "Compute engine",
  bi: "BI / Reporting",
  governance: "Governance",
  team_size: "Team size",
};
