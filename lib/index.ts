import appStack from './app-stack';
import * as sst from '@serverless-stack/resources';

export default function main(app: sst.App): void {
  new appStack(app, `${app.name}-stack`);
}
