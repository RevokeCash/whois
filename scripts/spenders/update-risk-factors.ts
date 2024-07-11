import { writeData } from '../utils';
import { SCAMSNIFFER_API_KEY } from '../utils/constants';
import { SpenderData } from '../utils/types';

console.log('Updating spender risk factors');

const run = async () => {
  const scamSnifferBlocklist = await fetch('https://lookup-api.scamsniffer.io/v1/blocklist/address', {
    headers: {
      'x-api-key': SCAMSNIFFER_API_KEY,
    },
  }).then((res) => res.json());

  scamSnifferBlocklist.forEach(async (identifier: string) => {
    const spenderData: SpenderData = {
      riskFactors: ['blocklist_scamsniffer'],
    };

    await writeData('generated', 'spenders', 'scamsniffer', identifier, spenderData);
  });
};

run();
