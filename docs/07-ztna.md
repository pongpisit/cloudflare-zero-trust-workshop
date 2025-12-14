# Module 07: Zero Trust Network Access (ZTNA)

**Duration:** 60 minutes

## What You Will Learn

- Understand ZTNA concepts and architecture
- Set up Cloudflare Tunnel for private applications
- Create Access policies for application protection
- Configure identity-based access control
- Replace VPN with Zero Trust access
- Test and troubleshoot ZTNA setup

> **📚 Rule Expressions:** New to Cloudflare policies? Start with [Module 01a: Understanding Rule Expressions](./01a-rule-expressions.md) to learn about signals, operators, and lists.

---

## How ZTNA Works

```
                                    ┌─────────────────────────────────┐
┌──────────┐                        │      Cloudflare Network         │
│  Remote  │     WARP/Browser       │                                 │
│   User   │ ──────────────────────►│  ┌─────────────────────────┐    │
└──────────┘                        │  │    Access Policies      │    │
                                    │  │                         │    │
                                    │  │  • Identity Check       │    │
                                    │  │  • Device Posture       │    │
                                    │  │  • Location Check       │    │
                                    │  │  • Time-based Rules     │    │
                                    │  └───────────┬─────────────┘    │
                                    │              │                  │
                                    │              ▼                  │
                                    │     Authenticated Request       │
                                    │              │                  │
                                    └──────────────┼──────────────────┘
                                                   │
                                    ┌──────────────┼──────────────────┐
                                    │              │                  │
                                    │              ▼                  │
                                    │  ┌─────────────────────────┐    │
                                    │  │   Cloudflare Tunnel     │    │
                                    │  │      (cloudflared)      │    │
                                    │  └───────────┬─────────────┘    │
                                    │              │                  │
                                    │              ▼                  │
                                    │  ┌─────────────────────────┐    │
                                    │  │   Private Application   │    │
                                    │  │   (Internal Network)    │    │
                                    │  └─────────────────────────┘    │
                                    │         Your Network            │
                                    └─────────────────────────────────┘
```

**ZTNA Benefits:**
- No inbound firewall rules needed
- Identity-based access (not network-based)
- Per-application access control
- No VPN client required (browser access)
- Works from anywhere

---

## Prerequisites

Before configuring ZTNA:
- Zero Trust organization set up (Module 01)
- Authentication configured (Module 01)
- Access to a private application or server

---

## Step 1: Install Cloudflare Tunnel (cloudflared)

### 1.1 Download cloudflared

**Windows:**
```cmd
winget install --id Cloudflare.cloudflared
```

Or download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/

**macOS:**
```bash
brew install cloudflared
```

**Linux (Debian/Ubuntu):**
```bash
curl -L https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-archive-keyring.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/cloudflare-archive-keyring.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/cloudflared.list
sudo apt update
sudo apt install cloudflared
```

### 1.2 Verify Installation

```cmd
cloudflared --version
```

You should see the version number.

---

## Step 2: Authenticate cloudflared

### 2.1 Login to Cloudflare

```cmd
cloudflared tunnel login
```

### 2.2 Complete Authentication

1. A browser window will open
2. Select your Cloudflare account
3. Authorize cloudflared
4. You'll see "You have successfully logged in"

### 2.3 Verify Certificate

The certificate is saved to:
- Windows: `%USERPROFILE%\.cloudflared\cert.pem`
- macOS/Linux: `~/.cloudflared/cert.pem`

---

## Step 3: Create a Tunnel

### 3.1 Create Tunnel via CLI

```cmd
cloudflared tunnel create my-tunnel
```

**Output:**
```
Tunnel credentials written to /path/to/credentials.json
Created tunnel my-tunnel with id xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Save the tunnel ID** - you'll need it later.

### 3.2 Create Tunnel via Dashboard

Alternatively, use the dashboard:

1. **Go to:** Networks > Connectors
2. Click **"Create a tunnel"**
3. Select **"Cloudflared"**
4. **Name:** `my-tunnel`
5. Click **"Save tunnel"**
6. Follow the installation instructions shown

---

## Step 4: Configure Tunnel Routes

### 4.1 Create Configuration File

Create `config.yml` in the cloudflared directory:

**Windows:** `%USERPROFILE%\.cloudflared\config.yml`
**macOS/Linux:** `~/.cloudflared/config.yml`

### 4.2 Basic Configuration

```yaml
tunnel: my-tunnel
credentials-file: /path/to/credentials.json

ingress:
  # Internal web application
  - hostname: app.yourdomain.com
    service: http://localhost:8080
  
  # Internal API
  - hostname: api.yourdomain.com
    service: http://localhost:3000
  
  # SSH access
  - hostname: ssh.yourdomain.com
    service: ssh://localhost:22
  
  # RDP access
  - hostname: rdp.yourdomain.com
    service: rdp://localhost:3389
  
  # Catch-all (required)
  - service: http_status:404
