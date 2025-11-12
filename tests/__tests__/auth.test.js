import request from "supertest";
import app from "../../server.js";

describe("Authentication API", () => {
  let accessToken;
  let refreshToken;
  const testUser = {
    name: "Test User",
    email: `test${Date.now()}@example.com`,
    password: "Test@123",
    role: "User",
  };

  describe("POST /api/users/register", () => {
    test("should register a new user successfully", async () => {
      const response = await request(app)
        .post("/api/users/register")
        .send(testUser)
        .expect("Content-Type", /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("User created successfully");
      expect(response.body.data).toHaveProperty("user");
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user).not.toHaveProperty("password");

      accessToken = response.body.data.accessToken;
      refreshToken = response.body.data.refreshToken;
    });

    test("should fail with duplicate email", async () => {
      const response = await request(app)
        .post("/api/users/register")
        .send(testUser)
        .expect(409); // Changed from 400 to 409 (Conflict)

      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid email", async () => {
      const response = await request(app)
        .post("/api/users/register")
        .send({
          ...testUser,
          email: "invalid-email",
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    test("should fail with weak password", async () => {
      const response = await request(app)
        .post("/api/users/register")
        .send({
          name: "Test User",
          email: "another@example.com",
          password: "123",
          role: "User",
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe("POST /api/users/login", () => {
    test("should login user successfully", async () => {
      const response = await request(app)
        .post("/api/users/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Login successful");
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");

      accessToken = response.body.data.accessToken;
      refreshToken = response.body.data.refreshToken;
    });

    test("should fail with wrong password", async () => {
      const response = await request(app)
        .post("/api/users/login")
        .send({
          email: testUser.email,
          password: "WrongPassword123!",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test("should fail with non-existent user", async () => {
      const response = await request(app)
        .post("/api/users/login")
        .send({
          email: "nonexistent@example.com",
          password: "Test@123",
        })
        .expect(401); // Changed from 404 to 401

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/users/refresh", () => {
    test("should refresh access token successfully", async () => {
      const response = await request(app)
        .post("/api/users/refresh")
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Token refreshed successfully");
      expect(response.body.data).toHaveProperty("accessToken");
    });

    test("should fail with invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/users/refresh")
        .send({ refreshToken: "invalid_token" })
        .expect(401); // Changed from 403 to 401

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/users/logout", () => {
    test("should logout user successfully", async () => {
      const response = await request(app)
        .post("/api/users/logout")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Logout successful");
    });

    test("should fail without authentication", async () => {
      const response = await request(app)
        .post("/api/users/logout")
        .send({ refreshToken })
        .expect(401);

      expect(response.body.message).toBe("No token provided");
    });
  });
});
