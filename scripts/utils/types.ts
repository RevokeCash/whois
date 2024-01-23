import { Address } from 'viem';

export interface TokenData {
  symbol?: string;
  decimals?: number;
  logoURI?: string;
  isSpam?: boolean;
}

export interface TokenMapping {
  [address: string]: TokenData;
}

export interface SpenderData {
  name: string;
  label?: string;
  exploits?: string[];
}

export type DataType = 'manual' | 'generated';
export type AddressType = 'spenders' | 'tokens';
export type Data<T extends AddressType> = T extends 'spenders' ? SpenderData : TokenData;

export type ParsedPath = {
  dataType: DataType;
  addressType: AddressType;
  chainId: number;
  address: Address;
};
