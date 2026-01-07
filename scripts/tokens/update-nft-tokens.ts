import { ChainId } from '@revoke.cash/chains';
import { Address, getAddress } from 'viem';
import { sleep, writeData } from '../utils';
import { TokenData } from '../utils/types';

interface Chain {
  chainId: number;
  chainSlug: string;
  maxPages?: number;
}

const chains: Array<Chain> = [
  {
    chainId: ChainId.BlastMainnet,
    chainSlug: 'blast',
  },
  {
    chainId: ChainId.Base,
    chainSlug: 'base',
  },
  {
    chainId: ChainId.EthereumMainnet,
    chainSlug: 'ethereum',
    maxPages: 200,
  },
  {
    chainId: ChainId.Zora,
    chainSlug: 'zora',
  },
  {
    chainId: ChainId.ArbitrumOne,
    chainSlug: 'arbitrum',
  },
  {
    chainId: ChainId.SeiNetwork,
    chainSlug: 'sei',
  },
  {
    chainId: ChainId['AvalancheC-Chain'],
    chainSlug: 'avalanche',
  },
  {
    chainId: ChainId.PolygonMainnet,
    chainSlug: 'polygon',
  },
  {
    chainId: ChainId.OPMainnet,
    chainSlug: 'optimism',
  },
  {
    chainId: ChainId.ApeChain,
    chainSlug: 'ape_chain',
  },
  {
    chainId: ChainId.FlowEVMMainnet,
    chainSlug: 'flow',
  },
  {
    chainId: ChainId.Soneium,
    chainSlug: 'soneium',
  },
  {
    chainId: ChainId.RoninMainnet,
    chainSlug: 'ronin',
  },
  {
    chainId: ChainId.Berachain,
    chainSlug: 'bera_chain',
  },
  // {
  //   chainId: ChainId.SolanaMainnet,
  //   chainSlug: 'solana',
  // },
  {
    chainId: ChainId.Shape,
    chainSlug: 'shape',
  },
  {
    chainId: ChainId.Unichain,
    chainSlug: 'unichain',
  },
  // {
  //   chainId: ChainId.GunzillaMainnet,
  //   chainSlug: 'gunzilla',
  // },
  {
    chainId: ChainId.Abstract,
    chainSlug: 'abstract',
  },
  {
    chainId: ChainId.ImmutablezkEVM,
    chainSlug: 'immutable',
  },
  {
    chainId: ChainId.HyperliquidEVMTestnet,
    chainSlug: 'hyperevm',
  },
  {
    chainId: 5031,
    chainSlug: 'somnia',
  },
  {
    chainId: ChainId.BNBSmartChainMainnet,
    chainSlug: 'bsc',
  },
  {
    chainId: ChainId.MonadMainnet,
    chainSlug: 'monad',
  },
  // {
  //   chainId: ChainId.HyperliquidMainnet,
  //   chainSlug: 'hyperliquid',
  // },
  // {
  //   chainId: ChainId.MegaethMainnet,
  //   chainSlug: 'megaeth',
  // },
];

const updateNftTokenlist = async ({ chainId, chainSlug, maxPages = 20 }: Chain) => {
  const baseUrl = `https://api.opensea.io/api/v2/collections?chain=${chainSlug}&limit=50&include_hidden=false&order_by=market_cap`;
  console.log('Updating NFTs for', chainSlug);

  let url = baseUrl;

  let retrievedMapping: Record<Address, TokenData> = {};

  for (let i = 0; i < maxPages; i++) {
    console.log(`[${chainSlug}] (${i + 1}/${maxPages}) ${url}`);

    const res = await fetch(url, { headers: { 'x-api-key': process.env.OPENSEA_API_KEY } });
    if (!res.ok) {
      console.error(await res.text());
      throw new Error(`Failed to fetch NFT tokenlist`);
    }

    const { collections, next } = await res.json();

    const entries = collections.map((collection) => {
      const { contracts, name, image_url } = collection;
      const primaryContract = contracts?.find((contract) => contract.chain === chainSlug);

      if (!image_url || !name || !primaryContract) return undefined;

      const address = getAddress(primaryContract.address);
      const nft = { symbol: name, logoURI: image_url };

      return [address, nft];
    });

    // Merge the new entries with the existing ones (prefer the old ones = highest volume)
    const mapping = Object.fromEntries(entries.filter((entry) => !!entry));
    retrievedMapping = { ...mapping, ...retrievedMapping };

    // Cut off if we're below a certain volume
    if (next) {
      url = `${baseUrl}&next=${next}`;
      await sleep(1000);
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
