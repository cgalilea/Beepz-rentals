import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app";

vi.mock("../lib/prisma", () => {
  return {
    prisma: {
      investor: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      user: { findUnique: vi.fn() },
    },
  };
});

import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken";
import { env } from "../lib/env";

const token = jwt.sign({ userId: "1", email: "admin@beepz.com", role: "ADMIN" }, env.JWT_SECRET);

describe("Investors API", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("GET /investors", () => {
    it("returns 401 without auth", async () => {
      const res = await request(app).get("/investors");
      expect(res.status).toBe(401);
    });

    it("returns list of investors", async () => {
      const mockInvestors = [
        { id: "1", name: "Investor A", email: "a@test.com", phone: "123", createdAt: new Date() },
      ];
      (prisma.investor.findMany as any).mockResolvedValue(mockInvestors);

      const res = await request(app)
        .get("/investors")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe("Investor A");
    });
  });

  describe("POST /investors", () => {
    it("returns 400 for invalid input", async () => {
      const res = await request(app)
        .post("/investors")
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it("creates investor with valid data", async () => {
      const mockInvestor = { id: "1", name: "New", email: "new@test.com", phone: "555" };
      (prisma.investor.create as any).mockResolvedValue(mockInvestor);

      const res = await request(app)
        .post("/investors")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "New", email: "new@test.com", phone: "555" });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("New");
    });
  });

  describe("DELETE /investors/:id", () => {
    it("returns 204 on success", async () => {
      (prisma.investor.delete as any).mockResolvedValue({});

      const res = await request(app)
        .delete("/investors/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(204);
    });

    it("returns 404 for missing investor", async () => {
      (prisma.investor.delete as any).mockRejectedValue({ code: "P2025" });

      const res = await request(app)
        .delete("/investors/999")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
