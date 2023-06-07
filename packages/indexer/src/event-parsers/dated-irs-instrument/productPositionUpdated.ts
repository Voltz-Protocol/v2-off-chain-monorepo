import { BigNumber, Event } from 'ethers';

import {
  ProtocolEventType,
  ProductPositionUpdatedEvent,
  getTokenDetails,
} from '@voltz-protocol/commons-v2';
import { parseBaseEvent } from '../utils/baseEvent';
import { getMarketQuoteToken } from '../../utils/markets/getMarketQuoteToken';

export const parseProductPositionUpdated = (
  chainId: number,
  event: Event,
): ProductPositionUpdatedEvent => {
  // 1. Type of event
  const type: ProtocolEventType = 'product-position-updated';

  // 2. Parse particular args
  const accountId = (event.args?.accountId as BigNumber).toString();
  const marketId = (event.args?.marketId as BigNumber).toString();
  const maturityTimestamp = event.args?.maturityTimestamp as number;

  const quoteToken = getMarketQuoteToken(marketId);
  const { tokenDescaler } = getTokenDetails(quoteToken);

  const baseDelta = tokenDescaler(event.args?.baseDelta as BigNumber);
  const quoteDelta = tokenDescaler(event.args?.quoteDelta as BigNumber);

  // 3. Parse base event
  const baseEvent = parseBaseEvent(chainId, event, type);

  // 4. Return particular event
  return {
    ...baseEvent,

    accountId,
    marketId,
    maturityTimestamp,
    baseDelta,
    quoteDelta,
  };
};