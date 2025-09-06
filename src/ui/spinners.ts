// ui/spinners.ts — tiny dependency-free spinner with styled statuses
import readline from 'node:readline';
import { } from "../symbols.js"
import { theme } from './theme.js';


type FrameSet = string[];
const dots: FrameSet = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
const line: FrameSet = ['⎺','⎻','⎼','⎽','⎼','⎻'];
const simple: FrameSet = ['-','\\','|','/'];

export interface SpinnerOptions {
  text?: string;
  frames?: FrameSet;
  interval?: number;
  stream?: NodeJS.WriteStream;
}

export class Spinner {
  private i = 0;
  private timer?: NodeJS.Timeout;
  private frames: FrameSet;
  private interval: number;
  private stream: NodeJS.WriteStream;
  private text: string;

  constructor(opts: SpinnerOptions = {}) {
    this.frames = opts.frames ?? dots;
    this.interval = Math.max(40, opts.interval ?? 80);
    this.stream = opts.stream ?? process.stderr;
    this.text = opts.text ?? '';
  }

  setText(text: string) {
    this.text = text;
    return this;
  }

  start(text?: string) {
    if (text) this.text = text;
    if (this.timer) return this;
    this.timer = setInterval(() => this.render(), this.interval);
    return this;
  }

  stop() {
    if (!this.timer) return this;
    clearInterval(this.timer);
    this.timer = undefined;
    this.clear();
    return this;
  }

  succeed(text?: string) { this.stop(); this.stream.write(`${t.ok('✔ Success')} ${text ?? this.text}\n`); return this; }
  fail(text?: string)    { this.stop(); this.stream.write(`${t.err('✖ Error')} ${text ?? this.text}\n`); return this; }
  warn(text?: string)    { this.stop(); this.stream.write(`${t.warn('⚠ Warn')} ${text ?? this.text}\n`); return this; }
  info(text?: string)    { this.stop(); this.stream.write(`${t.cyan('ℹ Info')} ${text ?? this.text}\n`); return this; }

  private frame() {
    const f = this.frames[this.i % this.frames.length];
    this.i++;
    return f;
  }

  private render() {
    this.clear();
    this.stream.write(`${t.cyan(this.frame())} ${this.text}`);
  }

  private clear() {
    readline.clearLine(this.stream, 0);
    readline.cursorTo(this.stream, 0);
  }
}

// handy presets
export const spinners = {
  dots: () => new Spinner({ frames: dots }),
  line: () => new Spinner({ frames: line }),
  simple: () => new Spinner({ frames: simple }),
};
