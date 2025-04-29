import { useState } from 'react';
import {
  ActionIcon,
  Button,
  Divider,
  Flex,
  Group,
  Modal,
  Radio,
  Stack,
  Text,
  TextInput,
  Tooltip
} from '@mantine/core';
import { IconCheck, IconSettings } from '@tabler/icons-react';

interface SimpleSettingsProps {
  theme: 'light' | 'dark';
}

/**
 * Simplified settings panel with local storage
 */
function SimpleSettingsModal({ theme }: SimpleSettingsProps) {
  const [opened, setOpened] = useState(false);
  const [nameTemplate, setNameTemplate] = useState(
    localStorage.getItem('suno-name-template') || "{trackno} - {name}"
  );
  const [overwriteFiles, setOverwriteFiles] = useState(
    localStorage.getItem('suno-overwrite-files') || "false"
  );
  const [embedImages, setEmbedImages] = useState(
    localStorage.getItem('suno-embed-images') || "true"
  );
  const [saving, setSaving] = useState(false);

  const saveSettings = () => {
    setSaving(true);
    
    // Simple storage using localStorage
    localStorage.setItem('suno-name-template', nameTemplate);
    localStorage.setItem('suno-overwrite-files', overwriteFiles);
    localStorage.setItem('suno-embed-images', embedImages);
    
    // Simulate saving delay for better UX
    setTimeout(() => {
      setSaving(false);
      setOpened(false);
    }, 500);
  };

  return (
    <>
      <Tooltip label="Settings">
        <ActionIcon
          variant="subtle"
          onClick={() => setOpened(true)}
          size="md"
          color="blue"
          style={{ 
            backgroundColor: theme === 'light' ? 'rgba(0, 113, 227, 0.1)' : 'rgba(0, 113, 227, 0.2)', 
            borderRadius: '8px',
            transition: 'all 0.2s ease'
          }}
          styles={{
            root: {
              '&:hover': {
                backgroundColor: theme === 'light' ? 'rgba(0, 113, 227, 0.15)' : 'rgba(0, 113, 227, 0.25)',
              }
            }
          }}
        >
          <IconSettings stroke={1.5} />
        </ActionIcon>
      </Tooltip>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Settings"
        centered
        size="md"
        styles={{
          header: {
            backgroundColor: theme === 'light' ? '#f8f9fa' : '#2c2c2e',
          },
          body: {
            backgroundColor: theme === 'light' ? 'white' : '#2c2c2e',
            color: theme === 'light' ? '#1d1d1f' : '#f5f5f7',
          }
        }}
      >
        <Stack>
          <Text fw={500} size="sm">File Name Template</Text>
          <TextInput
            value={nameTemplate}
            onChange={(e) => setNameTemplate(e.currentTarget.value)}
            placeholder="{trackno} - {name}"
            description="Available placeholders: {trackno}, {name}"
          />

          <Divider my="sm" />

          <Text fw={500} size="sm">Skip Existing Files</Text>
          <Radio.Group
            value={overwriteFiles}
            onChange={setOverwriteFiles}
          >
            <Group mt="xs">
              <Radio value="false" label="Skip existing files" />
              <Radio value="true" label="Overwrite existing files" />
            </Group>
          </Radio.Group>

          <Divider my="sm" />

          <Text fw={500} size="sm">Embed Album Artwork</Text>
          <Radio.Group
            value={embedImages}
            onChange={setEmbedImages}
          >
            <Group mt="xs">
              <Radio value="true" label="Embed artwork in MP3 files" />
              <Radio value="false" label="Don't embed artwork" />
            </Group>
          </Radio.Group>

          <Divider my="sm" />

          <Flex justify="flex-end" gap="md">
            <Button variant="light" onClick={() => setOpened(false)}>Cancel</Button>
            <Button 
              onClick={saveSettings} 
              leftSection={<IconCheck size={16} />}
              loading={saving}
            >
              Save
            </Button>
          </Flex>
        </Stack>
      </Modal>
    </>
  );
}

export default SimpleSettingsModal;