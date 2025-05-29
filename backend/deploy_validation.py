#!/usr/bin/env python3
"""
Deployment Validation Script
This script helps validate and deploy the profile image system changes.
"""
import subprocess
import sys
import os
import json

def run_command(command, description):
    """Run a command and return the result"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, cwd='/Users/sengngor/Desktop/App/Clinnet-EMR/backend')
        if result.returncode == 0:
            print(f"✅ {description} completed successfully")
            if result.stdout.strip():
                print(f"Output: {result.stdout.strip()}")
            return True, result.stdout
        else:
            print(f"❌ {description} failed")
            if result.stderr.strip():
                print(f"Error: {result.stderr.strip()}")
            return False, result.stderr
    except Exception as e:
        print(f"❌ {description} failed with exception: {e}")
        return False, str(e)

def check_prerequisites():
    """Check if all prerequisites are met"""
    print("🔍 Checking prerequisites...")
    
    # Check SAM CLI
    success, output = run_command("sam --version", "Checking SAM CLI")
    if not success:
        print("❌ SAM CLI not found. Please install AWS SAM CLI first.")
        return False
    
    # Check AWS credentials
    success, output = run_command("aws sts get-caller-identity", "Checking AWS credentials")
    if not success:
        print("❌ AWS credentials not configured. Please configure AWS credentials.")
        return False
    
    # Parse AWS account info
    try:
        account_info = json.loads(output)
        print(f"✅ AWS Account: {account_info.get('Account', 'Unknown')}")
        print(f"✅ AWS User: {account_info.get('Arn', 'Unknown')}")
    except:
        print("⚠️  Could not parse AWS account info, but credentials seem to work")
    
    return True

def run_tests():
    """Run the end-to-end tests"""
    print("\n🧪 Running end-to-end tests...")
    success, output = run_command(
        "source test_env/bin/activate && python test_end_to_end.py", 
        "Running end-to-end tests"
    )
    return success

def build_application():
    """Build the SAM application"""
    print("\n🔨 Building SAM application...")
    success, output = run_command("sam build", "Building SAM application")
    return success

def validate_template():
    """Validate the SAM template"""
    print("\n✅ Validating SAM template...")
    success, output = run_command("sam validate", "Validating SAM template")
    return success

def deploy_application():
    """Deploy the SAM application"""
    print("\n🚀 Deploying SAM application...")
    success, output = run_command("sam deploy", "Deploying SAM application")
    return success

def get_stack_outputs():
    """Get the stack outputs to find API endpoint"""
    print("\n📋 Getting stack outputs...")
    success, output = run_command(
        "aws cloudformation describe-stacks --stack-name sam-clinnet --region us-east-2 --query 'Stacks[0].Outputs'", 
        "Getting stack outputs"
    )
    if success:
        try:
            outputs = json.loads(output)
            for output_item in outputs:
                key = output_item.get('OutputKey', '')
                value = output_item.get('OutputValue', '')
                print(f"  {key}: {value}")
        except:
            print("Could not parse stack outputs")
    return success

def main():
    """Main deployment validation flow"""
    print("🚀 Profile Image System Deployment Validation")
    print("=" * 60)
    
    # Check prerequisites
    if not check_prerequisites():
        print("\n❌ Prerequisites not met. Please resolve the issues above.")
        return False
    
    # Run tests first
    if not run_tests():
        print("\n❌ Tests failed. Please fix the issues before deploying.")
        return False
    
    # Build application
    if not build_application():
        print("\n❌ Build failed. Please check the build errors.")
        return False
    
    # Validate template
    if not validate_template():
        print("\n❌ Template validation failed. Please check the template.")
        return False
    
    # Ask user if they want to deploy
    print("\n🤔 All pre-deployment checks passed!")
    response = input("Do you want to proceed with deployment? (y/N): ").strip().lower()
    
    if response in ['y', 'yes']:
        # Deploy
        if deploy_application():
            print("\n🎉 Deployment successful!")
            get_stack_outputs()
            
            print("\n📝 Next steps:")
            print("1. Test the profile image endpoints in the frontend")
            print("2. Verify CORS is working correctly")
            print("3. Test error handling scenarios")
            print("4. Monitor CloudWatch logs for any issues")
            
            return True
        else:
            print("\n❌ Deployment failed. Please check the deployment errors.")
            return False
    else:
        print("\n⏸️  Deployment skipped by user.")
        print("You can deploy later by running: sam deploy")
        return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
