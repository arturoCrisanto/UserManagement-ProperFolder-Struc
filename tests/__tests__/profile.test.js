import request from "supertest";
import app from "../../server.js";

describe("Profile API", () => {
  let accessToken;
  let refreshToken;
  const testUser = {
    name: "Profile Test User",
    email: `profile${Date.now()}@example.com`,
    password: "Test@123",
    role: "User",
  };

  beforeAll(async () => {
    // Register and login to get token
    const registerResponse = await request(app)
      .post("/api/users/register")
      .send(testUser);

    accessToken = registerResponse.body.data.accessToken;
    refreshToken = registerResponse.body.data.refreshToken;
  });

  describe("GET /api/users/profile", () => {
    test("should get current user profile", async () => {
      const response = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.name).toBe(testUser.name);
      expect(response.body.data).not.toHaveProperty("password");
      expect(response.body.data).not.toHaveProperty("refreshTokens");
    });

    test("should fail without authentication", async () => {
      const response = await request(app).get("/api/users/profile").expect(401);

      expect(response.body.message).toBe("No token provided");
    });

    test("should fail with invalid token", async () => {
      const response = await request(app)
        .get("/api/users/profile")
        .set("Authorization", "Bearer invalid_token")
        .expect(403);

      expect(response.body.message).toBe("Invalid token");
    });
  });

  describe("PUT /api/users/profile", () => {
    test("should update user name successfully", async () => {
      const response = await request(app)
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: "Updated Name" })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Profile updated successfully");
      expect(response.body.data.name).toBe("Updated Name");
    });

    test("should update user email successfully", async () => {
      const newEmail = `updated${Date.now()}@example.com`;
      const response = await request(app)
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ email: newEmail })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(newEmail);
    });

    test("should fail with invalid email format", async () => {
      const response = await request(app)
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ email: "invalid-email" })
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    test("should fail without authentication", async () => {
      const response = await request(app)
        .put("/api/users/profile")
        .send({ name: "New Name" })
        .expect(401);

      expect(response.body.message).toBe("No token provided");
    });
  });

  afterAll(async () => {
    // Cleanup: logout user
    await request(app)
      .post("/api/users/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ refreshToken });
  });
});
