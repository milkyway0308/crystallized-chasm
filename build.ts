import { build, createServer } from "vite";

import monkey, { cdn, type MonkeyUserScript } from "vite-plugin-monkey";
import fs from "fs";
import path from "path";

function findTypeScripts(pathName: string): string[] {
  const srcDir = path.resolve(pathName);
  const files = fs.readdirSync(srcDir, { recursive: true });
  return files.filter((it) => typeof it === "string").filter((f) => f.endsWith(".ts"));
}

function asPureFileName(file: string): string {
  const normalized = file.split(path.sep).join("/");
  const dotIndex = normalized.lastIndexOf(".");
  return normalized.substring(0, dotIndex === -1 ? normalized.length : dotIndex);
}

async function buildScript(entryPath: string, scriptId: string, module: { scriptMeta: MonkeyUserScript }): Promise<number> {
  await build({
    configFile: false,
    logLevel: "silent",
    build: {
      outDir: "dist",
      emptyOutDir: false,
      rollupOptions: {
        input: entryPath,
        treeshake: {
          moduleSideEffects: false,
        },
      },
      minify: "esbuild",
    },
    plugins: [
      {
        name: "boilerplate-purifier",
        enforce: "pre",
        transform(code, id) {
          if (id.endsWith(".ts")) {
            return code.replace(/ScriptMetaUtil\.construct/g, "/* @__PURE__ */ ScriptMetaUtil.construct");
          }
        },
      },
      monkey({
        entry: entryPath,
        userscript: module.scriptMeta,
        build: {
          fileName: `${scriptId}.user.js`,
          externalGlobals: {
            dexie: cdn.jsdelivr("Dexie", "dist/dexie.min.js"),
            "lz-string": cdn.jsdelivr("LZString", "libs/lz-string.min.js"),
          },
        },
      }),
    ],
  });
  const expectedFilePath = path.resolve(`dist/${scriptId}.user.js`);
  if (fs.existsSync(expectedFilePath)) {
    return fs.statSync(expectedFilePath).size;
  }
  return -1;
}

// Yes, not my code, and I like it.
// https://web.archive.org/web/20120507054320/http://codeaid.net/javascript/convert-size-in-bytes-to-human-readable-format-(javascript)
function formatBytes(bytes: number, decimals: number = 2) {
    if (!+bytes) return '0 byte'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = [' byte', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))}${sizes[i]}`
}


async function buildAll() {
  console.log("./crystallized-chasm: Starting build process..");
  const vite = await createServer({ server: { middlewareMode: true } });
  const files = findTypeScripts("src/scripts");
  const allBuildStart = performance.now();
  console.log(`./crystallized-chasm: ${files.length} files found, starting module build`);
  for (const file of files) {
    const entryPath = path.join("src/scripts", file);

    const module = (await vite.ssrLoadModule(entryPath)) as { scriptMeta?: MonkeyUserScript };
    const scriptId = asPureFileName(file);
    if (!module.scriptMeta) {
      console.error(`./crystallized-chasm (Build): No exported meta found; Skipping ${file}`);
      continue;
    }
    const buildStart = performance.now();
    console.log(`./crystallized-chasm (${scriptId}): Building script..`);
    const fileSize = await buildScript(entryPath, scriptId, module as { scriptMeta: MonkeyUserScript });
    if (fileSize === -1) {
      console.log(`./crystallized-chasm (${scriptId}): Script build failed in ${Math.round(performance.now() - buildStart)}ms`);
    } else {
      console.log(`./crystallized-chasm (${scriptId}): Script build completed in ${Math.round(performance.now() - buildStart)}ms (${formatBytes(fileSize)})`);
    }
  }

  await vite.close();
  console.log(`./crystallized-chasm: Full script build completed in ${Math.round(performance.now() - allBuildStart)}ms`);
}

buildAll();
