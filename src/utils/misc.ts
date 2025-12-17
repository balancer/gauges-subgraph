import { Address, Bytes } from '@graphprotocol/graph-ts';

import { Pool, User } from '../types/schema';
import { ERC20 } from '../types/templates/LiquidityGauge/ERC20';
import { WeightedPool } from '../types/GaugeFactory/WeightedPool';
import { VaultV2 } from '../types/GaugeFactory/VaultV2';
import { VAULT_V2_ADDRESS, VAULT_V3_ADDRESS } from './constants';
import { VaultV3 } from '../types/GaugeFactory/VaultV3';

export function bytesToAddress(address: Bytes): Address {
  return Address.fromString(address.toHexString());
}

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

export function isPoolRegistered(poolAddress: Address): boolean {
  let poolId = getPoolId(poolAddress);

  // if pool has no ID, it's potentially a v3 pool
  if (!poolId) {
    let vaultV3 = VaultV3.bind(VAULT_V3_ADDRESS);
    let getPoolConfigCall = vaultV3.try_getPoolConfig(poolAddress);
    if (getPoolConfigCall.reverted) return false;

    return getPoolConfigCall.value.isPoolRegistered;
  }

  // otherwise, we check if it's registered to v2
  let vaultV2 = VaultV2.bind(VAULT_V2_ADDRESS);
  let getPoolCall = vaultV2.try_getPool(poolId);
  if (getPoolCall.reverted) return false;

  return !!getPoolCall.value.value0;
}
