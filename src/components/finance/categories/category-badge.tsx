import DynamicIcon from "@/components/shared/dynamic-icon";
import { Category } from "@/types/category";

export default function CategoryBadge({ name, icon, color }: Category) {
  return (
    <span className="flex items-center gap-1">
      <DynamicIcon name={icon} size={14} color={color} />
      <span>{name}</span>
    </span>
  );
}
