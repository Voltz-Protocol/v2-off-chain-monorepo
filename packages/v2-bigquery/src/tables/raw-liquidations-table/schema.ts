import { TableField } from '@google-cloud/bigquery';
import { PRECISION, SCALE } from '../../constants';
import { rawEventsBaseTableSchema } from '../../utils/rawEventsBaseTableSchema';

export const rawLiquidationsTableSchema: TableField[] = [
  ...rawEventsBaseTableSchema,

  { name: 'liquidatedAccountId', type: 'STRING', mode: 'REQUIRED' },
  { name: 'collateralType', type: 'STRING', mode: 'REQUIRED' },
  { name: 'sender', type: 'STRING', mode: 'REQUIRED' },
  { name: 'liquidatorAccountId', type: 'STRING', mode: 'REQUIRED' },

  {
    name: 'liquidatorRewardAmount',
    type: 'BIGNUMERIC',
    mode: 'REQUIRED',
    precision: PRECISION.toString(),
    scale: SCALE.toString(),
  },

  {
    name: 'imPreClose',
    type: 'BIGNUMERIC',
    mode: 'REQUIRED',
    precision: PRECISION.toString(),
    scale: SCALE.toString(),
  },

  {
    name: 'imPostClose',
    type: 'BIGNUMERIC',
    mode: 'REQUIRED',
    precision: PRECISION.toString(),
    scale: SCALE.toString(),
  },
];
