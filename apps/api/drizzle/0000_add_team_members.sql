CREATE TABLE IF NOT EXISTS "team_members" (
  "id" text PRIMARY KEY NOT NULL,
  "name" varchar(255) NOT NULL,
  "position_az" varchar(255) NOT NULL,
  "position_en" varchar(255) NOT NULL,
  "position_ru" varchar(255) NOT NULL,
  "image" varchar(1000),
  "order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