```

### 4.3 Route to Internal Network

To access multiple internal hosts:

```yaml
ingress:
  - hostname: internal.yourdomain.com
    service: http://192.168.1.100:80
  
  - hostname: server2.yourdomain.com
    service: http://192.168.1.101:80
  
  - service: http_status:404
```

---

## Step 5: Create DNS Records

### 5.1 Via CLI

```cmd
cloudflared tunnel route dns my-tunnel app.yourdomain.com
```

### 5.2 Via Dashboard

1. **Go to:** Networks > Connectors
2. Click on your tunnel
3. Go to **"Public Hostname"** tab
4. Click **"Add a public hostname"**
5. Configure:
   - **Subdomain:** app
   - **Domain:** yourdomain.com
   - **Service:** http://localhost:8080
6. Click **"Save hostname"**

---

## Step 6: Run the Tunnel

### 6.1 Run Manually (Testing)

```cmd
cloudflared tunnel run my-tunnel
```

Keep this terminal open while testing.

### 6.2 Install as Service (Production)

**Windows:**
```cmd
cloudflared service install
```

**macOS:**
```bash
sudo cloudflared service install
```

**Linux:**
```bash
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

### 6.3 Verify Tunnel Status

**Go to:** Networks > Connectors

Your tunnel should show as **"Healthy"** (green).

---

## Step 7: Create Access Application

Protect your application with Access policies.

### 7.1 Add Application

**Go to:** Access controls > Applications

1. Click **"Add an application"**
2. Select **"Self-hosted"**

### 7.2 Configure Application

**Application Configuration:**
- **Name:** Internal App
- **Session Duration:** 24 hours
- **Application domain:** app.yourdomain.com

### 7.3 Identity Providers

Select which identity providers users can authenticate with:
- One-time PIN
- Azure AD
- Google Workspace
- Okta
- etc.

Click **"Next"**

---

## Step 8: Create Access Policy

### 8.1 Add Policy

1. **Policy name:** Allow Employees
2. **Action:** Allow

### 8.2 Configure Include Rules

Define who can access:

| Selector | Operator | Value |
|----------|----------|-------|
| Emails ending in | matches | @yourcompany.com |

**Or use groups:**

| Selector | Operator | Value |
|----------|----------|-------|
| Access Groups | in | Employees |

### 8.3 Add Additional Rules (Optional)

**Require specific conditions:**

| Rule Type | Selector | Value |
|-----------|----------|-------|
| Require | Country | United States, United Kingdom |
| Require | Device Posture | Firewall enabled |

### 8.4 Save Policy

Click **"Next"** then **"Add application"**

---

## Step 9: Create Access Groups

Reusable groups for policies.

### 9.1 Add Group

**Go to:** Access controls > Policies

1. Click **"Add a group"**
2. **Name:** Employees

### 9.2 Configure Group Rules

| Selector | Operator | Value |
|----------|----------|-------|
| Emails ending in | matches | @yourcompany.com |

### 9.3 Save Group

Click **"Save"**

### 9.4 Common Groups

| Group Name | Rule |
|------------|------|
| Employees | Email ends with @company.com |
| Contractors | Specific email list |
| Admins | Specific email list |
| Engineering | Email contains +eng@ |

---

## Step 10: Configure Device Posture (Optional)

Require device security checks.

### 10.1 Access Device Posture

**Go to:** Reusable components > Posture checks

### 10.2 Add Posture Check

1. Click **"Add new"**
2. Select check type:
   - Firewall
   - Disk encryption
   - OS version
   - Domain joined
   - Running process

### 10.3 Example: Require Firewall

1. **Name:** Firewall Enabled
2. **Type:** Firewall
3. **Operating System:** Windows, macOS
4. **Firewall status:** Enabled
5. Click **"Save"**

### 10.4 Use in Access Policy

Add to your Access policy:

| Rule Type | Selector | Value |
|-----------|----------|-------|
| Require | Device Posture | Firewall Enabled |

---

## Step 11: Test Access

### 11.1 Browser Access

1. Open browser
2. Go to: `https://app.yourdomain.com`
3. You should see the Cloudflare Access login page
4. Authenticate with your identity provider
5. After authentication, you should see your application

### 11.2 WARP Client Access

1. Connect WARP client to Zero Trust
2. Access the application URL
3. Authentication may be automatic if already logged in

### 11.3 Check Access Logs

**Go to:** Insights > Logs (Access tab)

View:
- Successful authentications
- Blocked attempts
- User details
- Device information

---

## Step 12: Private Network Access (Advanced)

