# AWS Deployment Guide

This document details the configuration and step-by-step processes to deploy the **Internship & Placement Intelligence Platform** on Amazon Web Services (AWS) using **Amazon RDS** for PostgreSQL, **Amazon S3** for resume file storage, and **Amazon EC2** for application hosting.

---

## 1. Amazon RDS (PostgreSQL) Setup

We migrate the PostgreSQL database from a local container/local host to a managed AWS RDS instance.

### Step-by-Step Provisioning:
1. **Navigate to AWS Console**: Go to the RDS Dashboard and click **Create Database**.
2. **Choose Database Creation Method**: Select **Standard Create**.
3. **Engine Options**: Choose **PostgreSQL** (version `15.x` or `16.x` matches development best).
4. **Templates**: Select **Free Tier** (for testing/development) or **Dev/Test**.
5. **Settings**:
   - **DB Instance Identifier**: `placement-intelligence-db`
   - **Master Username**: `postgres` (or a custom master user)
   - **Password**: Set a secure master password.
6. **Instance Configuration**: Choose `db.t3.micro` or `db.t4g.micro` (eligible for Free Tier).
7. **Storage**: Allocate `20 GiB` GP3 storage (enable autoscaling if needed).
8. **Connectivity**:
   - **Virtual Private Cloud (VPC)**: Select the default VPC or your application VPC.
   - **Public Access**: Select **No** (best security practice; keep database private).
   - **VPC Security Group**: Create a new Security Group named `rds-postgres-sg`.
9. **Database Port**: Standard `5432`.
10. **Additional Configuration**: Set the **Initial database name** to `internship_platform`.
11. **Create Database**: Click **Create database** and wait for status to turn to *Available*.

### Security Group Inbound Rule Configuration:
To allow the EC2 application instance to talk to the RDS instance:
1. Open the Security Group `rds-postgres-sg` associated with your RDS database.
2. Under **Inbound Rules**, click **Edit Inbound Rules**.
3. Add a rule:
   - **Type**: `PostgreSQL` (Port `5432`)
   - **Source**: Select the security group of your EC2 instance (e.g., `ec2-web-sg`) or the EC2 private IP subnet range.
   - **Description**: `Allow inbound traffic from EC2 backend container`.
4. Save the rules.

### Production DATABASE_URL:
In your production `.env` file, configure:
```env
DATABASE_URL="postgresql://<master_username>:<master_password>@<rds_endpoint_address>:5432/internship_platform?schema=public"
```

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
DATABASE_URL="postgresql://postgres:<your_password>@<rds_endpoint>:5432/internship_platform?schema=public"
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

1. **Prisma Migrations on RDS**:
   Run the Prisma migration tool inside the backend directory to sync tables to the AWS RDS database instance:
   ```bash
   cd backend
   # Install dependencies locally to run migrations or use a run-once container
   npm install
   npx prisma migrate deploy
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
