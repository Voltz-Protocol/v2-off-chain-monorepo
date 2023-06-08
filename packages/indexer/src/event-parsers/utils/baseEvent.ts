import { Event } from 'ethers';

import { convertLowercaseString } from '@voltz-protocol/commons-v2';
import { BaseEvent, ProtocolEventType } from '@voltz-protocol/commons-v2';

export const parseBaseEvent = (
  chainId: number,
  event: Event,
  type: ProtocolEventType,
): BaseEvent => {
  const blockTimestamp = event.args?.blockTimestamp as number;

  const id = `${chainId}_${type}_${event.blockHash}_${event.transactionHash}_${event.logIndex}`;

  return {
    id,
    type,

    chainId,
    source: convertLowercaseString(event.address),

    blockTimestamp,
    blockNumber: event.blockNumber,
    blockHash: event.blockHash,

    transactionIndex: event.transactionIndex,
    transactionHash: event.transactionHash,
    logIndex: event.logIndex,
  };
};
