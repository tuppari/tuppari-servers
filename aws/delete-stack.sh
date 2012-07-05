#!/bin/sh

STACK_NAME=$1

echo "Delete AWS CloudFormation Stack: ${STACK_NAME}"
echo ""
cfn-delete-stack ${STACK_NAME}