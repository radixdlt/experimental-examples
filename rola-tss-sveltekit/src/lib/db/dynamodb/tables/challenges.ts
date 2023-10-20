import type { Challenge } from '$lib/db/type';
import { DynamoDbAdapter } from '../dynamodb';
import { env } from '$env/dynamic/private';

const { AWS_REGION, SST_Table_tableName_challenges } = env;

export const challengeTable = DynamoDbAdapter<Challenge, 'challenge'>({
  primaryKey: 'challenge',
  tableName: SST_Table_tableName_challenges!,
  region: AWS_REGION!
});
