import {
  AddType,
  NewGauge,
  VoteForGauge,
} from './types/GaugeController/GaugeController';
import { GaugeType, VotingGauge } from './types/schema';
import { getGaugeVote, getVotingGaugeId } from './utils/gauge';
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
  let id = getVotingGaugeId(event.params.addr, event.params.gauge_type);
  let votingGauge = VotingGauge.load(id);

  if (votingGauge == null) {
    votingGauge = new VotingGauge(id);
    votingGauge.gauge = event.params.addr.toHex();
    votingGauge.type = event.params.gauge_type.toString();
  }

  votingGauge.save();
}
