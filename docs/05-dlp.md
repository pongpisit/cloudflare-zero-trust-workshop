# Module 05: Data Loss Prevention (DLP)

**Duration:** 45 minutes

## What You Will Learn

- Understand DLP concepts and use cases
- Create DLP profiles for sensitive data
- Configure DLP policies for HTTP traffic
- Detect credit cards, SSN, and other PII
- Create custom detection patterns
- View DLP logs and alerts

> **📚 Rule Expressions:** New to Cloudflare policies? Start with [Module 01a: Understanding Rule Expressions](./01a-rule-expressions.md) to learn about signals, operators, and lists.

---

## How DLP Works

```
┌──────────┐                    ┌─────────────────────────────────┐
│  User    │     HTTP Traffic   │      Cloudflare Gateway         │
│  Device  │ ──────────────────►│                                 │
│  (WARP)  │                    │  ┌─────────────────────────┐    │
└──────────┘                    │  │      DLP Engine         │    │
                                │  │                         │    │
                                │  │  • Pattern Matching     │    │
                                │  │  • Regex Detection      │    │
                                │  │  • ML Classification    │    │
                                │  │  • Context Analysis     │    │
                                │  └───────────┬─────────────┘    │
                                │              │                  │
                                │      ┌───────┴───────┐          │
                                │      │               │          │
                                │   No Match      Match Found     │
                                │      │               │          │
                                │      ▼               ▼          │
                                │    Allow      Log/Block/Alert   │
                                └─────────────────────────────────┘
```

**DLP scans:**
- HTTP request/response bodies
- File uploads and downloads
- Form submissions
- Chat messages
- Email content (with Email Security)

---

## Prerequisites

Before configuring DLP:
- Gateway proxy enabled (Module 03)
- TLS inspection enabled (Module 03)
- WARP client connected

---

## Step 1: Access DLP Settings

**Go to:** Data loss prevention > Profiles

1. Open https://one.dash.cloudflare.com/
2. In the left sidebar, click **Data loss prevention**
3. Click **Profiles**

---

## Step 2: Explore Predefined DLP Profiles

Cloudflare provides built-in detection profiles.

### 2.1 Available Predefined Profiles

| Profile | Detects |
|---------|---------|
| Financial Information | Credit cards, bank accounts |
| Social Security Numbers | US SSN patterns |
| Credentials | API keys, passwords, tokens |
| Source Code | Programming language patterns |
| Health Information | Medical record numbers |

### 2.2 View Profile Details

1. Click on a predefined profile
2. Review the detection entries
3. Note the patterns being detected

---

## Step 3: Enable Predefined Profiles

### 3.1 Enable Financial Information Profile

1. Click **"Financial Information"** profile
2. Review detection entries:
   - Credit Card Numbers
   - Bank Account Numbers
   - IBAN Numbers
3. Toggle **"Enabled"** for entries you want to detect
4. Click **"Save"**

### 3.2 Enable Credentials Profile

1. Click **"Credentials"** profile
2. Enable detection entries:
   - API Keys
   - AWS Access Keys
   - GitHub Tokens
   - Private Keys
3. Click **"Save"**

---

## Step 4: Create Custom DLP Profile

Create a profile for your organization's specific data.

### 4.1 Add New Profile

1. Click **"Create profile"**
2. **Name:** `Company Confidential Data`
3. **Description:** `Detect company-specific sensitive information`

### 4.2 Add Detection Entry - Employee ID

1. Click **"Add detection entry"**
2. **Name:** `Employee ID`
3. **Type:** Custom regex
4. **Regular expression:** `EMP-[0-9]{6}`
5. Click **"Add"**

### 4.3 Add Detection Entry - Project Codes

1. Click **"Add detection entry"**
2. **Name:** `Project Codes`
3. **Type:** Custom regex
4. **Regular expression:** `PROJ-[A-Z]{3}-[0-9]{4}`
5. Click **"Add"**

### 4.4 Add Detection Entry - Custom Keywords

1. Click **"Add detection entry"**
2. **Name:** `Confidential Keywords`
3. **Type:** Custom wordlist
4. **Words:** 
   - CONFIDENTIAL
   - TOP SECRET
   - INTERNAL ONLY
   - DO NOT DISTRIBUTE
5. Click **"Add"**

### 4.5 Save Profile

Click **"Save profile"**

---

## Step 5: Create DLP Policy

Apply DLP profiles to HTTP traffic.

### 5.1 Access HTTP Policies

**Go to:** Traffic policies > Firewall policies > HTTP

### 5.2 Create Block Policy for Credit Cards

1. Click **"Add a policy"**
2. **Name:** `Block Credit Card Uploads`
3. **Description:** `Prevent credit card data from being uploaded`

### 5.3 Configure Traffic Selector

| Selector | Operator | Value |
|----------|----------|-------|
| DLP Profiles | in | Financial Information |
| AND | | |
| HTTP Method | is | POST |

### 5.4 Set Action

**Action:** Block

### 5.5 Save Policy

Click **"Create policy"**

---

## Step 6: Create Log-Only DLP Policy

Monitor sensitive data without blocking.

### 6.1 Add New Policy

1. Click **"Add a policy"**
2. **Name:** `Log Sensitive Data Transfers`
3. **Description:** `Log but allow sensitive data for monitoring`

### 6.2 Configure Traffic Selector

| Selector | Operator | Value |
|----------|----------|-------|
| DLP Profiles | in | Company Confidential Data |

### 6.3 Set Action

**Action:** Allow

