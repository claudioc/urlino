import 'source-map-support/register';
import { APIGatewayProxyResult } from 'aws-lambda';
import html from './static/index.html';
import css from './static/index.css';
import js from './static/index.client.js';

let document: string;
export const handler = async (): Promise<APIGatewayProxyResult> => {
  if (!document) {
    document = html.replace('/*CSS*/', css).replace('/*JS*/', js);
  }

  return {
    statusCode: 200,
    headers: {
      'Content-type': 'text/html; charset=UTF-8',
      'Content-Security-Policy': "frame-ancestors 'self'; navigate-to 'none'"
    },
    body: document
  };
};
