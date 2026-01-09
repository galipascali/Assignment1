import bcrypt from "bcrypt";

export function assertExists(value: any, message?: string): asserts value {
  if (value === null || value === undefined) {
    throw new Error(message || "Value does not exist");
  }
}

export const encryptPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};
