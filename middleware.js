export { default } from "next-auth/middleware"

export const config = { matcher: ["/((?!register|login|forgotPassword|api|_next/static|_next/image|images|favicon.ico|$).*)"] }
// Matcher untuk semua route kecuali halaman register, login, dan home  