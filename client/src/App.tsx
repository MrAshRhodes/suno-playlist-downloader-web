import "./App.css";
import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { 
  ActionIcon, 
  AppShell, 
  Badge, 
  Box, 
  Button, 
  Divider, 
  Flex, 
  Group, 
  Image, 
  Popover, 
  Progress, 
  Stack, 
  Table, 
  Text, 
  TextInput,
  Title,
  Alert,
  Paper
} from "@mantine/core";

import { 
  IconBrandGithub, 
  IconCoffee, 
  IconDownload,
  IconHelpCircle, 
  IconLink, 
  IconVinyl,
  IconInfoCircle,
  IconSun,
  IconMoon
} from "@tabler/icons-react";

import { useDarkMode } from './hooks/useDarkMode';
import ThemeToggle from './components/ThemeToggle';
import { initializeSettingsManager } from './services/SettingsManager';

import Suno, { IPlaylist, IPlaylistClip, IPlaylistClipStatus } from "./services/Suno";
import { downloadPlaylist as downloadPlaylistApi, setupProgressMonitor } from "./services/WebApi";
import { showError, showSuccess } from "./services/Utils";
import Footer from "./components/Footer";
import Logger from "./services/Logger";
import SectionHeading from "./components/SectionHeading";
import { getSettingsManager } from "./services/SettingsManager";
import SimpleSettingsModal from "./components/SimpleSettingsModal";
import TestModal from "./components/TestModal";
import DirectSettingsButton from "./components/DirectSettingsButton";
import StatusIcon from "./components/StatusIcon";
import filenamify from "filenamify";
import scrollIntoView from "scroll-into-view-if-needed";

