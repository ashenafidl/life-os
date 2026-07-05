import { Icon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { useFormContext } from "@/hooks/use-form";

interface Props {
  label?: string;
  icon?: Icon;
}

export default function SubmitButton(props: Props) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button type="submit" disabled={isSubmitting} className="grow">
          {props.icon && <props.icon />}
          {props.label ?? "Save"}
        </Button>
      )}
    </form.Subscribe>
  );
}
