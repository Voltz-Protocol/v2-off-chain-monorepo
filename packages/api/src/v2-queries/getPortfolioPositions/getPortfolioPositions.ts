import {
  getTokenDetails,
  tickToFixedRate,
  SupportedChainId,
  getTokenPriceInUSD,
} from '@voltz-protocol/commons-v2';

import {
  pullAccountCollateral,
  pullAccountPositionEntries,
  pullAccountsByAddress,
} from '@voltz-protocol/bigquery-v2';
import { getPool } from '../getPools/getPool';

export type PortfolioPositionAMM = {
  id: string;
  chainId: number;

  isBorrowing: boolean;
  market:
    | 'Aave V2'
    | 'Aave V3'
    | 'Compound'
    | 'Lido'
    | 'Rocket'
    | 'GMX:GLP'
    | 'SOFR';

  rateOracle: {
    address: string;
    protocolId: number;
  };

  underlyingToken: {
    address: string;
    name: 'eth' | 'usdc' | 'usdt' | 'dai';
    tokenDecimals: number;
  };

  termEndTimestampInMS: number;
  termStartTimestampInMS: number;
};

type PortfolioPosition = {
  id: string;
  chainId: SupportedChainId;

  ownerAddress: string;
  type: 'LP' | 'Variable' | 'Fixed';
  creationTimestampInMS: number;

  tickLower: number;
  tickUpper: number;

  fixLow: number;
  fixHigh: number;

  tokenPriceUSD: number;
  notionalProvided: number;
  notionalTraded: number;
  notional: number;
  margin: number;

  status: {
    health: 'healthy' | 'danger' | 'warning';
    variant: 'matured' | 'settled' | 'active';
    currentFixed: number;
    receiving: number;
    paying: number;
  };

  unrealizedPNL: number;
  realizedPNLFees: number;
  realizedPNLCashflow: number;
  realizedPNLTotal: number;

  amm: PortfolioPositionAMM;
};

export const getPortfolioPositions = async (
  chainIds: SupportedChainId[],
  ownerAddress: string,
): Promise<PortfolioPosition[]> => {
  const accounts = await pullAccountsByAddress(chainIds, ownerAddress);

  const portfolio: PortfolioPosition[] = [];

  for (const { chainId, accountId } of accounts) {
    const accountCollaterals = await pullAccountCollateral(chainId, accountId);

    if (accountCollaterals.length === 0) {
      continue;
    }

    const { collateralType: tokenAddress, balance: margin } =
      accountCollaterals[0];

    const { tokenName, tokenDecimals } = getTokenDetails(tokenAddress);
    const tokenPriceUSD = await getTokenPriceInUSD(tokenName);

    const positionEntries = await pullAccountPositionEntries(
      chainId,
      accountId,
    );

    for (const {
      id: positionId,
      marketId,
      maturityTimestamp,
      type: positionType,
      baseBalance,
      notionalBalance,
      quoteBalance,
      paidFees,
      tickLower,
      tickUpper,
    } of positionEntries) {
      const pool = await getPool(chainId, marketId, maturityTimestamp);

      const poolFixedRate = pool.currentFixedRate;
      const poolVariableRate = pool.currentVariableRate;

      // todo: add fixed rate locked to position
      const fixedRateLocked = 0.05;

      const fixLow = tickToFixedRate(tickUpper);
      const fixHigh = tickToFixedRate(tickLower);

      // notional balance
      const notionalProvided = 0;
      const notionalTraded = notionalBalance;
      const notional =
        positionType === 'lp' ? notionalProvided : notionalTraded;

      // health factor
      const health = 'healthy';

      // variant
      const variant = 'active';

      // PnL
      const realizedPNLFees = -paidFees;
      const realizedPNLCashflow = 0;
      const unrealizedPNL = 0;

      // Build response
      const amm: PortfolioPositionAMM = {
        id: pool.id,
        chainId,

        isBorrowing: true,
        market: 'Aave V2',

        rateOracle: {
          address: pool.oracleAddress,
          protocolId: 1,
        },

        underlyingToken: {
          address: tokenAddress,
          name: tokenName.toLowerCase() as 'eth' | 'usdc' | 'usdt' | 'dai',
          tokenDecimals,
        },

        termStartTimestampInMS: 0, // todo: add creation timestamp to markets
        termEndTimestampInMS: maturityTimestamp,
      };

      const position: PortfolioPosition = {
        id: positionId,
        chainId,
        ownerAddress,
        type:
          positionType === 'lp' ? 'LP' : baseBalance < 0 ? 'Fixed' : 'Variable',
        creationTimestampInMS: 0, // todo: add creation timestamp to positions
        tickLower,
        tickUpper,
        fixLow,
        fixHigh,
        tokenPriceUSD,
        notionalProvided,
        notionalTraded: notionalBalance,
        notional,
        margin,
        status: {
          health,
          variant,
          currentFixed: poolFixedRate,
          receiving: baseBalance < 0 ? fixedRateLocked : poolVariableRate,
          paying: baseBalance < 0 ? poolVariableRate : fixedRateLocked,
        },
        unrealizedPNL,
        realizedPNLFees,
        realizedPNLCashflow,
        realizedPNLTotal: realizedPNLCashflow + realizedPNLFees,
        amm,
      };

      portfolio.push(position);
    }
  }

  return portfolio;
};
