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
import { downloadPlaylist, downloadSong, setupProgressMonitor } from "./services/WebApi";
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
import pLimit from "p-limit";
import scrollIntoView from "scroll-into-view-if-needed";

function App() {
    const { theme, toggleTheme } = useDarkMode();
    const [playlistUrl, setPlaylistUrl] = useState("");
    const [isGettingPlaylist, setIsGettingPLaylist] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadPercentage, setDownloadPercentage] = useState(0);
    const [completedItems, setCompletedItems] = useState(0);
    const [downloadMode, setDownloadMode] = useState<"individual" | "zip">("individual");
    const [sessionId] = useState(uuidv4());

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

    const getSongName = async (song: IPlaylistClip, template: string) => {
        // Get template from localStorage if available
        const savedTemplate = localStorage.getItem('suno-name-template');
        const effectiveTemplate = savedTemplate || template;

        const songNumber = song.no.toString().padStart(2, "0");
        const songTitle = filenamify(song.title);
        return effectiveTemplate.replace("{trackno}", songNumber).replace("{name}", songTitle);
    };

    // Download individual songs one by one
    const downloadIndividualSongs = async () => {
        setDownloadPercentage(0);
        setCompletedItems(0);
        setIsDownloading(true);

        if (!playlistData || !playlistClips) return;

        // Reset the status of all clips
        setPlaylistClips((prevClips) =>
            prevClips.map((clip) => ({ ...clip, status: IPlaylistClipStatus.None }))
        );

        // Use localStorage settings or defaults
        const settings = {
            name_templates: localStorage.getItem('suno-name-template') || "{trackno} - {name}",
            overwrite_files: localStorage.getItem('suno-overwrite-files') || "false",
            embed_images: localStorage.getItem('suno-embed-images') || "true"
        };

        const limit = pLimit(5);
        const downloadPromises = playlistClips.map((song) => {
            return limit(async () => {
                try {
                    updateClipStatus(song.id, IPlaylistClipStatus.Processing);
                    scrollToRow(song.id);

                    const songFileName = await getSongName(song, settings.name_templates);
                    await downloadSong(
                        song.audio_url,
                        song.image_url,
                        songFileName,
                        song.no,
                        settings.embed_images === "true"
                    );

                    updateClipStatus(song.id, IPlaylistClipStatus.Success);
                } catch (error) {
                    console.error("Error downloading song:", error);
                    updateClipStatus(song.id, IPlaylistClipStatus.Error);
                }

                setCompletedItems((completedItems) => completedItems + 1);
            });
        });

        await Promise.all(downloadPromises);
        setIsDownloading(false);
        showSuccess("Playlist download complete");
    };

    // Download entire playlist as ZIP
    const downloadPlaylistAsZip = async () => {
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
            await downloadPlaylist(
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

    // Main download function that determines which method to use
    const handleDownload = async () => {
        if (downloadMode === "zip") {
            await downloadPlaylistAsZip();
        } else {
            await downloadIndividualSongs();
        }
    };

    const formatSecondsToTime = (seconds: number) => {
        const roundedSeconds = Math.round(seconds);
        const mins = Math.floor(roundedSeconds / 60);
        const secs = roundedSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // We're not using the complex settings manager anymore - using simple localStorage

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

    useEffect(() => {
        const totalItems = playlistClips.length;
        if (totalItems > 0) {
            const newPercentage = Math.ceil((completedItems / totalItems) * 100);
            setDownloadPercentage(newPercentage);
        }
    }, [completedItems, playlistClips.length]);

    return (
        <AppShell
            header={{ height: 60 }}
            padding="lg"
        >
            <AppShell.Header>
                <Box 
                    h="100%" 
                    className="header-container" 
                    style={{ 
                        backgroundColor: theme === 'light' 
                            ? 'rgba(255, 255, 255, 0.85)' 
                            : 'rgba(35, 35, 37, 0.85)', 
                        backdropFilter: 'blur(12px)',
                        boxShadow: theme === 'light' 
                            ? '0 2px 16px rgba(0, 0, 0, 0.06)' 
                            : '0 2px 16px rgba(0, 0, 0, 0.2)',
                        borderBottom: theme === 'light' 
                            ? '1px solid rgba(0, 0, 0, 0.05)' 
                            : '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <Flex justify="space-between" h="100%" w="100%" px={16}>
                        <Flex
                            h="100%" 
                            justify="flex-start"
                            align="center"
                            style={{
                                userSelect: "none",
                            }}
                        >
                            <Group gap={16} ml={8}>
                                <div style={{ 
                                    background: 'linear-gradient(135deg, #0071e3, #42a9ff)',
                                    borderRadius: '10px',
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 6px rgba(0, 113, 227, 0.25)'
                                }}>
                                    <IconVinyl size={22} color="#ffffff" stroke={1.5} />
                                </div>
                                <div>
                                    <Text 
                                        fw={600} 
                                        size="xs" 
                                        tt="uppercase" 
                                        style={{ 
                                            color: theme === 'light' ? '#0071e3' : '#42a9ff',
                                            letterSpacing: '0.5px',
                                            opacity: 0.9
                                        }}
                                    >
                                        Suno
                                    </Text>
                                    <Title 
                                        order={4} 
                                        fw={600} 
                                        style={{ 
                                            color: 'var(--text-color)',
                                            letterSpacing: '-0.3px',
                                            marginTop: '-2px'
                                        }}
                                    >
                                        Playlist Downloader
                                    </Title>
                                </div>
                            </Group>
                        </Flex>

                        <Flex align="center" h="100%">
                            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                        </Flex>
                    </Flex>
                </Box>
            </AppShell.Header>

            <AppShell.Main
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100vh",
                    overflow: "hidden",
                    backgroundColor: "var(--background-color)", 
                    padding: "24px",
                    transition: "background-color 0.3s ease"
                }}
            >
                <Paper 
                    withBorder 
                    p="xl" 
                    mt={10} 
                    mb={24} 
                    radius="xl" 
                    className="card" 
                    style={{ 
                        borderColor: theme === 'light' ? 'rgba(0, 113, 227, 0.2)' : 'rgba(0, 113, 227, 0.3)',
                        background: theme === 'light' 
                            ? 'linear-gradient(120deg, #ffffff, #f8f9ff)' 
                            : 'linear-gradient(120deg, #2c2c2e, #323234)'
                    }}
                >
                    <Flex align="center" gap="md">
                        <IconInfoCircle color="#0071e3" size={24} />
                        <Text size="sm" style={{ color: theme === 'light' ? '#505050' : '#c1c1c6', lineHeight: 1.5 }}>
                            Download music from your Suno playlists directly to your device. Files will be saved to your browser's default download location.
                        </Text>
                    </Flex>

                    {/* Removed test modal - it's not working */}
                </Paper>

                {/* Top Section */}
                <Flex justify="space-between">
                    <SectionHeading number="1" title="Paste playlist link">
                        <Popover position="bottom-start" withArrow shadow="lg">
                            <Popover.Target>
                                <ActionIcon variant="subtle" size="sm" color="gray"><IconHelpCircle /></ActionIcon>
                            </Popover.Target>
                            <Popover.Dropdown>
                                <Group w={240} gap={4}>
                                    <Image radius="md" src="./assets/copy-playlist.png" />
                                    <Text>Navigate to your Suno playlist, and click the 'Copy playlist' button as shown</Text>
                                </Group>
                            </Popover.Dropdown>
                        </Popover>
                    </SectionHeading>

                    <DirectSettingsButton />
                </Flex>

                <Flex gap="md" direction="row" mb={24}>
                    <TextInput
                        flex={1}
                        value={playlistUrl}
                        onChange={(event) => setPlaylistUrl(event.currentTarget.value)}
                        rightSection={<IconLink color="#0071e3" />}
                        disabled={isGettingPlaylist || isDownloading}
                        placeholder="https://suno.com/playlist/..."
                        styles={{
                            input: {
                                borderRadius: '12px',
                                padding: '14px 16px',
                                fontSize: '16px',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                                transition: 'all 0.2s ease',
                                '&:focus': {
                                    borderColor: '#0071e3',
                                    boxShadow: '0 0 0 3px rgba(0, 113, 227, 0.1)'
                                }
                            }
                        }}
                    />
                    <Button
                        variant="filled"
                        loading={isGettingPlaylist}
                        onClick={getPlaylist}
                        disabled={isGettingPlaylist || isDownloading}
                        style={{
                            background: 'linear-gradient(135deg, #0071e3, #42a6ff)',
                            borderRadius: '12px',
                            boxShadow: '0 2px 6px rgba(0, 113, 227, 0.25)',
                            padding: '0 24px',
                            height: '48px',
                            transition: 'all 0.2s ease',
                            fontWeight: 500
                        }}
                    >
                        Get playlist songs
                    </Button>
                </Flex>

                {/* Central Section */}
                <SectionHeading number="2" title="Review songs" />
                <Flex
                    className="card"
                    mb={24}
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "16px",
                        borderRadius: "16px",
                        flexFlow: "column",
                        backgroundColor: theme === 'light' ? 'white' : '#2c2c2e',
                        boxShadow: `0 4px 24px ${theme === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(0, 0, 0, 0.2)'}`,
                        border: `1px solid ${theme === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'}`,
                        transition: 'background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease'
                    }}
                >
                    <Table verticalSpacing="sm" ref={songTable}>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Img</Table.Th>
                                <Table.Th>Title</Table.Th>
                                <Table.Th style={{ textAlign: "right" }}>Length</Table.Th>
                                <Table.Th></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {playlistData && playlistClips?.map((clip) => (
                                <Table.Tr key={clip.id} data-id={`row-${clip.id}`}>
                                    <Table.Td w={50}>
                                        <Image radius="sm" w={40} fit="contain" src={clip.image_url} />
                                    </Table.Td>
                                    <Table.Td>
                                        <Stack gap={0}>
                                            <Group gap={0}>
                                                <Text fw={800} size="md">
                                                    {clip.title}
                                                </Text>
                                                <Badge size="xs"
                                                    variant="gradient"
                                                    gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                                                    ml={6}
                                                >{clip.model_version}</Badge>
                                            </Group>
                                            <Text size="sm" c="dimmed" lineClamp={1}>{clip.tags}</Text>
                                        </Stack>
                                    </Table.Td>
                                    <Table.Td style={{ textAlign: "right" }}>
                                        <Text ff="monospace">
                                            {formatSecondsToTime(clip.duration)}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td style={{ textAlign: "center" }}>
                                        <StatusIcon status={clip.status} />
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Flex>

                {/* Bottom Section */}
                <SectionHeading number="3" title="Choose download method">
                    <Popover position="bottom-start" withArrow shadow="lg">
                        <Popover.Target>
                            <ActionIcon variant="subtle" size="sm" color="gray"><IconHelpCircle /></ActionIcon>
                        </Popover.Target>
                        <Popover.Dropdown w={240}>
                            <Text>
                                Choose individual files to download one by one, or ZIP to download the entire playlist as a single file.
                            </Text>
                        </Popover.Dropdown>
                    </Popover>
                </SectionHeading>

                <Flex gap="lg" direction="row" mb={24}>
                    <Flex 
                        gap="md" 
                        grow={1} 
                        style={{ 
                            backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '12px',
                            padding: '6px',
                        }}
                    >
                        <Button
                            variant={downloadMode === "individual" ? "filled" : "subtle"}
                            onClick={() => setDownloadMode("individual")}
                            disabled={isDownloading}
                            style={{
                                flex: 1,
                                borderRadius: '10px',
                                fontWeight: 500,
                                background: downloadMode === "individual" ? 
                                    'linear-gradient(135deg, #0071e3, #42a6ff)' : 'transparent',
                                boxShadow: downloadMode === "individual" ? 
                                    '0 2px 6px rgba(0, 113, 227, 0.25)' : 'none',
                            }}
                        >
                            Individual Files
                        </Button>
                        <Button
                            variant={downloadMode === "zip" ? "filled" : "subtle"}
                            onClick={() => setDownloadMode("zip")}
                            disabled={isDownloading}
                            style={{
                                flex: 1,
                                borderRadius: '10px',
                                fontWeight: 500,
                                background: downloadMode === "zip" ? 
                                    'linear-gradient(135deg, #0071e3, #42a6ff)' : 'transparent',
                                boxShadow: downloadMode === "zip" ? 
                                    '0 2px 6px rgba(0, 113, 227, 0.25)' : 'none',
                            }}
                        >
                            Download as ZIP
                        </Button>
                    </Flex>

                    <Button
                        variant="filled"
                        disabled={isGettingPlaylist || isDownloading || (!playlistData)}
                        loading={isDownloading}
                        onClick={handleDownload}
                        leftSection={<IconDownload size={18} />}
                        style={{
                            background: 'linear-gradient(135deg, #0071e3, #42a6ff)',
                            borderRadius: '12px',
                            boxShadow: '0 2px 6px rgba(0, 113, 227, 0.25)',
                            padding: '0 24px',
                            height: '48px',
                            transition: 'all 0.2s ease',
                            fontWeight: 500
                        }}
                    >
                        {downloadMode === "zip" ? "Download ZIP" : "Download Songs"}
                    </Button>
                </Flex>

                <Footer
                    firstComponent={
                        <Flex justify="center" align="center" w="100%">
                            <Text size="sm" c="dimmed" mr={10}>
                                Suno Playlist Downloader - Web Version
                            </Text>
                            <Button 
                                component="a"
                                href="https://buymeacoffee.com/focused"
                                target="_blank"
                                leftSection={<IconCoffee size={16} />}
                                variant="subtle"
                                size="xs"
                                style={{
                                    color: theme === 'light' ? '#0071e3' : '#42a9ff',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                Buy Me A Coffee
                            </Button>
                        </Flex>
                    }
                    secondComponent={
                        <Stack w="100%" h={140} gap={4} pb={10} mt={-5}>
                            <Flex>
                                <Text size="xs">{downloadPercentage}%</Text>
                            </Flex>
                            <Progress value={downloadPercentage} animated />
                        </Stack>
                    }
                    currentView={footerView}
                />
            </AppShell.Main>
        </AppShell>
    );
}

export default App;