import {
  CollateralUpdateEvent,
  VammCreatedEvent,
} from '../../../event-parsers/types';
import { bqNumericToNumber } from '../utils/converters';

export const mapToCollateralUpdateEvent = (
  row: any,
): CollateralUpdateEvent => ({
  id: row.id,
  type: row.type,

  chainId: row.chainId,
  source: row.source,

  blockTimestamp: row.blockTimestamp,
  blockNumber: row.blockNumber,
  blockHash: row.blockHash,

  transactionIndex: row.transactionIndex,
  transactionHash: row.transactionHash,
  logIndex: row.logIndex,

  accountId: row.accountId,
  collateralType: row.collateralType,
  collateralAmount: bqNumericToNumber(row.collateralAmount),
  liquidatorBoosterAmount: bqNumericToNumber(row.liquidatorBoosterAmount),
});

export const mapToVammCreatedEvent = (row: any): VammCreatedEvent => ({
  id: row.id,
  type: row.type,

  chainId: row.chainId,
  source: row.source,

  blockTimestamp: row.blockTimestamp,
  blockNumber: row.blockNumber,
  blockHash: row.blockHash,

  transactionIndex: row.transactionIndex,
  transactionHash: row.transactionHash,
  logIndex: row.logIndex,

  marketId: row._marketId,

  priceImpactPhi: row._mutableConfig.priceImpactPhi,
  priceImpactBeta: row._mutableConfig.priceImpactBeta,
  spread: row._mutableConfig.spread,
  rateOracle: row._mutableConfig.rateOracle,

  maxLiquidityPerTick: row._config._maxLiquidityPerTick,
  tickSpacing: row._config._tickSpacing,
  maturityTimestamp: row._config.maturityTimestamp,
});
