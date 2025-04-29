import { useState, useEffect } from 'react';
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
  Title,
  Tooltip
} from '@mantine/core';
import { IconCheck, IconSettings } from '@tabler/icons-react';
import { getSettingsManager, initializeSettingsManager, defaultSettings } from '../services/SettingsManager';

/**
 * Settings panel component that allows users to configure download options
 */
function SettingsPanel() {
  const [opened, setOpened] = useState(false);
  const [nameTemplate, setNameTemplate] = useState('');
  const [overwriteFiles, setOverwriteFiles] = useState('false');
  const [embedImages, setEmbedImages] = useState('true');
  const [saving, setSaving] = useState(false);

  // Initialize settings on component mount
  useEffect(() => {
    console.log("OptionsModal: Initializing settings manager");
    const initPromise = initializeSettingsManager();
    // Wait for initialization to complete
    initPromise.then(() => {
      console.log("OptionsModal: Settings manager initialized");
    }).catch(err => {
      console.error("OptionsModal: Failed to initialize settings manager:", err);
    });
  }, []);

  // Load settings when modal opens
  useEffect(() => {
    if (opened) {
      loadSettings();
    }
  }, [opened]);

  // Load settings from SettingsManager
  const loadSettings = async () => {
    try {
      console.log("Loading settings for modal");
      const manager = await getSettingsManager();
      console.log("Got settings manager:", manager);
      const settings = await manager.loadAll();
      console.log("Loaded settings:", settings);
      
      // Set state with loaded values or defaults if missing
      setNameTemplate(settings.name_templates || defaultSettings.name_templates);
      setOverwriteFiles(settings.overwrite_files || defaultSettings.overwrite_files);
      setEmbedImages(settings.embed_images || defaultSettings.embed_images);
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Use defaults if loading fails
      setNameTemplate(defaultSettings.name_templates);
      setOverwriteFiles(defaultSettings.overwrite_files);
      setEmbedImages(defaultSettings.embed_images);
    }
  };

  // Save settings to SettingsManager
  const saveSettings = async () => {
    setSaving(true);
    try {
      const settingsManager = await getSettingsManager();
      await settingsManager.saveAll({
        name_templates: nameTemplate,
        overwrite_files: overwriteFiles,
        embed_images: embedImages
      });
      setTimeout(() => {
        setSaving(false);
        setOpened(false);
      }, 500);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaving(false);
    }
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
            backgroundColor: 'rgba(0, 113, 227, 0.1)', 
            borderRadius: '8px',
            transition: 'all 0.2s ease'
          }}
          styles={{
            root: {
              '&:hover': {
                backgroundColor: 'rgba(0, 113, 227, 0.15)',
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
        title="Options"
        centered
        size="md"
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

export default SettingsPanel;