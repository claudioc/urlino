import 'source-map-support/register';
import * as AWS from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const dynamoDbTable = process.env?.tableName || '';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  let shortId = event.pathParameters?.id;
  if (!shortId) {
    return {
      statusCode: 404,
      body: 'Not found'
    };
  } else {
    shortId = shortId.toLowerCase();
  }

  if (!dynamoDbTable) {
    return {
      statusCode: 500,
      body: 'Internal server error'
    };
  }

  const item = await findShortId(shortId);
  if (!item) {
    return {
      statusCode: 404,
      body: 'Not found'
    };
  }

  await updateHits(shortId);

  return {
    statusCode: 308,
    headers: { location: item.long_url as string },
    body: ''
  };
};

const findShortId: (
  shortId: string
) => Promise<AWS.DynamoDB.AttributeMap | null> = async shortId => {
  const params = {
    TableName: dynamoDbTable,
    Key: {
      _pk: shortId
    }
  };

  const results = await dynamoDb.get(params).promise();
  return results.Item ? results.Item : null;
};

const updateHits: (shortId: string) => void = async shortId => {
  const params: AWS.DynamoDB.UpdateItemInput = {
    TableName: dynamoDbTable,
    Key: {
      _pk: shortId as AWS.DynamoDB.AttributeValue
    },
    ExpressionAttributeNames: {
      '#hits': 'hits'
    },
    UpdateExpression: 'ADD #hits :num',
    ExpressionAttributeValues: { ':num': 1 as AWS.DynamoDB.AttributeValue },
    ReturnValues: 'NONE'
  };

  await dynamoDb.update(params).promise();
};
