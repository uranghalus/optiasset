type Primitive = string | number | boolean | null | undefined;

const SENSITIVE_FIELDS = [
  "password",
  "accessToken",
  "refreshToken",
  "token",
  "secret",
  "apiKey",
];

function isPrimitive(value: unknown): value is Primitive {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "undefined"
  );
}

function sanitize(obj: any) {
  if (!obj || typeof obj !== "object") return obj;

  const clone: any = {};

  for (const key of Object.keys(obj)) {
    if (SENSITIVE_FIELDS.includes(key)) continue;
    clone[key] = obj[key];
  }

  return clone;
}

export function createDiff(oldData: any, newData: any) {
  if (!oldData && !newData) return null;

  const before = sanitize(oldData ?? {});
  const after = sanitize(newData ?? {});

  const diff: Record<
    string,
    { old: Primitive | object; new: Primitive | object }
  > = {};

  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of keys) {
    const oldValue = before[key];
    const newValue = after[key];

    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      diff[key] = {
        old: isPrimitive(oldValue) ? oldValue : (oldValue ?? null),
        new: isPrimitive(newValue) ? newValue : (newValue ?? null),
      };
    }
  }

  return Object.keys(diff).length > 0 ? diff : null;
}
