-- Boring Golf Complete Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- ENUMS
CREATE TYPE "public"."block_status" AS ENUM('upcoming', 'boarding', 'in_progress', 'complete', 'changed', 'cancelled');
CREATE TYPE "public"."block_type" AS ENUM('tee_time', 'meal', 'transport', 'lodging', 'activity', 'free_time');
CREATE TYPE "public"."guest_role" AS ENUM('captain', 'guest', 'vip');
CREATE TYPE "public"."issue_severity" AS ENUM('low', 'medium', 'high', 'critical');
CREATE TYPE "public"."issue_status" AS ENUM('open', 'in_progress', 'resolved');
CREATE TYPE "public"."knowledge_category" AS ENUM('course', 'city', 'history', 'easter_egg', 'tip', 'quote');
CREATE TYPE "public"."member_role" AS ENUM('owner', 'organizer', 'member');
CREATE TYPE "public"."merch_status" AS ENUM('collecting', 'ordered', 'shipped', 'delivered', 'staged');
CREATE TYPE "public"."rsvp_status" AS ENUM('pending', 'confirmed', 'declined');
CREATE TYPE "public"."shipment_status" AS ENUM('invite_sent', 'address_confirmed', 'label_created', 'in_transit', 'delivered', 'received', 'issue');
CREATE TYPE "public"."task_status" AS ENUM('pending', 'in_progress', 'completed', 'blocked');
CREATE TYPE "public"."tournament_format" AS ENUM('scramble', 'best_ball', 'match_play', 'stableford', 'skins', 'ryder_cup');
CREATE TYPE "public"."trip_status" AS ENUM('draft', 'planning', 'confirmed', 'active', 'completed', 'cancelled');
CREATE TYPE "public"."trip_tier" AS ENUM('ghost', 'onsite', 'signature');

-- USERS TABLE (profiles)
CREATE TABLE "users" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "email" varchar UNIQUE,
    "first_name" varchar,
    "last_name" varchar,
    "profile_image_url" varchar,
    "phone" varchar,
    "dietary" varchar,
    "tshirt_size" varchar,
    "hat_size" varchar,
    "handicap" varchar,
    "ghin" varchar,
    "home_airport" varchar,
    "shipping_street" varchar,
    "shipping_city" varchar,
    "shipping_state" varchar,
    "shipping_zip" varchar,
    "shipping_country" varchar DEFAULT 'USA',
    "profile_complete" boolean DEFAULT false,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

-- SESSIONS TABLE (for express-session)
CREATE TABLE "sessions" (
    "sid" varchar PRIMARY KEY NOT NULL,
    "sess" jsonb NOT NULL,
    "expire" timestamp NOT NULL
);
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");

-- TRIPS TABLE
CREATE TABLE "trips" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "theme" text,
    "location" text NOT NULL,
    "start_date" timestamp NOT NULL,
    "end_date" timestamp NOT NULL,
    "tier" "trip_tier" DEFAULT 'onsite',
    "budget" integer,
    "status" "trip_status" DEFAULT 'draft',
    "invite_code" varchar UNIQUE DEFAULT gen_random_uuid(),
    "created_at" timestamp DEFAULT now()
);

-- TRIP MEMBERS TABLE (links users to trips)
CREATE TABLE "trip_members" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "trip_id" varchar NOT NULL REFERENCES "trips"("id") ON DELETE CASCADE,
    "user_id" varchar NOT NULL,
    "role" "member_role" DEFAULT 'member',
    "joined_at" timestamp DEFAULT now()
);

-- GUESTS TABLE
CREATE TABLE "guests" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "trip_id" varchar NOT NULL REFERENCES "trips"("id") ON DELETE CASCADE,
    "name" text NOT NULL,
    "email" text,
    "phone" text,
    "role" "guest_role" DEFAULT 'guest',
    "rsvp_status" "rsvp_status" DEFAULT 'pending',
    "dietary" text,
    "tshirt_size" text,
    "hat_size" text,
    "handicap" integer,
    "ghin" text,
    "arrival_date" timestamp,
    "departure_date" timestamp,
    "room_assignment" text,
    "emergency_contact" text,
    "team_id" varchar
);

-- ITINERARY BLOCKS TABLE
CREATE TABLE "itinerary_blocks" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "trip_id" varchar NOT NULL REFERENCES "trips"("id") ON DELETE CASCADE,
    "type" "block_type" NOT NULL,
    "title" text NOT NULL,
    "description" text,
    "location" text,
    "map_link" text,
    "start_time" timestamp NOT NULL,
    "end_time" timestamp NOT NULL,
    "buffer_before" integer DEFAULT 0,
    "buffer_after" integer DEFAULT 0,
    "status" "block_status" DEFAULT 'upcoming',
    "vendor_id" varchar,
    "confirmation" text,
    "cost" integer,
    "notes" text,
    "participants" text[],
    "depends_on" varchar
);

