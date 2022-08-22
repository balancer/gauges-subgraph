import { Address } from '@graphprotocol/graph-ts';

import { GaugeCreated } from './types/GaugeFactory/GaugeFactory';
import { GaugeFactory, RootGauge } from './types/schema';
import { getGauge } from './utils/gauge';

import {
  RootGauge as RootGaugeTemplate,
  LiquidityGauge as LiquidityGaugeTemplate,
  RewardsOnlyGauge as RewardsOnlyGaugeTemplate,
} from './types/templates';

import { getPoolId } from './utils/misc';
import { RewardsOnlyGaugeCreated } from './types/ChildChainLiquidityGaugeFactory/ChildChainLiquidityGaugeFactory';
import { ArbitrumRootGaugeCreated } from './types/ArbitrumRootGaugeFactory/ArbitrumRootGaugeFactory';
import {
  ARBITRUM_ROOT_GAUGE_FACTORY,
  OPTIMISM_ROOT_GAUGE_FACTORY,
  POLYGON_ROOT_GAUGE_FACTORY,
} from './utils/constants';

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

export function handleRootGaugeCreated(event: ArbitrumRootGaugeCreated): void {
  const gaugeAddress = event.params.gauge;

  let gauge = new RootGauge(gaugeAddress.toHexString());
  gauge.recipient = event.params.recipient;
  gauge.isKilled = false;

  if (event.address == ARBITRUM_ROOT_GAUGE_FACTORY) {
    gauge.chain = 'Arbitrum';
  } else if (event.address == OPTIMISM_ROOT_GAUGE_FACTORY) {
    gauge.chain = 'Optimism';
  } else if (event.address == POLYGON_ROOT_GAUGE_FACTORY) {
    gauge.chain = 'Polygon';
  }

  gauge.save();

  RootGaugeTemplate.create(gaugeAddress);
}
