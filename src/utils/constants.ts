import { Address, BigInt } from '@graphprotocol/graph-ts';

export const ZERO = BigInt.fromI32(0);
export const ONE = BigInt.fromI32(1);
export const ZERO_BD = ZERO.toBigDecimal();
export const ONE_BD = ZERO.toBigDecimal();
export const AddressZero = Address.fromHexString(
  '0x0000000000000000000000000000000000000000',
);
