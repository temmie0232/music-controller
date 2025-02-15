'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "next-auth/react"
import { FaSpotify } from "react-icons/fa"

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Spotifyでログイン</CardTitle>
                    <CardDescription>
                        音楽を共有するにはSpotifyアカウントでログインしてください
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        className="w-full"
                        onClick={() => signIn('spotify', { callbackUrl: '/session/create' })}
                    >
                        <FaSpotify className="mr-2" />
                        Spotifyでログイン
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}