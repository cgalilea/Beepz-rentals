import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app";

vi.mock("../lib/prisma", () => {
  return {
    prisma: {
      vehicle: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
      vehicleProfitShare: {
        deleteMany: vi.fn(),
        createMany: vi.fn(),
      },
      user: { findUnique: vi.fn() },
      $transaction: vi.fn(),
    },
  };
});

import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken";
import { env } from "../lib/env";

const token = jwt.sign({ userId: "1", email: "admin@beepz.com", role: "ADMIN" }, env.JWT_SECRET);

const mockVehicle = {
  id: "v1",
  make: "Toyota",
  model: "Corolla",
  year: 2024,
  licensePlate: "BPZ-001",
  vin: "VIN123",
  status: "AVAILABLE",
  profitShares: [
    { id: "ps1", participantType: "BEEPZ", investorId: null, percentage: "40.00", investor: null },
    { id: "ps2", participantType: "INVESTOR", investorId: "inv1", percentage: "60.00", investor: { id: "inv1", name: "Investor A" } },
  ],
};

describe("Vehicles API", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("GET /vehicles", () => {
    it("returns 401 without auth", async () => {
      const res = await request(app).get("/vehicles");
      expect(res.status).toBe(401);
    });

    it("returns vehicles with profit shares", async () => {
      (prisma.vehicle.findMany as any).mockResolvedValue([mockVehicle]);

      const res = await request(app)
        .get("/vehicles")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].profitShares).toHaveLength(2);
    });
  });

  describe("POST /vehicles", () => {
    it("returns 400 for invalid input", async () => {
      const res = await request(app)
        .post("/vehicles")
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it("returns 400 when profit shares dont total 100", async () => {
      const res = await request(app)
        .post("/vehicles")
        .set("Authorization", `Bearer ${token}`)
        .send({
          make: "Toyota",
          model: "Corolla",
          year: 2024,
          licensePlate: "BPZ-002",
          vin: "VIN456",
          profitShares: [
            { participantType: "BEEPZ", percentage: 30 },
            { participantType: "INVESTOR", investorId: "inv1", percentage: 30 },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("100%");
    });

    it("returns 400 when missing BEEPZ share", async () => {
      const res = await request(app)
        .post("/vehicles")
        .set("Authorization", `Bearer ${token}`)
        .send({
          make: "Toyota",
          model: "Corolla",
          year: 2024,
          licensePlate: "BPZ-002",
          vin: "VIN456",
          profitShares: [
            { participantType: "INVESTOR", investorId: "inv1", percentage: 100 },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("BEEPZ");
    });

    it("returns 400 when INVESTOR has no investorId", async () => {
      const res = await request(app)
        .post("/vehicles")
        .set("Authorization", `Bearer ${token}`)
        .send({
          make: "Toyota",
          model: "Corolla",
          year: 2024,
          licensePlate: "BPZ-002",
          vin: "VIN456",
          profitShares: [
            { participantType: "BEEPZ", percentage: 50 },
            { participantType: "INVESTOR", percentage: 50 },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("investorId");
    });

    it("returns 400 when duplicate investor", async () => {
      const res = await request(app)
        .post("/vehicles")
        .set("Authorization", `Bearer ${token}`)
        .send({
          make: "Toyota",
          model: "Corolla",
          year: 2024,
          licensePlate: "BPZ-002",
          vin: "VIN456",
          profitShares: [
            { participantType: "BEEPZ", percentage: 20 },
            { participantType: "INVESTOR", investorId: "inv1", percentage: 40 },
            { participantType: "INVESTOR", investorId: "inv1", percentage: 40 },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("same investor");
    });

    it("creates vehicle with valid data", async () => {
      (prisma.vehicle.create as any).mockResolvedValue(mockVehicle);

      const res = await request(app)
        .post("/vehicles")
        .set("Authorization", `Bearer ${token}`)
        .send({
          make: "Toyota",
          model: "Corolla",
          year: 2024,
          licensePlate: "BPZ-001",
          vin: "VIN123",
          profitShares: [
            { participantType: "BEEPZ", percentage: 40 },
            { participantType: "INVESTOR", investorId: "inv1", percentage: 60 },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.profitShares).toHaveLength(2);
    });
  });
});