**Enable:** Log this request

### 6.4 Save Policy

Click **"Create policy"**

---

## Step 7: Block Uploads to Specific Destinations

Prevent sensitive data from going to unauthorized locations.

### 7.1 Add New Policy

1. Click **"Add a policy"**
2. **Name:** `Block Sensitive Data to Personal Email`

### 7.2 Configure Traffic Selector

| Selector | Operator | Value |
|----------|----------|-------|
| DLP Profiles | in | Financial Information, Credentials |
| AND | | |
| Application | in | Gmail (Personal), Yahoo Mail, Outlook (Personal) |

### 7.3 Set Action

**Action:** Block

---

## Step 8: Allow Sensitive Data to Approved Destinations

### 8.1 Add Allow Policy (Higher Priority)

1. Click **"Add a policy"**
2. **Name:** `Allow Sensitive Data to Corporate Systems`

### 8.2 Configure Traffic Selector

| Selector | Operator | Value |
|----------|----------|-------|
| DLP Profiles | in | Financial Information |
| AND | | |
| Host | in | *.yourcompany.com, salesforce.com |

### 8.3 Set Action

**Action:** Allow

### 8.4 Set Priority

Move this policy ABOVE the block policy.

---

## Step 9: Configure Payload Logging

Log the actual content that triggered DLP.

### 9.1 Enable Payload Logging

**Go to:** Traffic policies > Traffic settings

Under **Payload logging**, turn on: **Enable payload logging**

### 9.2 Configure Retention

Set how long to retain payload logs:
- 24 hours
- 7 days
- 30 days

### 9.3 Access Payload Logs

**Go to:** Insights > Logs > Gateway > HTTP

Click on a DLP event to see:
- Matched pattern
- Surrounding context
- Full payload (if enabled)

---

## Step 10: Test DLP Policies

### 10.1 Test Credit Card Detection

1. Open a web form (e.g., pastebin.com)
2. Enter a test credit card number: `4111 1111 1111 1111`
3. Try to submit
4. Should be blocked if policy is active

### 10.2 Test Custom Pattern Detection

1. Create a document with your custom pattern (e.g., `EMP-123456`)
2. Try to upload to a file sharing site
3. Check if detected/blocked

### 10.3 Check DLP Logs

**Go to:** Insights > Logs > Gateway > HTTP

Filter by:
- DLP Profile matched
- Action: Block or Allow

---

## Step 11: View DLP Analytics

### 11.1 Access Analytics

**Go to:** Insights > Analytics > Gateway

### 11.2 DLP Metrics

View:
- Total DLP matches
- Matches by profile
- Matches by user
- Matches by destination
- Trend over time

### 11.3 Create Reports

Export DLP data for compliance reporting.

---

## Common DLP Patterns

### Credit Card Numbers

```regex
\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b
```

### US Social Security Numbers

```regex
\b[0-9]{3}-[0-9]{2}-[0-9]{4}\b
```

### Email Addresses

```regex
\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b
```

### AWS Access Keys

```regex
\b(AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}\b
```

### GitHub Personal Access Tokens

```regex
\bghp_[a-zA-Z0-9]{36}\b
```

### Private Keys

```regex
-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----
```

### API Keys (Generic)

```regex
\b[a-zA-Z0-9]{32,}\b
```

---

## Best Practices

### 10.1 Start with Logging

1. Enable DLP profiles in log-only mode first
2. Review logs for false positives
3. Tune patterns before blocking

### 10.2 Layer Your Policies

1. Allow policies for approved destinations
2. Block policies for unauthorized destinations
3. Log policies for monitoring

### 10.3 Regular Review

- Review DLP logs weekly
- Update patterns as needed
- Add new detection entries for emerging data types

### 10.4 User Communication

- Inform users about DLP policies
- Provide guidance on handling sensitive data
- Create process for legitimate data transfers

---

## Troubleshooting

### "DLP not detecting data"

- Verify TLS inspection is enabled
- Check if destination is in Do Not Inspect list
- Verify DLP profile is enabled
- Check pattern syntax

### "Too many false positives"

- Review and refine regex patterns
- Add context requirements
- Use minimum match count
- Create exceptions for specific destinations

### "Legitimate transfer blocked"

- Create allow policy for specific destination
- Add destination to approved list
- Review policy priority order

### "Can't see payload in logs"

- Enable payload logging in settings
- Check log retention settings
- Verify user has permission to view payloads

---

## What You Learned

| Skill | Done |
|-------|------|
| Understand DLP concepts | |
| Enable predefined profiles | |
| Create custom DLP profile | |
| Create DLP policies | |
| Configure payload logging | |
| Test DLP detection | |
| View DLP analytics | |

---

## Quick Reference

### DLP Profile Types

| Type | Description |
|------|-------------|
| Predefined | Built-in Cloudflare profiles |
| Custom | Your own detection patterns |
| Integration | Third-party (e.g., Microsoft MIP) |

### DLP Actions

| Action | Description |
|--------|-------------|
| Allow | Permit and optionally log |
| Block | Block the request |
| Log | Record without blocking |

### Predefined Profiles

| Profile | Use Case |
|---------|----------|
| Financial Information | PCI compliance |
| Social Security Numbers | PII protection |
| Credentials | Secret detection |
| Source Code | IP protection |
| Health Information | HIPAA compliance |

---

## Next Module

You have configured Data Loss Prevention to protect sensitive data!

**Next:** [Module 06: Device Posture](./06-device-posture.md)

In the next module, you will configure device posture checks to ensure device security.
