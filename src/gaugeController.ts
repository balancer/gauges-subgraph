import { Address } from '@graphprotocol/graph-ts';
import { VoteForGauge } from './types/GaugeController/GaugeController';
import { GaugeVote } from './types/schema';
import { scaleDownBPT } from './utils/maths';

export function getGaugeVoteId(
  userAddress: Address,
  gaugeAddress: Address,
): string {
  return userAddress.toHex().concat('-').concat(gaugeAddress.toHex());
}

export function getGaugeVote(
  userAddress: Address,
  gaugeAddress: Address,
): GaugeVote {
  let id = getGaugeVoteId(userAddress, gaugeAddress);
  let gaugeVote = GaugeVote.load(id);

  if (gaugeVote == null) {
    gaugeVote = new GaugeVote(id);
    gaugeVote.user = userAddress.toHexString();
    gaugeVote.gauge = gaugeAddress.toHexString();
    gaugeVote.save();
  }

  return gaugeVote;
}

export function handleVoteForGauge(event: VoteForGauge): void {
  let userAddress = event.params.user;
  let gaugeAddress = event.params.gauge_addr;

  let gaugeVote = getGaugeVote(userAddress, gaugeAddress);
  gaugeVote.weight = scaleDownBPT(event.params.weight);
  gaugeVote.timestamp = event.params.time;
  gaugeVote.save();
}
