import { ChainId } from '@revoke.cash/chains';
import { Address } from 'viem';
import { writeData } from '../utils';
import { allChainIds } from '../utils/constants';
import { SpenderData } from '../utils/types';

type UniversalSpenders = Record<Address, { chains: number[]; data: SpenderData }>;

// Universal Spenders should be added to every chain (e.g. Permit2)
const UNIVERSAL_SPENDERS: UniversalSpenders = {
  '0x000000000022D473030F116dDEE9F6B43aC78BA3': {
    chains: allChainIds,
    data: {
      name: 'Permit2',
      label: 'Permit2',
    },
  },
  '0x1E0049783F008A0085193E00003D00cd54003c71': {
    chains: [
      // See https://github.com/ProjectOpenSea/seaport
      ChainId.EthereumMainnet,
      ChainId.Sepolia,
      ChainId.PolygonMainnet,
      ChainId.Amoy,
      ChainId.OPMainnet,
      ChainId.OPSepoliaTestnet,
      ChainId.ArbitrumOne,
      ChainId.ArbitrumSepolia,
      ChainId.ArbitrumNova,
      ChainId.Base,
      ChainId.BaseSepoliaTestnet,
      ChainId['AvalancheC-Chain'],
      ChainId.AvalancheFujiTestnet,
      ChainId.Gnosis,
      ChainId.GnosisChiadoTestnet,
      ChainId.BNBSmartChainMainnet,
      ChainId.BNBSmartChainTestnet,
      ChainId.KaiaMainnet,
      ChainId.KaiaKairosTestnet,
      ChainId.Moonbeam,
      ChainId.Moonriver,
      ChainId.Canto,
      ChainId.FantomOpera,
      ChainId.CeloMainnet,
      ChainId.Zora,
      ChainId.ZoraSepoliaTestnet,
      // Extra chains (not on GitHub but are supported by OpenSea)
      ChainId.ApeChain,
      ChainId.B3,
      ChainId.EVMonFlow,
      ChainId.RoninMainnet,
      ChainId.SeiNetwork,
      ChainId.Shape,
      ChainId.Soneium,
      ChainId.Unichain,
    ],
    data: {
      name: 'OpenSea',
      label: 'OpenSea: Seaport Conduit',
    },
  },
};

// Address labels for EIP7702 delegation addresses
// Taken from https://github.com/Jam516/BundleBear/blob/main/models/eip7702/labels/eip7702_labels_authorized_contracts.sql
// And https://dune.com/queries/5145294
const UNIVERSAL_DELEGATES: UniversalSpenders = {
  '0xcda3577ca7ef65f6B7201E9BD80375f5628D15F7': {
    chains: allChainIds,
    data: {
      name: 'WhiteBIT',
      label: 'WhiteBIT: EIP7702 Delegator',
    },
  },
  '0x79Cf9e04aD9aeB210768c22c228673aED6Cd24C4': {
    chains: allChainIds,
    data: {
      name: 'WhiteBIT',
      label: 'WhiteBIT: EIP7702 Delegator',
    },
  },
  '0x63c0c19a282a1B52b07dD5a65b58948A07DAE32B': {
    chains: allChainIds,
    data: {
      name: 'MetaMask',
      label: 'MetaMask: EIP7702 Delegator',
    },
  },
  '0x5A7FC11397E9a8AD41BF10bf13F22B0a63f96f6d': {
    chains: allChainIds,
    data: {
      name: 'Ambire',
      label: 'Ambire: EIP7702 Delegator',
    },
  },
  '0xe6Cae83BdE06E4c305530e199D7217f42808555B': {
    chains: allChainIds,
    data: {
      name: 'Simple7702Account',
      label: 'Simple7702Account: EIP7702 Delegator',
    },
  },
  '0x80296FF8D1ED46f8e3C7992664D13B833504c2Bb': {
    chains: allChainIds,
    data: {
      name: 'OKX',
      label: 'OKX: EIP7702 Delegator',
    },
  },
  '0x000000004F43C49e93C970E84001853a70923B03': {
    chains: allChainIds,
    data: {
      name: 'Biconomy',
      label: 'Biconomy: EIP7702 Delegator',
    },
  },
  '0xD2e28229F6f2c235e57De2EbC727025A1D0530FB': {
    chains: allChainIds,
    data: {
      name: 'Trust Wallet',
      label: 'Trust Wallet: EIP7702 Delegator',
    },
  },
  '0x0c338ca25585035142A9a0a1EEebA267256f281f': {
    chains: allChainIds,
    data: {
      name: 'Uniswap Wallet',
      label: 'Uniswap Wallet: Minimal EIP7702 Delegator',
    },
  },
  '0x458f5a9f47A01beA5d7A32662660559D9eD3312c': {
    chains: allChainIds,
    data: {
      name: 'Uniswap Wallet',
      label: 'Uniswap Wallet: Calibur',
    },
  },
  '0x000000009B1D0aF20D8C6d0A44e162d11F9b8f00': {
    chains: allChainIds,
    data: {
      name: 'Uniswap Wallet',
      label: 'Uniswap Wallet: Calibur Entry',
    },
  },
  '0x69007702764179f14F51cdce752f4f775d74E139': {
    chains: allChainIds,
    data: {
      name: 'Alchemy',
      label: 'Alchemy: EIP7702 Delegator',
    },
  },
  '0xbaC7e770af15d130Cd72838ff386f14FBF3e9a3D': {
    chains: allChainIds,
    data: {
      name: 'Thirdweb',
      label: 'Thirdweb: EIP7702 Delegator',
    },
  },
  '0xd6CEDDe84be40893d153Be9d467CD6aD37875b28': {
    chains: allChainIds,
    data: {
      name: 'Zerodev',
      label: 'Zerodev: EIP7702 Delegator',
    },
  },
  '0x7702cb554e6bFb442cb743A7dF23154544a7176C': {
    chains: allChainIds,
    data: {
      name: 'Coinbase Wallet',
      label: 'Coinbase Wallet: EIP7702 Delegator',
    },
  },
};

