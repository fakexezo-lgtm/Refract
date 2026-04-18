export const STAGES = [
  { id: "lead", label: "Lead", tone: "bg-whisper text-ink border-hair" },
  { id: "contacted", label: "Contacted", tone: "bg-cream text-ink border-hair" },
  { id: "proposal", label: "Proposal", tone: "bg-[#efeadf] text-ink border-hair" },
  { id: "won", label: "Won", tone: "bg-[#e4ecdf] text-ink border-hair" },
  { id: "lost", label: "Lost", tone: "bg-[#f0e4e2] text-ink border-hair" },
];

export const STATUSES = [
  { id: "lead", label: "Lead" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
];

export const AVATAR_COLORS = [
  "#1f1f1f", "#3d3d3d", "#6b6b6b", "#8c6b4f", "#a07856",
  "#4a5a3d", "#5d6b4a", "#6b4a4a", "#4a4a6b", "#2f2f2f"
];

export function initialsOf(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]?.toUpperCase() || "").join("") || "•";
}

export function pickAvatarColor(seed = "") {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}