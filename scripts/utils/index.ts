import {
  GetObjectCommand,
  GetObjectCommandInput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { ChainId } from '@revoke.cash/chains';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { Address, getAddress, isAddress, sha256 } from 'viem';
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

  try {
    if (!(await checkUpdated(s3Client, bucket, relativeDataPath, sanitisedData))) {
      console.log('Skipped', relativeDataPath);
      return;
    }

    await s3Client.send(new PutObjectCommand(params));
  } catch (e) {
    // for some reason, upload fails sometimes with ENOTFOUND
    console.log('ERROR', e.code, e.message, e);
    if (e.code.includes('ENOTFOUND')) {
      await sleep(1000);
      await uploadData(s3Client, bucket, dataType, addressType, subdirectoryOrChainId, identifier, data);
      return;
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
    note: token.note,
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

export const isSupportedAddress = (chainId: number, address: string) => {
  if (chainId === ChainId.TronMainnet) return isTronAddress(address) || isAddress(address);
  return isAddress(address);
};

export const normaliseIdentifier = (identifier: string) => {
  if (isAddress(identifier)) return getAddress(identifier.toLowerCase());
  // Tron addresses share the EVM address format under the hood, so we store them in their 0x form,
  // which is also how the revoke.cash frontend handles them internally
  if (isTronAddress(identifier)) return tronAddressToHex(identifier);
  return identifier.toLowerCase();
};

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

const decodeBase58 = (input: string): Uint8Array => {
  let decoded = 0n;
  for (const character of input) {
    decoded = decoded * 58n + BigInt(BASE58_ALPHABET.indexOf(character));
  }

  const bytes: number[] = [];
  while (decoded > 0n) {
    bytes.unshift(Number(decoded & 0xffn));
    decoded >>= 8n;
  }

  return Uint8Array.from(bytes);
};

export const isTronAddress = (address: string): boolean => {
  if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)) return false;

  // Decoded Tron addresses are 25 bytes: a 0x41 prefix, a 20-byte address, and a 4-byte double-sha256 checksum
  const decoded = decodeBase58(address);
  if (decoded.length !== 25 || decoded[0] !== 0x41) return false;

  const payload = decoded.subarray(0, 21);
  const checksum = decoded.subarray(21);
  const hash = sha256(sha256(payload, 'bytes'), 'bytes');

  return checksum.every((byte, index) => byte === hash[index]);
};

export const tronAddressToHex = (tronAddress: string): Address => {
  if (!isTronAddress(tronAddress)) throw new Error(`Invalid Tron address: ${tronAddress}`);

  const addressBytes = decodeBase58(tronAddress).subarray(1, 21);
  const hex = Array.from(addressBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

  return getAddress(`0x${hex}`);
};
