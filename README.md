# Urlino, serverless (Lambda) url shortener

This project was bootstrapped with [Create Serverless Stack](https://docs.serverless-stack.com/packages/create-serverless-stack). For any customisation please refer to its [documentation](https://docs.serverless-stack.com/).

## Goals and features

The goal of the project is to create a baseline for a simple url shortner service, using only Lambda functions. This application is hardly usable as-it-is, but for sure it covers already a long path!

- Uses AWS Lambda functions
- Uses a Dynamodb table (but doesn't track visitor's information)
- Directly serves the needed html and css (bundled with lambda)
- Uses [sst](https://docs.serverless-stack.com/) for faster (and funnier) development
- Shortening is done using a [Bijective function](https://stackoverflow.com/a/742047/27958) with a minimum length of 2 characters
- Every time a url is resolved, it increases its "hit" count
- No cookies

## Disclaimer

This software is released as-is, and mostly to serve as a starting point for a more complex and feature-rich application. I haven't put too much attention to security issue (IAM roles and permissions, for example) and how to setup it to run on a custom domain. This part is left to your installation.

## Testing it out

To try (and eventually use) this application you need a working AWS account and of course an account key to work from the terminal. Testing the application is not going to cost you any $$$, but it is always a good idea to [set a cost budget](https://aws.amazon.com/getting-started/hands-on/control-your-costs-free-tier-budgets/) in your AWS testing account to avoid bitter surprises anyway!

Start by installing the dependencies.

```bash
$ npm install
```

Configure it:

```bash
$ cp .env.example .env
$ cp sst.json.example sst.json
```

Edit `.env` and `sst.json` to supply your configuration.

## Commands

### `npm run start`

Starts the local Lambda development environment.

Once the deployment finishes, you'll be given the URL to try it out.

### `npm run build`

Build your app and synthesize your stacks.

Generates a `.build/` directory with the compiled files and a `.build/cdk.out/` directory with the synthesized CloudFormation stacks.

### `npm run deploy [stack]`

Deploy all your stacks to AWS. Or optionally deploy a specific stack.

### `npm run remove [stack]`

Remove all your stacks and all of their resources from AWS. Or optionally remove a specific stack.

### `npm run test`

Runs your tests using Jest. Takes all the [Jest CLI options](https://jestjs.io/docs/en/cli).

## Customisation

The CSS and HTML files are in `/src/static`. They are included and bundled directly from the `index.ts` file. Once you change them, sst will re-bundle them for you and after some seconds you'll be able to reload the page.
