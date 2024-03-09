import { Address } from 'viem';
import { writeData } from '../utils';
import { allChainIds } from '../utils/constants';
import { SpenderData } from '../utils/types';

// Universal Spenders should be added to every chain (e.g. Permit2)
const UNIVERSAL_SPENDERS: Record<Address, SpenderData> = {
  '0x000000000022D473030F116dDEE9F6B43aC78BA3': {
    name: 'Permit2',
    label: 'Permit2',
  },
};

console.log('Updating universal spenders');

allChainIds.forEach((chainId) => {
  Object.entries(UNIVERSAL_SPENDERS).forEach(async ([address, spender]) => {
    await writeData('generated', 'spenders', String(chainId), address, spender);
  });
});
