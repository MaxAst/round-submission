import {
  type ApiListResponseOfTransaction,
  financialDataAPI,
} from "@round/yapily";
import { Decimal } from "decimal.js";
import { and, db, eq, gt, gte, lte, schema, sql, sum } from "@round/db";
import dayjs from "dayjs";

import { getAccounts, isNotFalsey } from ".";

export const insertTransactionsFromYapily = (
  data: NonNullable<ApiListResponseOfTransaction["data"]>,
  accountId: string
) => {
  return db
    .insert(schema.transactions)
    .values(
      data.map((transaction) => ({
        accountId: accountId,
        amount: transaction.amount
          ? new Decimal(transaction.amount).toDecimalPlaces(4).toString()
          : undefined,
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

export const getTransactionsWithinTimeframe = async (
  tenantId: string,
  start: Date,
  end: Date,
  type: "spend" | "income" = "spend"
) => {
  const result = await db
    .select({
      totalAmount:
        type === "spend"
          ? sql<string>`SUM(CASE WHEN ${schema.transactions.amount} < 0 THEN ${schema.transactions.amount} ELSE 0 END)`
          : sql<string>`SUM(CASE WHEN ${schema.transactions.amount} > 0 THEN ${schema.transactions.amount} ELSE 0 END)`,
    })
    .from(schema.accounts)
    .innerJoin(
      schema.transactions,
      eq(schema.accounts.id, schema.transactions.accountId)
    )
    .where(
      and(
        eq(schema.accounts.tenantId, tenantId),
        gte(schema.transactions.date, start),
        lte(schema.transactions.date, end)
      )
    );

  return result[0]?.totalAmount ?? "0";
};

export const getMonthlyStats = async (tenantId: string) => {
  const today = dayjs();

  const thisMonthTotalSpend = await getTransactionsWithinTimeframe(
    tenantId,
    today.startOf("month").toDate(),
    today.toDate(),
    "spend"
  );

  const lastMonthTotalSpend = await getTransactionsWithinTimeframe(
    tenantId,
    today.subtract(1, "month").startOf("month").toDate(),
    today.subtract(1, "month").endOf("month").toDate(),
    "spend"
  );

  const thisMonthTotalIncome = await getTransactionsWithinTimeframe(
    tenantId,
    today.startOf("month").toDate(),
    today.toDate(),
    "income"
  );

  const lastMonthTotalIncome = await getTransactionsWithinTimeframe(
    tenantId,
    today.subtract(1, "month").startOf("month").toDate(),
    today.subtract(1, "month").endOf("month").toDate(),
    "income"
  );

  const daysPassedThisMonth = today.date();
  const totalDaysThisMonth = today.endOf("month").date();

  const dailyIncomeThisMonth = new Decimal(thisMonthTotalIncome).div(
    daysPassedThisMonth
  );
  const dailySpendThisMonth = new Decimal(thisMonthTotalSpend).div(
    daysPassedThisMonth
  );

  const projectedIncomeThisMonth =
    dailyIncomeThisMonth.times(totalDaysThisMonth);
  const projectedSpendThisMonth = dailySpendThisMonth.times(totalDaysThisMonth);

  const percentageChangeInSpend = projectedSpendThisMonth
    .sub(lastMonthTotalSpend)
    .div(lastMonthTotalSpend)
    .times(100);

  if (new Decimal(lastMonthTotalIncome).equals(0)) {
  }

  const percentageChangeInIncome = new Decimal(lastMonthTotalIncome).equals(0)
    ? new Decimal(100)
    : projectedIncomeThisMonth
        .sub(lastMonthTotalIncome)
        .div(lastMonthTotalIncome)
        .times(100);

  console.log(lastMonthTotalIncome);

  return {
    thisMonthTotalSpend: new Decimal(thisMonthTotalSpend)
      .toDecimalPlaces(2)
      .toNumber()
      .toLocaleString("en-GB"),
    percentageChangeInSpend: percentageChangeInSpend
      .toDecimalPlaces(2)
      .toNumber()
      .toLocaleString("en-GB"),
    thisMonthTotalIncome: new Decimal(thisMonthTotalIncome)
      .toDecimalPlaces(2)
      .toNumber()
      .toLocaleString("en-GB"),
    percentageChangeInIncome: percentageChangeInIncome
      .toDecimalPlaces(2)
      .toNumber()
      .toLocaleString("en-GB"),
  };
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
