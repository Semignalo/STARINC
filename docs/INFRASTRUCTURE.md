# SDP-V2 Infrastructure & Deployment Guide

**Status:** Phase 3.1 — Infrastructure Planning  
**Last Updated:** 2026-04-20

---

## 📋 Executive Summary

SDP-V2 is a full-stack e-commerce and MLM platform requiring a reliable, scalable infrastructure. This document outlines hosting options, server requirements, and deployment architecture for production.

### Key Requirements
- **Uptime:** 99.5% SLA (high availability)
- **Scalability:** Handle growing orders, users, and email queue
- **Security:** SSL/TLS, firewall, database encryption
- **Backup:** Daily automated backups with 7-day retention
- **Monitoring:** Error tracking, uptime monitoring, performance metrics

---

## 🏢 Hosting Options Analysis

### Option A: VPS (DigitalOcean / Vultr / Linode) — RECOMMENDED

**Best For:** Full control, cost efficiency, predictable monthly costs

#### **Recommended: DigitalOcean**

**Why DigitalOcean:**
- ✅ Excellent documentation and Laravel support
- ✅ Affordable ($5-15/month starter droplets)
- ✅ Simple scaling (vertical + horizontal)
- ✅ Built-in backups, monitoring, firewalls
- ✅ Object storage (Spaces) for file uploads
- ✅ Managed databases available (PostgreSQL/MySQL)
- ✅ Large developer community

**Server Specification:**
```
Basic Setup:
  • Droplet: $12/month (2 GB RAM, 2 vCPU, 60 GB SSD)
  • Database: $15/month (Managed MySQL 8.0, 1 GB RAM)
  • Storage: $5/month (DigitalOcean Spaces, 250 GB included)
  ─────────────────────────────
  Total: ~$32/month (scalable)

Production-Ready Upgrade:
  • Droplet: $24/month (4 GB RAM, 2 vCPU, 80 GB SSD)
  • Database: $30/month (Managed MySQL 8.0, 2 GB RAM)
  • Storage: $5/month (DigitalOcean Spaces)
  ─────────────────────────────
  Total: ~$59/month
```

**Architecture:**
```
┌─────────────────────────────────────────────────┐
│         Internet / CDN (CloudFlare)             │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────▼─────────┐
        │  DigitalOcean    │
        │   Firewall       │
        └────────┬─────────┘
                 │
    ┌────────────▼────────────────┐
    │  App Server (Nginx+PHP-FPM) │
    │  - Laravel 13               │
    │  - Queue Worker (Supervisor)│
    │  - 2GB RAM / 2 vCPU         │
    └────────────┬────────────────┘
                 │
    ┌────────────▼────────────────┐
    │  Managed MySQL 8.0          │
    │  - Automated backups        │
    │  - Daily snapshots          │
    │  - 2 GB RAM                 │
    └─────────────────────────────┘

    ┌─────────────────────────────┐
    │  DigitalOcean Spaces (S3)   │
    │  - Payment proofs           │
    │  - Product images           │
    │  - 250 GB included          │
    └─────────────────────────────┘
```

**Pros:**
- Simple deployment with `ssh` access
- Complete control over server
- Cost-effective for small-medium projects
- Built-in monitoring and backups
- Easy to add secondary servers

**Cons:**
- Manual security updates required
- Queue worker management (Supervisor)
- Database backups + replication setup needed
- Monitoring setup (Sentry, UptimeRobot)

**Setup Cost:** ~$50-100 (first-time)
**Monthly Cost:** $32-59
**Estimated Setup Time:** 4-6 hours

---

### Option B: PaaS (Railway / Heroku / Render) — ALTERNATIVE

**Best For:** Quick deployment, minimal ops, auto-scaling

#### **Recommended: Railway**

**Why Railway:**
- ✅ Git-based deployment (push to deploy)
- ✅ Managed PostgreSQL/MySQL
- ✅ Auto-scaling & load balancing
- ✅ Zero downtime deployments
- ✅ Built-in monitoring & logs
- ✅ Generous free tier ($5/month credits)

**Server Specification:**
```
Starter Tier:
  • App Service: $5/month (0.5 GB RAM, auto-scale)
  • MySQL: $10/month (managed, backups)
  • Storage (S3): $5/month (file uploads)
  ─────────────────────────────
  Total: ~$20/month (+ overage)

Production Tier:
  • App Service: $15/month (1 GB RAM, guaranteed)
  • MySQL: $30/month (managed, HA)
  • Storage (S3): $10/month
  ─────────────────────────────
  Total: ~$55/month
```

