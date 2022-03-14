import {
  AddType,
  NewGauge,
  VoteForGauge,
} from './types/GaugeController/GaugeController';
import { GaugeType, Gauge } from './types/schema';
import { getGaugeVote, getGaugeId } from './utils/gauge';
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
  let type = new GaugeType(event.params.type_id.toString());
  type.name = event.params.name;
  type.save();
}

export function handleNewGauge(event: NewGauge): void {
  let id = getGaugeId(event.params.addr, event.params.gauge_type);
  let votingGauge = Gauge.load(id);

  if (votingGauge == null) {
    votingGauge = new Gauge(id);
    votingGauge.address = event.params.addr;
    votingGauge.type = event.params.gauge_type.toString();
  }

  votingGauge.save();
}
