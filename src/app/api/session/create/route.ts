import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { randomBytes } from 'crypto';
import dbConnect from '@/lib/mongodb';
import { Session } from '@/models/Session';

function generateSessionId(): string {
    return randomBytes(3)
        .toString('base64')
        .replace(/[+/]/g, '')
        .slice(0, 6);
}

export async function POST() {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // データベースに接続
        await dbConnect();

        // セッションIDを生成
        const sessionId = generateSessionId();

        // 有効期限を24時間後に設定
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        // セッションをデータベースに保存
        const newSession = await Session.create({
            sessionId,
            hostId: session.user.email,
            expiresAt,
            participants: [{
                id: session.user.email,
                name: session.user.name || 'Host',
                role: 'host'
            }]
        });

        return NextResponse.json({
            sessionId: newSession.sessionId,
            message: 'Session created successfully'
        });

    } catch (error) {
        console.error('Failed to create session:', error);
        return NextResponse.json(
            { error: 'Failed to create session' },
            { status: 500 }
        );
    }
}