import JSBI from 'jsbi';
import { BigNumber } from 'ethers';

/**
 * The minimum fixed rate that can be used on any pool.
 */
export const MIN_FIXED_RATE = 0.001;
/**
 * The maximum fixed rate that can be used on any pool.
 */
export const MAX_FIXED_RATE = 1001;

export const MaxUint256 = JSBI.BigInt(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
);

export const NEGATIVE_ONE = JSBI.BigInt(-1);
export const ZERO = JSBI.BigInt(0);
export const ONE = JSBI.BigInt(1);

// used in liquidity amount math
export const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));
export const Q192 = JSBI.exponentiate(Q96, JSBI.BigInt(2));

/**
 * The minimum tick that can be used on any pool.
 */
export const MIN_TICK = -69100;
/**
 * The maximum tick that can be used on any pool.
 */
export const MAX_TICK = 69100;

export const WETH9 = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

// todo: add testnet periphery addresses
export const PERIPHERY_ADDRESS_BY_CHAIN_ID: { [key: number]: string } = {
  1: '0x07ced903e6ad0278cc32bc83a3fc97112f763722',
  42161: '0x5971eEdc4ae37C7FE86aF716737e5C19EfD07a80',
  43114: '0x4870b57E2e4bAA82ac8CC87350A2959e4b51694f',
};

// todo: remove hardcoded tick spacing and replace by api call
export const DEFAULT_TICK_SPACING = 60;

export const MaxUint256Bn = BigNumber.from(
  '115792089237316195423570985008687907853269984665640564039457584007913129639935',
);

export const TresholdApprovalBn = BigNumber.from(
  '6277101735386680763835789423207666416102355444464034512896',
);

export const TRADER_TICK_LOWER = -69060;
export const TRADER_TICK_UPPER = 0;

export const NUMBER_OF_DECIMALS_ETHER = 18;
