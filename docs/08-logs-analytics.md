# Module 08: Logs, Analytics & Monitoring

**Duration:** 30 minutes

## What You Will Learn

- Navigate Gateway logs (DNS, HTTP, Network)
- Use Access logs for authentication events
- Understand Analytics dashboards
- Set up notifications and alerts
- Export logs for SIEM integration
- Configure log retention (90 days)
- Troubleshoot common issues using logs

---

## Why Logs Matter

```
┌─────────────────────────────────────────────────────────────────┐
│                    Security Visibility                          │
│                                                                 │
│   Without Logs              With Cloudflare Logs                │
│   ─────────────             ──────────────────────              │
│   ❌ Blind spots            ✅ Complete visibility              │
│   ❌ Slow investigation     ✅ Real-time insights               │
│   ❌ No audit trail         ✅ Full audit trail                 │
│   ❌ Reactive security      ✅ Proactive detection              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Access Gateway Logs

### 1.1 Navigate to Logs

1. Open https://one.dash.cloudflare.com/
2. In the left sidebar, click **Logs**
3. Click **Gateway**

### 1.2 Log Types

| Log Type | What It Shows |
|----------|---------------|
| **DNS** | All DNS queries and responses |
| **HTTP** | All HTTP/HTTPS requests |
| **Network** | TCP/UDP connections |

---

## Step 2: Understanding DNS Logs

### 2.1 Access DNS Logs

1. Go to **Logs** > **Gateway** > **DNS**

### 2.2 Log Fields

| Field | Description |
|-------|-------------|
| Timestamp | When the query occurred |
| User | Email of the user (if authenticated) |
| Device | Device name |
| Query | Domain being resolved |
| Query Type | A, AAAA, CNAME, etc. |
| Action | Allowed, Blocked, Override |
| Policy | Which policy matched |
| Categories | Content/security categories |

### 2.3 Filter DNS Logs

**Common filters:**

| Filter | Use Case |
|--------|----------|
| Action = Block | See what's being blocked |
| User = specific@email.com | Investigate specific user |
| Query contains "facebook" | Find specific domain queries |
| Categories = Malware | Security threat queries |

### 2.4 Example: Find Blocked Threats

1. Click **Add filter**
2. Select **Action** = **Block**
3. Select **Security Categories** = **Any**
4. Review blocked malicious domains

---

## Step 3: Understanding HTTP Logs

### 3.1 Access HTTP Logs

1. Go to **Logs** > **Gateway** > **HTTP**

### 3.2 Log Fields

| Field | Description |
|-------|-------------|
| Timestamp | When the request occurred |
| User | Email of the user |
| Device | Device name |
| URL | Full URL requested |
| Host | Domain name |
| Method | GET, POST, PUT, etc. |
| Action | Allowed, Blocked, Isolated |
| Policy | Which policy matched |
| File Type | If file download/upload |
| DLP Profile | If DLP matched |

### 3.3 Filter HTTP Logs

**Common filters:**

| Filter | Use Case |
|--------|----------|
| Action = Block | See blocked requests |
| File Type = Executable | Find .exe downloads |
| DLP Profile = any | Find DLP matches |
| Application = Facebook | Find app usage |

### 3.4 Example: Find DLP Violations

1. Click **Add filter**
2. Select **DLP Profiles** = **Any**
3. Review sensitive data detections

---

## Step 4: Access Logs (Authentication)

### 4.1 Navigate to Access Logs

1. Go to **Logs** > **Access**

### 4.2 Log Fields

| Field | Description |
|-------|-------------|
| Timestamp | When authentication occurred |
| User | Email of the user |
| Application | Which app was accessed |
| Action | Allowed, Blocked |
| Country | User's location |
| Device | Device information |
| Identity Provider | How user authenticated |

### 4.3 Example: Find Failed Logins

1. Click **Add filter**
2. Select **Action** = **Block**
3. Review blocked access attempts

---

## Step 5: Analytics Dashboards

### 5.1 Gateway Analytics

1. Go to **Analytics** > **Gateway**

**Available metrics:**
- Total DNS queries
- Blocked vs allowed
- Top blocked domains
- Top categories
- Traffic by location
- Traffic by user

### 5.2 Access Analytics

1. Go to **Analytics** > **Access**

**Available metrics:**
- Total logins
- Logins by application
- Logins by user
- Failed login attempts
- Login locations

### 5.3 Shadow IT Discovery

1. Go to **Analytics** > **Access** > **Shadow IT**

**See:**
- Discovered SaaS applications
- Usage by application
- Users per application
- Risk scores

---

## Step 6: Set Up Notifications

### 6.1 Access Notifications

1. Go to **Settings** > **Notifications**
2. Click **Add**

### 6.2 Notification Types

| Type | Triggers |
|------|----------|
| Gateway | DNS/HTTP policy matches |
| Access | Login events |
| CASB | Security findings |
| DEX | Performance issues |

### 6.3 Create Security Alert

**Example: Alert on malware blocks**

1. Click **Add**
2. **Name:** `Malware Block Alert`
3. **Product:** Gateway
4. **Event:** Block
5. **Filter:** Security Categories = Malware
6. **Delivery:** Email, Webhook, or PagerDuty
7. Click **Save**

### 6.4 Recommended Alerts

| Alert | Trigger | Priority |
|-------|---------|----------|
| Malware blocked | Security category = Malware | High |
| DLP violation | DLP profile matched | High |
| Failed Access login | Access action = Block | Medium |
| New CASB finding | CASB severity = Critical | High |
| Device offline | DEX device status | Low |

---

## Step 7: Export Logs

### 7.1 Manual Export

1. Go to **Logs** > **Gateway** > **DNS** (or HTTP)
2. Apply filters as needed
3. Click **Export**
4. Choose format: CSV or JSON
5. Download file

### 7.2 Logpush (Automated Export)

For continuous log export to SIEM:

1. Go to **Logs** > **Logpush**
2. Click **Create Logpush job**
3. Select log type (Gateway DNS, HTTP, etc.)
4. Choose destination:
   - Amazon S3
   - Google Cloud Storage
   - Azure Blob
   - Splunk
   - Datadog
   - Sumo Logic
5. Configure credentials
6. Click **Save**

### 7.3 Supported SIEM Integrations

| SIEM | Integration |
|------|-------------|
| Splunk | Direct integration |
| Microsoft Sentinel | Via Azure Blob |
| Datadog | Direct integration |
| Sumo Logic | Direct integration |
| Elastic | Via S3 or GCS |
| QRadar | Via S3 |

---

## Step 8: Troubleshooting with Logs

### 8.1 "User can't access a website"

**Steps:**
1. Go to **Logs** > **Gateway** > **DNS**
2. Filter by user email
3. Search for the domain
4. Check if blocked and which policy

**Resolution:**
- If blocked by policy: Create allow policy
- If blocked by category: Add to bypass list

### 8.2 "Application not working"

**Steps:**
1. Go to **Logs** > **Gateway** > **HTTP**
2. Filter by user and application
3. Look for blocked requests
4. Check if TLS inspection is causing issues

**Resolution:**
- Add to Do Not Inspect policy
- Check for certificate pinning

### 8.3 "User can't authenticate"

**Steps:**
1. Go to **Logs** > **Access**
2. Filter by user email
3. Check action and reason

**Resolution:**
- Verify user matches Access policy
- Check identity provider configuration
- Verify device posture requirements

### 8.4 "DLP false positive"

**Steps:**
1. Go to **Logs** > **Gateway** > **HTTP**
2. Filter by DLP profile
3. Find the specific match
4. Review matched content

**Resolution:**
- Adjust DLP pattern
- Create exception for specific destination
- Tune minimum match count

---

## Step 9: Log Retention

### 9.1 Default Retention

| Log Type | Free Plan | Paid Plans |
|----------|-----------|------------|
| Gateway DNS | 24 hours | 30 days |
| Gateway HTTP | 24 hours | 30 days |
| Access | 24 hours | 30 days |

### 9.2 Extended Retention to 90 Days

**Best practice: Retain logs for at least 90 days for compliance and forensics.**

To achieve 90-day retention, use **Logpush** to export logs to cloud storage:

#### Option 1: Cloudflare R2 Storage

1. Go to **Logs** > **Logpush**
2. Click **Create Logpush job**
3. Select log type: Gateway DNS, Gateway HTTP
4. Destination: **Cloudflare R2**
5. Configure R2 bucket
6. Set retention policy to 90+ days

#### Option 2: External Cloud Storage

Export to your preferred cloud storage:

| Provider | Retention |
|----------|-----------|
| Amazon S3 | Configure lifecycle policy |
| Google Cloud Storage | Configure retention policy |
| Azure Blob Storage | Configure retention policy |

#### Option 3: SIEM Integration

Export to SIEM with 90-day retention:
- Splunk
- Microsoft Sentinel
- Datadog
- Sumo Logic

### 9.3 Configure Logpush for 90-Day Retention

1. Go to **Logs** > **Logpush**
2. Click **Create Logpush job**
3. **Log type:** Gateway DNS
4. **Destination:** R2 or S3
5. **Frequency:** Every 5 minutes
6. Click **Save**

Repeat for Gateway HTTP logs.

### 9.4 Verify Log Storage

After configuring Logpush:
1. Wait for logs to be pushed (5-15 minutes)
2. Check destination storage for log files
3. Verify retention policy is set to 90+ days

---

## Step 10: Best Practices

### 10.1 Regular Review Schedule

| Frequency | Review |
|-----------|--------|
| Daily | Critical alerts, blocked threats |
| Weekly | Top blocked domains, DLP matches |
| Monthly | Trends, policy effectiveness |
| Quarterly | Full security review |

### 10.2 Key Metrics to Track

| Metric | Target | Action if Exceeded |
|--------|--------|-------------------|
| Malware blocks | Track trend | Investigate source |
| DLP violations | Minimize | User training |
| Failed logins | Track trend | Investigate attempts |
| Policy blocks | Review | Tune policies |

### 10.3 Create Dashboards

Export key metrics to your monitoring tools:
- Security operations dashboard
- Executive summary dashboard
- Compliance reporting dashboard

---

## Troubleshooting

### "No logs appearing"

- Verify WARP client is connected
- Check Gateway proxy is enabled
- Wait a few minutes for logs to appear
- Verify user is in your organization

### "Can't export logs"

- Check your plan supports export
- Verify destination credentials
- Check log volume limits

### "Missing user information"

- User must be authenticated via WARP
- Check device enrollment
- Verify identity provider integration

---

## What You Learned

| Skill | Done |
|-------|------|
| Navigate Gateway logs | |
| Filter and search logs | |
| Use Analytics dashboards | |
| Set up notifications | |
| Export logs to SIEM | |
| Troubleshoot using logs | |

---

## Quick Reference

### Log Locations

| Log Type | Path |
|----------|------|
| DNS | Logs > Gateway > DNS |
| HTTP | Logs > Gateway > HTTP |
| Network | Logs > Gateway > Network |
| Access | Logs > Access |

### Common Filters

| Filter | Syntax |
|--------|--------|
| User | user.email = "user@company.com" |
| Action | action = "block" |
| Domain | query contains "domain.com" |
| Category | categories in {"Malware"} |

### Alert Priorities

| Priority | Response Time |
|----------|---------------|
| Critical | Immediate |
| High | Within 1 hour |
| Medium | Within 24 hours |
| Low | Weekly review |

---

## Next Module

You now have complete visibility into your Zero Trust deployment!

**Next:** [Module 09: Workshop Summary](./09-workshop-summary.md)

Review what you've built and learn about next steps.
