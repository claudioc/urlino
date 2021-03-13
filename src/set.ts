import 'source-map-support/register';
import * as AWS from 'aws-sdk';
import * as qs from 'querystring';
import { ParsedUrlQuery } from 'querystring';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { URL } from 'url';
import Hashids from 'hashids';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const hashids = new Hashids(
  // You should change this with the name of your application
  'urlino',
  2,
  'abcdefghijklmnopqrstuvwxyz1234567890'
);
const dynamoDbTable = process.env?.tableName || '';

interface FormData extends ParsedUrlQuery {
  longurl: string;
}

// We do not check if the URL is already present because
// we cannot delete an url (at the moment), hence we may
// want to use a different short url for the long url.
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const formData = parseFormData(event);

  const maybeError = validateRequest(formData);
  if (maybeError) {
    return maybeError;
  }

  const nextId = await getNextId();
  const shortId = hashids.encode(nextId);

  const params = {
    TableName: dynamoDbTable,
    Item: {
      _pk: shortId,
      long_url: formData?.longurl,
      hits: 0,
      created_at: Date.now()
    }
  };

  await dynamoDb.put(params).promise();

  return {
    statusCode: 302,
    headers: { location: `/?id=${shortId}` },
    body: ''
  };
};

const parseFormData: (
  event: APIGatewayProxyEvent
) => FormData | null = event => {
  const ct = event.headers['Content-Type'] || event.headers['content-type'];
  if (ct !== 'application/x-www-form-urlencoded') {
    return null;
  }

  if (!event.body) {
    return null;
  }

  let body = event.body;
  if (event.isBase64Encoded) {
    body = Buffer.from(body, 'base64').toString('ascii');
  }

  return qs.parse(body || '') as FormData;
};

const getNextId: () => Promise<number> = async () => {
  const params: AWS.DynamoDB.UpdateItemInput = {
    TableName: dynamoDbTable,
    Key: {
      _pk: '__id' as AWS.DynamoDB.AttributeValue
    },
    ExpressionAttributeNames: {
      '#hits': 'hits'
    },
    ExpressionAttributeValues: { ':num': 1 as AWS.DynamoDB.AttributeValue },
    UpdateExpression: 'ADD #hits :num',
    ReturnValues: 'UPDATED_NEW'
  };

  const result = await dynamoDb.update(params).promise();

  return result.Attributes?.hits || 0;
};

const isValidUrl: (str: string) => boolean = str => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

const validateRequest: (
  formData: FormData | null
) => APIGatewayProxyResult | null = formData => {
  if (!process.env.tableName) {
    return {
      statusCode: 302,
      headers: { location: '/?err=2' }, // Internal server error
      body: ''
    };
  }

  if (formData === null || !formData.longurl) {
    return {
      statusCode: 302,
      headers: { location: '/?err=3' }, // Malformed input
      body: ''
    };
  }

  if (!isValidUrl(String(formData.longurl))) {
    return {
      statusCode: 302,
      headers: { location: '/?err=1' }, // Validation failed
      body: ''
    };
  }

  return null;
};
