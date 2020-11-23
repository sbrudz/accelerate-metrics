#!/bin/bash

command -v ajv >/dev/null 2>&1 || { echo >&2 "ajv required but it's not installed.  Aborting.  Run 'npm install -g ajv-cli' and retry."; exit 1; }

DORA_SCHEMA=./schema/dora-schema.json

for example in ./schema/examples/*.json
do
  echo "*** Checking $example for compliance against $DORA_SCHEMA"
  ajv -s $DORA_SCHEMA -d $example
  [ $? -eq 0 ] || exit 1
done
