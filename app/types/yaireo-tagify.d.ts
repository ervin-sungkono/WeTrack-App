declare module "@yaireo/tagify" {
  import type { TagifyChangeEvent, TagifySuggestion } from "@/app/lib/tagify";

  export default class Tagify {
    constructor(element: HTMLInputElement, settings?: Record<string, unknown>);
    readonly settings: Record<string, unknown>;
    on(eventName: "change", listener: (event: TagifyChangeEvent) => void): this;
    loadOriginalValues(value: string | TagifySuggestion[]): void;
    destroy(): void;
  }
}
