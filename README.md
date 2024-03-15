# Round Application

The requirements for this project are as follows:

- API(s) to get bank accounts data for frontend
- API(s) to get transactions history for frontend
- API(s) to get stats for frontend
- A database schema to store needed information, modelled on Yapily. Actual data can be mocked
- One workflow to keep local data in sync with Yapily - to keep it synced every x hours, and generate the reports
- (Bonus) A super basic barebones dashboard page with the above mockup (in NextJS or React)
- Lots of ideas on how you would build it right if you were to make it for real

When starting a new project, there's always many different approaches one can take, each with their pro's and con's. I know that Round uses NestJS with Prisma & supabase for the backend and Next.js for the frontend, so I will focus on that first. The only change I'll make right away is to use drizzle as the ORM, because it is superior to Prisma in every way.

If I have time, I will demonstrate other approaches, which, from my experience, can lead to faster iteration speeds in a small startup team environment. I will use a monorepo to neatly organize all approaches in one repository.

## Setup

- Install Node.js
- Install pnpm
- Install Docker
- Install [ngrok](https://ngrok.com/docs/http/) and set the endpoint as the YAPILY_CALLBACK_URL env var (for open banking callback URL)
- run `docker compose up -d`
- run `pnpm --filter @round/db run push`
- create a Yapily application and add all required env vars
- run `pnpm --filter @round/remix run dev` to start the application
- open http://localhost:5173 and connect a bank account (make sure to link modelo sandbox first in the Yapily dashboard)

use these credentials for the modelo sandbox:
username: mits
password: mits

- run `pnpm --filter @round/api run sync` to fetch and store the transactions in the database
  -> doing this manually here because in a real world scenario, I would run this in a separate async process, e.g. SQS -> Lambda

## Thought Process

I decided to choose Remix as a monolithic approach to building the SaaS. The reason for this is, that I believe startup teams can iterate faster on codebases that are not split between server and client, but that are tightly integrated. An alternative approach would have been to use tRPC, which treats the server and client as separate entities, but allows for a type-safe and tight integration between server and client. A classic client-server split via a REST API introduces a lot of work that ultimately does not add any value to the product (e.g. thinking about how to design endpoints, API request/response shapes etc.). Thanks to using a monorepo with internal packages, we can easily change our approach later down the line, because the business logic is packed into internal packages and can be reused in a "thin" REST API (or GraphQL API) down the line.

## Ideas to make it better

- proper authentication and authorization
  -> added hard coded user ID, based on a record that is seeded in the database
- encrypt sensitive data in the database
- use db transactions
- use a queue for the sync job
- create separate table for yapily account information, to make the users table provider agnostic (currently stored on users table with yapily\_ column prefix)
- stronger multi tenancy
- better floating point handling via decimal.js
- refreshing consent token after 90 days
- proper pagination for Yapily API Requests
- tests!
- convert currency code to symbol for UI
- differentiating between credit and debit transactions, loans etc.
