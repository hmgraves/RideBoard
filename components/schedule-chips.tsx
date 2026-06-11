import { Badge } from "@/components/ui/badge";

type ChipProps = {
  className?: string;
};

export function PhaseChip({
  phase,
  className,
}: ChipProps & { phase: string }) {
  const normalizedPhase = phase.trim().toLowerCase();

  if (normalizedPhase === "dressage") {
    return (
      <Badge
        className={`border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-50 ${className ?? ""}`}
      >
        Dressage
      </Badge>
    );
  }

  if (normalizedPhase === "cross country") {
    return (
      <Badge
        className={`border-green-200 bg-green-50 text-green-700 hover:bg-green-50 ${className ?? ""}`}
      >
        Cross Country
      </Badge>
    );
  }

  if (normalizedPhase === "show jumping") {
    return (
      <Badge
        className={`border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50 ${className ?? ""}`}
      >
        Show Jumping
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={className}>
      {phase}
    </Badge>
  );
}

export function ArenaChip({
  arena,
  className,
}: ChipProps & { arena: string | null }) {
  if (!arena) {
    return (
      <Badge variant="outline" className={className}>
        —
      </Badge>
    );
  }

  const normalizedArena = arena.trim().toLowerCase();

  if (normalizedArena === "sj") {
    return (
      <Badge
        className={`border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50 ${className ?? ""}`}
      >
        SJ
      </Badge>
    );
  }

  if (normalizedArena === "xc") {
    return (
      <Badge
        className={`border-green-200 bg-green-50 text-green-700 hover:bg-green-50 ${className ?? ""}`}
      >
        XC
      </Badge>
    );
  }

  const dressageArenaStyles: Record<string, string> = {
    r1: "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-50",
    r2: "border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-50",
    r3: "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-50",
    r4: "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-50",
  };

  if (normalizedArena in dressageArenaStyles) {
    return (
      <Badge
        className={`${dressageArenaStyles[normalizedArena]} ${className ?? ""}`}
      >
        {arena}
      </Badge>
    );
  }

  if (normalizedArena.startsWith("r")) {
    return (
      <Badge
        className={`border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-50 ${className ?? ""}`}
      >
        {arena}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={className}>
      {arena}
    </Badge>
  );
}
