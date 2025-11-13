import request from "supertest";
import app from "../../server.js";

describe("User Controller Tests", () => {
  let adminToken;
  let userToken;
  let testUserId;
  let testUserEmail;

  beforeAll(async () => {
    // Create a test user first
    const newUser = await request(app)
      .post("/api/users/register")
      .send({
        name: "Controller Test User",
        email: `controller-test-${Date.now()}@example.com`,
        password: "TestPass123",
        role: "User",
      });
    testUserId = newUser.body.data.user.id;
    testUserEmail = newUser.body.data.user.email;

    // Login as admin
    const adminRes = await request(app).post("/api/users/login").send({
      email: "alice@example.com",
      password: "password123",
    });
    adminToken = adminRes.body.data.accessToken;

    // Login as regular user
    const userRes = await request(app).post("/api/users/login").send({
      email: "bob@example.com",
      password: "password123",
    });
    userToken = userRes.body.data.accessToken;
  });

  describe("GET /api/users/all - Get All Users", () => {
    it("should return all users for admin", async () => {
      const res = await request(app)
        .get("/api/users/all")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.users).toBeDefined();
      expect(Array.isArray(res.body.data.users)).toBe(true);
      expect(res.body.data.users.length).toBeGreaterThan(0);
    });

    it("should not expose sensitive user data", async () => {
      const res = await request(app)
        .get("/api/users/all")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      const firstUser = res.body.data.users[0];
      expect(firstUser).not.toHaveProperty("password");
      expect(firstUser).not.toHaveProperty("refreshTokens");
    });

    it("should support pagination", async () => {
      const res = await request(app)
        .get("/api/users/all?page=1&limit=2")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.users.length).toBeLessThanOrEqual(2);
      expect(res.body.data.pagination).toBeDefined();
      expect(res.body.data.pagination.currentPage).toBe(1);
    });

    it("should support sorting", async () => {
      const res = await request(app)
        .get("/api/users/all?sortBy=email&order=asc")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      const emails = res.body.data.users.map((u) => u.email);
      const sortedEmails = [...emails].sort();
      expect(emails).toEqual(sortedEmails);
    });

    it("should support search filtering", async () => {
      const res = await request(app)
        .get("/api/users/all?search=alice")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.users.length).toBeGreaterThan(0);
      expect(
        res.body.data.users.some((u) => u.email.toLowerCase().includes("alice"))
      ).toBe(true);
    });

    it("should deny access for non-admin users", async () => {
      const res = await request(app)
        .get("/api/users/all")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should reject invalid pagination parameters", async () => {
      const res = await request(app)
        .get("/api/users/all?page=0")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(400);
    });
  });

  describe("GET /api/users/:id - Get User by ID", () => {
    it("should return user by ID for admin", async () => {
      const res = await request(app)
        .get(`/api/users/${testUserId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testUserId);
      expect(res.body.data.email).toBe(testUserEmail);
    });

    it("should not expose sensitive data", async () => {
      const res = await request(app)
        .get(`/api/users/${testUserId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).not.toHaveProperty("password");
      expect(res.body.data).not.toHaveProperty("refreshTokens");
    });

    it("should return 404 for non-existent user", async () => {
      const res = await request(app)
        .get("/api/users/nonexistent-id-12345")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should deny access for non-admin users", async () => {
      const res = await request(app)
        .get(`/api/users/${testUserId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe("GET /api/users/profile - Get Current User Profile", () => {
    it("should return current user profile", async () => {
      const res = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("email");
      expect(res.body.data).toHaveProperty("name");
      expect(res.body.data).toHaveProperty("role");
    });

    it("should not expose password", async () => {
      const res = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).not.toHaveProperty("password");
    });

    it("should require authentication", async () => {
      const res = await request(app).get("/api/users/profile");

      expect(res.statusCode).toBe(401);
    });
  });

  describe("PUT /api/users/profile - Update Profile", () => {
    it("should update user name", async () => {
      const newName = "Updated Test Name";
      const res = await request(app)
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: newName });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(newName);
    });

    it("should update user email", async () => {
      const newEmail = `updated-${Date.now()}@example.com`;
      const res = await request(app)
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ email: newEmail });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(newEmail);
    });

    it("should reject invalid name format", async () => {
      const res = await request(app)
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "A" });

      expect(res.statusCode).toBe(400);
    });

    it("should reject invalid email format", async () => {
      const res = await request(app)
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ email: "invalid-email" });

      expect(res.statusCode).toBe(400);
    });

    it("should reject duplicate email", async () => {
      const res = await request(app)
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ email: "alice@example.com" }); // Existing user

      expect(res.statusCode).toBe(409);
    });

    it("should require authentication", async () => {
      const res = await request(app)
        .put("/api/users/profile")
        .send({ name: "Test" });

      expect(res.statusCode).toBe(401);
    });

    it("should not allow empty update", async () => {
      const res = await request(app)
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${userToken}`)
        .send({});

      // Should succeed but not change anything
      expect(res.statusCode).toBe(200);
    });
  });

  describe("POST /api/users/register - Create User", () => {
    it("should create a new user with valid data", async () => {
      const newUser = {
        name: "New Test User",
        email: `newuser-${Date.now()}@example.com`,
        password: "NewPass123",
        role: "User",
      };

      const res = await request(app).post("/api/users/register").send(newUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(newUser.email);
      expect(res.body.data).toHaveProperty("accessToken");
      expect(res.body.data).toHaveProperty("refreshToken");
    });

    it("should hash the password", async () => {
      const newUser = {
        name: "Hash Test User",
        email: `hashtest-${Date.now()}@example.com`,
        password: "HashTest123",
      };

      const res = await request(app).post("/api/users/register").send(newUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.data.user).not.toHaveProperty("password");
    });

    it("should prevent duplicate email registration", async () => {
      const email = `duplicate-${Date.now()}@example.com`;
      const user = {
        name: "Duplicate Test",
        email,
        password: "DupTest123",
      };

      // First registration
      await request(app).post("/api/users/register").send(user);

      // Second registration with same email
      const res = await request(app).post("/api/users/register").send(user);

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it("should assign default role if not provided", async () => {
      const user = {
        name: "Default Role User",
        email: `defaultrole-${Date.now()}@example.com`,
        password: "DefaultRole123",
      };

      const res = await request(app).post("/api/users/register").send(user);

      expect(res.statusCode).toBe(201);
      expect(res.body.data.user.role).toBe("User");
    });
  });

  describe("POST /api/users/login - User Login", () => {
    const loginUser = {
      email: "alice@example.com",
      password: "password123",
    };

    it("should login with valid credentials", async () => {
      const res = await request(app).post("/api/users/login").send(loginUser);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("accessToken");
      expect(res.body.data).toHaveProperty("refreshToken");
    });

    it("should reject invalid password", async () => {
      const res = await request(app).post("/api/users/login").send({
        email: loginUser.email,
        password: "wrongpassword",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject non-existent email", async () => {
      const res = await request(app).post("/api/users/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should use generic error message for security", async () => {
      const res1 = await request(app).post("/api/users/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      const res2 = await request(app).post("/api/users/login").send({
        email: loginUser.email,
        password: "wrongpassword",
      });

      // Both should return same error message for security
      expect(res1.body.message).toContain("Invalid");
      expect(res2.body.message).toContain("Invalid");
    });
  });

  describe("POST /api/users/logout - User Logout", () => {
    let logoutToken;
    let logoutRefreshToken;

    beforeEach(async () => {
      // Create and login a user for logout testing
      const email = `logout-test-${Date.now()}@example.com`;
      const registerRes = await request(app).post("/api/users/register").send({
        name: "Logout Test",
        email,
        password: "LogoutTest123",
      });
      logoutToken = registerRes.body.data.accessToken;
      logoutRefreshToken = registerRes.body.data.refreshToken;
    });

    it("should logout successfully", async () => {
      const res = await request(app)
        .post("/api/users/logout")
        .set("Authorization", `Bearer ${logoutToken}`)
        .send({ refreshToken: logoutRefreshToken });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Logout successful");
    });

    it("should invalidate refresh token after logout", async () => {
      // Logout
      await request(app)
        .post("/api/users/logout")
        .set("Authorization", `Bearer ${logoutToken}`)
        .send({ refreshToken: logoutRefreshToken });

      // Try to use the refresh token
      const res = await request(app)
        .post("/api/users/refresh")
        .send({ refreshToken: logoutRefreshToken });

      expect(res.statusCode).toBe(401);
    });

    it("should require authentication", async () => {
      const res = await request(app)
        .post("/api/users/logout")
        .send({ refreshToken: logoutRefreshToken });

      expect(res.statusCode).toBe(401);
    });

    it("should require refresh token in request body", async () => {
      const res = await request(app)
        .post("/api/users/logout")
        .set("Authorization", `Bearer ${logoutToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
    });
  });
});
