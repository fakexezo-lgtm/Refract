const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const includesAny = (value, patterns) => patterns.some((p) => value.includes(p));

export const validateEmail = (email) => EMAIL_REGEX.test(String(email || "").trim());

export function mapAuthError(rawError, context = "generic") {
  const message = String(rawError?.message || rawError?.msg || rawError || "").toLowerCase();
  const status = Number(rawError?.status || rawError?.code || 0);

  // Log full error details in dev for easier debugging
  try { if (import.meta?.env?.DEV) console.warn("[AuthError]", { context, status, message, raw: rawError }); } catch (_) {}

  // --- Rate limiting ---
  if (includesAny(message, ["rate limit", "too many", "over_email_send_rate_limit", "email rate limit"])) {
    return { message: "Too many requests. Please wait a few minutes and try again", code: "RATE_LIMIT" };
  }

  // --- Login context ---
  if (context === "login") {
    if (includesAny(message, ["invalid login credentials", "invalid credentials", "invalid email or password"])) {
      return { message: "Invalid email or password", code: "INVALID_CREDENTIALS" };
    }
    if (includesAny(message, ["email not confirmed", "email not verified"])) {
      return { message: "Please verify your email before logging in", code: "EMAIL_NOT_VERIFIED", nextAction: "resend_verification" };
    }
    if (includesAny(message, ["session expired", "refresh token"])) {
      return { message: "Your session has expired. Please log in again", code: "SESSION_EXPIRED" };
    }
    if (status >= 500) {
      return { message: "Something went wrong on our end. Please try again", code: "SERVER_ERROR" };
    }
    return { message: "Invalid email or password", code: "LOGIN_FAILED" };
  }

  // --- Signup context ---
  if (context === "signup") {
    if (includesAny(message, ["already registered", "user already registered", "already exists", "user_already_exists"])) {
      return { message: "An account with this email already exists. Try logging in", code: "EMAIL_EXISTS" };
    }
    if (includesAny(message, ["password should be at least", "password is too weak", "weak password", "password should be"])) {
      return { message: "Password must be at least 6 characters", code: "WEAK_PASSWORD" };
    }
    if (includesAny(message, ["unable to validate email", "invalid email", "email address is invalid", "email_address_invalid"])) {
      return { message: "Please enter a valid email address", code: "INVALID_EMAIL" };
    }
    if (includesAny(message, ["signup is disabled", "signups not allowed", "signup disabled"])) {
      return { message: "New registrations are currently disabled", code: "SIGNUP_DISABLED" };
    }
    if (includesAny(message, ["email link", "confirmation", "smtp", "email"])) {
      return { message: "Account created! Check your email for a verification code", code: "EMAIL_SENT" };
    }
    if (status >= 500) {
      return { message: "Server error during signup. Please try again in a moment", code: "SERVER_ERROR" };
    }
    return { message: "Unable to create account. Try again", code: "SIGNUP_FAILED" };
  }

  // --- Forgot password context ---
  if (context === "forgot_password") {
    if (includesAny(message, ["user not found", "email not found"])) {
      // Don't reveal if email exists for security
      return { message: "If this email exists, a reset link has been sent", code: "RESET_SENT" };
    }
    return { message: "Unable to send reset link. Try again", code: "FORGOT_FAILED" };
  }

  // --- Email verification context ---
  if (context === "verify_email") {
    // Supabase returns 'Token has expired or is invalid' for BOTH wrong and expired codes
    const errorCode = rawError?.error_code || rawError?.code || '';
    if (errorCode === 'otp_expired' || (includesAny(message, ["expired"]) && !includesAny(message, ["invalid"]))) {
      return { message: "This code has expired. Click \"Resend code\" to get a new one", code: "EXPIRED_CODE" };
    }
    if (includesAny(message, ["expired", "invalid", "token", "otp"])) {
      return { message: "Incorrect or expired code. Double-check the code in your email and try again", code: "INVALID_CODE" };
    }
    if (includesAny(message, ["already been verified", "already confirmed", "email already confirmed"])) {
      return { message: "Email already verified. You can log in", code: "ALREADY_VERIFIED" };
    }
    return { message: "Invalid verification code. Please try again", code: "VERIFY_FAILED" };
  }

  // --- Password reset context ---
  if (context === "reset_password") {
    if (includesAny(message, ["same password", "new password should be different"])) {
      return { message: "New password must be different from your current one", code: "SAME_PASSWORD" };
    }
    if (includesAny(message, ["expired"])) {
      return { message: "This reset link has expired. Request a new one", code: "EXPIRED_LINK" };
    }
    if (includesAny(message, ["invalid token", "token is invalid"])) {
      return { message: "Invalid or already-used reset link", code: "INVALID_TOKEN" };
    }
    return { message: "Unable to reset password. Try again", code: "RESET_FAILED" };
  }

  return { message: "Something went wrong. Please try again", code: "UNKNOWN" };
}