**Architecture:**
```
┌──────────────────────────────┐
│    GitHub (Code)             │
└────────────┬─────────────────┘
             │
    ┌────────▼────────┐
    │    Railway.app  │
    │  (Auto Deploy)  │
    └────────┬────────┘
             │
    ┌────────▼────────────────┐
    │  Load Balancer          │
    │  (Auto-scale)           │
    └────────┬────────────────┘
             │
    ┌────────▼────────────────┐
    │  Multiple App Instances │
    │  (Auto-scaled)          │
    └────────┬────────────────┘
             │
    ┌────────▼────────────────┐
    │  Managed MySQL          │
    │  - High availability    │
    │  - Auto backups         │
    └─────────────────────────┘

    ┌─────────────────────────┐
    │  AWS S3 (File storage)  │
    │  - Replicated           │
    │  - CDN enabled          │
    └─────────────────────────┘
```

**Pros:**
- Zero-ops database/backups
- Auto-scaling (handles traffic spikes)
- Git push to deploy (no SSH needed)
- Built-in observability
- Perfect for startups

**Cons:**
- Higher cost at scale ($100+/month)
- Less control over infrastructure
- Vendor lock-in
- Limited customization

**Setup Cost:** ~$20-50
**Monthly Cost:** $20-55
**Estimated Setup Time:** 1-2 hours

---

### Option C: AWS (Elastic Beanstalk / RDS) — ENTERPRISE

**Best For:** Large scale, complex requirements, enterprise support

**Why AWS:**
- ✅ Global infrastructure (99.99% uptime)
- ✅ Elastic Beanstalk handles deployment
- ✅ RDS for managed MySQL
- ✅ S3 for file storage
- ✅ CloudFront CDN included
- ✅ Auto-scaling groups

**Server Specification:**
```
Starter:
  • EC2: $15/month (t3.micro)
  • RDS MySQL: $30/month
  • S3: $5/month (first 1GB free)
  • Data transfer: ~$5/month
  ─────────────────────────────
  Total: ~$55/month

Production:
  • EC2: $50/month (t3.small + load balancer)
  • RDS MySQL: $100/month (Multi-AZ)
  • S3: $20/month
  • Data transfer: ~$20/month
  ─────────────────────────────
  Total: ~$190/month
```

**Pros:**
- Highest reliability (99.99% SLA)
- Auto-scaling out-of-box
- Global CDN (CloudFront)
- Enterprise support available
- Can grow to massive scale

**Cons:**
- Higher cost ($50-200+/month)
- Steeper learning curve
- Complex console
- Overkill for MVP/early stage

**Setup Cost:** ~$100-200
**Monthly Cost:** $55-190
**Estimated Setup Time:** 6-8 hours

---

## 🎯 FINAL RECOMMENDATION: DigitalOcean VPS

**Decision:** Deploy on DigitalOcean for optimal balance of cost, control, and simplicity.

### Reasoning:
1. **Cost:** $32-59/month is affordable for SDP-V2 stage
2. **Control:** Full SSH access for customization
3. **Scalability:** Easy to upgrade droplet size or add replicas
4. **Community:** Large Laravel/PHP community on DigitalOcean
5. **Documentation:** Excellent DigitalOcean + Laravel guides available
6. **Operational:** Simple setup without vendor lock-in

### When to Consider Alternatives:
- **Choose Railway** if you want zero-ops (auto-scaling, no server management)
- **Choose AWS** if targeting enterprise clients with SLA requirements

---

## 📊 Cost Comparison

| Aspect | DigitalOcean | Railway | AWS |
|--------|--------------|---------|-----|
| **Monthly Cost** | $32-59 | $20-55 | $55-190 |
| **Setup Time** | 4-6 hrs | 1-2 hrs | 6-8 hrs |
| **Ops Overhead** | High | Low | Medium |
| **Scalability** | Good | Excellent | Excellent |
| **Control** | Full | Limited | Full |
| **Best For** | Startups | Quick Launch | Enterprise |

---

## 🔧 Production Server Requirements

### CPU & Memory
```
Minimum (low traffic):
  • CPU: 1 vCPU
  • RAM: 1 GB
  • Storage: 30 GB SSD
  • Handles: ~100 concurrent users

Recommended (moderate traffic):
  • CPU: 2 vCPU
  • RAM: 2 GB
  • Storage: 60 GB SSD
  • Handles: ~500 concurrent users

High Performance (high traffic):
  • CPU: 4 vCPU
  • RAM: 4-8 GB
  • Storage: 100 GB SSD
  • Handles: ~2000+ concurrent users
```

