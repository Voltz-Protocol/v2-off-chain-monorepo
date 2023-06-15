import { SupportedChainId } from '@voltz-protocol/commons-v2';
import { V1Pool } from './types';
import { pullAllChainPools } from '@voltz-protocol/indexer-v1';
import { buildV1Pool } from './buildV1Pool';

export const getV1Pools = async (
  chainIds: SupportedChainId[],
): Promise<V1Pool[]> => {
  const rawPools = await pullAllChainPools(chainIds);
  const promises = rawPools.map(buildV1Pool);
  const responses = await Promise.allSettled(promises);

  const pools = responses.map((r) => {
    if (r.status === 'rejected') {
      throw r.reason;
    }
    return r.value;
  });

  return pools;
};