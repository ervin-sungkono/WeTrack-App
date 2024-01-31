export { default } from "next-auth/middleware"

export const config = { matcher: [/*"/((?!register|login).*)"*/] }

// NOTE: jangan uncomment matcher kecuali fitur login register sudah jadi sepenuhnya