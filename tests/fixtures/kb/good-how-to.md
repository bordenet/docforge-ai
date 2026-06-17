# Set Up OAuth SSO with Okta to Prevent Token Errors

**Article type:** How-To
**Applies to:** Product v3.0, Okta Workforce Identity
**Audience:** Admin
**Severity:** Low

## Summary

Configure single sign-on (SSO) using OAuth with Okta so your team can authenticate without repeated password prompts. Estimated time: ~15 minutes.

## When to Use This Article

- Use when: You are enabling SSO for the first time or migrating from password-based login to OAuth with Okta.
- Applies to: Product v3.0, Okta Workforce Identity Cloud.
- Does not apply when: You are using Azure AD or Google Workspace — see the respective SSO guides for those providers.

## Goal

By the end of this article, you will be able to log in to Product using Okta credentials with no password prompts. Estimated time: ~15 minutes.

## Prerequisites

- Admin role in Product v3.0 (Settings access required).
- Okta admin role with permission to create OAuth 2.0 applications.
- Okta tenant URL: `https://<your-domain>.okta.com`.

## Environment

- Product: Product v3.0
- Platform: Cloud (SaaS), Chrome 120+, Firefox 115+
- Integrations: Okta Workforce Identity Cloud

## Steps

1. In **Admin → Settings → Authentication → SSO Providers**, click **Add Provider** and select **Okta (OAuth 2.0)**.
2. Copy the **Redirect URI** shown on the configuration screen (format: `https://app.example.com/auth/callback`).
3. In the Okta Admin Console, navigate to **Applications → Create App Integration → OIDC - OpenID Connect → Web Application** and paste the copied Redirect URI into the **Sign-in redirect URIs** field, then click **Save**.
4. Copy the **Client ID** and **Client Secret** from the Okta app's **General** tab.
5. Return to **Admin → Settings → Authentication → SSO Providers** and enter the Client ID into the `Client ID` field and the Client Secret into the `Client Secret` field, then click **Save & Test**.
6. Run `curl -s https://app.example.com/api/auth/debug/okta | jq '.status'` to confirm the connection status before rolling out to users.

## Verification

- You should see: `{"status":"connected","provider":"okta"}` returned by the debug endpoint.
- Confirm SSO login works by opening an incognito window and navigating to `https://app.example.com` — you should be redirected to Okta and returned as an authenticated user.

## If It Still Fails

- Escalate when:
  - SSO login fails for more than 5 users after configuration is verified correct.
  - The status endpoint returns `{"status":"error"}` after 3 retries.
  - Before escalating, collect: the Client ID used, the Redirect URI registered in Okta, the full response from the debug endpoint, and the Okta System Log event ID.

## Prevention

- Guardrail: Test SSO in a staging environment before enabling for all users in production.
- Long-term fix: Use Okta's automated provisioning (SCIM) to keep user roles in sync without manual updates.

## Related

- [OAuth 2.0 SSO Reference](#oauth-sso-reference)
- [Okta SCIM Provisioning Guide](#okta-scim)
- [Auth Debug Endpoint Reference](#auth-debug)
