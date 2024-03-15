import {
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { LinksFunction } from "@remix-run/node";

import styles from "./tailwind.css?url";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

const TABS = [
  { name: "Home", href: "/" },
  { name: "Accounts", href: "/accounts" },
  { name: "Portfolio", href: "/portfolio" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <div className="grid grid-cols-12 max-h-screen overflow-hidden">
      <nav className="bg-[#f5f0ef] h-screen overflow-y-scroll p-3 pr-4 col-span-3 lg:col-span-2">
        <h1 className="pl-3 text-3xl font-bold mb-12">Round.</h1>
        <ul>
          {TABS.map((tab) => (
            <li key={tab.name} className="mb-1">
              <NavLink
                className={({ isActive, isPending }) =>
                  isActive
                    ? "w-full flex items-center p-3 bg-zinc-700 rounded-xl shadow-lg text-white"
                    : isPending
                    ? "w-full flex items-center p-3 bg-zinc-500 rounded-xl shadow-lg text-white"
                    : "w-full flex items-center p-3 rounded-xl hover:shadow-lg text-[#1c1c1d] hover:bg-zinc-400 hover:text-white"
                }
                to={tab.href}
              >
                <p>{tab.name}</p>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main className="col-span-9 lg:col-span-10 p-8 h-screen overflow-y-scroll">
        <Outlet />
      </main>
    </div>
  );
}
