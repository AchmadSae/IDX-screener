CREATE TABLE "stock_summary" (
	"id" text PRIMARY KEY NOT NULL,
	"date" double precision NOT NULL,
	"stock_code" text NOT NULL,
	"stock_name" text,
	"remarks" text,
	"previous" double precision,
	"first_trade" double precision,
	"price_open" double precision,
	"price_high" double precision,
	"price_low" double precision,
	"price_close" double precision,
	"change" double precision,
	"volume" double precision,
	"value" double precision,
	"frequency" double precision,
	"individual_index" double precision,
	"weight_for_index" double precision,
	"offer_value" double precision,
	"offer_volume" double precision,
	"bid_value" double precision,
	"bid_volume" double precision,
	"listed_shares" double precision,
	"tradable_shares" double precision,
	"foreign_buy" double precision,
	"foreign_sell" double precision
);
--> statement-breakpoint
CREATE TABLE "stock_screener" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text,
	"industry" text,
	"sector" text,
	"sub_sector" text,
	"sub_industry" text,
	"sub_industry_code" text,
	"index_code" text,
	"market_capital" double precision,
	"total_revenue" double precision,
	"npm" double precision,
	"per" double precision,
	"pbv" double precision,
	"roa" double precision,
	"roe" double precision,
	"der" double precision,
	"week4_pc" double precision,
	"week13_pc" double precision,
	"week26_pc" double precision,
	"week52_pc" double precision,
	"ytdpc" double precision,
	"mtdpc" double precision,
	"uma_date" text,
	"notation" text,
	"status" text,
	"corp_action" text,
	"corp_action_date" text
);
--> statement-breakpoint
CREATE TABLE "ai_analysis_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prediction_id" uuid,
	"symbol" text NOT NULL,
	"asset_class" text NOT NULL,
	"strategy" text NOT NULL,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"prompt_version" text NOT NULL,
	"status" text NOT NULL,
	"input_hash" text,
	"response_summary" text,
	"error_message" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instruments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"symbol" text NOT NULL,
	"display_name" text NOT NULL,
	"asset_class" text NOT NULL,
	"exchange" text,
	"currency" text,
	"provider" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "instruments_symbol_unique" UNIQUE("symbol")
);
--> statement-breakpoint
CREATE TABLE "prediction_outcomes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prediction_id" uuid NOT NULL,
	"evaluated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reference_price" double precision NOT NULL,
	"return_percent" double precision NOT NULL,
	"max_favorable_excursion" double precision,
	"max_adverse_excursion" double precision,
	"hit_target" text NOT NULL,
	"hit_stop" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "predictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"symbol" text NOT NULL,
	"asset_class" text NOT NULL,
	"strategy" text NOT NULL,
	"horizon_days" integer NOT NULL,
	"entry_price" double precision NOT NULL,
	"target_price" double precision NOT NULL,
	"stop_loss" double precision NOT NULL,
	"bullish_probability" double precision NOT NULL,
	"confidence_score" double precision NOT NULL,
	"rule_score" double precision NOT NULL,
	"ai_score" double precision,
	"ai_summary" text,
	"risk_notes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"model_version" text DEFAULT 'rules-v1' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_ohlc" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instrument_id" uuid NOT NULL,
	"date_int" double precision NOT NULL,
	"price_open" double precision,
	"price_high" double precision,
	"price_low" double precision,
	"price_close" double precision NOT NULL,
	"volume" double precision
);
--> statement-breakpoint
ALTER TABLE "ai_analysis_runs" ADD CONSTRAINT "ai_analysis_runs_prediction_id_predictions_id_fk" FOREIGN KEY ("prediction_id") REFERENCES "public"."predictions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_outcomes" ADD CONSTRAINT "prediction_outcomes_prediction_id_predictions_id_fk" FOREIGN KEY ("prediction_id") REFERENCES "public"."predictions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_ohlc" ADD CONSTRAINT "market_ohlc_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_analysis_runs_input_hash_idx" ON "ai_analysis_runs" USING btree ("input_hash");--> statement-breakpoint
CREATE INDEX "predictions_created_at_idx" ON "predictions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "predictions_status_idx" ON "predictions" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "market_ohlc_instrument_date_uq" ON "market_ohlc" USING btree ("instrument_id","date_int");--> statement-breakpoint
CREATE INDEX "market_ohlc_instrument_date_idx" ON "market_ohlc" USING btree ("instrument_id","date_int");