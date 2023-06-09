import md5 from 'crypto-js/md5';
import { BigNumber } from 'ethers';

type CreateAccountParams = {
  ownerAddress: string;
  productAddress: string;
  marketId: string;
  maturityTimestamp: number;
  isLp: boolean;
  tickLower?: number;
  tickUpper?: number;
};

export function createAccountId({
  ownerAddress,
  productAddress,
  marketId,
  maturityTimestamp,
  isLp,
  tickLower,
  tickUpper,
}: CreateAccountParams): string {
  if (isLp && (tickLower === undefined || tickUpper === undefined)) {
    throw new Error('Account id error: LP missing range');
  }

  const message = `${ownerAddress}_${productAddress}_${maturityTimestamp}_${marketId}_${
    isLp ? `${tickLower}_${tickUpper}` : 'taker'
  }_mvp`;

  const hashedMessage = md5(message).toString();

  return BigNumber.from('0x' + hashedMessage).toString();
}
