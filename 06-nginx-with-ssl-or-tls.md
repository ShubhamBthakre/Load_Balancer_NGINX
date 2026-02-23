# ERP Load Balancer Setup using NGINX (Docker) – Local Environment

## Objective
Set up an NGINX load balancer using Docker to distribute traffic across multiple instances of an ERP Backend (Node.js) using:
- Round Robin
- Weighted Round Robin  
and integrate it with ERP Frontend.

---

## Prerequisites

- Docker Desktop installed and running
- Node.js installed
- ERP Backend (Node.js)
- ERP Frontend (React or similar)

Verify Docker:
```bash
docker --version


High-Level Architecture

Frontend (Browser / React)
        |
        |  /api/*
        ↓
NGINX Load Balancer (Docker :8080)
        |
        ↓
ERP Backend Instances
- localhost:3001
- localhost:3002
- localhost:3003


Step 1: Create Load Balancer Directory
mkdir erp-loadbalancer
cd erp-loadbalancer

Step 2: Create NGINX Configuration

Create a file named nginx.conf inside erp-loadbalancer.

Round Robin Configuration (Default)
events {}

http {
    upstream erp_backend {
        server host.docker.internal:3001;
        server host.docker.internal:3002;
        server host.docker.internal:3003;
    }

    server {
        listen 80;

        location /api {
            proxy_pass http://erp_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}


host.docker.internal allows Docker containers to access services running on the host machine (Windows/Mac).

Step 3: Run NGINX Load Balancer in Docker

Run from inside erp-loadbalancer directory:

docker run --name erp-nginx `
  -p 8080:80 `
  -v ${PWD}\nginx.conf:/etc/nginx/nginx.conf `
  -d nginx


Verify container:

docker ps

Step 4: Run Multiple ERP Backend Instances

Run three instances of the same backend code on different ports.

Instance 1
PORT=3001 npm start

Instance 2
PORT=3002 npm start

Instance 3
PORT=3003 npm start


Each instance must expose identical APIs.

Step 5: Add Load Balancer Test Endpoint (Backend)

Add a dedicated endpoint to verify load balancing.

app.get("/api/lb-test", (req, res) => {
  console.log(`Request served by ERP on PORT ${process.env.PORT}`);
  res.json({
    message: "Load balancer test successful",
    port: process.env.PORT,
    time: new Date().toISOString()
  });
});


Add global request logger (recommended):

app.use((req, res, next) => {
  console.log(
    `PORT ${process.env.PORT} | ${req.method} ${req.originalUrl}`
  );
  next();
});

Step 6: Test Round Robin Load Balancing

Open browser or use curl:

http://localhost:8080/api/lb-test


Refresh multiple times.

Expected Output
{ "port": 3001 }
{ "port": 3002 }
{ "port": 3003 }


This confirms Round Robin is working.

Step 7: Weighted Round Robin (Optional)

Update nginx.conf:

upstream erp_backend {
    server host.docker.internal:3001 weight=3;
    server host.docker.internal:3002 weight=1;
    server host.docker.internal:3003 weight=1;
}


Restart NGINX:

docker restart erp-nginx


Port 3001 will receive more traffic.

Step 8: Failover Test (High Availability)

Stop one backend instance (e.g., PORT 3002)

Hit:

http://localhost:8080/api/lb-test

Result

Application still works

Requests are routed to remaining instances

No downtime

Step 9: Frontend Integration (Two Approaches)
Option A: FE Dev Server (No Build Required)

Run FE normally:

npm start


FE runs on:

http://localhost:3000


Point API calls to NGINX:

fetch("http://localhost:8080/api/lb-test");


✅ Best for learning & development
❌ Requires CORS

Option B: FE Served via NGINX (Production Style)

Build frontend:

npm run build


Copy build to NGINX container:

docker cp build erp-nginx:/usr/share/nginx/html


Update nginx.conf:

location / {
    root /usr/share/nginx/html;
    index index.html;
    try_files $uri /index.html;
}


Restart NGINX:

docker restart erp-nginx


Use relative API calls in FE:

fetch("/api/lb-test");


✅ Single domain
✅ No CORS
✅ Production-ready

Key Learnings

NGINX acts as a reverse proxy and load balancer

Round robin distributes requests evenly

Weighted round robin controls traffic distribution

Backend services must be stateless and identical

Frontend should never directly call backend ports

Load balancer ensures high availability and scalability


