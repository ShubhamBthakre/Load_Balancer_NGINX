## Communication flow in a web system







## What Was the Problem (Before NGINX)
# Direct Client → Application Access
- Client was calling the Node.js app directly
- Node js App was exposed on: Open ports (e.g., 3000, 3001),Public IP / DNS
- Every client request hit the Node js app without protection

## Problems with This Approach
- ❌ Security risk (app exposed to internet).
- ❌ No rate limiting → vulnerable to abuse/DDoS
- ❌ No TLS termination → HTTPS handling inside app
- ❌ No load balancing
- ❌ Hard to scale (clients tied to one server)
- ❌ App must handle too many responsibilities


# 📘 Section 1: Introduction to NGINX

## ✅ What is NGINX?

**NGINX** (pronounced “engine-x”) is an open-source, high-performance web server that also functions as:
- Web Server (serve static files): Serving static React/Angular apps     
- A reverse proxy :Forwarding requests to backend apps (Node.js, Python, Java)      
- Load balancer :  Distributing load between multiple backend servers          
- HTTP cache :Reducing load on upstream services 
- Mail proxy
- SSL/TLS Termination : Handling HTTPS at the edge
- Rate limiting & security enforcement : Protecting APIs from abuse or bots

- In modern systems, Nginx is rarely “just a web server” — it sits in front of applications and controls traffic.
- It is designed for high concurrency, performance, and low memory usage — making it ideal for modern DevOps and cloud environments.

## Why Nginx was created (Real Problem)?

- Earlier, Apache HTTPD was dominant.
- Problem with Apache (Traditional model):
- One thread/process per request
- High memory usage
- Poor performance under high concurrency
- Not cloud-friendly

## Nginx Solution:
- Event-driven, non-blocking architecture
- Handles 10,000+ concurrent connections with low memory
- Designed for modern internet scale
- This is why Nginx dominates cloud, microservices, Kubernetes, Docker environments.

## 📊 NGINX vs Apache (Why DevOps Prefer NGINX)

| Feature         | NGINX                          | Apache                      |
|-----------------|--------------------------------|-----------------------------|
| Architecture    | Event-driven (asynchronous)    | Process/thread-based        |
| Performance     | High concurrency, fast         | Slower with many connections|
| Memory usage    | Low                            | High                        |
| Static content  | Extremely fast                 | Good                        |
| Config format   | Simple, declarative            | More flexible but complex   |
| Use cases       | Web server, reverse proxy, LB  | Traditional web server      |

💡 **DevOps Engineers** often choose NGINX for its:
- Lightweight footprint
- Ease of automation
- Docker/Kubernetes friendliness

## How Nginx Works Internally (Very Important)
- Event-Driven Model (Key Concept)
- Instead of:One request = one thread”, Nginx does:“One worker handles thousands of requests asynchronously”

## Core Components of NGINX
- Master Process :Reads config,Manages workers
- Worker Processes :Handle all client requests,Non-blocking I/O



## 🛠️ Installing NGINX

## Step 1: Launch EC2 Instance
- Name:nginx-server , download the ppk file and connect the server by using putty

- run the fallowing commands (-y) because it will default set requires packages

```bash
sudo apt update & sudo apt upgrade -y
sudo apt install nginx -y


-TO check the Ubuntu help on VM machine weather it is running or not

```bash
sudo systemctl status nginx
```

## Step 2: Allow Inbound traffic for EC2 Instance IP Address by using security groups configurations


### 🐧 On Ubuntu/Debian
```bash
sudo apt update
sudo apt install nginx -y
```

### 📦 On RHEL/CentOS
```bash
sudo yum install epel-release -y
sudo yum install nginx -y
```

### 🐳 Using Docker (Recommended for DevOps)
```bash
docker run --name nginx -p 8080:80 -d nginx
```

Visit: `http://localhost:8080`

---

## 📁 NGINX File Structure (Linux)

| File/Directory        | Purpose                                      |
|-----------------------|----------------------------------------------|
| `/etc/nginx/nginx.conf` | Main configuration file                     |
| `/etc/nginx/sites-available/` | Stores virtual host (server block) configs |
| `/etc/nginx/sites-enabled/`   | Symlinks to active site configs         |
| `/var/www/html`       | Default web root directory                   |
| `/var/log/nginx/`     | Contains access and error logs               |

---

## 🧪 Demo: Run NGINX Using Docker

### Step 1: Run Multiple BE Instances
```bash
# Terminal 1
PORT=3001 npm start

# Terminal 2
PORT=3002 npm start

# Terminal 3
PORT=3003 npm start
```


### Step 2: Create NGINX Config for Load Balancing
-Create a project folder:
```bash
mkdir erp-loadbalancer
cd erp-loadbalancer
```

-Create a file named:
-nginx.conf

# ROUND ROBIN (Default)

-nginx.conf
events {}

http {
    upstream erp_backend {
        server host.docker.internal:3001;
        server host.docker.internal:3002;
        server host.docker.internal:3003;
    }

    server {
        listen 80;

        location / {
            proxy_pass http://erp_backend;
        }
    }
}

### Step 4:Run NGINX Load Balancer in Docker
```bash
docker run --name erp-nginx \
  -p 8080:80 \
  -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf \
  -d nginx
```
### Step 5:Verify Round Robin is Working
- Refresh multiple times — requests will rotate between ERP instances.
- Add a small log in your ERP backend:
-console.log("Served from PORT:", process.env.PORT);
-Now refresh browser → terminal logs should show:
- Served from PORT: 3001
- Served from PORT: 3002
- Served from PORT: 3003
- Served from PORT: 3001
...


### Step 6: WEIGHTED ROUND ROBIN
-Now modify nginx.conf
events {}

http {
    upstream erp_backend {
        server host.docker.internal:3001 weight=3;
        server host.docker.internal:3002 weight=1;
        server host.docker.internal:3003 weight=1;
    }

    server {
        listen 80;

        location / {
            proxy_pass http://erp_backend;
        }
    }
}


### Restart NGINX

- docker restart erp-nginx

---


