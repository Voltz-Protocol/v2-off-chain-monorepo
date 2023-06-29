import { BaseEvent } from '../common-table-support/baseEvent';
import { mapBaseRow } from '../common-table-support/mapBaseRow';

export type VammPriceChangeEvent = BaseEvent & {
  marketId: string; // big number
  maturityTimestamp: number;
  tick: number;
};

export const mapRow = (row: any): VammPriceChangeEvent => ({
  ...mapBaseRow(row),

  marketId: row.marketId,
  maturityTimestamp: row.maturityTimestamp,
  tick: row.tick,
});
