import AddTransactionDialog from "@/components/finance/transactions/add-transaction-dialog";
import { getCategories } from "@/lib/queries/finance";

export default async function AddTransactionDialogWrapper() {
  const categories = await getCategories();

  return <AddTransactionDialog allCategories={categories} />;
}
