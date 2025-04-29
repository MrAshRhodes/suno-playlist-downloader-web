import { Flex, Text, Box } from '@mantine/core';
import { ReactNode } from 'react';

interface SectionHeadingProps {
  number: string;
  title: string;
  children?: ReactNode;
}

/**
 * Section heading component with numbered circle - Apple style
 */
function SectionHeading({ number, title, children }: SectionHeadingProps) {
  return (
    <Flex 
      align="center" 
      mb={16} 
      pb={12}
      style={{
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
      }}
    >
      <Box 
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0071e3, #40a9ff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '12px',
          boxShadow: '0 2px 8px rgba(0, 113, 227, 0.25)'
        }}
      >
        <Text fw={600} c="white" style={{ fontSize: '15px' }}>{number}</Text>
      </Box>
      <Text 
        fw={600} 
        fz="lg" 
        style={{ 
          color: '#1d1d1f', 
          letterSpacing: '-0.3px' 
        }}
      >
        {title}
      </Text>
      {children && <Box ml={10}>{children}</Box>}
    </Flex>
  );
}

export default SectionHeading;