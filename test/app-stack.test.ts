import { expect, haveResource } from '@aws-cdk/assert';
import * as sst from '@serverless-stack/resources';
import appStack from '../lib/app-stack';

test('Test Stack', () => {
  const app = new sst.App();
  // WHEN
  const stack = new appStack(app, 'test-stack');
  // THEN
  expect(stack).to(haveResource('AWS::Lambda::Function'));
});
