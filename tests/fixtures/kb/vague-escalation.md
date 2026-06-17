# SSO Login Fails with HTTP 403 Forbidden

**Article type:** Troubleshooting
**Applies to:** Product v2.5
**Audience:** Admin
**Severity:** High

## Summary

SSO login returns HTTP 403 when the user's role permissions are not propagated from the identity provider. The fix involves resyncing role assignments.

## Symptoms

- Error message: `403 Forbidden: insufficient permissions`
- Behavior: Authenticated users are shown an access denied screen after login.
- Logs show: `AUTHZ_FAIL: role=unknown user=<uid>`

## Cause

This occurs because the SCIM provisioning job failed to sync the user's role assignment from the identity provider. The 403 is caused by the role being set to `unknown` in the product database, which blocks all protected routes.

## Environment

- Product: Product v2.5
- Platform: Cloud (SaaS), Chrome 120+
- Integrations: Okta SCIM provisioning

## Resolution

1. In **Admin → Users → <affected user>**, click **Resync from IdP** to trigger a fresh SCIM pull for this user.
2. Set the user's role to `member` in **Admin → Users → <user> → Role** if the resync leaves the role blank.
3. Run `curl -s https://app.example.com/api/users/<uid>/roles | jq '.roles'` to confirm the role is no longer `unknown`.

## Verification

Check if the user can log in again and try the affected page.

## If It Still Fails

Contact support.

## Related

- [SCIM Provisioning Setup](#scim-setup)
- [Role Management Reference](#role-management)
