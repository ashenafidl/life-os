import { tnxColumns } from "@/app/(modules)/(finance)/transactions/columns";
import DataTable from "@/components/table/data-table";
import { db } from "@/db/drizzle";
import { transactions } from "@/db/schema/finance";

export default async function TransactionsPage() {
  const data = await db.select().from(transactions);

  return (
    <div className="p-4">
      <DataTable columns={tnxColumns} data={data} />
    </div>
  );
}
