import { Modal, Stack, Text, Button, Image } from '@mantine/core';
import { IconCoffee } from '@tabler/icons-react';
import bannerImg from '../assets/donation-banner.png';

interface DonationModalProps {
  opened: boolean;
  onClose: () => void;
}

function DonationModal({ opened, onClose }: DonationModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="md"
      withCloseButton
      styles={{
        header: { backgroundColor: 'var(--bg-card)', borderBottom: 'none' },
        body: { backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' },
      }}
    >
      <Stack spacing="md" pb="md">
        <Image src={bannerImg} radius="md" alt="Support Suno Downloader" />
        <Text size="lg" fw={600} ta="center">
          Thanks for using Suno Downloader!
        </Text>
        <Text size="sm" color="dimmed" ta="center">
          If you'd like to help keep it free, consider buying me a coffee.
        </Text>
        <Button
          component="a"
          href="https://buymeacoffee.com/focused"
          target="_blank"
          rel="noopener noreferrer"
          fullWidth
          size="md"
          leftIcon={<IconCoffee size={18} />}
          variant="filled"
          styles={{
            root: {
              backgroundColor: 'var(--accent)',
              '&:hover': {
                backgroundColor: 'var(--accent-hover)',
              },
            },
          }}
        >
          Buy Me a Coffee
        </Button>
      </Stack>
    </Modal>
  );
}

export default DonationModal;
