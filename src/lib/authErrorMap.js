const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const includesAny = (value, patterns) => patterns.some((p) => value.includes(p));

export const validateEmail = (email) => EMAIL_REGEX.test(String(email || "").trim());

export function mapAuthError(rawError, context = "generic") {
  const message = String(rawError?.message || rawError || "").toLowerCase();
  const status = Number(rawError?.status || 0);

  if (includesAny(message, ["rate limit", "too many", "over_email_send_rate_limit"])) {
    return { message: "Too many requests. Try again later", code: "RATE_LIMIT" };
  }

  if (context === "login") {
    if (includesAny(message, ["invalid login credentials", "invalid credentials"])) {
      return { message: "Invalid email or password", code: "INVALID_CREDENTIALS" };
    }
    if (includesAny(message, ["email not confirmed", "email not verified"])) {
      return { message: "Please verify your email before logging in", code: "EMAIL_NOT_VERIFIED", nextAction: "resend_verification" };
    }
    if (includesAny(message, ["session expired", "refresh token"])) {
      return { message: "Your session has expired. Please log in again", code: "SESSION_EXPIRED" };
    }
    if (status >= 500) {
      return { message: "Something went wrong. Please try again", code: "SERVER_ERROR" };
    }
    return { message: "Invalid email or password", code: "LOGIN_FAILED" };
  }

  if (context === "signup") {
    if (includesAny(message, ["already registered", "user already registered", "already exists"])) {
      return { message: "An account already exists. Try logging in", code: "EMAIL_EXISTS" };
    }
    if (includesAny(message, ["password should be at least", "password is too weak", "weak password"])) {
      return { message: "Password must be at least 8 characters", code: "WEAK_PASSWORD" };
    }
    return { message: "Unable to create account. Try again", code: "SIGNUP_FAILED" };
  }

  if (context === "forgot_password") {
    return { message: "Unable to send reset link. Try again", code: "FORGOT_FAILED" };
  }

  if (context === "verify_email") {
    if (includesAny(message, ["expired", "otp expired"])) {
      return { message: "This link has expired. Request a new one", code: "EXPIRED_LINK" };
    }
    if (includesAny(message, ["token is invalid", "invalid token", "otp"])) {
      return { message: "Invalid verification link", code: "INVALID_LINK" };
    }
    if (includesAny(message, ["already been verified", "already confirmed"])) {
      return { message: "Email already verified. You can log in", code: "ALREADY_VERIFIED" };
    }
    return { message: "Invalid verification link", code: "VERIFY_FAILED" };
  }

  if (context === "reset_password") {
    if (includesAny(message, ["same password", "new password should be different"])) {
      return { message: "New password must be different", code: "SAME_PASSWORD" };
    }
    if (includesAny(message, ["expired"])) {
      return { message: "This reset link has expired", code: "EXPIRED_LINK" };
    }
    if (includesAny(message, ["invalid token", "token is invalid"])) {
      return { message: "Invalid reset link", code: "INVALID_TOKEN" };
    }
    return { message: "Unable to reset password. Try again", code: "RESET_FAILED" };
  }

  return { message: "Something went wrong. Please try again", code: "UNKNOWN" };
}
