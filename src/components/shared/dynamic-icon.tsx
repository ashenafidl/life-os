import * as IconComponents from "@phosphor-icons/react";

interface DynamicIconProps extends IconComponents.IconProps {
  name: string;
}

export default function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const IconComponent = (
    IconComponents as unknown as Record<string, IconComponents.Icon>
  )[name];

  if (!IconComponent) {
    return <IconComponents.QuestionMarkIcon {...props} />;
  }

  return <IconComponent {...props} />;
}
