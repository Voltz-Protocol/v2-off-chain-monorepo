import { TableField } from '@google-cloud/bigquery';
import { rawEventsBaseTableSchema } from './rawEventsBaseTableSchema';

export const rawAccountCreatedTableSchema: TableField[] = [
  ...rawEventsBaseTableSchema,
  { name: 'accountId', type: 'STRING', mode: 'REQUIRED' },
  { name: 'owner', type: 'STRING', mode: 'REQUIRED' },
];
