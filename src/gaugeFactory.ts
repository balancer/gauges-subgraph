import { Address } from '@graphprotocol/graph-ts';

import { GaugeCreated } from './types/GaugeFactory/GaugeFactory';
import { GaugeFactory } from './types/schema';
import { getGauge } from './utils/gauge';

import {
  LiquidityGauge as LiquidityGaugeTemplate,
  RewardsOnlyGauge as RewardsOnlyGaugeTemplate,
} from './types/templates';

import { getPoolId } from './utils/misc';
import { RewardsOnlyGaugeCreated } from './types/ChildChainLiquidityGaugeFactory/ChildChainLiquidityGaugeFactory';

function getGaugeFactory(address: Address): GaugeFactory {
  let factory = GaugeFactory.load(address.toHexString());

  if (factory == null) {
    factory = new GaugeFactory(address.toHexString());
    factory.numGauges = 0;
    factory.save();
  }

  return factory;
}

export function handleLiquidityGaugeCreated(event: GaugeCreated): void {
  let factory = getGaugeFactory(event.address);
  factory.numGauges += 1;
  factory.save();

  let gauge = getGauge(event.params.gauge);
  gauge.poolAddress = event.params.pool;
  gauge.poolId = getPoolId(event.params.pool);
  gauge.factory = event.address.toHexString();
  gauge.save();

  LiquidityGaugeTemplate.create(event.params.gauge);
}

export function handleRewardsOnlyGaugeCreated(
  event: RewardsOnlyGaugeCreated,
): void {
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
