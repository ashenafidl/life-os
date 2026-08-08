import ActionsBar from "@/components/finance/inbox/actions-bar";
import { inboxColumns } from "@/components/finance/inbox/columns";
import DataTable from "@/components/table/data-table";
import { getMessages } from "@/lib/queries/finance";

export default async function InboxPage() {
  const data = await getMessages();

  return (
    <div className="p-4">
      <DataTable columns={inboxColumns} data={data}>
        <ActionsBar />
      </DataTable>
    </div>
  );
}
