import { getBigQuery } from '../../../client';
import { TableType } from '../../../types';
import { getTableFullName } from '../../../table-infra/getTableName';
import { LiquidityChangeEvent, mapRow } from '../specific';

export const pullLiquidityChangeEvent = async (
  environmentV2Tag: string,
  id: string,
): Promise<LiquidityChangeEvent | null> => {
  const bigQuery = getBigQuery();

  const tableName = getTableFullName(
    environmentV2Tag,
    TableType.raw_liquidity_change,
  );

  const sqlQuery = `SELECT * FROM \`${tableName}\` WHERE id="${id}"`;

  const [rows] = await bigQuery.query({
    query: sqlQuery,
  });

  if (!rows || rows.length === 0) {
    return null;
  }

  return mapRow(rows[0]);
};
