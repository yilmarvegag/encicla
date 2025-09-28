// apps/web-form/src/features/register/catalog.schemas.ts
import { z } from "zod";

// Envelope genérico
export const ApiEnvelope = z.object({
  type: z.string().optional(),
  title: z.string().optional(),
  status: z.number().optional(),
  instance: z.string().optional(),
  message: z.string().optional(),
  data: z.unknown(),
  errors: z.array(z.unknown()).optional(),
});

// Municipalities / Municipios
export const MunicipalityDto = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
});
export type Municipality = z.infer<typeof MunicipalityDto>;
export const MunicipalityList = z.array(MunicipalityDto);

// Neighborhoods / Barrios
export const NeighborhoodDto = z.object({
  id: z.number().int().positive(),
  idMunicipality: z.number().int().positive(),
  name: z.string(),
  commune: z.string(),
});
export type NeighborhoodT = z.infer<typeof NeighborhoodDto>;
export const NeighborhoodList = z.array(NeighborhoodDto);


