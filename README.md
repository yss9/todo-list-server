```mermaid
graph TD
    subgraph "User Interaction"
        U["👤\nUser"]
    end

    subgraph "AWS Global Infrastructure"
        R53["🌐\nRoute 53"]
    end
    
    U -- DNS Query --> R53

    subgraph "Frontend Layer (CDN)"
        CF["⚡️\nCloudFront"]
        S3["📦\nS3 Bucket\n(React Build Files)"]
        ACF["🔒\nACM Certificate\n(us-east-1)"]
    end

    R53 -- "A Record (Alias)\nwww.bluememories.shop" --> CF
    CF -- Origin Access --> S3
    CF -- Uses --> ACF

    subgraph "Backend Layer (VPC)"
        ALB["🚦\nApplication\nLoad Balancer"]
        AALB["🔒\nACM Certificate\n(ap-northeast-2)"]
        
        subgraph "Private Subnet"
            EC2["💻\nEC2 Instance"]
            Docker["🐳\nDocker Container\n(Node.js Server)"]
            RDS["🗄️\nRDS Database\n(PostgreSQL)"]
        end
    end

    R53 -- "A Record (Alias)\napi.bluememories.shop" --> ALB
    ALB -- Uses --> AALB
    ALB -- "HTTPS (443)" --> EC2SG["SG: ec2-sg"]
    EC2SG -- "HTTP (80)" --> EC2
    EC2 -- "Port 5432" --> RDSSG["SG: rds-sg"]
    RDSSG -- "PostgreSQL" --> RDS
    
    subgraph "CI/CD Pipeline"
        Dev["👨‍💻\nDeveloper"]
        GH["🐙\nGitHub"]
        GHA["🚀\nGitHub Actions"]
    end

    Dev -- git push --> GH
    GH -- Triggers --> GHA
    GHA -- Deploy Frontend --> S3
    GHA -- Deploy Backend --> EC2
