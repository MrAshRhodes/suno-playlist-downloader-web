import { useEffect, useRef } from 'react';
import p5 from 'p5';

type SketchFactory = (p: p5) => void;

export function useP5(sketchFactory: SketchFactory) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up any existing instance first (React Strict Mode safety)
    if (p5InstanceRef.current) {
      p5InstanceRef.current.remove();
    }

    p5InstanceRef.current = new p5(sketchFactory, containerRef.current);

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [sketchFactory]);

  return containerRef;
}
