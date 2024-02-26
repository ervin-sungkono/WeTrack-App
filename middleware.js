export { default } from "next-auth/middleware"

export const config = { matcher: ["/((?!register|login|api|$).*)"] }
// Matcher untuk semua route kecuali halaman register, login, dan home  