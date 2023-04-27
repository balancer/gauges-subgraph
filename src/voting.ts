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
  let userAddress = event.params.user;
  createUserEntity(userAddress);

  let id = getVotingEscrowId(userAddress, event.address);
  let votingShare = VotingEscrowLock.load(id);

  if (votingShare == null) {
    votingShare = new VotingEscrowLock(id);
    votingShare.user = userAddress.toHexString();
    votingShare.votingEscrowID = event.address.toHexString();
  }

  // TODO: is event.params.ts == blockTimestamp?
  votingShare.unlockTime = event.params.userPoint.ts;
  votingShare.updatedAt = event.block.timestamp.toI32();

  const lockedBalanceBI = event.params.userPoint.slope.times(LOCK_MAXTIME);
  votingShare.lockedBalance = scaleDownBPT(lockedBalanceBI);

  votingShare.slope = scaleDownBPT(event.params.userPoint.slope);
  votingShare.bias = scaleDownBPT(event.params.userPoint.bias);

  votingShare.save();
}

export function handleUserBalToChain(event: UserBalToChain): void {
  // TODO: find diff between localUser and remoteUser
  // maybe create 2 separate fields for this
  let userAddress = event.params.localUser;
  createUserEntity(userAddress);

  let contractAddress = event.address;
  let dstChainId = event.params.dstChainId;

  let id = getOmniVotingEscrowId(userAddress, contractAddress, dstChainId);
  let omniLock = OmniVotingEscrowLock.load(id);

  if (omniLock == null) {
    omniLock = new OmniVotingEscrowLock(id);
    omniLock.user = userAddress.toHexString();
    omniLock.votingEscrowID = event.address.toHexString();
    omniLock.dstChainId = event.params.dstChainId;
  }

  omniLock.bias = scaleDownBPT(event.params.userPoint.bias);
  omniLock.slope = scaleDownBPT(event.params.userPoint.slope);

  omniLock.save();
}
