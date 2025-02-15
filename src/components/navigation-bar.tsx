'use client'

import { Home, Search } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function NavigationBar() {
    const pathname = usePathname()
    const sessionId = pathname.split('/')[2] // /session/[id] から id を取得

    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t">
            <nav className="h-full max-w-lg mx-auto flex items-center justify-around">
                <Link
                    href={`/session/${sessionId}`}
                    className={cn(
                        "flex flex-col items-center justify-center w-16 h-16 text-muted-foreground",
                        pathname === `/session/${sessionId}` && "text-primary"
                    )}
                >
                    <Home className="h-6 w-6" />
                    <span className="text-xs">ホーム</span>
                </Link>
                <Link
                    href={`/session/${sessionId}/search`}
                    className={cn(
                        "flex flex-col items-center justify-center w-16 h-16 text-muted-foreground",
                        pathname === `/session/${sessionId}/search` && "text-primary"
                    )}
                >
                    <Search className="h-6 w-6" />
                    <span className="text-xs">検索</span>
                </Link>
            </nav>
        </div>
    )
}