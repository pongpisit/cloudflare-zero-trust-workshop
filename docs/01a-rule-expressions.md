# Module 01a: Understanding Cloudflare Rule Expressions

**Duration:** 20 minutes

## What You Will Learn

- Understand how Cloudflare Zero Trust rules work
- Master the three signal types: Traffic, Identity, Device
- Use logical operators: `and`, `or`, `not`
- Use comparison operators: `in`, `not in`, `matches regex`, `contains`
- Work with Lists for scalable policy management
- Build complex expressions with multiple conditions

---

## Why This Matters

Every security feature in Cloudflare Zero Trust uses the same rule-building pattern:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Cloudflare Zero Trust Rule Engine                        │
│                                                                              │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                     │
│   │   Traffic   │    │  Identity   │    │   Device    │                     │
│   │   Signals   │    │   Signals   │    │   Signals   │                     │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                     │
│          │                  │                  │                             │
│          └──────────────────┼──────────────────┘                             │
│                             │                                                │
│                             ▼                                                │
│                    ┌─────────────────┐                                       │
│                    │    Operators    │                                       │
│                    │  and, or, not   │                                       │
│                    │  in, contains   │                                       │
│                    └────────┬────────┘                                       │
│                             │                                                │
│                             ▼                                                │
│                    ┌─────────────────┐                                       │
│                    │     Action      │                                       │
│                    │ Allow/Block/... │                                       │
│                    └─────────────────┘                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Once you understand this pattern, you can build any policy.**

---

## The Three Signal Types

### 1. Traffic Signals (What is being accessed?)

Traffic signals describe the network request itself.

```
┌─────────────────────────────────────────────────────────────────┐
│                      Traffic Signals                             │
│                                                                  │
│   DNS Policies          HTTP Policies         Network Policies   │
│   ─────────────         ─────────────         ────────────────   │
│   • Domain              • URL                 • Destination IP   │
│   • Query Type          • Host                • Destination Port │
│   • Source IP           • URL Path            • Protocol         │
│   • Location            • HTTP Method         • SNI              │
│   • Resolver IP         • Application         │                  │
│                         • File Types          │                  │
│                         • Content Type        │                  │
│                                                                  │
│   Categories (shared across policy types):                       │
│   • Security Categories (Malware, Phishing, C2, etc.)           │
│   • Content Categories (Adult, Gambling, Social Media, etc.)    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Examples:**
| Signal | Example Value | Use Case |
|--------|---------------|----------|
| Domain | `facebook.com` | Block specific sites |
| Security Categories | `Malware, Phishing` | Block threats |
| Content Categories | `Social Media` | Productivity filtering |
| Application | `Dropbox` | Control SaaS apps |
| Download File Types | `Executable` | Block risky downloads |

---

### 2. Identity Signals (Who is making the request?)

Identity signals describe the user making the request.

```
┌─────────────────────────────────────────────────────────────────┐
│                      Identity Signals                            │
│                                                                  │
│   ┌─────────────────┐                                           │
│   │  User Identity  │                                           │
│   │                 │                                           │
│   │  • User Email   │◄──── From WARP authentication             │
│   │  • Email Domain │      or Access login                      │
│   │  • User Groups  │                                           │
│   └────────┬────────┘                                           │
│            │                                                     │
│            ▼                                                     │
│   ┌─────────────────┐                                           │
│   │ Identity Provider│                                          │
│   │    Attributes    │                                          │
│   │                  │                                          │
│   │  • Azure AD Groups│◄──── From IdP integration               │
│   │  • Okta Groups    │                                         │
│   │  • SAML Attributes│                                         │
│   │  • OIDC Claims    │                                         │
│   └──────────────────┘                                          │
│                                                                  │
│   Access-Specific:                                               │
│   • Access Groups (reusable identity groups)                    │
│   • Service Tokens (for automated systems)                      │
│   • Login Methods (OTP, Azure, Google, etc.)                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Examples:**
| Signal | Example Value | Use Case |
|--------|---------------|----------|
| User Email | `john@company.com` | Allow specific user |
| Emails ending in | `@company.com` | Allow all company users |
| Access Groups | `Engineering` | Group-based access |
| Country | `Thailand` | Geo-based restrictions |

