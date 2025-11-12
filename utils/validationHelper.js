import validator from "validator";

export const isValidEmail = (email) => {
  if (!email || typeof email !== "string") {
    return { isValid: false, sanitized: "", error: "Email is required" };
  }

  const sanitized = validator.trim(email);

  if (!validator.isEmail(sanitized)) {
    return { isValid: false, sanitized, error: "Invalid email format" };
  }

  return {
    isValid: true,
    sanitized: validator.normalizeEmail(sanitized),
    error: null,
  };
};

export const isValidPassword = (password) => {
  if (!password || typeof password !== "string") {
    return { isValid: false, error: "Password is required" };
  }
  if (password.length < 8) {
    return {
      isValid: false,
      error: "Password must be at least 8 characters long",
    };
  }

  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
    })
  ) {
    return {
      isValid: false,
      error:
        "Password must contain uppercase, lowercase, number, and special character",
    };
  }
  return { isValid: true, error: null };
};

export const sanitizeString = (input) => {
  if (!input || typeof input !== "string") return "";
  return validator.escape(validator.trim(input));
};

export const validateUsername = (username) => {
  if (!username || typeof username !== "string") {
    return { isValid: false, sanitized: "", error: "Username is required" };
  }

  const sanitized = validator.trim(username);

  if (!validator.isLength(sanitized, { min: 3, max: 30 })) {
    return {
      isValid: false,
      sanitized,
      error: "Username must be between 3 and 30 characters",
    };
  }

  if (!validator.isAlphanumeric(sanitized, "en-US", { ignore: "_-" })) {
    return {
      isValid: false,
      sanitized,
      error:
        "Username can only contain letters, numbers, hyphens, and underscores",
    };
  }

  return { isValid: true, sanitized, error: null };
};
