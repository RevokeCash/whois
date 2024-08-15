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
      riskFactors: [{ type: 'blocklist', source: 'scamsniffer' }],
    };

    await writeData('generated', 'spenders', 'scamsniffer', identifier, spenderData);
  });

  // TODO: Add https://github.com/forta-network/labelled-datasets/blob/main/labels/1/phishing_scams.csv
  // TODO: Add https://github.com/forta-network/labelled-datasets/blob/main/labels/1/etherscan_malicious_labels.csv
};

run();
