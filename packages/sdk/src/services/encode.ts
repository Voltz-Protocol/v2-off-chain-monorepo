import { abi } from '../abis/ExecutionModule.json';
import { TickMath } from '@uniswap/v3-sdk';
import { BigNumber, ethers } from 'ethers';
import { closestTickAndFixedRate } from '../utils/math/tickHelpers';
import { CommandType, getCommand } from '../utils/routerCommands';
import { MethodParameters, MultiAction } from '../utils/types';
import { MINUS_ONE_BN, ZERO_BN } from '../utils/constants';

////////////////////  ENCODE SINGLE  ////////////////////

export function encodeSingleSettle(
  accountId: string,
  marketId: string,
  maturityTimestamp: number,
  multiAction: MultiAction,
) {
  multiAction.newAction(
    getCommand(CommandType.V2_DATED_IRS_INSTRUMENT_SETTLE, [
      accountId,
      marketId,
      maturityTimestamp,
    ]),
  );
}

export const encodeSingleSwap = (
  accountId: string,
  marketId: string,
  maturityTimestamp: number,
  baseAmount: BigNumber,
  priceLimit: BigNumber,
  multiAction: MultiAction,
) => {
  multiAction.newAction(
    getCommand(CommandType.V2_DATED_IRS_INSTRUMENT_SWAP, [
      accountId,
      marketId,
      maturityTimestamp,
      baseAmount,
      priceLimit,
    ]),
  );
};

export const encodeSingleMakerOrder = (
  accountId: string,
  marketId: string,
  maturityTimestamp: number,
  fixedRateLower: number,
  fixedRateUpper: number,
  liquidityDelta: BigNumber,
  multiAction: MultiAction,
) => {
  const { closestUsableTick: tickUpper } =
    closestTickAndFixedRate(fixedRateLower);
  const sqrtPriceLowerX96 = TickMath.getSqrtRatioAtTick(tickUpper).toString();

  const { closestUsableTick: tickLower } =
    closestTickAndFixedRate(fixedRateUpper);
  const sqrtPriceUpperX96 = TickMath.getSqrtRatioAtTick(tickLower).toString();

  multiAction.newAction(
    getCommand(CommandType.V2_VAMM_EXCHANGE_LP, [
      accountId,
      marketId,
      maturityTimestamp,
      sqrtPriceLowerX96,
      sqrtPriceUpperX96,
      liquidityDelta,
    ]),
  );
};

export const encodeSingleCreateAccount = (
  accountId: string,
  multiAction: MultiAction,
): void => {
  multiAction.newAction(
    getCommand(CommandType.V2_CORE_CREATE_ACCOUNT, [accountId]),
  );
};

export const encodeSingleWithdraw = (
  accountId: string,
  quoteTokenAddress: string,
  marginAmount: BigNumber,
  multiAction: MultiAction,
) => {
  multiAction.newAction(
    getCommand(CommandType.V2_CORE_WITHDRAW, [
      accountId,
      quoteTokenAddress,
      marginAmount,
    ]),
  );
};

export const encodeSingleDepositERC20 = (
  accountId: string,
  quoteTokenAddress: string,
  marginAmount: BigNumber,
  multiAction: MultiAction,
) => {
  multiAction.newAction(
    getCommand(CommandType.V2_CORE_DEPOSIT, [
      accountId,
      quoteTokenAddress,
      marginAmount,
    ]),
  );
};

export const encodeSingleWrapETH = (
  marginAmount: BigNumber,
  multiAction: MultiAction,
) => {
  multiAction.newAction(getCommand(CommandType.WRAP_ETH, [marginAmount]));
};

export const encodeSingleDepositETH = (
  accountId: string,
  quoteTokenAddress: string,
  multiAction: MultiAction,
) => {
  multiAction.newAction(
    getCommand(CommandType.V2_CORE_DEPOSIT, [
      accountId,
      quoteTokenAddress,
      '0',
    ]),
  );
};

// encodes commands & inpus into calldata based on Router Interface
// consideres tx value (ETH)
export const encodeRouterCall = (
  multiAction: MultiAction,
  nativeCurrencyValue: BigNumber,
): MethodParameters => {
  const functionSignature = 'execute(bytes,bytes[])';
  const parameters = [multiAction.commands, multiAction.inputs];
  const INTERFACE = new ethers.utils.Interface(abi);
  const calldata = INTERFACE.encodeFunctionData(functionSignature, parameters);
  return { calldata: calldata, value: nativeCurrencyValue.toHexString() };
};

export const encodeDeposit = (
  accountId: string,
  quoteTokenAddress: string,
  isETH: boolean,
  marginAmount: BigNumber,
  multiAction: MultiAction,
): BigNumber => {
  let ethAmount = ZERO_BN;

  if (marginAmount.gt(ZERO_BN)) {
    // deposit
    if (isETH) {
      encodeSingleWrapETH(marginAmount, multiAction);
      encodeSingleDepositETH(accountId, quoteTokenAddress, multiAction);
      ethAmount = marginAmount;
    } else {
      encodeSingleDepositERC20(
        accountId,
        quoteTokenAddress,
        marginAmount,
        multiAction,
      );
    }
  } else if (marginAmount.lt(ZERO_BN)) {
    if (accountId === undefined) {
      throw new Error('Withdraw: missing accountId');
    }
    // withdraw
    encodeSingleWithdraw(
      accountId,
      quoteTokenAddress,
      marginAmount.mul(MINUS_ONE_BN),
      multiAction,
    );
  }

  return ethAmount;
};
