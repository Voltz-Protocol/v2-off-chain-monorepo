import {
  VammPriceChangeEvent,
  pullVammPriceChangeEvent,
  insertVammPriceChangeEvent,
  getCurrentVammTick,
  pullLpPositionEntries,
  updatePositionEntry,
  pullMarketEntry,
  getLiquidityIndexAt,
  sendUpdateBatches,
} from '@voltz-protocol/bigquery-v2';
import {
  isNull,
  extendBalancesWithTrade,
  computePassiveDeltas,
  SECONDS_IN_YEAR,
} from '@voltz-protocol/commons-v2';
import { log } from '../logging/log';
import { getEnvironmentV2 } from '../services/envVars';

export const handleVammPriceChange = async (event: VammPriceChangeEvent) => {
  const environmentTag = getEnvironmentV2();

  const existingEvent = await pullVammPriceChangeEvent(
    environmentTag,
    event.id,
  );

  if (existingEvent) {
    return;
  }

  const {
    chainId,
    marketId,
    maturityTimestamp,
    blockTimestamp,
    tick: currentTick,
  } = event;

  const latestTick = await getCurrentVammTick(
    environmentTag,
    chainId,
    marketId,
    maturityTimestamp,
  );

  if (isNull(latestTick)) {
    throw new Error(
      `Latest tick not found for ${chainId} - ${marketId} - ${maturityTimestamp}`,
    );
  }

  {
    const updateBatch = insertVammPriceChangeEvent(environmentTag, event);
    await sendUpdateBatches([updateBatch]);
  }

  const market = await pullMarketEntry(environmentTag, chainId, marketId);

  if (!market) {
    throw new Error(`Couldn't find market for ${chainId}-${marketId}`);
  }

  const liquidityIndex = await getLiquidityIndexAt(
    environmentTag,
    chainId,
    market.oracleAddress,
    blockTimestamp,
  );

  if (!liquidityIndex) {
    throw new Error(
      `Couldn't find liquidity index at ${blockTimestamp} for ${chainId}-${market.oracleAddress}`,
    );
  }

  // todo: improve this naive approach
  const lpPositions = await pullLpPositionEntries(
    environmentTag,
    chainId,
    marketId,
    maturityTimestamp,
  );

  for (const lp of lpPositions) {
    const { baseDelta, quoteDelta: tracker } = computePassiveDeltas({
      liquidity: lp.liquidity,
      tickMove: {
        from: latestTick as number,
        to: currentTick,
      },
      tickRange: {
        lower: lp.tickLower,
        upper: lp.tickUpper,
      },
    });

    if (baseDelta === 0) {
      log(`Change of 0 base skipped...`);
      return;
    }

    const avgFixedRate = Math.abs(tracker / baseDelta);
    const quoteDelta =
      -baseDelta *
      liquidityIndex *
      (1 +
        (avgFixedRate * (maturityTimestamp - blockTimestamp)) /
          SECONDS_IN_YEAR);

    const netBalances = extendBalancesWithTrade({
      tradeTimestamp: blockTimestamp,
      maturityTimestamp: maturityTimestamp,
      baseDelta,
      quoteDelta,
      tradeLiquidityIndex: liquidityIndex,
      existingPosition: lp,
    });

    {
      const updateBatch = updatePositionEntry(environmentTag, lp, netBalances);
      await sendUpdateBatches([updateBatch]);
    }
  }
};
