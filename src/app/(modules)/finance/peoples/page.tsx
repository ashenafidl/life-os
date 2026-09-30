import PeoplesActionsBar from "@/components/finance/peoples/peoples-actions-bar";
import { peoplesColumns } from "@/components/finance/peoples/peoples-columns";
import DataTable from "@/components/table/data-table";
import { getPeoplesOverview } from "@/lib/queries/finance";

export default async function PeoplesPage() {
  const data = await getPeoplesOverview();

  return (
    <div className="p-4">
      <DataTable columns={peoplesColumns} data={data}>
        <PeoplesActionsBar />
      </DataTable>
    </div>
  );
}
