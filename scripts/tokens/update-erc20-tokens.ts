import { ChainId, chains } from '@revoke.cash/chains';
import { sleep, writeData } from 'scripts/utils';
import { allChainIds } from 'scripts/utils/constants';
import { Address, getAddress, isAddress } from 'viem';
import { TokenData, TokenMapping } from '../utils/types';

const isEmpty = (obj?: any) => Object.keys(obj ?? {}).length === 0;

const getTokenMapping = async (chainId: number): Promise<TokenMapping | undefined> => {
  const tokenlistMapping = await getTokenMappingFromTokenLists(chainId);
  const coingeckoMapping = await getTokenMappingFromCoinGecko(chainId);
  const oneInchMapping = await getTokenMappingFrom1inch(chainId);

  if (isEmpty(tokenlistMapping) && isEmpty(coingeckoMapping) && isEmpty(oneInchMapping)) return undefined;

  return { ...tokenlistMapping, ...oneInchMapping, ...coingeckoMapping };
};

const coingeckoChainsPromise = fetch('https://api.coingecko.com/api/v3/asset_platforms').then((res) => res.json());

const getTokenMappingFromCoinGecko = async (chainId: number): Promise<TokenMapping | undefined> => {
  try {
    const chains = await coingeckoChainsPromise;
    const coingeckoChainId = chains?.find((chain: any) => chain?.chain_identifier === chainId)?.id;
    if (!coingeckoChainId) return undefined;

    const url = `https://tokens.coingecko.com/${coingeckoChainId}/all.json`;

    const { tokens } = await fetch(url).then((res) => res.json());

    const tokenMapping = {};
    for (const token of tokens) {
      if (!isAddress(token.address)) continue;
      tokenMapping[getAddress(token.address)] = {
        ...token,
        logoURI: token?.logoURI?.replace(/\.png\?.+/i, '.png')?.replace(/\.jpg\?.+/i, '.jpg'),
      };
    }

    return tokenMapping;
  } catch (e) {
    console.log('              CoinGecko Error:', e.message);
    return undefined;
  }
};

const getTokenMappingFrom1inch = async (chainId: number): Promise<TokenMapping | undefined> => {
  try {
    const tokens = await fetch(`https://tokens.1inch.io/v1.2/${chainId}`).then((res) => res.json());

    const tokenMapping = {};
    for (const token of Object.values<any>(tokens)) {
      if (!isAddress(token.address)) continue;
      tokenMapping[getAddress(token.address)] = token;
    }

    return tokenMapping as TokenMapping;
  } catch (e) {
    if (!e?.response?.data?.message?.includes('invalid chain id')) {
      console.log('              1inch Error:', e.message);
    }
    return undefined;
  }
};

const getTokenList = async (url: string, chainId?: number) => {
  if (url.startsWith('/')) {
    url = `https://raw.githubusercontent.com${url}`;
  }

  const res = await fetch(url).then((res) => res.json());

  if (res.tokens) {
    return res.tokens.map((token: any) => ({
      ...token,
      chainId: chainId ?? token.chainId,
    }));
  }

  return [];
};

// Could get some tokens from:
// - https://github.com/curvefi/curve-assets/tree/main/images
// - https://github.com/kardiachain/token-assets/tree/master

