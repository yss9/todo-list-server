```mermaid
graph TD
    %% ---------------------
    %% User Interaction
    %% ---------------------
    U["👤<br>User"]

    %% ---------------------
    %% AWS Global Infrastructure
    %% ---------------------
    R53["🌐<br>Route 53"]

    U -- DNS Query --> R53

    %% ---------------------
    %% Frontend Layer (CDN)
    %% ---------------------
    CF["⚡️<br>CloudFront"]
    S3["📦<br>S3 Bucket<br>(React Build Files)"]
    ACF["🔒<br>ACM Certificate<br>(us-east-1)"]

    R53 -- "A Record (Alias)<br>www.bluememories.shop" --> CF
    CF -- Origin Access --> S3
    CF -- Uses --> ACF

    %% ---------------------
    %% Backend Layer (VPC)
    %% ---------------------
    ALB["🚦<br>Application<br>Load Balancer"]
    AALB["🔒<br>ACM Certificate<br>(ap-northeast-2)"]

    EC2["💻<br>EC2 Instance"]
    Docker["🐳<br>Docker Container<br>(Node.js Server)"]
    RDS["🗄️<br>RDS Database<br>(PostgreSQL)"]

    R53 -- "A Record (Alias)<br>api.bluememories.shop" --> ALB
    ALB -- Uses --> AALB
    ALB -- "HTTPS (443)" --> EC2SG["SG: ec2-sg"]
    EC2SG -- "HTTP (80)" --> EC2
    EC2 -- "Port 5432" --> RDSSG["SG: rds-sg"]
    RDSSG -- "PostgreSQL" --> RDS

    %% ---------------------
    %% CI/CD Pipeline
    %% ---------------------
    Dev["👨‍💻<br>Developer"]
    GH["🐙<br>GitHub"]
    GHA["🚀<br>GitHub Actions"]

    Dev -- git push --> GH
    GH -- Triggers --> GHA
    GHA -- Deploy Frontend --> S3
    GHA -- Deploy Backend --> EC2

    %% ---------------------
    %% Class Definitions (스타일링)
    %% ---------------------
    classDef user fill:#D5E8D4,stroke:#82B366,stroke-width:2px,color:#000;
    classDef infra fill:#DAE8FC,stroke:#6C8EBF,stroke-width:2px,color:#000;
    classDef resource fill:#F8CECC,stroke:#B85450,stroke-width:2px,color:#000;
    classDef ci fill:#E1D5E7,stroke:#9673A6,stroke-width:2px,color:#000;
    classDef cert fill:#FFF2CC,stroke:#D6B656,stroke-width:2px,color:#000;

    %% ---------------------
    %% Class 적용
    %% ---------------------
    class U,Dev user;
    class R53,CF,ALB infra;
    class S3,EC2,Docker,RDS resource;
    class GH,GHA ci;
    class ACF,AALB cert;
