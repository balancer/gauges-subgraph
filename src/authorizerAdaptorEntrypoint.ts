import { Bytes, dataSource, ethereum } from "@graphprotocol/graph-ts";
import { ActionPerformed } from "./types/AuthorizerAdaptorEntrypoint/authorizerAdaptorEntrypoint";
import { bytesToAddress } from "./utils/misc";
import { getRewardToken } from "./utils/gauge";
import { ChildChainRewardToken } from "./types/templates";

function handleAddRewardToken(event: ActionPerformed): void {
  const gaugeAddress = event.params.target;
  const callData = event.params.data;
  // parse callData, which is a 32-byte token address followed by a 32-byte distributor address
  let token = Bytes.fromUint8Array(callData.subarray(0, 32));
  let tokenAddress = bytesToAddress(token);
  // create the reward token entity if it doesn't exist
  getRewardToken(tokenAddress, gaugeAddress);
  // create the ChildChainRewardToken datasource if we're not on mainnet
  // TODO: improve logic to remove the need to create this datasource
  if (dataSource.network() != "mainnet") {
    ChildChainRewardToken.create(tokenAddress);
  }
}

export function handleActionPerformed(event: ActionPerformed): void {
  const selector = event.params.selector.toHexString();
  if (selector == "0xe8de0d4d") { // add_reward(_reward_token (address), _distributor (address))
    handleAddRewardToken(event);
  }
}