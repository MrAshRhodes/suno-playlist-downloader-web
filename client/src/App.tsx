import "./App.css";
import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import {
  IconCoffee,
  IconDownload,
  IconVinyl,
  IconInfoCircle,
} from "@tabler/icons-react";

import { useDarkMode } from './hooks/useDarkMode';
import ThemeToggle from './components/ThemeToggle';
import WaveformBackground from './components/WaveformBackground';

import Suno, { IPlaylist, IPlaylistClip, IPlaylistClipStatus } from "./services/Suno";
import { downloadPlaylist as downloadPlaylistApi, setupProgressMonitor } from "./services/WebApi";
import { showError, showSuccess } from "./services/Utils";
import Logger from "./services/Logger";
import StatusIcon from "./components/StatusIcon";
import scrollIntoView from "scroll-into-view-if-needed";
import DonationModal from './components/DonationModal';

function App() {
    const { theme, toggleTheme } = useDarkMode();
    const [playlistUrl, setPlaylistUrl] = useState("");
    const [isGettingPlaylist, setIsGettingPLaylist] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadPercentage, setDownloadPercentage] = useState(0);
    const [sessionId] = useState(uuidv4());

    const [donationModalOpen, setDonationModalOpen] = useState(false);

    const songTable = useRef<HTMLTableElement>(null);

    const [playlistData, setPlaylistData] = useState<IPlaylist | null>(null);
    const [playlistClips, setPlaylistClips] = useState<IPlaylistClip[]>([]);

    const getPlaylist = async () => {
        setIsGettingPLaylist(true);
        setPlaylistData(null);
        setPlaylistClips([]);
        try {
            const data = await Suno.getSongsFromPlayList(playlistUrl);
            setPlaylistData(data[0]);
            setPlaylistClips(data[1]);
            Logger.log({ playlistUrl, noSongs: data[1].length });
        } catch (err) {
            console.log(err);
            showError("Failed to fetch playlist data. Make sure you entered a valid link");
        }
        setIsGettingPLaylist(false);
    };

    const updateClipStatus = (id: string, status: IPlaylistClipStatus) => {
        setPlaylistClips((prevClips) =>
            prevClips.map((clip) =>
                clip.id === id ? { ...clip, status } : clip
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

    const checkAndShowDonationModal = () => {
        const current = parseInt(localStorage.getItem('suno-download-count') || '0');
        const next = current + 1;
        localStorage.setItem('suno-download-count', String(next));
        if (next === 1 || next % 5 === 0) {
            setDonationModalOpen(true);
        }
    };

    const downloadPlaylist = async () => {
        checkAndShowDonationModal();
        setDownloadPercentage(0);
        setIsDownloading(true);

        if (!playlistData || !playlistClips) return;

        setPlaylistClips((prevClips) =>
            prevClips.map((clip) => ({ ...clip, status: IPlaylistClipStatus.Processing }))
        );

        const settings = {
            name_templates: localStorage.getItem('suno-name-template') || "{trackno} - {name}",
            overwrite_files: localStorage.getItem('suno-overwrite-files') || "false",
            embed_images: localStorage.getItem('suno-embed-images') || "true"
        };

        try {
            const cleanup = setupProgressMonitor(sessionId, (data) => {
                if (data.progress) {
                    setDownloadPercentage(data.progress);
                    if (data.completedItem) {
                        updateClipStatus(data.completedItem, IPlaylistClipStatus.Success);
                        scrollToRow(data.completedItem);
                    }
                }
            });

            await downloadPlaylistApi(
                playlistData,
                playlistClips,
                settings.embed_images === "true"
            );

            setPlaylistClips((prevClips) =>
                prevClips.map((clip) => ({ ...clip, status: IPlaylistClipStatus.Success }))
            );

            cleanup();
            showSuccess("Playlist ZIP file download initiated");
        } catch (error) {
            console.error("Download failed:", error);
            showError("Failed to download playlist");
            setPlaylistClips((prevClips) =>
                prevClips.map((clip) => ({ ...clip, status: IPlaylistClipStatus.Error }))
            );
        }

        setIsDownloading(false);
    };

    const formatSecondsToTime = (seconds: number) => {
        const roundedSeconds = Math.round(seconds);
        const mins = Math.floor(roundedSeconds / 60);
        const secs = roundedSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    useEffect(() => {
        fetch('/api/debug')
            .then(response => response.json())
            .catch(() => {});
    }, []);

    useEffect(() => {
        document.documentElement.className = theme === 'dark' ? 'dark-mode' : 'light-mode';
    }, [theme]);

    return (
        <>
            <WaveformBackground />

            <div className="app-wrapper">
                {/* Support banner */}
                <div className="support-banner">
                    <IconCoffee size={18} />
                    <a href="https://buymeacoffee.com/focused" target="_blank" rel="noopener noreferrer">
                        Support Server Costs
                    </a>
                </div>

                {/* Header */}
                <header className="app-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div className="app-logo">
                            <div className="app-logo-fallback">
                                <IconVinyl size={22} color="#ffffff" stroke={1.5} />
                            </div>
                        </div>
                        <h1 className="app-title">Suno Playlist Downloader</h1>
                    </div>
                    <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                </header>

                {/* Info banner */}
                <div className="info-banner">
                    <IconInfoCircle size={24} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    <p>Download music from your Suno playlists directly to your device. Files will be saved to your browser's default download location.</p>
                </div>

                {/* Step 1: Paste link */}
                <h3 className="section-heading">1. Paste playlist link</h3>
                <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
                    <input
                        type="text"
                        value={playlistUrl}
                        onChange={(e) => setPlaylistUrl(e.target.value)}
                        placeholder="https://suno.com/playlist/..."
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

                {/* Step 2: Review songs */}
                <h3 className="section-heading">2. Review songs</h3>
                <div className="monolith-card" style={{ marginBottom: "24px", padding: "0", maxHeight: "340px", overflowY: "auto" }}>
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

                {/* Step 3: Download */}
                <h3 className="section-heading">3. Download playlist</h3>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
                    <button
                        onClick={downloadPlaylist}
                        disabled={isGettingPlaylist || isDownloading || !playlistData}
                        className="btn-accent"
                        style={{ display: "flex", alignItems: "center", gap: "8px" }}
                    >
                        <IconDownload size={18} />
                        Download as ZIP
                    </button>
                </div>

                {/* Progress bar */}
                {isDownloading && (
                    <div className="progress-section" style={{ marginBottom: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{downloadPercentage}%</span>
                        </div>
                        <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${downloadPercentage}%` }} />
                        </div>
                    </div>
                )}

                {/* Footer */}
                <footer className="app-footer">
                    <span>
                        Based on <a href="https://github.com/DrummerSi/suno-downloader" target="_blank" rel="noopener noreferrer">DrummerSi's</a> original app
                    </span>
                    <a href="https://ko-fi.com/drummer_si" target="_blank" rel="noopener noreferrer">
                        Support Original Author
                    </a>
                </footer>
            </div>

            <DonationModal
                opened={donationModalOpen}
                onClose={() => setDonationModalOpen(false)}
            />
        </>
    );
}

export default App;
