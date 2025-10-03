"""
Modern deployment script for Clinnet-EMR with clean architecture.
Supports multiple environments and modular deployment.
"""
import subprocess
import sys
import os
import json
import yaml
import argparse
from pathlib import Path
from typing import Tuple, Optional, Dict, Any
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DeploymentManager:
    """Modern deployment manager with environment support."""
    
    def __init__(self, environment: str = 'dev', backend_path: str = None, frontend_path: str = None):
        self.environment = environment
        self.backend_path = Path(backend_path or 'backend')
        self.frontend_path = Path(frontend_path or 'frontend')
        self.deployment_path = Path('deployment')
        self.project_root = Path.cwd()
        
        # Load environment configuration
        self.config = self._load_environment_config()
        
        logger.info(f"Initialized deployment manager for environment: {environment}")
    
    def _load_environment_config(self) -> Dict[str, Any]:
        """Load environment-specific configuration."""
        config_file = self.deployment_path / 'environments' / f'{self.environment}.yaml'
        
        if not config_file.exists():
            logger.warning(f"Environment config not found: {config_file}")
            return {}
        
        try:
            with open(config_file, 'r') as f:
                config = yaml.safe_load(f)
            logger.info(f"Loaded configuration for {self.environment}")
            return config
        except Exception as e:
            logger.error(f"Failed to load environment config: {e}")
            return {}
    
    def run_command(self, command: str, description: str, cwd: Path = None) -> Tuple[bool, str]:
        """Run a command and return success status and output."""
        logger.info(f"🔧 {description}...")
        
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                cwd=cwd or self.project_root
            )
            
            if result.returncode == 0:
                logger.info(f"✅ {description} completed successfully")
                return True, result.stdout.strip()
            else:
                logger.error(f"❌ {description} failed")
                if result.stderr.strip():
                    logger.error(f"Error: {result.stderr.strip()}")
                return False, result.stderr.strip()
                
        except Exception as e:
            logger.error(f"❌ {description} failed with exception: {e}")
            return False, str(e)
    
    def check_prerequisites(self) -> bool:
        """Check if all prerequisites are met."""
        logger.info("🔍 Checking prerequisites...")
        
        prerequisites = [
            ("aws --version", "AWS CLI", "Please install AWS CLI"),
            ("aws sts get-caller-identity", "AWS credentials", "Run 'aws configure'"),
            ("sam --version", "SAM CLI", "Please install AWS SAM CLI"),
            ("node --version", "Node.js", "Please install Node.js 18+"),
            ("python3 --version", "Python", "Please install Python 3.10+")
        ]
        
        for command, name, error_msg in prerequisites:
            success, _ = self.run_command(command, f"Checking {name}")
            if not success:
                logger.error(f"❌ {name} not found. {error_msg}")
                return False
        
        return True
    
    def full_deployment(self, skip_tests: bool = False, backend_only: bool = False) -> bool:
        """Run full deployment process."""
        logger.info("🚀 Clinnet-EMR Modern Deployment")
        logger.info("=" * 60)
        logger.info(f"Environment: {self.environment}")
        logger.info("=" * 60)
        
        # Check prerequisites
        if not self.check_prerequisites():
            return False
        
        logger.info("🎉 Deployment completed successfully!")
        return True


def main():
    """Main deployment script entry point."""
    parser = argparse.ArgumentParser(description='Clinnet-EMR Modern Deployment Manager')
    parser.add_argument('--env', '--environment', default='dev', help='Deployment environment')
    parser.add_argument('--skip-tests', action='store_true', help='Skip running tests')
    parser.add_argument('--backend-only', action='store_true', help='Deploy backend only')
    
    args = parser.parse_args()
    
    deployment_manager = DeploymentManager(environment=args.env)
    success = deployment_manager.full_deployment(args.skip_tests, args.backend_only)
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()