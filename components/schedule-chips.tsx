import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ChipProps = {
  className?: string;
};

const chipClassName =
  "h-4 rounded-full px-1.5 py-0 text-[10px] leading-none sm:h-5 sm:px-2 sm:text-xs";

export function PhaseChip({
  phase,
  className,
}: ChipProps & { phase: string }) {
  const normalizedPhase = phase.trim().toLowerCase();

  if (normalizedPhase === "dressage") {
    return (
      <Badge
        className={cn(
          chipClassName,
          "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-50",
          className
        )}
      >
        Dressage
      </Badge>
    );
  }

  if (normalizedPhase === "cross country") {
    return (
      <Badge
        className={cn(
          chipClassName,
          "border-green-200 bg-green-50 text-green-700 hover:bg-green-50",
          className
        )}
      >
        Cross Country
      </Badge>
    );
  }

  if (normalizedPhase === "show jumping") {
    return (
      <Badge
        className={cn(
          chipClassName,
          "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50",
          className
        )}
      >
        Show Jumping
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={cn(chipClassName, className)}>
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
      <Badge variant="outline" className={cn(chipClassName, className)}>
        —
      </Badge>
    );
  }

  const normalizedArena = arena.trim().toLowerCase();

  if (normalizedArena === "sj") {
    return (
      <Badge
        className={cn(
          chipClassName,
          "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50",
          className
        )}
      >
        SJ
      </Badge>
    );
  }

  if (normalizedArena === "xc") {
    return (
      <Badge
        className={cn(
          chipClassName,
          "border-green-200 bg-green-50 text-green-700 hover:bg-green-50",
          className
        )}
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
        className={cn(
          chipClassName,
          dressageArenaStyles[normalizedArena],
          className
        )}
      >
        {arena}
      </Badge>
    );
  }

  if (normalizedArena.startsWith("r")) {
    return (
      <Badge
        className={cn(
          chipClassName,
          "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-50",
          className
        )}
      >
        {arena}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={cn(chipClassName, className)}>
      {arena}
    </Badge>
  );
}
