import { TanStackDevtools } from "@tanstack/react-devtools";
import { FormDevtoolsPanel } from "@tanstack/react-form-devtools";
import { HotkeysDevtoolsPanel } from "@tanstack/react-hotkeys-devtools";

export default function DevTools() {
  return (
    <TanStackDevtools
      config={{}}
      plugins={[
        { name: "Tanstack Form", render: <FormDevtoolsPanel /> },
        {
          name: "Tanstack Hotkeys",
          render: <HotkeysDevtoolsPanel theme="light" devtoolsOpen={false} />,
        },
      ]}
    />
  );
}
