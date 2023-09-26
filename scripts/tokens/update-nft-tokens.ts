import { Address, getAddress } from 'viem';
import { TokenData } from '../utils/types';
import { sleep, writeData } from '../utils';

// Inspired by https://github.com/verynifty/RolodETH/blob/main/sources/reservoir/index.js

const RESERVOIR_API_URL =
  'https://api.reservoir.tools/collections/v5?includeTopBid=false&sortBy=allTimeVolume&limit=20';

const updateNftTokenlist = async () => {
  console.log('Updating NFTs');

  let shouldContinue = true;
  let url = RESERVOIR_API_URL;

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

      if (currentVolume < 100 || !image || !primaryContract || !name) return undefined;
      if (name === 'Slokh') return undefined; // For some reason 'Slokh' is returned for certain incorrect NFTs

      const address = getAddress(primaryContract);
      const nft = { symbol: name, logoURI: image };

      return [address, nft];
    });

    // Merge the new entries with the existing ones (prefer the old ones = highest volume)
    const mapping = Object.fromEntries(entries.filter((entry) => !!entry));
    retrievedMapping = { ...mapping, ...retrievedMapping };

    // Cut off if we're below a certain volume
    if (continuation && currentVolume > 100) {
      url = `${RESERVOIR_API_URL}&continuation=${continuation}`;
      await sleep(1000);
    } else {
      shouldContinue = false;
    }
  }

  // Merge with the existing mapping and write to file (prefer the new data)
  await Promise.all(Object.entries(retrievedMapping).map(([address, token]) => writeData('generated', 'tokens', 1, address as Address, token)));
};

updateNftTokenlist();
