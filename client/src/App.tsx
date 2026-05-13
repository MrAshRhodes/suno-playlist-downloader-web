import "./App.css";
import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import {
  IconCoffee,
  IconDownload,
} from "@tabler/icons-react";

import heroBannerImg from './assets/hero-banner.webp';

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
import AdSlot from './components/AdSlot';

function App() {
    const { theme, toggleTheme } = useDarkMode();
    const [playlistUrl, setPlaylistUrl] = useState("");
    const [isGettingPlaylist, setIsGettingPLaylist] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadLabel, setDownloadLabel] = useState('');
    const [downloadPercentage, setDownloadPercentage] = useState(0);
    const [sessionId] = useState(uuidv4());

    const parsedBatchSize = parseInt(import.meta.env.VITE_BATCH_SIZE ?? '50', 10);
    const BATCH_SIZE = (Number.isInteger(parsedBatchSize) && parsedBatchSize > 0) ? parsedBatchSize : 50;

    const [donationModalOpen, setDonationModalOpen] = useState(false);

    const songTable = useRef<HTMLTableElement>(null);

    const [playlistData, setPlaylistData] = useState<IPlaylist | null>(null);
    const [playlistClips, setPlaylistClips] = useState<IPlaylistClip[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const getPlaylist = async () => {
        setIsGettingPLaylist(true);
        setPlaylistData(null);
        setPlaylistClips([]);
        setSelectedIds(new Set());
        try {
            const data = await Suno.getSongsFromPlayList(playlistUrl);
            setPlaylistData(data[0]);
            setPlaylistClips(data[1]);
            setSelectedIds(new Set(data[1].map((c: IPlaylistClip) => c.id)));
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
        if (!playlistData || !playlistClips) return;

        const selectedClips = playlistClips.filter(c => selectedIds.has(c.id));
        if (selectedClips.length === 0) return;

        const batches: IPlaylistClip[][] = [];
        for (let i = 0; i < selectedClips.length; i += BATCH_SIZE) {
            batches.push(selectedClips.slice(i, i + BATCH_SIZE));
        }
        const totalBatches = batches.length;

        // D-03: flip ALL selected rows to Processing before batch 1 fires
        setPlaylistClips(prev =>
            prev.map(c =>
                selectedIds.has(c.id) ? { ...c, status: IPlaylistClipStatus.Processing } : c
            )
        );

        checkAndShowDonationModal();
        setDownloadPercentage(0);
        setIsDownloading(true);

        const settings = {
            embed_images: localStorage.getItem('suno-embed-images') || "true"
        };

        // SSE monitor — set up ONCE before the batch loop; cleanup() called in finally
        let batchHadError = false;
        const cleanup = setupProgressMonitor(sessionId, (data) => {
            if (data.progress) {
                setDownloadPercentage(data.progress);
            }
            if (data.completedItem) {
                const status = data.error
                    ? IPlaylistClipStatus.Error
                    : IPlaylistClipStatus.Success;
                updateClipStatus(data.completedItem, status);
                scrollToRow(data.completedItem);
                if (data.error) {
                    batchHadError = true;
                }
            }
        });

        try {
            for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
                const batchNum = batchIdx + 1;
                batchHadError = false;

                // D-02: show batch label during multi-batch downloads
                if (totalBatches > 1) {
                    setDownloadLabel(`Downloading batch ${batchNum} of ${totalBatches}…`);
                }
                setDownloadPercentage(0);

                const batchClips = batches[batchIdx];
                const zipName = totalBatches === 1
                    ? `${playlistData.name}.zip`
                    : `${playlistData.name}-batch-${String(batchNum).padStart(2, '0')}-of-${totalBatches}.zip`;

                try {
                    await downloadPlaylistApi(
                        playlistData,
                        batchClips,
                        settings.embed_images === "true",
                        sessionId,
                        zipName
                    );

                    if (batchHadError) {
                        showError(`Failed to download batch ${batchNum} of ${totalBatches}`);
                        const failedIds = new Set(
                            batches.slice(batchIdx).flatMap(b => b.map(c => c.id))
                        );
                        setPlaylistClips(prev =>
                            prev.map(c =>
                                failedIds.has(c.id) ? { ...c, status: IPlaylistClipStatus.Error } : c
                            )
                        );
                        return;
                    }

                    // Fallback: flip any batch clips still Processing → Success.
                    // SSE may not deliver events before POST completes on fast/small playlists.
                    const batchIds = new Set(batchClips.map(c => c.id));
                    setPlaylistClips(prev =>
                        prev.map(c =>
                            batchIds.has(c.id) && c.status === IPlaylistClipStatus.Processing
                                ? { ...c, status: IPlaylistClipStatus.Success }
                                : c
                        )
                    );
                } catch (err) {
                    // D-04: stop-all on first batch HTTP/network failure
                    showError(`Failed to download batch ${batchNum} of ${totalBatches}`);
                    const failedIds = new Set(
                        batches.slice(batchIdx).flatMap(b => b.map(c => c.id))
                    );
                    setPlaylistClips(prev =>
                        prev.map(c =>
                            failedIds.has(c.id) ? { ...c, status: IPlaylistClipStatus.Error } : c
                        )
                    );
                    return;
                }
            }

            showSuccess(
                totalBatches === 1
                    ? 'Playlist ZIP file download initiated'
                    : `All ${totalBatches} batch ZIPs downloaded`
            );
        } finally {
            cleanup();
            setIsDownloading(false);
            setDownloadLabel('');
        }
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

    const allSelected = playlistClips.length > 0 && selectedIds.size === playlistClips.length;
    const someSelected = selectedIds.size > 0 && selectedIds.size < playlistClips.length;

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

                {/* Hero banner — per D-01, D-02, D-05 (support-banner stays above, untouched) */}
                <div className="hero-banner">
                  <img src={heroBannerImg} alt="" className="hero-banner-img" aria-hidden="true" />
                  <div className="hero-overlay" />
                  <div className="hero-content">
                    <h1 className="app-title">Suno Playlist Downloader</h1>
                    <p className="hero-subtitle">
                      Download music from your Suno playlists directly to your device.
                      Files will be saved to your browser's default download location.
                    </p>
                  </div>
                  <div className="hero-actions">
                    <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                  </div>
                </div>

                {/* Step 1: Paste link — per D-03, D-04 */}
                <div className="step-card monolith-card">
                  <div className="step-heading">
                    <div className="step-number">1</div>
                    <h3 className="section-heading" style={{ margin: 0 }}>Paste playlist link or @username</h3>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                        type="text"
                        value={playlistUrl}
                        onChange={(e) => setPlaylistUrl(e.target.value)}
                        placeholder="Playlist URL or @username"
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
                  <div style={{ color: "var(--text-secondary)", fontSize: "12px", marginTop: "6px" }}>
                    Accepts playlist URLs and @username handles
                  </div>
                </div>

                {/* Step 2: Review songs — per D-03, D-04 */}
                <div className="step-card monolith-card">
                  <div className="step-heading">
                    <div className="step-number">2</div>
                    <h3 className="section-heading" style={{ margin: 0 }}>Review songs</h3>
                  </div>
                  <div className="monolith-card song-table-card" style={{ padding: 0, maxHeight: "340px", overflowY: "auto" }}>
                    <table ref={songTable} className="song-table">
                        <thead>
                            <tr>
                                <th style={{ width: "40px" }}>
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        ref={(el) => { if (el) el.indeterminate = someSelected; }}
                                        disabled={isDownloading}
                                        aria-label={allSelected ? "Deselect all songs" : "Select all songs"}
                                        onChange={() => {
                                            if (allSelected) {
                                                setSelectedIds(new Set());
                                            } else {
                                                setSelectedIds(new Set(playlistClips.map(c => c.id)));
                                            }
                                        }}
                                        style={{ cursor: isDownloading ? "not-allowed" : "pointer" }}
                                    />
                                </th>
                                <th>Img</th>
                                <th>Title</th>
                                <th style={{ textAlign: "right" }}>Length</th>
                                <th style={{ textAlign: "center" }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {playlistData && playlistClips?.map((clip) => (
                                <tr key={clip.id} data-id={`row-${clip.id}`}>
                                    <td style={{ width: "40px" }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(clip.id)}
                                            disabled={isDownloading}
                                            onChange={(e) => {
                                                const checked = e.currentTarget.checked;
                                                setSelectedIds(prev => {
                                                    const next = new Set(prev);
                                                    if (checked) {
                                                        next.add(clip.id);
                                                    } else {
                                                        next.delete(clip.id);
                                                    }
                                                    return next;
                                                });
                                            }}
                                            style={{ cursor: isDownloading ? "not-allowed" : "pointer" }}
                                        />
                                    </td>
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
                </div>

                {/* Step 3: Download — per D-03, D-04 */}
                <div className="step-card monolith-card">
                  <div className="step-heading">
                    <div className="step-number">3</div>
                    <h3 className="section-heading" style={{ margin: 0 }}>Download playlist</h3>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                        onClick={downloadPlaylist}
                        disabled={isGettingPlaylist || isDownloading || !playlistData || selectedIds.size === 0}
                        className="btn-accent"
                        style={{ display: "flex", alignItems: "center", gap: "8px" }}
                    >
                        <IconDownload size={18} />
                        {isDownloading && downloadLabel
                            ? downloadLabel
                            : `Download ${selectedIds.size} ${selectedIds.size === 1 ? "song" : "songs"} as ZIP`}
                    </button>
                  </div>
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

                {/* Phase 10 ADM-05: Advertisement label (overrides Phase 4 D-13 — FTC/EU disclosure) */}
                <div
                    style={{
                        textAlign: 'center',
                        fontSize: 11,
                        fontWeight: 400,
                        color: 'var(--text-muted)',
                        marginTop: 32,
                        marginBottom: -16,
                        letterSpacing: '0.06em',
                        width: 728,
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        lineHeight: 1,
                    }}
                >
                    Advertisement
                </div>
                {/* Phase 10 ADM-02, ADM-05: Adsterra banner — replaces failed AdSense Auto Ads */}
                <AdSlot
                    adKey={import.meta.env.VITE_ADSTERRA_UNIT_KEY ?? ''}
                    width={728}
                    height={90}
                />

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
