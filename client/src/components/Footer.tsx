import { Box, Flex } from '@mantine/core';
import { ReactNode } from 'react';

interface FooterProps {
  firstComponent: ReactNode;
  secondComponent: ReactNode;
  currentView: 1 | 2;
}

/**
 * Footer component that can toggle between two different views
 */
function Footer({ firstComponent, secondComponent, currentView }: FooterProps) {
  return (
    <Box
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '60px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        marginTop: 'auto'
      }}
    >
      {/* First View */}
      <Flex
        justify="flex-end"
        align="center"
        p="sm"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: currentView === 1 ? 1 : 0,
          transform: `translateY(${currentView === 1 ? 0 : '100%'})`,
          transition: 'opacity 0.3s, transform 0.3s',
        }}
      >
        {firstComponent}
      </Flex>

      {/* Second View */}
      <Flex
        direction="column"
        p="sm"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: currentView === 2 ? 1 : 0,
          transform: `translateY(${currentView === 2 ? 0 : '-100%'})`,
          transition: 'opacity 0.3s, transform 0.3s',
        }}
      >
        {secondComponent}
      </Flex>
    </Box>
  );
}

export default Footer;