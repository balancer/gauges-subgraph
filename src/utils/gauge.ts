import { Address, BigInt } from '@graphprotocol/graph-ts';

import {
  LiquidityGauge,
  GaugeShare,
  RewardToken,
  GaugeVote,
} from '../types/schema';
import { ZERO_ADDRESS, ZERO_BD } from './constants';
import { LiquidityGauge as LiquidityGaugeTemplate } from '../types/templates/LiquidityGauge/LiquidityGauge';
import { getTokenDecimals, getTokenSymbol } from './misc';

export function getRewardTokenId(
  tokenAddress: Address,
  gaugeAddress: Address,
): string {
  return tokenAddress.toHex().concat('-').concat(gaugeAddress.toHex());
}

export function getRewardToken(
  tokenAddress: Address,
  gaugeAddress: Address,
): RewardToken {
  let id = getRewardTokenId(tokenAddress, gaugeAddress);
  let rewardToken = RewardToken.load(id);

  if (rewardToken == null) {
    rewardToken = new RewardToken(id);
    rewardToken.gauge = gaugeAddress.toHexString();
    rewardToken.symbol = getTokenSymbol(tokenAddress);
    rewardToken.decimals = getTokenDecimals(tokenAddress);
    rewardToken.totalDeposited = ZERO_BD;
    rewardToken.save();
  }

  return rewardToken;
}

export function getGauge(address: Address): LiquidityGauge {
  let gauge = LiquidityGauge.load(address.toHexString());

  if (gauge == null) {
    gauge = new LiquidityGauge(address.toHexString());
    gauge.poolId = Address.fromString(ZERO_ADDRESS);
    gauge.factory = ZERO_ADDRESS;
    gauge.totalSupply = ZERO_BD;

    let gaugeToken = LiquidityGaugeTemplate.bind(address);
    let symbolCall = gaugeToken.try_symbol();
    if (!symbolCall.reverted) {
      gauge.symbol = symbolCall.value;
    }

    gauge.save();
  }

  return gauge;
}

export function getGaugeShareId(
  userAddress: Address,
  gaugeAddress: Address,
): string {
  return userAddress.toHex().concat('-').concat(gaugeAddress.toHex());
}

export function getGaugeShare(
  userAddress: Address,
  gaugeAddress: Address,
): GaugeShare {
  let id = getGaugeShareId(userAddress, gaugeAddress);
  let userShare = GaugeShare.load(id);

  if (userShare == null) {
    userShare = new GaugeShare(id);
    userShare.user = userAddress.toHexString();
    userShare.gauge = gaugeAddress.toHexString();
    userShare.balance = ZERO_BD;
    userShare.save();
  }

  return userShare;
}

export function getVotingGaugeId(
  gaugeAddress: Address,
  gaugeType: BigInt,
): string {
  return gaugeAddress.toHex().concat('-').concat(gaugeType.toString());
}

export function getVotingEscrowId(
  userAddress: Address,
  votingEscrowAddress: Address,
): string {
  return userAddress.toHex().concat('-').concat(votingEscrowAddress.toHex());
}

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
