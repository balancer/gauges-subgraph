import { UpdateLiquidityLimit } from './types/templates/Gauge/LiquidityGauge';
import { getGauge } from './utils/gauge';
import { scaleDownBPT } from './utils/maths';

export function handleUpdateLiquidityLimit(event: UpdateLiquidityLimit): void {
  let gauge = getGauge(event.address);

  gauge.totalSupply = scaleDownBPT(event.params.original_supply);
  gauge.workingSupply = scaleDownBPT(event.params.working_supply);
  gauge.save();
}
