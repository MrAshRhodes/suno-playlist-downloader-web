import { useState } from 'react';
import { ActionIcon, Tooltip, Box, Paper, Stack, Group, TextInput, Switch, Button, Text } from '@mantine/core';
import { IconSettings, IconX } from '@tabler/icons-react';

type SettingsValues = {
  filename: string;
  embedArt: boolean;
  overwriteFiles: boolean;
};

/**
 * Direct settings component that doesn't use modal system
 */
export default function DirectSettingsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsValues>({
    filename: localStorage.getItem('suno-name-template') || '{trackno} - {name}',
    embedArt: localStorage.getItem('suno-embed-images') !== 'false',
    overwriteFiles: localStorage.getItem('suno-overwrite-files') === 'true'
  });
  
  const handleSave = () => {
    localStorage.setItem('suno-name-template', settings.filename);
    localStorage.setItem('suno-embed-images', settings.embedArt.toString());
    localStorage.setItem('suno-overwrite-files', settings.overwriteFiles.toString());
    setIsOpen(false);
  };
  
  return (
    <Box style={{ position: 'relative' }}>
      <Tooltip label="Settings">
        <ActionIcon
          onClick={() => setIsOpen(!isOpen)}
          color="blue"
          variant="light"
          radius="md"
          size="lg"
        >
          <IconSettings size={20} />
        </ActionIcon>
      </Tooltip>
      
      {isOpen && (
        <Paper
          shadow="md"
          p="md"
          withBorder
          style={{
            position: 'absolute',
            top: '45px',
            right: '0',
            width: '300px',
            zIndex: 1000,
            borderRadius: '8px'
          }}
        >
          <Stack spacing="md">
            <Group position="apart">
              <Text weight={600}>Settings</Text>
              <ActionIcon 
                size="sm" 
                onClick={() => setIsOpen(false)}
                variant="subtle"
              >
                <IconX size={16} />
              </ActionIcon>
            </Group>
            
            <TextInput
              label="Filename Template"
              description="Use {trackno} for track number and {name} for song title"
              value={settings.filename}
              onChange={(e) => setSettings({ ...settings, filename: e.target.value })}
            />
            
            <Switch
              label="Embed album artwork"
              checked={settings.embedArt}
              onChange={(e) => setSettings({ ...settings, embedArt: e.target.checked })}
            />
            
            <Switch
              label="Overwrite existing files"
              checked={settings.overwriteFiles}
              onChange={(e) => setSettings({ ...settings, overwriteFiles: e.target.checked })}
            />
            
            <Group position="right" mt="md">
              <Button size="sm" variant="default" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave}>Save</Button>
            </Group>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}