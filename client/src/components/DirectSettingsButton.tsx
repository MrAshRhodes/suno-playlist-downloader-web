import { useState } from 'react';
import { ActionIcon, Tooltip, Box, Paper, Stack, Group, TextInput, Switch, Button, Text, useMantineTheme } from '@mantine/core';
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
  const theme = useMantineTheme();
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
          bg={theme.colorScheme === 'dark' ? 'dark.6' : 'white'}
          style={{
            position: 'absolute',
            top: '45px',
            right: '0',
            width: '300px',
            zIndex: 1000,
            borderRadius: '8px',
            borderColor: theme.colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }}
        >
          <Stack spacing="md">
            <Group position="apart">
              <Text fw={600} c={theme.colorScheme === 'dark' ? 'gray.3' : 'dark.9'}>Settings</Text>
              <ActionIcon 
                size="sm" 
                onClick={() => setIsOpen(false)}
                variant="subtle"
              >
                <IconX size={16} />
              </ActionIcon>
            </Group>
            
            <TextInput
              label={<Text c={theme.colorScheme === 'dark' ? 'gray.3' : 'dark.9'}>Filename Template</Text>}
              description={<Text size="xs" c={theme.colorScheme === 'dark' ? 'gray.5' : 'gray.7'}>Use {trackno} for track number and {name} for song title</Text>}
              value={settings.filename}
              onChange={(e) => setSettings({ ...settings, filename: e.target.value })}
              styles={{
                input: {
                  color: theme.colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'inherit',
                }
              }}
            />
            
            <Switch
              label={<Text c={theme.colorScheme === 'dark' ? 'gray.3' : 'dark.9'}>Embed album artwork</Text>}
              checked={settings.embedArt}
              onChange={(e) => setSettings({ ...settings, embedArt: e.target.checked })}
              color="blue"
            />
            
            <Switch
              label={<Text c={theme.colorScheme === 'dark' ? 'gray.3' : 'dark.9'}>Overwrite existing files</Text>}
              checked={settings.overwriteFiles}
              onChange={(e) => setSettings({ ...settings, overwriteFiles: e.target.checked })}
              color="blue"
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