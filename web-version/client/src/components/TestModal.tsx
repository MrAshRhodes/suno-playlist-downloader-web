import { useState } from 'react';
import { Button, Modal, Text } from '@mantine/core';

/**
 * A very simple test modal to verify basic modal functionality
 */
function TestModal() {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <Button onClick={() => setOpened(true)} color="red">
        Open Test Modal
      </Button>

      <Modal 
        opened={opened} 
        onClose={() => setOpened(false)}
        title="Test Modal"
      >
        <Text>This is a test modal to verify if modals work.</Text>
        <Button mt="md" onClick={() => setOpened(false)}>Close</Button>
      </Modal>
    </>
  );
}

export default TestModal;