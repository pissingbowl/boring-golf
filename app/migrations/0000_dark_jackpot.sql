CREATE TYPE "public"."block_status" AS ENUM('upcoming', 'boarding', 'in_progress', 'complete', 'changed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."block_type" AS ENUM('tee_time', 'meal', 'transport', 'lodging', 'activity', 'free_time');--> statement-breakpoint
CREATE TYPE "public"."guest_role" AS ENUM('captain', 'guest', 'vip');--> statement-breakpoint
CREATE TYPE "public"."issue_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."issue_status" AS ENUM('open', 'in_progress', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."knowledge_category" AS ENUM('course', 'city', 'history', 'easter_egg', 'tip', 'quote');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('owner', 'organizer', 'member');--> statement-breakpoint
CREATE TYPE "public"."merch_status" AS ENUM('collecting', 'ordered', 'shipped', 'delivered', 'staged');--> statement-breakpoint
CREATE TYPE "public"."rsvp_status" AS ENUM('pending', 'confirmed', 'declined');--> statement-breakpoint
CREATE TYPE "public"."shipment_status" AS ENUM('invite_sent', 'address_confirmed', 'label_created', 'in_transit', 'delivered', 'received', 'issue');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('pending', 'in_progress', 'completed', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."tournament_format" AS ENUM('scramble', 'best_ball', 'match_play', 'stableford', 'skins', 'ryder_cup');--> statement-breakpoint
CREATE TYPE "public"."trip_status" AS ENUM('draft', 'planning', 'confirmed', 'active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."trip_tier" AS ENUM('ghost', 'onsite', 'signature');--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" varchar NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"sent_by" text
);
--> statement-breakpoint
CREATE TABLE "guest_merch" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"merch_order_id" varchar NOT NULL,
	"guest_id" varchar NOT NULL,
	"selections" jsonb,
	"submitted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" varchar NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "issues" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" varchar NOT NULL,
	"guest_id" varchar,
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
--> statement-breakpoint
CREATE TABLE "itinerary_blocks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" varchar NOT NULL,
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "merch_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" varchar NOT NULL,
	"design_name" text NOT NULL,
	"items" jsonb,
	"size_runs" jsonb,
	"status" "merch_status" DEFAULT 'collecting',
	"deadline" timestamp,
	"cost" integer,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "rounds" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" varchar NOT NULL,
	"name" text NOT NULL,
	"course_name" text,
	"date" timestamp,
	"is_complete" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "scores" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round_id" varchar NOT NULL,
	"guest_id" varchar NOT NULL,
	"team_id" varchar,
	"hole_scores" jsonb,
	"total_strokes" integer,
	"net_score" integer,
	"points" integer,
	"confirmed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" varchar NOT NULL,
	"guest_id" varchar NOT NULL,
	"carrier" text,
	"tracking_number" text,
	"ship_to" text,
	"eta" timestamp,
	"status" "shipment_status" DEFAULT 'invite_sent',
	"item_description" text,
	"issues" text
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" varchar NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"owner" text,
	"due_date" timestamp,
	"status" "task_status" DEFAULT 'pending',
	"priority" integer DEFAULT 0,
	"checklist" jsonb,
	"depends_on" varchar
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" varchar NOT NULL,
	"name" text NOT NULL,
	"color" text,
	"members" text[]
);
--> statement-breakpoint
CREATE TABLE "tournaments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" varchar NOT NULL,
	"name" text NOT NULL,
	"format" "tournament_format" NOT NULL,
	"rules" text,
	"handicap_method" text,
	"prize_pool" integer,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "trip_members" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"role" "member_role" DEFAULT 'member',
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
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
	"invite_code" varchar DEFAULT gen_random_uuid(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "trips_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
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
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_merch" ADD CONSTRAINT "guest_merch_merch_order_id_merch_orders_id_fk" FOREIGN KEY ("merch_order_id") REFERENCES "public"."merch_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_merch" ADD CONSTRAINT "guest_merch_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guests" ADD CONSTRAINT "guests_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itinerary_blocks" ADD CONSTRAINT "itinerary_blocks_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merch_orders" ADD CONSTRAINT "merch_orders_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scores" ADD CONSTRAINT "scores_round_id_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scores" ADD CONSTRAINT "scores_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_members" ADD CONSTRAINT "trip_members_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");