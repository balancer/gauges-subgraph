import { Address } from '@graphprotocol/graph-ts';

import { LiquidityGauge, GaugeShare } from '../types/schema';
import { ZERO_ADDRESS, ZERO_BD } from './constants';

import { LiquidityGauge as LiquidityGaugeTemplate } from '../types/templates/LiquidityGauge/LiquidityGauge';

export function getGauge(address: Address): LiquidityGauge {
  let gauge = LiquidityGauge.load(address.toHexString());

  if (gauge == null) {
    gauge = new LiquidityGauge(address.toHexString());
    gauge.poolId = Address.fromString(ZERO_ADDRESS);
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

export function getGaugeShareId(
  userAddress: Address,
  gaugeAddress: Address,
): string {
  return userAddress.toHex().concat('-').concat(gaugeAddress.toHex());
}

export function getGaugeShare(
  userAddress: Address,
  gaugeAddress: Address,
): GaugeShare {
  let id = getGaugeShareId(userAddress, gaugeAddress);
  let userShare = GaugeShare.load(id);

  if (userShare == null) {
    userShare = new GaugeShare(id);
    userShare.user = userAddress.toHexString();
    userShare.gauge = gaugeAddress.toHexString();
    userShare.balance = ZERO_BD;
    userShare.save();
  }

  return userShare;
}