### Database Requirements
```
MySQL 8.0 Minimum:
  • RAM: 512 MB - 1 GB
  • Storage: 20 GB (scalable)
  • Connections: 100-150 max
  • Backups: Daily automated
  • Replication: Optional (HA)

For SDP-V2 Estimated Usage:
  • Initial: 1-5 GB storage
  • After 1 year: 5-20 GB storage
  • Peak connections: 50-100
```

### Storage Requirements
```
S3/Object Storage (DigitalOcean Spaces):
  • Payment proofs: ~1 MB each
  • Product images: ~500 KB each
  • Estimated: 250 GB included tier sufficient
  • Redundancy: Automatic (3+ replicas)
  • CDN: Optional CloudFlare integration
```

---

## 🚀 DigitalOcean Deployment Architecture

### Phase 1: Basic Setup ($32/month)
```
Components:
  ✅ App Server (Droplet): 2GB RAM, 2 vCPU, 60GB SSD
  ✅ Managed MySQL: 1GB RAM, daily backups
  ✅ DigitalOcean Spaces: 250GB (for files)
  ✅ CloudFlare DNS: Free (SSL + CDN)
  ✅ Email: Mailtrap (free tier) or SendGrid

Workflow:
  1. Create DigitalOcean account
  2. Create Droplet (Ubuntu 22.04 LTS)
  3. Create Managed MySQL database
  4. Create Spaces bucket for file storage
  5. SSH into droplet, install: PHP 8.3, Nginx, Composer, Node.js
  6. Clone repository, setup Laravel (.env)
  7. Run migrations
  8. Configure Supervisor for queue worker
  9. Setup Let's Encrypt SSL with Certbot
  10. Configure Nginx reverse proxy
  11. Setup cron jobs (tier downgrades)
```

### Phase 2: HA Setup ($70-90/month) — Optional
```
Additional Components:
  • Secondary Droplet (read replica + failover)
  • Load Balancer (distribute traffic)
  • MySQL Replication (primary-replica)
  • Redis Cache (optional)
  
Benefits:
  • Zero downtime deployments
  • Automatic failover
  • Better performance (caching)
```

---

## 🔐 Security Checklist

```
Infrastructure Security:
  □ Firewall enabled (only 22, 80, 443)
  □ SSH key-based auth (no passwords)
  □ Fail2ban installed (brute force protection)
  □ Automatic security updates enabled
  □ Swap configured (2GB)
  □ Monitoring alerts setup

Application Security:
  □ APP_DEBUG=false
  □ APP_ENV=production
  □ APP_KEY properly set
  □ Database password strong (32+ chars)
  □ .env not accessible publicly

Database Security:
  □ Strong root password
  □ Limited user permissions
  □ Backups encrypted
  □ Binlog enabled (point-in-time recovery)
  □ SSL connections enforced

Network Security:
  □ CORS whitelist frontend domain only
  □ Rate limiting enabled on all endpoints
  □ DDoS protection (CloudFlare)
  □ HTTPS enforced (HSTS headers)
```

---

## 📈 Scaling Strategy

### Stage 1: MVP (0-1000 users)
```
Current recommendation (DigitalOcean Basic):
  • Single $12/month droplet (sufficient)
  • Managed MySQL $15/month
  • Monitoring + alerts only
```

### Stage 2: Growth (1000-10000 users)
```
Recommended upgrades:
  • Upgrade droplet to $24/month (4GB RAM)
  • Add Redis cache ($10/month)
  • Enable MySQL replication
  • Add CDN caching (CloudFlare)
```

### Stage 3: Scale (10000+ users)
```
Load balancing setup:
  • Multiple app servers (round-robin)
  • Dedicated database server
  • Redis cluster for cache
  • S3-compatible storage
  • Consider Kubernetes if needed
```

---

## 📋 Environment Variables (Production)

