#!/bin/bash
# Quick fix for DELETE_FAILED stack
aws cloudformation delete-stack --stack-name sam-clinnet --region us-east-2
echo "Stack deletion initiated. Wait 5-10 minutes then redeploy."