-- TASKS TABLE
CREATE TABLE "tasks" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "trip_id" varchar NOT NULL REFERENCES "trips"("id") ON DELETE CASCADE,
    "title" text NOT NULL,
    "description" text,
    "owner" text,
    "due_date" timestamp,
    "status" "task_status" DEFAULT 'pending',
    "priority" integer DEFAULT 0,
    "checklist" jsonb,
    "depends_on" varchar
);

-- TOURNAMENTS TABLE
CREATE TABLE "tournaments" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "trip_id" varchar NOT NULL REFERENCES "trips"("id") ON DELETE CASCADE,
    "name" text NOT NULL,
    "format" "tournament_format" NOT NULL,
    "rules" text,
    "handicap_method" text,
    "prize_pool" integer,
    "is_active" boolean DEFAULT true
);

-- TEAMS TABLE
CREATE TABLE "teams" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "tournament_id" varchar NOT NULL REFERENCES "tournaments"("id") ON DELETE CASCADE,
    "name" text NOT NULL,
    "color" text,
    "members" text[]
);

-- ROUNDS TABLE
CREATE TABLE "rounds" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "tournament_id" varchar NOT NULL REFERENCES "tournaments"("id") ON DELETE CASCADE,
    "name" text NOT NULL,
    "course_name" text,
    "date" timestamp,
    "is_complete" boolean DEFAULT false
);

-- SCORES TABLE
CREATE TABLE "scores" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "round_id" varchar NOT NULL REFERENCES "rounds"("id") ON DELETE CASCADE,
    "guest_id" varchar NOT NULL REFERENCES "guests"("id") ON DELETE CASCADE,
    "team_id" varchar,
    "hole_scores" jsonb,
    "total_strokes" integer,
    "net_score" integer,
    "points" integer,
    "confirmed" boolean DEFAULT false
);

-- MERCH ORDERS TABLE
CREATE TABLE "merch_orders" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "trip_id" varchar NOT NULL REFERENCES "trips"("id") ON DELETE CASCADE,
    "design_name" text NOT NULL,
    "items" jsonb,
    "size_runs" jsonb,
    "status" "merch_status" DEFAULT 'collecting',
    "deadline" timestamp,
    "cost" integer,
    "notes" text
);

-- GUEST MERCH TABLE
CREATE TABLE "guest_merch" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "merch_order_id" varchar NOT NULL REFERENCES "merch_orders"("id") ON DELETE CASCADE,
    "guest_id" varchar NOT NULL REFERENCES "guests"("id") ON DELETE CASCADE,
    "selections" jsonb,
    "submitted_at" timestamp
);

-- SHIPMENTS TABLE
CREATE TABLE "shipments" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "trip_id" varchar NOT NULL REFERENCES "trips"("id") ON DELETE CASCADE,
    "guest_id" varchar NOT NULL REFERENCES "guests"("id") ON DELETE CASCADE,
    "carrier" text,
    "tracking_number" text,
    "ship_to" text,
    "eta" timestamp,
    "status" "shipment_status" DEFAULT 'invite_sent',
    "item_description" text,
    "issues" text
);

-- ISSUES TABLE
CREATE TABLE "issues" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "trip_id" varchar NOT NULL REFERENCES "trips"("id") ON DELETE CASCADE,
    "guest_id" varchar REFERENCES "guests"("id"),
    "title" text NOT NULL,
    "description" text,
    "severity" "issue_severity" DEFAULT 'medium',
    "status" "issue_status" DEFAULT 'open',
    "owner" text,
    "playbook" text,
    "resolution" text,
    "created_at" timestamp DEFAULT now(),
    "resolved_at" timestamp
);

-- ANNOUNCEMENTS TABLE
CREATE TABLE "announcements" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "trip_id" varchar NOT NULL REFERENCES "trips"("id") ON DELETE CASCADE,
    "message" text NOT NULL,
    "created_at" timestamp DEFAULT now(),
    "sent_by" text
);

-- KNOWLEDGE ENTRIES TABLE
CREATE TABLE "knowledge_entries" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "category" "knowledge_category" NOT NULL,
    "title" text NOT NULL,
    "content" text NOT NULL,
    "related_entity_id" varchar,
    "tags" text[],
    "is_active" boolean DEFAULT true,
    "created_by" text,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);
