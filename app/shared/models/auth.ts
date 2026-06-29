import { sql } from "drizzle-orm";
import { boolean, index, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Profile fields for onboarding
  phone: varchar("phone"),
  dietary: varchar("dietary"),
  tshirtSize: varchar("tshirt_size"),
  hatSize: varchar("hat_size"),
  handicap: varchar("handicap"),
  ghin: varchar("ghin"),
  homeAirport: varchar("home_airport"),
  // Shipping address for merch and golf club shipments
  shippingStreet: varchar("shipping_street"),
  shippingCity: varchar("shipping_city"),
  shippingState: varchar("shipping_state"),
  shippingZip: varchar("shipping_zip"),
  shippingCountry: varchar("shipping_country").default("USA"),
  profileComplete: boolean("profile_complete").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
