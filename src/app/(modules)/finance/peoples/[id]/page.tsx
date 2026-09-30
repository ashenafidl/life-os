import { CaretLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import PersonAliasesEditor from "@/components/finance/peoples/person-aliases-editor";
import PersonNameEditor from "@/components/finance/peoples/person-name-editor";
import { personTransactionColumns } from "@/components/finance/peoples/person-transaction-columns";
import DataTable from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import formatMoney from "@/lib/money-utils";
import { getPersonDetail } from "@/lib/queries/finance";

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getPersonDetail(id);

  if (!detail) notFound();

  const net = detail.received - detail.sent;

  return (
    <div className="space-y-4 p-4">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href={"/finance/peoples" as Route} />}
      >
        <CaretLeftIcon /> Peoples
      </Button>

      <PersonNameEditor person={detail.person} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Sent"
          value={formatMoney(detail.sent, { showCurrency: true })}
        />
        <StatCard
          label="Received"
          value={formatMoney(detail.received, { showCurrency: true })}
        />
        <StatCard
          label="Net"
          value={formatMoney(net, { showCurrency: true })}
        />
        <StatCard label="Transactions" value={String(detail.links.length)} />
      </div>

      <Card className="p-4">
        <PersonAliasesEditor
          personId={detail.person.id}
          aliases={detail.person.aliases}
        />
      </Card>

      <div>
        <p className="text-muted-foreground mb-2 text-xs tracking-wide uppercase">
          Linked transactions
        </p>
        <DataTable columns={personTransactionColumns} data={detail.links} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="gap-1 p-4">
      <p className="text-muted-foreground text-xs tracking-wide uppercase">
        {label}
      </p>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
    </Card>
  );
}
