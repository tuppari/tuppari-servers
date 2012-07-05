#!/bin/sh

STACK_NAME=$1
EC2_KEYPAIR_NAME=$2

echo "Create AWS CloudFormation Stack: ${STACK_NAME}"
echo ""
cfn-create-stack ${STACK_NAME} \
   --template-file cf-tuppari.json \
   --capabilities CAPABILITY_IAM \
   --parameters "KeyName=${EC2_KEYPAIR_NAME};AppRepoURL=https://github.com/hakobera/tuppari-servers/zipball/master"