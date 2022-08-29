import { VotingEscrowLock, VotingEscrow } from './types/schema';
import { Deposit, Supply, Withdraw } from './types/VotingEscrow/votingEscrow';
import { ZERO_BD } from './utils/constants';
import { getVotingEscrowId } from './utils/gauge';
import { scaleDownBPT } from './utils/maths';
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

  votingShare.unlockTime = event.params.locktime;
  let depositAmount = scaleDownBPT(event.params.value);
  votingShare.lockedBalance = votingShare.lockedBalance.plus(depositAmount);
  votingShare.updatedAt = event.block.timestamp.toI32();
  votingShare.save();
}

export function handleWithdraw(event: Withdraw): void {
  let userAddress = event.params.provider;
  createUserEntity(userAddress);

  let id = getVotingEscrowId(userAddress, event.address);
  let votingShare = VotingEscrowLock.load(id);

  if (votingShare == null) {
    votingShare = new VotingEscrowLock(id);
    votingShare.user = userAddress.toHexString();
    votingShare.votingEscrowID = event.address.toHexString();
  }

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
