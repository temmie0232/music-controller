import { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session extends DefaultSession {
        accessToken?: string
        refreshToken?: string
        expiresAt?: number
        user: DefaultSession["user"]
    }

    interface User extends DefaultUser {
        accessToken?: string
        refreshToken?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string
        refreshToken?: string
        expiresAt?: number
    }
}