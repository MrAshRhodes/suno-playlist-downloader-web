/**
 * Suno.ts - Adapted for web version
 * Handles Suno API interactions through backend proxy
 */

// Base API URL - Configured to use relative path in production or explicit host in development
const API_BASE = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/api';

export enum IPlaylistClipStatus {
    None,
    Processing,
    Skipped,
    Success,
    Error
}

export interface IPlaylist {
    name: string
    image: string
}

export interface IPlaylistClip {
    id: string
    no: number
    title: string
    duration: number
    tags: string
    model_version: string
    audio_url: string
    video_url: string
    image_url: string
    image_large_url: string
    status: IPlaylistClipStatus
}

class Suno {

    static async getSongsFromPlayList(url: string): Promise<[IPlaylist, IPlaylistClip[]]> {
        
        // Extract Playlist Id
        const regex = /suno\.com\/playlist\/(.*)/
        const match = url.match(regex)
        let playlistId = ""

        if (match && match[1]) {
            playlistId = match[1]
        } else {
            throw new Error("Invalid URL or no playlist ID found")
        }

        try {
            // Use our backend proxy instead of direct API calls
            const response = await fetch(`${API_BASE}/playlist/${playlistId}/all`);
            
            if (response.status !== 200) {
                throw new Error("Failed to fetch playlist data");
            }
            
            const data = await response.json();
            
            // Return in the expected format
            return [
                data.playlist,
                data.clips
            ];
        } catch (error) {
            console.error("Error fetching playlist:", error);
            throw error;
        }
    }
}

export default Suno;