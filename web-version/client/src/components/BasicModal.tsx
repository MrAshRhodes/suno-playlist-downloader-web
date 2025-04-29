import { useState } from 'react';
import { 
  Button,
  Modal,
  TextInput,
  Switch,
  Stack,
  Group,
  Text,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';

/**
 * Very basic settings modal with minimum dependencies
 */
function BasicModal() {
  const [opened, setOpened] = useState(false);
  const [filename, setFilename] = useState(localStorage.getItem('suno-filename') || '{trackno} - {name}');
  const [embedArt, setEmbedArt] = useState(localStorage.getItem('suno-embed-art') === 'true');

  const handleSave = () => {
    localStorage.setItem('suno-filename', filename);
    localStorage.setItem('suno-embed-art', embedArt.toString());
    setOpened(false);
  };

  return (
    <>
      <Tooltip label="Settings">
        <ActionIcon 
          color="blue" 
          onClick={() => setOpened(true)}
          variant="light"
          size="lg"
        >
          <IconSettings />
        </ActionIcon>
      </Tooltip>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Settings"
        size="md"
        styles={{ 
          body: { padding: '20px' },
          inner: { zIndex: 1000 },
          overlay: { zIndex: 999 }
        }}
        centered
        overlayProps={{ opacity: 0.55, blur: 3 }}
      >
        <Stack spacing="md">
          <TextInput
            label="Filename Template"
            description="Use {trackno} for track number and {name} for song title"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
          />
          
          <Switch
            label="Embed album artwork"
            checked={embedArt}
            onChange={(e) => setEmbedArt(e.target.checked)}
          />
          
          <Group position="right" mt="md">
            <Button variant="default" onClick={() => setOpened(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

export default BasicModal;