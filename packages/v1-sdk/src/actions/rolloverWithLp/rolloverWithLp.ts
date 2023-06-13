import {
  BigNumber,
  ContractReceipt,
  ContractTransaction,
  ethers,
} from 'ethers';
import {
  RolloverAndLpArgs,
  RolloverAndLpPeripheryParams,
} from '../types/actionArgTypes';
import { handleLpErrors } from '../lp/handleLpErrors';
import { getPeripheryContract } from '../../common/contract-generators';
import { getRolloverWithLpPeripheryParams } from './getRolloverWithLpPeripheryParams';
import { getGasBuffer } from '../../common/gas/getGasBuffer';
import { estimateRolloverWithLpGasUnits } from './estimateRolloverWithLpGasUnits';
import {
  decodePositionId,
  DecodedPosition,
} from '../../common/api/position/decodePositionId';
import {
  DEFAULT_TICK_SPACING,
  PERIPHERY_ADDRESS_BY_CHAIN_ID,
} from '../../common/constants';
import { AMMInfo } from '../../common/api/amm/types';
import { getAmmInfo } from '../../common/api/amm/getAmmInfo';
import { getPositionInfo } from '../../common/api/position/getPositionInfo';
import { PositionInfo } from '../../common/api/position/types';

export const rolloverAndLp = async ({
  maturedPositionId,
  ammId,
  fixedLow,
  fixedHigh,
  notional,
  margin,
  signer,
}: RolloverAndLpArgs): Promise<ContractReceipt> => {
  handleLpErrors({
    notional,
    fixedLow,
    fixedHigh,
  });

  const decodedMaturedPosition: DecodedPosition = decodePositionId(
    maturedPositionId,
  );

  const chainId = decodedMaturedPosition.chainId;
  const ammInfo: AMMInfo = await getAmmInfo(ammId, chainId);
  const maturedPositionInfo: PositionInfo = await getPositionInfo(
    maturedPositionId,
  );

  const peripheryAddress = PERIPHERY_ADDRESS_BY_CHAIN_ID[chainId];

  const peripheryContract: ethers.Contract = getPeripheryContract(
    peripheryAddress,
    signer,
  );

  const rolloverAndLpPeripheryTempOverrides: {
    value?: BigNumber;
    gasLimit?: BigNumber;
  } = {};

  // todo: make sure below logic is correct
  const maturedPositionSettlementBalance: number =
    maturedPositionInfo.margin + maturedPositionInfo.realizedPNLTotal;

  let marginDelta = margin;
  if (ammInfo.isEth && maturedPositionSettlementBalance < margin) {
    marginDelta = maturedPositionSettlementBalance;
    rolloverAndLpPeripheryTempOverrides.value = BigNumber.from(
      margin - maturedPositionSettlementBalance,
    );
  }

  const tickSpacing: number = DEFAULT_TICK_SPACING;

  const rolloverAndLpPeripheryParams: RolloverAndLpPeripheryParams = getRolloverWithLpPeripheryParams(
    {
      margin: marginDelta,
      notional,
      fixedLow,
      fixedHigh,
      marginEngineAddress: ammInfo.marginEngineAddress,
      tickSpacing,
      maturedPositionInfo,
    },
  );

  const estimatedGasUnits: BigNumber = await estimateRolloverWithLpGasUnits(
    peripheryContract,
    rolloverAndLpPeripheryParams,
    rolloverAndLpPeripheryTempOverrides,
  );

  rolloverAndLpPeripheryTempOverrides.gasLimit = getGasBuffer(
    estimatedGasUnits,
  );

  const rolloverAndLpTransaction: ContractTransaction = await peripheryContract
    .connect(signer)
    .rolloverAndLp(
      rolloverAndLpPeripheryParams,
      rolloverAndLpPeripheryTempOverrides,
    )
    .catch(() => {
      throw new Error('RolloverAndLp Transaction Confirmation Error');
    });

  const receipt: ContractReceipt = await rolloverAndLpTransaction.wait();

  return receipt;
};