const tokenlistPromise = Promise.all([
  getTokenList('/map3xyz/wanchain-tokenlist/master/tokenlist.json', ChainId.Wanchain),
  getTokenList('/kardiachain/token-assets/master/tokens/mobile-list.json', ChainId.KardiaChainMainnet),
  getTokenList('/yodedex/yodeswap-default-tokenlist/main/yodeswap.tokenlist.json', ChainId.DogechainMainnet),
  getTokenList('/CoinTool-App/cdn/main/json/dogechain.json'),
  getTokenList('/CoinTool-App/cdn/main/json/heco.json'),
  getTokenList('/CoinTool-App/cdn/main/json/movr.json'),
  getTokenList('/CoinTool-App/cdn/main/json/onus.json'),
  getTokenList('/BeamSwap/exosama-tokenlist/main/tokenlist.json'),
  getTokenList('https://unpkg.com/@1hive/default-token-list@5.17.1/build/honeyswap-default.tokenlist.json'),
  getTokenList('https://unpkg.com/quickswap-default-token-list@1.0.91/build/quickswap-default.tokenlist.json'),
  getTokenList('/Ubeswap/default-token-list/master/ubeswap.token-list.json'),
  getTokenList('/DefiKingdoms/community-token-list/main/src/defikingdoms-default.tokenlist.json'),
  getTokenList('/syscoin/syscoin-rollux.github.io/master/rollux.tokenlist.json'),
  getTokenList('/nahmii-community/bridge/main/src/nahmii.tokenlist.json'),
  getTokenList('/etherspot/etherspot-popular-tokens-tokenlist/master/multichain.tokenlist.json'),
  getTokenList('/elkfinance/tokens/main/all.tokenlist.json'),
  fetch('https://raw.githubusercontent.com/izumiFinance/izumi-tokenList/main/build/tokenList.json')
    .then((res) => res.json())
    .then((res) =>
      res.flatMap((token: any) =>
        token.chains.map((chainId) => ({
          symbol: token.symbol,
          address: token.contracts[chainId].address,
          decimals: token.contracts[chainId].decimal,
          logoURI: token.icon,
          chainId,
        })),
      ),
    ),
  fetch('https://raw.githubusercontent.com/viaprotocol/tokenlists/main/all_tokens/all.json')
    .then((res) => res.json())
    .then((res) => Object.values(res).flat()),
  getTokenList('/scroll-tech/token-list/main/scroll.tokenlist.json'),
  getTokenList('/pangolindex/tokenlists/main/pangolin.tokenlist.json'),
  getTokenList('https://static.optimism.io/optimism.tokenlist.json'),
  getTokenList('https://tokens.uniswap.org'),
]).then((lists) => lists.flat());

const getTokenMappingFromTokenLists = async (chainId: number): Promise<TokenMapping | undefined> => {
  try {
    const tokens = await tokenlistPromise;

    const tokenMapping = {};
    for (const token of Object.values<any>(tokens)) {
      if (token.chainId !== chainId) continue;
      if (!isAddress(token.address)) continue;

      // I don't know why, but KardiaChain decided they could just use completely different terms for their tokenlist -_-
      tokenMapping[getAddress(token.address)] = {
        ...token,
        symbol: token.symbol ?? token.tokenSymbol,
        decimals: token.decimals ?? token.decimal,
        logoURI: token.logoURI ?? token.logo,
      };
    }

    if (Object.keys(tokenMapping).length === 0) return undefined;

    return tokenMapping as TokenMapping;
  } catch (e) {
    console.log('              TokenList Error:', e.message);
    return undefined;
  }
};

const writeToken = async (token: TokenData, address: Address, chainId: number) => {
  // For some reason some tokenlists have 0x0 as a token
  if (address === '0x0000000000000000000000000000000000000000') return;
  if (!token.logoURI || !token.symbol) return;

  await writeData('generated', 'tokens', chainId, address, token);
};

const updateErc20Tokenlist = async () => {
  console.log('Updating ERC20 tokens');

  for (const chainId of allChainIds) {
    const mapping = await getTokenMapping(chainId);

    const chainString = `${chains.getById(chainId).name} (${String(chainId)})`.padEnd(40, ' ');
    if (!mapping) {
      console.log(chainString, 'Not found');
      continue;
    }

    console.log(chainString, `Found ${Object.keys(mapping).length} tokens`);

    await Promise.all(
      Object.entries(mapping).map(([address, token]) => writeToken(token, address as Address, chainId)),
    );

    // Wait for rate limiting (50/min)
    await sleep(2000);
  }
};

updateErc20Tokenlist();
