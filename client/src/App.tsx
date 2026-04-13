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
import WaveformBackground from './components/WaveformBackground';
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

    // Ensure theme class is applied (hook handles classList, this is a safety net)
    useEffect(() => {
        const add = theme === 'dark' ? 'dark-mode' : 'light-mode';
        const remove = theme === 'dark' ? 'light-mode' : 'dark-mode';
        document.documentElement.classList.add(add);
        document.documentElement.classList.remove(remove);
    }, [theme]);

    return (
        <>
          <WaveformBackground seed={42} />
          <div className="app-wrapper">
            {/* Support Server Costs banner */}
            <div className="support-banner">
                <IconCoffee size={16} color="var(--banner-text)" />
                <a href="https://buymeacoffee.com/focusedlofibeats" target="_blank" rel="noopener noreferrer">
                    Support Server Costs
                </a>
            </div>

            <header className="app-header">
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div className="app-logo-fallback">
                        <IconVinyl size={22} color="#ffffff" stroke={1.5} />
                    </div>
                    <h4 className="app-title">Suno Playlist Downloader</h4>
                </div>
                <button className="theme-toggle" onClick={toggleTheme}>
                    {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
                </button>
            </header>

            <div className="info-banner">
                <IconInfoCircle color="var(--accent)" size={22} style={{ flexShrink: 0 }} />
                <p>Download music from Suno playlists or user profiles directly to your device. Enter a playlist URL or @username. Files will be saved to your browser's default download location.</p>
            </div>

            <h3 className="section-heading">1. Paste playlist link or username</h3>
            <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
                <input
                    type="text"
                    value={playlistUrl}
                    onChange={(e) => setPlaylistUrl(e.target.value)}
                    placeholder="https://suno.com/playlist/... or @username"
                    disabled={isGettingPlaylist || isDownloading}
                    className="input-field"
                />
                <button
                    onClick={getPlaylist}
                    disabled={isGettingPlaylist || isDownloading}
                    className="btn-accent"
                >
                    Get playlist songs
                </button>
            </div>

            <h3 className="section-heading">2. Review songs</h3>
            <div className="monolith-card" style={{
                marginBottom: "24px",
                padding: "4px",
                maxHeight: "320px",
                overflowY: "auto"
            }}>
                <table ref={songTable} className="song-table">
                    <thead>
                        <tr>
                            <th>Img</th>
                            <th>Title</th>
                            <th style={{ textAlign: "right" }}>Length</th>
                            <th style={{ textAlign: "center" }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {playlistData && playlistClips?.map((clip) => (
                            <tr key={clip.id} data-id={`row-${clip.id}`}>
                                <td style={{ width: "50px" }}>
                                    <img
                                        src={clip.image_url}
                                        alt=""
                                        style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover" }}
                                    />
                                </td>
                                <td>
                                    <div>
                                        <strong>{clip.title}</strong>
                                        <span className="model-badge">{clip.model_version}</span>
                                    </div>
                                    <div className="tag-text">{clip.tags}</div>
                                </td>
                                <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                                    {formatSecondsToTime(clip.duration)}
                                </td>
                                <td style={{ textAlign: "center" }}>
                                    <StatusIcon status={clip.status} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <h3 className="section-heading">3. Download playlist</h3>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
                <button
                    onClick={handleDownload}
                    disabled={isGettingPlaylist || isDownloading || (!playlistData)}
                    className="btn-accent"
                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                    <IconDownload size={18} />
                    Download as ZIP
                </button>
            </div>

            {isDownloading && (
                <div style={{ marginBottom: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>{downloadPercentage}%</span>
                    </div>
                    <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${downloadPercentage}%` }} />
                    </div>
                </div>
            )}

            <footer className="app-footer">
                <div>
                    <a
                        href="https://buymeacoffee.com/focusedlofibeats"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Support Server Costs
                    </a>
                </div>
                <div>
                    <span>
                        Based on{' '}
                        <a href="https://github.com/DrummerSi/suno-downloader" target="_blank" rel="noopener noreferrer">
                            DrummerSi's
                        </a>
                        {' '}original app
                    </span>
                    <span style={{ margin: "0 8px", color: "var(--border-color)" }}>|</span>
                    <a href="https://ko-fi.com/drummer_si" target="_blank" rel="noopener noreferrer">
                        Support Original Author
                    </a>
                </div>
            </footer>
        </div>
        </>
    );
}

export default App;
