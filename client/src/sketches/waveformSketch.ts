import p5 from 'p5';

interface WaveformConfig {
  seed: number;
}

export function createWaveformSketch(config: WaveformConfig) {
  return (p: p5) => {
    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      p.frameRate(30);
      p.noiseSeed(config.seed);
      p.randomSeed(config.seed);
    };

    p.draw = () => {
      // Read CSS variables for theme-aware colors (no remount needed on toggle)
      const style = getComputedStyle(document.documentElement);
      const bgColor = style.getPropertyValue('--bg-primary').trim();
      const accentHex = style.getPropertyValue('--accent').trim();

      p.background(bgColor);

      // Convert accent to rgba with low opacity for ambient subtlety
      const c = p.color(accentHex);
      c.setAlpha(25); // ~10% opacity -- non-distracting per ART-03
      p.stroke(c);
      p.strokeWeight(1.5);
      p.noFill();

      const t = p.frameCount * 0.003; // Glacially slow movement

      // 5 layered Perlin noise waves -- music waveform feel
      for (let layer = 0; layer < 5; layer++) {
        p.beginShape();
        const yBase = p.height * (0.25 + layer * 0.12);
        for (let x = 0; x <= p.width; x += 3) {
          const nx = x * 0.002;
          const noiseVal = p.noise(nx + layer * 50, t + layer * 10);
          const y = yBase + p.map(noiseVal, 0, 1, -40, 40);
          p.vertex(x, y);
        }
        p.endShape();
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
  };
}
