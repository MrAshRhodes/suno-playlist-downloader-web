/**
 * SettingsManager.ts - Adapted for web version
 * Manages user settings through browser storage and server sync
 */

// Base API URL - Configured to use relative path in production or explicit host in development
const API_BASE = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/api';

// Define the Settings interface with explicit types
interface Settings {
    name_templates: string
    overwrite_files: string
    embed_images: string
}

// Define defaultSettings with the correct types
// Export default settings so they can be used elsewhere
export const defaultSettings: Settings = {
    name_templates: "{trackno} - {name}",
    overwrite_files: "false",
    embed_images: "true",
};

class SettingsManager {
    private settings: Settings;
    private initialized: boolean = false;

    private constructor() {
        this.settings = { ...defaultSettings };
    }

    static async create(): Promise<SettingsManager> {
        try {
            console.log("Creating SettingsManager instance");
            const manager = new SettingsManager();
            await manager.initialize();
            console.log("SettingsManager initialized successfully");
            return manager;
        } catch (error) {
            console.error("Error creating SettingsManager:", error);
            // Return a default manager anyway to prevent crashes
            const manager = new SettingsManager();
            manager.settings = { ...defaultSettings };
            manager.initialized = true;
            return manager;
        }
    }

    private async initialize(): Promise<void> {
        try {
            // First, try to load from localStorage
            const localSettings = localStorage.getItem('suno-downloader-settings');
            
            if (localSettings) {
                this.settings = JSON.parse(localSettings);
            } else {
                // If not in localStorage, try to get from server
                const response = await fetch(`${API_BASE}/settings`);
                
                if (response.ok) {
                    const serverSettings = await response.json();
                    this.settings = serverSettings;
                    
                    // Save to localStorage
                    localStorage.setItem('suno-downloader-settings', JSON.stringify(this.settings));
                }
            }
            
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize settings:', error);
            this.settings = { ...defaultSettings };
            this.initialized = true;
        }
    }

    async getSetting<T>(key: string, defaultValue: T): Promise<T> {
        if (!this.initialized) {
            await this.initialize();
        }
        
        return (this.settings as any)[key] ?? defaultValue;
    }

    async setSetting<T>(key: string, value: T, save = true) {
        if (!this.initialized) {
            await this.initialize();
        }
        
        (this.settings as any)[key] = value;
        
        if (save) {
            await this.save();
        }
    }

    async save() {
        // Save to localStorage
        localStorage.setItem('suno-downloader-settings', JSON.stringify(this.settings));
        
        // Sync with server
        try {
            await fetch(`${API_BASE}/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.settings)
            });
        } catch (error) {
            console.error('Failed to sync settings with server:', error);
        }
    }

    async loadAll(): Promise<Settings> {
        if (!this.initialized) {
            await this.initialize();
        }
        
        return { ...this.settings };
    }

    async saveAll(newSettings: Settings) {
        this.settings = { ...newSettings };
        await this.save();
    }
}

// Initialize settings asynchronously
let settingsManagerPromise: Promise<SettingsManager> | null = null;
let settingsManagerInstance: SettingsManager | null = null; 

export function initializeSettingsManager() {
    if (!settingsManagerPromise) {
        console.log("Initializing settings manager");
        settingsManagerPromise = SettingsManager.create()
            .then(manager => {
                settingsManagerInstance = manager;
                return manager;
            })
            .catch(error => {
                console.error("Failed to initialize settings manager:", error);
                // Create a default manager to prevent crashes
                const defaultManager = new SettingsManager();
                defaultManager.settings = { ...defaultSettings };
                settingsManagerInstance = defaultManager;
                return defaultManager;
            });
    }
    return settingsManagerPromise;
}

// Get the settings manager instance
export async function getSettingsManager(): Promise<SettingsManager> {
    if (settingsManagerInstance) {
        return settingsManagerInstance;
    }
    
    if (!settingsManagerPromise) {
        settingsManagerPromise = initializeSettingsManager();
    }
    
    try {
        const manager = await settingsManagerPromise;
        return manager;
    } catch (error) {
        console.error("Error getting settings manager:", error);
        // Return a default manager to prevent crashes
        const defaultManager = new SettingsManager();
        defaultManager.settings = { ...defaultSettings };
        return defaultManager;
    }
}