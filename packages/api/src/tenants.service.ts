import { db, eq, schema } from "@round/db";

type NewTenant = typeof schema.tenants.$inferInsert;

export const insertTenant = async (tenant: NewTenant) => {
  return db.insert(schema.tenants).values(tenant).returning();
};

export const getAnyTenant = async () => {
  return db.query.tenants.findFirst();
};

export const getTenantById = async (tenantId: string) => {
  return db.query.tenants.findFirst({
    where: eq(schema.tenants.id, tenantId),
  });
};
