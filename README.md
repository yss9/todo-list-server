graph TD
    subgraph "User Interaction"
        U["👤<br>User"]
    end

    subgraph "AWS Global Infrastructure"
        R53("🌐<br>Route 53")
    end
    
    U -- DNS Query --> R53

    subgraph "Frontend Layer (CDN)"
        CF("⚡️<br>CloudFront")
        S3["📦<br>S3 Bucket<br>(React Build Files)"]
        ACF["🔒<br>ACM Certificate<br>(us-east-1)"]
    end

    R53 -- "A Record (Alias)<br>www.bluememories.shop" --> CF
    CF -- Origin Access --> S3
    CF -- Uses --> ACF

    subgraph "Backend Layer (VPC)"
        ALB("🚦<br>Application<br>Load Balancer")
        AALB["🔒<br>ACM Certificate<br>(ap-northeast-2)"]
        
        subgraph "Private Subnet"
            EC2["💻<br>EC2 Instance"]
            Docker["🐳<br>Docker Container<br>(Node.js Server)"]
            RDS["🗄️<br>RDS Database<br>(PostgreSQL)"]
        end
    end

    R53 -- "A Record (Alias)<br>api.bluememories.shop" --> ALB
    ALB -- Uses --> AALB
    ALB -- "HTTPS (443)" --> EC2_SG["SG: ec2-sg"]
    EC2_SG -- "HTTP (80)" --> EC2
    EC2 -- "Port 5432" --> RDS_SG["SG: rds-sg"]
    RDS_SG -- "PostgreSQL" --> RDS
    
    subgraph "CI/CD Pipeline"
        Dev["👨‍💻<br>Developer"]
        GH("🐙<br>GitHub")
        GHA("🚀<br>GitHub Actions")
    end

    Dev -- git push --> GH
    GH -- Triggers --> GHA
    GHA -- Deploy Frontend --> S3
    GHA -- Deploy Backend --> EC2