---

### 3. Device Signals (What device is being used?)

Device signals describe the endpoint making the request.

```
┌─────────────────────────────────────────────────────────────────┐
│                       Device Signals                             │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    Device Posture                        │   │
│   │                                                          │   │
│   │   Operating System        Security Software              │   │
│   │   ─────────────────       ─────────────────              │   │
│   │   • OS Version            • Firewall Enabled             │   │
│   │   • OS Type               • Disk Encryption              │   │
│   │   • Architecture          • Antivirus Running            │   │
│   │                           • EDR Present                  │   │
│   │                                                          │   │
│   │   Compliance              Device Info                    │   │
│   │   ──────────              ───────────                    │   │
│   │   • Intune Compliance     • Serial Number                │   │
│   │   • Tanium Health         • Device ID                    │   │
│   │   • CrowdStrike Score     • Manufacturer                 │   │
│   │                                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   WARP Client Info:                                              │
│   • WARP Client Version                                         │
│   • Gateway Status (connected/disconnected)                     │
│   • Enrolled Device (managed vs unmanaged)                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Examples:**
| Signal | Example Value | Use Case |
|--------|---------------|----------|
| Firewall | Enabled | Require firewall on |
| Disk Encryption | Encrypted | Require encryption |
| OS Version | >= 14.0 | Require updated OS |
| Device Platform | macOS, Windows | Limit to specific OS |

---

## Operators

### Comparison Operators

```
┌─────────────────────────────────────────────────────────────────┐
│                    Comparison Operators                          │
│                                                                  │
│   Operator          Description              Example             │
│   ────────          ───────────              ───────             │
│   is                Exact match              Domain is "x.com"   │
│   is not            Not exact match          Domain is not "x"   │
│   in                Value in set             Category in {A,B}   │
│   not in            Value not in set         App not in {X,Y}    │
│   contains          String contains          URL contains "api"  │
│   does not contain  String doesn't contain   URL !contain "test" │
│   matches regex     Regular expression       Domain ~ ".*\.cn$"  │
│   greater than      Numeric comparison       Port > 1024         │
│   less than         Numeric comparison       Risk Score < 50     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Logical Operators

