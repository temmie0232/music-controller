import type { SpotifyTrack } from "@/types/spotify";

export async function addTrackToQueue(
    accessToken: string | undefined,
    sessionId: string,
    track: SpotifyTrack
) {
    if (!accessToken) {
        throw new Error('Access token is required');
    }

    try {
        // 1. まずSpotifyのキューに追加
        const spotifyResponse = await fetch(
            `https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(track.uri)}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!spotifyResponse.ok) {
            const error = await spotifyResponse.json();
            throw new Error(`Failed to add track to Spotify queue: ${error.message}`);
        }

        // 2. セッションのキューに追加
        const sessionResponse = await fetch(`/api/session/${sessionId}/queue`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                trackId: track.id,
                trackName: track.name,
                artistName: track.artists[0].name,
                albumName: track.album.name,
                albumArt: track.album.images[0]?.url,
                uri: track.uri,
                addedAt: new Date().toISOString(),
            }),
        });

        if (!sessionResponse.ok) {
            const error = await sessionResponse.json();
            throw new Error(`Failed to update session queue: ${error.message}`);
        }

        return await sessionResponse.json();
    } catch (error) {
        console.error('Error adding track to queue:', error);
        throw error;
    }
}

export async function getSessionQueue(sessionId: string) {
    try {
        const response = await fetch(`/api/session/${sessionId}/queue`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to get session queue');
        }

        return await response.json();
    } catch (error) {
        console.error('Error getting session queue:', error);
        throw error;
    }
}

export async function removeFromQueue(sessionId: string, trackId: string) {
    try {
        const response = await fetch(`/api/session/${sessionId}/queue`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ trackId }),
        });

        if (!response.ok) {
            throw new Error('Failed to remove track from queue');
        }

        return await response.json();
    } catch (error) {
        console.error('Error removing track from queue:', error);
        throw error;
    }
}

export async function reorderQueue(
    sessionId: string,
    trackId: string,
    newPosition: number
) {
    try {
        const response = await fetch(`/api/session/${sessionId}/queue`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ trackId, newPosition }),
        });

        if (!response.ok) {
            throw new Error('Failed to reorder queue');
        }

        return await response.json();
    } catch (error) {
        console.error('Error reordering queue:', error);
        throw error;
    }
}