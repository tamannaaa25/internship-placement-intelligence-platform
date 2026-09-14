# AWS Deployment Guide

This document details the configuration and step-by-step processes to deploy the **Internship & Placement Intelligence Platform** on Amazon Web Services (AWS) using **MongoDB Atlas / DocumentDB** for operational data, **Amazon RDS (MySQL)** for analytical data, **Amazon S3** for resume file storage, and **Amazon EC2** for application hosting.

---

## 1. Databases Setup: MongoDB Atlas & Amazon RDS (MySQL)

### 1.1 MongoDB Atlas Setup (Operational Database)
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create an M0 Free Tier Cluster in your preferred AWS region.
3. Add a database user with read/write privileges and allow access from EC2 IP.
4. Copy the connection string:
   ```text
   MONGODB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/internship_platform?retryWrites=true&w=majority"
   ```

### 1.2 Amazon RDS (MySQL) Setup (Analytics Database)
1. **Navigate to AWS Console**: Go to the RDS Dashboard and click **Create Database**.
2. **Engine Options**: Choose **MySQL** (version `8.0` or `8.4`).
3. **Templates**: Select **Free Tier** (for testing/development).
4. **Settings**:
   - **DB Instance Identifier**: `placement-analytics-db`
   - **Master Username**: `root` (or custom admin)
   - **Password**: Set a secure master password.
5. **Database Port**: Standard `3306`.
6. **Initial Database Name**: Set to `placement_analytics`.
7. **Security Group**: Allow inbound port `3306` from the EC2 security group.

---

## 2. Amazon S3 Bucket Configuration

We utilize Amazon S3 for durable object storage to store resume PDF files.

### Step-by-Step Setup:
1. **Navigate to AWS Console**: Open the S3 Dashboard and click **Create Bucket**.
2. **General Configuration**:
   - **Bucket Name**: `placement-intelligence-resumes-<unique-suffix>` (S3 bucket names must be globally unique).
   - **AWS Region**: Select the same region as your EC2/RDS instances (e.g., `us-east-1` or `ap-south-1`).
3. **Object Ownership**: Choose **ACLs disabled (recommended)**.
4. **Block Public Access settings for this bucket**:
   - If utilizing standard direct URLs: Uncheck **Block *all* public access** and acknowledge the warning.
   - *Security Note*: Alternatively, keep all public access blocked and implement AWS CloudFront or signed S3 URLs. For this setup, we will configure an explicit bucket policy that allows reading from the `resumes/` folder while keeping the rest secure.
5. **Create Bucket**: Click **Create Bucket**.

### CORS Configuration:
To allow the Next.js frontend to securely access uploaded PDF links directly:
1. Click on the created bucket name, navigate to the **Permissions** tab.
2. Scroll to **Cross-origin resource sharing (CORS)** and click **Edit**.
3. Paste the following configuration:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```
4. Save changes.

### Bucket Policy:
To allow public read access to uploaded resumes specifically inside the `resumes/` prefix:
1. Go to the **Permissions** tab of the bucket.
2. Under **Bucket policy**, click **Edit** and paste:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::<your-bucket-name>/resumes/*"
    }
  ]
}
```
*Make sure to replace `<your-bucket-name>` with your actual S3 bucket name.*

### IAM User Credentials Setup:
1. Open the **IAM Dashboard**.
2. Click **Users** -> **Create User** named `s3-uploader-service`.
3. Select **Attach policies directly** and attach a custom policy or the built-in policy `AmazonS3FullAccess` (or lock down to only allow `s3:PutObject` on `arn:aws:s3:::<your-bucket-name>/*`).
4. Complete creation, click on the user, navigate to **Security credentials**, and click **Create access key**.
5. Select **Application running outside AWS**, click Next, and obtain:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

---

## 3. Amazon EC2 Deployment Guide

We host the Next.js frontend and Express backend containers on an EC2 virtual machine instance.

### Instance Provisioning:
1. Go to EC2 Dashboard and click **Launch Instance**.
2. **Name**: `placement-intelligence-app`.
3. **Application and OS Image**: Select **Ubuntu Server 22.04 LTS**.
4. **Instance Type**: Select `t3.medium` (recommended minimum for building Next.js apps) or `t2.medium`.
5. **Key Pair**: Create or choose an existing key pair (`.pem` file) to SSH into the instance.
6. **Network Settings**:
   - Create a Security Group named `ec2-web-sg`.
   - Allow **SSH traffic** from your IP address.
   - Allow **HTTP traffic (port 80)** and **HTTPS traffic (port 443)** from Anywhere.
   - Allow custom TCP traffic on **port 5001** (if testing backend REST API directly).
7. Launch the instance.

### Server Provisioning Steps (SSH):
Once the instance is active, connect to it using your terminal:
```bash
ssh -i /path/to/key.pem ubuntu@<ec2-public-ip-address>
```

Update packages and install Docker + Git:
```bash
# Update package catalog
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker dependencies
sudo apt-get install -y ca-certificates curl gnupg lsb-release git

# Add Docker’s official GPG key
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine and Docker Compose V2
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Allow running docker commands without sudo
sudo usermod -aG docker ubuntu
```
*Note: Exit the terminal and log back in for docker group updates to take effect.*

---

## 4. Production Build & Deployment

### Clone the Repository:
```bash
git clone https://github.com/tamannaaa25/internship-placement-intelligence-platform.git
cd internship-placement-intelligence-platform
```

### Production Environment Variables Configuration:
Create backend and frontend environment files:

#### Backend Config (`backend/.env`):
```env
PORT=5001
NODE_ENV=production
MONGODB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/internship_platform?retryWrites=true&w=majority"
MYSQL_HOST="<rds_mysql_endpoint>"
MYSQL_USER="root"
MYSQL_PASSWORD="<your_password>"
MYSQL_DATABASE="placement_analytics"
MYSQL_PORT=3306
JWT_SECRET="<generate-random-secret>"
JWT_EXPIRES_IN=7d

# Google Gemini API configurations
GEMINI_API_KEY="<your-gemini-api-key>"

# AWS S3 Storage configurations
AWS_REGION="<your-aws-region>"
AWS_ACCESS_KEY_ID="<your-access-key>"
AWS_SECRET_ACCESS_KEY="<your-secret-key>"
AWS_S3_BUCKET="<your-s3-bucket-name>"
```

#### Frontend Config (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL="http://<ec2-public-ip-address>:5001/api/v1"
```

### Deploying the Stack:
Using docker compose, spin up the database migrations, backend and frontend services:

1. **MySQL Analytics Initialization on RDS**:
   Run the automated database setup script to create and seed the analytics tables:
   ```bash
   cd backend
   npm run db:mysql:setup
   cd ..
   ```

2. **Docker Build & Run**:
   Start the docker-compose services in the background:
   ```bash
   docker compose up -d --build
   ```

3. **Verify Deployment**:
   Check currently running containers:
   ```bash
   docker compose ps
   ```

   View system logs to check for runtime database connections or API start issues:
   ```bash
   docker compose logs -f
   ```
