import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { createLogger, defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import fs from 'fs';
import { createHtmlPlugin } from 'vite-plugin-html';

const logger = createLogger();

const DFX_NETWORK = process.env.DFX_NETWORK || 'local';

function getCanisterId(network: string, canister: 'letter' | 'dapp'): string {
  if (network === 'ic') {
    try {
      return JSON.parse(
        fs.readFileSync('../canister_ids.json', { encoding: 'utf-8' })
      )[canister].ic;
    } catch {
      logger.error(
        `Error loading canister_ids.json. Please run \`dfx deploy --network ic\` first.`
      );
      process.exit(1);
    }
  } else {
    try {
      return JSON.parse(
        fs.readFileSync('../.dfx/local/canister_ids.json', {
          encoding: 'utf-8',
        })
      )[canister].local;
    } catch {
      logger.error(
        `Error finding local ${canister} canister id. Please run \`dfx canister create --all\` first.`
      );
      process.exit(1);
    }
  }
}

const config = defineConfig((mode) => {
  const dappCanisterId = getCanisterId(DFX_NETWORK, 'dapp');
  const letterCanisterId = getCanisterId(DFX_NETWORK, 'letter');

  return {
    plugins: [
      viteSingleFile(),
      createHtmlPlugin({
        minify: false,
        inject: {
          data: {
            siteUrl:
              DFX_NETWORK === 'ic'
                ? `https://${dappCanisterId}.ic0.app`
                : `http://${dappCanisterId}.localhost:8000`,
            siteDomain:
              DFX_NETWORK === 'ic'
                ? `${dappCanisterId}.ic0.app`
                : `${dappCanisterId}.localhost:8000`,
          },
        },
      }),
    ],
    // Node polyfill agent-js. Thanks solution shared by chovyfu on the Discord channel.
    // https://stackoverflow.com/questions/71744659/how-do-i-deploy-a-sveltekit-app-to-a-dfinity-container
    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: 'globalThis',
        },
        // Enable esbuild polyfill plugins
        plugins: [
          NodeGlobalsPolyfillPlugin({
            buffer: true,
          }),
        ],
      },
    },
    define: {
      DFX_NETWORK: JSON.stringify(DFX_NETWORK),
      LETTER_CANISTER_ID: JSON.stringify(letterCanisterId),
    },
  };
});

export default config;