```
┌─────────────────────────────────────────────────────────────────┐
│                     Logical Operators                            │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  AND (all conditions must be true)                       │   │
│   │                                                          │   │
│   │  Condition A ──┐                                         │   │
│   │                ├──► AND ──► Result (true only if both)   │   │
│   │  Condition B ──┘                                         │   │
│   │                                                          │   │
│   │  Example: Domain is "dropbox.com" AND User not in IT     │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  OR (any condition can be true)                          │   │
│   │                                                          │   │
│   │  Condition A ──┐                                         │   │
│   │                ├──► OR ──► Result (true if either)       │   │
│   │  Condition B ──┘                                         │   │
│   │                                                          │   │
│   │  Example: Category is "Malware" OR Category is "Phishing"│   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  NOT (invert condition)                                  │   │
│   │                                                          │   │
│   │  Condition ──► NOT ──► Inverted Result                   │   │
│   │                                                          │   │
│   │  Example: User NOT in "Contractors" group                │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Working with Lists

Lists let you manage values centrally and reuse them across policies.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Lists Architecture                            │
│                                                                  │
│   ┌─────────────────┐                                           │
│   │  Managed List   │                                           │
│   │                 │                                           │
│   │  allowed-saas   │                                           │
│   │  ─────────────  │                                           │
│   │  dropbox.com    │                                           │
│   │  slack.com      │◄──── Update once                          │
│   │  notion.so      │                                           │
│   │  figma.com      │                                           │
│   └────────┬────────┘                                           │
│            │                                                     │
│            │ Referenced by                                       │
│            ▼                                                     │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                          │   │
│   │  DNS Policy: "Allow SaaS"                                │   │
│   │  ─────────────────────────                               │   │
│   │  Domain in list "allowed-saas" → Allow                   │   │
│   │                                                          │   │
│   │  HTTP Policy: "Bypass Inspection for SaaS"               │   │
│   │  ──────────────────────────────────────────              │   │
│   │  Host in list "allowed-saas" → Do Not Inspect            │   │
│   │                                                          │   │
│   │  Access Policy: "Allow SaaS Apps"                        │   │
│   │  ─────────────────────────────────                       │   │
│   │  Application domain in list "allowed-saas" → Allow       │   │
│   │                                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   Benefits:                                                      │
│   ✅ Single source of truth                                     │
│   ✅ Update once, apply everywhere                              │
│   ✅ Easier auditing                                            │
│   ✅ Reduces policy errors                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### List Types

| List Type | Contains | Use Case |
|-----------|----------|----------|
| **Domain** | Domain names | Allow/block specific sites |
| **URL** | Full URLs | Block specific pages |
| **IP** | IP addresses/CIDRs | Network-based rules |
| **Hostname** | Hostnames | Internal resources |
| **Serial Number** | Device serials | Device allowlisting |

### Creating a List

**Go to:** Reusable components > Lists

1. Click **Create a list**
2. Choose list type (Domain, URL, IP, etc.)
3. Enter values (one per line or upload CSV)
4. Save the list

---

## Building Complex Expressions

### Expression Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                   Expression Structure                           │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                     Expression                           │   │
│   │                                                          │   │
│   │   ┌───────────────────────────────────────────────────┐ │   │
│   │   │  Condition Group 1 (OR within group)              │ │   │
│   │   │                                                    │ │   │
│   │   │  Selector: Security Categories                     │ │   │
│   │   │  Operator: in                                      │ │   │
│   │   │  Value: Malware, Phishing, Spyware                │ │   │
│   │   └───────────────────────────────────────────────────┘ │   │
│   │                         │                                │   │
│   │                        AND                               │   │
│   │                         │                                │   │
│   │   ┌───────────────────────────────────────────────────┐ │   │
│   │   │  Condition Group 2                                 │ │   │
│   │   │                                                    │ │   │
│   │   │  Selector: User Group                              │ │   │
│   │   │  Operator: not in                                  │ │   │
│   │   │  Value: Security Team                              │ │   │
│   │   └───────────────────────────────────────────────────┘ │   │
│   │                                                          │   │
│   │   Result: Block threats for everyone except Security    │   │
│   │                                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Practical Examples

### Example 1: DNS Policy - Block Threats Except for Security Team

**Goal:** Block malware/phishing for all users, but allow Security team to access for research.

```
┌─────────────────────────────────────────────────────────────────┐
│  Policy: "Block Security Threats"                                │
│                                                                  │
│  Traffic:                                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Security Categories  IN  { Malware, Phishing, C2 }     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              AND                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  User Group  NOT IN  { Security Team }                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Action: BLOCK                                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**In the Dashboard:**
1. Selector: `Security Categories` → Operator: `in` → Value: `Malware, Phishing, Command and Control`
2. Click **Add condition**
3. Selector: `User Group Identity` → Operator: `not in` → Value: `Security Team`
4. Action: `Block`

---

### Example 2: HTTP Policy - Block File Downloads on Unmanaged Devices

**Goal:** Prevent downloading executables on personal/unmanaged devices.

```
┌─────────────────────────────────────────────────────────────────┐
│  Policy: "Block Risky Downloads - Unmanaged"                     │
│                                                                  │
│  Traffic:                                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Download File Types  IN  { Executable, Script, Archive }│    │
│  └─────────────────────────────────────────────────────────┘    │
│                              AND                                 │
│  Device:                                                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Passed Device Posture Checks  IS  false                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Action: BLOCK                                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Example 3: Access Policy - Allow Employees on Compliant Devices

**Goal:** Only allow access to internal app for employees with compliant devices.

```
┌─────────────────────────────────────────────────────────────────┐
│  Policy: "Allow Compliant Employees"                             │
│                                                                  │
│  Include (who can access):                                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Emails ending in  @company.com                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Require (additional conditions):                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Device Posture: Firewall  IS  Enabled                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              AND                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Device Posture: Disk Encryption  IS  Encrypted         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Action: ALLOW                                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Example 4: Using Lists - Block Personal Email on Work Devices

**Goal:** Block access to personal email providers.

