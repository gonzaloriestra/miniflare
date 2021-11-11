#!/usr/bin/env node
// @ts-check
import childProcess from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import semiver from "semiver";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Miniflare makes extensive use of new Web Standards added in recent versions
// of Node.js (streams, crypto, Blob, EventTarget). The most recent thing
// Miniflare uses is the "stream/consumers" module, which was added in 16.7.0.
const MIN_NODE_VERSION = "16.7.0";

async function main() {
  if (semiver(process.versions.node, MIN_NODE_VERSION) < 0) {
    const { red } = await import("kleur/colors");
    // Note Volta and nvm are also recommended in the official docs:
    // https://developers.cloudflare.com/workers/get-started/guide#2-install-the-workers-cli
    console.log(
      red(
        `[mf:err] Miniflare requires at least Node.js ${MIN_NODE_VERSION}. 
You should use the latest Node.js version if possible, as Cloudflare Workers use a very up-to-date version of V8.
Consider using a Node.js version manager such as https://volta.sh/ or https://github.com/nvm-sh/nvm.`
      )
    );
    process.exitCode = 1;
    return;
  }

  // Spawn a new process using the same Node.js executable and passing the same
  // command line arguments, but with required flags for modules support.
  //
  // This is the only cross-platform way of doing this I can think of. On
  // Mac/Linux, we can use "#!/usr/bin/env -S node ..." as a shebang, but this
  // won't work on Windows (or older Linux versions, e.g. Ubuntu 18.04). If you
  // can think of a better way of doing this, please open a GitHub issue.
  childProcess
    .spawn(
      process.execPath,
      [
        "--experimental-vm-modules",
        ...process.execArgv,
        path.join(__dirname, "dist", "src", "cli.js"),
        ...process.argv.slice(2),
      ],
      { stdio: "inherit" }
    )
    .on("exit", (code) => process.exit(code ?? 0));
}

void main();
