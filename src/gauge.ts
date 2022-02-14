import { ZERO_ADDRESS } from './utils/constants';
import { getGauge, getGaugeShare } from './utils/gauge';
import { scaleDownBPT } from './utils/maths';
import { LiquidityGauge } from './types/schema';

import {
  Transfer,
  UpdateLiquidityLimit,
} from './types/templates/LiquidityGauge/LiquidityGauge';
import { createUserEntity } from './utils/misc';

export function handleUpdateLiquidityLimit(event: UpdateLiquidityLimit): void {
  let gauge = getGauge(event.address);
  gauge.totalSupply = scaleDownBPT(event.params.original_supply);
  gauge.save();

  let gaugeShare = getGaugeShare(event.params.user, event.address);
  gaugeShare.balance = scaleDownBPT(event.params.original_balance);
  gaugeShare.save();
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
    createUserEntity(toAddress);

    let userShareTo = getGaugeShare(toAddress, gaugeAddress);
    userShareTo.balance = userShareTo.balance.plus(scaleDownBPT(value));
    userShareTo.save();
    gauge.totalSupply = gauge.totalSupply.plus(scaleDownBPT(value));
  } else if (isBurn) {
    createUserEntity(fromAddress);

    let userShareFrom = getGaugeShare(fromAddress, gaugeAddress);
    userShareFrom.balance = userShareFrom.balance.minus(scaleDownBPT(value));
    userShareFrom.save();
    gauge.totalSupply = gauge.totalSupply.minus(scaleDownBPT(value));
  } else {
    createUserEntity(toAddress);
    let userShareTo = getGaugeShare(toAddress, gaugeAddress);
    userShareTo.balance = userShareTo.balance.plus(scaleDownBPT(value));
    userShareTo.save();

    createUserEntity(fromAddress);
    let userShareFrom = getGaugeShare(fromAddress, gaugeAddress);
    userShareFrom.balance = userShareFrom.balance.minus(scaleDownBPT(value));
    userShareFrom.save();
  }

  gauge.save();
}
