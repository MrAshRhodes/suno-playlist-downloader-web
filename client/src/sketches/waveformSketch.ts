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
      const style = getComputedStyle(document.documentElement);
      const bgColor = style.getPropertyValue('--bg-primary').trim();

      p.background(bgColor);

      const t = p.frameCount * 0.002;
      const isDark = bgColor.startsWith('#0') || bgColor.startsWith('#1');

      // Layered waveform system — 8 waves with color gradient
      const layerCount = 8;
      for (let layer = 0; layer < layerCount; layer++) {
        const ratio = layer / (layerCount - 1);

        // Color gradient: deep purple → cyan → accent blue
        let r: number, g: number, b: number, alpha: number;
        if (isDark) {
          // Dark mode: vibrant cool spectrum
          r = p.lerp(90, 40, ratio);
          g = p.lerp(50, 180, ratio);
          b = p.lerp(180, 220, ratio);
          alpha = p.lerp(45, 20, ratio); // front layers brighter
        } else {
          // Light mode: muted warm-cool spectrum
          r = p.lerp(60, 30, ratio);
          g = p.lerp(40, 120, ratio);
          b = p.lerp(140, 170, ratio);
          alpha = p.lerp(35, 15, ratio);
        }

        const c = p.color(r, g, b);
        c.setAlpha(alpha);
        p.stroke(c);
        p.strokeWeight(p.lerp(2.5, 0.8, ratio)); // thicker foreground waves
        p.noFill();

        // Each wave spans the full height range, staggered vertically
        const yBase = p.height * (0.15 + ratio * 0.7);
        const amplitude = p.lerp(80, 30, ratio); // foreground waves larger
        const noiseScale = p.lerp(0.0015, 0.003, ratio);
        const speed = p.lerp(0.003, 0.001, ratio); // foreground drifts faster

        p.beginShape();
        for (let x = 0; x <= p.width; x += 2) {
          const nx = x * noiseScale;
          const noiseVal = p.noise(nx + layer * 100, t * (1 + layer * 0.3) + layer * 20);
          const y = yBase + p.map(noiseVal, 0, 1, -amplitude, amplitude);
          p.vertex(x, y);
        }
        p.endShape();
      }

      // Subtle glow orbs — slow-moving ambient light
      p.noStroke();
      for (let i = 0; i < 3; i++) {
        const ox = p.noise(i * 100, t * 0.5) * p.width;
        const oy = p.noise(i * 100 + 500, t * 0.3) * p.height;
        const size = p.lerp(200, 400, p.noise(i * 100 + 1000, t * 0.2));

        if (isDark) {
          const gc = p.color(60, 100, 200, 8);
          for (let s = size; s > 0; s -= 40) {
            const fade = p.map(s, 0, size, 12, 2);
            const gc2 = p.color(60, 100, 200, fade);
            p.fill(gc2);
            p.ellipse(ox, oy, s, s);
          }
        } else {
          for (let s = size; s > 0; s -= 40) {
            const fade = p.map(s, 0, size, 8, 1);
            const gc2 = p.color(50, 80, 150, fade);
            p.fill(gc2);
            p.ellipse(ox, oy, s, s);
          }
        }
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
  };
}
