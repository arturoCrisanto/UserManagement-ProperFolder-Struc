import {
  isValidEmail,
  isValidPassword,
  sanitizeString,
  validateUsername,
} from "../../utils/validationHelper.js";

describe("Validation Helper Tests", () => {
  describe("isValidEmail", () => {
    it("should validate correct email", () => {
      const result = isValidEmail("test@example.com");
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe("test@example.com");
      expect(result.error).toBeNull();
    });

    it("should reject invalid email format", () => {
      const result = isValidEmail("invalid-email");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Invalid email format");
    });

    it("should reject null email", () => {
      const result = isValidEmail(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Email is required");
    });

    it("should reject undefined email", () => {
      const result = isValidEmail(undefined);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Email is required");
    });

    it("should reject non-string email", () => {
      const result = isValidEmail(12345);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Email is required");
    });

    it("should trim whitespace from email", () => {
      const result = isValidEmail("  test@example.com  ");
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe("test@example.com");
    });

    it("should normalize email", () => {
      const result = isValidEmail("Test@Example.COM");
      expect(result.isValid).toBe(true);
      expect(result.sanitized.toLowerCase()).toBe("test@example.com");
    });

    it("should reject email without @", () => {
      const result = isValidEmail("testexample.com");
      expect(result.isValid).toBe(false);
    });

    it("should reject email without domain", () => {
      const result = isValidEmail("test@");
      expect(result.isValid).toBe(false);
    });

    it("should reject email with multiple @", () => {
      const result = isValidEmail("test@@example.com");
      expect(result.isValid).toBe(false);
    });
  });

  describe("isValidPassword", () => {
    it("should validate correct password", () => {
      const result = isValidPassword("Password123");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it("should reject null password", () => {
      const result = isValidPassword(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Password is required");
    });

    it("should reject undefined password", () => {
      const result = isValidPassword(undefined);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Password is required");
    });

    it("should reject non-string password", () => {
      const result = isValidPassword(12345678);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Password is required");
    });

    it("should reject password shorter than 8 characters", () => {
      const result = isValidPassword("Pass1");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("8 characters");
    });

    it("should reject password without uppercase letter", () => {
      const result = isValidPassword("password123");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("uppercase");
    });

    it("should reject password without lowercase letter", () => {
      const result = isValidPassword("PASSWORD123");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("lowercase");
    });

    it("should reject password without number", () => {
      const result = isValidPassword("PasswordOnly");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("number");
    });

    it("should accept password without special character", () => {
      const result = isValidPassword("Password123");
      expect(result.isValid).toBe(true);
    });

    it("should accept password with special character", () => {
      const result = isValidPassword("Password@123");
      expect(result.isValid).toBe(true);
    });

    it("should accept exactly 8 characters if valid", () => {
      const result = isValidPassword("Pass1234");
      expect(result.isValid).toBe(true);
    });

    it("should accept long password", () => {
      const result = isValidPassword("VeryLongPassword123WithManyCharacters");
      expect(result.isValid).toBe(true);
    });

    it("should reject empty string", () => {
      const result = isValidPassword("");
      expect(result.isValid).toBe(false);
    });

    it("should reject whitespace-only password", () => {
      const result = isValidPassword("        ");
      expect(result.isValid).toBe(false);
    });
  });

  describe("sanitizeString", () => {
    it("should sanitize normal string", () => {
      const result = sanitizeString("Hello World");
      expect(result).toBe("Hello World");
    });

    it("should escape HTML tags", () => {
      const result = sanitizeString('<script>alert("xss")</script>');
      expect(result).not.toContain("<script>");
      expect(result).toContain("&lt;");
      expect(result).toContain("&gt;");
    });

    it("should escape HTML entities", () => {
      const result = sanitizeString('<div>Test & "quotes"</div>');
      expect(result).toContain("&lt;");
      expect(result).toContain("&gt;");
      expect(result).toContain("&amp;");
      expect(result).toContain("&quot;");
    });

    it("should trim whitespace", () => {
      const result = sanitizeString("  Test String  ");
      expect(result).toBe("Test String");
    });

    it("should return empty string for null", () => {
      const result = sanitizeString(null);
      expect(result).toBe("");
    });

    it("should return empty string for undefined", () => {
      const result = sanitizeString(undefined);
      expect(result).toBe("");
    });

    it("should return empty string for non-string", () => {
      const result = sanitizeString(12345);
      expect(result).toBe("");
    });

    it("should handle empty string", () => {
      const result = sanitizeString("");
      expect(result).toBe("");
    });

    it("should escape single quotes", () => {
      const result = sanitizeString("It's a test");
      expect(result).toContain("&#x27;");
    });

    it("should handle special characters", () => {
      const result = sanitizeString("Test & < > \" ' /");
      expect(result).not.toContain("<");
      expect(result).not.toContain(">");
      expect(result).toContain("&amp;");
    });
  });

  describe("validateUsername", () => {
    it("should validate correct username", () => {
      const result = validateUsername("john_doe");
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe("john_doe");
      expect(result.error).toBeNull();
    });

    it("should accept username with hyphens", () => {
      const result = validateUsername("john-doe");
      expect(result.isValid).toBe(true);
    });

    it("should accept username with underscores", () => {
      const result = validateUsername("john_doe_123");
      expect(result.isValid).toBe(true);
    });

    it("should accept alphanumeric username", () => {
      const result = validateUsername("johndoe123");
      expect(result.isValid).toBe(true);
    });

    it("should reject null username", () => {
      const result = validateUsername(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Username is required");
    });

    it("should reject undefined username", () => {
      const result = validateUsername(undefined);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Username is required");
    });

    it("should reject non-string username", () => {
      const result = validateUsername(12345);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Username is required");
    });

    it("should reject username shorter than 3 characters", () => {
      const result = validateUsername("ab");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("3 and 30 characters");
    });

    it("should reject username longer than 30 characters", () => {
      const result = validateUsername("a".repeat(31));
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("3 and 30 characters");
    });

    it("should accept exactly 3 characters", () => {
      const result = validateUsername("abc");
      expect(result.isValid).toBe(true);
    });

    it("should accept exactly 30 characters", () => {
      const result = validateUsername("a".repeat(30));
      expect(result.isValid).toBe(true);
    });

    it("should reject username with special characters", () => {
      const result = validateUsername("john@doe");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain(
        "letters, numbers, hyphens, and underscores"
      );
    });

    it("should reject username with spaces", () => {
      const result = validateUsername("john doe");
      expect(result.isValid).toBe(false);
    });

    it("should trim whitespace", () => {
      const result = validateUsername("  johndoe  ");
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe("johndoe");
    });

    it("should reject empty string after trimming", () => {
      const result = validateUsername("   ");
      expect(result.isValid).toBe(false);
    });
  });
});
