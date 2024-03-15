import { json, type MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import {
  getLoggedInUser,
  syncYapilyAccounts,
  getAccountsWithTransactions,
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
    return json({ accounts: rows });
  }

  return json({ accounts });
};

export default function AccountsIndex() {
  const { accounts } = useLoaderData<typeof loader>();
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
      {accounts.length ? (
        <div className="mb-10">
          <p className="text-gray-500 font-medium mb-2">
            Total account balance ({accounts?.length} account
            {accounts?.length === 1 ? "" : "s"})
          </p>
          <div className="flex">
            <p className="text-3xl font-bold">
              {accounts
                .reduce(
                  // very bad! and will lead to rounding errors. Would use decimal.js on backend and calculate total there
                  (sum, account) => sum + parseFloat(account.balance ?? "0"),
                  0
                )
                .toLocaleString("en-GB")}{" "}
              {accounts[0]?.currency}
            </p>
          </div>
        </div>
      ) : null}
      <div className="flex gap-x-6 mb-12">
        {accounts.map((account) => (
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

      <div className="bg-[#f5f0ef]  p-6 rounded-lg border-slate-300 border-[1.5px] shadow-lg">
        <h3 className="text-xl font-semibold pb-2">Recent Transactions</h3>
        <TransactionsTable
          transactions={accounts.flatMap((account) =>
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
