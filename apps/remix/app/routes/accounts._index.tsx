import { json, type MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import {
  getLoggedInUser,
  syncYapilyAccounts,
  getAccountsWithTransactions,
  getMonthlyStats,
} from "@round/api";
import { TransactionsTable } from "~/components/TransactionsTable";

export const meta: MetaFunction = () => {
  return [{ title: "Accounts | Round" }];
};

export const loader = async () => {
  const user = await getLoggedInUser();
  const accounts = await getAccountsWithTransactions(user.tenantId);

  // we only want to sync accounts from Yapily if the user has a consent token and if there are no accounts in the database
  // this is to avoid making unnecessary requests to the Yapily API, which is only supoosed to be used in the sync job
  if (user.yapilyConsentToken && accounts.length === 0) {
    const rows = await syncYapilyAccounts(
      user.yapilyConsentToken,
      user.tenantId
    );
    return json({
      accounts: rows,
      thisMonthTotalSpend: null,
      percentageChangeInSpend: null,
      thisMonthTotalIncome: null,
      percentageChangeInIncome: null,
    });
  }

  const result = await getMonthlyStats(user.tenantId);

  return json({
    accounts,
    ...result,
  });
};

export default function AccountsIndex() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold pb-2">Accounts</h1>
          <p className="text-gray-500 font-medium">
            Add or manage your linked bank accounts
          </p>
        </div>
        <Link to="/accounts/link">
          <button className="px-6 py-3 bg-slate-800 text-white font-medium rounded-md text-sm">
            + Link Bank Account
          </button>
        </Link>
      </div>

      {data.accounts.length ? (
        <div className="mb-10">
          <p className="text-gray-500 font-medium mb-2">
            Total account balance ({data.accounts?.length} account
            {data.accounts?.length === 1 ? "" : "s"})
          </p>
          <div className="flex">
            <p className="text-3xl font-bold">
              {data.accounts
                .reduce(
                  // very bad! and will lead to rounding errors. Would use decimal.js on backend and calculate total there
                  (sum, account) => sum + parseFloat(account.balance ?? "0"),
                  0
                )
                .toLocaleString("en-GB")}{" "}
              {data.accounts[0]?.currency}
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex gap-x-6 mb-12">
        {data.accounts.map((account) => (
          <div
            key={account.id}
            className="bg-[#f5f0ef] h-28 w-64 p-3 rounded-lg border-slate-300 border-[1.5px] shadow-lg"
          >
            <h3 className="text-sm font-semibold pb-2">
              {account.accountNames?.[0]}
            </h3>
            <p className="text-xl font-bold">
              {parseFloat(account.balance ?? "0").toLocaleString("en-GB")}{" "}
              {account?.currency}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-x-6 mb-12">
        {data.thisMonthTotalSpend && (
          <div className="bg-[#f5f0ef] h-28 w-72 p-3 rounded-lg border-slate-300 border-[1.5px] shadow-lg">
            <h3 className="text-sm font-semibold pb-2">Monthly Spend</h3>
            <p className="text-xl font-bold">
              {data.thisMonthTotalSpend} {data.accounts[0]?.currency}
            </p>
            <p className="text-sm">
              {data.percentageChangeInSpend}% from last month
            </p>
          </div>
        )}

        {data.thisMonthTotalIncome && (
          <div className="bg-[#f5f0ef] h-28 w-72 p-3 rounded-lg border-slate-300 border-[1.5px] shadow-lg">
            <h3 className="text-sm font-semibold pb-2">Monthly Income</h3>
            <p className="text-xl font-bold">
              {data.thisMonthTotalIncome} {data.accounts[0]?.currency}
            </p>
            <p className="text-sm">
              {data.percentageChangeInIncome}% from last month
            </p>
          </div>
        )}
      </div>

      <div className="bg-[#f5f0ef]  p-6 rounded-lg border-slate-300 border-[1.5px] shadow-lg">
        <h3 className="text-xl font-semibold pb-2">Recent Transactions</h3>
        <TransactionsTable
          transactions={data.accounts.flatMap((account) =>
            "transactions" in account && Array.isArray(account.transactions)
              ? account.transactions?.map((transaction) => ({
                  ...transaction,
                  accountName: account.accountNames?.[0] ?? "",
                }))
              : []
          )}
        />
      </div>
    </div>
  );
}
