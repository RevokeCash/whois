import { ChainId } from '@revoke.cash/chains';
import { Address, getAddress } from 'viem';
import { sleep, writeData } from '../utils';
import { TokenData } from '../utils/types';

// Inspired by https://github.com/verynifty/RolodETH/blob/main/sources/reservoir/index.js

interface Chain {
  chainId: ChainId;
  baseUrl: string;
  minVolume: number;
}

const chains: Array<Chain> = [
  {
    chainId: ChainId.EthereumMainnet,
    baseUrl: 'https://api.reservoir.tools',
    minVolume: 100, // ETH
  },
  {
    chainId: ChainId.OPMainnet,
    baseUrl: 'https://api-optimism.reservoir.tools',
    minVolume: 100, // ETH
  },
  {
    chainId: ChainId.PolygonMainnet,
    baseUrl: 'https://api-polygon.reservoir.tools',
    minVolume: 200_000, // MATIC
  },
  {
    chainId: ChainId.BNBSmartChainMainnet,
    baseUrl: 'https://api-bsc.reservoir.tools',
    minVolume: 1_000, // BNB
  },
  {
    chainId: ChainId.ArbitrumOne,
    baseUrl: 'https://api-arbitrum.reservoir.tools',
    minVolume: 100, // ETH
  },
  {
    chainId: ChainId.Base,
    baseUrl: 'https://api-base.reservoir.tools',
    minVolume: 100, // ETH
  },
  {
    chainId: ChainId.Zora,
    baseUrl: 'https://api-zora.reservoir.tools',
    minVolume: 100, // ETH
  },
  {
    chainId: ChainId.Linea,
    baseUrl: 'https://api-linea.reservoir.tools',
    minVolume: 100, // ETH
  },
  {
    chainId: ChainId['AvalancheC-Chain'],
    baseUrl: 'https://api-avalanche.reservoir.tools',
    minVolume: 10_000, // AVAX
  },
  {
    chainId: ChainId.ZkSyncMainnet,
    baseUrl: 'https://api-zksync.reservoir.tools',
    minVolume: 100, // ETH
  },
  {
    chainId: ChainId.PolygonzkEVM,
    baseUrl: 'https://api-polygon-zkevm.reservoir.tools',
    minVolume: 100, // ETH
  },
  {
    chainId: ChainId.Scroll,
    baseUrl: 'https://api-scroll.reservoir.tools',
    minVolume: 100, // ETH
  },
];

const updateNftTokenlist = async ({ chainId, baseUrl, minVolume }: Chain) => {
  const BASE_URL = `${baseUrl}/collections/v5?includeTopBid=false&sortBy=allTimeVolume&limit=20`;
  console.log('Updating NFTs');

  let shouldContinue = true;
  let url = BASE_URL;

  let retrievedMapping: Record<Address, TokenData> = {};

  while (shouldContinue) {
    console.log(url);

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch NFT tokenlist`);
    }

    const { collections, continuation } = await res.json();

    let currentVolume = Infinity;

    const entries = collections.map((collection) => {
      const { primaryContract, name, image, volume } = collection;
      currentVolume = volume?.allTime;

      if (currentVolume < minVolume || !image || !primaryContract || !name) return undefined;
      if (name === 'Slokh') return undefined; // For some reason 'Slokh' is returned for certain incorrect NFTs

      const address = getAddress(primaryContract);
      const nft = { symbol: name, logoURI: image };

      return [address, nft];
    });

    // Merge the new entries with the existing ones (prefer the old ones = highest volume)
    const mapping = Object.fromEntries(entries.filter((entry) => !!entry));
    retrievedMapping = { ...mapping, ...retrievedMapping };

    // Cut off if we're below a certain volume
    if (continuation && currentVolume > minVolume) {
      url = `${BASE_URL}&continuation=${continuation}`;
      await sleep(1000);
    } else {
      shouldContinue = false;
    }
  }

  // Merge with the existing mapping and write to file (prefer the new data)
  await Promise.all(
    Object.entries(retrievedMapping).map(([address, token]) =>
      writeData('generated', 'tokens', String(chainId), address, token),
    ),
  );
};

const run = async () => {
  for (const chain of chains) {
    await updateNftTokenlist(chain);
  }
};

run();
