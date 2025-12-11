# Module 02: DNS Filtering

**Duration:** 45 minutes

## What You Will Learn

- Understand how DNS filtering works
- Create DNS policies to block threats
- Filter content by category (TOR 5.1.2.7)
- Enable Safe Search and YouTube Restricted Mode
- Use advanced selectors: Source IP, Domain, User Identity (TOR 5.1.2.4)
- Use comparison and logical operators (TOR 5.1.2.5)
- Configure DNSSEC validation (TOR 5.1.2.12)
- Filter by DNS Record Type (TOR 5.1.2.13)
- Test DNS filtering

---

## TOR Compliance Highlights

This module covers the following TOR requirements:

| TOR | Feature | Status |
|-----|---------|--------|
| 5.1.2.2 | Policy by Source IP, Domain, Host, Application | ✅ |
| 5.1.2.3 | Actions: Allow, Block, Override, Safe Search | ✅ |
| 5.1.2.4 | Selectors: Domain, Content/Security Categories, User Identity | ✅ |
| 5.1.2.5 | Operators: is, in, and, or | ✅ |
| 5.1.2.6 | Regular Expressions | ✅ |
| 5.1.2.7 | Security Categories (Malware, Phishing, C2, DGA, etc.) | ✅ |
| 5.1.2.8 | Geolocation-based policies | ✅ |
| 5.1.2.11 | CIPA filter for child protection | ✅ |
| 5.1.2.12 | DNSSEC validation | ✅ |
| 5.1.2.13 | Filter by DNS Record Type | ✅ |

---

## How DNS Filtering Works

```
┌──────────┐     DNS Query      ┌─────────────────┐     Allowed     ┌──────────┐
│  User    │ ─────────────────► │   Cloudflare    │ ──────────────► │  Website │
│  Device  │                    │   Gateway DNS   │                 │          │
│  (WARP)  │ ◄───────────────── │                 │ ◄────────────── │          │
└──────────┘     DNS Response   │  ┌───────────┐  │     Response    └──────────┘
                                │  │  Policy   │  │
                                │  │  Engine   │  │
                                │  └───────────┘  │
                                │        │        │
                                │        ▼        │
                                │   Block Page    │
                                └─────────────────┘
```

**When a user visits a website:**
1. Device sends DNS query to Cloudflare Gateway
2. Gateway checks the domain against your policies
3. If allowed: Returns the IP address
4. If blocked: Returns block page or NXDOMAIN

---

## Step 1: Access DNS Policies

**Go to:** Zero Trust Dashboard > Gateway > Firewall Policies > DNS

1. Open https://one.dash.cloudflare.com/
2. In the left sidebar, click **Gateway**
3. Click **Firewall Policies**
4. Select the **DNS** tab

You will see the DNS policies page where you can create and manage policies.

---

## Step 2: Create Security Policy (Block Threats)

This policy blocks known malicious domains.

### 2.1 Add New Policy

1. Click **"Add a policy"**
2. **Name:** `Block Security Threats`
3. **Description:** `Block malware, phishing, and other security risks`

### 2.2 Configure Traffic Selector

**Build expression:**

| Selector | Operator | Value |
|----------|----------|-------|
| Security Categories | in | All security risks |

**Or select specific categories:**
- Malware
- Phishing
- Spyware
- Command and Control
- Cryptomining
- Spam
- Newly Seen Domains
- DGA Domains (Domain Generation Algorithm)

### 2.3 Set Action

**Action:** Block

### 2.4 Save Policy

Click **"Create policy"**

---

## Step 3: Create Content Filtering Policy

Block inappropriate or unwanted content categories.

### 3.1 Add New Policy

1. Click **"Add a policy"**
2. **Name:** `Block Adult Content`
3. **Description:** `Block adult and inappropriate websites`

### 3.2 Configure Traffic Selector

| Selector | Operator | Value |
|----------|----------|-------|
| Content Categories | in | Adult Themes |

**Common categories to block:**
- Adult Themes
- Gambling
- Drugs
- Violence
- Weapons
- Hate Speech

### 3.3 Set Action

**Action:** Block

### 3.4 Save Policy

Click **"Create policy"**

---

## Step 4: Block Specific Domains

Block specific domains that you want to restrict.

### 4.1 Add New Policy

1. Click **"Add a policy"**
2. **Name:** `Block Social Media`
3. **Description:** `Block social media during work hours`

### 4.2 Configure Traffic Selector

| Selector | Operator | Value |
|----------|----------|-------|
| Domain | in | facebook.com, instagram.com, tiktok.com |

**Or use Application selector:**

| Selector | Operator | Value |
|----------|----------|-------|
| Application | in | Facebook, Instagram, TikTok |

### 4.3 Set Action

**Action:** Block

### 4.4 Save Policy

Click **"Create policy"**

---

## Step 5: Allow Specific Domains (Bypass)

Create allow policies for domains that should never be blocked.

### 5.1 Add New Policy

