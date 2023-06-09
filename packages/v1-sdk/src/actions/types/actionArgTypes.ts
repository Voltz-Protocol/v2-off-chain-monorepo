import { BigNumberish, providers, Signer } from 'ethers';

export type SwapArgs = {
  ammId: string;
  notional: number;
  margin: number;
  fixedRateLimit?: number;
  signer: Signer;
};

export type EditSwapArgs = {
  positionId: string;
  notional: number;
  margin: number;
  fixedRateLimit?: number;
  signer: Signer;
};

export type GetPoolSwapInfoArgs = {
  ammId: string;
  provider: providers.Provider;
};

export type SwapPeripheryParams = {
  marginEngineAddress: string;
  isFT: boolean;
  notional: BigNumberish;
  sqrtPriceLimitX96: BigNumberish;
  tickLower: BigNumberish;
  tickUpper: BigNumberish;
  marginDelta: BigNumberish;
};

// rolloverWithSwap

export type RolloverWithSwapArgs = {
  maturedPositionId: string;
  ammId: string;
  notional: number;
  margin: number;
  fixedRateLimit?: number;
  signer: Signer;
};

export type RolloverWithSwapPeripheryParams = {
  maturedMarginEngineAddress: string;
  maturedPositionOwnerAddress: string;
  maturedPositionTickLower: BigNumberish;
  maturedPositionTickUpper: BigNumberish;
  newSwapPeripheryParams: SwapPeripheryParams;
};

// rolloverWithLp

export type RolloverWithLpArgs = {
  maturedPositionId: string;
  ammId: string;
  fixedLow: number;
  fixedHigh: number;
  notional: number;
  margin: number;
  signer: Signer;
};

export type RolloverWithLpPeripheryParams = {
  maturedMarginEngineAddress: string;
  maturedPositionOwnerAddress: string;
  maturedPositionTickLower: BigNumberish;
  maturedPositionTickUpper: BigNumberish;
  newLpPeripheryParams: LpPeripheryParams;
};

// lp

export type LpArgs = {
  ammId: string;
  fixedLow: number;
  fixedHigh: number;
  notional: number;
  margin: number;
  signer: Signer;
};

export type EditLpArgs = {
  positionId: string;
  notional: number;
  margin: number;
  signer: Signer;
};

export type LpPeripheryParams = {
  marginEngineAddress: string;
  tickLower: BigNumberish;
  tickUpper: BigNumberish;
  notional: BigNumberish;
  isMint: boolean;
  marginDelta: BigNumberish;
};

export type GetPoolLpInfoArgs = {
  ammId: string;
  fixedHigh: number;
  fixedLow: number;
  provider: providers.Provider;
};

// settle

export type SettleArgs = {
  positionId: string;
  signer: Signer;
};

export type SettlePeripheryParams = {
  marginEngineAddress: string;
  positionOwnerAddress: string;
  tickLower: BigNumberish;
  tickUpper: BigNumberish;
};

// updateMargin

export type UpdateMarginArgs = {
  positionId: string;
  margin: number;
  signer: Signer;
};

export type UpdateMarginPeripheryParams = {
  marginEngineAddress: string;
  tickLower: BigNumberish;
  tickUpper: BigNumberish;
  marginDelta: BigNumberish;
  fullyWithdraw: boolean;
};

// token

export type ApprovePeripheryArgs = {
  ammId: string;
  signer: Signer;
};

export type GetAllowanceToPeripheryArgs = {
  ammId: string;
  signer: Signer;
};

export type GetBalanceArgs = {
  ammId: string;
  signer: Signer;
};
