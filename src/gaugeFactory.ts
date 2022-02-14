import { Address } from '@graphprotocol/graph-ts';

import { GaugeCreated } from './types/LiquidityGaugeFactory/gaugeFactory';
import { LiquidityGaugeFactory } from './types/schema';
import { getGauge } from './utils/gauge';

import { LiquidityGauge as LiquidityGaugeTemplate } from './types/templates';

function getGaugeFactory(address: Address): LiquidityGaugeFactory {
  let factory = LiquidityGaugeFactory.load(address.toHexString());

  if (factory == null) {
    factory = new LiquidityGaugeFactory(address.toHexString());
    factory.numGauges = 0;
    factory.save();
  }

  return factory;
}

export function handleGaugeCreated(event: GaugeCreated): void {
  let factory = getGaugeFactory(event.address);
  factory.numGauges += 1;
  factory.save();

  let gauge = getGauge(event.params.gauge);
  gauge.poolId = event.params.pool;
  gauge.factory = event.address.toHexString();
  gauge.save();

  LiquidityGaugeTemplate.create(event.params.gauge);
}
