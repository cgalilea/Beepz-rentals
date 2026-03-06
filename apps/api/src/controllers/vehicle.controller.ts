import { Request, Response } from "express";
import { z } from "zod";
import { vehicleService } from "../services/vehicle.service";

const profitShareSchema = z.object({
  participantType: z.enum(["BEEPZ", "INVESTOR"]),
  investorId: z.string().nullable().optional(),
  percentage: z.number().min(0).max(100),
});

const createSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900).max(2100),
  licensePlate: z.string().min(1),
  vin: z.string().min(1),
  profitShares: z.array(profitShareSchema).min(1),
});

const updateSchema = z.object({
  make: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  licensePlate: z.string().min(1).optional(),
  vin: z.string().min(1).optional(),
  status: z.enum(["AVAILABLE", "RENTED", "MAINTENANCE"]).optional(),
  profitShares: z.array(profitShareSchema).min(1).optional(),
});

export async function listVehicles(_req: Request, res: Response): Promise<void> {
  const vehicles = await vehicleService.list();
  res.json(vehicles);
}

export async function getVehicle(req: Request, res: Response): Promise<void> {
  const vehicle = await vehicleService.getById(req.params.id as string);
  if (!vehicle) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }
  res.json(vehicle);
}

export async function createVehicle(req: Request, res: Response): Promise<void> {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  try {
    const vehicle = await vehicleService.create(parsed.data);
    res.status(201).json(vehicle);
  } catch (err: any) {
    if (err.code === "P2002") {
      res.status(409).json({ error: "A vehicle with this license plate or VIN already exists" });
      return;
    }
    if (err.message) {
      res.status(400).json({ error: err.message });
      return;
    }
    throw err;
  }
}

export async function updateVehicle(req: Request, res: Response): Promise<void> {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  try {
    const vehicle = await vehicleService.update(req.params.id as string, parsed.data);
    res.json(vehicle);
  } catch (err: any) {
    if (err.code === "P2025") {
      res.status(404).json({ error: "Vehicle not found" });
      return;
    }
    if (err.message) {
      res.status(400).json({ error: err.message });
      return;
    }
    throw err;
  }
}

export async function deleteVehicle(req: Request, res: Response): Promise<void> {
  try {
    await vehicleService.delete(req.params.id as string);
    res.status(204).end();
  } catch (err: any) {
    if (err.code === "P2025") {
      res.status(404).json({ error: "Vehicle not found" });
      return;
    }
    throw err;
  }
}
