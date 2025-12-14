# Module 11 (Optional): CASB (Cloud Access Security Broker)

> **Note:** This module is optional and requires API integration with SaaS applications like Microsoft 365 or Google Workspace. Skip this module if you don't have these integrations available.

**Duration:** 45 minutes

## What You Will Learn

- Understand CASB concepts and use cases
- Integrate SaaS applications with CASB
- Detect misconfigurations in SaaS apps
- Identify shadow IT and unauthorized apps
- Scan for sensitive data in cloud storage
- Review and remediate security findings

---

## How CASB Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    Cloudflare CASB                              │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Microsoft  │  │   Google    │  │  Salesforce │  ...        │
│  │    365      │  │  Workspace  │  │             │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                     │
│         └────────────────┼────────────────┘                     │
│                          │                                      │
│                          ▼                                      │
│              ┌───────────────────────┐                          │
│              │    API Integration    │                          │
│              │                       │                          │
│              │  • Configuration Scan │                          │
│              │  • User Activity      │                          │
│              │  • File Scanning      │                          │
│              │  • DLP Integration    │                          │
│              └───────────┬───────────┘                          │
│                          │                                      │
│                          ▼                                      │
│              ┌───────────────────────┐                          │
│              │   Security Findings   │                          │
│              │   & Recommendations   │                          │
│              └───────────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

**CASB provides:**
- API-based integration with SaaS apps
- Configuration and security scanning
- Shadow IT discovery
- Data at rest scanning (with DLP)
- Compliance monitoring

---

## Supported SaaS Applications

| Application | Features |
|-------------|----------|
| Microsoft 365 | Users, files, sharing, mailboxes |
| Google Workspace | Users, Drive files, sharing settings |
| Salesforce | Users, objects, permissions |
| GitHub | Repositories, users, secrets |
| Slack | Users, channels, files |
| Box | Users, files, sharing |
| Dropbox | Users, files, sharing |
| Zoom | Users, meetings, settings |

---

## Step 1: Access CASB Settings

**Go to:** CASB > Integrations

1. Open https://one.dash.cloudflare.com/
2. In the left sidebar, click **CASB**
3. Click **Integrations**

---

## Step 2: Integrate Microsoft 365

### 2.1 Add Integration

1. Click **"Add integration"**
2. Select **"Microsoft 365"**
3. Click **"Add integration"**

### 2.2 Authorize Access

1. Click **"Authorize"**
2. Sign in with Microsoft 365 admin account
3. Review permissions requested:
   - Read directory data
   - Read all users' full profiles
   - Read files in all site collections
4. Click **"Accept"**

### 2.3 Configure Scan Settings

**Select what to scan:**

| Option | Description |
|--------|-------------|
| Users | Scan user accounts and settings |
| Files | Scan OneDrive and SharePoint files |
| Mailboxes | Scan email settings |
| Teams | Scan Teams settings |

### 2.4 Enable Integration

Click **"Save"**

The initial scan may take several hours depending on data volume.

---

## Step 3: Integrate Google Workspace

### 3.1 Add Integration

1. Click **"Add integration"**
2. Select **"Google Workspace"**
3. Click **"Add integration"**

### 3.2 Authorize Access

1. Click **"Authorize"**
2. Sign in with Google Workspace admin account
3. Review permissions:
   - View users on your domain
   - View groups on your domain
   - See and download all Google Drive files
4. Click **"Allow"**

### 3.3 Configure Scan Settings

**Select what to scan:**
- Users and groups
- Drive files
- Sharing settings
- Admin settings

### 3.4 Enable Integration

Click **"Save"**

---

## Step 4: View Security Findings

### 4.1 Access Findings

**Go to:** CASB > Findings

Or click on an integration to see its findings.

### 4.2 Finding Categories

| Category | Examples |
|----------|----------|
| User Security | MFA not enabled, inactive accounts |
| File Sharing | Public files, external sharing |
| Configuration | Weak settings, missing policies |
| Compliance | Policy violations, risky settings |

### 4.3 Finding Severity

| Severity | Description |
|----------|-------------|
| Critical | Immediate action required |
| High | Should be addressed soon |
| Medium | Review and plan remediation |
| Low | Informational, best practice |

---

## Step 5: Review Microsoft 365 Findings

### 5.1 Common M365 Findings

| Finding | Risk | Remediation |
|---------|------|-------------|
| User without MFA | High | Enable MFA for user |
| Mailbox forwarding to external | High | Remove forwarding rule |
| Files shared with everyone | Medium | Restrict sharing |
| Inactive admin account | Medium | Disable or remove |
| Legacy authentication enabled | High | Disable legacy auth |

### 5.2 Investigate a Finding

1. Click on a finding
2. Review details:
   - Affected resource (user, file, setting)
   - Risk description
   - Recommended action
3. Click **"View in Microsoft 365"** to remediate

### 5.3 Dismiss Finding

If finding is acceptable:
1. Click **"Dismiss"**
2. Select reason:
   - False positive
   - Accepted risk
   - Already remediated
3. Add notes
4. Click **"Dismiss"**

---

## Step 6: Review Google Workspace Findings

### 6.1 Common Google Findings

| Finding | Risk | Remediation |
|---------|------|-------------|
| 2-Step verification not enforced | High | Enforce 2SV |
| File shared publicly | High | Remove public access |
| External sharing enabled | Medium | Restrict external sharing |
| Super admin without 2SV | Critical | Enable 2SV immediately |
| Suspended user with active sessions | Medium | Revoke sessions |

