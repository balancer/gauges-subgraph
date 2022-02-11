import { Address } from '@graphprotocol/graph-ts';

import { LiquidityGauge, UserGaugeShare } from '../types/schema';
import { ZERO_ADDRESS, ZERO_BD } from './constants';

import { LiquidityGauge as LiquidityGaugeTemplate } from '../types/templates/LiquidityGauge/LiquidityGauge';

export function getGauge(address: Address): LiquidityGauge {
  let gauge = LiquidityGauge.load(address.toHexString());

  if (gauge == null) {
    gauge = new LiquidityGauge(address.toHexString());
    gauge.pool = Address.fromString(ZERO_ADDRESS);
    gauge.factory = ZERO_ADDRESS;
    gauge.totalSupply = ZERO_BD;

    let gaugeToken = LiquidityGaugeTemplate.bind(address);
    let symbolCall = gaugeToken.try_symbol();
    if (!symbolCall.reverted) {
      gauge.symbol = symbolCall.value;
    }

    gauge.save();
  }

  return gauge;
}

export function getUserGaugeShareId(
  userAddress: Address,
  gaugeAddress: Address,
): string {
  return userAddress.toHex().concat('-').concat(gaugeAddress.toHex());
}

export function getUserGaugeShare(
  user: Address,
  gauge: Address,
): UserGaugeShare {
  let id = getUserGaugeShareId(user, gauge);
  let userShare = UserGaugeShare.load(id);

  if (userShare == null) {
    userShare = new UserGaugeShare(id);
    userShare.userAddress = user;
    userShare.gauge = gauge.toHexString();
    userShare.balance = ZERO_BD;
    userShare.save();
  }

  return userShare;
}
