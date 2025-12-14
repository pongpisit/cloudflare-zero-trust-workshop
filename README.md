# Cloudflare Zero Trust Workshop

A comprehensive hands-on workshop for implementing Cloudflare Zero Trust security features. Experience how easy it is to deploy enterprise-grade security with the world's most connected cloud platform.

## Why Cloudflare Zero Trust?

| Traditional Security | Cloudflare Zero Trust |
|---------------------|----------------------|
| Multiple vendors & consoles | **Single unified platform** |
| Complex deployment (weeks) | **Deploy in under 1 hour** |
| Traffic backhauled to data centers | **Security at 330+ edge locations** |
| Expensive licensing | **Free tier for up to 50 users** |
| Slow user experience | **Faster than direct internet** |

## Quick Start (30 minutes)

**Want protection NOW?** Start here: [Quick Start Guide](./docs/00-quick-start.md)

Get basic DNS filtering, HTTP protection, and AV scanning in 30 minutes.

---

## Workshop Overview

### Core Modules (Required)

| Module | Topic | Duration | Features |
|--------|-------|----------|----------|
| 00 | [Quick Start](./docs/00-quick-start.md) | 30 min | Immediate basic protection |
| 01 | [Prerequisites & Setup](./docs/01-prerequisites.md) | 30 min | Account setup, WARP client |
| 01a | [Understanding Rule Expressions](./docs/01a-rule-expressions.md) | 20 min | Signals, operators, lists, policy logic |
| 02 | [DNS Filtering](./docs/02-dns-filtering.md) | 45 min | DNS policies, content categories |
| 03 | [Secure Web Gateway](./docs/03-secure-web-gateway.md) | 60 min | HTTP policies, TLS inspection |
| 04 | [Anti-Virus & File Scanning](./docs/04-antivirus-scanning.md) | 30 min | Malware protection, file sandboxing |
| 05 | [Device Posture](./docs/06-device-posture.md) | 30 min | Device security, WARP settings |
| 06 | [Zero Trust Network Access](./docs/07-ztna.md) | 60 min | Cloudflare Tunnel, Access policies |
| 07 | [Browser Isolation](./docs/10-browser-isolation.md) | 45 min | Agentless ZTNA, clientless access |
| 08 | [Logs & Analytics](./docs/08-logs-analytics.md) | 30 min | Monitoring, alerts, 8 log types |
| 09 | [Workshop Summary](./docs/09-workshop-summary.md) | 15 min | Review, next steps |

**Core Duration:** ~6 hours

### Optional Modules

| Module | Topic | Duration | Requirements |
|--------|-------|----------|-------------|
| 10 | [Data Loss Prevention](./docs/05-dlp.md) | 45 min | Requires DLP license |
| 11 | [CASB](./docs/11-casb-optional.md) | 45 min | Requires SaaS API integration (Microsoft 365, Google Workspace, etc.) |

> **Note:** Optional modules require additional licensing or 3rd party integrations.

### 3rd Party Integrations (Optional)

These features require integration with external services:

| Feature | Integration | Where Used |
|---------|-------------|------------|
| **Identity Providers** | Azure AD, Okta, Google Workspace, OneLogin | Module 01 - Authentication |
| **Device Posture** | CrowdStrike, SentinelOne, Carbon Black, Tanium | Module 05 - Endpoint security checks |
| **CASB** | Microsoft 365, Google Workspace, Salesforce, Slack | Module 11 - SaaS security |
| **SIEM Export** | Splunk, Datadog, Sumo Logic, S3 | Module 08 - Log export |

## What You Will Learn

- Set up Cloudflare Zero Trust organization
- Deploy WARP client to devices
- Create DNS filtering policies to block malicious sites
- Configure Secure Web Gateway (SWG) with HTTP policies
- Enable TLS inspection for deep packet analysis
- Set up anti-virus scanning for file uploads/downloads
- Configure Zero Trust Network Access (ZTNA) for private applications
- Use Browser Isolation for agentless ZTNA (no WARP required)
- Monitor with logs, analytics, and alerts
- Enforce device posture and compliance

## Prerequisites

- Cloudflare account (free tier available)
- Windows, macOS, or Linux computer
- Administrator access to install software
- Web browser (Chrome, Firefox, or Edge recommended)

## Quick Start

1. **Create Cloudflare Account:** https://dash.cloudflare.com/sign-up
2. **Access Zero Trust Dashboard:** https://one.dash.cloudflare.com
3. **Follow the modules in order**

## Zero Trust Architecture

```
                    ┌─────────────────────────────────────────────┐
                    │           Cloudflare Zero Trust             │
                    │                                             │
┌─────────┐        │  ┌─────────┐  ┌─────────┐  ┌─────────┐     │        ┌─────────┐
│  User   │◄──────►│  │   DNS   │  │   SWG   │  │  ZTNA   │     │◄──────►│ Internet│
│ Device  │  WARP  │  │ Filter  │  │  HTTP   │  │ Access  │     │        │  & Apps │
│ (WARP)  │        │  └─────────┘  └─────────┘  └─────────┘     │        └─────────┘
└─────────┘        │       │            │            │          │
                    │       ▼            ▼            ▼          │
                    │  ┌─────────────────────────────────────┐   │
                    │  │     Security Services               │   │
                    │  │  • Anti-Virus  • DLP  • CASB        │   │
                    │  └─────────────────────────────────────┘   │
                    └─────────────────────────────────────────────┘
```

## Key Features Covered

### DNS Filtering (Module 02)
- Block malicious domains
- Content category filtering
- Safe Search enforcement
- Custom block pages

### Secure Web Gateway (Module 03)
- HTTP/HTTPS traffic inspection
- TLS decryption
- URL filtering
- Application control

### Anti-Virus & Sandbox (Module 04)
- Real-time malware scanning
- File upload/download protection
- Threat intelligence integration

### ZTNA (Module 06)
- Replace VPN with Zero Trust
- Application-level access control
- Identity-based policies
- Cloudflare Tunnel setup

## Useful Links

- **Zero Trust Dashboard:** https://one.dash.cloudflare.com
- **Documentation:** https://developers.cloudflare.com/cloudflare-one/
- **WARP Client Downloads:** https://one.one.one.one/
- **Learning Paths:** https://developers.cloudflare.com/learning-paths/

## Support

- **Community Forum:** https://community.cloudflare.com
- **Discord:** https://discord.cloudflare.com

---

## After This Workshop

By completing this workshop, your organization will have:

| Protection Layer | Status |
|-----------------|--------|
| DNS Filtering | Blocking malicious domains |
| Web Gateway | Inspecting all HTTP/HTTPS traffic |
| Anti-Virus | Scanning files in real-time |
| Browser Isolation | Agentless access to internal apps |
| ZTNA | Zero Trust access to private apps |

**All managed from a single dashboard, powered by the world's largest network.**

---

**Workshop Repository:** https://github.com/pongpisit/cloudflare-zero-trust-workshop

**Author:** Pongpisit

**Last Updated:** December 2025
