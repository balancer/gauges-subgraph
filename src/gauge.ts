import { ZERO_ADDRESS } from './utils/constants';
import { getGaugeShare, getRewardToken } from './utils/gauge';
import { scaleDown, scaleDownBPT } from './utils/maths';
import { LiquidityGauge, Pool, RootGauge } from './types/schema';

import {
  Transfer,
  // eslint-disable-next-line camelcase
  Deposit_reward_tokenCall,
} from './types/templates/LiquidityGauge/LiquidityGauge';
import { KillGaugeCall, UnkillGaugeCall } from './types/templates/RootGauge/ArbitrumRootGauge';

// eslint-disable-next-line camelcase
export function handleDepositRewardToken(call: Deposit_reward_tokenCall): void {
  /* eslint-disable no-underscore-dangle */
  const address = call.inputs._reward_token;
  const amount = call.inputs._amount;
  /* eslint-enable no-underscore-dangle */

  const rewardToken = getRewardToken(address, call.to);
  const amountScaled = scaleDown(amount, rewardToken.decimals);
  rewardToken.totalDeposited = rewardToken.totalDeposited.plus(amountScaled);
  rewardToken.save();
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
    let userShareTo = getGaugeShare(toAddress, gaugeAddress);
    userShareTo.balance = userShareTo.balance.plus(scaleDownBPT(value));
    userShareTo.save();
    gauge.totalSupply = gauge.totalSupply.plus(scaleDownBPT(value));
  } else if (isBurn) {
    let userShareFrom = getGaugeShare(fromAddress, gaugeAddress);
    userShareFrom.balance = userShareFrom.balance.minus(scaleDownBPT(value));
    userShareFrom.save();
    gauge.totalSupply = gauge.totalSupply.minus(scaleDownBPT(value));
  } else {
    let userShareTo = getGaugeShare(toAddress, gaugeAddress);
    userShareTo.balance = userShareTo.balance.plus(scaleDownBPT(value));
    userShareTo.save();

    let userShareFrom = getGaugeShare(fromAddress, gaugeAddress);
    userShareFrom.balance = userShareFrom.balance.minus(scaleDownBPT(value));
    userShareFrom.save();
  }

  gauge.save();
}

export function handleRootKillGauge(call: KillGaugeCall): void {
  // eslint-disable-next-line no-underscore-dangle
  let gauge = RootGauge.load(call.to.toHexString()) as RootGauge;
  gauge.isKilled = true;
  gauge.save();
}

export function handleRootUnkillGauge(call: UnkillGaugeCall): void {
  // eslint-disable-next-line no-underscore-dangle
  let gauge = RootGauge.load(call.to.toHexString()) as RootGauge;
  gauge.isKilled = false;
  gauge.save();
}

export function handleKillGauge(call: KillGaugeCall): void {
  // eslint-disable-next-line no-underscore-dangle
  let killedGaugeId = call.to.toHexString();
  let killedGauge = LiquidityGauge.load(killedGaugeId);
  if (killedGauge == null) return;
  killedGauge.isKilled = true;
  killedGauge.save();

  // Update Preferential Gauge

  let poolId = killedGauge.pool;
  let pool = Pool.load(poolId);
  if (pool == null) return;

  let currentPreferentialGaugeId = pool.preferentialGauge;

  if (currentPreferentialGaugeId && currentPreferentialGaugeId == killedGaugeId) {
    pool.preferentialGauge = '';

    let gaugesId = pool.gauges;
    if (gaugesId == null) return;

    let preferencialGaugeTimestamp = 0;
    for (let i: i32 = 0; i < gaugesId.length; i++) {
      let gauge = LiquidityGauge.load(gaugesId[i]) as LiquidityGauge;

      if (!gauge.isKilled && gauge.isAdded && gauge.addedTimestamp > preferencialGaugeTimestamp) {
        pool.preferentialGauge = gauge.id;
        preferencialGaugeTimestamp = gauge.addedTimestamp;
      }
    }
  }

  pool.save();
}

export function handleUnkillGauge(call: UnkillGaugeCall): void {
  // eslint-disable-next-line no-underscore-dangle
  let unkilledGaugeId = call.to.toHexString();
  let unkilledGauge = LiquidityGauge.load(unkilledGaugeId);
  if (unkilledGauge == null) return;
  unkilledGauge.isKilled = false;
  unkilledGauge.save();

  // Update Preferential Gauge

  let poolId = unkilledGauge.pool;
  let pool = Pool.load(poolId);
  if (pool == null) return;

  let preferentialGaugeId = pool.preferentialGauge;
  if (preferentialGaugeId === null) return;
  let preferentialGauge = LiquidityGauge.load(preferentialGaugeId) as LiquidityGauge;

  if (unkilledGauge.isAdded && unkilledGauge.addedTimestamp > preferentialGauge.addedTimestamp) {
    pool.preferentialGauge = preferentialGauge.id;
    pool.save();
  }
}
