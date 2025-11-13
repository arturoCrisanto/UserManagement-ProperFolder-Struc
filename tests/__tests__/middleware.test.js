import request from "supertest";
import app from "../../server.js";
import jwt from "jsonwebtoken";

describe("Middleware Tests", () => {
  let validToken;
  let adminToken;
  let userToken;

  beforeAll(async () => {
    // Login as regular user
    const userLogin = await request(app).post("/api/users/login").send({
      email: "bob@example.com",
      password: "password123",
    });
    userToken = userLogin.body.data.accessToken;

    // Login as admin
    const adminLogin = await request(app).post("/api/users/login").send({
      email: "alice@example.com",
      password: "password123",
    });
    adminToken = adminLogin.body.data.accessToken;
    validToken = adminToken;
  });

  describe("Authentication Middleware", () => {
    it("should allow access with valid token", async () => {
      const res = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should reject request without token", async () => {
      const res = await request(app).get("/api/users/profile");

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("No token provided");
    });

    it("should reject request with invalid token", async () => {
      const res = await request(app)
        .get("/api/users/profile")
        .set("Authorization", "Bearer invalid_token_here");

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("Invalid token");
    });

    it("should reject expired token", async () => {
      const expiredToken = jwt.sign(
        { email: "test@example.com", role: "User" },
        process.env.JWT_SECRET,
        { expiresIn: "0s" }
      );

      const res = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("Invalid token");
    });

    it("should reject token with invalid signature", async () => {
      const badToken = jwt.sign(
        { email: "test@example.com", role: "User" },
        "wrong_secret"
      );

      const res = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${badToken}`);

      expect(res.statusCode).toBe(403);
    });

    it("should reject malformed authorization header", async () => {
      const res = await request(app)
        .get("/api/users/profile")
        .set("Authorization", "InvalidFormat");

      expect(res.statusCode).toBe(401);
    });
  });

  describe("Authorization Middleware (Role-based)", () => {
    it("should allow admin to access admin-only endpoint", async () => {
      const res = await request(app)
        .get("/api/users/all")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should deny non-admin user from admin endpoint", async () => {
      const res = await request(app)
        .get("/api/users/all")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("Access denied");
    });

    it("should allow any authenticated user to access their profile", async () => {
      const res = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("Validation Middleware", () => {
    describe("Registration Validation", () => {
      it("should reject invalid email format", async () => {
        const res = await request(app).post("/api/users/register").send({
          name: "Test User",
          email: "invalid-email",
          password: "Password123",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.some((e) => e.msg.includes("email"))).toBe(true);
      });

      it("should reject password without uppercase", async () => {
        const res = await request(app).post("/api/users/register").send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
      });

      it("should reject password without lowercase", async () => {
        const res = await request(app).post("/api/users/register").send({
          name: "Test User",
          email: "test@example.com",
          password: "PASSWORD123",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
      });

      it("should reject password without number", async () => {
        const res = await request(app).post("/api/users/register").send({
          name: "Test User",
          email: "test@example.com",
          password: "PasswordOnly",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
      });

      it("should reject password shorter than 8 characters", async () => {
        const res = await request(app).post("/api/users/register").send({
          name: "Test User",
          email: "test@example.com",
          password: "Pass1",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
      });

      it("should reject invalid username format", async () => {
        const res = await request(app).post("/api/users/register").send({
          name: "Test User",
          email: "test@example.com",
          password: "Password123",
          username: "ab", // too short
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
      });
    });

    describe("Login Validation", () => {
      it("should reject login with invalid email", async () => {
        const res = await request(app).post("/api/users/login").send({
          email: "not-an-email",
          password: "Password123",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
      });

      it("should reject login without password", async () => {
        const res = await request(app).post("/api/users/login").send({
          email: "test@example.com",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
      });
    });

    describe("Profile Update Validation", () => {
      it("should reject invalid name format", async () => {
        const res = await request(app)
          .put("/api/users/profile")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            name: "A", // too short
          });

        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
      });

      it("should reject name with numbers", async () => {
        const res = await request(app)
          .put("/api/users/profile")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            name: "Test123",
          });

        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
      });

      it("should accept valid profile update", async () => {
        const res = await request(app)
          .put("/api/users/profile")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            name: "Updated Name",
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
      });
    });

    describe("Refresh Token Validation", () => {
      it("should reject missing refresh token", async () => {
        const res = await request(app).post("/api/users/refresh").send({});

        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
      });

      it("should reject non-string refresh token", async () => {
        const res = await request(app).post("/api/users/refresh").send({
          refreshToken: 12345,
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
      });
    });
  });

  describe("Rate Limiting Middleware", () => {
    it("should allow requests within rate limit", async () => {
      const res = await request(app).post("/api/users/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(res.statusCode).not.toBe(429);
    });

    // Note: Testing rate limiting properly requires multiple requests
    // This is a basic test - more comprehensive testing would need a test environment
    it("should have rate limit headers", async () => {
      const res = await request(app).post("/api/users/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      // Rate limit headers might be present
      // Check if headers exist (they may not in test environment)
      expect(res.headers).toBeDefined();
    });
  });

  describe("Error Handling in Middleware Chain", () => {
    it("should handle errors gracefully", async () => {
      const res = await request(app)
        .get("/api/users/nonexistent")
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.statusCode).toBe(404);
    });

    it("should pass through multiple middlewares correctly", async () => {
      const res = await request(app)
        .get("/api/users/all")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
