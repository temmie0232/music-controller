import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { FaSpotify } from "react-icons/fa"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Spotify Share App</h1>
          <p className="text-xl text-gray-600">
            車内やパーティーでSpotifyの音楽を共有しよう
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>セッションを作成</CardTitle>
              <CardDescription>
                新しい音楽共有セッションを開始します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/session/create">
                <Button className="w-full">
                  <FaSpotify className="mr-2" />
                  セッションを作成
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>セッションに参加</CardTitle>
              <CardDescription>
                既存のセッションに参加します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/session/join">
                <Button className="w-full" variant="outline">
                  セッションに参加
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>※Spotifyプレミアムアカウントが必要です</p>
        </div>
      </div>
    </main>
  )
}