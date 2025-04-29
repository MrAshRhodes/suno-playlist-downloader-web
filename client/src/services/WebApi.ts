/**
 * WebApi.ts - Replacement for RustFunctions.ts
 * Handles communication with the Express backend
 */

// Base API URL - Configured to use relative path in production or explicit host in development
const API_BASE = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/api';

/**
 * Adds an image to an MP3 file (handled by server)
 * @param mp3Path MP3 file identifier
 * @param imagePath Image file identifier
 * @returns Promise with success message
 */
export async function addImageToMp3(mp3Path: string, imagePath: string): Promise<string> {
  try {
    // This is now a no-op in the web version since the server handles embedding
    // during the download process based on settings
    return "Image embedding will be handled during download";
  } catch (error) {
    console.error("Error adding image to MP3:", error);
    throw new Error(error as string);
  }
}

/**
 * Creates or ensures directories exist (handled by server)
 * @param dirPath Directory path (used as identifier on server)
 */
export async function ensureDir(dirPath: string): Promise<void> {
  // No-op in web version - server handles directory creation
  console.log("Directory creation handled by server");
}

/**
 * Writes file content (handled by server during download)
 * @param name File name
 * @param content ArrayBuffer content
 */
export async function writeFile(name: string, content: ArrayBuffer): Promise<void> {
  // No-op in web version - server handles file writing
  console.log("File writing handled by server");
}

/**
 * Checks if a file exists (handled during download process)
 * @param path File path to check
 * @returns Promise with boolean
 */
export async function existsFile(path: string): Promise<boolean> {
  // In web version, we assume files don't exist and always download
  return false;
}

/**
 * Initiates a direct download of a single song
 * @param audioUrl URL of the audio file
 * @param imageUrl URL of the image file
 * @param title Song title
 * @param trackNumber Track number
 * @param embedImage Whether to embed image
 */
export async function downloadSong(
  audioUrl: string, 
  imageUrl: string, 
  title: string, 
  trackNumber?: number, 
  embedImage: boolean = true
): Promise<void> {
  const params = new URLSearchParams({
    audioUrl,
    imageUrl,
    title,
    ...(trackNumber !== undefined && { trackNumber: trackNumber.toString() }),
    embedImage: embedImage.toString()
  });
  
  // Create download link and trigger it
  const downloadUrl = `${API_BASE}/download/song?${params.toString()}`;
  
  // Create and trigger a temporary anchor element to start the download
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Initiates a download of an entire playlist
 * @param playlist Playlist information
 * @param clips Array of clips to download
 * @param embedImage Whether to embed images
 * @returns Promise that resolves when download starts
 */
export async function downloadPlaylist(
  playlist: any, 
  clips: any[], 
  embedImage: boolean = true
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/download/playlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        playlist,
        clips,
        embedImage: embedImage.toString()
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to initiate playlist download');
    }
    
    // For blob response, create a download link
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${playlist.name}.zip`);
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}

/**
 * Sets up a connection for progress updates
 * @param sessionId Session identifier
 * @param onProgress Callback for progress updates
 * @returns Cleanup function
 */
export function setupProgressMonitor(
  sessionId: string,
  onProgress: (data: any) => void
): () => void {
  const eventSource = new EventSource(`${API_BASE}/download/progress/${sessionId}`);
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onProgress(data);
    } catch (error) {
      console.error('Error parsing progress data:', error);
    }
  };
  
  eventSource.onerror = (error) => {
    console.error('EventSource error:', error);
    eventSource.close();
  };
  
  // Return cleanup function
  return () => {
    eventSource.close();
  };
}