1. Click **"Add a policy"**
2. **Name:** `Allow Business Critical`
3. **Description:** `Always allow critical business domains`

### 5.2 Configure Traffic Selector

| Selector | Operator | Value |
|----------|----------|-------|
| Domain | in | microsoft.com, google.com, cloudflare.com |

### 5.3 Set Action

**Action:** Allow

### 5.4 Set Priority

**Important:** Move this policy to the TOP of your policy list.

Policies are evaluated in order from top to bottom. Allow policies should be first.

Click and drag the policy to reorder, or use the priority number.

---

## Step 6: Enable Safe Search

Force Safe Search on popular search engines.

### 6.1 Add New Policy

1. Click **"Add a policy"**
2. **Name:** `Enforce Safe Search`
3. **Description:** `Enable Safe Search on all search engines`

### 6.2 Configure Traffic Selector

| Selector | Operator | Value |
|----------|----------|-------|
| Domain | matches regex | `.*` |

**Or leave empty to apply to all DNS queries**

### 6.3 Set Action

**Action:** Safe Search

This forces:
- Google Safe Search
- Bing Safe Search
- DuckDuckGo Safe Search
- YouTube Restricted Mode

---

## Step 7: Enable YouTube Restricted Mode

### 7.1 Add New Policy

1. Click **"Add a policy"**
2. **Name:** `YouTube Restricted Mode`
3. **Description:** `Enable YouTube Restricted Mode`

### 7.2 Configure Traffic Selector

| Selector | Operator | Value |
|----------|----------|-------|
| Application | is | YouTube |

### 7.3 Set Action

**Action:** YouTube Restricted Mode

Choose restriction level:
- **Strict:** Most restrictive
- **Moderate:** Balanced filtering

---

## Step 8: Configure Block Page

Customize the page users see when blocked.

### 8.1 Access Block Page Settings

**Go to:** Settings > Custom Pages > Gateway block page

### 8.2 Customize Block Page

**Options:**
- **Header text:** "Access Blocked"
- **Body text:** "This website has been blocked by your organization's security policy."
- **Logo:** Upload your company logo
- **Background color:** Choose your brand color
- **Support email:** helpdesk@yourcompany.com

### 8.3 Enable Block Page

**Go to:** Settings > Network > Firewall

Enable: **"Display block page"**

> **Note:** Block page requires TLS inspection to be enabled for HTTPS sites.

---

## Step 9: Test DNS Filtering

### 9.1 Test Security Blocking

**Try visiting a test malware domain:**

```
http://malware.testcategory.com
```

You should see the block page or connection refused.

### 9.2 Test Category Blocking

If you blocked adult content, try:

```
http://adult.testcategory.com
```

### 9.3 Test Safe Search

1. Go to https://www.google.com
2. Search for something
3. Check if Safe Search is enabled (look for "SafeSearch is on")

### 9.4 Check DNS Logs

**Go to:** Logs > Gateway > DNS

You should see:
- Allowed queries (green)
- Blocked queries (red)
- Query details (domain, user, device, policy matched)

---

## Step 10: Create Location-Based Policies

Filter DNS for specific office locations.

### 10.1 Add DNS Location

**Go to:** Gateway > DNS Locations > Add a location

1. **Name:** `Main Office`
2. **Note the DNS addresses provided:**
   - IPv4: `172.64.36.x`
   - IPv6: `2606:4700::`
   - DoH: `https://xxxxx.cloudflare-gateway.com/dns-query`

### 10.2 Configure Router/Network

Point your office router's DNS to the Cloudflare addresses.

### 10.3 Create Location-Specific Policy

1. Click **"Add a policy"**
2. **Name:** `Office - Block Streaming`
3. Add condition:

| Selector | Operator | Value |
|----------|----------|-------|
| Location | is | Main Office |
| AND | | |
| Application | in | Netflix, YouTube, Spotify |

4. **Action:** Block

---

## Step 11: Advanced DNS Features (TOR Compliance)

### 11.1 Policy with Regular Expressions (TOR 5.1.2.6)

Block domains matching a pattern:

1. Click **"Add a policy"**
2. **Name:** `Block Suspicious TLDs`
3. Configure:

| Selector | Operator | Value |
|----------|----------|-------|
| Domain | matches regex | `.*\.(xyz|top|club|work|loan)$` |

4. **Action:** Block

### 11.2 Policy by Geolocation (TOR 5.1.2.8)

Block DNS queries from specific countries:

1. Click **"Add a policy"**
2. **Name:** `Block High-Risk Countries`
3. Configure:

| Selector | Operator | Value |
|----------|----------|-------|
| Source Country | in | [Select countries] |

4. **Action:** Block

### 11.3 Policy by User Identity (TOR 5.1.2.9)

Create user-specific policies:

1. Click **"Add a policy"**
2. **Name:** `Allow Social Media for Marketing`
3. Configure:

| Selector | Operator | Value |
|----------|----------|-------|
| User Email | in | marketing@company.com |
| AND | | |
| Application | in | Facebook, Instagram, LinkedIn |

