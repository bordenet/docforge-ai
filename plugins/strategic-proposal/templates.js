/**
 * Templates for Strategic Proposal
 * Pre-filled content mapped to docforge-ai form field IDs
 *
 * Form fields: organizationName, organizationLocation, siteCount, currentVendor,
 * decisionMakerName, decisionMakerRole, conversationTranscripts, meetingNotes,
 * painPoints, attachmentText, workingDraft, additionalContext
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
    id: 'vendorReplacement',
    name: 'Vendor Replacement',
    icon: '🔄',
    description: 'Replace existing vendor/system',
    fields: {
      organizationName: '[Organization Name]',
      organizationLocation: '[City, State]',
      siteCount: '[X] locations',
      currentVendor: '[Current Vendor Name]',
      decisionMakerName: '[Decision Maker Name]',
      decisionMakerRole: '[Title/Role]',
      painPoints:
        '- Contract renewal coming up in [timeframe]\n- Current system lacks [capability]\n- Support response times are [issue]\n- Integration challenges with [system]',
      meetingNotes:
        'Discovery call [date]:\n- Discussed [topic 1]\n- Learned about [pain point]\n- Next steps: [action items]',
      additionalContext: 'Budget cycle: [timing]\nDecision timeline: [date]\nOther stakeholders: [names/roles]',
    },
  },
  {
    id: 'newImplementation',
    name: 'New Implementation',
    icon: '🚀',
    description: 'First-time solution implementation',
    fields: {
      organizationName: '[Organization Name]',
      organizationLocation: '[City, State]',
      siteCount: '[X] locations',
      currentVendor: 'None - manual processes',
      decisionMakerName: '[Decision Maker Name]',
      decisionMakerRole: '[Title/Role]',
      painPoints:
        '- Currently using manual processes for [task]\n- Scaling challenges as business grows\n- Lack of visibility into [metrics]\n- Compliance/reporting gaps',
      meetingNotes:
        'Initial meeting [date]:\n- Organization overview: [details]\n- Current state: [description]\n- Goals: [what they want to achieve]',
      additionalContext:
        'Growth trajectory: [details]\nTechnology readiness: [assessment]\nChange management considerations: [notes]',
    },
  },
  {
    id: 'multiSiteExpansion',
    name: 'Multi-Site Expansion',
    icon: '🏢',
    description: 'Expand solution across locations',
    fields: {
      organizationName: '[Organization Name]',
      organizationLocation: '[Headquarters City, State]',
      siteCount: '[X] current locations, expanding to [Y]',
      currentVendor: '[Existing vendor at some sites, if any]',
      decisionMakerName: '[Decision Maker Name]',
      decisionMakerRole: '[Title/Role - likely VP/Director level]',
      painPoints:
        '- Inconsistent processes across locations\n- Difficulty managing multiple systems\n- Reporting/consolidation challenges\n- Training burden for new sites',
      meetingNotes:
        'Site visits:\n- Location 1: [observations]\n- Location 2: [observations]\n\nCorporate meeting:\n- Standardization goals: [details]',
      additionalContext:
        'Expansion timeline: [dates]\nAcquisition vs organic growth: [details]\nRegional differences: [considerations]',
    },
  },
  {
    id: 'competitiveDisplacement',
    name: 'Competitive Win-Back',
    icon: '🎯',
    description: 'Win back from competitor',
    fields: {
      organizationName: '[Organization Name]',
      organizationLocation: '[City, State]',
      siteCount: '[X] locations',
      currentVendor: '[Competitor Name]',
      decisionMakerName: '[Decision Maker Name]',
      decisionMakerRole: '[Title/Role]',
      painPoints:
        '- Competitor failing to deliver on [promise]\n- Price increases without value add\n- Missing features: [list]\n- Poor customer experience: [specifics]',
      conversationTranscripts:
        'Call with [name] on [date]:\n"[Key quote about frustration with current vendor]"\n\n"[Quote about what they wish they had]"',
      meetingNotes:
        'Competitive analysis:\n- Their contract terms: [details]\n- Switching costs: [assessment]\n- Our advantages: [list]',
      additionalContext:
        'Contract end date: [date]\nPrevious relationship with us: [history]\nCompetitor weaknesses to exploit: [list]',
    },
  },
];

export function getTemplate(templateId) {
  return TEMPLATES.find((t) => t.id === templateId) || null;
}

export function getAllTemplates() {
  return TEMPLATES;
}
