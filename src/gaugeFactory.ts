import { Address, log } from '@graphprotocol/graph-ts';

import { GaugeFactory, RootGauge } from './types/schema';
import { getLiquidityGauge } from './utils/gauge';
import { scaleDownBPT } from './utils/maths';

import {
  RootGauge as RootGaugeTemplate,
  LiquidityGauge as LiquidityGaugeTemplate,
  RewardsOnlyGauge as RewardsOnlyGaugeTemplate,
} from './types/templates';
import { getPoolEntity, getPoolId } from './utils/misc';
import { RewardsOnlyGaugeCreated } from './types/ChildChainLiquidityGaugeFactory/ChildChainLiquidityGaugeFactory';
import { isArbitrumFactory, isOptimismFactory, isPolygonFactory, isV2Factory } from './utils/constants';
import { GaugeCreated as MainnetGaugeCreated } from './types/GaugeV2Factory/GaugeV2Factory';
import { GaugeCreated as RootGaugeCreated } from './types/ArbitrumRootGaugeV2Factory/ArbitrumRootGaugeV2Factory';
import { LiquidityGauge as LiquidityGaugeV2  } from './types/GaugeV2Factory/LiquidityGauge';
import { ArbitrumRootGauge as RootGaugeContract } from './types/templates/RootGauge/ArbitrumRootGauge';

function getGaugeFactory(address: Address): GaugeFactory {
  let factory = GaugeFactory.load(address.toHexString());

  if (factory == null) {
    factory = new GaugeFactory(address.toHexString());
    factory.numGauges = 0;
    factory.save();
  }

  return factory;
}

export function handleLiquidityGaugeCreated(event: MainnetGaugeCreated): void {
  const gaugeAddress = event.params.gauge;
  const factoryAddress = event.address;
  let factory = getGaugeFactory(factoryAddress);
  factory.numGauges += 1;
  factory.save();

  const gaugeContract = LiquidityGaugeV2.bind(gaugeAddress);
  const lpTokenCall = gaugeContract.try_lp_token();
  if (lpTokenCall.reverted) {
    log.warning('Call to lp_token() failed: {} {}', [gaugeAddress.toHexString(), event.transaction.hash.toHexString()]);
    return;
  }

  const poolAddress = lpTokenCall.value;
  const pool = getPoolEntity(lpTokenCall.value);

  let gauge = getLiquidityGauge(gaugeAddress);
  gauge.pool = pool.id;
  gauge.poolAddress = poolAddress;
  gauge.poolId = getPoolId(poolAddress);
  gauge.factory = factoryAddress.toHexString();

  if (isV2Factory(factoryAddress)) {
    const weightCapCall = gaugeContract.try_getRelativeWeightCap();
    if (!weightCapCall.reverted) {
      const relativeWeightCap = scaleDownBPT(weightCapCall.value);
      gauge.relativeWeightCap = relativeWeightCap;
    } else {
      log.warning('Call to getRelativeWeightCap() failed: {} {}', [gaugeAddress.toHexString(), event.transaction.hash.toHexString()]);
      return;
    }
  }

  gauge.save();

  LiquidityGaugeTemplate.create(gaugeAddress);
}

export function handleRewardsOnlyGaugeCreated(event: RewardsOnlyGaugeCreated): void {
  let factory = getGaugeFactory(event.address);
  factory.numGauges += 1;
  factory.save();

  let gauge = getLiquidityGauge(event.params.gauge);
  gauge.streamer = event.params.streamer;
  gauge.poolAddress = event.params.pool;
  gauge.poolId = getPoolId(event.params.pool);
  gauge.factory = event.address.toHexString();
  gauge.save();

  let pool = getPoolEntity(event.params.pool);
  pool.address = event.params.pool;
  pool.poolId = getPoolId(event.params.pool);
  pool.preferentialGauge = gauge.id;
  pool.save();

  RewardsOnlyGaugeTemplate.create(event.params.gauge);
}

export function handleRootGaugeCreated(event: RootGaugeCreated): void {
  const factoryAddress = event.address;
  const gaugeAddress = event.params.gauge;

  const rootGaugeContract = RootGaugeContract.bind(gaugeAddress);
  const recipientCall = rootGaugeContract.try_getRecipient();
  if (recipientCall.reverted) {
    log.warning('Call to getRecipient() failed: {} {}', [gaugeAddress.toHexString(), event.transaction.hash.toHexString()]);
    return;
  }

  let gauge = new RootGauge(gaugeAddress.toHexString());
  gauge.recipient = recipientCall.value;
  gauge.isKilled = false;
  gauge.factory = factoryAddress.toHexString();
  

  if (isArbitrumFactory(factoryAddress)) {
    gauge.chain = 'Arbitrum';
  } else if (isOptimismFactory(factoryAddress)) {
    gauge.chain = 'Optimism';
  } else if (isPolygonFactory(factoryAddress)) {
    gauge.chain = 'Polygon';
  }

  if (isV2Factory(factoryAddress)) {
    const gaugeContract = LiquidityGaugeV2.bind(gaugeAddress);
    const weightCapCall = gaugeContract.try_getRelativeWeightCap();
    if (!weightCapCall.reverted) {
      const relativeWeightCap = scaleDownBPT(weightCapCall.value);
      gauge.relativeWeightCap = relativeWeightCap;
    } else {
      log.warning('Call to getRelativeWeightCap() failed: {} {}', [gaugeAddress.toHexString(), event.transaction.hash.toHexString()]);
      return;
    }
  }

  gauge.save();

  RootGaugeTemplate.create(gaugeAddress);
}
