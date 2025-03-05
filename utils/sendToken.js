// create token and save into cookie

export const sendToken = async (user, res, statusCode) => {
  const token = user.getJWTToken();
  const cookieOptions = {
    httpOnly: true, // Secure against XSS
    secure: process.env.NODE_ENV === "production", // ✅ Use secure cookies in production (HTTPS)
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // ✅ None for cross-origin in prod, Lax for local dev
    path: "/",
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
  };
  res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({ success: true, user, token });
};
