declare module 'chalk-animation' {
  interface Animation {
    stop(): void;
    start(): void;
    replace(text: string): void;
    frame(): void;
  }
  interface Options { fps?: number }
  type AnimationFn = (text: string, speed?: number) => Animation;
  const rainbow: AnimationFn;
  const pulse: AnimationFn;
  const glitch: AnimationFn;
  const radar: AnimationFn;
  const neon: AnimationFn;
  const karaoke: AnimationFn;
  export default { rainbow, pulse, glitch, radar, neon, karaoke };
}
