import { Address, BigInt } from '@graphprotocol/graph-ts';

import { LiquidityGauge, GaugeShare, RewardToken, GaugeVote, GaugeType } from '../types/schema';
import { CONTROLLER_ADDRESS, ZERO_ADDRESS, ZERO_BD } from './constants';
import { LiquidityGauge as LiquidityGaugeTemplate } from '../types/templates/LiquidityGauge/LiquidityGauge';
import { createUserEntity, getTokenDecimals, getTokenSymbol } from './misc';
import { GaugeController } from '../types/GaugeController/GaugeController';

export function getRewardTokenId(tokenAddress: Address, gaugeAddress: Address): string {
  return tokenAddress.toHex().concat('-').concat(gaugeAddress.toHex());
}

export function getRewardToken(tokenAddress: Address, gaugeAddress: Address): RewardToken {
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

export function getLiquidityGauge(address: Address): LiquidityGauge {
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

export function getGaugeShareId(userAddress: Address, gaugeAddress: Address): string {
  return userAddress.toHex().concat('-').concat(gaugeAddress.toHex());
}

export function createGaugeShare(userAddress: Address, gaugeAddress: Address): GaugeShare {
  createUserEntity(userAddress);
  let id = getGaugeShareId(userAddress, gaugeAddress);

  let gaugeShare = new GaugeShare(id);
  gaugeShare.user = userAddress.toHexString();
  gaugeShare.gauge = gaugeAddress.toHexString();
  gaugeShare.balance = ZERO_BD;
  gaugeShare.save();

  return gaugeShare;
}

export function getGaugeShare(userAddress: Address, gaugeAddress: Address): GaugeShare {
  let id = getGaugeShareId(userAddress, gaugeAddress);
  let gaugeShare = GaugeShare.load(id);

  if (gaugeShare == null) {
    return createGaugeShare(userAddress, gaugeAddress);
  }

  return gaugeShare;
}

export function getGaugeId(gaugeAddress: Address, gaugeType: BigInt): string {
  return gaugeAddress.toHex().concat('-').concat(gaugeType.toString());
}

export function getVotingEscrowId(userAddress: Address, votingEscrowAddress: Address): string {
  return userAddress.toHex().concat('-').concat(votingEscrowAddress.toHex());
}

export function getGaugeVoteId(userAddress: Address, gaugeAddress: Address): string {
  return userAddress.toHex().concat('-').concat(gaugeAddress.toHex());
}

export function getGaugeVote(userAddress: Address, gaugeAddress: Address): GaugeVote {
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

function getTypeName(typeNumber: BigInt): string {
  let controller = GaugeController.bind(CONTROLLER_ADDRESS);
  let nameCall = controller.try_gauge_type_names(typeNumber);
  let name = nameCall.reverted ? '' : nameCall.value;

  return name;
}

export function getGaugeType(typeNumber: BigInt): GaugeType {
  let typeId = typeNumber.toString();
  let type = GaugeType.load(typeId);

  if (type == null) {
    type = new GaugeType(typeId);
    type.name = getTypeName(typeNumber);
  }

  type.save();

  return type;
}
