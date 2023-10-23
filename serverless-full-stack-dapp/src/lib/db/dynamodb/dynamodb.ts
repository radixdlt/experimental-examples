import {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  GetCommand,
  BatchGetCommand
} from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import type { DbClient } from '../type';

export const DynamoDbAdapter = <Item extends object, PrimaryKey extends keyof Item>({
  tableName: TableName,
  region,
  primaryKey,
  sortKey
}: {
  tableName: string;
  primaryKey: PrimaryKey;
  sortKey?: string;
  region: string;
  expireInSeconds?: number;
}): DbClient<Item, PrimaryKey> => {
  const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));
  type PrimaryKeyValue = Item[PrimaryKey];
  type SortKeyValue = Item[keyof Item];

  const list = async (id: PrimaryKeyValue, sortId: SortKeyValue): Promise<Item[]> => {
    if (!sortKey) throw new Error("Can't list without a sort key");

    const command = new BatchGetCommand({
      RequestItems: {
        Items: {
          Keys: [{ [primaryKey]: id, [sortKey]: sortId }]
        }
      }
    });

    const result = await db.send(command);
    return (result.Responses?.Items || []) as Item[];
  };

  const getById = async (id: PrimaryKeyValue): Promise<Item> => {
    const command = new GetCommand({
      TableName,
      Key: { [primaryKey]: id },
      ConsistentRead: true
    });

    const result = await db.send(command);

    if (!result.Item) throw new Error("Item doesn't exist");

    return result.Item as Item;
  };

  const upsert = async (value: Item): Promise<Item> => {
    const { Item: oldValues } = await db.send(
      new GetCommand({
        TableName,
        Key: { [primaryKey]: value[primaryKey] },
        ConsistentRead: true
      })
    );

    const Item = oldValues ? { ...oldValues, ...value } : value;

    const command = new PutCommand({
      TableName,
      Item
    });

    await db.send(command);

    return Item;
  };

  const getAndDelete = async (id: PrimaryKeyValue) => {
    const command = new DeleteCommand({
      TableName,
      Key: { [primaryKey]: id },
      ReturnValues: 'ALL_OLD'
    });

    const result = await db.send(command);

    return result as Item | undefined;
  };

  return { upsert, getById, getAndDelete, list };
};
