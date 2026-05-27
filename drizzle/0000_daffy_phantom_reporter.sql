CREATE TABLE "game_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_type" varchar(50) NOT NULL,
	"players" json NOT NULL,
	"winner" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
