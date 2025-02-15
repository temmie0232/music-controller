import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import { Session } from '@/models/Session';
import type { QueueItem, SessionDocument } from '@/types/session';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        await dbConnect();
        const sessionId = params.id;
        const body = await request.json();

        const musicSession = await Session.findOne({ sessionId }) as SessionDocument | null;
        if (!musicSession) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        const queueItem: QueueItem = {
            ...body,
            addedBy: session.user.email || '',
            addedAt: new Date(),
            position: musicSession.queue.length
        };

        musicSession.queue.push(queueItem);
        await musicSession.save();

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
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        await dbConnect();
        const sessionId = params.id;

        const musicSession = await Session.findOne({ sessionId }) as SessionDocument | null;
        if (!musicSession) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            queue: musicSession.queue
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
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        await dbConnect();
        const sessionId = params.id;
        const { trackId } = await request.json();

        const musicSession = await Session.findOne({ sessionId }) as SessionDocument | null;
        if (!musicSession) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        musicSession.queue = musicSession.queue.filter((item: QueueItem) => item.trackId !== trackId);
        await musicSession.save();

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
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        await dbConnect();
        const sessionId = params.id;
        const { trackId, newPosition } = await request.json();

        const musicSession = await Session.findOne({ sessionId }) as SessionDocument | null;
        if (!musicSession) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        const track = musicSession.queue.find((item: QueueItem) => item.trackId === trackId);
        if (!track) {
            return NextResponse.json(
                { error: 'Track not found in queue' },
                { status: 404 }
            );
        }

        const oldPosition = musicSession.queue.indexOf(track);
        musicSession.queue.splice(oldPosition, 1);
        musicSession.queue.splice(newPosition, 0, track);

        await musicSession.save();

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