const SCAM_DELEGATES_ADDRESSES = [
  '0x349c41a8e164a243203605dbd07889d201174d77',
  '0x5c0935aC050E939565C3e42A6882074EBb3Eabda',
  '0x6AE436A71612c5875c4D322ee112BF34e64cD6E1',
  '0xF903dD08547dE6601Ca1D0a880D0D9912d762D5e',
  '0xe35ac76765d80e60B3fDEc2Eb146c74145690387',
  '0xb847F107513522Af770ee0AaD8dA0319e6da32b3',
  '0x3AAE056497edD0A3df5F9405e2F1BeC7a5f56dd5',
  '0xe38e81a06AdA5c4515a1FC8266AE470Da63c00b4',
  '0x3549c7f6A9D712FD3007efC1B85E0C4acCA5c211',
  '0x710FAd1041f0eE79916Bb1A6AdEF662303bb8b6E',
  '0x1107396baebD1DA108FdB2691D08a3b3F831b4d6',
  '0x84D05511614272694D3a9cebE896514DBDE51F40',
  '0xc6Cb2C4D7c277bbD774Fd9a9E485c1DA0A460ADe',
  '0x15C432e31D073c85f51B31016ff70F0874A5baB3',
  '0x5D595731fbdbA356Ae71b65F6F014749A4EB969A',
  '0xfdEe40030641B66A6aF7a53eEedD4740fEdB761c',
  '0xC99f40a9C952CE7e29e2f8B6c7461Cdb60C1B54A',
  '0x863CF72E70c2e6AE47078eA8b4e135A4D350572f',
  '0xE6827C2A2167bffbF84Fa02D94a4D25668434313',
  '0x89383882Fc2D0Cd4d7952a3267A3b6dAE967E704',
  '0x9EA61f15CdbaF5D2039771381FA2AdCFb1b76321',
  '0x633288b20F63d9F6f71037d6cd4a5090436134f2',
  '0xf3DF663c15710B98F83E48C010B9CD731aE345cA',
  '0x3220BF967f84160905E4d4326f7dBcd0a2f5a5Bf',
  '0x1ee8e3B6ca95606E21BE70cFf6A0Bd24C134b96f',
  '0xcEfd060dA801a3f004d6b307f4Cab943D1c9B45B',
  '0xcD3cA48e3DcA2D5b5969a4FA490E9B569BE90abA',
  '0x06100887d8C541524c6697c3506885372F970f19',
  '0xB6785B782571980b3Ddb5d40659f4861fF15AA02',
  '0x00512D0000e0c24900008F3Fd3e12600B5bd00b0',
  '0x0C9900Ae00cA9071dae00084006400003900cBa7',
  '0x930FcC37d6042c79211EE18A02857Cb1Fd7F0D0b',
  '0x1f07336D35c9a70ED086F6aA3C4c0Bd1266E6f63',
] as const;

const SCAM_DELEGATES: UniversalSpenders = SCAM_DELEGATES_ADDRESSES
  .reduce<UniversalSpenders>((acc, address) => ({
    ...acc,
    [address]: {
      chains: allChainIds,
      data: {
        name: 'Scam Delegate',
        label: 'Scam Delegate: EIP7702 Delegator',
        riskFactors: [{ type: 'blocklist', source: 'whois' }]
      },
    },
  }), {});


console.log('Updating universal spenders');

Object.entries({ ...UNIVERSAL_SPENDERS, ...UNIVERSAL_DELEGATES, ...SCAM_DELEGATES }).forEach(([address, spender]) => {
  spender.chains.forEach(async (chainId) => {
    await writeData('generated', 'spenders', String(chainId), address, spender.data);
  });
});
