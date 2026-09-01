# TH3ORY Masterclass — BIMI & VMC Official DNS Configuration

This guide provides the exact production DNS records required to enforce **BIMI (Brand Indicators for Message Identification)** and **VMC (Verified Mark Certificate)** verification for `th3ory.online`.

---

## 1. Prerequisites (Strict DMARC Policy)

BIMI requires that your sending domain has an active, strictly enforced DMARC policy with either `p=quarantine` (at 100%) or `p=reject`.

### A. SPF Record
Add/verify TXT record at apex domain `@`:
```dns
Type:  TXT
Host:  @ (or th3ory.online)
Value: v=spf1 include:resend.com ~all
TTL:   3600
```

### B. DKIM Record (Resend / Provider)
Add CNAME or TXT records provided by Resend in your domain dashboard:
```dns
Type:  CNAME (or TXT)
Host:  resend._domainkey.th3ory.online
Value: (Configured via Resend Dashboard)
TTL:   3600
```

### C. DMARC Enforcement Record
Add TXT record at `_dmarc.th3ory.online`:
```dns
Type:  TXT
Host:  _dmarc
Value: v=DMARC1; p=reject; sp=reject; pct=100; rua=mailto:dmarc@th3ory.online; ruf=mailto:dmarc@th3ory.online; aspf=s; adkim=s;
TTL:   3600
```

---

## 2. BIMI DNS TXT Record

Add the official BIMI DNS TXT record at the selector subdomain `default._bimi.th3ory.online`:

```dns
Type:  TXT
Host:  default._bimi
Value: v=BIMI1; l=https://th3ory.online/bimi-logo.svg; a=https://th3ory.online/bimi-vmc.pem;
TTL:   3600
```

### Explanation of BIMI Parameters:
- `v=BIMI1`: Declares the BIMI version specification.
- `l=https://th3ory.online/bimi-logo.svg`: Publicly accessible HTTPS URL pointing to the SVG Tiny 1.2 PS vector logo asset.
- `a=https://th3ory.online/bimi-vmc.pem`: Publicly accessible HTTPS URL pointing to the Verified Mark Certificate PEM chain.

---

## 3. Hosted BIMI & VMC Artifacts

The following files are published in the `public/` webroot and accessible on `th3ory.online`:

| Asset File | Public HTTPS URL | Description |
|---|---|---|
| **BIMI SVG Tiny 1.2 PS** | `https://th3ory.online/bimi-logo.svg` | Verified square vector mark (512x512) compliant with IETF SVG Tiny P/S standard. |
| **VMC Certificate (PEM)** | `https://th3ory.online/bimi-vmc.pem` | Cryptographic Verified Mark Certificate chain with embedded logotype extensions. |
| **VMC Certificate (VMC)** | `https://th3ory.online/th3ory.vmc` | Direct `.vmc` file standard container. |
| **Email Logo Avatar** | `https://th3ory.online/logo-transparent.png` | High-res PNG logo avatar embedded in email bodies. |

---

## 4. Email Profile Picture (Google Workspace & Gravatar)

In addition to BIMI:
1. **Google Workspace / Gmail Profile Picture**:
   - In Google Workspace Admin or the sending Google account (`team@th3ory.online`, `th3orymasterclass@gmail.com`), upload `public/bimi-logo.svg` or `public/logo.png` as the official account profile avatar.
2. **Gravatar**:
   - Associate `team@th3ory.online`, `ambassador@th3ory.online`, and `enterprise@th3ory.online` with the avatar on [gravatar.com](https://gravatar.com) for universal fallback display.

---

## 5. Verification Tools

You can verify your live BIMI and VMC setup using:
- **BIMI Group Official Inspector**: [https://bimigroup.org/bimi-generator/](https://bimigroup.org/bimi-generator/)
- **DigiCert BIMI / VMC Validator**: [https://www.digicert.com/help/](https://www.digicert.com/help/)
- **MXToolbox BIMI Check**: [https://mxtoolbox.com/bimi.aspx](https://mxtoolbox.com/bimi.aspx)
- **Local Validator Script**: Run `node scripts/bimi-validator.js`
