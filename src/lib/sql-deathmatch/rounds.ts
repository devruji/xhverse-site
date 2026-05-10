export type SqlRound = {
  id: string;
  title: string;
  context: string;
  queryA: { sql: string; label: string };
  queryB: { sql: string; label: string };
  winner: "a" | "b";
  explanation: string;
  concept: string;
};

export const deathmatchConcepts = [
  "partition_pruning",
  "broadcast_join",
  "sort_merge_join",
  "window_vs_self_join",
  "predicate_pushdown",
  "z_ordering",
  "merge_optimization",
  "small_file_compaction",
  "delta_caching",
  "salting_for_skew",
  "coalesce_vs_repartition",
  "photon_acceleration",
  "aqe_shuffle",
  "dynamic_partition_pruning",
  "cte_materialization",
] as const;

export type DeathmatchConcept = (typeof deathmatchConcepts)[number];

export const rounds: SqlRound[] = [
  {
    id: "round-01",
    title: "Filtering a Partitioned Table",
    context:
      "Table `orders` has 2.4B rows partitioned by `order_date` (daily). You need all orders from January 2024.",
    queryA: {
      sql: "SELECT * FROM orders WHERE order_date BETWEEN '2024-01-01' AND '2024-01-31'",
      label: "Direct partition filter",
    },
    queryB: {
      sql: "SELECT * FROM orders WHERE MONTH(order_date) = 1 AND YEAR(order_date) = 2024",
      label: "Function-wrapped filter",
    },
    winner: "a",
    explanation:
      "Query A allows the engine to prune partitions directly — only 31 daily partitions are scanned. Query B wraps the partition column in functions (MONTH, YEAR), preventing partition pruning and forcing a full table scan across all partitions.",
    concept: "partition_pruning",
  },
  {
    id: "round-02",
    title: "Joining a Large Fact with a Small Dimension",
    context:
      "Table `transactions` has 800M rows. Table `currency_codes` has 180 rows. You need to enrich transactions with currency names.",
    queryA: {
      sql: "SELECT t.*, c.currency_name FROM transactions t JOIN currency_codes c ON t.currency_id = c.id",
      label: "Default join",
    },
    queryB: {
      sql: "SELECT /*+ BROADCAST(c) */ t.*, c.currency_name FROM transactions t JOIN currency_codes c ON t.currency_id = c.id",
      label: "Broadcast hint join",
    },
    winner: "b",
    explanation:
      "With a broadcast hint, the 180-row dimension table is replicated to every executor, eliminating the expensive shuffle of 800M transaction rows. Without the hint, the optimizer may still choose a broadcast but is not guaranteed to — especially if stats are stale or autoBroadcastJoinThreshold is misconfigured.",
    concept: "broadcast_join",
  },
  {
    id: "round-03",
    title: "Joining Two Large Pre-Sorted Tables",
    context:
      "Tables `customer_events` (1.2B rows) and `customer_profiles` (50M rows) are both bucketed/sorted by `customer_id` with 256 buckets each.",
    queryA: {
      sql: "SELECT /*+ SHUFFLE_HASH(p) */ e.event_type, p.segment FROM customer_events e JOIN customer_profiles p ON e.customer_id = p.customer_id",
      label: "Shuffle hash join",
    },
    queryB: {
      sql: "SELECT /*+ MERGE(e, p) */ e.event_type, p.segment FROM customer_events e JOIN customer_profiles p ON e.customer_id = p.customer_id",
      label: "Sort-merge join",
    },
    winner: "b",
    explanation:
      "Both tables are already sorted and bucketed on the join key. A sort-merge join exploits this pre-existing order — it walks both sides in lockstep without reshuffling data. A shuffle hash join ignores the sort order and redistributes both tables across the cluster, wasting network I/O.",
    concept: "sort_merge_join",
  },
  {
    id: "round-04",
    title: "Running Total vs Self-Join",
    context:
      "Table `daily_revenue` has 3.6M rows (one row per store per day over 10 years). You need each row annotated with the cumulative revenue for that store.",
    queryA: {
      sql: "SELECT store_id, revenue_date, revenue, SUM(revenue) OVER (PARTITION BY store_id ORDER BY revenue_date) AS cumulative_revenue FROM daily_revenue",
      label: "Window function",
    },
    queryB: {
      sql: "SELECT a.store_id, a.revenue_date, a.revenue, SUM(b.revenue) AS cumulative_revenue FROM daily_revenue a JOIN daily_revenue b ON a.store_id = b.store_id AND b.revenue_date <= a.revenue_date GROUP BY a.store_id, a.revenue_date, a.revenue",
      label: "Self-join with aggregate",
    },
    winner: "a",
    explanation:
      "The window function computes the running total in a single pass per partition with O(n) complexity. The self-join produces an O(n^2) intermediate result per store — for 3,650 days that means ~6.6M row-pairs per store — causing massive shuffle and memory pressure.",
    concept: "window_vs_self_join",
  },
  {
    id: "round-05",
    title: "Predicate Pushdown Through a Subquery",
    context:
      "Table `clickstream` has 5B rows in Parquet with min/max stats on `event_timestamp`. You need clicks from the last hour joined with `sessions`.",
    queryA: {
      sql: "SELECT c.*, s.device_type FROM (SELECT * FROM clickstream WHERE event_timestamp >= current_timestamp() - INTERVAL 1 HOUR) c JOIN sessions s ON c.session_id = s.session_id",
      label: "Filter in subquery",
    },
    queryB: {
      sql: "WITH all_clicks AS (SELECT * FROM clickstream) SELECT c.*, s.device_type FROM all_clicks c JOIN sessions s ON c.session_id = s.session_id WHERE c.event_timestamp >= current_timestamp() - INTERVAL 1 HOUR",
      label: "Filter after CTE join",
    },
    winner: "a",
    explanation:
      "Query A places the filter directly on the scan, enabling predicate pushdown into the Parquet reader — Spark skips file splits whose min/max stats fall outside the one-hour window. Query B materializes the full 5B-row CTE before filtering, reading all data from storage first.",
    concept: "predicate_pushdown",
  },
  {
    id: "round-06",
    title: "Point Lookups on a Large Delta Table",
    context:
      "Table `iot_telemetry` has 12B rows with columns `device_id`, `metric_timestamp`, and `reading`. The table is frequently queried by `device_id` + `metric_timestamp` ranges. No Z-ORDER is currently applied.",
    queryA: {
      sql: "-- After: OPTIMIZE iot_telemetry ZORDER BY (device_id, metric_timestamp)\nSELECT * FROM iot_telemetry WHERE device_id = 'sensor-4421' AND metric_timestamp BETWEEN '2024-03-01' AND '2024-03-02'",
      label: "Query after Z-ORDER",
    },
    queryB: {
      sql: "-- No ZORDER applied\nSELECT * FROM iot_telemetry WHERE device_id = 'sensor-4421' AND metric_timestamp BETWEEN '2024-03-01' AND '2024-03-02'",
      label: "Query without Z-ORDER",
    },
    winner: "a",
    explanation:
      "Z-ORDER co-locates rows with similar device_id and metric_timestamp values in the same file groups. Delta's data-skipping uses file-level min/max stats to skip irrelevant files. Without Z-ORDER, matching rows are scattered across thousands of files, forcing near-full scans even with stats-based skipping.",
    concept: "z_ordering",
  },
  {
    id: "round-07",
    title: "MERGE with Partition Alignment",
    context:
      "Table `fact_shipments` (900M rows, partitioned by `ship_date`) receives a daily incremental load of 2M rows. All new rows have today's `ship_date`.",
    queryA: {
      sql: "MERGE INTO fact_shipments t USING daily_shipments s ON t.shipment_id = s.shipment_id WHEN MATCHED THEN UPDATE SET * WHEN NOT MATCHED THEN INSERT *",
      label: "MERGE without partition hint",
    },
    queryB: {
      sql: "MERGE INTO fact_shipments t USING daily_shipments s ON t.shipment_id = s.shipment_id AND t.ship_date = '2024-06-15' WHEN MATCHED THEN UPDATE SET * WHEN NOT MATCHED THEN INSERT *",
      label: "MERGE with partition predicate",
    },
    winner: "b",
    explanation:
      "Adding the partition predicate `t.ship_date = '2024-06-15'` to the ON clause lets Delta narrow the MERGE scan to a single partition. Without it, the engine must scan all 900M rows to find potential matches, even though the source only contains today's data.",
    concept: "merge_optimization",
  },
  {
    id: "round-08",
    title: "Reading from a Table with 50,000 Small Files",
    context:
      "Table `web_logs` accumulated 50,000 files averaging 2MB each (total 100GB) due to frequent micro-batch writes. A downstream job reads the entire table.",
    queryA: {
      sql: "-- After: OPTIMIZE web_logs\nSELECT response_code, COUNT(*) FROM web_logs GROUP BY response_code",
      label: "Query after OPTIMIZE",
    },
    queryB: {
      sql: "-- No compaction\nSELECT response_code, COUNT(*) FROM web_logs GROUP BY response_code",
      label: "Query on uncompacted table",
    },
    winner: "a",
    explanation:
      "OPTIMIZE compacts the 50,000 small files into fewer, optimally-sized files (~1GB each). This reduces scheduler overhead (50K tasks → ~100 tasks), lowers file-open latency, improves sequential I/O, and enables better column-chunk predicate stats. The uncompacted table forces 50K tasks with high per-task overhead.",
    concept: "small_file_compaction",
  },
  {
    id: "round-09",
    title: "Repeated Reads of a Hot Dimension",
    context:
      "Table `product_catalog` (500K rows, 200MB) is joined by 12 different downstream queries in the same job. The cluster has 64GB executor memory with Delta caching enabled.",
    queryA: {
      sql: "CACHE SELECT * FROM product_catalog;\nSELECT p.category, SUM(o.amount) FROM orders o JOIN product_catalog p ON o.product_id = p.id GROUP BY p.category",
      label: "Explicit CACHE before joins",
    },
    queryB: {
      sql: "SELECT p.category, SUM(o.amount) FROM orders o JOIN product_catalog p ON o.product_id = p.id GROUP BY p.category",
      label: "No explicit caching",
    },
    winner: "a",
    explanation:
      "Explicitly caching the 200MB dimension table stores it in deserialized columnar format in executor memory. All 12 downstream joins read from memory instead of re-reading from remote storage. Without caching, each of the 12 queries independently fetches the table from cloud storage, adding cumulative I/O latency.",
    concept: "delta_caching",
  },
  {
    id: "round-10",
    title: "Aggregating a Heavily Skewed Key",
    context:
      "Table `ad_impressions` has 4B rows. Column `advertiser_id` is extremely skewed — one advertiser accounts for 40% of all rows. You need impression counts per advertiser.",
    queryA: {
      sql: "SELECT advertiser_id, COUNT(*) AS impressions FROM ad_impressions GROUP BY advertiser_id",
      label: "Direct aggregation",
    },
    queryB: {
      sql: "SELECT advertiser_id, SUM(impressions) AS impressions FROM (SELECT advertiser_id, FLOOR(RAND() * 100) AS salt, COUNT(*) AS impressions FROM ad_impressions GROUP BY advertiser_id, salt) GROUP BY advertiser_id",
      label: "Salted two-stage aggregation",
    },
    winner: "b",
    explanation:
      "The skewed key sends 1.6B rows to a single reducer, causing OOM or extreme slowness. Salting splits the hot key across 100 sub-partitions in the first stage, distributing work evenly. The second stage merges the 100 partial counts — a trivial operation. This eliminates the data-skew bottleneck.",
    concept: "salting_for_skew",
  },
  {
    id: "round-11",
    title: "Reducing Partitions Before Writing",
    context:
      "A Spark job produces 2,000 partitions after a wide transformation, but the output target needs only 8 well-sized files. You need to reduce partition count before writing.",
    queryA: {
      sql: "SELECT /*+ REPARTITION(8) */ * FROM transformed_data",
      label: "Full repartition to 8",
    },
    queryB: {
      sql: "SELECT /*+ COALESCE(8) */ * FROM transformed_data",
      label: "Coalesce to 8",
    },
    winner: "b",
    explanation:
      "COALESCE reduces partitions by combining adjacent partitions locally — no shuffle required. REPARTITION triggers a full shuffle of all data across the network to create exactly 8 partitions. When reducing partition count, coalesce is always cheaper because it avoids the shuffle stage entirely.",
    concept: "coalesce_vs_repartition",
  },
  {
    id: "round-12",
    title: "Vectorized String Processing",
    context:
      "Table `raw_logs` has 1.5B rows with a `message` column (average 2KB string). Cluster has Photon-enabled runtime. You need to extract a JSON field from the string.",
    queryA: {
      sql: "SELECT get_json_object(message, '$.request_id') AS request_id FROM raw_logs",
      label: "get_json_object (row-at-a-time)",
    },
    queryB: {
      sql: "SELECT message:request_id AS request_id FROM raw_logs",
      label: "Semi-structured access (Photon-native)",
    },
    winner: "b",
    explanation:
      "The colon-path syntax (message:request_id) is handled natively by Photon's vectorized C++ engine, processing thousands of rows per batch in columnar SIMD operations. get_json_object falls back to row-at-a-time JVM processing, missing Photon acceleration entirely. On string-heavy workloads the difference is 3-10x.",
    concept: "photon_acceleration",
  },
  {
    id: "round-13",
    title: "Handling Unknown Data Distribution at Runtime",
    context:
      "Table `user_actions` (2B rows) is joined with `campaigns` (10M rows). Statistics are stale and partition sizes vary wildly at runtime. AQE is enabled on the cluster.",
    queryA: {
      sql: "SELECT /*+ SHUFFLE_HASH(c) */ u.user_id, c.campaign_name FROM user_actions u JOIN campaigns c ON u.campaign_id = c.id WHERE u.action_type = 'click'",
      label: "Forced shuffle hash join",
    },
    queryB: {
      sql: "SELECT u.user_id, c.campaign_name FROM user_actions u JOIN campaigns c ON u.campaign_id = c.id WHERE u.action_type = 'click'",
      label: "Let AQE decide at runtime",
    },
    winner: "b",
    explanation:
      "With Adaptive Query Execution enabled, Spark observes actual shuffle partition sizes at runtime and can dynamically convert the join to a broadcast if campaigns is small enough after filtering, or coalesce skewed partitions. Forcing a shuffle hash join overrides AQE's ability to optimize based on real data distribution.",
    concept: "aqe_shuffle",
  },
  {
    id: "round-14",
    title: "Filtered Join with Runtime Partition Elimination",
    context:
      "Table `sales` (3B rows, partitioned by `region`) joins `targets` (500 rows). The query filters targets to region = 'APAC'. Dynamic partition pruning is enabled.",
    queryA: {
      sql: "SELECT s.product_id, s.amount, t.target_amount FROM sales s JOIN targets t ON s.region = t.region WHERE t.region = 'APAC'",
      label: "Join with filter on dimension",
    },
    queryB: {
      sql: "SELECT s.product_id, s.amount, t.target_amount FROM sales s JOIN targets t ON s.region = t.region WHERE s.region = 'APAC'",
      label: "Join with filter on fact",
    },
    winner: "a",
    explanation:
      "When the filter is on the dimension side (targets), dynamic partition pruning kicks in — at runtime, Spark identifies that only 'APAC' passes from the dimension, then pushes that value as a pruning filter into the fact table scan, reading only the APAC partition. Filtering the fact table directly also works, but Query A demonstrates the dynamic pruning path that handles multi-value filters more elegantly and is the pattern that benefits from DPP.",
    concept: "dynamic_partition_pruning",
  },
  {
    id: "round-15",
    title: "CTE Referenced Multiple Times",
    context:
      "A complex query defines a CTE that aggregates 600M rows from `inventory_movements`. The CTE result (50K rows) is referenced 3 times in the main query for different joins.",
    queryA: {
      sql: "WITH inventory_summary AS (SELECT warehouse_id, product_id, SUM(quantity) AS total_qty FROM inventory_movements GROUP BY warehouse_id, product_id) SELECT a.warehouse_id, a.total_qty, b.total_qty AS partner_qty, c.total_qty AS overflow_qty FROM inventory_summary a LEFT JOIN inventory_summary b ON a.product_id = b.product_id AND b.warehouse_id = 'WH-PARTNER' LEFT JOIN inventory_summary c ON a.product_id = c.product_id AND c.warehouse_id = 'WH-OVERFLOW' WHERE a.warehouse_id = 'WH-PRIMARY'",
      label: "CTE referenced 3 times (no materialization hint)",
    },
    queryB: {
      sql: "CREATE OR REPLACE TEMPORARY VIEW inventory_summary AS SELECT warehouse_id, product_id, SUM(quantity) AS total_qty FROM inventory_movements GROUP BY warehouse_id, product_id; CACHE TABLE inventory_summary; SELECT a.warehouse_id, a.total_qty, b.total_qty AS partner_qty, c.total_qty AS overflow_qty FROM inventory_summary a LEFT JOIN inventory_summary b ON a.product_id = b.product_id AND b.warehouse_id = 'WH-PARTNER' LEFT JOIN inventory_summary c ON a.product_id = c.product_id AND c.warehouse_id = 'WH-OVERFLOW' WHERE a.warehouse_id = 'WH-PRIMARY'",
      label: "Materialized temp view with CACHE",
    },
    winner: "b",
    explanation:
      "Spark does not automatically materialize CTEs — each reference re-executes the 600M-row aggregation. With 3 references, the expensive GROUP BY runs 3 times. Creating a temporary view and caching it forces single computation and stores the 50K-row result in memory, reducing total work by ~66%.",
    concept: "cte_materialization",
  },
];
