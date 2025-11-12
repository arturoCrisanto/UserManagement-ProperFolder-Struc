import {
  hashPassword,
  comparePassword,
  sanitizeUser,
} from "../../utils/authHelper.js";

describe("Auth Helper Functions", () => {
  describe("hashPassword", () => {
    test("should hash password successfully", async () => {
      const password = "Test@123";
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    test("should throw error for weak password", async () => {
      await expect(hashPassword("weak")).rejects.toThrow();
    });
  });

  describe("comparePassword", () => {
    test("should return true for matching passwords", async () => {
      const password = "Test@123";
      const hashedPassword = await hashPassword(password);
      const result = await comparePassword(password, hashedPassword);

      expect(result).toBe(true);
    });

    test("should return false for non-matching passwords", async () => {
      const password = "Test@123";
      const hashedPassword = await hashPassword(password);
      const result = await comparePassword("WrongPassword123!", hashedPassword);

      expect(result).toBe(false);
    });
  });

  describe("sanitizeUser", () => {
    test("should remove password and refreshTokens", () => {
      const user = {
        id: "123",
        name: "Test User",
        email: "test@example.com",
        password: "hashedpassword",
        refreshTokens: ["token1", "token2"],
        role: "User",
      };

      const sanitized = sanitizeUser(user);

      expect(sanitized).not.toHaveProperty("password");
      expect(sanitized).not.toHaveProperty("refreshTokens");
      expect(sanitized).toHaveProperty("name");
      expect(sanitized).toHaveProperty("email");
      expect(sanitized).toHaveProperty("role");
    });
  });
});
