import { useRef, type ComponentPropsWithoutRef } from "react";
import { cx } from "./cx";
import { XMarkIcon } from "./icons";

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
    <div className={cx("relative", className)}>
      <input
        ref={inputRef}
        type="search"
        value={value}
        // Only some browsers draw their own clear button; hide it so there is
        // one, the same, everywhere.
        className={cx(
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
