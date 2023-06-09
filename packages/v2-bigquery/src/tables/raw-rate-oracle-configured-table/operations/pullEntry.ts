import { getBigQuery } from '../../../client';
import { TableType } from '../../../types';
import { getTableFullName } from '../../../table-infra/getTableName';
import { RateOracleConfiguredEvent, mapRow } from '../specific';

export const pullRateOracleConfiguredEvent = async (
  environmentV2Tag: string,
  id: string,
): Promise<RateOracleConfiguredEvent | null> => {
  const bigQuery = getBigQuery();

  const tableName = getTableFullName(
    environmentV2Tag,
    TableType.raw_rate_oracle_configured,
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
