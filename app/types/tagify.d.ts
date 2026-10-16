declare module "@/app/lib/tagify" {
  import type { RefObject } from "react";

  export type TagifySuggestion = {
    value: string;
    [property: string]: unknown;
  };

  export type TagifyChangeEvent = CustomEvent<{ value: string }>;

  type TagifyProps = {
    name: string;
    tagifyRef?: RefObject<unknown>;
    settings?: Record<string, unknown>;
    whitelist?: TagifySuggestion[];
    value?: string | TagifySuggestion[] | null;
    defaultValue?: string | TagifySuggestion[] | null;
    onChange?: (event: TagifyChangeEvent) => void;
    autoFocus?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    placeholder?: string;
  };

  export default function Tags(props: TagifyProps): import("react").ReactNode;
}
