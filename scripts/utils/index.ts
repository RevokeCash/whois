import path from 'path';
import { Address, getAddress } from 'viem';
import { DATA_BASE_PATH } from './constants';
import { AddressType, Data, DataType, ParsedPath, SpenderData, TokenData } from './types';
import { mkdir, readFile, writeFile } from 'fs/promises';
import walkdir from 'walkdir';

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getDataPath = (dataType: DataType, addressType: AddressType, chainId: number, address: Address) => {
  return path.join(getDataDirectoryPath(dataType, addressType, chainId), `${getAddress(address)}.json`);
}

export const getDataDirectoryPath = (dataType: DataType, addressType: AddressType, chainId: number) => {
  return path.join(DATA_BASE_PATH, dataType, addressType, String(chainId));
}

export const parsePath = (filePath: string): ParsedPath => {
  if (!path.isAbsolute(filePath)) throw new Error('Path must be absolute');
  if (!filePath.startsWith(DATA_BASE_PATH)) throw new Error('Path must be inside data directory');

  const relativePath = filePath.replace(DATA_BASE_PATH, '').replace('.json', '');

  const [dataType, addressType, chainId, address] = relativePath.split(path.sep).filter((part) => !!part);

  return {
    dataType: dataType as DataType,
    addressType: addressType as AddressType,
    chainId: Number(chainId),
    address: getAddress(address),
  };
}

export const readData = async <T extends AddressType>(dataType: DataType, addressType: T, chainId: number, address: Address): Promise<Data<T>> => {
  return readFile(getDataPath(dataType, addressType, chainId, address), 'utf-8').then((contents) => JSON.parse(contents)).catch(() => undefined);
}

export const writeData = async <T extends AddressType>(dataType: DataType, addressType: T, chainId: number, address: Address, data: Data<T>) => {
  const directoryPath = getDataDirectoryPath(dataType, addressType, chainId);
  const dataPath = getDataPath(dataType, addressType, chainId, address);
  await mkdir(directoryPath, { recursive: true });

  const sanitisedData = sanitiseData(addressType, data);

  try {
    await writeFile(dataPath, JSON.stringify(sanitisedData));
  } catch {
    await sleep(1000);
    await writeData(dataType, addressType, chainId, address, data);
  }
}

export const sanitiseData = <T extends AddressType>(addressType: T, data: Data<T>): Data<T> => {
  if (addressType === 'tokens') {
    return sanitiseTokenData(data as TokenData) as Data<T>;
  }

  return sanitiseSpenderData(data as SpenderData) as Data<T>;
}

export const sanitiseTokenData = (token: TokenData) => {
  // Override USDT and WETH logos
  const USDT_LOGO =
    'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png';
  const WETH_LOGO =
    'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png';

  const logoOverrides = {
    USDT: USDT_LOGO,
    USDTE: USDT_LOGO,
    WETH: WETH_LOGO,
  };

  return {
    symbol: token.symbol,
    decimals: token.decimals,
    logoURI: logoOverrides[token.symbol] || token.logoURI?.replace('/thumb/', '/small/')?.replace('w=500', 'w=32')?.replace('ipfs://', 'https://ipfs.io/ipfs/'),
    isSpam: token.isSpam,
  };
};


export const sanitiseSpenderData = (spender: SpenderData) => {
  return {
    name: spender.name,
    label: spender.label,
    exploits: spender.exploits,
  };
};

export const copyManualData = async (addressType: AddressType) => {
  const paths = await walkdir.async(path.join(DATA_BASE_PATH, 'manual', addressType))
  const dataPaths = paths.filter((path) => path.endsWith('.json'));
  await Promise.all(dataPaths.map(async (dataPath) => {
    const { addressType, chainId, address } = parsePath(dataPath);
    const data = await readData('manual', addressType, chainId, address);
    await writeData('generated', addressType, chainId, address, data);
  }));
}