```bash
# App Configuration
APP_NAME="STARINC Platform"
APP_ENV=production
APP_KEY=base64:xxxxx
APP_DEBUG=false
APP_URL=https://sdp-v2.com
APP_FRONTEND_URL=https://sdp-v2.com
QUEUE_CONNECTION=database

# Database
DB_CONNECTION=mysql
DB_HOST=xxx-mysql-xxx.ondigitalocean.com
DB_PORT=25060
DB_DATABASE=sdp_production
DB_USERNAME=sdp_user
DB_PASSWORD=<strong-password>

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=<sendgrid-api-key>
MAIL_FROM_ADDRESS=noreply@starinc.com
MAIL_FROM_NAME="STARINC Platform"

# File Storage
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=<do-spaces-key>
AWS_SECRET_ACCESS_KEY=<do-spaces-secret>
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=sdp-production
AWS_ENDPOINT=https://sdp-production.nyc3.digitaloceanspaces.com
AWS_USE_PATH_STYLE_URLS=false

# Monitoring & Security
SENTRY_LARAVEL_DSN=https://xxxxx@sentry.io/xxxxx
LOG_CHANNEL=stack
LOG_LEVEL=notice

# Payment
PAYMENT_BANK_NAME="BCA"
PAYMENT_ACCOUNT_NUMBER="XXXXXXX"
PAYMENT_ACCOUNT_NAME="PT STARINC"
```

---

## 🔄 Backup & Recovery Strategy

### Automated Backups
```
Database:
  • Frequency: Daily at 2 AM (UTC)
  • Retention: 7 days (automatic)
  • Replication: 3 geographic zones
  • Recovery Time: < 5 minutes
  
File Storage:
  • Method: S3 versioning enabled
  • Retention: 30 days (previous versions)
  • Replication: Automatic (3+ copies)
  
Application Code:
  • GitHub repository (push after each release)
  • Deployment: Pull from GitHub
```

### Disaster Recovery Plan
```
Scenario 1: Database Corruption
  1. Restore from latest backup (same-day)
  2. Run migrations if needed
  3. Verify data integrity
  4. Notify users if data loss occurred

Scenario 2: Server Failure
  1. Create new droplet from backup snapshot
  2. Attach MySQL backup
  3. Restore from application git tag
  4. Update DNS to new server
  5. Monitor for issues

Scenario 3: Data Breach
  1. Immediately disable compromised accounts
  2. Enforce password reset
  3. Review logs for unauthorized access
  4. Notify affected users
  5. Implement additional security measures
```

**Recovery Time Objective (RTO):** < 1 hour  
**Recovery Point Objective (RPO):** < 24 hours

---

## 📞 Monitoring & Alerting

### Uptime Monitoring
```
Service: UptimeRobot (free tier)
  • Monitor: GET /api/health endpoint
  • Frequency: Every 5 minutes
  • Alert: Email if down > 5 min
  • Status Page: Public https://status.sdp-v2.com
```

### Error Tracking
```
Service: Sentry (free tier)
  • Monitor: All Laravel errors
  • Alert: Slack + Email for critical errors
  • Performance: Track slow endpoints
  • Release tracking: GitHub integration
```

### Performance Monitoring
```
Service: DigitalOcean Monitoring (included)
  • CPU usage alert: > 80%
  • Memory alert: > 85%
  • Disk alert: > 90%
  • Database connections: > 80% of max
```

---

## 🚀 Next Steps (Phase 3.2-3.3)

1. **Create DigitalOcean Account** (if choosing VPS)
   - Sign up at digitalocean.com
   - Add payment method
   - Enable 2FA for security

2. **Deploy Application**
   - Create Droplet (Ubuntu 22.04 LTS)
   - Install dependencies (PHP 8.3, Nginx, MySQL client)
   - Clone repository
   - Configure environment
   - Run migrations + seed

3. **Setup Database**
   - Create Managed MySQL instance
   - Create application database & user
   - Run migrations
   - Enable daily backups

4. **Configure Storage**
   - Create DigitalOcean Spaces bucket
   - Set CORS for frontend domain
   - Configure CDN (optional)

5. **SSL & Domain**
   - Point domain DNS to droplet IP
   - Install Let's Encrypt certificate (Certbot)
   - Configure Nginx HTTPS redirect

6. **Queue & Monitoring**
   - Install Supervisor for queue worker
   - Setup cron for scheduled tasks
   - Configure Sentry for error tracking
   - Setup UptimeRobot monitoring

---

## 📚 References

- **DigitalOcean Docs:** https://docs.digitalocean.com
- **Laravel Deployment:** https://laravel.com/docs/11/deployment
- **Railway Docs:** https://docs.railway.app
- **AWS Elastic Beanstalk:** https://docs.aws.amazon.com/elasticbeanstalk
- **Let's Encrypt:** https://letsencrypt.org
- **Sentry:** https://sentry.io
- **UptimeRobot:** https://uptimerobot.com

---

**Status:** ✅ Phase 3.1 Complete — Infrastructure planned and documented  
**Next Phase:** Phase 3.2 (VPS Setup & Deployment)
