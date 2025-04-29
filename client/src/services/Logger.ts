/**
 * Logger.ts - Web version
 * Simplified logging service that uses browser storage and optional server logging
 */

// Base API URL - Configured to use relative path in production or explicit host in development
const API_BASE = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/api';

class Logger {
  private static userId: string | null = null;

  /**
   * Initialize the logger and generate/retrieve user ID
   */
  private static async initialize(): Promise<void> {
    if (!this.userId) {
      // Try to get from localStorage first
      const storedId = localStorage.getItem('suno-downloader-user-id');
      
      if (storedId) {
        this.userId = storedId;
      } else {
        // Generate a new ID
        this.userId = this.generateUserId();
        localStorage.setItem('suno-downloader-user-id', this.userId);
      }
    }
  }

  /**
   * Generate a simple user ID
   * @returns Generated user ID
   */
  private static generateUserId(): string {
    return 'web-' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Get the user ID
   * @returns User ID string
   */
  public static async getUserId(): Promise<string> {
    await this.initialize();
    return this.userId || 'unknown';
  }

  /**
   * Log an event with optional data
   * @param data Data to log
   * @returns Success status
   */
  public static async log(data: any): Promise<boolean> {
    await this.initialize();
    
    try {
      // Basic client-side logging - store in localStorage with timestamp
      const log = {
        timestamp: new Date().toISOString(),
        userId: this.userId,
        data
      };
      
      // Get existing logs or initialize new array
      const existingLogs = JSON.parse(localStorage.getItem('suno-downloader-logs') || '[]');
      existingLogs.push(log);
      
      // Limit storage to last 50 logs
      const limitedLogs = existingLogs.slice(-50);
      localStorage.setItem('suno-downloader-logs', JSON.stringify(limitedLogs));
      
      // Optional: Send to server if logging endpoint exists
      try {
        const response = await fetch(`${API_BASE}/log`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(log)
        });
        
        return response.ok;
      } catch (error) {
        // Fail silently on server logging - local logging already completed
        console.debug('Server logging failed, but data was saved locally', error);
        return true;
      }
    } catch (error) {
      console.error('Logging failed:', error);
      return false;
    }
  }

  /**
   * Get all stored logs
   * @returns Array of log entries
   */
  public static getLogs(): any[] {
    try {
      return JSON.parse(localStorage.getItem('suno-downloader-logs') || '[]');
    } catch (error) {
      console.error('Failed to retrieve logs:', error);
      return [];
    }
  }

  /**
   * Clear all stored logs
   */
  public static clearLogs(): void {
    localStorage.removeItem('suno-downloader-logs');
  }
}

export default Logger;