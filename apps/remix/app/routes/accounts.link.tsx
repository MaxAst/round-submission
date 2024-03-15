import { db, eq, schema } from "@round/db";
import { authorizationAPI, institutionsAPI } from "@round/yapily";
import {
  ActionFunctionArgs,
  json,
  redirect,
  type MetaFunction,
} from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { isAxiosError } from "axios";

import { USER_ID } from "~/constants";

export const meta: MetaFunction = () => {
  return [{ title: "Accounts | Round" }];
};

export const loader = async () => {
  const institutions = await institutionsAPI.getInstitutions();
  return json({ institutions: institutions.data });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    // TOOD: add cookie-based session
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, USER_ID),
    });
    if (!user) throw new Error("User not found");

    const formData = await request.formData();
    const { institutionId } = Object.fromEntries(formData);

    const result = await authorizationAPI.initiateAccountRequest({
      institutionId: institutionId.toString(),
      applicationUserId: user.id,
      callback: process.env.YAPILY_CALLBACK_URL,
    });

    console.log(result.data.data);

    const authUrl = result.data.data?.authorisationUrl;
    if (!authUrl) {
      throw new Error("Authorisation URL not returned from Yapily");
    }

    const consentToken = result.data.data?.consentToken;
    if (consentToken) {
      await db
        .update(schema.users)
        .set({ yapilyConsentToken: consentToken })
        .where(eq(schema.users.id, USER_ID));
    }

    const userUuid = result.data.data?.userUuid;
    if (userUuid) {
      await db
        .update(schema.users)
        .set({ yapilyUuid: userUuid })
        .where(eq(schema.users.id, USER_ID));
    }

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
