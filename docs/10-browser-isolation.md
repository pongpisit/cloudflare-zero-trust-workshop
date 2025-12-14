# Module 07: Browser Isolation (Agentless ZTNA)

**Duration:** 45 minutes

## What You Will Learn

- Understand Browser Isolation and Agentless ZTNA concepts
- **Access internal applications without installing WARP agent**
- Set up Clientless Web Isolation (no agent required)
- Configure access policies for isolated browsing
- Control browser permissions (copy, paste, print)
- Test isolated browsing experience

---

## Why Agentless ZTNA?

**Problem:** Not all users can install the WARP agent:
- Contractors on personal devices
- Partners with managed devices (can't install software)
- BYOD users who don't want corporate software
- Quick access needed without deployment

**Solution:** Browser Isolation provides **agentless ZTNA**:
- Access internal apps through any browser
- No software installation required
- Same Zero Trust security policies apply
- Works on any device (laptop, tablet, phone)

---

## How Browser Isolation Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    Browser Isolation                            │
│                                                                 │
│   ┌──────────┐                      ┌──────────────────────┐   │
│   │  User's  │    Secure Stream     │  Cloudflare Edge     │   │
│   │ Browser  │ ◄──────────────────► │                      │   │
│   │          │    (Pixels only)     │  ┌────────────────┐  │   │
│   └──────────┘                      │  │ Isolated       │  │   │
│                                     │  │ Browser        │  │   │
│   User sees:                        │  │                │  │   │
│   - Safe visual stream              │  │ Executes code  │  │   │
│   - No malware can reach device     │  │ Renders page   │  │   │
│                                     │  └───────┬────────┘  │   │
│                                     │          │           │   │
│                                     │          ▼           │   │
│                                     │  ┌────────────────┐  │   │
│                                     │  │   Website      │  │   │
│                                     │  │   (Untrusted)  │  │   │
│                                     │  └────────────────┘  │   │
│                                     └──────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Benefits:**
- **Agentless ZTNA** - Access internal apps without WARP
- Zero-day threat protection
- No malware can reach user's device
- Safe access to risky websites
- No agent installation required (Clientless)
- Works on any device with a modern browser

---

## Step 1: Access Browser Isolation Settings

### 1.1 Navigate to Browser Isolation

1. Open https://one.dash.cloudflare.com/
2. In the left sidebar, click **Settings**
3. Click **Browser Isolation**

### 1.2 Verify License

Check that Browser Isolation is enabled for your account.

> **Note:** Clientless Web Isolation requires appropriate license.

---

## Step 2: Enable Clientless Web Isolation

### 2.1 Access Clientless Settings

1. Go to **Settings** > **Browser Isolation**
2. Find **Clientless Web Isolation** section
3. Toggle **Enable Clientless Web Isolation**

### 2.2 Note the Isolation URL

Your Clientless Web Isolation URL will be:
```
https://<your-team-name>.cloudflareaccess.com/browser
```

Example:
```
https://mycompany.cloudflareaccess.com/browser
```

---

## Step 3: Configure Access Policy

Control who can use Clientless Web Isolation.

### 3.1 Create Access Application

1. Go to **Access** > **Applications**
2. Click **Add an application**
3. Select **Self-hosted**

### 3.2 Configure Application

- **Name:** `Clientless Browser Isolation`
- **Session Duration:** 24 hours
- **Application domain:** `<team-name>.cloudflareaccess.com`
- **Path:** `/browser`

### 3.3 Create Access Policy

1. **Policy name:** `Allow Authenticated Users`
2. **Action:** Allow
3. **Include rules:**

| Selector | Operator | Value |
|----------|----------|-------|
| Emails ending in | matches | @yourcompany.com |

**Or use Identity Provider:**

| Selector | Operator | Value |
|----------|----------|-------|
| Login Methods | is | One-time PIN |

**Supported Authentication Methods:**
- ✅ Email OTP (One-time PIN)
- ✅ Microsoft (Azure AD)
- ✅ Google Workspace
- ✅ SAML (University/Enterprise IdP)

4. Click **Save**

---

## Step 4: Configure Browser Permissions

Control what users can do in isolated browser.

### 4.1 Access Permission Settings

1. Go to **Settings** > **Browser Isolation**
2. Find **Clientless Web Isolation** section
3. Click **Configure permissions**

### 4.2 Available Permissions

| Permission | Description | Recommended |
|------------|-------------|-------------|
| **Copy** | Allow copying text from isolated browser | Disable for sensitive |
| **Paste** | Allow pasting text into isolated browser | Disable for sensitive |
| **Print** | Allow printing pages | Disable for sensitive |
| **Keyboard** | Allow keyboard input | Enable (required) |
| **Upload** | Allow file uploads | Disable for sensitive |
| **Download** | Allow file downloads | Disable for sensitive |

### 4.3 Configure Restrictive Policy

For high-security access:

1. **Disable copy/paste** - Prevent data exfiltration
2. **Disable printing** - Prevent unauthorized copies
3. **Disable downloads** - Prevent file theft
4. **Enable keyboard** - Required for navigation

### 4.4 Save Settings

Click **Save**

---

## Step 5: Test Clientless Web Isolation

### 5.1 Access Isolation URL

1. Open a new browser window (Chrome, Edge, Firefox, or Safari)
2. Go to: `https://<team-name>.cloudflareaccess.com/browser`

### 5.2 Authenticate

1. Enter your email address
2. Receive OTP via email (or use IdP)
3. Enter OTP to authenticate

### 5.3 Use Isolated Browser

1. You should see the **Address Bar**
2. Enter a URL to visit: `https://www.google.com`
3. The website loads in isolated environment

### 5.4 Test Permissions

Try the following:
- **Copy text** - Should be blocked if disabled
- **Paste text** - Should be blocked if disabled
- **Print page** - Should be blocked if disabled
- **Type text** - Should work (keyboard enabled)

### 5.5 Test Multi-Language Keyboard

1. In isolated browser, go to a text input field
2. Switch keyboard language:
   - English
   - Thai (ไทย)
   - Chinese (中文)
   - Japanese (日本語)
   - Korean (한국어)
3. Type in different languages

---

## Step 6: Access Internal Applications

Access internal servers through Browser Isolation.

### 6.1 Prerequisites

- Cloudflare Tunnel configured (see Module 07)
- Internal DNS resolver configured

### 6.2 Configure DNS for Internal Hostnames

1. Go to **Settings** > **Network**
2. Find **Local Domain Fallback**
3. Add internal domains:
   - `internal.company.com`
   - `intranet.local`
4. Specify internal DNS server IP

### 6.3 Access Internal Application

1. Go to Clientless Web Isolation URL
2. In the address bar, enter internal hostname:
   ```
   https://intranet.company.com
   ```
3. The internal application loads through the secure tunnel

### 6.4 Benefits

- Access internal apps from any device
- No VPN required
- No agent installation needed
- Full isolation protection

---

## Step 7: Create Isolation Policies (Advanced)

Automatically isolate risky websites.

### 7.1 Create HTTP Policy for Isolation

1. Go to **Traffic Policies** > **HTTP**
2. Click **Add a policy**
3. **Name:** `Isolate Risky Categories`

### 7.2 Configure Traffic Selector

| Selector | Operator | Value |
|----------|----------|-------|
| Security Risk | in | Suspicious, Unknown |

**Or by Content Category:**

| Selector | Operator | Value |
|----------|----------|-------|
| Content Categories | in | Newly Seen Domains |

### 7.3 Set Action

**Action:** Isolate

### 7.4 Save Policy

Click **Create policy**

---

## Supported Browsers

| Browser | Support |
|---------|---------|
| Google Chrome | ✅ Full support |
| Microsoft Edge | ✅ Full support |
| Mozilla Firefox | ✅ Full support |
| Apple Safari | ✅ Full support |

---

## Use Cases

### 1. Agentless ZTNA (Primary Use Case)

**Access internal applications without WARP agent:**
- Contractors accessing internal tools
- Partners viewing shared dashboards
- Employees on personal devices
- Quick access from any browser

**How it works:**
1. User opens Browser Isolation URL
2. Authenticates with email OTP or IdP
3. Types internal app URL in isolated browser
4. Cloudflare Tunnel routes traffic to internal app
5. User sees the app - no agent needed!

### 2. Contractor/Guest Access

- Provide secure access without agent installation
- Time-limited access via Access policies
- No software installation required
- Revoke access instantly

### 3. BYOD (Bring Your Own Device)

- Secure access from personal devices
- No corporate software needed
- Isolation protects both user and company
- Users keep their privacy

### 4. Secure Access to Untrusted Sites

- Research on potentially malicious sites
- Accessing unknown links from emails
- Browsing newly registered domains

---

## Troubleshooting

### "Can't access isolation URL"

- Verify Clientless Web Isolation is enabled
- Check Access policy allows your email
- Try different browser
- Clear browser cache

### "Authentication failing"

- Check email is correct
- Verify OTP email received
- Check IdP configuration
- Try One-time PIN method

### "Can't access internal sites"

- Verify Cloudflare Tunnel is running
- Check DNS fallback configuration
- Verify internal hostname resolves
- Check tunnel routes

### "Keyboard not working"

- Ensure keyboard permission is enabled
- Try different browser
- Refresh the isolation session
- Check browser extensions

### "Copy/paste not working"

- This may be intentionally disabled
- Check permission settings
- Contact administrator

---

## What You Learned

| Skill | Done |
|-------|------|
| Enable Clientless Web Isolation | |
| Configure Access policies | |
| Set browser permissions | |
| Test isolated browsing | |
| Access internal applications | |
| Test multi-language keyboard | |

---

## Quick Reference

### Clientless Web Isolation URL

```
https://<team-name>.cloudflareaccess.com/browser
```

### Permission Options

| Permission | Default | Security |
|------------|---------|----------|
| Copy | Enabled | Disable for sensitive |
| Paste | Enabled | Disable for sensitive |
| Print | Enabled | Disable for sensitive |
| Keyboard | Enabled | Keep enabled |
| Upload | Enabled | Disable for sensitive |
| Download | Enabled | Disable for sensitive |

### Authentication Methods

| Method | Use Case |
|--------|----------|
| One-time PIN | Quick access, no IdP needed |
| Microsoft | Enterprise with Azure AD |
| Google | Google Workspace users |
| SAML | University/Enterprise IdP |

---

## Next Module

You have configured Clientless Web Isolation for secure browsing!

**Return to:** [Module 09: Workshop Summary](./09-workshop-summary.md)

Or explore other modules you may have skipped.
