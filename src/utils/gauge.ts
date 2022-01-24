import { Address } from '@graphprotocol/graph-ts';
import { Gauge, UserGaugeDeposit } from '../types/schema';
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

export function getUserGaugeDepositId(
  userAddress: Address,
  gaugeAddress: Address,
): string {
  return userAddress.toHex().concat('-').concat(gaugeAddress.toHex());
}

export function getUserGaugeDeposit(
  user: Address,
  gauge: Address,
): UserGaugeDeposit {
  let id = getUserGaugeDepositId(user, gauge);
  let deposit = UserGaugeDeposit.load(id);
  if (deposit == null) {
    deposit = new UserGaugeDeposit(id);
    deposit.user = user;
    deposit.gauge = gauge.toHexString();
    deposit.balance = ZERO_BD;
    deposit.workingBalance = ZERO_BD;
    deposit.save();
  }
  return deposit;
}
