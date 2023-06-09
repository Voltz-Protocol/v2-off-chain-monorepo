import {
  BigNumber,
  ContractReceipt,
  ContractTransaction,
  ethers,
} from 'ethers';
import { SettleArgs, SettlePeripheryParams } from '../types/actionArgTypes';
import { getPeripheryContract } from '../../common/contract-generators';
import { getGasBuffer } from '../../common/gas/getGasBuffer';
import { estimateSettleGasUnits } from './estimateSettleGasUnits';
import { PERIPHERY_ADDRESS_BY_CHAIN_ID } from '../../common/constants';
import { PositionInfo } from '../../common/api/position/types';
import { getPositionInfo } from '../../common/api/position/getPositionInfo';
import { getSentryTracker } from '../../init';
import { getReadableErrorMessage } from '../../common/errors/errorHandling';

export const settle = async ({
  positionId,
  signer,
}: SettleArgs): Promise<ContractReceipt> => {
  if (signer.provider === undefined) {
    throw new Error('Signer Provider Undefined');
  }

  const positionInfo: PositionInfo = await getPositionInfo(positionId);

  // todo: use decode of id
  const chainId: number = await signer.getChainId();

  const peripheryAddress: string = PERIPHERY_ADDRESS_BY_CHAIN_ID[chainId];

  // todo: use decode of id
  const positionOwnerAddress: string = await signer.getAddress();

  const peripheryContract: ethers.Contract = getPeripheryContract(
    peripheryAddress,
    signer,
  );

  const settlePeripheryParams: SettlePeripheryParams = {
    marginEngineAddress: positionInfo.ammMarginEngineAddress,
    positionOwnerAddress: positionOwnerAddress,
    tickLower: positionInfo.positionTickLower,
    tickUpper: positionInfo.positionTickUpper,
  };

  await peripheryContract.callStatic
    .settlePositionAndWithdrawMargin(
      settlePeripheryParams.marginEngineAddress,
      settlePeripheryParams.positionOwnerAddress,
      settlePeripheryParams.tickLower,
      settlePeripheryParams.tickUpper,
    )
    .catch((error) => {
      const errorMessage = getReadableErrorMessage(error);
      console.log(errorMessage);
      // throw new Error(errorMessage);
    });

  const settlePeripheryTempOverrides: {
    value?: BigNumber;
    gasLimit?: BigNumber;
  } = {};

  const estimatedGasUnits: BigNumber = await estimateSettleGasUnits(
    peripheryContract,
    settlePeripheryParams,
  );

  settlePeripheryTempOverrides.gasLimit = getGasBuffer(estimatedGasUnits);

  const settleTransaction: ContractTransaction = await peripheryContract
    .connect(signer)
    .settlePositionAndWithdrawMargin(
      settlePeripheryParams.marginEngineAddress,
      settlePeripheryParams.positionOwnerAddress,
      settlePeripheryParams.tickLower,
      settlePeripheryParams.tickUpper,
      settlePeripheryTempOverrides,
    )
    .catch((error: any) => {
      const sentryTracker = getSentryTracker();
      sentryTracker.captureException(error);
      sentryTracker.captureMessage('Transaction Confirmation Error');
      throw new Error('Transaction Confirmation Error');
    });

  try {
    const receipt: ContractReceipt = await settleTransaction.wait();
    return receipt;
  } catch (error) {
    const sentryTracker = getSentryTracker();
    sentryTracker.captureException(error);
    sentryTracker.captureMessage('Transaction Confirmation Error');
    throw new Error('Transaction Confirmation Error');
  }
};
