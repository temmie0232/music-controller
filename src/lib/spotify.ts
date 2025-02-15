import { SpotifyTrack } from "@/types/spotify";

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

interface SpotifyError extends Error {
    status?: number;
}

export async function getCurrentPlayback(accessToken: string) {
    try {
        const response = await fetch(`${SPOTIFY_API_BASE}/me/player`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })

        if (!response.ok) {
            const error = new Error('Failed to get current playback') as SpotifyError;
            error.status = response.status;
            throw error;
        }

        return response.json()
    } catch (error) {
        console.error('Error getting current playback:', error);
        throw error;
    }
}

export async function controlPlayback(
    accessToken: string,
    action: 'play' | 'pause' | 'next' | 'previous'
) {
    try {
        const endpoint = action === 'next' ? 'next' :
            action === 'previous' ? 'previous' :
                action;

        const method = action === 'play' || action === 'pause' ? 'PUT' : 'POST';
        const url = `${SPOTIFY_API_BASE}/me/player/${endpoint}`;

        const response = await fetch(url, {
            method,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const error = new Error(`Failed to ${action}`) as SpotifyError;
            error.status = response.status;
            throw error;
        }
    } catch (error) {
        console.error(`Error controlling playback (${action}):`, error);
        throw error;
    }
}

export async function searchTracks(accessToken: string, query: string, offset: number = 0, limit: number = 20) {
    try {
        const response = await fetch(
            `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&offset=${offset}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            const error = new Error('Failed to search tracks') as SpotifyError;
            error.status = response.status;
            throw error;
        }

        return response.json();
    } catch (error) {
        console.error('Error searching tracks:', error);
        throw error;
    }
}

export async function addToQueue(accessToken: string, trackUri: string) {
    try {
        const response = await fetch(
            `${SPOTIFY_API_BASE}/me/player/queue?uri=${encodeURIComponent(trackUri)}`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            const error = new Error('Failed to add track to queue') as SpotifyError;
            error.status = response.status;
            throw error;
        }
    } catch (error) {
        console.error('Error adding track to queue:', error);
        throw error;
    }
}

export async function addTrackToSession(
    accessToken: string,
    sessionId: string,
    track: SpotifyTrack
) {
    try {
        // 1. Spotifyのキューに追加
        await addToQueue(accessToken, track.uri);

        // 2. セッションのキューに追加（実際のアプリではここでデータベースに保存）
        const sessionData = {
            trackId: track.id,
            trackName: track.name,
            artistName: track.artists[0].name,
            albumName: track.album.name,
            addedAt: new Date().toISOString(),
        };

        // 3. セッション情報を更新（実際のアプリではAPI経由で更新）
        const response = await fetch(`/api/session/${sessionId}/queue`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sessionData),
        });

        if (!response.ok) {
            throw new Error('Failed to update session queue');
        }

        return await response.json();
    } catch (error) {
        console.error('Error adding track to session:', error);
        throw error;
    }
}

// セッション更新のためのトークンリフレッシュ関数
export async function refreshAccessToken(refreshToken: string) {
    try {
        const basic = Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64');

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                Authorization: `Basic ${basic}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            }),
        });

        if (!response.ok) {
            const error = new Error('Failed to refresh access token') as SpotifyError;
            error.status = response.status;
            throw error;
        }

        const data = await response.json();
        return {
            accessToken: data.access_token,
            expiresAt: Math.floor(Date.now() / 1000 + data.expires_in),
        };
    } catch (error) {
        console.error('Error refreshing access token:', error);
        throw error;
    }
}