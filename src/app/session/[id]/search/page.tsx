'use client'

import { NavigationBar } from "@/components/navigation-bar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { searchTracks, addToQueue } from "@/lib/spotify"
import { useToast } from "@/hooks/use-toast"
import { Search, Plus } from "lucide-react"
import Image from "next/image"
import { usePathname } from "next/navigation"

interface SearchResult {
    id: string
    name: string
    artist: string
    album: string
    albumArt?: string
    uri: string
}

export default function SearchPage() {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const { data: session } = useSession()
    const { toast } = useToast()
    const pathname = usePathname()
    const sessionId = pathname.split('/')[2]

    const handleSearch = async () => {
        if (!query.trim() || !session?.accessToken) return

        setIsSearching(true)
        try {
            const response = await searchTracks(session.accessToken, query)
            const tracks = response.tracks.items.map((track: any) => ({
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                albumArt: track.album.images[0]?.url,
                uri: track.uri
            }))
            setResults(tracks)
        } catch (error) {
            console.error('Search failed:', error)
            toast({
                title: "検索エラー",
                description: "曲の検索に失敗しました",
                variant: "destructive"
            })
        } finally {
            setIsSearching(false)
        }
    }

    const handleAddToQueue = async (track: SearchResult) => {
        if (!session?.accessToken) return

        try {
            await addToQueue(session.accessToken, track.uri)
            toast({
                title: "追加しました",
                description: `${track.name}をキューに追加しました`,
            })
        } catch (error) {
            console.error('Failed to add to queue:', error)
            toast({
                title: "エラー",
                description: "キューへの追加に失敗しました",
                variant: "destructive"
            })
        }
    }

    return (
        <div className="pb-16">
            <div className="fixed top-0 left-0 right-0 bg-background border-b z-10">
                <div className="max-w-lg mx-auto p-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="曲名、アーティスト名で検索"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="flex-1"
                        />
                        <Button
                            onClick={handleSearch}
                            disabled={isSearching}
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="mt-16 max-w-lg mx-auto p-4"> {/* 検索バーの高さ分のマージン */}
                <div className="space-y-4">
                    {isSearching ? (
                        <div className="text-center py-4">検索中...</div>
                    ) : results.length > 0 ? (
                        results.map((track) => (
                            <div
                                key={track.id}
                                className="flex items-center gap-3 p-2 rounded-lg border"
                            >
                                {track.albumArt && (
                                    <Image
                                        src={track.albumArt}
                                        alt={track.album}
                                        width={48}
                                        height={48}
                                        className="rounded"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{track.name}</p>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {track.artist} - {track.album}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleAddToQueue(track)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    ) : query && !isSearching ? (
                        <div className="text-center py-4 text-muted-foreground">
                            検索結果が見つかりませんでした
                        </div>
                    ) : (
                        <div className="text-center py-4 text-muted-foreground">
                            曲名やアーティスト名で検索してください
                        </div>
                    )}
                </div>
            </div>

            <NavigationBar />
        </div>
    )
}