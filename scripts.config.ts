import { MonkeyUserScript } from 'vite-plugin-monkey';

export interface ScriptConfig {
  entry: string;
  fileName: string;
  userscript: MonkeyUserScript;
}

export const scripts: Record<string, ScriptConfig> = {
  absolutezero: {
    entry: './src/crack/test.ts',
    fileName: 'crack/test.user.js',
    userscript: {
      name: 'Test',
      namespace: 'https://github.com/milkyway0308/crystallized-chasm',
      match: ['https://crack.wrtn.ai/*'],
      updateURL: "https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/archiver.user.js",
      downloadURL: "https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/archiver.user.js",
      version: '1.0.0',
    },
  },
};