import {
  fixedRateToSpacedTick,
  getLiquidityFromBase,
  getTimestampInSeconds,
  scale,
} from '@voltz-protocol/commons-v2';
import { getPoolInfo } from '../../gateway/getPoolInfo';
import { CompleteLpDetails, LpArgs } from './types';

export const parseLpArgs = async ({
  ammId,
  signer,
  notional,
  margin,
  fixedLow,
  fixedHigh,
}: LpArgs): Promise<CompleteLpDetails> => {
  if (fixedLow >= fixedHigh) {
    throw new Error(`Invalid LP range: [${fixedLow}%, ${fixedHigh}%]`);
  }

  const poolInfo = await getPoolInfo(ammId);
  const chainId = await signer.getChainId();

  // Check that signer is connected to the right network
  if (poolInfo.chainId !== chainId) {
    throw new Error('Chain ids are different for pool and signer');
  }

  // Convert fixed rates to ticks
  const tickLower = fixedRateToSpacedTick(
    fixedHigh / 100,
    poolInfo.tickSpacing,
  );
  const tickUpper = fixedRateToSpacedTick(fixedLow / 100, poolInfo.tickSpacing);

  // Decode some information from pool
  const quoteTokenDecimals = poolInfo.underlyingToken.tokenDecimals;
  const currentLiquidityIndex = poolInfo.currentLiquidityIndex;

  const maturityTimestamp = getTimestampInSeconds(
    poolInfo.termEndTimestampInMS,
  );

  // Get liquidity amount
  const base = notional / currentLiquidityIndex;
  const liquidityAmount = getLiquidityFromBase(base, tickLower, tickUpper);

  // Build parameters
  const params: CompleteLpDetails = {
    chainId,
    signer,

    poolId: poolInfo.id,

    productAddress: poolInfo.productAddress,
    marketId: poolInfo.marketId,
    maturityTimestamp,
    fee: 0, // todo: replace by pool.makerFee

    quoteTokenAddress: poolInfo.underlyingToken.address,
    quoteTokenDecimals: quoteTokenDecimals,

    accountId: undefined,
    accountMargin: 0,

    ownerAddress: await signer.getAddress(),
    tickLower,
    tickUpper,

    userNotional: notional,

    liquidityAmount: scale(quoteTokenDecimals)(liquidityAmount),

    margin: scale(quoteTokenDecimals)(margin),
    // todo: liquidator booster hard-coded
    liquidatorBooster: scale(quoteTokenDecimals)(1),
    isETH: poolInfo.underlyingToken.priceUSD > 1,
  };

  console.log('lp params:', params);

  return params;
};
