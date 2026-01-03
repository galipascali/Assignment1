export function assertExists(value: any, message?: string): asserts value {
  if (value === null || value === undefined) {
    throw new Error(message || "Value does not exist");
  }
}
