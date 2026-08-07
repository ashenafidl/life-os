import { Suspense } from "react";

import CountdownList from "@/components/countdown/countdown-list";

export default async function CountdownHomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center text-6xl">
          Loading...
        </div>
      }
    >
      <CountdownList />
    </Suspense>
  );
}
