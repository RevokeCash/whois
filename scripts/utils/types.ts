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
  name?: string;
  label?: string;
  riskFactors?: RiskFactor[];
}

export interface RiskFactor {
  type: string;
  source: string;
  data?: string;
}

export type DataType = 'manual' | 'generated';
export type AddressType = 'spenders' | 'tokens';
export type Data<T extends AddressType> = T extends 'spenders' ? SpenderData : TokenData;

export type ParsedPath = {
  dataType: DataType;
  addressType: AddressType;
  subdirectoryOrChainId: string;
  identifier: string;
};
