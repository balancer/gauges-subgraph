import { LogArgument } from './types/EventEmitter/EventEmitter';
import { Pool, LiquidityGauge } from './types/schema';

export function handleLogArgument(event: LogArgument): void {
  const identifier = event.params.identifier.toHexString();

  // convention: identifier = keccak256(function_name)
  // keccak256(setPreferentialGauge) = 0x88aea7780a038b8536bb116545f59b8a089101d5e526639d3c54885508ce50e2
  if (identifier == '0x88aea7780a038b8536bb116545f59b8a089101d5e526639d3c54885508ce50e2') {
    setPreferentialGauge(event);
  }
}

function setPreferentialGauge(event: LogArgument): void {
  /**
   * Sets/Unsets a gauge as the preferential gauge
   * It is expected that a new gauge will be set as preferential after unsetting the old one
   *
   * @param message - The gauge address (eg. 0x12345abce... - all lowercase)
   * @param value - 0 if swapEnabled is to be set false; any other value sets it to true
   */ //
  const gaugeId = event.params.message.toHexString();
  const gauge = LiquidityGauge.load(gaugeId);
  if (!gauge) return;

  if (event.params.value.toI32() == 0) {
    gauge.isPreferentialGauge = false;
    // Update Pool's preferentialGauge

    let poolId = gauge.pool;
    if (poolId === null) return;

    let pool = Pool.load(poolId);
    if (pool == null) return;

    pool.preferentialGauge = "";
    pool.save();
  } else {
    gauge.isPreferentialGauge = true;
    // Update Pool's preferentialGauge

    let poolId = gauge.pool;
    if (poolId === null) return;

    let pool = Pool.load(poolId);
    if (pool == null) return;

    pool.preferentialGauge = gaugeId;
    pool.save();
  }
  gauge.save();
}