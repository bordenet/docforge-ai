# SSO Login Fails with HTTP 401 and invalid_audience Error

**Article type:** Troubleshooting
**Applies to:** Product v3.0, Okta and Azure AD integrations
**Audience:** Admin
**Severity:** High
**Estimated time:** ~10 minutes

## Summary

SSO logins fail with `invalid_audience` and an HTTP 401 when the Audience URI in the OAuth app does not match the `aud` claim the identity provider embeds in the token. Affects any admin who has recently re-provisioned the application in Azure AD or Okta.

## When to Use This Article

- Use when: Browser console or server logs show `AUTH_ERR: audience claim mismatch` on SSO login attempts.
- Applies to: Product v3.0 on Cloud (SaaS), Okta Workforce Identity, Azure Active Directory.
- Does not apply when: The error is `invalid_client` or `redirect_uri_mismatch` — see the OAuth Client Setup Guide for those.

## Symptoms

- Error message: `invalid_audience: token rejected by IdP`
- Behavior: Users are silently redirected back to the login page after authentication.
- Logs show: `AUTH_ERR: audience claim mismatch expected=api://TenantA/MyApp got=api://TenantB/OldApp`

## Cause

This occurs because the Audience URI registered in the OAuth application does not match the `aud` claim the identity provider embeds in the SAML or JWT token. The mismatch is caused by the Application ID URI in Azure AD being changed or left at the default value after re-provisioning. When the token reaches the product's auth service, the `aud` claim comparison fails and the session is rejected before being established.

## Environment

- Product: Product v3.0
- Platform: Cloud (SaaS), Chrome 120+, Firefox 115+
- Integrations: Okta Workforce Identity, Azure Active Directory

## Resolution

1. In **Admin → Settings → Authentication → SSO Providers**, click the entry for your identity provider to open the edit panel.
2. Copy the **Audience URI** displayed in the panel (format: `api://<tenant-id>/<app-name>`).
3. In your Azure AD portal, navigate to **Azure Active Directory → App Registrations → <your app> → Expose an API** and set the **Application ID URI** to the copied value exactly.
4. Run `curl -s https://app.example.com/api/auth/debug | jq '.audienceClaim'` to confirm the token audience after saving.
5. If `audienceClaim` in the output still does not match your Audience URI, click **Regenerate Audience URI** in Admin → Settings → Authentication → SSO Providers, then repeat steps 2–4.

## Verification

- You should see: `{"audienceClaim":"api://your-tenant/your-app","valid":true}` in the debug endpoint response within 30 seconds of saving.
- Confirm the SSO login completes without a redirect loop by testing in an incognito window.

## If It Still Fails

- Re-check that the Application ID URI in Azure AD matches exactly, including case and any trailing slashes.
- Escalate when:
  - The audience mismatch persists after 3 retries with verified configuration.
  - The error affects more than 10 users simultaneously.
  - Before escalating, collect: request ID from the browser console Network tab, exact timestamp, the `aud` value from the token debug endpoint, and the Azure AD tenant ID.

## Prevention

- Guardrail: Enable the **Audience URI validation** alert in Admin → Monitoring → Auth Events to catch mismatches before they affect users.
- Long-term fix: Pin the Application ID URI in your IdP provisioning script to prevent accidental drift on re-provisioning.

## Related

- [Okta SSO Setup Guide](#okta-sso-setup)
- [Azure AD App Registration Reference](#azure-ad-registration)
- [Auth Debug Endpoint Reference](#auth-debug)