### 6.2 File Sharing Findings

Review files that are:
- Shared with "Anyone with the link"
- Shared with external domains
- Shared with personal Gmail accounts

---

## Step 7: Enable DLP Scanning for CASB

Scan files in SaaS apps for sensitive data.

### 7.1 Prerequisites

- DLP profiles configured (Module 05)
- CASB integration active

### 7.2 Enable DLP for Integration

1. Go to the CASB integration
2. Click **"Edit"**
3. Enable **"DLP scanning"**
4. Select DLP profiles to use:
   - Financial Information
   - Credentials
   - Custom profiles
5. Click **"Save"**

### 7.3 View DLP Findings

**Go to:** CASB > Findings

Filter by: **DLP**

You'll see files containing:
- Credit card numbers
- Social security numbers
- API keys
- Custom patterns

---

## Step 8: Shadow IT Discovery

Identify unauthorized SaaS applications.

### 8.1 How Shadow IT Detection Works

Gateway analyzes HTTP traffic to identify:
- SaaS applications being accessed
- Usage frequency
- Users accessing each app
- Data transferred

### 8.2 View Shadow IT Report

**Go to:** Insights > Analytics > Access > Shadow IT

### 8.3 Review Discovered Apps

For each application, see:
- Application name and category
- Number of users
- Total requests
- Data uploaded/downloaded
- Risk score

### 8.4 Take Action on Shadow IT

| Action | When to Use |
|--------|-------------|
| Sanction | Approve for business use |
| Unsanction | Mark as unauthorized |
| Block | Create policy to block access |
| Monitor | Continue monitoring usage |

### 8.5 Block Unauthorized Apps

1. Identify high-risk unauthorized app
2. Go to Traffic Policies > HTTP
3. Create block policy:

| Selector | Operator | Value |
|----------|----------|-------|
| Application | is | [Unauthorized App] |

**Action:** Block

---

## Step 9: Create CASB Alerts

Get notified of new security findings.

### 9.1 Access Notifications

**Go to:** Settings > Notifications

### 9.2 Create CASB Alert

1. Click **"Add notification"**
2. **Name:** `Critical CASB Findings`
3. **Type:** CASB
4. **Severity:** Critical, High
5. **Delivery:** Email, Webhook, or PagerDuty
6. Click **"Save"**

### 9.3 Alert Types

| Alert | Trigger |
|-------|---------|
| New critical finding | Critical severity finding detected |
| Public file detected | File shared publicly |
| DLP match | Sensitive data found in file |
| New admin | New admin user created |

---

## Step 10: Remediation Workflows

### 10.1 Manual Remediation

1. Review finding in CASB
2. Click link to SaaS admin console
3. Make necessary changes
4. Return to CASB and verify

### 10.2 Bulk Actions

For multiple similar findings:
1. Select multiple findings
2. Click **"Bulk actions"**
3. Choose action:
   - Dismiss all
   - Export to CSV
   - Create policy

### 10.3 Automated Remediation (Future)

Some integrations support automated remediation:
- Revoke file sharing
- Disable user account
- Remove external access

---

## Best Practices

### 10.1 Regular Reviews

- Review critical findings daily
- Review high findings weekly
- Full review monthly

### 10.2 Prioritize Remediation

1. Critical findings first
2. High-risk users (admins, executives)
3. Publicly shared sensitive data
4. Configuration weaknesses

### 10.3 Document Exceptions

- Document accepted risks
- Review exceptions quarterly
- Remove stale exceptions

### 10.4 Integrate with Workflows

- Export findings to ticketing system
- Create remediation SLAs
- Track remediation metrics

---

## Troubleshooting

### "Integration not syncing"

- Check API credentials are valid
- Verify admin permissions
- Re-authorize integration
- Check for API rate limits

### "Missing findings"

- Wait for initial scan to complete
- Check scan scope settings
- Verify integration has necessary permissions

### "Too many findings"

- Focus on critical/high severity first
- Use filters to prioritize
- Create policies to prevent new issues
- Bulk dismiss accepted risks

### "Can't access SaaS admin console"

- Verify you have admin access
- Check SSO configuration
- Contact SaaS administrator

---

## What You Learned

| Skill | Done |
|-------|------|
| Understand CASB concepts | |
| Integrate Microsoft 365 | |
| Integrate Google Workspace | |
| Review security findings | |
| Enable DLP for CASB | |
| Discover shadow IT | |
| Create CASB alerts | |
| Remediate findings | |

---

## Quick Reference

### Supported Integrations

| Application | API Scans | DLP Support |
|-------------|-----------|-------------|
| Microsoft 365 | Yes | Yes |
| Google Workspace | Yes | Yes |
| Salesforce | Yes | Yes |
| GitHub | Yes | Yes |
| Slack | Yes | Yes |
| Box | Yes | Yes |
| Dropbox | Yes | Yes |
| Zoom | Yes | No |

### Finding Severities

| Severity | Response Time |
|----------|---------------|
| Critical | Immediate |
| High | Within 24 hours |
| Medium | Within 1 week |
| Low | As resources allow |

### Common Remediation Actions

| Finding Type | Action |
|--------------|--------|
| MFA not enabled | Enable MFA |
| Public sharing | Restrict access |
| External forwarding | Remove rule |
| Inactive account | Disable account |
| Sensitive data exposed | Remove file or restrict |

---

## Next Steps

You have configured CASB to secure your SaaS applications!

**Return to:** [Workshop Summary](./09-workshop-summary.md)

Or continue with other modules you may have skipped.
