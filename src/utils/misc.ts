import { Address } from '@graphprotocol/graph-ts';

import { User } from '../types/schema';
import { ERC20 } from '../types/templates/LiquidityGauge/ERC20';

export function createUserEntity(address: Address): void {
  let addressHex = address.toHex();
  if (User.load(addressHex) == null) {
    let user = new User(addressHex);
    user.save();
  }
}

export function getTokenDecimals(tokenAddress: Address): i32 {
  let token = ERC20.bind(tokenAddress);
  let result = token.try_decimals();

  return result.reverted ? 0 : result.value;
}

export function getTokenSymbol(tokenAddress: Address): string {
  let token = ERC20.bind(tokenAddress);
  let result = token.try_symbol();

  return result.reverted ? '' : result.value;
}
