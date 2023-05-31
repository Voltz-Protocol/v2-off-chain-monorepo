import { Signer } from 'ethers';

export declare enum TradeType {
  MAKER_ORDER = 0,
  TAKER_ORDER = 1,
  SETTLE = 2,
}

export type BaseTrade = {
  owner: Signer;
  productAddress: string;
  maturityTimestamp: number;
  marketId: string;
  quoteTokenAddress: string;
  accountId?: string;
};

export type TakerTrade = BaseTrade & TakerParams;

type TakerParams = {
  marginAmount: number;
  baseAmount: number;
};

type MakerParams = TakerParams & {
  fixedRateLower: number;
  fixedRateUpper: number;
};

export type MakerTrade = BaseTrade & MakerParams;

export type SettleTradeMaker = BaseTrade & {
  newTrade?: MakerTrade;
};

export type SettleTradeTaker = BaseTrade & {
  newTrade?: TakerTrade;
};

// ENCODED ACTIONS

export type MethodParameters = {
  /**
   * The hex encoded calldata to perform the given operation
   */
  calldata: string;
  /**
   * The amount of ether (wei) to send in hex.
   */
  value: string;
};

export type SingleAction = {
  command: string;
  input: string;
};

export class MultiAction {
  public commands: string;
  public inputs: string[];

  constructor() {
    this.commands = '0x';
    this.inputs = [];
  }

  public newAction(singleAction: SingleAction): void {
    this.commands = this.commands.concat(singleAction.command);
    this.inputs.push(singleAction.input);
  }
}