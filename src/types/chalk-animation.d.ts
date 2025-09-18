declare module 'chalk-animation' {
  export type AnimationName = 'rainbow' | 'pulse' | 'glitch' | 'radar' | 'neon' | 'karaoke';

  export interface Animation {
    start(): void;
    stop(): void;
    replace(text: string): void;
    frame(): void;
    text: string;
  }

  export type AnimationFn = (text: string, speed?: number) => Animation;

  export interface ChalkAnimation extends AnimationFn {
    rainbow: AnimationFn;
    pulse: AnimationFn;
    glitch: AnimationFn;
    radar: AnimationFn;
    neon: AnimationFn;
    karaoke: AnimationFn;
    [key: string]: AnimationFn;
  }

  const chalkAnimation: ChalkAnimation;

  export default chalkAnimation;
}
