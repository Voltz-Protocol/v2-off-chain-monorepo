import { Event, BigNumber, ethers } from 'ethers';

import { parseBaseEvent } from './utils/parseBaseEvent';
import {
  CollateralConfiguredEvent,
  ProtocolEventType,
} from '@voltz-protocol/bigquery-v2';
import { getTokenDetails, convertToAddress } from '@voltz-protocol/commons-v2';

export const parseCollateralConfigured = (
  chainId: number,
  event: Event,
): CollateralConfiguredEvent => {
  // 1. Type of event
  const type = ProtocolEventType.CollateralConfigured;

  // 2. Parse particular args
  const depositingEnabled = event.args?.config.depositingEnabled as boolean;
  const tokenAddress = event.args?.config.tokenAddress as string;
  const { tokenDescaler, tokenDecimals } = getTokenDetails(tokenAddress);
  const liquidationBooster = tokenDescaler(
    event.args?.config.liquidationBooster as BigNumber,
  );
  const cap = ethers.utils.formatUnits(
    (event.args?.config.cap as BigNumber).toString(),
    tokenDecimals,
  );

  // 3. Parse base event
  const baseEvent = parseBaseEvent(chainId, event, type);

  // 4. Return particular event
  return {
    ...baseEvent,

    depositingEnabled,
    liquidationBooster,
    tokenAddress: convertToAddress(tokenAddress),
    cap,
  };
};
