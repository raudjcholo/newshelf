CREATE TABLE "inbound_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"alias" text NOT NULL,
	"email" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inbound_addresses_alias_unique" UNIQUE("alias"),
	CONSTRAINT "inbound_addresses_email_unique" UNIQUE("email"),
	CONSTRAINT "inbound_addresses_user_id_id_unique" UNIQUE("user_id","id")
);
--> statement-breakpoint
ALTER TABLE "inbound_addresses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "issue_states" (
	"user_id" uuid NOT NULL,
	"issue_id" uuid NOT NULL,
	"read_at" timestamp with time zone,
	"saved_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	CONSTRAINT "issue_states_user_id_issue_id_pk" PRIMARY KEY("user_id","issue_id")
);
--> statement-breakpoint
ALTER TABLE "issue_states" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"newsletter_id" uuid NOT NULL,
	"raw_email_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content_html" text,
	"content_text" text,
	"published_at" timestamp with time zone,
	"received_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "issues_raw_email_id_unique" UNIQUE("raw_email_id"),
	CONSTRAINT "issues_user_id_id_unique" UNIQUE("user_id","id")
);
--> statement-breakpoint
ALTER TABLE "issues" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "newsletters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"sender_name" text,
	"sender_email" text NOT NULL,
	"sender_domain" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "newsletters_user_id_id_unique" UNIQUE("user_id","id")
);
--> statement-breakpoint
ALTER TABLE "newsletters" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "raw_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"inbound_address_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_message_id" text NOT NULL,
	"from_address" text NOT NULL,
	"to_address" text NOT NULL,
	"subject" text,
	"raw_payload_location" text,
	"status" text DEFAULT 'received' NOT NULL,
	"failure_reason" text,
	"received_at" timestamp with time zone NOT NULL,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "raw_emails_provider_message_unique" UNIQUE("provider","provider_message_id"),
	CONSTRAINT "raw_emails_user_id_id_unique" UNIQUE("user_id","id"),
	CONSTRAINT "raw_emails_status_check" CHECK ("raw_emails"."status" in ('received', 'queued', 'processing', 'processed', 'failed'))
);
--> statement-breakpoint
ALTER TABLE "raw_emails" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "inbound_addresses" ADD CONSTRAINT "inbound_addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_states" ADD CONSTRAINT "issue_states_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_states" ADD CONSTRAINT "issue_states_user_issue_fk" FOREIGN KEY ("user_id","issue_id") REFERENCES "public"."issues"("user_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_user_newsletter_fk" FOREIGN KEY ("user_id","newsletter_id") REFERENCES "public"."newsletters"("user_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_user_raw_email_fk" FOREIGN KEY ("user_id","raw_email_id") REFERENCES "public"."raw_emails"("user_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletters" ADD CONSTRAINT "newsletters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raw_emails" ADD CONSTRAINT "raw_emails_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raw_emails" ADD CONSTRAINT "raw_emails_user_inbound_address_fk" FOREIGN KEY ("user_id","inbound_address_id") REFERENCES "public"."inbound_addresses"("user_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inbound_addresses_user_id_idx" ON "inbound_addresses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "issue_states_saved_idx" ON "issue_states" USING btree ("user_id","saved_at") WHERE "issue_states"."saved_at" is not null;--> statement-breakpoint
CREATE INDEX "issue_states_archived_idx" ON "issue_states" USING btree ("user_id","archived_at") WHERE "issue_states"."archived_at" is not null;--> statement-breakpoint
CREATE INDEX "issues_user_id_idx" ON "issues" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "issues_newsletter_id_idx" ON "issues" USING btree ("newsletter_id");--> statement-breakpoint
CREATE INDEX "issues_user_received_at_idx" ON "issues" USING btree ("user_id","received_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "issues_newsletter_received_at_idx" ON "issues" USING btree ("newsletter_id","received_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "newsletters_user_id_idx" ON "newsletters" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "newsletters_user_sender_email_idx" ON "newsletters" USING btree ("user_id","sender_email");--> statement-breakpoint
CREATE INDEX "raw_emails_user_id_idx" ON "raw_emails" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "raw_emails_inbound_address_id_idx" ON "raw_emails" USING btree ("inbound_address_id");--> statement-breakpoint
CREATE INDEX "raw_emails_user_received_at_idx" ON "raw_emails" USING btree ("user_id","received_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "raw_emails_status_idx" ON "raw_emails" USING btree ("status");