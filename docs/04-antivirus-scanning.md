# Module 04: Anti-Virus & File Scanning

**Duration:** 30 minutes

## What You Will Learn

- Enable anti-virus scanning in Gateway
- Configure scan settings for uploads and downloads
- Handle non-scannable files
- View malware detection logs
- Test AV scanning functionality

---

## How Anti-Virus Scanning Works

```
┌──────────┐                    ┌─────────────────────────────────┐
│  User    │     File           │      Cloudflare Gateway         │
│  Device  │ ──────────────────►│                                 │
│  (WARP)  │   Upload/Download  │  ┌─────────────────────────┐    │
└──────────┘                    │  │    AV Scanning Engine   │    │
                                │  │                         │    │
                                │  │  • Signature Detection  │    │
                                │  │  • Heuristic Analysis   │    │
                                │  │  • Threat Intelligence  │    │
                                │  └───────────┬─────────────┘    │
                                │              │                  │
                                │         ┌────┴────┐             │
                                │         │         │             │
                                │      Clean     Malware          │
                                │         │         │             │
                                │         ▼         ▼             │
                                │      Allow      Block           │
                                └─────────────────────────────────┘
```

**Cloudflare AV scanning:**
- Scans files in real-time during upload/download
- Uses multiple detection engines
- Integrates with Cloudflare threat intelligence
- Supports common file types and archives

---

## Prerequisites

Before enabling AV scanning:
- Gateway proxy must be enabled (Module 03)
- TLS inspection must be enabled (Module 03)
- WARP client connected to Zero Trust

---

## Step 1: Enable Anti-Virus Scanning

### 1.1 Access Traffic Settings

**Go to:** Traffic policies > Traffic settings

1. Open https://one.dash.cloudflare.com/
2. In the left sidebar, click **Traffic policies**
3. Click **Traffic settings**
4. Scroll to **Anti-virus scanning** section

### 1.2 Enable AV Scanning

Find the **"Anti-virus scanning"** section.

Turn on: **Scan files for malware**

> **Note:** Gateway cannot scan files that are encrypted, password-protected, or larger than 15MB.

### 1.3 Configure Scanning Behavior

Choose scanning options:

| Option | Description | Recommendation |
|--------|-------------|----------------|
| **Scan on file upload** | Scan files being uploaded | ✅ Enable |
| **Scan on file download** | Scan files being downloaded | ✅ Enable |
| **Block requests for files that cannot be scanned** | Block encrypted/corrupted files | ✅ Enable |
| **Display a blocked file notification from the WARP Client** | Show notification to users | ✅ Enable |

**Enable all options** for maximum protection.

---

## Step 2: Configure File Sandboxing (Beta)

### 2.1 Enable File Sandboxing

Turn on: **Open previously unseen files in a sandbox environment**

This allows you to create HTTP policies using the **'Quarantine'** action. Gateway will:
1. Scan files found in traffic matching these policies in a sandbox environment
2. If the sandbox detects malicious activity, Gateway will block the download

### 2.2 Non-Scannable Files

Some files cannot be scanned (encrypted, password-protected, corrupted, unsupported format, or larger than 15MB).

Turn on: **Block requests for files that cannot be scanned**

**Recommendation:** Enable this for high-security environments.

---

## Step 3: What Users See When Files Are Blocked

When a malicious file is blocked, users will see:
- Desktop notification from WARP client (if enabled)
- Block page in browser (if applicable)
- Details about why the file was blocked

---

## Step 4: Create AV-Specific Policies

### 4.1 Block Downloads from Untrusted Sources

**Go to:** Traffic policies > Firewall policies > HTTP

1. Click **"Add a policy"**
2. **Name:** `Block Downloads from Risky Sites`

| Selector | Operator | Value |
|----------|----------|-------|
| Security Risks | in | Suspicious, Unknown |
| AND | | |
| Download File Types | in | All file types |

**Action:** Block

### 4.2 Allow Downloads from Trusted Sources Only

1. Click **"Add a policy"**
2. **Name:** `Allow Downloads from Trusted Sites`

| Selector | Operator | Value |
|----------|----------|-------|
| Host | in | microsoft.com, adobe.com, cloudflare.com |
| AND | | |
| Download File Types | in | Executable |

**Action:** Allow

**Then create a block policy:**

| Selector | Operator | Value |
|----------|----------|-------|
| Download File Types | in | Executable |

**Action:** Block

---

## Step 5: Exclude Specific Files from Scanning

Some legitimate files may trigger false positives.

### 5.1 Create Do Not Scan Policy

**Go to:** Traffic policies > Firewall policies > HTTP

1. Click **"Add a policy"**
2. **Name:** `Do Not Scan - Development Tools`

| Selector | Operator | Value |
|----------|----------|-------|
| Host | in | github.com, npmjs.com, pypi.org |

**Action:** Do Not Scan

### 5.2 Exclude by File Type

| Selector | Operator | Value |
|----------|----------|-------|
| Download File Types | in | Source Code |
| AND | | |
| Host | in | github.com |

**Action:** Do Not Scan

---

## Step 6: Supported File Types

### 6.1 Scannable File Types

Cloudflare AV can scan:

