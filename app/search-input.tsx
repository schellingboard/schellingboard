"use client";
import clsx from "clsx";
import { type ComponentPropsWithoutRef, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";

export function SearchInput({
  value,
  onClear,
  className,
  inputClassName,
  ...rest
}: Omit<ComponentPropsWithoutRef<"input">, "type" | "value" | "className"> & {
  value: string;
  onClear: () => void;
  className?: string;
  inputClassName?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className={clsx("relative", className)}>
      <input
        ref={inputRef}
        type="search"
        value={value}
        // Only some browsers draw their own clear button; hide it so there is
        // one, the same, everywhere.
        className={clsx(
          inputClassName,
          "w-full pr-9 [&::-webkit-search-cancel-button]:appearance-none"
        )}
        {...rest}
      />
      {value !== "" && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            onClear();
            inputRef.current?.focus();
          }}
          className="absolute inset-y-0 right-0 flex items-center px-2.5 text-fg-subtle hover:text-fg-muted"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
