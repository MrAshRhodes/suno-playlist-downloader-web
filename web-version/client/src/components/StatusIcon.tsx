import { Loader, ThemeIcon } from '@mantine/core';
import { 
  IconCheck, 
  IconX, 
  IconArrowsDown, 
  IconCircleOff
} from '@tabler/icons-react';
import { IPlaylistClipStatus } from '../services/Suno';

interface StatusIconProps {
  status: IPlaylistClipStatus;
}

/**
 * Status icon component that displays different icons based on the status
 */
function StatusIcon({ status }: StatusIconProps) {
  switch (status) {
    case IPlaylistClipStatus.None:
      return <IconCircleOff color="gray" size={18} />;

    case IPlaylistClipStatus.Processing:
      return <Loader size="sm" color="blue" />;

    case IPlaylistClipStatus.Skipped:
      return (
        <ThemeIcon radius="xl" size="sm" color="yellow">
          <IconArrowsDown size={14} />
        </ThemeIcon>
      );

    case IPlaylistClipStatus.Success:
      return (
        <ThemeIcon radius="xl" size="sm" color="green">
          <IconCheck size={14} />
        </ThemeIcon>
      );

    case IPlaylistClipStatus.Error:
      return (
        <ThemeIcon radius="xl" size="sm" color="red">
          <IconX size={14} />
        </ThemeIcon>
      );

    default:
      return null;
  }
}

export default StatusIcon;