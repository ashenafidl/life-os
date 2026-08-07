import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BalanceCardSkeleton() {
  return (
    <div className="flex flex-wrap items-stretch gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        // oxlint-disable-next-line react/no-array-index-key
        <Card key={i} className="w-full sm:w-[320px] lg:w-90">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-12 w-48" />
            </div>
          </CardContent>

          <CardFooter>
            <Skeleton className="h-3 w-24" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
