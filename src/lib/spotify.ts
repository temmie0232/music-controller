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

export async function searchTracks(accessToken: string, query: string) {
    try {
        const response = await fetch(
            `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
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