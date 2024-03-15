export * from "./users.service";
export * from "./accounts.service";
export * from "./transactions.service";

export const isNotFalsey = <T>(value: T): value is NonNullable<typeof value> =>
  !!value;
