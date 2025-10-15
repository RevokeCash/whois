import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import walkdir from 'walkdir';
import yaml from 'yaml';
import { writeData } from '../utils';

const CLONE_REPO = 'git@github.com:covalenthq/goldrush-enhanced-spam-lists.git';
const CLONE_PATH = path.join(__dirname, '..', '..', 'temp', 'goldrush-enhanced-spam-lists');
const LISTS_PATH = path.join(CLONE_PATH, 'src', 'lists');

const updateSpamTokens = async () => {
  await importFromCovalent();
};

const importFromCovalent = async (): Promise<void> => {
  console.log('Updating covalent github spam tokens');

  if (existsSync(CLONE_PATH)) {
    execSync(`pushd ${CLONE_PATH} && git pull && popd`);
    console.log('GitHub repository pulled.');
  } else {
    execSync(`git clone ${CLONE_REPO} ${CLONE_PATH}`);
    console.log('GitHub repository cloned.');
  }

  await processSpamTokenFiles();
  console.log('Spam token files written.');

  execSync(`rm -rf ${CLONE_PATH}`);
  console.log('GitHub repository removed.');
};

const processSpamTokenFiles = async () => {
  const paths = walkdir
    .sync(LISTS_PATH)
    .filter((filePath) => filePath.endsWith('.yaml') && !filePath.includes('maybe'));

  for (const filePath of paths) {
    console.log(`Processing ${filePath}`);
    const spamContracts = yaml.parse(readFileSync(filePath, 'utf-8')).SpamContracts;
    await Promise.all(
      spamContracts.map(async (spamContract: string) => {
        const [chainId, address, confidence] = spamContract.split('/');
        if (parseInt(confidence) < 20) return;
        return writeData('generated', 'tokens', chainId, address, { isSpam: true });
      }),
    );
  }
};

updateSpamTokens();
