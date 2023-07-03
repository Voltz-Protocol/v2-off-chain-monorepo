import { V1Pool, V1V2Pool } from '@voltz-protocol/api-v2-types';

export const extendV1Pool = (p: V1Pool): V1V2Pool => ({
  ...p,

  marketId: '',

  currentTick: 0,
  currentFixedRate: 0,
  fixedRateChange: 0,

  currentLiquidityIndex: 0,
  currentVariableRate: 0,
  variableRateChange: 0,
  rateChangeLookbackWindowMS: 0,

  availableNotional: {
    short: 0,
    long: 0,
  },

  coreAddress: '',
  productAddress: '',
  exchangeAddress: '',
});
