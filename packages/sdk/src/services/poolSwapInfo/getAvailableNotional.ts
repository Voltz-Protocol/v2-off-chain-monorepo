import { decodeSwapOutput } from '../swap';
import { MINUS_ONE_BN, VERY_BIG_NUMBER, ZERO_BN } from '../../utils/constants';
import { simulateTx } from '../executeTransaction';
import { baseAmountToNotionalBN } from '../../utils/helpers';
import { encodeSwap } from '../swap/encode';
import { descale } from '@voltz-protocol/commons-v2';
import { GetAvailableNotionalArgs } from './types';

export const getAvailableNotional = async ({
  isFT,
  chainId,
  tokenDecimals,
  params,
}: GetAvailableNotionalArgs): Promise<number> => {
  const { calldata: data, value } = await encodeSwap({
    ...params,
    fixedRateLimit: ZERO_BN,
    baseAmount: isFT ? VERY_BIG_NUMBER : VERY_BIG_NUMBER.mul(MINUS_ONE_BN),
  });

  const bytesOutput = (await simulateTx(params.owner, data, value, chainId))
    .bytesOutput;

  const executedBaseAmount = decodeSwapOutput(bytesOutput).executedBaseAmount;

  const availableNotionalRaw = baseAmountToNotionalBN(
    executedBaseAmount,
    params.currentLiquidityIndex,
  );

  return descale(tokenDecimals)(availableNotionalRaw.abs());
};