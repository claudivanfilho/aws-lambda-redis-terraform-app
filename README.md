# AWS Lambda with Redis, Terraform, Node.js, and TypeScript

[![Jest Workflow](https://github.com/claudivanfilho/aws-lambda-redis-terraform-app/actions/workflows/tests.yaml/badge.svg)](https://github.com/claudivanfilho/aws-lambda-redis-terraform-app/actions/workflows/tests.yaml)

![AWS Lambda](https://img.shields.io/badge/AWS%20Lambda-Serverless-orange)
![Redis](https://img.shields.io/badge/Redis-Caching-red)
![Terraform](https://img.shields.io/badge/Terraform-Infrastructure%20as%20Code-blueviolet)
![Node.js](https://img.shields.io/badge/Node.js-Server%20Runtime-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-Language-blue)
![Jest](https://img.shields.io/badge/Jest-Testing-green)

This repository contains an AWS Lambda example demonstrating rate limiting implemented with Redis, Node.js, and TypeScript.

The application enforces a **Time Limit** based on the companyId provided in the request. It offers two distinct plan types: a **free plan** and a **paid plan**, each with its own **monthly usage quotas**.

## Development

### Prerequisites

Before you begin, ensure that you have the following prerequisites installed:

- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) (required for running Redis locally)

### Getting Started

1. Install project dependencies:

```shell
  yarn install
```

2. Start a local Redis instance (requires Docker):

```shell
  yarn start-local-redis
```

3. Run the development server:

```shell
  yarn dev
```

- The Lambda function will listen for POST requests locally at http://localhost:300/lambda.

## Deploy AWS Lambda from your Local Machine

To deploy the Lambda function from your local machine, follow these steps:

- rename `env` to `.env` and add your redis database url
- Initialize Terraform:

```shell
  Terraform init
```

- Build and deploy the Lambda function:

```shell
  sh build.sh
```

## CD - Continous Delivery

Automate the deployment of your Lambda function using GitHub Actions. The deployment workflow is defined in the .github/workflows/main.yaml file.

### Setup

- Install the `AWS CLI` and `Terraform CLI` on your local machine.
- Create an AWS account and generate `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.
- Configure your AWS credentials with `aws configure`
- Create an S3 bucket to store Terraform state using the provided script, `createBucket.sh`.
- Add the following secrets to your GitHub Actions repository:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `REDIS_DB_PATH`
- The `main.yaml` workflow will automatically trigger with every new push to the main branch.
