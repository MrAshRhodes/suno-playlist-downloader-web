import { ActionIcon, Tooltip } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

/**
 * Theme toggle component with sun/moon icon
 */
function ThemeToggle({ theme, toggleTheme }: ThemeToggleProps) {
  return (
    <Tooltip label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
      <ActionIcon
        variant="light"
        color={theme === 'light' ? 'blue' : 'yellow'}
        onClick={toggleTheme}
        size="lg"
        radius="md"
        aria-label="Toggle color scheme"
        style={{
          backgroundColor: theme === 'light' ? 'rgba(0, 113, 227, 0.1)' : 'rgba(255, 213, 0, 0.1)',
          transition: 'all 0.2s ease',
        }}
      >
        {theme === 'light' ? (
          <IconMoon size={18} stroke={1.5} />
        ) : (
          <IconSun size={18} stroke={1.5} />
        )}
      </ActionIcon>
    </Tooltip>
  );
}

export default ThemeToggle;