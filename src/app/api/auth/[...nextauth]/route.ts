import NextAuth from "next-auth"
import Spotify from "next-auth/providers/spotify"
import { JWT } from "next-auth/jwt"

const handler = NextAuth({
    providers: [
        Spotify({
            clientId: process.env.SPOTIFY_CLIENT_ID ?? '',
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? '',
            authorization: {
                params: {
                    scope: 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state user-read-currently-playing'
                }
            }
        }),
    ],
    callbacks: {
        async jwt({ token, account, user }) {
            if (account && user) {
                return {
                    ...token,
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    expiresAt: account.expires_at,
                }
            }
            return token
        },
        async session({ session, token }) {
            return {
                ...session,
                accessToken: token.accessToken,
                refreshToken: token.refreshToken,
                expiresAt: token.expiresAt,
            }
        },
    },
    pages: {
        signIn: '/login',
    },
})

export { handler as GET, handler as POST }