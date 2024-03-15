export const isNotFalsey = <T>(value: T): value is NonNullable<typeof value> =>
  !!value;
