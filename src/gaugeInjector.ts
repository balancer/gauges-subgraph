import { EmissionsInjection } from './types/templates/GaugeInjector/GaugeInjector';
import { setRewardData } from './utils/gauge';

export function handleEmissionsInjection(event: EmissionsInjection): void {
  setRewardData(event.params.gauge, event.params.token);
}
