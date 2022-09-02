import { AddType, NewGauge, VoteForGauge } from './types/GaugeController/GaugeController';
import { Gauge, LiquidityGauge, Pool, RootGauge } from './types/schema';
import { getGaugeVote, getGaugeId, getGaugeType } from './utils/gauge';
import { scaleDownBPT } from './utils/maths';

export function handleVoteForGauge(event: VoteForGauge): void {
  let userAddress = event.params.user;
  let gaugeAddress = event.params.gauge_addr;

  let gaugeVote = getGaugeVote(userAddress, gaugeAddress);
  gaugeVote.weight = scaleDownBPT(event.params.weight);
  gaugeVote.timestamp = event.params.time;
  gaugeVote.save();
}

export function handleAddType(event: AddType): void {
  let type = getGaugeType(event.params.type_id);
  type.save();
}

export function handleNewGauge(event: NewGauge): void {
  let gaugeId = getGaugeId(event.params.addr, event.params.gauge_type);
  let type = getGaugeType(event.params.gauge_type);
  let gauge = Gauge.load(gaugeId);

  let liquidityGauge = LiquidityGauge.load(event.params.addr.toHexString());
  let rootGauge = RootGauge.load(event.params.addr.toHexString());

  if (gauge == null) {
    gauge = new Gauge(gaugeId);
    gauge.address = event.params.addr;
    gauge.type = type.id;
    gauge.liquidityGauge = liquidityGauge ? liquidityGauge.id : null;
    gauge.rootGauge = rootGauge ? rootGauge.id : null;
  }

  gauge.save();

  // Update Prefential Gauge

  if (liquidityGauge == null) return;

  liquidityGauge.isAdded = true;
  liquidityGauge.addedTimestamp = event.block.timestamp.toI32();
  liquidityGauge.save();

  let poolId = liquidityGauge.pool;
  let pool = Pool.load(poolId);

  if (pool == null) return;

  pool.preferentialGauge = liquidityGauge.id;

  pool.save();
}
