import { getLiquidityIndexAt } from '@voltz-protocol/bigquery-v2';
import {
  Address,
  fetchMultiplePromises,
  getApy,
  getTimestampInSeconds,
  isNull,
} from '@voltz-protocol/commons-v2';
import { getEnvironmentV2 } from '../../services/envVars';

export type GetVariableRateDataResponse = {
  currentVariableRate: number;
  currentLiquidityIndex: number;
  variableRateChange: number;
};

export const getVariableRateData = async (
  chainId: number,
  rateOracle: Address,
  lookbackWindowSeconds: number,
  method: 'linear' | 'compounding' = 'compounding',
): Promise<GetVariableRateDataResponse> => {
  const nowSeconds = getTimestampInSeconds();
  const timestampLWAgo = nowSeconds - lookbackWindowSeconds;
  const timestamp2LWAgo = nowSeconds - 2 * lookbackWindowSeconds;

  const environmentTag = getEnvironmentV2();

  const retrieveDataAt = async (ts: number) =>
    getLiquidityIndexAt(environmentTag, chainId, rateOracle, ts);

  const { data, isError } = await fetchMultiplePromises([
    retrieveDataAt(nowSeconds),
    retrieveDataAt(timestampLWAgo),
    retrieveDataAt(timestamp2LWAgo),
  ]);

  if (isError) {
    // add logging

    return {
      currentLiquidityIndex: 1,
      currentVariableRate: 0,
      variableRateChange: 0,
    };
  }

  const [currentLiquidityIndex, liquidityIndexLWAgo, liquidityIndex2LWAgo] =
    data;

  if (isNull(currentLiquidityIndex)) {
    return {
      currentLiquidityIndex: 0,
      currentVariableRate: 0,
      variableRateChange: 0,
    };
  }

  if (isNull(liquidityIndexLWAgo)) {
    return {
      currentLiquidityIndex: currentLiquidityIndex as number,
      currentVariableRate: 0,
      variableRateChange: 0,
    };
  }

  const currentVariableRate = getApy(
    {
      timestamp: timestampLWAgo,
      index: liquidityIndexLWAgo as number,
    },
    {
      timestamp: nowSeconds,
      index: currentLiquidityIndex as number,
    },
    method,
  );

  if (isNull(liquidityIndex2LWAgo)) {
    return {
      currentLiquidityIndex: currentLiquidityIndex as number,
      currentVariableRate,
      variableRateChange: 0,
    };
  }

  const variableRateLWAgo = getApy(
    {
      timestamp: timestamp2LWAgo,
      index: liquidityIndex2LWAgo as number,
    },
    {
      timestamp: timestampLWAgo,
      index: liquidityIndexLWAgo as number,
    },
    method,
  );

  const variableRateChange = currentVariableRate - variableRateLWAgo;

  return {
    currentLiquidityIndex: currentLiquidityIndex as number,
    currentVariableRate,
    variableRateChange,
  };
};
