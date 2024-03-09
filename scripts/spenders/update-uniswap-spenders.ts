import { ChainId } from '@revoke.cash/chains';
import { execSync } from 'child_process';
import { readFile } from 'fs/promises';
import path from 'path';
import walkdir from 'walkdir';
import { writeData } from '../utils';

const CLONE_REPO = 'git@github.com:Uniswap/universal-router';
const CLONE_PATH = path.join(__dirname, '..', '..', 'temp', 'uniswap-universal-router');
const DEPLOYMENTS_PATH = path.join(CLONE_PATH, 'deploy-addresses');

const processChainFiles = async (): Promise<void> => {
  const paths = walkdir.sync(DEPLOYMENTS_PATH).filter((filePath) => filePath.endsWith('.json'));
  await Promise.all(paths.map(processChainFile));
};

const processChainFile = async (filePath: string) => {
  const slugToChainId: Record<string, number> = {
    'arbitrum-goerli': ChainId.ArbitrumGoerli,
    arbitrum: ChainId.ArbitrumOne,
    avalanche: ChainId['AvalancheC-Chain'],
    'base-goerli': ChainId.BaseGoerliTestnet,
    base: ChainId.Base,
    bsc: ChainId.BNBSmartChainMainnet,
    'celo-alfajores': ChainId.CeloAlfajoresTestnet,
    celo: ChainId.CeloMainnet,
    goerli: ChainId.Goerli,
    mainnet: ChainId.EthereumMainnet,
    'optimism-goerli': ChainId.OptimismGoerliTestnet,
    optimism: ChainId.OPMainnet,
    'polygon-mumbai': ChainId.Mumbai,
    polygon: ChainId.PolygonMainnet,
    sepolia: ChainId.Sepolia,
  };

  const chainSlug = filePath.replace(`${DEPLOYMENTS_PATH}/`, '').replace('.json', '');

  const chainId = String(slugToChainId[chainSlug]);

  if (!chainId) {
    throw new Error(`Unknown chain slug: ${chainSlug}`);
  }

  const contents = await readFile(filePath, 'utf-8').then((contents) => JSON.parse(contents));

  for (const key of Object.keys(contents)) {
    if (key === 'UniversalRouter') {
      await writeData('generated', 'spenders', chainId, contents.UniversalRouter, {
        name: 'Uniswap (old)',
        label: 'Uniswap: Universal Router v1.1',
      });
    } else if (key === 'UniversalRouterV1_2') {
      await writeData('generated', 'spenders', chainId, contents.UniversalRouterV1_2, {
        name: 'Uniswap',
        label: 'Uniswap: Universal Router v1.2',
      });
    } else if (key === 'UniversalRouterV1_3') {
      await writeData('generated', 'spenders', chainId, contents.UniversalRouterV1_3, {
        name: 'Uniswap',
        label: 'Uniswap: Universal Router v1.3',
      });
    } else if (key === 'UniversalRouterV1_2_V2Support') {
      await writeData('generated', 'spenders', chainId, contents.UniversalRouterV1_2_V2Support, {
        name: 'Uniswap',
        label: 'Uniswap: Universal Router v1.2 (v2 Support)',
      });
    } else if (key === 'UnsupportedProtocol') {
      // pass
    } else {
      throw new Error(`Unknown spender: ${key}`);
    }
  }
};

const importFromUniswap = async (): Promise<void> => {
  console.log('Updating uniswap github spenders');

  execSync(`rm -rf ${CLONE_PATH}`);
  execSync(`git clone ${CLONE_REPO} ${CLONE_PATH}`);
  console.log('GitHub repository cloned.');

  await processChainFiles();
  console.log('Spender files written.');

  execSync(`rm -rf ${CLONE_PATH}`);
  console.log('GitHub repository removed.');
};

importFromUniswap();
