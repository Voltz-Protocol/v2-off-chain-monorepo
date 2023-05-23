import { Address } from '../utils/types';

export type EventType =
  | 'account-created'
  | 'account-owner-update'
  | 'collateral-configured'
  | 'collateral-deposited'
  | 'collateral-update'
  | 'collateral-withdrawn'
  | 'liquidation'
  | 'liquidator-booster-update'
  | 'market-fee-configured'
  | 'product-registered'
  | 'maker-order'
  | 'taker-order';

export type BaseEvent = {
  id: string;
  type: EventType;

  chainId: number;
  source: Address;

  blockTimestamp: number;
  blockNumber: number;
  blockHash: string;

  transactionIndex: number;
  transactionHash: string;
  logIndex: number;
};

// Core

// state-capturing event
export type AccountCreatedEvent = BaseEvent & {
  accountId: string; // big number
  owner: Address;
};

// state-capturing event
export type AccountOwnerUpdateEvent = BaseEvent & {
  accountId: string; // big number
  newOwner: Address;
};

// state-capturing event
export type CollateralConfiguredEvent = BaseEvent & {
  depositingEnabled: boolean;
  liquidationBooster: number;
  tokenAddress: Address;
  cap: string; // big number (Cap might be set to max uint256 and does not fit to number)
};

type CollateralEvent = BaseEvent & {
  accountId: string; // big number
  collateralType: Address;
  tokenAmount: number;
};

// action-tracking event
export type CollateralDepositedEvent = CollateralEvent;

// action-tracking event
export type CollateralUpdateEvent = CollateralEvent;

// action-tracking event
export type CollateralWithdrawnEvent = CollateralEvent;

// action-tracking event
export type LiquidatorBoosterUpdateEvent = CollateralEvent;

// action-tracking event
export type LiquidationEvent = BaseEvent & {
  liquidatedAccountId: string; // big number
  collateralType: Address;
  sender: Address;
  liquidatorAccountId: string; // big number
  liquidatorRewardAmount: number;
  imPreClose: number;
  imPostClose: number;
};

// state-capturing event
export type MarketFeeConfiguredEvent = BaseEvent & {
  productId: string; // big number
  marketId: string; // big number
  feeCollectorAccountId: string; // big number
  atomicMakerFee: number;
  atomicTakerFee: number;
};

// state-capturing event
export type ProductRegisteredEvent = BaseEvent & {
  product: Address;
  productId: string; // big number
  name: string;
  sender: Address;
};

// Product

export type TakerOrderEvent = BaseEvent & {
  accountId: string; // big number

  marketId: string; // big number
  maturityTimestamp: number;
  quoteToken: Address;

  executedBaseAmount: number;
  executedQuoteAmount: number;

  annualizedBaseAmount: number;
};

export type MakerOrderEvent = BaseEvent & {
  accountId: string; // big number

  marketId: string; // big number
  maturityTimestamp: number;
  quoteToken: Address;

  tickLower: number;
  tickUpper: number;
  executedBaseAmount: number;
};