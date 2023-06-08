import { TableField } from '@google-cloud/bigquery';
import { TableType } from '../../types';
import { liquidityIndicesTableSchema } from './liquidityIndicesTableSchema';
import { rawCollateralUpdateTableSchema } from './rawCollateralUpdateTableSchema';
import { rawMarketConfiguredTableSchema } from './rawMarketConfiguredTableSchema';
import { rawMarketFeeConfiguredTableSchema } from './rawMarketFeeConfiguredTableSchema';
import { rawRateOracleConfiguredTableSchema } from './rawRateOracleConfiguredTableSchema';
import { marketsTableSchema } from './marketsTableSchema';
import { rawVammCreatedTableSchema } from './rawVammCreatedTableSchema';
import { rawVammPriceChangeTableSchema } from './rawVammPriceChangeTableSchema';
import { rawProductPositionUpdatedTableSchema } from './rawProductPositionUpdatedTableSchema';
import { positionsTableSchema } from './positionsTableSchema';

export const getTableSchema = (tableType: TableType): TableField[] => {
  switch (tableType) {
    case TableType.raw_collateral_updates: {
      return rawCollateralUpdateTableSchema;
    }

    case TableType.raw_market_configured: {
      return rawMarketConfiguredTableSchema;
    }

    case TableType.raw_market_fee_configured: {
      return rawMarketFeeConfiguredTableSchema;
    }

    case TableType.raw_rate_oracle_configured: {
      return rawRateOracleConfiguredTableSchema;
    }

    case TableType.raw_product_position_updated: {
      return rawProductPositionUpdatedTableSchema;
    }

    case TableType.raw_vamm_created: {
      return rawVammCreatedTableSchema;
    }

    case TableType.raw_vamm_price_change: {
      return rawVammPriceChangeTableSchema;
    }

    case TableType.markets: {
      return marketsTableSchema;
    }

    case TableType.positions: {
      return positionsTableSchema;
    }

    case TableType.liquidity_indices: {
      return liquidityIndicesTableSchema;
    }
  }
};