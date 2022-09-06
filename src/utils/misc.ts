import { Address, Bytes } from '@graphprotocol/graph-ts';

import { Pool, User } from '../types/schema';
import { ERC20 } from '../types/templates/LiquidityGauge/ERC20';
import { WeightedPool } from '../types/GaugeFactory/WeightedPool';

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

export function getPoolId(poolAddress: Address): Bytes | null {
  let pool = WeightedPool.bind(poolAddress);
  let result = pool.try_getPoolId();

  return result.reverted ? null : result.value;
}

export function getPoolEntity(
  poolAddress: Address,
  gaugeAddress: Address,
): Pool {
  let pool = Pool.load(poolAddress.toHex());

  if (pool == null) {
    pool = new Pool(poolAddress.toHex());
    pool.address = poolAddress;
    pool.poolId = getPoolId(poolAddress);
    pool.gaugesList = [gaugeAddress];
    pool.save();
    return pool;
  }

  const gaugesList = pool.gaugesList;
  gaugesList.push(gaugeAddress);
  pool.gaugesList = gaugesList;

  return pool;
}
