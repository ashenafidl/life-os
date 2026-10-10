import DynamicIcon from "@/components/shared/dynamic-icon";
import { Category } from "@/types/category";

export default function CategoryBadge({ name, icon, color }: Category) {
  return (
    <span className="flex items-center gap-2">
      <DynamicIcon name={icon} color={color} />
      <span>{name}</span>
    </span>
  );
}
