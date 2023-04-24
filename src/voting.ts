import { BigInt } from '@graphprotocol/graph-ts';
import {
  VotingEscrowLock,
  VotingEscrow,
  LockSnapshot,
  OmniVotingEscrowLock,
} from './types/schema';
import { UserBalToChain } from './types/OmniVotingEscrow/omniVotingEscrow';
import { UserBalFromChain } from './types/OmniVotingEscrowChild/omniVotingEscrowChild';
import { Deposit, Supply, Withdraw } from './types/VotingEscrow/votingEscrow';
import { LOCK_MAXTIME, ZERO_BD } from './utils/constants';
import {
  getLockSnapshotId,
  getOmniVotingEscrowId,
  getVotingEscrowId,
} from './utils/gauge';
import { scaleDownBPT, scaleUp } from './utils/maths';
import { createUserEntity } from './utils/misc';

export function handleDeposit(event: Deposit): void {
  let userAddress = event.params.provider;
  createUserEntity(userAddress);

  let id = getVotingEscrowId(userAddress, event.address);
  let votingShare = VotingEscrowLock.load(id);

  if (votingShare == null) {
    votingShare = new VotingEscrowLock(id);
    votingShare.user = userAddress.toHexString();
    votingShare.votingEscrowID = event.address.toHexString();
    votingShare.lockedBalance = ZERO_BD;
  }

  let blockTimestamp = event.block.timestamp;
  let depositAmount = scaleDownBPT(event.params.value);

  votingShare.unlockTime = event.params.locktime;
  votingShare.updatedAt = blockTimestamp.toI32();

  votingShare.lockedBalance = votingShare.lockedBalance.plus(depositAmount);

  const slopeBI = scaleUp(votingShare.lockedBalance, 18).div(LOCK_MAXTIME);
  const biasBI = slopeBI.times(votingShare.unlockTime.minus(blockTimestamp));
  votingShare.slope = scaleDownBPT(slopeBI);
  votingShare.bias = scaleDownBPT(biasBI);

  votingShare.save();

  const snapshotId = getLockSnapshotId(userAddress, blockTimestamp.toI32());
  let lockSnapshot = LockSnapshot.load(snapshotId);

  if (lockSnapshot == null) {
    lockSnapshot = new LockSnapshot(snapshotId);
    lockSnapshot.timestamp = votingShare.updatedAt;
    lockSnapshot.user = userAddress.toHexString();
    lockSnapshot.slope = votingShare.slope;
    lockSnapshot.bias = votingShare.bias;
  }

  lockSnapshot.save();
}

export function handleWithdraw(event: Withdraw): void {
  let userAddress = event.params.provider;
  createUserEntity(userAddress);

  let id = getVotingEscrowId(userAddress, event.address);
  let votingShare = VotingEscrowLock.load(id);

  if (votingShare == null) return;

  votingShare = new VotingEscrowLock(id);
  votingShare.user = userAddress.toHexString();
  votingShare.votingEscrowID = event.address.toHexString();
  votingShare.lockedBalance = ZERO_BD;
  votingShare.updatedAt = event.block.timestamp.toI32();
  votingShare.save();
}

function setOmniVotingEscrowLock(
  contractAddress: Address,
  userAddress: Address,
  direction: string,
  chainId: i32,
  bias: BigInt,
  slope: BigInt,
): void {
  createUserEntity(userAddress);

  let id = getOmniVotingEscrowId(userAddress, contractAddress, chainId);
  let omniLock = OmniVotingEscrowLock.load(id);

  if (omniLock == null) {
    omniLock = new OmniVotingEscrowLock(id);
    omniLock.user = userAddress.toHexString();
    omniLock.votingEscrowID = contractAddress.toHexString();
    omniLock.chain = chainId;
  }

  omniLock.direction = direction;
  omniLock.bias = scaleDownBPT(bias);
  omniLock.slope = scaleDownBPT(slope);

  omniLock.save();
}

export function handleSupply(event: Supply): void {
  let id = event.address.toHexString();
  let votingEscrow = VotingEscrow.load(id);

  if (votingEscrow == null) {
    votingEscrow = new VotingEscrow(id);
  }

  votingEscrow.stakedSupply = scaleDownBPT(event.params.supply);
  votingEscrow.save();
}

export function handleUserBalFromChain(event: UserBalFromChain): void {
  setOmniVotingEscrowLock(
    event.address,
    event.params.user,
    'From',
    event.params.srcChainId,
    event.params.userPoint.bias,
    event.params.userPoint.slope,
  );
}

export function handleUserBalToChain(event: UserBalToChain): void {
  setOmniVotingEscrowLock(
    event.address,
    event.params.localUser,
    'To',
    event.params.dstChainId,
    event.params.userPoint.bias,
    event.params.userPoint.slope,
  );
}
