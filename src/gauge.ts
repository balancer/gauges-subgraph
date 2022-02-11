import { ZERO_ADDRESS } from './utils/constants';
import { getGauge, getUserGaugeShare } from './utils/gauge';
import { scaleDownBPT } from './utils/maths';
import { LiquidityGauge } from './types/schema';

import {
  Transfer,
  UpdateLiquidityLimit,
} from './types/templates/LiquidityGauge/LiquidityGauge';

export function handleUpdateLiquidityLimit(event: UpdateLiquidityLimit): void {
  let gauge = getGauge(event.address);
  gauge.totalSupply = scaleDownBPT(event.params.original_supply);
  gauge.save();
}

export function handleTransfer(event: Transfer): void {
  let gaugeAddress = event.address;

  let gauge = LiquidityGauge.load(gaugeAddress.toHexString()) as LiquidityGauge;

  /* eslint-disable no-underscore-dangle */
  let fromAddress = event.params._from;
  let toAddress = event.params._to;
  let value = event.params._value;
  /* eslint-enable no-underscore-dangle */

  let isMint = fromAddress.toHexString() == ZERO_ADDRESS;
  let isBurn = toAddress.toHexString() == ZERO_ADDRESS;

  if (isMint) {
    let userShareTo = getUserGaugeShare(toAddress, gaugeAddress);
    userShareTo.balance = userShareTo.balance.plus(scaleDownBPT(value));
    userShareTo.save();
    gauge.totalSupply = gauge.totalSupply.plus(scaleDownBPT(value));
  } else if (isBurn) {
    let userShareFrom = getUserGaugeShare(fromAddress, gaugeAddress);
    userShareFrom.balance = userShareFrom.balance.minus(scaleDownBPT(value));
    userShareFrom.save();
    gauge.totalSupply = gauge.totalSupply.minus(scaleDownBPT(value));
  } else {
    let userShareTo = getUserGaugeShare(toAddress, gaugeAddress);
    userShareTo.balance = userShareTo.balance.plus(scaleDownBPT(value));
    userShareTo.save();

    let userShareFrom = getUserGaugeShare(fromAddress, gaugeAddress);
    userShareFrom.balance = userShareFrom.balance.minus(scaleDownBPT(value));
    userShareFrom.save();
  }

  gauge.save();
}
