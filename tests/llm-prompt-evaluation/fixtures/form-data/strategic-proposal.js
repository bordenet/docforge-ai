/**
 * Strategic Proposal Form Data Fixture
 * Field IDs match plugins/strategic-proposal/config.js formFields.
 */

export default {
  title: 'Enterprise Communication Platform Proposal',
  organizationName: 'Midwest Regional Healthcare',
  organizationLocation: 'Chicago, IL (with 12 satellite locations across Illinois and Wisconsin)',
  siteCount: '13',
  currentVendor: 'Legacy PBX system (Avaya) with separate Slack instance',
  decisionMakerName: 'Dr. Sarah Chen',
  decisionMakerRole: 'Chief Operating Officer',
  conversationTranscripts:
    'Discovery call (3/1): "Our biggest pain point is communication between ' +
    'facilities. Nurses and doctors waste hours playing phone tag." ' +
    'Follow-up (3/8): "We need HIPAA compliance built-in, not bolted on. ' +
    'Previous vendor had a breach scare." ' +
    'Demo feedback (3/15): "The mobile app looks promising. Can it work offline ' +
    'in areas with poor cell coverage?"',
  meetingNotes:
    'Budget range: $500K-800K. Implementation window: Before Q4 (fiscal year end). ' +
    'Must integrate with Epic EHR. IT team capacity is limited - need turnkey solution. ' +
    'Competing bid from Microsoft Teams but concerns about customization for healthcare. ' +
    'Decision timeline: Board meeting on April 15th.',
};

