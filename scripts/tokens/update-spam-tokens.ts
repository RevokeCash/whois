import { ChainId } from '@revoke.cash/chains';
import { getAddress } from 'viem';
import { writeData } from '../utils';

interface Chain {
  chainId: number | string;
  chainSlug: string;
}

const chains: Chain[] = [
  { chainId: ChainId.EthereumMainnet, chainSlug: 'eth-mainnet' },
  // { chainId: ChainId.Abstract, chainSlug: 'abstract-mainnet' },
  // { chainId: ChainId.AnimechainMainnet, chainSlug: 'anime-mainnet' },
  // { chainId: ChainId.ApeChain, chainSlug: 'apechain-mainnet' },
  { chainId: ChainId.ArbitrumOne, chainSlug: 'arb-mainnet' },
  // { chainId: ChainId.ArbitrumNova, chainSlug: 'arbnova-mainnet' },
  { chainId: ChainId['AvalancheC-Chain'], chainSlug: 'avax-mainnet' },
  // { chainId: ChainId.Base, chainSlug: 'base-mainnet' },
  // { chainId: ChainId.Berachain, chainSlug: 'berachain-mainnet' },
  { chainId: ChainId.BlastMainnet, chainSlug: 'blast-mainnet' },
  { chainId: ChainId.BNBSmartChainMainnet, chainSlug: 'bnb-mainnet' },
  // { chainId: ChainId.CeloMainnet, chainSlug: 'celo-mainnet' },
  { chainId: ChainId.Gnosis, chainSlug: 'gnosis-mainnet' },
  // { chainId: ChainId.Lens, chainSlug: 'lens-mainnet' },
  // { chainId: ChainId.Linea, chainSlug: 'linea-mainnet' },
  // { chainId: ChainId.PolygonMainnet, chainSlug: 'polygon-mainnet' },
  // { chainId: ChainId.OPMainnet, chainSlug: 'opt-mainnet' },
  // { chainId: ChainId.RoninMainnet, chainSlug: 'ronin-mainnet' },
  // { chainId: ChainId.Scroll, chainSlug: 'scroll-mainnet' },
  // { chainId: ChainId.Settlus, chainSlug: 'settlus-mainnet' },
  // { chainId: ChainId.Shape, chainSlug: 'shape-mainnet' },
  // { chainId: ChainId.Soneium, chainSlug: 'soneium-mainnet' },
  // { chainId: '23448594291968334', chainSlug: 'starknet-mainnet' },
  // { chainId: ChainId.Story, chainSlug: 'story-mainnet' },
  { chainId: ChainId.Unichain, chainSlug: 'unichain-mainnet' },
  { chainId: ChainId.WorldChain, chainSlug: 'worldchain-mainnet' },
  // { chainId: ChainId.ZetaChainMainnet, chainSlug: 'zetachain-mainnet' },
  { chainId: ChainId.ZkSyncMainnet, chainSlug: 'zksync-mainnet' },
  // { chainId: ChainId.Zora, chainSlug: 'zora-mainnet' },
];

const importSpamTokens = async ({ chainId, chainSlug }: Chain) => {
  const url = `https://${chainSlug}.g.alchemy.com/nft/v3/${process.env.ALCHEMY_API_KEY}/getSpamContracts`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`[${chainSlug}] Failed to fetch spam tokens: ${await res.text()}`);
  }

  const data = await res.json();

  console.log(`[${chainSlug}] Found ${data?.contractAddresses?.length ?? 0} spam tokens`);

  data?.contractAddresses?.forEach(async (tokenAddress: string) => {
    await writeData('generated', 'tokens', String(chainId), getAddress(tokenAddress), {
      isSpam: true,
      note: 'Source: Alchemy',
    });
  });
};

const updateSpamTokens = async () => {
  for (const chain of chains) {
    await importSpamTokens(chain);
  }
};

updateSpamTokens();
