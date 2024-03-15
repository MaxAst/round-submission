import { type MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [{ title: "Portfolio | Round" }];
};

export default function PortfolioIndex() {
  return (
    <div className="h-full w-full flex flex-col items-center pt-32">
      <h1 className="text-5xl font-black mb-4">Welcome to Round!</h1>
      <p className="text-xl">
        Go to{" "}
        <Link to="/accounts" className="underline">
          Accounts
        </Link>{" "}
        to get started.
      </p>
    </div>
  );
}
