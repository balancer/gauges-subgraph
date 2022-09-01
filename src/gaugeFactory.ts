import { Address } from '@graphprotocol/graph-ts';

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
import { CreateCall as MainnetGaugeCreateCall } from './types/GaugeV2Factory/GaugeV2Factory';
import { CreateCall as RootGaugeCreateCall } from './types/ArbitrumRootGaugeV2Factory/ArbitrumRootGaugeV2Factory';

function getGaugeFactory(address: Address): GaugeFactory {
  let factory = GaugeFactory.load(address.toHexString());

  if (factory == null) {
    factory = new GaugeFactory(address.toHexString());
    factory.numGauges = 0;
    factory.save();
  }

  return factory;
}

export function handleLiquidityGaugeCreated(call: MainnetGaugeCreateCall): void {
  const factoryAddress = call.to;
  let factory = getGaugeFactory(factoryAddress);
  factory.numGauges += 1;
  factory.save();

  const pool = getPoolEntity(call.inputs.pool);

  const gaugeAddress = call.outputs.value0;
  let gauge = getLiquidityGauge(gaugeAddress);
  gauge.pool = pool.id;
  gauge.poolAddress = call.inputs.pool;
  gauge.poolId = getPoolId(call.inputs.pool);
  gauge.factory = factoryAddress.toHexString();

  if (isV2Factory(factoryAddress)) {
    const relativeWeightCap = scaleDownBPT(call.inputs.relativeWeightCap);
    gauge.relativeWeightCap = relativeWeightCap;
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

export function handleRootGaugeCreated(call: RootGaugeCreateCall): void {
  const factoryAddress = call.to;
  const gaugeAddress = call.outputs.value0;

  let gauge = new RootGauge(gaugeAddress.toHexString());
  gauge.recipient = call.inputs.recipient;
  gauge.isKilled = false;

  if (isArbitrumFactory(factoryAddress)) {
    gauge.chain = 'Arbitrum';
  } else if (isOptimismFactory(factoryAddress)) {
    gauge.chain = 'Optimism';
  } else if (isPolygonFactory(factoryAddress)) {
    gauge.chain = 'Polygon';
  }

  if (isV2Factory(factoryAddress)) {
    const relativeWeightCap = scaleDownBPT(call.inputs.relativeWeightCap);
    gauge.relativeWeightCap = relativeWeightCap;
  }

  gauge.save();

  RootGaugeTemplate.create(gaugeAddress);
}
