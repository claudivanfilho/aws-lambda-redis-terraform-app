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

variable "lambdasVersion" {
  type        = string
  description = "version of the lambdas zip on S3"
}