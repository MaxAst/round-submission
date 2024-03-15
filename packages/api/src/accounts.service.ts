import { db, eq, schema } from "@round/db";
import {
  authorizationAPI,
  financialDataAPI,
  type AccountApiListResponse,
} from "@round/yapily";
import { isNotFalsey } from ".";

export const initiateOpenBankingRequest = async (
  institutionId: string,
  userId: string
) => {
  const result = await authorizationAPI.initiateAccountRequest({
    institutionId: institutionId,
    applicationUserId: userId,
    callback: process.env.YAPILY_CALLBACK_URL,
  });

  const authUrl = result.data.data?.authorisationUrl;
  if (!authUrl) {
    throw new Error("Authorisation URL not returned from Yapily");
  }

  const consentToken = result.data.data?.consentToken;
  if (consentToken) {
    await db
      .update(schema.users)
      .set({ yapilyConsentToken: consentToken })
      .where(eq(schema.users.id, userId));
  }

  const userUuid = result.data.data?.userUuid;
  if (userUuid) {
    await db
      .update(schema.users)
      .set({ yapilyUuid: userUuid })
      .where(eq(schema.users.id, userId));
  }

  return authUrl;
};

export const insertAccountsFromYapily = (
  data: NonNullable<AccountApiListResponse["data"]>,
  tenantId: string
) => {
  return db
    .insert(schema.accounts)
    .values(
      data.map((account) => ({
        tenantId: tenantId,
        yapilyId: account.id,

        currency: account.currency,

        // for sake of the demo, we turn accounts with negative balances into positive balances (sandbox accounts only have negative balances)
        balance: account.balance
          ? // TODO: use decimal.js for better precision:
            Math.abs(account.balance).toFixed(2)
          : undefined,

        type: account.type,
        usageType: account.usageType,
        accountType: account.accountType,

        accountNames: account.accountNames
          ?.map((acc) => acc.name)
          .filter(isNotFalsey),

        // TODO: handle multiple account identifications
        iban: Array.from(account.accountIdentifications ?? [])?.find(
          (id) => id.type === "IBAN"
        )?.identification,
        accountNumber: Array.from(account.accountIdentifications ?? [])?.find(
          (id) => id.type === "ACCOUNT_NUMBER"
        )?.identification,
        sortCode: Array.from(account.accountIdentifications ?? [])?.find(
          (id) => id.type === "SORT_CODE"
        )?.identification,

        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    )
    .returning();
};

export const getAccounts = async (tenantId: string) => {
  return db.query.accounts.findMany({
    where: eq(schema.accounts.tenantId, tenantId),
  });
};

export const getAccountsWithTransactions = async (tenantId: string) => {
  return db.query.accounts.findMany({
    where: eq(schema.accounts.tenantId, tenantId),
    with: {
      transactions: true,
    },
  });
};

export const getTransactions = async (tenantId: string) => {
  return db.query.accounts.findMany({
    where: eq(schema.accounts.tenantId, tenantId),
  });
};

export const syncYapilyAccounts = async (
  consentToken: string,
  tenantId: string
) => {
  const response = await financialDataAPI.getAccounts(consentToken);
  const data = response.data.data;
  if (data) {
    return insertAccountsFromYapily(data, tenantId);
  }
  return [];
};
