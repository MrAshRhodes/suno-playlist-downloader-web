/**
 * Utils.ts - Web-compatible utility functions
 */

// If using a toast library, we would import it here
// In this case, we're using console methods for simplicity
// but in the real app, the Mantine notifications would be used

/**
 * Shows an error message
 * @param message Error message to display
 */
export function showError(message: string): void {
  console.error(message);
  // In the real implementation, this would use a toast/notification library
  
  // Example with browser alert (should be replaced with proper UI notification)
  alert(`Error: ${message}`);
}

/**
 * Shows a success message
 * @param message Success message to display
 */
export function showSuccess(message: string): void {
  console.log(message);
  // In the real implementation, this would use a toast/notification library
  
  // Example with browser alert (should be replaced with proper UI notification)
  alert(`Success: ${message}`);
}

/**
 * Delays execution for specified milliseconds
 * @param ms Milliseconds to delay
 * @returns Promise that resolves after delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Gets a random number between min and max values
 * @param min Minimum value
 * @param max Maximum value
 * @returns Random number in range
 */
export function getRandomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Formats file size to human-readable string
 * @param bytes Size in bytes
 * @returns Formatted size string (e.g. "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Creates a throttled function that only invokes the provided function
 * at most once per every `wait` milliseconds
 * @param func Function to throttle
 * @param wait Throttle wait time in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastCallTime = 0;
  let timeout: number | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    
    if (timeSinceLastCall >= wait) {
      lastCallTime = now;
      func.apply(this, args);
    } else if (timeout === null) {
      timeout = window.setTimeout(() => {
        lastCallTime = Date.now();
        timeout = null;
        func.apply(this, args);
      }, wait - timeSinceLastCall);
    }
  };
}