import { Bytes } from "@graphprotocol/graph-ts";
import { ActionPerformed } from "./types/AuthorizerAdaptorEntrypoint/authorizerAdaptorEntrypoint";
import { bytesToAddress } from "./utils/misc";
import { setChildChainGaugeRewardData } from "./utils/gauge";
import { LiquidityGauge } from "./types/schema";

function handleAddRewardToken(event: ActionPerformed): void {
  const gaugeAddress = event.params.target;
  const callData = event.params.data;
  // parse callData, which is a 32-byte token address followed by a 32-byte distributor address
  let token = Bytes.fromUint8Array(callData.subarray(0, 32));
  let tokenAddress = bytesToAddress(token);

  let gauge = LiquidityGauge.load(gaugeAddress.toHexString());
  if (!gauge) return;

  let rewardTokens = new Array<Bytes>(1);
  rewardTokens[0] = tokenAddress;

  if (gauge.rewardTokensList == null) {
    gauge.rewardTokensList = rewardTokens;
  } else {
    gauge.rewardTokensList = gauge.rewardTokensList.concat(rewardTokens);
  }

  gauge.save();

  setChildChainGaugeRewardData(gaugeAddress, tokenAddress);
}

export function handleActionPerformed(event: ActionPerformed): void {
  const selector = event.params.selector.toHexString();
  if (selector == "0xe8de0d4d") { // add_reward(_reward_token (address), _distributor (address))
    handleAddRewardToken(event);
  }
}
