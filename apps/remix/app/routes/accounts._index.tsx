import { db, eq, schema } from "@round/db";
import { financialDataAPI } from "@round/yapily";
import { json, type MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { TENANT_ID, USER_ID } from "~/constants";
import { isNotFalsey } from "~/utils";

export const meta: MetaFunction = () => {
  return [{ title: "Accounts | Round" }];
};

export const loader = async () => {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, USER_ID),
  });

  const accounts = await db.query.accounts.findMany({
    where: eq(schema.accounts.tenantId, TENANT_ID),
  });

  // we only want to fetch accounts if the user has a consent token and if there are no accounts in the database
  // this is to avoid making unnecessary requests to the Yapily API, which is only supoosed to be used in the sync job
  if (user?.yapilyConsentToken && accounts.length === 0) {
    const response = await financialDataAPI.getAccounts(
      user.yapilyConsentToken
    );
    const data = response.data.data;
    if (data) {
      const rows = await db
        .insert(schema.accounts)
        .values(
          data.map((account) => ({
            tenantId: TENANT_ID,
            yapilyId: account.id,

            currency: account.currency,
            // TODO: use decimal.js for better precision:
            balance: account.balance?.toFixed(2),

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
            accountNumber: Array.from(
              account.accountIdentifications ?? []
            )?.find((id) => id.type === "ACCOUNT_NUMBER")?.identification,
            sortCode: Array.from(account.accountIdentifications ?? [])?.find(
              (id) => id.type === "SORT_CODE"
            )?.identification,

            createdAt: new Date(),
            updatedAt: new Date(),
          }))
        )
        .returning();
      return json({ accounts: rows });
    } else {
      // TODO: handle situation where no accounts are found
      return json({ accounts: [] });
    }
  }

  return json({ accounts });
};

export default function AccountsIndex() {
  const data = useLoaderData<typeof loader>();
  console.log(data);
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
      <div className="mb-10">
        <p className="text-gray-500 font-medium mb-2">
          Total account balance ({data.accounts?.length} account
          {data.accounts?.length === 1 ? "" : "s"})
        </p>
        <div className="flex">
          <div className="border-slate-200 border-2 py-2 px-4 rounded-lg">
            <p className="text-3xl font-bold">
              {data.accounts.reduce(
                // very bad! and will lead to rounding errors. Would use decimal.js on backend and calculate total there
                (sum, account) => sum + parseFloat(account.balance ?? "0"),
                0
              )}{" "}
              {data.accounts[0]?.currency}
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-x-6">
        {data.accounts.map((account) => (
          <div className="bg-[#f5f0ef] h-28 w-64 p-3 rounded-lg border-slate-300 border-[1.5px] shadow-lg">
            <h3 className="text-sm font-semibold pb-2">
              {account.accountNames?.[0]}
            </h3>
            <p className="text-xl font-bold">
              {parseFloat(account.balance ?? "0")} {account?.currency}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
