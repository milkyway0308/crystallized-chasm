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

async function buildScript(entryPath: string, scriptId: string, module: { scriptMeta: MonkeyUserScript }) {
  await build({
    configFile: false,
    build: {
      outDir: "dist",
      emptyOutDir: false,
      rollupOptions: {
        input: entryPath,
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
}

async function buildAll() {
  console.log("./crystallized-chasm: Starting build process..");
  const vite = await createServer({ server: { middlewareMode: true } });
  const files = findTypeScripts("src");
  const allBuildStart = performance.now();
  console.log(`./crystallized-chasm: ${files.length} files found, starting module build`);
  for (const file of files) {
    const entryPath = path.join("src", file);

    const module = (await vite.ssrLoadModule(entryPath)) as { scriptMeta?: MonkeyUserScript };
    const scriptId = asPureFileName(file);
    if (!module.scriptMeta) {
      console.error(`./crystallized-chasm (Build): No exported meta found; Skipping ${file}`);
      continue;
    }
    const buildStart = performance.now();
    console.log(`./crystallized-chasm (${scriptId}): Building script..`);
    await buildScript(entryPath, scriptId, module as { scriptMeta: MonkeyUserScript });
    console.log(`./crystallized-chasm (${scriptId}): Script build completed in ${Math.round(performance.now() - buildStart)}ms`);
  }

  await vite.close();
  console.log(`./crystallized-chasm: Full script build completed in ${Math.round(performance.now() - allBuildStart)}ms`);
}

buildAll();
