import { Document } from 'mongoose';

export interface QueueItem {
    trackId: string;
    trackName: string;
    artistName: string;
    albumName: string;
    albumArt?: string;
    uri: string;
    addedBy: string;
    addedAt: Date;
    position: number;
}

export interface Participant {
    id: string;
    name: string;
    role: 'host' | 'member';
    joinedAt: Date;
}

export interface CurrentTrack {
    trackId: string;
    startedAt: Date;
    position: number;
}

export interface MusicSession extends Document {
    sessionId: string;
    hostId: string;
    createdAt: Date;
    expiresAt: Date;
    participants: Participant[];
    queue: QueueItem[];
    currentTrack?: CurrentTrack;
    isActive: boolean;
}