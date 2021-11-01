# s3-admin-backend

## Description
S3 Admin NestJS app to be deployed as an AWS Lambda.


## AWS Credentials for Dev
When testing locally, we need to set up credentials.
DO NOT create keys/secrets from the root account!

https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/loading-node-credentials-shared.html


## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
