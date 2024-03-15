import { syncYapilyTransactions } from "./transactions.service";
import { getAnyUser } from "./users.service";

const user = await getAnyUser();

if (!user) {
  throw new Error("Couldn't find user to sync transactions for");
}

if (!user.yapilyConsentToken) {
  throw new Error("User does not have a Yapily consent token");
}

syncYapilyTransactions(user?.yapilyConsentToken, user?.tenantId)
  .then(() => {
    console.log("Done syncing");
    process.exit();
  })
  .catch((error) => {
    console.log("Failed to sync");
    console.log(error);
  });
