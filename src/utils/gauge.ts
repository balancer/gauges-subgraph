import { Address } from '@graphprotocol/graph-ts';
import { Gauge } from '../types/schema';
import { AddressZero, ZERO_BD } from './constants';

export function getGauge(address: Address): Gauge {
  let gauge = Gauge.load(address.toHexString());
  if (gauge == null) {
    gauge = new Gauge(address.toHexString());
    gauge.pool = Address.fromByteArray(AddressZero);
    gauge.factory = AddressZero.toHexString();
    gauge.totalSupply = ZERO_BD;
    gauge.workingSupply = ZERO_BD;
    gauge.save();
  }
  return gauge;
}
