import { execSync } from 'child_process';
import { readFile } from 'fs/promises';
import path from 'path';
import walkdir from 'walkdir';
import { Address } from 'viem';
import { sleep, writeData } from '../utils';

const CLONE_REPO = 'git@github.com:ethereum-lists/contracts.git'
const CLONE_PATH = path.join(__dirname, '..', '..', 'temp', 'ethereum-lists');
const PROJECTS_PATH = path.join(CLONE_PATH, 'projects');
const CONTRACTS_PATH = path.join(CLONE_PATH, 'contracts');

const readProjects = async (): Promise<Record<string, string>> => {
  const paths = walkdir.sync(PROJECTS_PATH).filter((filePath) => filePath.endsWith('.json'));
  const entries = await Promise.all(paths.map(readProject));
  return Object.fromEntries(entries);
}

const readProject = async (filePath: string): Promise<[string, string]> => {
  try {
    const contents = JSON.parse(await readFile(filePath, 'utf-8'));
    const key = filePath.replace(`${PROJECTS_PATH}/`, '').replace('.json', '');
    return [key, contents.name];
  } catch {
    await sleep(1000);
    return readProject(filePath);
  }
}

const processContracts = async (projects: Record<string, string>) => {
  const paths = walkdir.sync(CONTRACTS_PATH).filter((filePath) => filePath.endsWith('.json'));
  await Promise.all(paths.map((filePath) => processContract(filePath, projects)));
}

const processContract = async (filePath: string, projects: Record<string, string>) => {
  const [address, data] = await readContract(filePath);
  await writeContract(address, data, projects);
}

const readContract = async (filePath: string): Promise<any> => {
  try {
    const [chainId, address] = filePath.replace(CONTRACTS_PATH, '').replace('.json', '').split(path.sep).filter((part) => !!part);
    const contents = await readFile(filePath, 'utf-8').then((contents) => JSON.parse(contents));
    return [address, { ...contents, chainId }];
  } catch {
    await sleep(1000);
    return readContract(filePath);
  }
}

const writeContract = async (address: Address, data: any, projects: Record<string, string>) => {
  const name = projects[data.project] ?? data.project;
  const label = `${name}: ${data.name}`;
  await writeData('generated', 'spenders', data.chainId, address, { name, label });
}

const importFromEthereumLists = async (): Promise<void> => {
  console.log('Updating github spenders');

  execSync(`rm -rf ${CLONE_PATH}`);
  execSync(`git clone ${CLONE_REPO} ${CLONE_PATH}`);
  console.log('GitHub repository cloned.')

  const projects = await readProjects();
  console.log('Project files read.')

  await processContracts(projects);
  console.log('Spender files written.')

  execSync(`rm -rf ${CLONE_PATH}`);
  console.log('GitHub repository removed.')
}

importFromEthereumLists();