Access entire private networks, not just specific apps.

### 12.1 Configure Private Network

**Go to:** Networks > Connectors > Your Tunnel

1. Go to **"Private Network"** tab
2. Click **"Add a private network"**
3. Enter CIDR range: `192.168.1.0/24`
4. Click **"Save"**

### 12.2 Configure Split Tunnel

**Go to:** Team & Resources > Devices

1. Edit your device profile
2. Go to **"Split Tunnels"**
3. Select **"Include IPs and domains"**
4. Add your private network CIDR

### 12.3 Access Private Resources

With WARP connected, users can now access:
- `http://192.168.1.100` (internal server)
- `ssh 192.168.1.50` (SSH to internal host)
- Any resource in the private network

---

## Common Use Cases

### Web Application Access

```yaml
ingress:
  - hostname: intranet.company.com
    service: http://10.0.0.50:80
```

### SSH Access

```yaml
ingress:
  - hostname: ssh.company.com
    service: ssh://10.0.0.100:22
```

Access via browser: `https://ssh.company.com`

### RDP Access

```yaml
ingress:
  - hostname: rdp.company.com
    service: rdp://10.0.0.200:3389
```

Access via browser with Cloudflare's RDP client.

### Database Access

```yaml
ingress:
  - hostname: db.company.com
    service: tcp://10.0.0.150:5432
```

Requires WARP client for TCP access.

---

## Troubleshooting

### "Tunnel not connecting"

- Check cloudflared is running
- Verify credentials file path
- Check firewall allows outbound 443
- Review cloudflared logs

### "Access denied"

- Verify user matches policy rules
- Check identity provider configuration
- Review Access logs for denial reason
- Verify application domain matches

### "Application not loading"

- Verify tunnel is healthy
- Check service URL in config
- Verify application is running
- Test local access to application

### "Certificate errors"

- Verify DNS is pointing to tunnel
- Check hostname matches configuration
- Wait for DNS propagation

### View Tunnel Logs

```cmd
cloudflared tunnel --loglevel debug run my-tunnel
```

---

## What You Learned

| Skill | Done |
|-------|------|
| Install cloudflared | |
| Create tunnel | |
| Configure tunnel routes | |
| Create Access application | |
| Create Access policies | |
| Configure device posture | |
| Test ZTNA access | |
| Troubleshoot issues | |

---

## Quick Reference

### Cloudflared Commands

| Command | Description |
|---------|-------------|
| `cloudflared tunnel login` | Authenticate |
| `cloudflared tunnel create NAME` | Create tunnel |
| `cloudflared tunnel list` | List tunnels |
| `cloudflared tunnel run NAME` | Run tunnel |
| `cloudflared tunnel route dns NAME HOST` | Add DNS route |
| `cloudflared tunnel delete NAME` | Delete tunnel |
| `cloudflared service install` | Install as service |

### Access Policy Actions

| Action | Description |
|--------|-------------|
| Allow | Grant access |
| Block | Deny access |
| Bypass | Skip authentication |
| Service Auth | Machine-to-machine |

### Common Selectors

| Selector | Use Case |
|----------|----------|
| Emails | Specific users |
| Emails ending in | Domain-based |
| Access Groups | Reusable groups |
| Country | Geographic restriction |
| IP ranges | Network-based |
| Device Posture | Security requirements |

---

## Next Module

You have configured Zero Trust Network Access!

**Next:** [Module 08: Logs & Analytics](./08-logs-analytics.md)

In the next module, you will learn how to monitor and troubleshoot your Zero Trust deployment.

---

## Workshop Almost Complete!

## What You Built

| Module | Feature |
|--------|---------|
| 01 | Zero Trust organization & WARP client |
| 02 | DNS filtering & content control |
| 03 | Secure Web Gateway & HTTP policies |
| 04 | Anti-virus & malware protection |
| 05 | Data Loss Prevention |
| 06 | Device Posture & WARP settings |
| 07 | Zero Trust Network Access |

## Next Steps

1. **Production Deployment**
   - Roll out WARP to all devices
   - Create comprehensive policies
   - Integrate with identity providers

2. **Advanced Features**
   - Browser Isolation
   - Email Security
   - Digital Experience Monitoring (DEX)

3. **Monitoring & Optimization**
   - Review logs regularly
   - Tune policies based on findings
   - Set up alerts and notifications

## Resources

- **Documentation:** https://developers.cloudflare.com/cloudflare-one/
- **Learning Paths:** https://developers.cloudflare.com/learning-paths/
- **Community:** https://community.cloudflare.com
- **Support:** https://support.cloudflare.com

---

**Thank you for completing this workshop!**

**Workshop Repository:** https://github.com/pongpisit/cloudflare-zero-trust-workshop
