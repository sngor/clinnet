# Example script (you would modify your actual build/deploy process)
aws s3 cp build/index.html s3://your-bucket-name/index.html --cache-control "max-age=0,no-cache,no-store,must-revalidate"
aws s3 cp build/ s3://your-bucket-name/ --exclude "index.html" --recursive
