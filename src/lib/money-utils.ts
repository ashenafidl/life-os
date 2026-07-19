interface FormatMoneyOptions {
  /** Show shorthand form for large numbers, e.g. 6,000 -> "6K", 1,250,000 -> "1.25M" */
  compact?: boolean;
  showCurrency?: boolean;
  showEmptySymbol?: boolean;
  emptySymbol?: string;
}

export default function formatMoney(
  amount: number | string | null | undefined,
  options: FormatMoneyOptions = {
    showEmptySymbol: true,
    emptySymbol: "-",
  },
) {
  const { compact = true, showCurrency = false } = options;

  const value = typeof amount === "string" ? Number(amount) : amount;
  if (value === null || value === undefined || Number.isNaN(value)) {
    return options.showEmptySymbol ? (options.emptySymbol ?? "-") : "";
  }

  const hasFraction = value % 1 !== 0;

  const formatted = compact
    ? new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value)
    : new Intl.NumberFormat("en-US", {
        minimumFractionDigits: hasFraction ? 2 : 0,
        maximumFractionDigits: hasFraction ? 2 : 0,
      }).format(value);

  return showCurrency ? `ETB ${formatted}` : formatted;
}
