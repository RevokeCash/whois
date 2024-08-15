import {
  GetObjectCommand,
  GetObjectCommandInput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { getAddress, isAddress } from 'viem';
import walkdir from 'walkdir';
import { DATA_BASE_PATH } from './constants';
import { AddressType, Data, DataType, ParsedPath, SpenderData, TokenData } from './types';

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getDataPath = (
  dataType: DataType,
  addressType: AddressType,
  subdirectoryOrChainId: string,
  identifier: string,
) => {
  return path.join(
    getDataDirectoryPath(dataType, addressType, subdirectoryOrChainId),
    `${normaliseIdentifier(identifier)}.json`,
  );
};

export const getDataDirectoryPath = (dataType: DataType, addressType: AddressType, subdirectoryOrChainId: string) => {
  return path.join(DATA_BASE_PATH, dataType, addressType, subdirectoryOrChainId);
};

export const parsePath = (filePath: string): ParsedPath => {
  if (!path.isAbsolute(filePath)) throw new Error('Path must be absolute');
  if (!filePath.startsWith(DATA_BASE_PATH)) throw new Error('Path must be inside data directory');

  const relativePath = filePath.replace(DATA_BASE_PATH, '').replace('.json', '');

  const [dataType, addressType, subdirectoryOrChainId, identifier] = relativePath
    .split(path.sep)
    .filter((part) => !!part);

  return {
    dataType: dataType as DataType,
    addressType: addressType as AddressType,
    subdirectoryOrChainId,
    identifier: normaliseIdentifier(identifier),
  };
};

export const readData = async <T extends AddressType>(
  dataType: DataType,
  addressType: T,
  subdirectoryOrChainId: string,
  identifier: string,
): Promise<Data<T>> => {
  try {
    const rawData = await readFile(getDataPath(dataType, addressType, subdirectoryOrChainId, identifier), 'utf-8');
    return JSON.parse(rawData);
  } catch {
    await sleep(1000);
    return readData(dataType, addressType, subdirectoryOrChainId, identifier);
  }
};

export const writeData = async <T extends AddressType>(
  dataType: DataType,
  addressType: T,
  subdirectoryOrChainId: string,
  identifier: string,
  data: Data<T>,
) => {
  const directoryPath = getDataDirectoryPath(dataType, addressType, subdirectoryOrChainId);
  const dataPath = getDataPath(dataType, addressType, subdirectoryOrChainId, identifier);
  await mkdir(directoryPath, { recursive: true });

  const sanitisedData = sanitiseData(addressType, data);

  try {
    await writeFile(dataPath, JSON.stringify(sanitisedData));
  } catch {
    await sleep(1000);
    await writeData(dataType, addressType, subdirectoryOrChainId, identifier, data);
  }
};

export const uploadData = async <T extends AddressType>(
  s3Client: S3Client,
  bucket: string,
  dataType: DataType,
  addressType: T,
  subdirectoryOrChainId: string,
  identifier: string,
  data: Data<T>,
) => {
  const dataPath = getDataPath(dataType, addressType, subdirectoryOrChainId, identifier);
  const relativeDataPath = dataPath.replace(`${DATA_BASE_PATH}/`, '');
  const sanitisedData = JSON.stringify(sanitiseData(addressType, data));

  const params: PutObjectCommandInput = {
    Bucket: bucket,
    Key: relativeDataPath,
    Body: sanitisedData,
    ContentType: 'application/json',
  };

  // TODO: If a file does not exist
  if (!(await checkUpdated(s3Client, bucket, relativeDataPath, sanitisedData))) {
    console.log('Skipped', relativeDataPath);
    return;
  }

  try {
    await s3Client.send(new PutObjectCommand(params));
  } catch (e) {
    // for some reason, upload fails sometimes with ENOTFOUND
    console.log('ERROR', e.code, e.message, e);
    if (e.code.includes('ENOTFOUND')) {
      await sleep(1000);
      await uploadData(s3Client, bucket, dataType, addressType, subdirectoryOrChainId, identifier, data);
    }

    throw e;
  }

  console.log('Uploaded', relativeDataPath);
};

const checkUpdated = async (
  s3Client: S3Client,
  bucket: string,
  relativeDataPath: string,
  stringifiedData: string,
): Promise<boolean> => {
  const getParams: GetObjectCommandInput = {
    Bucket: bucket,
    Key: relativeDataPath,
  };

  try {
    const retrievedObject = await s3Client.send(new GetObjectCommand(getParams));
    const content = await retrievedObject.Body.transformToString();

    if (content === stringifiedData) return false;

    return true;
  } catch (e: any) {
    // If the file does not exist, it will throw an error saying AccessDenied - in that case we want to upload
    // Note: if there is an actual AccessDenied error, this will break the entire flow 😅
    if (e?.Code === 'AccessDenied') return true;
    throw e;
  }
};

export const sanitiseData = <T extends AddressType>(addressType: T, data: Data<T>): Data<T> => {
  if (addressType === 'tokens') {
    return sanitiseTokenData(data as TokenData) as Data<T>;
  }

  return sanitiseSpenderData(data as SpenderData) as Data<T>;
};

export const sanitiseTokenData = (token: TokenData) => {
  // Override USDT and WETH logos
  const USDT_LOGO =
    'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png';
  const WETH_LOGO =
    'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png';

  const logoOverrides = {
    USDT: USDT_LOGO,
    USDTE: USDT_LOGO,
    'BSC-USD': USDT_LOGO,
    WETH: WETH_LOGO,
  };

  return {
    symbol: token.symbol,
    decimals: token.decimals,
    logoURI:
      logoOverrides[token.symbol] ||
      token.logoURI
        ?.replace('/thumb/', '/small/')
        ?.replace('w=500', 'w=32')
        ?.replace('ipfs://', 'https://ipfs.io/ipfs/')
        ?.replace(/\.png\?.+/i, '.png')
        ?.replace(/\.jpg\?.+/i, '.jpg'),
    isSpam: token.isSpam,
  };
};

export const sanitiseSpenderData = (spender: SpenderData) => {
  return {
    name: spender.name,
    label: spender.label,
    riskFactors: spender.riskFactors,
  };
};

export const copyManualData = async (addressType: AddressType) => {
  const paths = await walkdir.async(path.join(DATA_BASE_PATH, 'manual', addressType));
  const dataPaths = paths.filter((path) => path.endsWith('.json'));
  await Promise.all(
    dataPaths.map(async (dataPath) => {
      const { addressType, subdirectoryOrChainId, identifier } = parsePath(dataPath);
      const data = await readData('manual', addressType, subdirectoryOrChainId, identifier);
      await writeData('generated', addressType, subdirectoryOrChainId, identifier, data);
    }),
  );
};

export const normaliseIdentifier = (identifier: string) => {
  return isAddress(identifier) ? getAddress(identifier.toLowerCase()) : identifier.toLowerCase();
};
