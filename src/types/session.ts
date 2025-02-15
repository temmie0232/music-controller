export interface SpotifyTrack {
    id: string;
    name: string;
    artist: string;
    album: string;
    duration: number;
    uri: string;
    albumArt?: string;
}

export interface SessionParticipant {
    id: string;
    name: string;
    isHost: boolean;
    joinedAt: string;
}

export interface MusicSession {
    id: string;
    hostId: string;
    createdAt: string;
    participants: SessionParticipant[];
    currentTrack: SpotifyTrack | null;
    queue: SpotifyTrack[];
}