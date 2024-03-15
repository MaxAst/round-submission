import {
  type ApiListResponseOfTransaction,
  financialDataAPI,
} from "@round/yapily";
import { getAccounts } from ".";
import { db, schema } from "@round/db";

export const insertTransactionsFromYapily = (
  data: NonNullable<ApiListResponseOfTransaction["data"]>,
  accountId: string
) => {
  return db
    .insert(schema.transactions)
    .values(
      data.map((transaction) => ({
        accountId: accountId,
        // TODO: use decimal.js for better precision:
        amount: transaction.amount?.toFixed(2),
        currency: transaction.currency,
        status: transaction.status,
        reference: transaction.reference,
        description: transaction.description,
        payee: transaction.payeeDetails?.name,
        payer: transaction.payerDetails?.name,
        date: transaction.date ? new Date(transaction.date) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    )
    .returning();
};

export const syncYapilyTransactions = async (
  consentToken: string,
  tenantId: string
) => {
  const accounts = await getAccounts(tenantId);
  for (const account of accounts) {
    console.log(`Syncing transactions for account ${account.yapilyId}`);
    if (!account.yapilyId) continue;
    // TODO: add pagination
    const response = await financialDataAPI.getTransactions(
      account.yapilyId,
      consentToken
    );
    const data = response.data.data;
    if (data) {
      console.log(
        `Fetched ${data?.length} transactions for account ${account.yapilyId}`
      );
      await insertTransactionsFromYapily(data, account.id);
      console.log(
        `Stored ${data?.length} transactions for account ${account.yapilyId}`
      );
    }
  }
};
