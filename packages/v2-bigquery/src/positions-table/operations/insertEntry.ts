import { encodeV2PositionId } from '@voltz-protocol/commons-v2';
import { getBigQuery } from '../../client';
import { tableName } from '../specific';
import { PositionEntry } from '../specific';

export const insertPositionEntry = async (
  entry: Omit<PositionEntry, 'id'>,
): Promise<void> => {
  const bigQuery = getBigQuery();

  const id = encodeV2PositionId(entry);

  const row = `
    "${id}",
    ${entry.chainId},
    "${entry.accountId}", 
    "${entry.marketId}", 
    ${entry.maturityTimestamp},
    ${entry.base},
    ${entry.timeDependentQuote},
    ${entry.freeQuote},
    ${entry.notional},
    ${entry.lockedFixedRate},
    ${entry.liquidity},
    ${entry.paidFees},
    "${entry.type}",
    ${entry.tickLower},
    ${entry.tickUpper},
    ${entry.creationTimestamp}
  `;

  // build and fire sql query
  const sqlTransactionQuery = `INSERT INTO \`${tableName}\` VALUES (${row});`;

  const options = {
    query: sqlTransactionQuery,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);
};
