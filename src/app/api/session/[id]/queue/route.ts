import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const sessionId = params.id;
        const body = await request.json();

        // TODO: データベースにキュー情報を保存
        // 現在はメモリ内で管理（実際の実装ではデータベースを使用する）
        console.log('Adding track to queue:', {
            sessionId,
            trackInfo: body
        });

        return NextResponse.json(
            { message: 'Track added to queue successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Failed to add track to queue:', error);
        return NextResponse.json(
            { error: 'Failed to add track to queue' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const sessionId = params.id;

        // TODO: データベースからキュー情報を取得
        // 現在はメモリ内で管理（実際の実装ではデータベースを使用する）

        return NextResponse.json({
            queue: [], // 実際の実装ではデータベースから取得したキュー情報を返す
        });
    } catch (error) {
        console.error('Failed to get queue:', error);
        return NextResponse.json(
            { error: 'Failed to get queue' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const sessionId = params.id;
        const { trackId } = await request.json();

        // TODO: データベースからキュー情報を削除
        // 現在はメモリ内で管理（実際の実装ではデータベースを使用する）
        console.log('Removing track from queue:', {
            sessionId,
            trackId
        });

        return NextResponse.json(
            { message: 'Track removed from queue successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Failed to remove track from queue:', error);
        return NextResponse.json(
            { error: 'Failed to remove track from queue' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const sessionId = params.id;
        const { trackId, newPosition } = await request.json();

        // TODO: データベース内のキューの順序を更新
        // 現在はメモリ内で管理（実際の実装ではデータベースを使用する）
        console.log('Updating track position in queue:', {
            sessionId,
            trackId,
            newPosition
        });

        return NextResponse.json(
            { message: 'Queue order updated successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Failed to update queue order:', error);
        return NextResponse.json(
            { error: 'Failed to update queue order' },
            { status: 500 }
        );
    }
}