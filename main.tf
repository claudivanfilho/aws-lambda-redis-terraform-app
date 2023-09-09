provider "aws" {
  region = "us-east-1" # Change to your desired AWS region
}

resource "aws_lambda_function" "my_lambda" {
  function_name = "myLambdaFunction"
  handler      = "index.handler"
  runtime      = "nodejs18.x"
  role         = "arn:aws:iam::344965508130:role/my_lambda_role"
  filename     = "lambda_function_${var.lambdasVersion}.zip"
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