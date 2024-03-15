import {
  LoaderFunctionArgs,
  json,
  redirect,
  type MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getUserById, saveYapilyConsentToken } from "@round/api";

export const meta: MetaFunction = () => {
  return [{ title: "Accounts | Round" }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const consent = url.searchParams.get("consent");
    const applicationUserId = url.searchParams.get("application-user-id");
    if (!consent || !applicationUserId) throw new Error("Invalid request");

    const user = await getUserById(applicationUserId);
    await saveYapilyConsentToken(user.id, consent);

    return redirect("/accounts");
  } catch (error) {
    console.error(error);
    return json({ error: error });
  }
};

export default function LinkAccountsCallback() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col items-center pt-32">
      <h1 className="text-4xl font-bold pb-4">
        {data.error ? "Failed to redirect" : "Redirecting..."}
      </h1>
    </div>
  );
}
