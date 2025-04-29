import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_DIR = path.join(__dirname, '../temp');

// Make sure the temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Creates a temporary directory for file operations
 * @returns {Promise<string>} Path to the created temporary directory
 */
export const createTempDirectory = async () => {
  const sessionId = crypto.randomBytes(16).toString('hex');
  const sessionDir = path.join(TEMP_DIR, sessionId);
  
  // Create the directory
  try {
    fs.mkdirSync(sessionDir, { recursive: true });
    
    // Schedule cleanup after 1 hour (in case cleanup fails during download)
    setTimeout(() => {
      cleanupTempDirectory(sessionDir);
    }, 60 * 60 * 1000);
    
    return sessionDir;
  } catch (error) {
    console.error('Error creating temp directory:', error);
    throw new Error('Failed to create temporary directory');
  }
};

/**
 * Recursively deletes a directory and its contents
 * @param {string} dirPath - Directory path to delete
 * @returns {Promise<void>}
 */
export const cleanupTempDirectory = async (dirPath) => {
  if (!dirPath || !dirPath.includes(TEMP_DIR)) {
    console.error('Invalid directory path for cleanup');
    return;
  }
  
  try {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const curPath = path.join(dirPath, file);
        
        if (fs.lstatSync(curPath).isDirectory()) {
          // Recursive delete for subdirectories
          await cleanupTempDirectory(curPath);
        } else {
          // Delete file
          fs.unlinkSync(curPath);
        }
      }
      
      // Delete the empty directory
      fs.rmdirSync(dirPath);
      console.log(`Cleaned up temp directory: ${dirPath}`);
    }
  } catch (error) {
    console.error(`Error cleaning up temp directory ${dirPath}:`, error);
  }
};

/**
 * Schedules periodic cleanup of old temporary directories
 * @param {number} maxAge - Maximum age in milliseconds before deletion
 */
export const schedulePeriodicCleanup = (maxAge = 24 * 60 * 60 * 1000) => {
  // Run every hour
  setInterval(() => {
    try {
      if (fs.existsSync(TEMP_DIR)) {
        const now = Date.now();
        const directories = fs.readdirSync(TEMP_DIR);
        
        for (const dir of directories) {
          const dirPath = path.join(TEMP_DIR, dir);
          const stats = fs.statSync(dirPath);
          
          // If directory is older than maxAge, delete it
          if (now - stats.mtimeMs > maxAge) {
            cleanupTempDirectory(dirPath);
          }
        }
      }
    } catch (error) {
      console.error('Error during periodic cleanup:', error);
    }
  }, 60 * 60 * 1000); // Run every hour
};

// Start the periodic cleanup
schedulePeriodicCleanup();

/**
 * Creates a file with specified content
 * @param {string} filePath - Path to create the file
 * @param {Buffer|string} content - Content to write to the file
 * @returns {Promise<void>}
 */
export const writeFile = async (filePath, content) => {
  try {
    fs.writeFileSync(filePath, content);
  } catch (error) {
    console.error('Error writing file:', error);
    throw new Error(`Failed to write file: ${error.message}`);
  }
};

/**
 * Checks if a file exists
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} Whether the file exists
 */
export const fileExists = async (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    console.error('Error checking if file exists:', error);
    return false;
  }
};