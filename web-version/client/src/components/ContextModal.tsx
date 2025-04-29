import { useCallback } from 'react';
import { modals } from '@mantine/modals';
import { Button, Group, Text, Radio, Stack, TextInput, ActionIcon, Tooltip } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';

/**
 * Settings modal that uses Mantine's modals API instead of Modal component
 */
function ContextModal() {
  // Default settings or from localStorage
  const getSettings = () => ({
    nameTemplate: localStorage.getItem('suno-name-template') || "{trackno} - {name}",
    overwriteFiles: localStorage.getItem('suno-overwrite-files') || "false",
    embedImages: localStorage.getItem('suno-embed-images') || "true"
  });

  const openSettingsModal = useCallback(() => {
    const settings = getSettings();
    
    modals.open({
      title: 'Settings',
      centered: true,
      children: (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            
            // Get values from form
            const nameTemplate = form.elements.namedItem('nameTemplate') as HTMLInputElement;
            const overwriteFiles = document.querySelector('input[name="overwriteFiles"]:checked') as HTMLInputElement;
            const embedImages = document.querySelector('input[name="embedImages"]:checked') as HTMLInputElement;
            
            // Save to localStorage
            localStorage.setItem('suno-name-template', nameTemplate.value);
            localStorage.setItem('suno-overwrite-files', overwriteFiles.value);
            localStorage.setItem('suno-embed-images', embedImages.value);
            
            modals.closeAll();
          }}
        >
          <Stack>
            <Text fw={500} size="sm">File Name Template</Text>
            <TextInput
              name="nameTemplate"
              defaultValue={settings.nameTemplate}
              placeholder="{trackno} - {name}"
              description="Available placeholders: {trackno}, {name}"
            />
            
            <Text fw={500} size="sm" mt="md">Skip Existing Files</Text>
            <Radio.Group
              name="overwriteFiles"
              defaultValue={settings.overwriteFiles}
            >
              <Group mt="xs">
                <Radio value="false" label="Skip existing files" />
                <Radio value="true" label="Overwrite existing files" />
              </Group>
            </Radio.Group>
            
            <Text fw={500} size="sm" mt="md">Embed Album Artwork</Text>
            <Radio.Group
              name="embedImages"
              defaultValue={settings.embedImages}
            >
              <Group mt="xs">
                <Radio value="true" label="Embed artwork in MP3 files" />
                <Radio value="false" label="Don't embed artwork" />
              </Group>
            </Radio.Group>
            
            <Group justify="flex-end" mt="lg">
              <Button 
                variant="light" 
                onClick={() => modals.closeAll()}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </Group>
          </Stack>
        </form>
      ),
    });
  }, []);

  return (
    <Tooltip label="Settings">
      <ActionIcon
        variant="subtle"
        onClick={openSettingsModal}
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
  );
}

export default ContextModal;