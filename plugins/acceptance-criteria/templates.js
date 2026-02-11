/**
 * Templates for Acceptance Criteria
 * Pre-filled content mapped to docforge-ai form field IDs
 */

export const TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank',
    icon: '📄',
    description: 'Start from scratch',
    fields: {}
  },
  {
    id: 'featureDelivery',
    name: 'Feature Delivery',
    icon: '✅',
    description: 'New feature requirements',
    fields: {
      summary: 'As a [user type], I want [feature/capability] so that [benefit]',
      context: 'Background:\n- [Why this is needed]\n- [User journey or workflow this fits into]\n- [Related features or dependencies]\n\nPRD: [link]\nFigma: [link]',
      userFlow: '1. User navigates to [screen/location]\n2. User [action]\n3. System [response]\n4. User sees [outcome]\n5. [Next step in flow]',
      edgeCases: '- Empty state: [behavior]\n- Error state: [behavior]\n- Loading state: [behavior]\n- Max limit: [behavior]\n- Permission denied: [behavior]',
      outOfScope: '- [Feature variation] (Phase 2)\n- [Edge case] (separate ticket)\n- [Integration] (dependent on other team)'
    }
  },
  {
    id: 'bugFix',
    name: 'Bug Fix',
    icon: '🐛',
    description: 'Bug fix verification',
    fields: {
      summary: 'Fix: [Brief description of the bug]',
      context: 'Bug: [Brief description]\n\nSteps to reproduce:\n1. [Step 1]\n2. [Step 2]\n3. [Step 3]\n\nExpected: [What should happen]\nActual: [What happens instead]\n\nOriginal ticket: [link]',
      userFlow: 'After fix:\n1. [Same steps as reproduction]\n2. [Step 2]\n3. [Step 3]\n4. User sees [correct behavior]',
      edgeCases: '- Regression check: [related functionality still works]\n- Data integrity: [no data corruption]\n- Performance: [no degradation]\n- Browser compatibility: [tested browsers]',
      outOfScope: '- Root cause investigation (if not this ticket)\n- Preventive measures (separate ticket)\n- Related but distinct bugs (separate tickets)'
    }
  },
  {
    id: 'apiEndpoint',
    name: 'API Endpoint',
    icon: '🔗',
    description: 'API integration requirements',
    fields: {
      summary: 'Implement [METHOD] /api/v1/[resource] endpoint',
      context: 'Endpoint: [METHOD] /api/v1/[resource]\n\nPurpose: [What this endpoint does]\n\nConsumers:\n- [Frontend component]\n- [Mobile app]\n- [External partner]\n\nAPI spec: [link]',
      userFlow: 'Request flow:\n1. Client sends [request type] with [payload structure]\n2. Server validates [input]\n3. Server [processes request]\n4. Server returns [response structure]\n5. Client handles [success/error states]',
      edgeCases: '- Invalid input: Return 400 with [error format]\n- Unauthorized: Return 401\n- Not found: Return 404\n- Rate limit: Return 429\n- Server error: Return 500 with [error format]',
      outOfScope: '- Pagination (if not this version)\n- Filtering/sorting (if not this version)\n- Bulk operations (separate endpoint)'
    }
  },
  {
    id: 'uiChange',
    name: 'UI Change',
    icon: '🎨',
    description: 'Visual/UX requirements',
    fields: {
      summary: 'Update [component/page] to [change description]',
      context: 'Component: [Component name or page]\n\nChange: [What needs to change visually/behaviorally]\n\nFigma: [link]\nUI style guide: [link]',
      userFlow: '1. User sees [initial state]\n2. User [interacts with component]\n3. Component [animates/transitions]\n4. User sees [final state]\n5. [Feedback or confirmation]',
      edgeCases: '- Responsive: Works on [breakpoints]\n- Dark mode: [behavior]\n- Keyboard navigation: [behavior]\n- Screen reader: [behavior]\n- Touch: [behavior on mobile]',
      outOfScope: '- [Other components on same page]\n- [Backend changes]\n- [Analytics implementation]'
    }
  }
];

export function getTemplate(templateId) {
  return TEMPLATES.find(t => t.id === templateId) || null;
}

export function getAllTemplates() {
  return TEMPLATES;
}

