import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { randomBytes } from 'crypto'

// セッションIDを生成する関数
function generateSessionId(): string {
    // 3バイトのランダムな値を生成し、base64エンコード
    return randomBytes(3)
        .toString('base64')
        .replace(/[+/]/g, '') // URL安全な文字に置換
        .slice(0, 6) // 6文字に制限
}

export async function POST() {
    try {
        // ユーザーのセッションを取得
        const session = await getServerSession()

        if (!session) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        // セッションIDを生成
        const sessionId = generateSessionId()

        // TODO: セッション情報をデータベースに保存
        // 現在はメモリ内で管理（実際の実装ではデータベースを使用する）
        const sessionData = {
            id: sessionId,
            hostId: session.user?.email,
            createdAt: new Date().toISOString(),
            participants: [],
            currentTrack: null,
            queue: []
        }

        // セッション情報を返す
        return NextResponse.json({
            sessionId,
            message: 'Session created successfully'
        })

    } catch (error) {
        console.error('Failed to create session:', error)
        return NextResponse.json(
            { error: 'Failed to create session' },
            { status: 500 }
        )
    }
}