import {
  AddType,
  NewGauge,
  VoteForGauge,
} from './types/GaugeController/GaugeController';
import { Gauge } from './types/schema';
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
  let gauge = Gauge.load(gaugeId);

  let type = getGaugeType(event.params.gauge_type);

  if (gauge == null) {
    gauge = new Gauge(gaugeId);
    gauge.address = event.params.addr;
    gauge.type = type.id;
  }

  gauge.save();
}
