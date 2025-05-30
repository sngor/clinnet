# Clinnet-EMR Backend

This guide covers backend-specific setup, deployment, and troubleshooting. For full-stack deployment, see `../docs/deployment.md`.

---

## Quickstart

1. **Python Version**: Use Python 3.10+
2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```
3. **Run End-to-End Tests**
   ```bash
   source test_env/bin/activate
   python test_end_to_end.py
   ```
4. **Deploy**
   ```bash
   sam build
   sam validate
   sam deploy
   ```

---

## Environment Setup

- Configure AWS credentials with `aws configure` (IAM user with Lambda, S3, DynamoDB, and API Gateway permissions)
- Use a Python virtual environment: `python -m venv test_env && source test_env/bin/activate`

---

## Key Scripts

- `deploy_validation.py` — Automated deployment and validation (recommended)
- `quick_deploy.sh` — Quick deploy script
- `scripts/seed_data.sh` — Seed DynamoDB with test data

---

## Troubleshooting

- See `../docs/troubleshooting.md` for common issues
- For Lambda or S3 errors, check CloudWatch logs
- For deployment issues, use `sam logs` and check IAM permissions

---

For full project documentation, see the `../docs/` folder.
