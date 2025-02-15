export interface SpotifyImage {
    url: string;
    height: number;
    width: number;
}

export interface SpotifyArtist {
    id: string;
    name: string;
    uri: string;
}

export interface SpotifyAlbum {
    id: string;
    name: string;
    images: SpotifyImage[];
    uri: string;
}

export interface SpotifyTrack {
    id: string;
    name: string;
    uri: string;
    duration_ms: number;
    artists: SpotifyArtist[];
    album: SpotifyAlbum;
    is_playable: boolean;
}

export interface SpotifySearchResponse {
    tracks: {
        items: SpotifyTrack[];
        total: number;
        limit: number;
        offset: number;
        next: string | null;
        previous: string | null;
    };
}

export interface SpotifyPlaybackState {
    device: {
        id: string;
        is_active: boolean;
        is_private_session: boolean;
        is_restricted: boolean;
        name: string;
        type: string;
        volume_percent: number;
    };
    repeat_state: 'off' | 'track' | 'context';
    shuffle_state: boolean;
    is_playing: boolean;
    item: SpotifyTrack | null;
    progress_ms: number | null;
    timestamp: number;
    context: {
        type: string;
        href: string;
        external_urls: {
            spotify: string;
        };
        uri: string;
    } | null;
}

export interface SpotifyQueueResponse {
    currently_playing: SpotifyTrack | null;
    queue: SpotifyTrack[];
}

export interface SpotifyError {
    status: number;
    message: string;
}

// Spotifyのスコープ定義
export const SPOTIFY_SCOPES = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-modify-private'
] as const;

export type SpotifyScope = typeof SPOTIFY_SCOPES[number];