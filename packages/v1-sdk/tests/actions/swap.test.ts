// Imports required for test setup
import { swap, SwapPeripheryParams } from '../../src';
import { BigNumber, BigNumberish, getDefaultProvider, Signer } from 'ethers';
import { getPeripheryContract } from '../../src/common/contract-generators';
import {
  getSwapPeripheryParams,
  GetSwapPeripheryParamsArgs,
} from '../../src/actions/swap/getSwapPeripheryParams';
import { getDefaultSqrtPriceLimit } from '../../src/common/math/getDefaultSqrtPriceLimits';
import { jest } from '@jest/globals';

jest.mock('../../src/common/contract-generators/getPeripheryContract', () => ({
  getPeripheryContract: jest.fn(() => {}),
}));

describe('swap', () => {
  it.skip('setup all the mocks', async () => {
    (getPeripheryContract as jest.Mock).mockReturnValueOnce({
      connect: jest.fn(() => {
        console.log('Connecting to periphery contract');
        return {
          swap: jest.fn(() => {
            return Promise.resolve({
              wait: jest.fn(() => {
                Promise.resolve({});
              }),
            });
          }),
        };
      }),
      estimateGas: {
        swap: jest.fn(() => {
          return Promise.resolve(BigNumber.from(10000));
        }),
      },
    });

    const fakeSinger = {} as Signer;

    const mockSwapArgs = {
      isFT: false,
      notional: 100,
      margin: 100,
      fixedRateLimit: 0.1,
      fixedLow: 0.1,
      fixedHigh: 0.2,
      underlyingTokenAddress: '0xChadToken',
      underlyingTokenDecimals: 18,
      tickSpacing: 60,
      chainId: 1,
      peripheryAddress: '0xChadPeriphery',
      marginEngineAddress: '0xChadMarginEngine',
      provider: getDefaultProvider(),
      signer: fakeSinger,
      isEth: false,
    };

    await swap(mockSwapArgs as never);
  });

  it('correctly calculates swap periphery parameters', () => {
    const mockGetSwapPeripheryParamsArgs: GetSwapPeripheryParamsArgs = {
      margin: 100,
      isFT: false,
      notional: 100,
      marginEngineAddress: '0xChadMarginEngine',
      underlyingTokenDecimals: 18,
      fixedRateLimit: 0.1,
      tickSpacing: 60,
    };

    const swapPeripheryParams = getSwapPeripheryParams(
      mockGetSwapPeripheryParamsArgs,
    );
    // todo: check the numbers, can we fuzz this easily?
    const expectedSwapPeripheryParams: SwapPeripheryParams = {
      marginEngineAddress: '0xChadMarginEngine',
      isFT: false,
      notional: '100000000000000000000',
      sqrtPriceLimitX96: '250704317490035741267292715206',
      tickLower: -69060,
      tickUpper: 0,
      marginDelta: '100000000000000000000',
    };

    expect(swapPeripheryParams).toEqual(expectedSwapPeripheryParams);
  });

  it('gets expected default sqrt price limits', () => {
    const resultDefaultSqrtPriceLimitFixedTaker: BigNumberish =
      getDefaultSqrtPriceLimit(true);
    const resultDefaultSqrtPriceLimitVaribaleTaker: BigNumberish =
      getDefaultSqrtPriceLimit(false);

    // todo: check the numbers
    const expectedDefaultSqrtPriceLimitFixedTaker: BigNumberish =
      '2507669430214757147510696507320';
    const expectedDefaultSqrtPriceLimitVaribaleTaker: BigNumberish =
      '2503161564979124432035869129';

    expect(resultDefaultSqrtPriceLimitFixedTaker).toEqual(
      expectedDefaultSqrtPriceLimitFixedTaker,
    );
    expect(resultDefaultSqrtPriceLimitVaribaleTaker).toEqual(
      expectedDefaultSqrtPriceLimitVaribaleTaker,
    );
  });
});
