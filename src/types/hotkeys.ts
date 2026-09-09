declare module "@tanstack/hotkeys" {
  export interface HotkeyMeta {
    group?: string;
  }

  export function formatForDisplay(...args: any[]): string;
  export function getHotkeyManager(): any;
}
