import type { SqlRound } from "./rounds";

export const deathmatchTiers = [
  "SQL Novice",
  "Query Writer",
  "Performance Aware",
  "Execution Plan Master",
] as const;

export type DeathmatchTier = (typeof deathmatchTiers)[number];

export type RoundResult = {
  roundId: string;
  userPick: "a" | "b";
  correct: boolean;
  concept: string;
};

export type DeathmatchResult = {
  totalRounds: number;
  correctCount: number;
  percentage: number;
  tier: DeathmatchTier;
  roundResults: RoundResult[];
  commonMistakes: string[];
};

const conceptLabels: Record<string, string> = {
  partition_pruning:
    "Partition pruning — filtering before scanning saves entire file reads",
  broadcast_join:
    "Broadcast joins — replicate the small table to avoid shuffling the large one",
  sort_merge_join:
    "Sort-merge joins — exploit pre-sorted data to avoid reshuffling",
  window_vs_self_join:
    "Window functions — single-pass aggregation beats quadratic self-joins",
  predicate_pushdown:
    "Predicate pushdown — push filters to the scan layer to skip data early",
  z_ordering:
    "Z-ordering — co-locate related rows for effective data skipping",
  merge_optimization:
    "MERGE optimization — partition predicates narrow the scan target",
  small_file_compaction:
    "Small file compaction — fewer larger files reduce scheduling overhead",
  delta_caching:
    "Delta caching — keep hot tables in memory to avoid repeated storage reads",
  salting_for_skew:
    "Salting for skew — split hot keys across sub-partitions to balance work",
  coalesce_vs_repartition:
    "Coalesce vs repartition — reduce partitions without a full shuffle",
  photon_acceleration:
    "Photon acceleration — use native vectorized paths for string processing",
  aqe_shuffle:
    "AQE shuffle — let adaptive execution optimize based on real data sizes",
  dynamic_partition_pruning:
    "Dynamic partition pruning — runtime filters from dimension tables prune fact scans",
  cte_materialization:
    "CTE materialization — cache multi-referenced CTEs to avoid redundant computation",
};

export function getDeathmatchTier(
  correctCount: number,
  totalRounds: number,
): DeathmatchTier {
  if (totalRounds === 0) return "SQL Novice";
  const ratio = correctCount / totalRounds;
  if (ratio > 0.8) return "Execution Plan Master";
  if (ratio > 0.6) return "Performance Aware";
  if (ratio > 1 / 3) return "Query Writer";
  return "SQL Novice";
}

export function calculateDeathmatchResult(
  rounds: SqlRound[],
  answers: Record<string, "a" | "b">,
): DeathmatchResult {
  const roundResults: RoundResult[] = rounds.map((round) => {
    const userPick = answers[round.id] ?? "a";
    const answered = round.id in answers;
    return {
      roundId: round.id,
      userPick: answered ? answers[round.id] : "a",
      correct: answered ? userPick === round.winner : false,
      concept: round.concept,
    };
  });

  const correctCount = roundResults.filter((r) => r.correct).length;
  const totalRounds = rounds.length;
  const percentage = totalRounds > 0 ? Math.round((correctCount / totalRounds) * 100) : 0;
  const tier = getDeathmatchTier(correctCount, totalRounds);

  const mistakeConcepts = roundResults
    .filter((r) => !r.correct)
    .map((r) => r.concept);

  const conceptFrequency: Record<string, number> = {};
  for (const concept of mistakeConcepts) {
    conceptFrequency[concept] = (conceptFrequency[concept] ?? 0) + 1;
  }

  const commonMistakes = Object.entries(conceptFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([concept]) => conceptLabels[concept] ?? concept);

  return {
    totalRounds,
    correctCount,
    percentage,
    tier,
    roundResults,
    commonMistakes,
  };
}

export function buildDeathmatchBrief(result: DeathmatchResult): string {
  const gapsLine =
    result.commonMistakes.length > 0
      ? `Common gaps: ${result.commonMistakes.map((m) => m.split(" — ")[0]).join(", ")}`
      : "No gaps — perfect score!";

  return [
    "SQL Deathmatch — xhverse.co/tools/sql-deathmatch",
    "",
    `Score: ${result.correctCount}/${result.totalRounds} (${result.percentage}%) — ${result.tier}`,
    gapsLine,
    "",
    "Try it yourself: https://xhverse.co/tools/sql-deathmatch",
  ].join("\n");
}
