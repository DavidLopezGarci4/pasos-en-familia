"use client";

import { createContext, useContext, type ReactNode } from "react";

export const FormContextValue = createContext<{
  action: (data: FormData) => void;
  pending: boolean;
}>({ action: () => {}, pending: false });

export function FormContext({
  value,
  children,
}: {
  value: { action: (data: FormData) => void; pending: boolean };
  children: ReactNode;
}) {
  return (
    <FormContextValue.Provider value={value}>
      {children}
    </FormContextValue.Provider>
  );
}

export function ActionForm({
  operation,
  children,
  label,
  className = "",
  values = {},
}: {
  operation: string;
  children: ReactNode;
  label: string;
  className?: string;
  values?: Record<string, string>;
}) {
  const { action, pending } = useContext(FormContextValue);
  return (
    <form
      action={action}
      aria-label={label}
      className={className}
      onSubmit={(event) => {
        const submitter = (event.nativeEvent as SubmitEvent)
          .submitter as HTMLButtonElement | null;
        if (!submitter?.name || !submitter.value) return;
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = submitter.name;
        input.value = submitter.value;
        event.currentTarget.appendChild(input);
      }}
    >
      <input type="hidden" name="operation" value={operation} />
      {Object.entries(values).map(([name, value]) => (
        <input type="hidden" name={name} value={value} key={name} />
      ))}
      <fieldset disabled={pending}>{children}</fieldset>
    </form>
  );
}
