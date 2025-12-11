# Quick Start: Get Protected in 30 Minutes

**For those who want immediate protection before diving into detailed modules.**

This guide gets you basic Zero Trust protection as fast as possible.

---

## Checklist Overview

| Step | Time | Protection |
|------|------|------------|
| 1. Create Zero Trust org | 5 min | Account ready |
| 2. Install WARP client | 5 min | Device connected |
| 3. Block security threats (DNS) | 5 min | Malware/phishing blocked |
| 4. Block security threats (HTTP) | 5 min | Web threats blocked |
| 5. Enable AV scanning | 5 min | File protection |
| 6. Review logs | 5 min | Visibility |

**Total: 30 minutes to basic protection**

---

## Step 1: Create Zero Trust Organization (5 min)

### 1.1 Sign Up

1. Go to https://dash.cloudflare.com/sign-up
2. Create account with email and password
3. Verify your email

### 1.2 Set Up Zero Trust

1. Go to https://one.dash.cloudflare.com/
2. Choose a **team name** (e.g., `mycompany`)
3. Select **Zero Trust Free** plan
4. Complete setup

**Done!** Your Zero Trust organization is ready.

---

## Step 2: Install WARP Client (5 min)

### 2.1 Download

Go to: https://one.one.one.one/

Or direct links:
- **Windows:** https://install.appcenter.ms/orgs/cloudflare/apps/1.1.1.1-windows-1/distribution_groups/release
- **macOS:** https://install.appcenter.ms/orgs/cloudflare/apps/1.1.1.1-macos-1/distribution_groups/release

### 2.2 Install & Connect

1. Install the downloaded file
2. Open WARP client
3. Click **Settings** (gear icon)
4. Go to **Account**
5. Click **Login to Cloudflare Zero Trust**
6. Enter your **team name**
7. Authenticate with your email

**Done!** Your device is now connected to Zero Trust.

---

## Step 3: Block Security Threats - DNS (5 min)

### 3.1 Create DNS Policy

1. Go to https://one.dash.cloudflare.com/
2. Click **Traffic Policies**
3. Select **DNS** tab
4. Click **Add a policy**

### 3.2 Configure Policy

- **Name:** `Block All Security Threats`
- **Traffic:** 
  - Selector: `Security Categories`
  - Operator: `in`
  - Value: `All security risks`
- **Action:** `Block`

5. Click **Create policy**

**Done!** Malware, phishing, and other threats are now blocked at DNS level.

---

## Step 4: Block Security Threats - HTTP (5 min)

### 4.1 Enable TLS Inspection

1. Go to **Settings** > **Network**
2. Turn on **Proxy**
3. Turn on **TLS decryption**

> **Note:** For full TLS inspection, install the root certificate (see Module 01).

### 4.2 Create HTTP Policy

1. Go to **Traffic Policies**
2. Select **HTTP** tab
3. Click **Add a policy**

### 4.3 Configure Policy

- **Name:** `Block Security Threats - HTTP`
- **Traffic:**
  - Selector: `Security Risks`
  - Operator: `in`
  - Value: `All security risks`
- **Action:** `Block`

4. Click **Create policy**

**Done!** Web-based threats are now blocked at HTTP level.

---

## Step 5: Enable Anti-Virus Scanning (5 min)

### 5.1 Turn On AV Scanning

1. Go to **Settings** > **Network**
2. Find **Anti-virus scanning** section
3. Turn on **Scan files for malware**
4. Enable both:
   - Scan uploads
   - Scan downloads

**Done!** Files are now scanned for malware in real-time.

---

## Step 6: Review Logs (5 min)

### 6.1 Check DNS Logs

1. Go to **Insights** > **Logs** > **Gateway** > **DNS**
2. Review recent queries
3. Look for blocked requests (red)

### 6.2 Check HTTP Logs

1. Go to **Insights** > **Logs** > **Gateway** > **HTTP**
2. Review recent requests
3. Look for blocked requests

### 6.3 Verify Protection

You should see:
- Your device's DNS queries
- Blocked security threats (if any encountered)
- Traffic flowing through Gateway

**Done!** You now have visibility into your traffic.

---

## What You Now Have

| Protection | Status |
|------------|--------|
| DNS filtering | Active - blocking malicious domains |
| HTTP filtering | Active - blocking web threats |
| Anti-virus | Active - scanning files |
| Logging | Active - full visibility |

---

## Immediate Next Steps

### Today
- [ ] Install root certificate for full TLS inspection (Module 01, Step 8)
- [ ] Test by visiting http://malware.testcategory.com (should be blocked)

### This Week
- [ ] Roll out WARP to more devices
- [ ] Complete Module 02 for content filtering
- [ ] Complete Module 05 for DLP

### This Month
- [ ] Complete all modules
- [ ] Integrate identity provider
- [ ] Set up ZTNA for private apps

---

## Test Your Protection

### Test DNS Blocking

Try visiting:
```
http://malware.testcategory.com
```
Should be blocked.

### Test AV Scanning

1. Download EICAR test file from https://www.eicar.org/
2. Should be blocked by AV scanning

---

## Troubleshooting

### "WARP won't connect"
- Check internet connection
- Verify team name is correct
- Restart WARP client

### "Sites not being blocked"
- Verify WARP is connected (check status)
- Wait 60 seconds for policy propagation
- Check logs to see if traffic is flowing through Gateway

### "Need help"
- Community: https://community.cloudflare.com
- Docs: https://developers.cloudflare.com/cloudflare-one/

---

## Continue Learning

Now that you have basic protection, continue with the full workshop:

1. [Module 01: Prerequisites & Setup](./01-prerequisites.md) - Complete setup
2. [Module 02: DNS Filtering](./02-dns-filtering.md) - Advanced DNS policies
3. [Module 03: Secure Web Gateway](./03-secure-web-gateway.md) - HTTP policies
4. [Module 04: Anti-Virus](./04-antivirus-scanning.md) - File scanning
5. [Module 05: DLP](./05-dlp.md) - Data protection
6. [Module 06: Device Posture](./06-device-posture.md) - Device security
7. [Module 07: ZTNA](./07-ztna.md) - Private app access
8. [Module 08: Logs & Analytics](./08-logs-analytics.md) - Monitoring
9. [Module 09: Summary](./09-workshop-summary.md) - Review & next steps

**Optional:**
- [Module 11: CASB](./11-casb-optional.md) - SaaS security (requires integration)
