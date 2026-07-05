import { Badge } from "@/components/ui/badge";

export default function BreakpointIndicator() {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <Badge
      variant="secondary"
      className="fixed top-0 left-1/2 z-50 -translate-x-1/2 rounded-t-none rounded-b-sm"
    >
      <span className="text-muted-foreground">Breakpoint: </span>
      <span className="font-bold">
        <div className="block sm:hidden">xs</div>
        <div className="hidden sm:block md:hidden lg:hidden xl:hidden 2xl:hidden">
          sm
        </div>
        <div className="hidden md:block lg:hidden xl:hidden 2xl:hidden">md</div>
        <div className="hidden lg:block xl:hidden 2xl:hidden">lg</div>
        <div className="hidden xl:block 2xl:hidden">xl</div>
        <div className="hidden 2xl:block">2xl</div>
      </span>
    </Badge>
  );
}
