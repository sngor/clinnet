#!/bin/bash

# Monitor deployment script
echo "🔍 Monitoring SAM deployment status..."
echo "=================================================="

STACK_NAME="sam-clinnet"
REGION="us-east-2"
MAX_ATTEMPTS=30
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    echo "⏱️  Attempt $ATTEMPT/$MAX_ATTEMPTS - Checking stack status..."
    
    STATUS=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].StackStatus' \
        --output text 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo "📊 Stack Status: $STATUS"
        
        case $STATUS in
            "CREATE_COMPLETE"|"UPDATE_COMPLETE")
                echo "✅ Deployment completed successfully!"
                echo ""
                echo "🌐 Getting API Gateway endpoints..."
                sam list stack-outputs --stack-name $STACK_NAME
                exit 0
                ;;
            "CREATE_FAILED"|"UPDATE_FAILED"|"ROLLBACK_COMPLETE"|"DELETE_COMPLETE")
                echo "❌ Deployment failed with status: $STATUS"
                echo ""
                echo "🔍 Getting failure reason..."
                aws cloudformation describe-stack-events \
                    --stack-name $STACK_NAME \
                    --region $REGION \
                    --query 'StackEvents[?ResourceStatus==`CREATE_FAILED` || ResourceStatus==`UPDATE_FAILED`].[ResourceStatusReason]' \
                    --output text | head -5
                exit 1
                ;;
            "CREATE_IN_PROGRESS"|"UPDATE_IN_PROGRESS")
                echo "⏳ Deployment still in progress..."
                ;;
            *)
                echo "❓ Unknown status: $STATUS"
                ;;
        esac
    else
        echo "⚠️  Stack not found or error checking status"
    fi
    
    if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
        echo "⏱️  Waiting 30 seconds before next check..."
        sleep 30
    fi
    
    ATTEMPT=$((ATTEMPT + 1))
done

echo "❌ Deployment monitoring timed out after $((MAX_ATTEMPTS * 30)) seconds"
echo "💡 Check AWS CloudFormation console for more details"
exit 1
