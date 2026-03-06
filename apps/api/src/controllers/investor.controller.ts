import { Request, Response } from "express";
import { z } from "zod";
import { investorService } from "../services/investor.service";

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
});

export async function listInvestors(_req: Request, res: Response): Promise<void> {
  const investors = await investorService.list();
  res.json(investors);
}

export async function getInvestor(req: Request, res: Response): Promise<void> {
  const investor = await investorService.getById(req.params.id as string);
  if (!investor) {
    res.status(404).json({ error: "Investor not found" });
    return;
  }
  res.json(investor);
}

export async function createInvestor(req: Request, res: Response): Promise<void> {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  try {
    const investor = await investorService.create(parsed.data);
    res.status(201).json(investor);
  } catch (err: any) {
    if (err.code === "P2002") {
      res.status(409).json({ error: "An investor with this email already exists" });
      return;
    }
    throw err;
  }
}

export async function updateInvestor(req: Request, res: Response): Promise<void> {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  try {
    const investor = await investorService.update(req.params.id as string, parsed.data);
    res.json(investor);
  } catch (err: any) {
    if (err.code === "P2025") {
      res.status(404).json({ error: "Investor not found" });
      return;
    }
    if (err.code === "P2002") {
      res.status(409).json({ error: "An investor with this email already exists" });
      return;
    }
    throw err;
  }
}

export async function deleteInvestor(req: Request, res: Response): Promise<void> {
  try {
    await investorService.delete(req.params.id as string);
    res.status(204).end();
  } catch (err: any) {
    if (err.code === "P2025") {
      res.status(404).json({ error: "Investor not found" });
      return;
    }
    throw err;
  }
}
