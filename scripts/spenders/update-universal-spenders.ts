import { ChainId } from '@revoke.cash/chains';
import { Address } from 'viem';
import { mapWithConcurrency, writeData } from '../utils';
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
      ChainId.EthereumSepolia,
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
      ChainId.FlowEVMMainnet,
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
// And the official docs / deployment files of the respective projects (e.g. Uniswap Calibur, Biconomy AbstractJS, Turnkey
// Gas Station, Tangem blockchain-sdk, Railgun shared-models)
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
  '0x4B3A543DC60A09974007d6937cd952e3a0188929': {
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
  '0x8D6220c9961E8DD1844108C854F514E120226E20': {
    chains: allChainIds,
    data: {
      name: 'Ambire',
      label: 'Ambire: EIP7702 Delegator',
    },
  },
  '0x8226995E02C70293595E0634C5F89547EDb08126': {
    chains: [ChainId.Katana],
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
  '0x4Cd241E8d1510e30b2076397afc7508Ae59C66c9': {
    chains: allChainIds,
    data: {
      name: 'Simple7702Account',
      label: 'Simple7702Account: EIP7702 Delegator',
    },
  },
  '0xa46cc63eBF4Bd77888AA327837d20b23A63a56B5': {
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
  '0x36d3CBD83961868398d056EfBf50f5CE15528c0D': {
    chains: allChainIds,
    data: {
      name: 'OKX',
      label: 'OKX: EIP7702 Delegator',
    },
  },
  '0xe40ccB2D94975c51bff0C004eFDfd9B3a5796fA4': {
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
  '0x00000000383e8cBe298514674Ea60Ee1d1de50ac': {
    chains: allChainIds,
    data: {
      name: 'Biconomy',
      label: 'Biconomy: EIP7702 Delegator',
    },
  },
  '0x0000000020fe2F30453074aD916eDeB653eC7E9D': {
    chains: allChainIds,
    data: {
      name: 'Biconomy',
      label: 'Biconomy: EIP7702 Delegator',
    },
  },
  '0x000000001964d23C59962Fc7A912872EE8fB3b6A': {
    chains: allChainIds,
    data: {
      name: 'Biconomy',
      label: 'Biconomy: EIP7702 Delegator',
    },
  },
  '0x000000aC74357BFEa72BBD0781833631F732cf19': {
    chains: allChainIds,
    data: {
      name: 'Biconomy',
      label: 'Biconomy: EIP7702 Delegator',
    },
  },
  '0x0000B1c01cB3b5770D8806f0D214d50131a08a5B': {
    chains: allChainIds,
    data: {
      name: 'Biconomy',
      label: 'Biconomy: EIP7702 Delegator',
    },
  },
  '0x0000b1C0B95DA04652C1919667D1DCC14f46f62B': {
    chains: allChainIds,
    data: {
      name: 'Biconomy',
      label: 'Biconomy: EIP7702 Delegator',
    },
  },
  '0x54F220e4f0DEAb58Be26153df5a674668B9d7Fb2': {
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
  '0x000000005c84F8Fd50b21CAC312528A64437030e': {
    chains: allChainIds,
    data: {
      name: 'Uniswap Wallet',
      label: 'Uniswap Wallet: Calibur Entry',
    },
  },
  '0x00000cAbFc76478C1537dd418aB00967cBbE4AE6': {
    chains: allChainIds,
    data: {
      name: 'Uniswap Wallet',
      label: 'Uniswap Wallet: Calibur Entry',
    },
  },
  '0x3cbad1E3B9049eCDb9588Fb48Dd61D80Faf41Bd5': {
    chains: allChainIds,
    data: {
      name: 'Uniswap Wallet',
      label: 'Uniswap Wallet: Calibur',
    },
  },
  '0x69007702764179f14F51cdce752f4f775d74E139': {
    chains: allChainIds,
    data: {
      name: 'Alchemy',
      label: 'Alchemy: EIP7702 Delegator',
    },
  },
  '0x77021100bD87b7008E5E1989d0eB38555d0d0000': {
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
  '0xD6999651Fc0964B9c6B444307a0ab20534a66560': {
    chains: allChainIds,
    data: {
      name: 'Thirdweb',
      label: 'Thirdweb: EIP7702 Delegator',
    },
  },
  '0x4670D851672Cb6E3ab4FaEA0a18dc08eDeA01d5E': {
    chains: allChainIds,
    data: {
      name: 'Thirdweb',
      label: 'Thirdweb: EIP7702 Delegator',
    },
  },
  '0x3E515544F8d8293B0A353E10Ff3b7ca03b52f35b': {
    chains: allChainIds,
    data: {
      name: 'Thirdweb',
      label: 'Thirdweb: EIP7702 Delegator',
    },
  },
  '0x173217d7f8c26Dc3c01e37e1c04813CC7cC9fEc2': {
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
  '0x664aB8c20B629422F5398E58ff8989E68B26A4E6': {
    chains: allChainIds,
    data: {
      name: 'Porto',
      label: 'Porto: EIP7702 Delegator',
    },
  },
  '0x8c0466A6C046395c8999227b288883cf7dC9f5de': {
    chains: allChainIds,
    data: {
      name: 'Porto',
      label: 'Porto: EIP7702 Delegator',
    },
  },
  '0xB292da8879c26ECd558BBEa87f581Cdd608FFc3c': {
    chains: allChainIds,
    data: {
      name: 'Porto',
      label: 'Porto: EIP7702 Delegator',
    },
  },
  '0x5874F358359ee96d2b3520409018f1a6F59A2CDC': {
    chains: allChainIds,
    data: {
      name: 'Porto',
      label: 'Porto: EIP7702 Delegator',
    },
  },
  '0x7C27e3AEcbF42879B64d76f604dC3430F4886462': {
    chains: allChainIds,
    data: {
      name: 'Porto',
      label: 'Porto: EIP7702 Delegator',
    },
  },
  '0x96E9dEd822fFd4C65D8e09340ee95D2DC8fa209F': {
    chains: [ChainId.Base],
    data: {
      name: 'Porto',
      label: 'Porto: EIP7702 Delegator',
    },
  },
  '0x5aF42746a8Af42d8a4708dF238C53F1F71abF0E0': {
    chains: allChainIds,
    data: {
      name: 'Gelato',
      label: 'Gelato: EIP7702 Delegator',
    },
  },
  '0x0000Fb7702036ff9f76044a501ac1aA74cbab16b': {
    chains: allChainIds,
    data: {
      name: 'Fireblocks',
      label: 'Fireblocks: EIP7702 Delegator',
    },
  },
  '0xcc0c946EecF01A4Bc76Bc333Ea74CEb04756f17b': {
    chains: allChainIds,
    data: {
      name: 'TokenPocket',
      label: 'TokenPocket: EIP7702 Delegator',
    },
  },
  '0x7A956fD329d0C616f2d1DDE98BB35694f397Df46': {
    chains: allChainIds,
    data: {
      name: 'TokenPocket',
      label: 'TokenPocket: EIP7702 Delegator',
    },
  },
  '0x6C35Fbcf24E57E5aa2E3AA2CA82E052499D02CF8': {
    chains: allChainIds,
    data: {
      name: 'TokenPocket',
      label: 'TokenPocket: EIP7702 Delegator',
    },
  },
  '0x7785a22Facd31dB653bA4928f1D5B81D093f0b2f': {
    chains: allChainIds,
    data: {
      name: 'Cordial Systems',
      label: 'Cordial Systems: EIP7702 Delegator',
    },
  },
  '0xcEa43594f38316F0e01c161D8DaBDe0a07a1F512': {
    chains: allChainIds,
    data: {
      name: 'Dfns',
      label: 'Dfns: EIP7702 Delegator',
    },
  },
  '0xa34E1E389097409aA65Ff374Af50B402E4A8F5C3': {
    chains: allChainIds,
    data: {
      name: 'Dfns',
      label: 'Dfns: EIP7702 Delegator',
    },
  },
  '0x23E5F9C457A69Ce776d20A8fe812A6701D66fcE8': {
    chains: allChainIds,
    data: {
      name: 'Otim',
      label: 'Otim: EIP7702 Delegator',
    },
  },
  '0xa845C74344Fc9405b1Fcf712f04668979573c1bf': {
    chains: allChainIds,
    data: {
      name: 'Bitget Wallet',
      label: 'Bitget Wallet: EIP7702 Delegator',
    },
  },
  '0x4428a93B478fa76A5BD9c7641F54EC6373855433': {
    chains: allChainIds,
    data: {
      name: 'Bitget Wallet',
      label: 'Bitget Wallet: EIP7702 Delegator',
    },
  },
  '0x490Aac77c960B0569C8E446aC7E12490bD44Ca1D': {
    chains: allChainIds,
    data: {
      name: 'Bitget Wallet',
      label: 'Bitget Wallet: EIP7702 Delegator',
    },
  },
  '0xb15Bed8FC30D3E82672bF7cD75417B414983934B': {
    chains: allChainIds,
    data: {
      name: 'SafePal',
      label: 'SafePal: EIP7702 Delegator',
    },
  },
  '0x69e6bd1C4082403Fc7917a61F6216552fC1a541D': {
    chains: allChainIds,
    data: {
      name: 'SafePal',
      label: 'SafePal: EIP7702 Delegator',
    },
  },
  // Tangem deploys a separate executor per chain, and these addresses hold unrelated contracts on other chains
  '0xe3014E9AB2739aDeF234B3829C79128746160178': {
    chains: [ChainId.EthereumMainnet],
    data: {
      name: 'Tangem',
      label: 'Tangem: EIP7702 Delegator',
    },
  },
  '0xb94B392b61c16Ddb7118849D4970570C07F75dD1': {
    chains: [ChainId.EthereumMainnet],
    data: {
      name: 'Tangem',
      label: 'Tangem: EIP7702 Delegator',
    },
  },
  '0xe1d0BF13C427C4B2e25Df0CA29E1Faa2d10458f3': {
    chains: [ChainId.BNBSmartChainMainnet],
    data: {
      name: 'Tangem',
      label: 'Tangem: EIP7702 Delegator',
    },
  },
  '0x96922f4b701F0138064bCcB1549B4B7B6b3447CC': {
    chains: [ChainId.BNBSmartChainMainnet],
    data: {
      name: 'Tangem',
      label: 'Tangem: EIP7702 Delegator',
    },
  },
  '0x2C2397c7605dc6d5493518260BDdeebE743B3faD': {
    chains: [ChainId.PolygonMainnet],
    data: {
      name: 'Tangem',
      label: 'Tangem: EIP7702 Delegator',
    },
  },
  '0x02a35743C4170A3685271708399311801a230cf0': {
    chains: [ChainId.PolygonMainnet],
    data: {
      name: 'Tangem',
      label: 'Tangem: EIP7702 Delegator',
    },
  },
  '0x61dD8620410a2372CbE4946f9148671F38F93fC7': {
    chains: [ChainId.Base],
    data: {
      name: 'Tangem',
      label: 'Tangem: EIP7702 Delegator',
    },
  },
  '0xA787dd893e772c42cCe545A2560D53AcdDe251A6': {
    chains: [ChainId.Base],
    data: {
      name: 'Tangem',
      label: 'Tangem: EIP7702 Delegator',
    },
  },
  '0x20e7016ff14Dd10f04028fE52aBBca34F44b6965': {
    chains: [ChainId.ArbitrumOne],
    data: {
      name: 'Tangem',
      label: 'Tangem: EIP7702 Delegator',
    },
  },
  '0x4E039670C679346f785D61a0e21aBe0330F1b776': {
    chains: [ChainId.ArbitrumOne],
    data: {
      name: 'Tangem',
      label: 'Tangem: EIP7702 Delegator',
    },
  },
  '0x242E809094f7FA83763119988d84E4f4D9528713': {
    chains: allChainIds,
    data: {
      name: 'Utila',
      label: 'Utila: EIP7702 Delegator',
    },
  },
  '0x00000000BEBEDB7C30ee418158e26E31a5A8f3E2': {
    chains: allChainIds,
    data: {
      name: 'Basic EOA Batch Executor',
      label: 'Basic EOA Batch Executor: EIP7702 Delegator',
    },
  },
  '0x000000732C68Dc7D14AE652cCcbEAAC791832E58': {
    chains: allChainIds,
    data: {
      name: 'Sequence',
      label: 'Sequence: EIP7702 Delegator',
    },
  },
  '0x955D84139e7621bc571b117D8EB5D28A4A222C6f': {
    chains: allChainIds,
    data: {
      name: 'Turnkey',
      label: 'Turnkey: EIP7702 Delegator',
    },
  },
  '0x2a31eF110e4Cdb9C332aA1d8633510214299c48B': {
    chains: allChainIds,
    data: {
      name: 'Turnkey',
      label: 'Turnkey: EIP7702 Delegator',
    },
  },
  '0x000066a00056CD44008768E2aF00696e19A30084': {
    chains: allChainIds,
    data: {
      name: 'Turnkey',
      label: 'Turnkey: EIP7702 Delegator',
    },
  },
  '0x000000000032dDC454C3BDcba80484Ad5A798705': {
    chains: allChainIds,
    data: {
      name: 'Rhinestone',
      label: 'Rhinestone: EIP7702 Delegator',
    },
  },
  '0x000000000D41C0Bf0063DbA53343389CdB2C9C78': {
    chains: allChainIds,
    data: {
      name: 'Rhinestone',
      label: 'Rhinestone: EIP7702 Delegator',
    },
  },
  '0x17c11FDdADac2b341F2455aFe988fec4c3ba26e3': {
    chains: [ChainId.EthereumMainnet],
    data: {
      name: 'Luganodes',
      label: 'Luganodes: EIP7702 Delegator',
    },
  },
  '0x05ae73c5925d843864ae6F261f3175De2ebCd963': {
    chains: [ChainId.EthereumMainnet],
    data: {
      name: 'Railgun',
      label: 'Railgun: EIP7702 Relay Adapt',
    },
  },
  '0x48cf4b897f64D81212c1423D78a05E828d0cE19d': {
    chains: [ChainId.BNBSmartChainMainnet, ChainId.PolygonMainnet, ChainId.ArbitrumOne],
    data: {
      name: 'Railgun',
      label: 'Railgun: EIP7702 Relay Adapt',
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
  '0x89046d34E70A65ACAb2152C26a0C8e493b5ba629',
  '0xA03fC3C62d26253B3eC3076CB871aFa3B5fa60ab',
  '0x68Ae6C736Ae31bBAb8D8b712cDc1f552e7De7351',
  '0x0E04736A85433445EF602D07946671685eC94647',
  '0x6B7879a5d747E30a3ADb37A9e41c046928FCE933',
  '0x6F7c7b0129AFD6172dd36891B7048c6CF2D29c7f',
  '0x8A67B5020eE254eF48e3B6a04927F39bAf7e408A',
  '0x2e086ac01cB8e6538D393944f02be58D52439aE8',
] as const;

const SCAM_DELEGATES: UniversalSpenders = SCAM_DELEGATES_ADDRESSES.reduce<UniversalSpenders>(
  (acc, address) => ({
    ...acc,
    [address]: {
      chains: allChainIds,
      data: {
        name: 'Scam Delegate',
        label: 'Scam Delegate: EIP7702 Delegator',
        riskFactors: [{ type: 'blocklist', source: 'whois' }],
      },
    },
  }),
  {},
);

const run = async () => {
  console.log('Updating universal spenders');

  const spenders = Object.entries({ ...UNIVERSAL_SPENDERS, ...UNIVERSAL_DELEGATES, ...SCAM_DELEGATES });
  const entries = spenders.flatMap(([address, spender]) =>
    spender.chains.map((chainId) => ({ address, chainId, spender })),
  );

  await mapWithConcurrency(entries, async ({ address, chainId, spender }) => {
    await writeData('generated', 'spenders', String(chainId), address, spender.data);
  });
};

run();
