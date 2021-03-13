import * as cdk from '@aws-cdk/core';
import * as sst from '@serverless-stack/resources';
import * as dotenv from 'dotenv';

export default class appStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    dotenv.config();

    const table = this.buildTable({
      tableName: process.env.URLINO_TABLE_NAME || ''
    });

    const api = this.buildApi({
      tableName: table.dynamodbTable.tableName
    });

    api.attachPermissions([table]);

    // Show API endpoint in output
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.httpApi.apiEndpoint
    });
  }

  buildTable(config: Record<string, string>): sst.Table {
    return new sst.Table(this, config.tableName, {
      fields: {
        _pk: sst.TableFieldType.STRING
      },
      primaryIndex: { partitionKey: '_pk' },
      dynamodbTable: {
        // sst set it as true by default but we want to live wild.
        pointInTimeRecovery: false
      }
    });
  }

  buildApi(config: Record<string, string>): sst.Api {
    return new sst.Api(this, 'Api', {
      defaultFunctionProps: {
        bundle: {
          loader: {
            '.html': 'text',
            '.css': 'text',
            '.client.js': 'text'
          }
        },
        environment: config
      },
      routes: {
        'GET /': 'src/index.handler',
        'GET /e/{id}': 'src/get.handler',
        'POST /set': 'src/set.handler'
      }
    });
  }
}