| Category | Extensions |
|----------|------------|
| Executables | .exe, .dll, .msi, .com |
| Scripts | .bat, .cmd, .ps1, .vbs, .js |
| Documents | .pdf, .doc, .docx, .xls, .xlsx |
| Archives | .zip, .rar, .7z, .tar, .gz |
| Images | .jpg, .png, .gif, .bmp |
| Media | .mp3, .mp4, .avi, .mov |

### 6.2 Compressed File Handling

Cloudflare can scan inside compressed files:

| Format | Supported |
|--------|-----------|
| ZIP | Yes |
| RAR | Yes |
| 7Z | Yes |
| TAR | Yes |
| GZIP | Yes |

**Nested archives:** Scanned up to a certain depth.

### 6.3 Non-Scannable Files

Files that cannot be scanned:
- Password-protected archives
- Encrypted files
- Corrupted files
- Files over 15 MB
- Unsupported formats

---

## Step 7: View AV Scan Logs

### 7.1 Access Logs

**Go to:** Insights > Logs (HTTP tab)

### 7.2 Filter for AV Events

Use filters:
- **Action:** Block
- **Block Reason:** Malware

### 7.3 Log Details

Each blocked file shows:
- File name
- File type
- Malware name/signature
- User who attempted download
- Source URL
- Timestamp

### 7.4 Export Logs

Click **"Export"** to download logs as CSV for analysis.

---

## Step 8: Test AV Scanning

### 8.1 EICAR Test File

The EICAR test file is a safe way to test AV detection.

**Download from:** https://www.eicar.org/download-anti-malware-testfile/

Or create a text file with this content:
```
X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*
```

Save as `eicar.com` or `eicar.txt`

### 8.2 Test Download Blocking

1. Ensure WARP is connected
2. Try to download the EICAR test file
3. Gateway should block the download
4. Check logs for the blocked event

### 8.3 Test Upload Blocking

1. Create an EICAR test file locally
2. Try to upload it to a file sharing site
3. Gateway should block the upload
4. Check logs for the blocked event

### 8.4 Verify in Logs

**Go to:** Insights > Logs (HTTP tab)

Look for:
- Action: Block
- File name: eicar
- Threat: EICAR-Test-File

---

## Step 9: Handle False Positives

### 9.1 Identify False Positives

Check logs for:
- Legitimate software being blocked
- Known-good files flagged as malware
- Business-critical files blocked

### 9.2 Create Exception Policy

**Go to:** Traffic policies > Firewall policies > HTTP

1. Click **"Add a policy"**
2. **Name:** `Allow Known Good File`

| Selector | Operator | Value |
|----------|----------|-------|
| Host | is | trusted-vendor.com |
| AND | | |
| URL Path | contains | /downloads/legitimate-tool.exe |

**Action:** Do Not Scan

### 9.3 Report False Positives

Contact Cloudflare support to report false positives for signature updates.

---

## Best Practices

### 9.1 Defense in Depth

AV scanning is one layer. Combine with:
- DNS filtering (Module 02)
- HTTP policies (Module 03)
- DLP (Module 05)
- Endpoint protection

### 9.2 Regular Review

- Review blocked file logs weekly
- Investigate repeated blocks
- Update exception policies as needed

### 9.3 User Education

- Inform users about AV scanning
- Provide guidance on legitimate download sources
- Create process for requesting exceptions

---

## Troubleshooting

### "File not being scanned"

- Verify TLS inspection is enabled
- Check if domain is in Do Not Inspect list
- Verify file size is under 15 MB
- Check if file type is supported

### "Legitimate file blocked"

- Check malware signature in logs
- Create Do Not Scan policy for specific file/source
- Report false positive to Cloudflare

### "No AV events in logs"

- Verify AV scanning is enabled
- Check WARP client is connected
- Verify Gateway proxy is enabled
- Test with EICAR file

### "Large files not scanned"

- Files over 15 MB cannot be scanned
- Create HTTP policy to block large file downloads
- Consider alternative solutions for large file transfers

---

## What You Learned

| Skill | Done |
|-------|------|
| Enable AV scanning | |
| Configure scan settings | |
| Handle non-scannable files | |
| Create AV-specific policies | |
| View malware logs | |
| Test with EICAR file | |
| Handle false positives | |

---

## Quick Reference

### AV Scanning Settings

| Setting | Location |
|---------|----------|
| Enable AV | Traffic policies > Traffic settings |
| Scan uploads | Traffic policies > Traffic settings |
| Scan downloads | Traffic policies > Traffic settings |
| Block non-scannable | Traffic policies > Traffic settings |
| WARP notifications | Traffic policies > Traffic settings |

### File Size Limits

| Limit | Value |
|-------|-------|
| Maximum scannable size | 15 MB |
| Archive scan depth | Multiple levels |

### Common Malware Types Detected

| Type | Description |
|------|-------------|
| Virus | Self-replicating malware |
| Trojan | Disguised malicious software |
| Ransomware | Encryption-based extortion |
| Spyware | Data theft malware |
| Adware | Unwanted advertising software |
| PUP | Potentially Unwanted Programs |

---

## Next Module

You have enabled anti-virus scanning to protect against malware!

**Next:** [Module 05: Device Posture](./05-device-posture.md)

In the next module, you will configure device posture checks and WARP settings.

> **Optional:** [Module 10: Data Loss Prevention](./10-dlp-optional.md) - Configure DLP to detect and protect sensitive data (requires DLP license).
