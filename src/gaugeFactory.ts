import { Address } from '@graphprotocol/graph-ts';
import { Gauge, GaugeFactory } from './types/schema';
import { AddressZero, ZERO_BD } from './utils/constants';
import { GaugeCreated } from './types/GaugeFactory/gaugeFactory';

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

function getGauge(address: Address): Gauge {
  let gauge = Gauge.load(address.toHexString());
  if (gauge == null) {
    gauge = new Gauge(address.toHexString());
    gauge.pool = AddressZero;
    gauge.totalSupply = ZERO_BD;
    gauge.workingSupply = ZERO_BD;
    gauge.save();
  }
  return gauge;
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
