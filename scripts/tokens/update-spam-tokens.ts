import { ChainId } from '@revoke.cash/chains';
import { Address } from 'viem';
import { writeData } from '../utils';
import { ALCHEMY_API_KEY } from '../utils/constants';

const CHAIN_URLS = {
  [ChainId.EthereumMainnet]: `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getSpamContracts`,
  [ChainId.PolygonMainnet]: `https://polygon-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getSpamContracts`,
  // [ChainId.ArbitrumOne]: `https://arb-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getSpamContracts`,
  // [ChainId.OPMainnet]: `https://opt-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getSpamContracts`,
  // [ChainId.Base]: `https://base-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getSpamContracts`,
};

const updateSpamTokens = async () => {
  console.log('Updating spam tokens');

  for (const chainId of Object.keys(CHAIN_URLS)) {
    await updateSpamTokensForChain(Number(chainId));
  }
};

const updateSpamTokensForChain = async (chainId: number) => {
  const res = await fetch(CHAIN_URLS[chainId]);

  if (!res.ok) {
    throw new Error(`Failed to fetch spam tokens for chain ${chainId}: ${await res.text()}`);
  }

  const { contractAddresses: spamTokens }: { contractAddresses: Address[] } = await res.json();

  await Promise.all(
    spamTokens.map((address) => writeData('generated', 'tokens', String(chainId), address, { isSpam: true })),
  );
};

// updateSpamTokens();
