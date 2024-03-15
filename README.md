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

## Approach 1: NestJS + Drizzle + Supabase + Next.js
