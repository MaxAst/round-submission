import * as accounts from "./accounts";
import * as tenants from "./tenants";
import * as transactions from "./transactions";
import * as users from "./users";

export { type User } from "./users";

export const schema = {
  ...users,
  ...accounts,
  ...tenants,
  ...transactions,
};
