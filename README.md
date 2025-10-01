```mermaid
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
    ALB -- "HTTPS (443)" --> EC2SG["SG: ec2-sg"]
    EC2SG -- "HTTP (80)" --> EC2
    EC2 -- "Port 5432" --> RDSSG["SG: rds-sg"]
    RDSSG -- "PostgreSQL" --> RDS
    
    subgraph "CI/CD Pipeline"
        Dev["👨‍💻<br>Developer"]
        GH("🐙<br>GitHub")
        GHA("🚀<br>GitHub Actions")
    end

    Dev -- git push --> GH
    GH -- Triggers --> GHA
    GHA -- Deploy Frontend --> S3
    GHA -- Deploy Backend --> EC2

    %% --- Class Definitions ---
    classDef default fill:#fff,stroke:#333,stroke-width:2px;

    %% 사용자/개발자
    class U fill:#D5E8D4,stroke:#82B366;
    class Dev fill:#D5E8D4,stroke:#82B366;

    %% 글로벌 인프라 & 로드밸런서
    class R53 fill:#DAE8FC,stroke:#6C8EBF;
    class CF fill:#DAE8FC,stroke:#6C8EBF;
    class ALB fill:#DAE8FC,stroke:#6C8EBF;

    %% 리소스 (S3, RDS, EC2, Docker)
    class S3 fill:#F8CECC,stroke:#B85450;
    class RDS fill:#F8CECC,stroke:#B85450;
    class EC2 fill:#F8CECC,stroke:#B85450;
    class Docker fill:#F8CECC,stroke:#B85450;

    %% GitHub, GitHub Actions
    class GH fill:#E1D5E7,stroke:#9673A6;
    class GHA fill:#E1D5E7,stroke:#9673A6;

    %% 인증서
    class ACF fill:#FFF2CC,stroke:#D6B656;
    class AALB fill:#FFF2CC,stroke:#D6B656;
