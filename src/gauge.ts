import { UpdateLiquidityLimit } from './types/templates/Gauge/LiquidityGauge';
import { getGauge, getUserGaugeDeposit } from './utils/gauge';
import { scaleDownBPT } from './utils/maths';

export function handleUpdateLiquidityLimit(event: UpdateLiquidityLimit): void {
  let gauge = getGauge(event.address);
  gauge.totalSupply = scaleDownBPT(event.params.original_supply);
  gauge.workingSupply = scaleDownBPT(event.params.working_supply);
  gauge.save();

  let userDeposit = getUserGaugeDeposit(event.params.user, event.address);
  userDeposit.balance = scaleDownBPT(event.params.original_balance);
  userDeposit.workingBalance = scaleDownBPT(event.params.working_balance);
  userDeposit.save();
}
