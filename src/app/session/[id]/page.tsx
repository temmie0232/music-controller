'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { FaPlay, FaPause, FaStepForward, FaStepBackward } from "react-icons/fa"
import { getCurrentPlayback, controlPlayback } from "@/lib/spotify"
import type { SpotifyTrack } from "@/types/session"

export default function SessionPage({ params }: { params: { id: string } }) {
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState(true)
    const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        if (!session?.accessToken) return

        const fetchCurrentPlayback = async () => {
            try {
                const playback = await getCurrentPlayback(session.accessToken!)
                if (playback && playback.item) {
                    setCurrentTrack({
                        id: playback.item.id,
                        name: playback.item.name,
                        artist: playback.item.artists[0].name,
                        album: playback.item.album.name,
                        duration: playback.item.duration_ms,
                        uri: playback.item.uri,
                        albumArt: playback.item.album.images[0]?.url
                    })
                    setIsPlaying(playback.is_playing)
                }
            } catch (error) {
                console.error('Failed to fetch playback:', error)
                toast({
                    title: "エラー",
                    description: "再生情報の取得に失敗しました",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        const interval = setInterval(fetchCurrentPlayback, 1000)
        return () => clearInterval(interval)
    }, [session?.accessToken, toast])

    const handlePlayPause = async () => {
        if (!session?.accessToken) return
        try {
            await controlPlayback(session.accessToken, isPlaying ? 'pause' : 'play')
            setIsPlaying(!isPlaying)
        } catch (error) {
            console.error('Failed to control playback:', error)
            toast({
                title: "エラー",
                description: "再生制御に失敗しました",
                variant: "destructive",
            })
        }
    }

    const handleSkip = async (direction: 'next' | 'previous') => {
        if (!session?.accessToken) return
        try {
            await controlPlayback(session.accessToken, direction)
        } catch (error) {
            console.error(`Failed to skip ${direction}:`, error)
            toast({
                title: "エラー",
                description: `${direction === 'next' ? '次の曲' : '前の曲'}へのスキップに失敗しました`,
                variant: "destructive",
            })
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center">読み込み中...</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>セッション: {params.id}</CardTitle>
                        <CardDescription>
                            {currentTrack ? '現在再生中の曲' : '再生中の曲はありません'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {currentTrack && (
                            <div className="space-y-4">
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-bold">{currentTrack.name}</h3>
                                    <p className="text-muted-foreground">
                                        {currentTrack.artist} - {currentTrack.album}
                                    </p>
                                </div>
                                <div className="flex justify-center items-center gap-4">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleSkip('previous')}
                                    >
                                        <FaStepBackward />
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="icon"
                                        onClick={handlePlayPause}
                                    >
                                        {isPlaying ? <FaPause /> : <FaPlay />}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleSkip('next')}
                                    >
                                        <FaStepForward />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}