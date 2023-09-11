provider "aws" {
  region = "us-east-1" # Change to your desired AWS region
}

terraform {
  backend "s3" {
    bucket         = "terraform-state-test-123456788"
    key            = "terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
  }
}

resource "aws_lambda_function" "my_lambda" {
  function_name = "myLambdaFunction"
  handler      = "index.handler"
  runtime      = "nodejs18.x"
  role         = "arn:aws:iam::344965508130:role/my_lambda_role"
  filename     = "lambda_function_${var.lambdasVersion}.zip"

  environment {
    variables = {
      REDIS_DB_PATH = "${var.redisDBPath}"
    }
  }
}

resource "aws_iam_role" "lambda_role" {
  name = "my_lambda_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.my_lambda.function_name
  principal     = "apigateway.amazonaws.com"
}

resource "aws_api_gateway_rest_api" "my_api" {
  name = "my-api"
}

resource "aws_api_gateway_resource" "my_resource" {
  rest_api_id = aws_api_gateway_rest_api.my_api.id
  parent_id   = aws_api_gateway_rest_api.my_api.root_resource_id
  path_part   = "analytics"
}

resource "aws_api_gateway_method" "post_method" {
  rest_api_id   = aws_api_gateway_rest_api.my_api.id
  resource_id   = aws_api_gateway_resource.my_resource.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id             = aws_api_gateway_rest_api.my_api.id
  resource_id             = aws_api_gateway_resource.my_resource.id
  http_method             = aws_api_gateway_method.post_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.my_lambda.invoke_arn
}

resource "aws_api_gateway_deployment" "my_deployment" {
  depends_on      = [aws_api_gateway_integration.lambda_integration]
  rest_api_id     = aws_api_gateway_rest_api.my_api.id
  stage_name      = "prod"
}

variable "lambdasVersion" {
  type        = string
  description = "version of the lambdas zip on S3"
}

variable "redisDBPath" {
  type        = string
  description = "Redis DB Path"
}