import { Icon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { useFormContext } from "@/hooks/use-form";

interface Props {
  label?: string;
  icon?: Icon;
  onClick?: () => void;
}

export default function ResetButton(props: Props) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button
          type="reset"
          variant="secondary"
          disabled={isSubmitting}
          className="grow"
          onClick={(e) => {
            e.preventDefault();
            form.reset();

            props.onClick?.();
          }}
        >
          {props.icon && <props.icon />}
          {props.label ?? "Cancel"}
        </Button>
      )}
    </form.Subscribe>
  );
}
