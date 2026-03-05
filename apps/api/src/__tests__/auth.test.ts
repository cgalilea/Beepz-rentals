import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app";

// Mock Prisma
vi.mock("../lib/prisma", () => {
  return {
    prisma: {
      user: {
        findUnique: vi.fn(),
      },
    },
  };
});

import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

describe("POST /auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid input", async () => {
    const res = await request(app).post("/auth/login").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid input");
  });

  it("returns 401 for unknown email", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "nobody@beepz.com", password: "wrong" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });

  it("returns 401 for wrong password", async () => {
    const hashed = await bcrypt.hash("correct", 10);
    (prisma.user.findUnique as any).mockResolvedValue({
      id: "1",
      email: "admin@beepz.com",
      password: hashed,
      name: "Admin",
      role: "ADMIN",
    });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "admin@beepz.com", password: "wrong" });

    expect(res.status).toBe(401);
  });

  it("returns token for valid credentials", async () => {
    const hashed = await bcrypt.hash("admin123", 10);
    (prisma.user.findUnique as any).mockResolvedValue({
      id: "1",
      email: "admin@beepz.com",
      password: hashed,
      name: "Admin",
      role: "ADMIN",
    });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "admin@beepz.com", password: "admin123" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("admin@beepz.com");
  });
});

describe("GET /auth/me", () => {
  it("returns 401 without token", async () => {
    const res = await request(app).get("/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns user data with valid token", async () => {
    // First login to get a token
    const hashed = await bcrypt.hash("admin123", 10);
    (prisma.user.findUnique as any).mockResolvedValue({
      id: "1",
      email: "admin@beepz.com",
      password: hashed,
      name: "Admin",
      role: "ADMIN",
    });

    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: "admin@beepz.com", password: "admin123" });

    const token = loginRes.body.token;

    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("admin@beepz.com");
  });
});
