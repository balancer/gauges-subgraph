import { Address } from '@graphprotocol/graph-ts';
import { GaugeCreated } from './types/GaugeFactory/gaugeFactory';
import { GaugeFactory } from './types/schema';
import { getGauge } from './utils/gauge';

function getGaugeFactory(address: Address): GaugeFactory {
  let factory = GaugeFactory.load(address.toHexString());
  if (factory == null) {
    factory = new GaugeFactory(address.toHexString());
    factory.name = 'EMPTY NAME';
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
  gauge.pool = event.params.pool;
  gauge.factory = event.address.toHexString();
  gauge.save();
}
