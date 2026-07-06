import ActionsBar from "@/app/(modules)/(finance)/inbox/actions-bar";
import { inboxColumns } from "@/app/(modules)/(finance)/inbox/columns";
import DataTable from "@/components/table/data-table";
import { db } from "@/db/drizzle";
import { smsMessages } from "@/db/schema/finance";

export default async function InboxPage() {
  const data = await db.select().from(smsMessages);

  return (
    <div className="p-4">
      <DataTable columns={inboxColumns} data={data}>
        <ActionsBar />
      </DataTable>
    </div>
  );
}
