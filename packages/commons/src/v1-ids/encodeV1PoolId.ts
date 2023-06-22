import { V1PoolIdData } from './types';

export const encodeV1PoolId = ({
  chainId,
  vammAddress,
}: V1PoolIdData): string => {
  const poolId = `${chainId}_${vammAddress.toLowerCase()}_v1`;

  return poolId;
};
