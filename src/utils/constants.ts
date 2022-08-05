import { Address, BigInt, dataSource } from '@graphprotocol/graph-ts';

export const ZERO = BigInt.fromI32(0);
export const ONE = BigInt.fromI32(1);
export const ZERO_BD = ZERO.toBigDecimal();
export const ONE_BD = ZERO.toBigDecimal();

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export class AddressByNetwork {
  public mainnet: string;
  public kovan: string;
  public goerli: string;
}

let network: string = dataSource.network();

let controllerAddressByNetwork: AddressByNetwork = {
  mainnet: '0xC128468b7Ce63eA702C1f104D55A2566b13D3ABD',
  kovan: '0x28bE1a58A534B281c3A22df28d3720323bfF331D',
  goerli: '0xBB1CE49b16d55A1f2c6e88102f32144C7334B116'
};

function forNetwork(
  addressByNetwork: AddressByNetwork,
  network: string,
): Address {
  if (network == 'mainnet') {
    return Address.fromString(addressByNetwork.mainnet);
  } else if (network == 'kovan') {
    return Address.fromString(addressByNetwork.kovan);
  } else {
    return Address.fromString(addressByNetwork.goerli);
  }
}

export const CONTROLLER_ADDRESS = forNetwork(
  controllerAddressByNetwork,
  network,
);

export const ARBITRUM_ROOT_GAUGE_FACTORY = Address.fromString(
  '0xad901309d9e9DbC5Df19c84f729f429F0189a633',
);
export const OPTIMISM_ROOT_GAUGE_FACTORY = Address.fromString(
  '0x3083A1C455ff38d39e58Dbac5040f465cF73C5c8',
);
export const POLYGON_ROOT_GAUGE_FACTORY = Address.fromString(
  '0x4C4287b07d293E361281bCeEe8715c8CDeB64E34',
);
