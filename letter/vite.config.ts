import { viteSingleFile } from 'vite-plugin-singlefile';
import { createHtmlPlugin } from 'vite-plugin-html';
import { createLogger } from 'vite';
import fs from 'fs';

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

const letterCanisterId = getCanisterId(DFX_NETWORK, 'letter');

const config = {
  plugins: [
    viteSingleFile(),

    createHtmlPlugin({
      minify: false,
      inject: {
        data: {
          siteUrl:
            DFX_NETWORK === 'ic'
              ? `https://${letterCanisterId}.ic0.app`
              : `http://${letterCanisterId}.localhost:8000`,
          siteDomain:
            DFX_NETWORK === 'ic'
              ? `${letterCanisterId}.ic0.app`
              : `${letterCanisterId}.localhost:8000`,
        },
      },
    }),
  ],
};

export default config;
