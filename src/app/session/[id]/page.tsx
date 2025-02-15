'use client'

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { useEffect, useState, useRef } from "react"
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaArrowUp, FaArrowDown, FaTrash } from "react-icons/fa"
import { getCurrentPlayback, controlPlayback } from "@/lib/spotify"
import { getSessionQueue, removeFromQueue, reorderQueue } from "@/lib/queue-handler"
import type { QueueItem } from "@/types/session"
import type { SpotifyTrack } from "@/types/spotify"
import { NavigationBar } from "@/components/navigation-bar"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface CurrentTrackState {
    id: string;
    name: string;
    artist: string;
    album: string;
    duration: number;
    uri: string;
    albumArt?: string;
}

export default function SessionPage({ params }: { params: { id: string } }) {
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState(true)
    const [currentTrack, setCurrentTrack] = useState<CurrentTrackState | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [queue, setQueue] = useState<QueueItem[]>([])
    const [nowPlayingId, setNowPlayingId] = useState<string | null>(null)
    const previousTrackIdRef = useRef<string | null>(null)
    const { toast } = useToast()

    // キューをソートする関数
    const sortedQueue = () => {
        return [...queue].sort((a, b) => {
            if (a.trackId === nowPlayingId) return -1;
            if (b.trackId === nowPlayingId) return 1;
            return 0;
        });
    };

    // 次に再生される曲かどうかを判定する関数
    const isNextToPlay = (trackId: string) => {
        const sortedTracks = sortedQueue();
        const trackIndex = sortedTracks.findIndex(t => t.trackId === trackId);
        // 再生中の曲がない場合は最上部の曲、ある場合は2番目の曲が次に再生される
        return nowPlayingId ? trackIndex === 1 : trackIndex === 0;
    };

    // 再生状態の取得
    useEffect(() => {
        if (!session?.accessToken) return

        const fetchCurrentPlayback = async () => {
            try {
                const playback = await getCurrentPlayback(session.accessToken)
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
                    setProgress(playback.progress_ms || 0)
                    setNowPlayingId(playback.item.id)

                    // 曲が変わったことを検知して、前の曲をキューから削除
                    if (previousTrackIdRef.current && previousTrackIdRef.current !== playback.item.id) {
                        const prevTrack = queue.find(track => track.trackId === previousTrackIdRef.current);
                        if (prevTrack) {
                            handleRemoveFromQueue(prevTrack.trackId);
                        }
                    }
                    previousTrackIdRef.current = playback.item.id;
                }
            } catch (error) {
                console.error('Failed to fetch playback:', error)
                toast({
                    title: "エラー",
                    description: "再生状態の取得に失敗しました",
                    variant: "destructive"
                })
            } finally {
                setIsLoading(false)
            }
        }

        const interval = setInterval(fetchCurrentPlayback, 1000)
        return () => clearInterval(interval)
    }, [session?.accessToken, toast, queue])

    // キューの取得
    useEffect(() => {
        if (!session?.accessToken) return

        const fetchQueue = async () => {
            try {
                const data = await getSessionQueue(params.id)
                setQueue(data.queue)
            } catch (error) {
                console.error('Failed to fetch queue:', error)
                toast({
                    title: "エラー",
                    description: "キューの取得に失敗しました",
                    variant: "destructive"
                })
            }
        }

        fetchQueue()
        // WebSocketなどでリアルタイム更新を実装する場合はここに追加
    }, [session?.accessToken, params.id, toast])

    // 再生コントロール関数
    const handlePlayPause = async () => {
        if (!session?.accessToken) return
        try {
            await controlPlayback(session.accessToken, isPlaying ? 'pause' : 'play')
            setIsPlaying(!isPlaying)
        } catch (error) {
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
            toast({
                title: "エラー",
                description: `${direction === 'next' ? '次の曲' : '前の曲'}へのスキップに失敗しました`,
                variant: "destructive",
            })
        }
    }

    // キュー操作関数
    const handleRemoveFromQueue = async (trackId: string) => {
        try {
            await removeFromQueue(params.id, trackId)
            setQueue(prev => prev.filter(item => item.trackId !== trackId))
            toast({
                title: "削除しました",
                description: "曲をキューから削除しました",
            })
        } catch (error) {
            toast({
                title: "エラー",
                description: "キューからの削除に失敗しました",
                variant: "destructive"
            })
        }
    }

    const handleMoveInQueue = async (trackId: string, direction: 'up' | 'down') => {
        const currentIndex = queue.findIndex(item => item.trackId === trackId)
        if (
            (direction === 'up' && currentIndex <= 0) ||
            (direction === 'down' && currentIndex >= queue.length - 1)
        ) {
            return
        }

        const newPosition = direction === 'up' ? currentIndex - 1 : currentIndex + 1

        try {
            await reorderQueue(params.id, trackId, newPosition)
            setQueue(prev => {
                const newQueue = [...prev]
                const item = newQueue[currentIndex]
                newQueue.splice(currentIndex, 1)
                newQueue.splice(newPosition, 0, item)
                return newQueue
            })
        } catch (error) {
            toast({
                title: "エラー",
                description: "キューの並び替えに失敗しました",
                variant: "destructive"
            })
        }
    }

    // 時間のフォーマット関数
    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000)
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">読み込み中...</div>
    }

    return (
        <div className="pb-16">
            {/* 現在再生中の曲 */}
            <div className="fixed top-0 left-0 right-0 bg-background border-b z-20">
                <div className="max-w-lg mx-auto p-4">
                    {currentTrack && (
                        <div className="space-y-4">
                            {/* アルバムアート */}
                            <div className="relative w-48 h-48 mx-auto">
                                {currentTrack.albumArt && (
                                    <Image
                                        src={currentTrack.albumArt}
                                        alt={currentTrack.album}
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                )}
                            </div>
                            {/* 曲情報 */}
                            <div className="text-center space-y-1">
                                <h3 className="font-bold">{currentTrack.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {currentTrack.artist} - {currentTrack.album}
                                </p>
                            </div>
                            {/* シークバー */}
                            <div className="space-y-2">
                                <Slider
                                    value={[progress]}
                                    max={currentTrack.duration}
                                    step={1000}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>{formatTime(progress)}</span>
                                    <span>{formatTime(currentTrack.duration)}</span>
                                </div>
                            </div>
                            {/* コントロール */}
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
                </div>
            </div>

            {/* キュー */}
            <div className="mt-[440px] max-w-lg mx-auto p-4">
                <h2 className="text-lg font-semibold mb-4">次に再生</h2>
                <div className="space-y-2">
                    {sortedQueue().map((track) => (
                        <div
                            key={`${track.trackId}-${track.uri}`}
                            className={cn(
                                "flex items-center gap-3 p-2 rounded-lg border transition-colors relative",
                                track.trackId === nowPlayingId && "border-green-500 bg-green-50 dark:bg-green-950"
                            )}
                        >
                            {track.albumArt && (
                                <Image
                                    src={track.albumArt}
                                    alt={track.albumName}
                                    width={48}
                                    height={48}
                                    className="rounded"
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{track.trackName}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                    {track.artistName}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 relative z-10">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleMoveInQueue(track.trackId, 'up')}
                                    disabled={track.trackId === nowPlayingId ||
                                        isNextToPlay(track.trackId) ||
                                        queue.indexOf(track) === 0}
                                    className="bg-background"
                                >
                                    <FaArrowUp className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleMoveInQueue(track.trackId, 'down')}
                                    disabled={track.trackId === nowPlayingId ||
                                        queue.indexOf(track) === queue.length - 1}
                                    className="bg-background"
                                >
                                    <FaArrowDown className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveFromQueue(track.trackId)}
                                    disabled={track.trackId === nowPlayingId}
                                    className="bg-background"
                                >
                                    <FaTrash className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <NavigationBar />
        </div>
    )
}