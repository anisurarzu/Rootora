import { cn } from "@/lib/utils";

/** Matches trailing weight like "500g", "500 gm", "1kg", "250 ml". */
const WEIGHT_SUFFIX_RE =
  /\s+(\d+(?:[.,]\d+)?)\s*(g|gm|grams?|kg|ml|l|litre|liter)\s*$/i;

export function splitProductName(name: string): {
  title: string;
  weight: string | null;
} {
  const match = name.trim().match(WEIGHT_SUFFIX_RE);
  if (!match) {
    return { title: name, weight: null };
  }

  const amount = match[1]!.replace(",", ".");
  const unitRaw = match[2]!.toLowerCase();
  const unit =
    unitRaw === "gm" || unitRaw.startsWith("gram")
      ? "g"
      : unitRaw.startsWith("litre") || unitRaw.startsWith("liter")
        ? "L"
        : unitRaw === "l"
          ? "L"
          : unitRaw;

  return {
    title: name.slice(0, match.index).trim(),
    weight: `${amount}${unit}`,
  };
}

type ProductTitleProps = {
  name: string;
  size?: "card" | "page";
  className?: string;
};

export function ProductTitle({
  name,
  size = "card",
  className,
}: ProductTitleProps) {
  const { title, weight } = splitProductName(name);

  if (!weight) {
    return <span className={className}>{name}</span>;
  }

  return (
    <span className={cn("inline", className)}>
      {title}{" "}
      <span
        className={cn(
          "inline-flex translate-y-[-1px] items-center rounded-sm bg-primary font-button font-semibold uppercase tracking-wide text-primary-foreground",
          size === "card" && "mx-0.5 px-1.5 py-0.5 text-[10px] leading-none sm:text-[11px]",
          size === "page" && "mx-1 px-2.5 py-1 text-base leading-none md:text-lg"
        )}
      >
        {weight}
      </span>
    </span>
  );
}
