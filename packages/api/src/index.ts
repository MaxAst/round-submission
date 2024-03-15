export * from "./users.service";
export * from "./accounts.service";

export const isNotFalsey = <T>(value: T): value is NonNullable<typeof value> =>
  !!value;

export const USER_ID = "7243dd99-b0b7-43e4-bd73-7eb60c3878e8";
export const TENANT_ID = "b587a378-51b2-4d3c-bb44-d65d53793fb3";
