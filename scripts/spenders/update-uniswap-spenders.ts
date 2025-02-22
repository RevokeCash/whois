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
    'base-sepolia': ChainId.BaseSepoliaTestnet,
    base: ChainId.Base,
    blast: ChainId.BlastMainnet,
    bsc: ChainId.BNBSmartChainMainnet,
    'celo-alfajores': ChainId.CeloAlfajoresTestnet,
    celo: ChainId.CeloMainnet,
    goerli: ChainId.Goerli,
    ink: ChainId.Ink,
    mainnet: ChainId.EthereumMainnet,
    'op-sepolia': ChainId.OPSepoliaTestnet,
    'optimism-goerli': ChainId.OptimismGoerliTestnet,
    optimism: ChainId.OPMainnet,
    'polygon-mumbai': ChainId.Mumbai,
    polygon: ChainId.PolygonMainnet,
    sepolia: ChainId.Sepolia,
    soneium: ChainId.Soneium,
    'unichain-sepolia': ChainId.UnichainSepoliaTestnet,
    unichain: ChainId.Unichain,
    worldchain: ChainId.WorldChain,
    zora: ChainId.Zora,
  };

  const chainSlug = filePath.replace(`${DEPLOYMENTS_PATH}/`, '').replace('.json', '');

  const chainId = String(slugToChainId[chainSlug]);

  if (!chainId) {
    throw new Error(`Unknown chain slug: ${chainSlug}`);
  }

  const contents = await readFile(filePath, 'utf-8').then((contents) => JSON.parse(contents));

  for (const [key, value] of Object.entries<string>(contents)) {
    if (key === 'UniversalRouterV1') {
      await writeData('generated', 'spenders', chainId, value, {
        name: 'Uniswap (old)',
        label: 'Uniswap: Universal Router v1',
        riskFactors: [{ type: 'deprecated', source: 'whois' }],
      });
    } else if (key === 'UniversalRouterV1_1') {
      await writeData('generated', 'spenders', chainId, value, {
        name: 'Uniswap (old)',
        label: 'Uniswap: Universal Router v1.1',
        riskFactors: [{ type: 'deprecated', source: 'whois' }],
      });
    } else if (key === 'UniversalRouterV1_2') {
      await writeData('generated', 'spenders', chainId, value, {
        name: 'Uniswap',
        label: 'Uniswap: Universal Router v1.2',
      });
    } else if (key === 'UniversalRouterV1_3') {
      await writeData('generated', 'spenders', chainId, value, {
        name: 'Uniswap',
        label: 'Uniswap: Universal Router v1.3',
      });
    } else if (key === 'UniversalRouterV1_2_V2Support') {
      await writeData('generated', 'spenders', chainId, value, {
        name: 'Uniswap',
        label: 'Uniswap: Universal Router v1.2 (Uniswap v2 Support)',
      });
    } else if (key === 'UniversalRouterV1_2_NoV2Support') {
      await writeData('generated', 'spenders', chainId, value, {
        name: 'Uniswap',
        label: 'Uniswap: Universal Router v1.2 (no Uniswap v2 support)',
      });
    } else if (key === 'UniversalRouterV2') {
      await writeData('generated', 'spenders', chainId, value, {
        name: 'Uniswap',
        label: 'Uniswap: Universal Router v2',
      });
    } else if (key === 'UniversalRouterV2_NoV2V3Support') {
      await writeData('generated', 'spenders', chainId, value, {
        name: 'Uniswap',
        label: 'Uniswap: Universal Router v2 (no Uniswap v2/v3 support)',
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