4. **Action:** Allow

### 11.4 Filter by DNS Record Type (TOR 5.1.2.13)

Block specific DNS record types:

1. Click **"Add a policy"**
2. **Name:** `Block TXT Record Queries`
3. Configure:

| Selector | Operator | Value |
|----------|----------|-------|
| Query Record Type | is | TXT |

4. **Action:** Block

**Available Record Types:**
- A (IPv4 address)
- AAAA (IPv6 address)
- CNAME (Canonical name)
- MX (Mail exchange)
- TXT (Text record)
- PTR (Pointer record)
- NS (Name server)
- SRV (Service record)

### 11.5 Configure DNSSEC Validation (TOR 5.1.2.12)

1. Go to **Settings** > **Network**
2. Find **DNSSEC** section
3. Enable **DNSSEC validation**

> **Warning:** Disabling DNSSEC validation may expose users to DNS spoofing attacks.

### 11.6 Security Categories (TOR 5.1.2.7)

Create policy blocking all required security categories:

| Selector | Operator | Value |
|----------|----------|-------|
| Security Categories | in | (select all below) |

**Required Categories per TOR:**
- ✅ Anonymizer (5.1.2.7.1)
- ✅ Malware (5.1.2.7.2)
- ✅ Phishing (5.1.2.7.3)
- ✅ Command and Control & Botnet (5.1.2.7.4)
- ✅ Brand Embedding (5.1.2.7.5) - *Brand Impersonation*
- ✅ DGA Domains (5.1.2.7.6)
- ✅ Newly Seen Domains (5.1.2.7.9)

**Content Categories:**
- ✅ Adult Themes (5.1.2.7.7)
- ✅ Login Screens (5.1.2.7.8)

### 11.7 DNS Override Action (TOR 5.1.2.3)

Redirect a domain to a different IP:

1. Click **"Add a policy"**
2. **Name:** `Override Internal Domain`
3. Configure:

| Selector | Operator | Value |
|----------|----------|-------|
| Domain | is | internal.company.com |

4. **Action:** Override
5. **Override with:** 10.0.0.100

---

## Policy Order Best Practices

Arrange policies in this order (top to bottom):

1. **Allow policies** - Critical business domains
2. **Block policies** - Security threats
3. **Block policies** - Content categories
4. **Block policies** - Specific domains/applications
5. **Safe Search** - Search engine filtering
6. **Default action** - Allow all other traffic

---

## Common DNS Policy Examples

### Block All Security Threats

```
Selector: Security Categories
Operator: in
Value: All security risks
Action: Block
```

### Block Newly Registered Domains

```
Selector: Security Categories
Operator: in
Value: Newly Seen Domains
Action: Block
```

### Block Specific TLDs

```
Selector: Domain
Operator: matches regex
Value: .*\.(xyz|top|club|work)$
Action: Block
```

### Allow Only Specific Domains (Allowlist Mode)

```
Policy 1:
Selector: Domain
Operator: in
Value: allowed-domain1.com, allowed-domain2.com
Action: Allow

Policy 2 (at bottom):
Selector: Domain
Operator: matches regex
Value: .*
Action: Block
```

---

## Troubleshooting

### "Block page not showing"

- TLS inspection must be enabled for HTTPS sites
- Root certificate must be installed on device
- Check if domain is in "Do Not Inspect" list

### "Policy not working"

- Check policy order (priority)
- Verify device is connected to Zero Trust
- Wait 60 seconds for policy to propagate
- Check DNS logs for the query

### "Safe Search not working"

- Some browsers have their own Safe Search settings
- Check if user is signed into Google account
- Verify policy is applied to the device

### "Can't access legitimate site"

- Check if site is miscategorized
- Create an Allow policy for the domain
- Submit recategorization request to Cloudflare

---

## What You Learned

| Skill | Done |
|-------|------|
| Create DNS security policy | |
| Block content categories | |
| Block specific domains | |
| Create allow policies | |
| Enable Safe Search | |
| Configure block page | |
| Test DNS filtering | |
| View DNS logs | |

---

## Quick Reference

| Action | Description |
|--------|-------------|
| Allow | Permit the DNS query |
| Block | Block and show block page |
| Override | Resolve to different IP |
| Safe Search | Force safe search on search engines |
| YouTube Restricted Mode | Enable YouTube restrictions |

### Common Security Categories

| Category | Description |
|----------|-------------|
| Malware | Known malware distribution |
| Phishing | Credential theft sites |
| Spyware | Spyware distribution |
| C2 | Command and Control servers |
| Cryptomining | Cryptocurrency mining |
| DGA | Domain Generation Algorithm |
| Newly Seen | Domains registered recently |

---

## Next Module

You have configured DNS filtering to protect users from threats!

**Next:** [Module 03: Secure Web Gateway](./03-secure-web-gateway.md)

In the next module, you will set up HTTP policies for deeper traffic inspection.
