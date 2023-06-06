import { TableField } from '@google-cloud/bigquery';
import { PRECISION, SCALE } from '../../constants';

export const positionsTableSchema: TableField[] = [
  { name: 'id', type: 'STRING', mode: 'REQUIRED' },
  { name: 'chainId', type: 'INTEGER', mode: 'REQUIRED' },

  { name: 'accountId', type: 'STRING', mode: 'REQUIRED' },
  { name: 'marketId', type: 'STRING', mode: 'REQUIRED' },
  { name: 'maturityTimestamp', type: 'INTEGER', mode: 'REQUIRED' },

  {
    name: 'baseBalance',
    type: 'BIGNUMERIC',
    mode: 'REQUIRED',
    precision: PRECISION.toString(),
    scale: SCALE.toString(),
  },

  {
    name: 'quoteBalance',
    type: 'BIGNUMERIC',
    mode: 'REQUIRED',
    precision: PRECISION.toString(),
    scale: SCALE.toString(),
  },

  {
    name: 'notionalBalance',
    type: 'BIGNUMERIC',
    mode: 'REQUIRED',
    precision: PRECISION.toString(),
    scale: SCALE.toString(),
  },

  {
    name: 'paidFees',
    type: 'BIGNUMERIC',
    mode: 'REQUIRED',
    precision: PRECISION.toString(),
    scale: SCALE.toString(),
  },

  { name: 'type', type: 'STRING', mode: 'REQUIRED' },
  { name: 'tickLower', type: 'INTEGER', mode: 'REQUIRED' },
  { name: 'tickUpper', type: 'INTEGER', mode: 'REQUIRED' },
];
