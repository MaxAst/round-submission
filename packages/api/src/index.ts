export * from "./users.service";
export * from "./accounts.service";

export const isNotFalsey = <T>(value: T): value is NonNullable<typeof value> =>
  !!value;
