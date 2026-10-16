"use client";

import { useEffect, useEffectEvent, useRef, type RefObject } from "react";
import Tagify from "@yaireo/tagify";

export type TagifySuggestion = {
  value: string;
  content?: string;
  tagColor?: string;
  style?: string;
  [property: string]: unknown;
};

export type TagifyChangeEvent = CustomEvent<{ value: string }>;

export interface TagifySettings extends Record<string, unknown> {
  whitelist?: TagifySuggestion[];
  transformTag?: (tagData: TagifySuggestion) => void;
}

export interface TagifyProps {
  name: string;
  settings?: TagifySettings;
  whitelist?: TagifySuggestion[];
  value?: string | TagifySuggestion[] | null;
  defaultValue?: string | TagifySuggestion[] | null;
  onChange?: (event: TagifyChangeEvent) => void;
  tagifyRef?: RefObject<unknown> | null;
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
}

function serializeValue(value: string | TagifySuggestion[] | null | undefined): string {
  if (typeof value === "string") return value;
  return value ? JSON.stringify(value) : "";
}

export default function Tags({
  name,
  settings = {},
  whitelist,
  value,
  defaultValue,
  onChange,
  tagifyRef,
  autoFocus = false,
  disabled = false,
  readOnly = false,
  placeholder = "",
  className,
}: TagifyProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const instanceRef = useRef<Tagify | null>(null);
  const onChangeRef = useRef(onChange);
  const getCurrentOptions = useEffectEvent(() => ({ settings, whitelist, autoFocus }));

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const options = getCurrentOptions();
    const instance = new Tagify(input, {
      ...options.settings,
      ...(options.whitelist ? { whitelist: options.whitelist } : {}),
    });
    instance.on("change", (event) => onChangeRef.current?.(event));
    instanceRef.current = instance;
    if (tagifyRef) tagifyRef.current = instance;
    if (options.autoFocus) input.focus();

    return () => {
      instance.destroy();
      if (instanceRef.current === instance) instanceRef.current = null;
      if (tagifyRef?.current === instance) tagifyRef.current = null;
    };
  }, [name, tagifyRef]);

  useEffect(() => {
    const instance = instanceRef.current;
    if (instance && value !== undefined) instance.loadOriginalValues(value ?? "");
  }, [value]);

  useEffect(() => {
    const instance = instanceRef.current;
    if (instance && whitelist) instance.settings.whitelist = whitelist;
  }, [whitelist]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  return (
    <div className="w-full text-xs md:text-sm min-h-9 md:min-h-11 tags-input">
      <input
        ref={inputRef}
        name={name}
        defaultValue={serializeValue(defaultValue ?? value)}
        className={className}
        disabled={disabled}
        readOnly={readOnly}
        autoFocus={autoFocus}
        placeholder={placeholder}
      />
    </div>
  );
}
