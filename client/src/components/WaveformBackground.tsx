import React, { useMemo } from 'react';
import { useP5 } from '../hooks/useP5';
import { createWaveformSketch } from '../sketches/waveformSketch';

interface WaveformBackgroundProps {
  seed?: number;
}

const WaveformBackground: React.FC<WaveformBackgroundProps> = ({
  seed = 42,
}) => {
  const sketch = useMemo(
    () => createWaveformSketch({ seed }),
    [seed]
  );
  const containerRef = useP5(sketch);

  return (
    <div
      ref={containerRef}
      className="waveform-background"
      aria-hidden="true"
    />
  );
};

export default WaveformBackground;
