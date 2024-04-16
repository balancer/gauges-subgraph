import { Address, BigInt, dataSource } from '@graphprotocol/graph-ts';

export const ZERO = BigInt.fromI32(0);
export const ONE = BigInt.fromI32(1);
export const ZERO_BD = ZERO.toBigDecimal();
export const ONE_BD = ZERO.toBigDecimal();

export const LOCK_MAXTIME = BigInt.fromI32(365 * 86400); // 1 YEAR

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export class AddressByNetwork {
  public mainnet: string;
  public sepolia: string;
  public goerli: string;
  public telosTestnet: string;
  public telos: string;
  public meter: string;
}

let network: string = dataSource.network();

// Add new networks here
let controllerAddressByNetwork: AddressByNetwork = {
  mainnet: '0xC128468b7Ce63eA702C1f104D55A2566b13D3ABD',
  sepolia: '0x577e5993B9Cc480F07F98B5Ebd055604bd9071C4',
  goerli: '0xBB1CE49b16d55A1f2c6e88102f32144C7334B116',
  telosTestnet: '0x42cbd18265C829f50Ededd4E5B5E5F5855e25175',
  telos: '0x7ac8CF03C7c48d1E1eEB2Cb2B3A50B1B1430ae7b',
  meter: '0x0563fe58FC886BE22cE1977cADE4bC80D4e01bc3',
};

let vaultAddressByNetwork: AddressByNetwork = {
  mainnet: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
  sepolia: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
  goerli: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
  telosTestnet: '0x42cbd18265C829f50Ededd4E5B5E5F5855e25175',
  telos: '0xbccc4b4c6530F82FE309c5E845E50b5E9C89f2AD',
  meter: '0x913f21E596790aFC6AA45229E9ff8b7d0A473D5A',
};

function forNetwork(
  addressByNetwork: AddressByNetwork,
  network: string,
): Address {
  if (network == 'mainnet') {
    return Address.fromString(addressByNetwork.mainnet);
  } else if (network == 'sepolia') {
    return Address.fromString(addressByNetwork.sepolia);
  } else if (network == 'telos-testnet') {
    return Address.fromString(addressByNetwork.telosTestnet);
  } else if (network == 'telos') {
    return Address.fromString(addressByNetwork.telos);
  } else if (network == 'meter') {
    return Address.fromString(addressByNetwork.meter);
  }
  return Address.fromString(addressByNetwork.telos);
}

export const CONTROLLER_ADDRESS = forNetwork(
  controllerAddressByNetwork,
  network,
);
export const VAULT_ADDRESS = forNetwork(vaultAddressByNetwork, network);

export const ARBITRUM_ROOT_GAUGE_FACTORY = Address.fromString(
  '0xad901309d9e9DbC5Df19c84f729f429F0189a633',
);
export const OPTIMISM_ROOT_GAUGE_FACTORY = Address.fromString(
  '0x3083A1C455ff38d39e58Dbac5040f465cF73C5c8',
);
export const POLYGON_ROOT_GAUGE_FACTORY = Address.fromString(
  '0x4C4287b07d293E361281bCeEe8715c8CDeB64E34',
);

export const MAINNET_GAUGE_V1_FACTORY = Address.fromString(
  '0x4E7bBd911cf1EFa442BC1b2e9Ea01ffE785412EC',
);
export const MAINNET_GAUGE_V2_FACTORY = Address.fromString(
  '0xf1665E19bc105BE4EDD3739F88315cC699cc5b65',
);
export const GOERLI_GAUGE_V1_FACTORY = Address.fromString(
  '0x224E808FBD9e491Be8988B8A0451FBF777C81B8A',
);
export const GOERLI_GAUGE_V2_FACTORY = Address.fromString(
  '0x3b8cA519122CdD8efb272b0D3085453404B25bD0',
);
export const SEPOLIA_GAUGE_V2_FACTORY = Address.fromString(
  '0x2FF226CD12C80511a641A6101F071d853A4e5363',
);
export const TELOSTESTNET_GAUGE_V2_FACTORY = Address.fromString(
  '0x31191Dc484BC61CACE4c562C567181296e6eFB15',
);
export const TELOS_GAUGE_V2_FACTORY = Address.fromString(
  '0x2564fA7CaFe82c527Ee788265FD4Dc863F65D2D1',
);

