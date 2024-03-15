import {
  ActionFunctionArgs,
  json,
  redirect,
  type MetaFunction,
} from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { isAxiosError } from "axios";

import { getLoggedInUser, initiateOpenBankingRequest } from "@round/api";
import { institutionsAPI } from "@round/yapily";

export const meta: MetaFunction = () => {
  return [{ title: "Accounts | Round" }];
};

export const loader = async () => {
  const institutions = await institutionsAPI.getInstitutions();
  return json({ institutions: institutions.data });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const user = await getLoggedInUser();

    const formData = await request.formData();
    const { institutionId } = Object.fromEntries(formData);

    const authUrl = await initiateOpenBankingRequest(
      institutionId.toString(),
      user.id
    );

    return redirect(authUrl);
  } catch (error) {
    console.error(error);
    if (isAxiosError(error)) {
      return json({
        error:
          "error" in error.response?.data
            ? error.response?.data.error
            : error.response?.data,
      });
    }
    return json({ error: error });
  }
};

export default function LinkAccounts() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="flex flex-col items-center pt-32">
      <h1 className="text-4xl font-bold pb-4">Select Your Bank</h1>
      <ul className="min-w-72 min-h-96 bg-slate-100 rounded-md p-3 border-slate-200 border-[1px] shadow-md">
        {data.institutions.data?.map((institution) => (
          <li key={institution.id}>
            <form method="post">
              <input
                type="hidden"
                name="institutionId"
                value={institution.id}
              />
              <button
                type="submit"
                aria-label="select"
                className="bg-slate-300 p-4 rounded-md cursor-pointer hover:bg-slate-400 w-full"
              >
                {institution.name}
              </button>
            </form>
          </li>
        ))}
      </ul>
      {actionData && "error" in actionData && (
        <p className="text-red-500 mt-4">{actionData.error.message}</p>
      )}
    </div>
  );
}
