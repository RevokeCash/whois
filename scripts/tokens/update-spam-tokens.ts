import { ChainId } from '@revoke.cash/chains';
import { Address } from 'viem';
import { writeData } from '../utils';
import { ALCHEMY_API_KEY } from '../utils/constants';

const updateSpamTokens = async () => {
  console.log('Updating spam tokens');

  const chains = [ChainId.EthereumMainnet, ChainId.PolygonMainnet];
  for (const chainId of chains) {
    await updateSpamTokensForChain(chainId);
  }
};

const updateSpamTokensForChain = async (chainId: number) => {
  const urls = {
    [ChainId.EthereumMainnet]: `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getSpamContracts`,
    [ChainId.PolygonMainnet]: `https://polygon-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getSpamContracts`,
  };

  const res = await fetch(urls[chainId]);

  if (!res.ok) {
    throw new Error(`Failed to fetch spam tokens for chain ${chainId}`);
  }

  const { contractAddresses: spamTokens }: { contractAddresses: Address[] } = await res.json();

  await Promise.all(spamTokens.map((address) => writeData('generated', 'tokens', chainId, address, { isSpam: true })));
};

updateSpamTokens();
