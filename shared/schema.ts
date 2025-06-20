import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const mosaicProjects = pgTable("mosaic_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageData: text("image_data").notNull(), // base64 encoded image
  settings: jsonb("settings").notNull(), // canvas size, tile size, shape, etc.
  colorPalette: jsonb("color_palette").notNull(), // array of 24 colors
  processedData: jsonb("processed_data"), // mosaic grid data
  createdAt: text("created_at").notNull(),
});

export const insertMosaicProjectSchema = createInsertSchema(mosaicProjects).omit({
  id: true,
  createdAt: true,
});

export type InsertMosaicProject = z.infer<typeof insertMosaicProjectSchema>;
export type MosaicProject = typeof mosaicProjects.$inferSelect;

// Type definitions for mosaic settings
export const MosaicSettingsSchema = z.object({
  canvasWidth: z.number().min(1).max(20),
  canvasHeight: z.number().min(1).max(20),
  tileSize: z.number().min(1).max(20),
  tileShape: z.enum(['square', 'circle', 'triangle', 'hexagon']),
  antiAliasing: z.boolean(),
  dithering: z.boolean(),
  colorMatching: z.enum(['nearest', 'perceptual', 'lab']),
});

export type MosaicSettings = z.infer<typeof MosaicSettingsSchema>;

export const ColorPaletteSchema = z.array(z.string()).length(24);
export type ColorPalette = z.infer<typeof ColorPaletteSchema>;

export const ProcessedMosaicSchema = z.object({
  grid: z.array(z.array(z.number())), // 2D array of color indices
  usedColors: z.number(),
  totalTiles: z.number(),
  gridDimensions: z.object({
    width: z.number(),
    height: z.number(),
  }),
});

export type ProcessedMosaic = z.infer<typeof ProcessedMosaicSchema>;