export const TELOS_GAUGE_V3_FACTORY = Address.fromString(
  '0x2564fA7CaFe82c527Ee788265FD4Dc863F65D2D1',
);

export const METER_GAUGE_V2_FACTORY = Address.fromString(
  '0xf85271dc6838944278E8Ee96981fbE98caa86b12',
);

export const METER_GAUGE_V3_FACTORY = Address.fromString(
  '0xf85271dc6838944278E8Ee96981fbE98caa86b12',
);
export const ARBITRUM_ROOT_GAUGE_V2_FACTORY = Address.fromString(
  '0x1c99324EDC771c82A0DCCB780CC7DDA0045E50e7',
);
export const GNOSIS_ROOT_GAUGE_V2_FACTORY = Address.fromString(
  '0x2a18B396829bc29F66a1E59fAdd7a0269A6605E8',
);
export const OPTIMISM_ROOT_GAUGE_V2_FACTORY = Address.fromString(
  '0x866D4B65694c66fbFD15Dd6fa933D0A6b3940A36',
);
export const BASE_ROOT_GAUGE_V2_FACTORY = Address.fromString(
  '0x8e3B64b3737097F283E965869e3503AA20F31E4D',
);
export const POLYGON_ROOT_GAUGE_V2_FACTORY = Address.fromString(
  '0xa98Bce70c92aD2ef3288dbcd659bC0d6b62f8F13',
);
export const AVALANCHE_ROOT_GAUGE_V2_FACTORY = Address.fromString(
  '0x22625eEDd92c81a219A83e1dc48f88d54786B017',
);
export const POLYGON_ZKEVM_ROOT_GAUGE_V2_FACTORY = Address.fromString(
  '0x9bF951848288cCD87d06FaC426150262cD3447De',
);

export function isArbitrumFactory(factory: Address): boolean {
  return [ARBITRUM_ROOT_GAUGE_FACTORY, ARBITRUM_ROOT_GAUGE_V2_FACTORY].includes(
    factory,
  );
}

export function isMainnetFactory(factory: Address): boolean {
  return [MAINNET_GAUGE_V1_FACTORY, MAINNET_GAUGE_V2_FACTORY].includes(factory);
}

export function isGoerliFactory(factory: Address): boolean {
  return [GOERLI_GAUGE_V1_FACTORY, GOERLI_GAUGE_V2_FACTORY].includes(factory);
}
export function isSepoliaFactory(factory: Address): boolean {
  return factory == SEPOLIA_GAUGE_V2_FACTORY;
}

export function isTelosTestnetFactory(factory: Address): boolean {
  return factory == TELOSTESTNET_GAUGE_V2_FACTORY;
}

export function isTelosFactory(factory: Address): boolean {
  return factory == TELOS_GAUGE_V2_FACTORY;
}

export function isMeterFactory(factory: Address): boolean {
  return factory == METER_GAUGE_V2_FACTORY;
}

export function isL1Factory(factory: Address): boolean {
  return (
    isMainnetFactory(factory) ||
    isGoerliFactory(factory) ||
    isSepoliaFactory(factory) ||
    isTelosTestnetFactory(factory) ||
    isTelosFactory(factory) ||
    isMeterFactory(factory)
  );
}

export function isOptimismFactory(factory: Address): boolean {
  return [OPTIMISM_ROOT_GAUGE_FACTORY, OPTIMISM_ROOT_GAUGE_V2_FACTORY].includes(
    factory,
  );
}

export function isPolygonFactory(factory: Address): boolean {
  return [POLYGON_ROOT_GAUGE_FACTORY, POLYGON_ROOT_GAUGE_V2_FACTORY].includes(
    factory,
  );
}

export function isGnosisFactory(factory: Address): boolean {
  return factory == GNOSIS_ROOT_GAUGE_V2_FACTORY;
}

export function isAvalancheFactory(factory: Address): boolean {
  return factory == AVALANCHE_ROOT_GAUGE_V2_FACTORY;
}

export function isPolygonZkEVMFactory(factory: Address): boolean {
  return factory == POLYGON_ZKEVM_ROOT_GAUGE_V2_FACTORY;
}

export function isBaseFactory(factory: Address): boolean {
  return factory == BASE_ROOT_GAUGE_V2_FACTORY;
}
