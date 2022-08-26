import { Address } from '@graphprotocol/graph-ts';

import { GaugeFactory, RootGauge } from './types/schema';
import { getGauge } from './utils/gauge';
import { scaleDownBPT } from './utils/maths';

import {
  RootGauge as RootGaugeTemplate,
  LiquidityGauge as LiquidityGaugeTemplate,
  RewardsOnlyGauge as RewardsOnlyGaugeTemplate,
} from './types/templates';
import { getPoolId } from './utils/misc';
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

  const gaugeAddress = call.outputs.value0;
  let gauge = getGauge(gaugeAddress);
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

  let gauge = getGauge(event.params.gauge);
  gauge.streamer = event.params.streamer;
  gauge.poolAddress = event.params.pool;
  gauge.poolId = getPoolId(event.params.pool);
  gauge.factory = event.address.toHexString();
  gauge.save();

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
