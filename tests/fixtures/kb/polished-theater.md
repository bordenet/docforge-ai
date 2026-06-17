# SSO Login Fails with HTTP 401 and invalid_audience Error

**Article type:** Troubleshooting
**Applies to:** Enterprise Plan
**Audience:** Admin
**Severity:** High

## Summary

SSO logins are failing with an HTTP 401 invalid_audience error. This article guides admins through the resolution process.

## When to Use This Article

- Use when: Users cannot log in via SSO and the error mentions audience or token rejection.
- Applies to: Accounts using third-party SSO providers.
- Does not apply when: The error is related to password authentication.

## Symptoms

- Error message: `invalid_audience` in the browser console
- Behavior: Login attempts fail and users are redirected to the login page.

## Cause

This issue occurs because of a misconfiguration in the SSO settings. The system cannot authenticate users properly because the audience configuration is incorrect. The root cause is typically a mismatch between the OAuth application settings and the identity provider configuration.

## Environment

- Product: Enterprise Plan
- Platform: All supported browsers and platforms
- Integrations: SSO providers (varies by customer)

## Resolution

1. Configure the OAuth application settings appropriately for your identity provider.
2. Ensure the audience URI is set correctly to match your environment.
3. Update the redirect configuration as needed based on your IdP requirements.
4. Verify that all SSO settings are correct and properly configured.

## Verification

Verify that the SSO integration is working correctly by testing a login.

## If It Still Fails

- Re-check the OAuth configuration to make sure everything is set up properly.
- Escalate if the problem persists after retrying.
- Collect the error details before escalating.

## Prevention

- Review SSO settings regularly to ensure they remain properly configured.
- Monitor authentication events for any anomalies that might indicate configuration drift.

## Related

- SSO Configuration Guide (see documentation)
- OAuth Settings Reference (see documentation)
