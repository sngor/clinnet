"""
Unified deployment script for Clinnet-EMR.
Consolidates multiple deployment scripts into a single, comprehensive tool.
"""
import subprocess
import sys
import os
import json
import time
import argparse
from pathlib import Path
from typing import Tuple, Optional


class DeploymentManager:
    """Manages the deployment process for Clinnet-EMR."""
    
    def __init__(self, backend_path: str = None, frontend_path: str = None):
        self.backend_path = Path(backend_path or 'backend')
        self.frontend_path = Path(frontend_path or 'frontend')
        self.project_root = Path.cwd()
    
    def run_command(self, command: str, description: str, cwd: Path = None) -> Tuple[bool, str]:
        """Run a command and return success status and output."""
        print(f"🔧 {description}...")
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                cwd=cwd or self.project_root
            )
            if result.returncode == 0:
                print(f"✅ {description} completed successfully")
                return True, result.stdout.strip()
            else:
                print(f"❌ {description} failed")
                if result.stderr.strip():
                    print(f"Error: {result.stderr.strip()}")
                return False, result.stderr.strip()
        except Exception as e:
            print(f"❌ {description} failed with exception: {e}")
            return False, str(e)
    
    def check_prerequisites(self) -> bool:
        """Check if all prerequisites are met."""
        print("🔍 Checking prerequisites...")
        
        # Check AWS CLI
        success, _ = self.run_command("aws --version", "Checking AWS CLI")
        if not success:
            print("❌ AWS CLI not found. Please install AWS CLI.")
            return False
        
        # Check AWS credentials
        success, _ = self.run_command("aws sts get-caller-identity", "Checking AWS credentials")
        if not success:
            print("❌ AWS credentials not configured. Run 'aws configure'.")
            return False
        
        # Check SAM CLI
        success, _ = self.run_command("sam --version", "Checking SAM CLI")
        if not success:
            print("❌ SAM CLI not found. Please install AWS SAM CLI.")
            return False
        
        # Check Node.js
        success, _ = self.run_command("node --version", "Checking Node.js")
        if not success:
            print("❌ Node.js not found. Please install Node.js 18+.")
            return False
        
        # Check Python
        success, _ = self.run_command("python3 --version", "Checking Python")
        if not success:
            print("❌ Python 3 not found. Please install Python 3.10+.")
            return False
        
        return True
    
    def run_backend_tests(self) -> bool:
        """Run backend tests."""
        print("\n🧪 Running backend tests...")
        
        # Check if virtual environment exists
        venv_path = self.backend_path / "test_env"
        if not venv_path.exists():
            print("Creating test virtual environment...")
            success, _ = self.run_command(
                "python3 -m venv test_env", 
                "Creating virtual environment",
                self.backend_path
            )
            if not success:
                return False
        
        # Install dependencies and run tests
        success, _ = self.run_command(
            "source test_env/bin/activate && pip install -r requirements.txt -r requirements-dev.txt && python test_end_to_end.py",
            "Running backend tests",
            self.backend_path
        )
        return success
    
    def run_frontend_tests(self) -> bool:
        """Run frontend tests."""
        print("\n🧪 Running frontend tests...")
        
        # Install dependencies
        success, _ = self.run_command("npm install", "Installing frontend dependencies", self.frontend_path)
        if not success:
            return False
        
        # Run tests
        success, _ = self.run_command("npm test -- --run", "Running frontend tests", self.frontend_path)
        return success
    
    def build_backend(self) -> bool:
        """Build the backend SAM application."""
        print("\n🔨 Building backend...")
        
        # Validate template
        success, _ = self.run_command("sam validate --lint", "Validating SAM template", self.backend_path)
        if not success:
            return False
        
        # Build application
        success, _ = self.run_command("sam build --cached", "Building SAM application", self.backend_path)
        return success
    
    def build_frontend(self) -> bool:
        """Build the frontend application."""
        print("\n🔨 Building frontend...")
        
        success, _ = self.run_command("npm run build", "Building frontend", self.frontend_path)
        return success
    
    def deploy_backend(self) -> bool:
        """Deploy the backend SAM application."""
        print("\n🚀 Deploying backend...")
        
        success, _ = self.run_command("sam deploy", "Deploying backend", self.backend_path)
        if not success:
            return False
        
        # Get stack outputs
        print("\n📋 Getting stack outputs...")
        success, output = self.run_command(
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
        
        return True
    
    def deploy_frontend(self) -> bool:
        """Deploy the frontend application."""
        print("\n🚀 Deploying frontend...")
        
        # Check if deployment script exists
        deploy_script = self.frontend_path / "scripts" / "deploy-frontend.sh"
        if deploy_script.exists():
            success, _ = self.run_command(
                f"bash {deploy_script}", 
                "Deploying frontend",
                self.frontend_path
            )
            return success
        else:
            print("⚠️  Frontend deployment script not found. Skipping frontend deployment.")
            return True
    
    def full_deployment(self, skip_tests: bool = False, backend_only: bool = False) -> bool:
        """Run full deployment process."""
        print("🚀 Clinnet-EMR Full Deployment")
        print("=" * 50)
        
        # Check prerequisites
        if not self.check_prerequisites():
            return False
        
        # Run tests
        if not skip_tests:
            if not self.run_backend_tests():
                print("\n❌ Backend tests failed. Fix issues before deploying.")
                return False
            
            if not backend_only and not self.run_frontend_tests():
                print("\n❌ Frontend tests failed. Fix issues before deploying.")
                return False
        
        # Build applications
        if not self.build_backend():
            print("\n❌ Backend build failed.")
            return False
        
        if not backend_only and not self.build_frontend():
            print("\n❌ Frontend build failed.")
            return False
        
        # Deploy applications
        if not self.deploy_backend():
            print("\n❌ Backend deployment failed.")
            return False
        
        if not backend_only and not self.deploy_frontend():
            print("\n❌ Frontend deployment failed.")
            return False
        
        print("\n🎉 Deployment completed successfully!")
        print("\n📝 Next steps:")
        print("1. Test the application endpoints")
        print("2. Verify CORS configuration")
        print("3. Monitor CloudWatch logs")
        print("4. Update frontend environment variables if needed")
        
        return True


def main():
    """Main deployment script entry point."""
    parser = argparse.ArgumentParser(description='Clinnet-EMR Deployment Manager')
    parser.add_argument('--skip-tests', action='store_true', help='Skip running tests')
    parser.add_argument('--backend-only', action='store_true', help='Deploy backend only')
    parser.add_argument('--frontend-only', action='store_true', help='Deploy frontend only')
    parser.add_argument('--backend-path', help='Path to backend directory')
    parser.add_argument('--frontend-path', help='Path to frontend directory')
    
    args = parser.parse_args()
    
    deployment_manager = DeploymentManager(args.backend_path, args.frontend_path)
    
    if args.frontend_only:
        success = (deployment_manager.check_prerequisites() and 
                  deployment_manager.build_frontend() and 
                  deployment_manager.deploy_frontend())
    else:
        success = deployment_manager.full_deployment(args.skip_tests, args.backend_only)
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()