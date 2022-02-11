import { Address } from '@graphprotocol/graph-ts';

import { UserVotingEscrow } from './types/schema';
import { Deposit, Withdraw } from './types/VotingEscrow/votingEscrow';
import { ZERO_BD } from './utils/constants';
import { scaleDownBPT } from './utils/maths';

function getUserVotingEscrowId(
  userAddress: Address,
  votingEscrowAddress: Address,
): string {
  return userAddress.toHex().concat('-').concat(votingEscrowAddress.toHex());
}

export function handleDeposit(event: Deposit): void {
  let userAddress = event.params.provider;

  let id = getUserVotingEscrowId(userAddress, event.address);
  let userVoting = UserVotingEscrow.load(id);

  if (userVoting == null) {
    userVoting = new UserVotingEscrow(id);
    userVoting.userAddress = userAddress;
  }

  userVoting.unlockTime = event.params.locktime;
  userVoting.lockedBalance = scaleDownBPT(event.params.value);
  userVoting.save();
}

export function handleWithdraw(event: Withdraw): void {
  let userAddress = event.params.provider;

  let id = getUserVotingEscrowId(userAddress, event.address);
  let userVoting = UserVotingEscrow.load(id);

  if (userVoting == null) {
    userVoting = new UserVotingEscrow(id);
    userVoting.userAddress = userAddress;
  }

  userVoting.lockedBalance = ZERO_BD;
  userVoting.save();
}
