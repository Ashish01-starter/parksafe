import { ConfidenceLevel, ConfidenceTier, AvailabilitySource } from "./types";

export interface ConfidenceResult {
  level: ConfidenceLevel;
  tier: ConfidenceTier;
  ageMinutes: number;
  label: string;
  description: string;
  colorClass: string;
}

/**
 * Returns CSS colour class for confidence badge
 */
export function getConfidenceBadgeClass(level: ConfidenceLevel): string {
  switch (level) {
    case "high":   return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "medium": return "bg-blue-100 text-blue-800 border-blue-200";
    case "low":    return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "none":   return "bg-slate-100 text-slate-500 border-slate-200";
    default:       return "bg-slate-100 text-slate-500 border-slate-200";
  }
}

/**
 * Computes availability confidence based on how stale the data is and the source.
 *
 * Tiers:
 *   Fresh   (0–2 min)   → 'high'
 *   Recent  (2–10 min)  → 'medium'
 *   Stale   (10–30 min) → 'low'
 *   Unknown (30+ min)   → 'none'
 *
 * Special cases:
 *   - sensor / camera / official:  trust goes up one notch
 *   - unknown source:              treated as Stale regardless of age
 */
export function calculateAvailabilityConfidence(
  lastUpdated: string | Date | null | undefined,
  source: AvailabilitySource | string = "unknown"
): ConfidenceResult {
  // Handle null/undefined availability (data was never set)
  if (!lastUpdated) {
    return {
      level: "none",
      tier: "Unknown",
      ageMinutes: Infinity,
      label: "Unknown",
      description: "Availability has not been verified for this location yet.",
      colorClass: getConfidenceBadgeClass("none"),
    };
  }

  const now = Date.now();
  const updatedAt = new Date(lastUpdated).getTime();
  const ageMs = now - updatedAt;
  const ageMinutes = Math.max(0, ageMs / 60_000);

  // For unknown source, override to Unknown/none
  if (source === "unknown") {
    return {
      level: "none",
      tier: "Unknown",
      ageMinutes,
      label: "Unknown",
      description: "Availability source is unknown or unverified.",
      colorClass: getConfidenceBadgeClass("none"),
    };
  }

  // Base tier from age
  let tier: ConfidenceTier;
  let level: ConfidenceLevel;
  let label: string;
  let description: string;

  if (ageMinutes < 2) {
    tier = "Fresh";
    level = "high";
    label = "Fresh (0–2m)";
    description = "Updated very recently. High accuracy expected.";
  } else if (ageMinutes < 10) {
    tier = "Recent";
    level = "medium";
    const mins = Math.round(ageMinutes);
    label = `Recent (${mins}m)`;
    description = "Updated in the last 10 minutes. Good reliability.";
  } else if (ageMinutes < 30) {
    tier = "Stale";
    level = "low";
    const mins = Math.round(ageMinutes);
    label = `Stale (${mins}m)`;
    description = "Updated over 10 minutes ago. Real-world occupancy may differ.";
  } else {
    tier = "Unknown";
    level = "none";
    const mins = Math.round(ageMinutes);
    label = `Stale (${mins > 60 ? Math.round(mins / 60) + "h" : mins + "m"})`;
    description = "Availability data is over 30 minutes old and treated as unverified.";
  }

  // Upgrade confidence for verified sensor/camera/official sources if fresh
  const highTrustSources: string[] = ["official", "sensor", "camera"];
  if (highTrustSources.includes(source)) {
    if (level === "medium") level = "high";
    else if (level === "low") level = "medium";
  }

  return {
    level,
    tier,
    ageMinutes,
    label,
    description,
    colorClass: getConfidenceBadgeClass(level),
  };
}

/**
 * Returns a human-readable label for the source type
 */
export function getSourceLabel(source: AvailabilitySource | string): string {
  const labels: Record<string, string> = {
    official: "Official feed",
    sensor: "IoT sensor",
    camera: "Camera detection",
    user_report: "Community report",
    user_confirmation: "Driver confirmed",
    manual: "Driver confirmed",
    estimated: "Estimated",
    unknown: "Unverified",
  };
  return labels[source] || "Unverified";
}