**Step 1: Create a List**
- Name: `personal-email-domains`
- Type: Domain
- Values:
  ```
  gmail.com
  yahoo.com
  hotmail.com
  outlook.com
  protonmail.com
  ```

**Step 2: Create DNS Policy**

```
┌─────────────────────────────────────────────────────────────────┐
│  Policy: "Block Personal Email"                                  │
│                                                                  │
│  Traffic:                                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Domain  IN LIST  "personal-email-domains"              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Action: BLOCK                                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Policy Evaluation Order

```
┌─────────────────────────────────────────────────────────────────┐
│                  Policy Evaluation Order                         │
│                                                                  │
│   Request comes in                                               │
│         │                                                        │
│         ▼                                                        │
│   ┌─────────────┐                                               │
│   │  Policy 1   │──► Match? ──► YES ──► Apply Action & STOP     │
│   │ (Priority 1)│              │                                │
│   └─────────────┘              NO                               │
│         │                      │                                │
│         ▼                      ▼                                │
│   ┌─────────────┐                                               │
│   │  Policy 2   │──► Match? ──► YES ──► Apply Action & STOP     │
│   │ (Priority 2)│              │                                │
│   └─────────────┘              NO                               │
│         │                      │                                │
│         ▼                      ▼                                │
│   ┌─────────────┐                                               │
│   │  Policy 3   │──► Match? ──► YES ──► Apply Action & STOP     │
│   │ (Priority 3)│              │                                │
│   └─────────────┘              NO                               │
│         │                      │                                │
│         ▼                      ▼                                │
│   ┌─────────────┐                                               │
│   │  Default    │──► Apply default action (usually Allow)       │
│   │   Action    │                                               │
│   └─────────────┘                                               │
│                                                                  │
│   ⚠️  First matching policy wins!                               │
│   ⚠️  Order your policies from most specific to least specific  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Best Practice: Policy Order

1. **Allow exceptions first** (bypass rules for specific users/apps)
2. **Block high-risk** (security threats, malware)
3. **Block by policy** (content categories, applications)
4. **Allow everything else** (implicit or explicit)

---

## Quick Reference

### Signal Availability by Policy Type

| Signal Type | DNS | HTTP | Network | Access |
|-------------|-----|------|---------|--------|
| Domain | ✅ | ✅ | ❌ | ✅ |
| URL/Path | ❌ | ✅ | ❌ | ✅ |
| Application | ❌ | ✅ | ❌ | ❌ |
| File Types | ❌ | ✅ | ❌ | ❌ |
| User Identity | ✅ | ✅ | ✅ | ✅ |
| User Groups | ✅ | ✅ | ✅ | ✅ |
| Device Posture | ✅ | ✅ | ✅ | ✅ |
| Source IP | ✅ | ✅ | ✅ | ✅ |
| Country | ✅ | ✅ | ✅ | ✅ |

### Common Operator Patterns

| Pattern | Expression | Use Case |
|---------|------------|----------|
| Match any in set | `Category in {A, B, C}` | Block multiple categories |
| Exclude from rule | `User not in {Admins}` | Exempt specific users |
| Match pattern | `Domain matches regex ".*\.cn$"` | Block TLD |
| Use managed list | `Domain in list "blocklist"` | Scalable blocking |
| Combine conditions | `A and B and C` | All must match |
| Alternative conditions | `A or B` | Any can match |

---

## Next Steps

Now that you understand rule expressions, apply them in:

- **Module 02:** [DNS Filtering](./02-dns-filtering.md) - DNS policy expressions
- **Module 03:** [Secure Web Gateway](./03-secure-web-gateway.md) - HTTP policy expressions
- **Module 06:** [ZTNA](./06-ztna.md) - Access policy expressions
- **Module 07:** [Browser Isolation](./07-browser-isolation.md) - Isolation policy expressions

---

## Summary

| Concept | Key Points |
|---------|------------|
| **Signals** | Traffic (what), Identity (who), Device (how) |
| **Operators** | `and`, `or`, `not`, `in`, `not in`, `contains`, `matches regex` |
| **Lists** | Centralized value management, reusable across policies |
| **Evaluation** | First match wins, order matters |
| **Best Practice** | Specific exceptions first, then blocks, then allows |
