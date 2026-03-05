import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "../lib/api";

describe("ApiClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    api.setToken(null);
  });

  it("calls health endpoint", async () => {
    const mockResponse = { status: "ok", timestamp: "2026-01-01T00:00:00Z" };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await api.healthCheck();
    expect(result.status).toBe("ok");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/health"),
      expect.any(Object)
    );
  });

  it("includes auth header when token is set", async () => {
    api.setToken("test-token");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: {} }),
    });

    await api.getMe();
    const call = (global.fetch as any).mock.calls[0];
    expect(call[1].headers.Authorization).toBe("Bearer test-token");
  });

  it("throws on error response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: "Invalid credentials" }),
    });

    await expect(api.login("bad@email.com", "wrong")).rejects.toThrow("Invalid credentials");
  });
});
