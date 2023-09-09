function deploy {
  # Generate a version number based on a date timestamp so that it's unique
  TIMESTAMP=$(date +%Y%m%d%H%M%S)
  npm run build &&\
  cp -r ./node_modules dist/ &&\
  cd dist &&\
  find . -name "*.zip" -type f -delete &&\
  zip -r ../lambda_function_"$TIMESTAMP".zip . &&\
  cd .. && rm -rf dist &&\
  terraform apply -auto-approve -var lambdasVersion="$TIMESTAMP" &&\
  rm lambda_function_"$TIMESTAMP".zip
}

deploy