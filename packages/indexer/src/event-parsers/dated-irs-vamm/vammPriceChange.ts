import { Event, BigNumber } from 'ethers';

import { VammPriceChangeEvent } from '@voltz-protocol/commons-v2';
import { parseBaseEvent } from '../utils/baseEvent';

export const parseVammPriceChange = (
  chainId: number,
  event: Event,
): VammPriceChangeEvent => {
  // 1. Type of event
  const type = 'vamm-price-change';

  // 2. Parse particular args
  const marketId = (event.args?.marketId as BigNumber).toString();
  const tick = event.args?.tick as number;
  const maturityTimestamp = event.args?.maturityTimestamp as number;

  // 3. Parse base event
  const baseEvent = parseBaseEvent(chainId, event, type);

  // 4. Return particular event
  return {
    ...baseEvent,

    marketId,
    maturityTimestamp,
    tick,
  };
};