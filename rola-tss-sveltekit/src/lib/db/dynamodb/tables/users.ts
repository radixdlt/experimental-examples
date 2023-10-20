import type { User } from '$lib/db/type';
import { DynamoDbAdapter } from '../dynamodb';
import { env } from '$env/dynamic/private';

const { AWS_REGION, SST_Table_tableName_users } = env;

export const userTable = DynamoDbAdapter<User, 'identityAddress'>({
  primaryKey: 'identityAddress',
  tableName: SST_Table_tableName_users || '',
  region: AWS_REGION || 'eu-west-2'
});
