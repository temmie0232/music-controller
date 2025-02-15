'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { FaSpotify } from "react-icons/fa"
import { QRCodeSVG } from "qrcode.react"

export default function CreateSession() {
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleCreateSession = async () => {
        setIsLoading(true)
        try {
            // TODO: Implement session creation logic
            const response = await fetch('/api/session/create', {
                method: 'POST',
            })
            const data = await response.json()
            setSessionId(data.sessionId)
        } catch (error) {
            console.error('Failed to create session:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>セッションを作成</CardTitle>
                        <CardDescription>
                            Spotifyにログインして新しいセッションを開始します
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!sessionId ? (
                            <Button
                                className="w-full"
                                onClick={handleCreateSession}
                                disabled={isLoading}
                            >
                                <FaSpotify className="mr-2" />
                                {isLoading ? "作成中..." : "Spotifyでログイン"}
                            </Button>
                        ) : (
                            <div className="space-y-4">
                                <div className="text-center">
                                    <p className="text-lg font-semibold">セッションID:</p>
                                    <p className="text-2xl font-bold">{sessionId}</p>
                                </div>
                                <div className="flex justify-center">
                                    <QRCodeSVG
                                        value={`${window.location.origin}/session/${sessionId}`}
                                        size={200}
                                    />
                                </div>
                                <Input
                                    value={`${window.location.origin}/session/${sessionId}`}
                                    readOnly
                                    onClick={(e) => e.currentTarget.select()}
                                />
                                <Button
                                    className="w-full"
                                    onClick={() => {
                                        window.location.href = `/session/${sessionId}`
                                    }}
                                >
                                    セッションを開始
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}