function App() {
    console.log('App component initializing');
    const { theme, toggleTheme } = useDarkMode();
    const [playlistUrl, setPlaylistUrl] = useState("");
    const [isGettingPlaylist, setIsGettingPLaylist] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadPercentage, setDownloadPercentage] = useState(0);
    const [completedItems, setCompletedItems] = useState(0);
    const [sessionId] = useState(uuidv4());

    console.log('App state initialized successfully');

    const songTable = useRef<HTMLTableElement>(null);

    const [playlistData, setPlaylistData] = useState<IPlaylist | null>(null);
    const [playlistClips, setPlaylistClips] = useState<IPlaylistClip[]>([]);

    const [footerView, setFooterView] = useState<1 | 2>(1);

    const getPlaylist = async () => {
        setIsGettingPLaylist(true);
        setPlaylistData(null);
        setPlaylistClips([]);
        try {
            const data = await Suno.getSongsFromPlayList(playlistUrl);
            setPlaylistData(data[0]);
            setPlaylistClips(data[1]);

            // Log the details
            Logger.log({
                playlistUrl: playlistUrl,
                noSongs: data[1].length
            });
        } catch (err) {
            console.log(err);
            showError("Failed to fetch playlist data. Make sure you entered a valid link");
        }
        setIsGettingPLaylist(false);
    };

    const updateClipStatus = (id: string, status: IPlaylistClipStatus) => {
        setPlaylistClips((prevClips) =>
            prevClips.map((clip) =>
                clip.id === id ? { ...clip, status: status } : clip
            )
        );
    };

    const scrollToRow = (row: string) => {
        const node = songTable.current?.querySelector(`tr[data-id="row-${row}"]`);
        if (node)
            scrollIntoView(node, {
                scrollMode: "if-needed",
                behavior: "smooth",
                block: "end"
            });
    };

    const downloadPlaylist = async () => {
        setDownloadPercentage(0);
        setIsDownloading(true);

        if (!playlistData || !playlistClips) return;

        // Reset the status of all clips
        setPlaylistClips((prevClips) =>
            prevClips.map((clip) => ({ ...clip, status: IPlaylistClipStatus.Processing }))
        );

        // Use localStorage settings or defaults
        const settings = {
            name_templates: localStorage.getItem('suno-name-template') || "{trackno} - {name}",
            overwrite_files: localStorage.getItem('suno-overwrite-files') || "false",
            embed_images: localStorage.getItem('suno-embed-images') || "true"
        };

        try {
            // Setup progress monitoring
            const cleanup = setupProgressMonitor(sessionId, (data) => {
                if (data.progress) {
                    setDownloadPercentage(data.progress);
                    if (data.completedItem) {
                        updateClipStatus(data.completedItem, IPlaylistClipStatus.Success);
                        scrollToRow(data.completedItem);
                    }
                }
            });

            // Trigger the download
            await downloadPlaylistApi(
                playlistData,
                playlistClips,
                settings.embed_images === "true"
            );

            // Update UI
            setPlaylistClips((prevClips) =>
                prevClips.map((clip) => ({ ...clip, status: IPlaylistClipStatus.Success }))
            );

            cleanup();
            showSuccess("Playlist ZIP file download initiated");
        } catch (error) {
            console.error("Download failed:", error);
            showError("Failed to download playlist");

            // Mark all as failed
            setPlaylistClips((prevClips) =>
                prevClips.map((clip) => ({ ...clip, status: IPlaylistClipStatus.Error }))
            );
        }

        setIsDownloading(false);
    };

    const handleDownload = async () => {
        await downloadPlaylist();
    };

    const formatSecondsToTime = (seconds: number) => {
        const roundedSeconds = Math.round(seconds);
        const mins = Math.floor(roundedSeconds / 60);
        const secs = roundedSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    useEffect(() => {
        // If we're downloading, show the download progress
        if (isDownloading) {
            setTimeout(() => {
                setFooterView(2);
            }, 0);
        } else {
            setTimeout(() => {
                setFooterView(1);
            }, 500);
        }
    }, [isDownloading]);

    // Debug useEffect to ensure component is mounting
    useEffect(() => {
        console.log('App component mounted successfully');
        // Check API connection
        fetch('/api/debug')
            .then(response => {
                console.log('API debug response status:', response.status);
                if (!response.ok) {
                    throw new Error(`API responded with status ${response.status}`);
                }
                return response.json();
            })
            .then(data => console.log('API connection test:', data))
            .catch(error => {
                console.error('API connection error:', error);
                // Non-blocking error - application can still function without the debug endpoint
                console.log('Continuing with application despite API error');
            });
    }, []);

    // Update body classes when theme changes
    useEffect(() => {
        // Set the theme class on the document element
        document.documentElement.className = theme === 'dark' ? 'dark-mode' : 'light-mode';
        // Set background and text color on body
        document.body.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#f5f5f7';
        document.body.style.color = theme === 'dark' ? '#f5f5f7' : '#1d1d1f';
    }, [theme]);

    // Full UI with only ZIP downloads
    return (
        <div style={{ 
            padding: "20px", 
            maxWidth: "1200px", 
            margin: "0 auto",
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f5f5f7',
            color: theme === 'dark' ? '#f5f5f7' : '#1d1d1f'
        }}>
            <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                marginBottom: "15px" 
            }}>
                <a 
                    href="https://buymeacoffee.com/focused" 
                    target="_blank" 
                    style={{ 
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: theme === 'dark' ? "#ffdd00" : "#0071e3", 
                        textDecoration: "none", 
                        fontSize: "14px",
                        padding: "8px 16px",
                        borderRadius: "20px",
                        backgroundColor: theme === 'dark' ? 'rgba(255, 221, 0, 0.1)' : 'rgba(0, 113, 227, 0.1)',
                        transition: "background-color 0.2s ease"
                    }}
                >
                    <IconCoffee size={18} />
                    Support Server Costs
                </a>
            </div>

            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ background: 'linear-gradient(135deg, #0071e3, #42a9ff)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconVinyl size={22} color="#ffffff" stroke={1.5} />
                    </div>
                    <div>
                        <h4 style={{ margin: 0 }}>Suno Playlist Downloader</h4>
                    </div>
                </div>
                <button 
                    onClick={toggleTheme}
                    style={{ 
                        backgroundColor: 'transparent', 
                        border: 'none', 
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme === 'dark' ? '#f5f5f7' : '#1d1d1f'
                    }}
                >
                    {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
                </button>
            </header>

            <div style={{ 
                marginBottom: "20px", 
                padding: "15px", 
                border: theme === 'dark' ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #e0e0e0", 
                borderRadius: "10px",
                backgroundColor: theme === 'dark' ? '#2c2c2e' : '#ffffff'
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <IconInfoCircle color={theme === 'dark' ? "#1a82e2" : "#0071e3"} size={24} />
                    <p style={{ 
                        margin: 0,
                        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'inherit'
                    }}>Download music from your Suno playlists directly to your device. Files will be saved to your browser's default download location.</p>
                </div>
            </div>

            <h3>1. Paste playlist link</h3>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <input 
                    type="text" 
                    value={playlistUrl}
                    onChange={(e) => setPlaylistUrl(e.target.value)}
                    placeholder="https://suno.com/playlist/..."
                    disabled={isGettingPlaylist || isDownloading}
                    style={{ 
                        flexGrow: 1, 
                        padding: "10px", 
                        borderRadius: "5px", 
                        border: theme === 'dark' ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid #ccc",
                        backgroundColor: theme === 'dark' ? '#3a3a3c' : '#ffffff',
                        color: theme === 'dark' ? '#f5f5f7' : '#1d1d1f',
                        "::placeholder": {
                            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)'
                        }
                    }}
                    className={theme === 'dark' ? 'dark-placeholder' : 'light-placeholder'}
                />
                <button 
                    onClick={getPlaylist}
                    disabled={isGettingPlaylist || isDownloading}
                    style={{ 
                        padding: "10px 20px", 
                        borderRadius: "5px", 
                        backgroundColor: theme === 'dark' ? "#1a82e2" : "#0071e3", 
                        color: "white", 
                        border: "none",
                        cursor: "pointer",
                        boxShadow: theme === 'dark' ? "0 2px 5px rgba(0,0,0,0.2)" : "none",
                        transition: "background-color 0.2s ease, box-shadow 0.2s ease"
                    }}
                >
                    Get playlist songs
                </button>
            </div>

            <h3>2. Review songs</h3>
            <div style={{ 
                marginBottom: "20px", 
                border: theme === 'dark' ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #e0e0e0", 
                borderRadius: "10px", 
                padding: "15px", 
                maxHeight: "300px", 
                overflowY: "auto",
                backgroundColor: theme === 'dark' ? '#2c2c2e' : '#ffffff'
            }}>
                <table ref={songTable} style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={{ 
                                textAlign: "left", 
                                padding: "8px", 
                                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : '#666',
                                borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #eee'
                            }}>
                                Img
                            </th>
                            <th style={{ 
                                textAlign: "left", 
                                padding: "8px", 
                                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : '#666',
                                borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #eee'
                            }}>
                                Title
                            </th>
                            <th style={{ 
                                textAlign: "right", 
                                padding: "8px", 
                                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : '#666',
                                borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #eee'
                            }}>
                                Length
                            </th>
                            <th style={{ 
                                textAlign: "center", 
                                padding: "8px", 
                                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : '#666',
                                borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #eee'
                            }}>
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {playlistData && playlistClips?.map((clip) => (
                            <tr 
                                key={clip.id} 
                                data-id={`row-${clip.id}`} 
                                style={{ 
                                    borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #eee',
                                    color: theme === 'dark' ? '#f5f5f7' : 'inherit'
                                }}
                            >
                                <td style={{ padding: "8px", width: "50px" }}>
                                    <img 
                                        src={clip.image_url} 
                                        alt="" 
                                        style={{ width: "40px", height: "40px", borderRadius: "3px", objectFit: "cover" }}
                                    />
                                </td>
                                <td style={{ padding: "8px" }}>
                                    <div>
                                        <strong>{clip.title}</strong>
                                        <span style={{ 
                                            backgroundColor: theme === 'dark' ? "#1a82e2" : "#0071e3", 
                                            color: "white", 
                                            fontSize: "10px", 
                                            padding: "2px 6px", 
                                            borderRadius: "10px", 
                                            marginLeft: "6px",
                                            boxShadow: theme === 'dark' ? "0 1px 3px rgba(0,0,0,0.3)" : "none"
                                        }}>
                                            {clip.model_version}
                                        </span>
                                    </div>
                                    <div style={{ 
                                        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : '#666', 
                                        fontSize: "12px" 
                                    }}>
                                        {clip.tags}
                                    </div>
                                </td>
                                <td style={{ textAlign: "right", padding: "8px", fontFamily: "monospace" }}>
                                    {formatSecondsToTime(clip.duration)}
                                </td>
                                <td style={{ textAlign: "center", padding: "8px" }}>
                                    <StatusIcon status={clip.status} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <h3>3. Download playlist</h3>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
                <button 
                    onClick={handleDownload} 
                    disabled={isGettingPlaylist || isDownloading || (!playlistData)}
                    style={{ 
                        padding: "10px 20px", 
                        borderRadius: "5px", 
                        backgroundColor: theme === 'dark' ? "#1a82e2" : "#0071e3", 
                        color: "white", 
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: (isGettingPlaylist || isDownloading || (!playlistData)) ? "not-allowed" : "pointer",
                        opacity: (isGettingPlaylist || isDownloading || (!playlistData)) ? "0.6" : "1",
                        boxShadow: theme === 'dark' ? "0 2px 5px rgba(0,0,0,0.2)" : "none",
                        transition: "background-color 0.2s ease, box-shadow 0.2s ease"
                    }}
                >
                    <IconDownload size={18} />
                    Download as ZIP
                </button>
            </div>

            {isDownloading && (
                <div style={{ marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                        <span style={{ 
                            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'inherit'
                        }}>{downloadPercentage}%</span>
                    </div>
                    <div style={{ 
                        height: "4px", 
                        backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#eee', 
                        borderRadius: "2px", 
                        overflow: "hidden" 
                    }}>
                        <div 
                            style={{ 
                                height: "100%", 
                                width: `${downloadPercentage}%`, 
                                backgroundColor: theme === 'dark' ? "#1a82e2" : "#0071e3",
                                borderRadius: "2px",
                                transition: "width 0.3s ease",
                                boxShadow: theme === 'dark' ? "0 0 5px rgba(26, 130, 226, 0.5)" : "none"
                            }} 
                        />
                    </div>
                </div>
            )}

            <footer style={{ 
                marginTop: "40px", 
                borderTop: theme === 'dark' ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #eee", 
                paddingTop: "20px", 
                display: "flex", 
                justifyContent: "flex-end" 
            }}>
                <div>
                    <span style={{ 
                        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : "#666", 
                        fontSize: "14px", 
                        marginRight: "10px" 
                    }}>
                        Based on <a 
                            href="https://github.com/DrummerSi/suno-downloader" 
                            target="_blank" 
                            style={{ 
                                color: "#0071e3", 
                                textDecoration: "none" 
                            }}
                        >DrummerSi's</a> original app
                    </span>
                    <a 
                        href="https://ko-fi.com/drummer_si" 
                        target="_blank" 
                        style={{ 
                            color: "#0071e3", 
                            textDecoration: "none", 
                            fontSize: "14px" 
                        }}
                    >
                        Support Original Author
                    </a>
                </div>
            </footer>
        </div>
    );
}

export default App;