'use client'

import { NavigationBar } from "@/components/navigation-bar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { searchTracks } from "@/lib/spotify"
import { addTrackToQueue } from "@/lib/queue-handler"
import { useToast } from "@/hooks/use-toast"
import { Search, Plus, Loader2 } from "lucide-react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import type { SpotifyTrack, SpotifySearchResponse } from "@/types/spotify"

interface SearchState {
    results: SpotifyTrack[];
    offset: number;
    hasMore: boolean;
    total: number;
}

export default function SearchPage() {
    const [query, setQuery] = useState("")
    const [searchState, setSearchState] = useState<SearchState>({
        results: [],
        offset: 0,
        hasMore: false,
        total: 0
    })
    const [isSearching, setIsSearching] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [addingTrack, setAddingTrack] = useState<string | null>(null)
    const { data: session } = useSession()
    const { toast } = useToast()
    const pathname = usePathname()
    const sessionId = pathname.split('/')[2]

    const handleSearch = async (newSearch: boolean = true) => {
        if (!query.trim() || !session?.accessToken) return

        const searchingState = newSearch ? setIsSearching : setIsLoadingMore
        searchingState(true)

        try {
            const offset = newSearch ? 0 : searchState.offset
            const response = await searchTracks(session.accessToken, query, offset) as SpotifySearchResponse

            const newResults = response.tracks.items
            setSearchState(prev => ({
                results: newSearch ? newResults : [...prev.results, ...newResults],
                offset: offset + newResults.length,
                hasMore: response.tracks.total > (offset + newResults.length),
                total: response.tracks.total
            }))
        } catch (error) {
            console.error('Search failed:', error)
            toast({
                title: "検索エラー",
                description: "曲の検索に失敗しました",
                variant: "destructive"
            })
        } finally {
            searchingState(false)
        }
    }

    const handleLoadMore = () => {
        handleSearch(false)
    }

    const handleAddToQueue = async (track: SpotifyTrack) => {
        if (!session?.accessToken) {
            toast({
                title: "エラー",
                description: "ログインが必要です",
                variant: "destructive"
            })
            return
        }

        setAddingTrack(track.id)
        try {
            await addTrackToQueue(session.accessToken, sessionId, track)
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
        } finally {
            setAddingTrack(null)
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
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch(true)}
                            className="flex-1"
                        />
                        <Button
                            onClick={() => handleSearch(true)}
                            disabled={isSearching}
                        >
                            {isSearching ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Search className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="mt-16 max-w-lg mx-auto p-4">
                <div className="space-y-4">
                    {searchState.results.length > 0 && (
                        <div className="text-sm text-muted-foreground text-center">
                            {searchState.total}件中{searchState.results.length}件を表示
                        </div>
                    )}

                    {isSearching ? (
                        <div className="text-center py-4">検索中...</div>
                    ) : searchState.results.length > 0 ? (
                        <>
                            <div className="space-y-2">
                                {searchState.results.map((track) => (
                                    <div
                                        key={`${track.id}-${track.uri}`}
                                        className="flex items-center gap-3 p-2 rounded-lg border"
                                    >
                                        {track.album.images[0] && (
                                            <Image
                                                src={track.album.images[0].url}
                                                alt={track.album.name}
                                                width={48}
                                                height={48}
                                                className="rounded"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{track.name}</p>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {track.artists[0].name} - {track.album.name}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleAddToQueue(track)}
                                            disabled={addingTrack === track.id}
                                        >
                                            {addingTrack === track.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Plus className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {searchState.hasMore && (
                                <div className="pt-4">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleLoadMore}
                                        disabled={isLoadingMore}
                                    >
                                        {isLoadingMore ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                読み込み中...
                                            </>
                                        ) : (
                                            'もっと表示'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </>
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