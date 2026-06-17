/**
 * Templates for Knowledge Base Article
 * Pre-filled content mapped to docforge-ai form field IDs.
 */

export const TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank',
    icon: '📄',
    description: 'Start from scratch',
    fields: {},
  },
  {
    id: 'sso-troubleshooting',
    name: 'SSO Login Failure',
    icon: '🔐',
    description: 'Troubleshooting: SSO auth failure example',
    fields: {
      title: 'SSO login fails with "invalid_audience" error',
      articleType: 'troubleshooting',
      audience: 'customer-admin',
      severity: 'high',
      symptoms: 'Users see: "invalid_audience: the audience claim does not match"\nLogin redirect loop — never completes\nOccurs after changing the OAuth app settings',
      environment: 'Product v3.x, all browsers, Okta and Azure AD integrations',
      rootCause: 'The Audience field in the OAuth app config does not match the value expected by the identity provider.',
      resolution: '1. Go to Admin → SSO → OAuth Apps\n2. Find the affected app and click Edit\n3. Set the Audience field to the value shown in your IdP application settings\n4. Save and retry login',
    },
  },
  {
    id: 'connect-integration-howto',
    name: 'Connect an Integration',
    icon: '🔌',
    description: 'How-To: step-by-step integration setup example',
    fields: {
      title: 'Connect Salesforce to the product via OAuth',
      articleType: 'how-to',
      audience: 'customer-admin',
      severity: 'medium',
      environment: 'Product v2.x+, Salesforce Enterprise or above, OAuth 2.0',
      rootCause: '',
      resolution: '1. In Admin → Integrations → Salesforce, click Connect\n2. Authorize with your Salesforce admin account\n3. Set the sync scope to the required objects\n4. Click Save and verify the connection status shows "Active"',
    },
  },
];
