'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { FaSpotify } from "react-icons/fa"
import { QRCodeSVG } from "qrcode.react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function CreateSession() {
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const { data: session, status } = useSession()
    const router = useRouter()

    const handleCreateSession = async () => {
        if (status !== "authenticated") {
            toast({
                title: "認証が必要です",
                description: "セッションを作成するにはログインが必要です",
                variant: "destructive",
            })
            router.push("/login")
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch('/api/session/create', {
                method: 'POST',
            })

            if (!response.ok) {
                throw new Error('セッションの作成に失敗しました')
            }

            const data = await response.json()
            setSessionId(data.sessionId)
            toast({
                title: "セッションを作成しました",
                description: "セッションIDをシェアして、友達を招待しましょう",
            })
        } catch (error) {
            console.error('Failed to create session:', error)
            toast({
                title: "エラー",
                description: "セッションの作成に失敗しました。もう一度お試しください。",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleCopyLink = () => {
        if (!sessionId) return
        const link = `${window.location.origin}/session/${sessionId}`
        navigator.clipboard.writeText(link)
        toast({
            title: "リンクをコピーしました",
            description: "友達に共有してください",
        })
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
                                {isLoading ? "作成中..." : "セッションを作成"}
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
                                <div className="space-y-2">
                                    <Input
                                        value={`${window.location.origin}/session/${sessionId}`}
                                        readOnly
                                        onClick={handleCopyLink}
                                    />
                                    <Button
                                        variant="secondary"
                                        className="w-full"
                                        onClick={handleCopyLink}
                                    >
                                        リンクをコピー
                                    </Button>
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={() => {
                                        router.push(`/session/${sessionId}`)
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