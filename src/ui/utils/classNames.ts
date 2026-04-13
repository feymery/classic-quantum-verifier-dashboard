type ClassValue =
  | string
  | null
  | undefined
  | false
  | Record<string, boolean>
  | ClassValue[];

function toClassName(value: ClassValue): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.map(toClassName).filter(Boolean).join(" ");
  }
  return Object.entries(value)
    .filter(([, enabled]) => Boolean(enabled))
    .map(([className]) => className)
    .join(" ");
}

export function classNames(...values: ClassValue[]): string {
  return values.map(toClassName).filter(Boolean).join(" ");
}
