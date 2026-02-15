/**
 * ADR Validator - Configuration and Patterns
 */

export const REQUIRED_SECTIONS = [
  { pattern: /^(#+\s*)?(context|background|problem|situation)/im, name: 'Context', weight: 2 },
  { pattern: /^(#+\s*)?(decision\s+driver|driver)/im, name: 'Decision Drivers', weight: 1.5 },
  { pattern: /^(#+\s*)?(decision|choice|selected|chosen)/im, name: 'Decision', weight: 2 },
  { pattern: /^(#+\s*)?(consequence|impact|result|outcome|implication)/im, name: 'Consequences', weight: 2 },
  { pattern: /^(#+\s*)?(status|state)/im, name: 'Status', weight: 2 },
  { pattern: /^(#+\s*)?(option|alternative|considered)/im, name: 'Options Considered', weight: 1 },
  { pattern: /^(#+\s*)?(rationale|reason|justification|why)/im, name: 'Rationale', weight: 1 },
  { pattern: /^(#+\s*)?(confirmation|validation|verification)/im, name: 'Confirmation', weight: 1 }
];

// Context patterns
export const CONTEXT_PATTERNS = {
  contextSection: /^(#+\s*)?(context|background|problem|situation|why)/im,
  contextLanguage: /\b(context|background|problem|situation|challenge|need|requirement|constraint|driver|force)\b/gi,
  constraints: /\b(constraint|limitation|requirement|must|should|cannot|restriction|boundary)\b/gi,
  quantified: /\d+\s*(%|million|thousand|hour|day|week|month|year|\$|dollar|user|customer|transaction)/gi,
  businessFocus: /\b(business|customer|user|market|revenue|profit|competitive|strategic|value|stakeholder)\b/gi
};

// Decision patterns
export const DECISION_PATTERNS = {
  decisionSection: /^(#+\s*)?(decision|choice|selected|chosen|we.will)/im,
  decisionLanguage: /\b(decide|decision|choose|chose|select|selected|adopt|use|implement|will)\b/gi,
  clarity: /\b(we.will|we.have.decided|the.decision.is|we.chose|we.selected)\b/gi,
  specificity: /\b(specifically|exactly|precisely|concretely|particular)\b/gi,
  actionVerbs: /\b(use|adopt|implement|migrate|split|combine|establish|enforce)\b/gi
};

// Vague decision phrases explicitly banned
export const VAGUE_DECISION_PATTERNS = /\b(strategic\s+approach|architectural\s+intervention|improve\s+scalability|more\s+maintainable|better\s+architecture|enhance\s+performance|optimize\s+the\s+system|modernize\s+the\s+platform|transform\s+the\s+infrastructure)\b/gi;

// Options patterns
export const OPTIONS_PATTERNS = {
  optionsSection: /^(#+\s*)?(option|alternative|considered|candidate)/im,
  optionsLanguage: /\b(option|alternative|candidate|possibility|approach|solution|choice)\b/gi,
  comparison: /\b(compare|versus|vs|pro|con|advantage|disadvantage|trade.?off|benefit|drawback)\b/gi,
  rejected: /\b(reject|not.chosen|ruled.out|dismissed|discarded|eliminated)\b/gi
};

// Consequences patterns
export const CONSEQUENCES_PATTERNS = {
  consequencesSection: /^(#+\s*)?(consequence|impact|result|outcome|implication)/im,
  consequencesLanguage: /\b(consequence|impact|result|outcome|implication|effect|affect)\b/gi,
  positive: /\b(benefit|advantage|improve|enable|allow|simplify|reduce|faster|easier|better|scalable|maintainable|testable|decoupled|independent|automated)\b/gi,
  negative: /\b(drawback|disadvantage|risk|cost|slower|harder|worse|trade.?off|latency|coupling|dependency|bottleneck|single.point.of.failure|migration.effort)\b/gi,
  neutral: /\b(change|require|need|must|will.need|migration|update)\b/gi
};

// Vague consequence terms
export const VAGUE_CONSEQUENCE_TERMS = /\b(complexity|overhead|difficult|challenging|problematic|issues?|concerns?)\b/gi;

// Status patterns
export const STATUS_PATTERNS = {
  statusSection: /^(#+\s*)?(status|state)/im,
  statusValues: /\b(proposed|accepted|deprecated|superseded|rejected|draft|approved|implemented)\b/gi,
  datePatterns: /\b(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}|january|february|march|april|may|june|july|august|september|october|november|december)\b/gi,
  supersededBy: /\b(superseded.by|replaced.by|see.also|successor)\b/gi
};

// Rationale patterns
export const RATIONALE_PATTERNS = {
  rationaleSection: /^(#+\s*)?(rationale|reason|justification|why)/im,
  rationaleLanguage: /\b(because|reason|rationale|justification|why|due.to|since|therefore|thus)\b/gi,
  evidence: /\b(evidence|data|research|study|benchmark|test|experiment|proof|demonstrate)\b/gi
};

// Team factors pattern
export const TEAM_PATTERNS = /training.*need|skill gap|hiring impact|team ramp|learning curve|expertise required|onboarding|team structure|hiring|staffing/i;

// Subsequent ADR pattern
export const SUBSEQUENT_PATTERN = /subsequent ADR|follow-on ADR|triggers ADR|future ADR|ADR-\d+|triggers.*(?:decision|choice).*(?:on|for|about|regarding)\s+\w+/i;

// Review timing pattern
export const REVIEW_PATTERN = /\b\d+\s*(days?|weeks?|months?)\s*(review|reassess|revisit)|after-action|review.*timing|recommended.*review|review in \d+|quarterly\s+review|annual\s+review/i;

// Alternatives comparison pattern
export const ALTERNATIVES_PATTERN = /we considered .+?,\s*.+?(?:,\s*.+?)?\s*(?:and\s+.+?\s+)?but (?:chose|selected|decided|went with)/i;

// Decision Drivers patterns (MADR 3.0)
export const DECISION_DRIVERS_PATTERNS = {
  section: /^(#+\s*)?(decision\s+driver|driver|force|concern|quality)/im,
  sectionHeader: /^#+\s*decision\s+drivers?\b/im,
  driverLanguage: /\b(driver|force|concern|quality|constraint|requirement|consideration)\b/gi,
  bulletList: /^[\s]*[-*•]\s+.+$/gm,
  numberedList: /^[\s]*\d+\.\s+.+$/gm
};

// Confirmation/Validation patterns (MADR 3.0)
export const CONFIRMATION_PATTERNS = {
  section: /^(#+\s*)?(confirmation|validation|verification|compliance)/im,
  sectionHeader: /^#+\s*confirmation\b/im,
  validationLanguage: /\b(confirm|validate|verify|review|test|audit|check|compliance|DCAR|architecture review|code review|load test)\b/gi,
  measurable: /\b(metric|threshold|baseline|target|criteria|pass|fail)\b/gi
};

// Y-statement format for Decision Outcome (MADR 3.0)
export const Y_STATEMENT_PATTERNS = {
  // "Chosen option: {option}, because {justification}"
  chosenOption: /chosen\s+option[:\s]+["']?([^"'\n,]+)["']?,?\s*because/i,
  // Alternative formats: "We chose X because", "Selected: X, because"
  altFormats: /(?:we\s+(?:chose|selected|decided\s+on)|selected[:\s]+)["']?([^"'\n,]+)["']?,?\s*because/i,
  // Y-statement justification pattern
  justification: /because\s+(?:it\s+)?(?:is\s+the\s+only\s+option|meets?\s+|resolves?\s+|comes?\s+out\s+best|provides?\s+|enables?\s+|allows?\s+)/i
};

// MADR "Good, because" / "Bad, because" consequence format
export const MADR_CONSEQUENCE_FORMAT = {
  goodBecause: /^\s*[-*•]\s*Good,?\s*because\s+/gim,
  badBecause: /^\s*[-*•]\s*Bad,?\s*because\s+/gim,
  neutralBecause: /^\s*[-*•]\s*Neutral,?\s*because\s+/gim
};

// Pros and Cons of Options section (MADR 3.0)
export const PROS_CONS_PATTERNS = {
  sectionHeader: /^#+\s*pros\s+and\s+cons\s+(?:of\s+)?(?:the\s+)?options?\b/im,
  optionSubsection: /^#+\s*(?:option\s+\d+[:\s]|[A-Z][^#\n]+)/im,
  goodArgument: /^\s*[-*•]\s*Good,?\s*because\b/gim,
  badArgument: /^\s*[-*•]\s*Bad,?\s*because\b/gim
};

// YAML Front Matter metadata (MADR 3.0)
export const YAML_METADATA_PATTERNS = {
  frontMatter: /^---\s*\n[\s\S]*?\n---/m,
  status: /^status\s*:\s*(.+)$/im,
  date: /^date\s*:\s*(\d{4}-\d{2}-\d{2}|\{.+\})$/im,
  decisionMakers: /^decision-?makers?\s*:\s*(.+)$/im,
  consulted: /^consulted\s*:\s*(.+)$/im,
  informed: /^informed\s*:\s*(.+)$/im
};

// More Information section (MADR 3.0)
export const MORE_INFO_PATTERNS = {
  sectionHeader: /^#+\s*(?:more\s+information|additional\s+information|references|links|evidence)\b/im,
  hasLinks: /\[.+\]\(.+\)/g,
  hasEvidence: /\b(study|research|benchmark|test|experiment|data|survey|interview|usability\s+test)\b/gi
};

// Quantified context patterns (enhanced)
export const QUANTIFIED_PATTERNS = {
  percentages: /\d+\s*%/g,
  currency: /\$\s*[\d,]+(?:\.\d{2})?(?:\s*(?:k|K|M|B|million|billion|thousand))?/g,
  timeMetrics: /\d+\s*(?:ms|millisecond|second|minute|hour|day|week|month|year)s?\b/gi,
  userMetrics: /\d+\s*(?:user|customer|transaction|request|query|call|hit|visit)s?\b/gi,
  slaMetrics: /\d+\s*(?:9|nine)s?\s*(?:availability|uptime|SLA)/gi,
  latencyMetrics: /\d+\s*(?:ms|millisecond)s?\s*(?:latency|response\s*time|p\d+|percentile)/gi
};

// Goals and Non-Goals sections (KEP pattern)
export const GOALS_PATTERNS = {
  goalsSection: /^#+\s*goals?\b/im,
  nonGoalsSection: /^#+\s*non-?goals?\b/im,
  goalItems: /^\s*[-*•]\s*(?:Goal|Objective|Aim)[:\s]/gim,
  nonGoalItems: /^\s*[-*•]\s*(?:Non-?goal|Out of scope|Not included)[:\s]/gim
};

// Risks and Mitigations (KEP pattern)
export const RISKS_PATTERNS = {
  risksSection: /^#+\s*risks?\s*(?:and\s+)?(?:mitigations?)?/im,
  riskItem: /^\s*[-*•]\s*(?:Risk|Concern|Threat)[:\s]/gim,
  mitigationItem: /^\s*[-*•]\s*(?:Mitigation|Countermeasure|Response)[:\s]/gim,
  riskLanguage: /\b(?:risk|threat|concern|vulnerability|exposure|liability)\b/gi,
  mitigationLanguage: /\b(?:mitigat|countermeasure|safeguard|contingenc|fallback|rollback)\w*/gi
};

// Superseded/Related ADR references
export const ADR_REFERENCE_PATTERNS = {
  supersededBy: /superseded\s+by\s+(?:ADR[-\s]?\d+|[A-Z]+-\d+)/gi,
  supersedes: /supersedes\s+(?:ADR[-\s]?\d+|[A-Z]+-\d+)/gi,
  relatedADR: /(?:related\s+(?:to\s+)?|see\s+also\s+|references?\s+)(?:ADR[-\s]?\d+|[A-Z]+-\d+)/gi,
  adrReference: /\bADR[-\s]?\d{1,4}\b/g
};

// Implementation History / Timeline
export const IMPLEMENTATION_HISTORY_PATTERNS = {
  sectionHeader: /^#+\s*(?:implementation\s+)?history\b/im,
  dateEntry: /\d{4}-\d{2}-\d{2}/g,
  milestoneLanguage: /\b(?:milestone|phase|sprint|release|version|v\d+\.\d+)\b/gi
};

// Tradeoff/Comparison matrix (tables)
export const TRADEOFF_PATTERNS = {
  markdownTable: /\|[^\n]+\|[\r\n]+\|[-:|\s]+\|/g,
  comparisonHeader: /^#+\s*(?:comparison|tradeoff|trade-off|matrix|evaluation)\b/im,
  optionComparison: /\|\s*(?:Option|Alternative|Approach)\s*\|/i
};

// Compliance and governance patterns
export const COMPLIANCE_PATTERNS = {
  complianceSection: /^#+\s*(?:compliance|governance|regulatory)\b/im,
  standardsLanguage: /\b(?:ISO|SOC|GDPR|HIPAA|PCI[-\s]?DSS|FedRAMP|SOX|CCPA|NIST)\b/g,
  auditLanguage: /\b(?:audit|compliance|certification|regulation|policy|standard|governance)\b/gi,
  approvalLanguage: /\b(?:approved?\s+by|sign[-\s]?off|authorization|stakeholder\s+approval)\b/gi
};

// Technical context depth patterns
export const TECHNICAL_CONTEXT_PATTERNS = {
  architectureSection: /^#+\s*(?:architecture|technical\s+(?:context|background|overview))\b/im,
  diagramReference: /\b(?:diagram|figure|flowchart|sequence|architecture\s+diagram|mermaid|plantuml)\b/gi,
  techStackLanguage: /\b(?:tech\s+stack|technology\s+stack|framework|library|platform|infrastructure)\b/gi,
  constraintLanguage: /\b(?:constraint|limitation|requirement|dependency|prerequisite)\b/gi,
  integrationLanguage: /\b(?:integrat|interoperab|compatibility|interface|API|endpoint)\w*/gi
};

// Decision reversibility patterns
export const REVERSIBILITY_PATTERNS = {
  reversibilitySection: /^#+\s*(?:reversibility|door\s+type|decision\s+type)\b/im,
  oneWayDoor: /\b(?:one[-\s]?way\s+door|irreversible|permanent|hard\s+to\s+undo|point\s+of\s+no\s+return)\b/gi,
  twoWayDoor: /\b(?:two[-\s]?way\s+door|reversible|can\s+be\s+undone|easy\s+to\s+revert|rollback)\b/gi,
  doorTypeLanguage: /\b(?:type\s+[12]|door\s+type|decision\s+classification)\b/gi
};

// Team context patterns
export const TEAM_CONTEXT_PATTERNS = {
  teamSection: /^#+\s*(?:team|ownership|participants|decision\s+makers)\b/im,
  driverLanguage: /\b(?:driver|owner|lead|responsible|accountable)\b/gi,
  consultedLanguage: /\b(?:consulted|reviewed\s+by|input\s+from|advised)\b/gi,
  informedLanguage: /\b(?:informed|notified|communicated|shared\s+with)\b/gi,
  raciPattern: /\b(?:RACI|DACI|accountable|responsible|consulted|informed)\b/gi
};

// Assumptions documentation patterns
export const ASSUMPTIONS_PATTERNS = {
  assumptionsSection: /^#+\s*assumptions?\b/im,
  assumptionLanguage: /\b(?:assum\w+|expect\w*\s+that|prerequisite|given\s+that|based\s+on)\b/gi,
  constraintAssumption: /\b(?:constraint|limitation|boundary|within\s+scope)\b/gi
};

// Decision scope and impact patterns
export const SCOPE_IMPACT_PATTERNS = {
  scopeSection: /^#+\s*(?:scope|impact|affected\s+(?:systems?|teams?))\b/im,
  impactLanguage: /\b(?:impact|affect|influence|change|modify|downstream|upstream)\b/gi,
  boundaryLanguage: /\b(?:boundary|scope|extent|reach|coverage)\b/gi,
  systemsAffected: /\b(?:system|service|component|module|api|database)s?\s+(?:affected|impacted)\b/gi
};

// Quality attributes patterns (ISO 25010)
export const QUALITY_ATTRIBUTES_PATTERNS = {
  qualitySection: /^#+\s*(?:quality\s+attributes?|non-?functional|quality\s+requirements?)\b/im,
  performanceLanguage: /\b(?:performance|latency|throughput|response\s+time|scalab\w+)\b/gi,
  reliabilityLanguage: /\b(?:reliability|availability|fault\s+toleran\w+|resilien\w+|uptime)\b/gi,
  securityLanguage: /\b(?:security|authentication|authorization|encryption|vulnerabil\w+)\b/gi,
  maintainabilityLanguage: /\b(?:maintainab\w+|testab\w+|modular\w+|reusab\w+|extens\w+)\b/gi
};

// Alternatives depth patterns
export const ALTERNATIVES_DEPTH_PATTERNS = {
  alternativesSection: /^#+\s*(?:alternatives?\s+considered|options?\s+(?:evaluated|considered)|other\s+options?)\b/im,
  proConLanguage: /\b(?:pro|con|advantage|disadvantage|benefit|drawback|strength|weakness)\b/gi,
  comparisonLanguage: /\b(?:compar\w+|versus|vs\.?|against|relative\s+to)\b/gi,
  rejectionReason: /\b(?:rejected|ruled\s+out|dismissed|not\s+chosen|eliminated)\s+because\b/gi
};

// Links and references patterns
export const LINKS_PATTERNS = {
  linksSection: /^#+\s*(?:links?|references?|related\s+(?:documents?|resources?)|see\s+also)\b/im,
  markdownLinks: /\[[^\]]+\]\([^)]+\)/g,
  urlPattern: /https?:\/\/[^\s)>\]]+/gi,
  wikiLink: /\[\[[^\]]+\]\]/g
};

// Changelog patterns
export const CHANGELOG_PATTERNS = {
  changelogSection: /^#+\s*(?:changelog|change\s+log|history|revision\s+history|version\s+history)\b/im,
  versionEntry: /\b(?:v\d+\.\d+|version\s+\d+|\d{4}-\d{2}-\d{2})\b/gi,
  changeAction: /\b(?:added|removed|changed|updated|fixed|deprecated|initial|created|modified)\b/gi
};

// Superseded/Deprecated ADR patterns
export const SUPERSEDED_PATTERNS = {
  supersededSection: /^#+\s*(?:superseded|deprecated|obsolete|replaced)\s*(?:by)?\b/im,
  supersededStatus: /\b(?:superseded|deprecated|obsolete|replaced)\s+by\b/gi,
  supersedesOther: /\bsupersedes\s+(?:ADR|decision)?\s*(?:-|#)?\s*\d+/gi,
  adrNumberRef: /\bADR[-\s]?\d+\b/gi
};

// Stakeholder sign-off patterns
export const SIGNOFF_PATTERNS = {
  signoffSection: /^#+\s*(?:sign-?off|approv\w+|decision\s+makers?|stakeholders?|sign\s+off)\b/im,
  approvalLanguage: /\b(?:approved|signed|accepted|endorsed|ratified)\s+by\b/gi,
  dateSignature: /\b(?:signed|approved|dated)[:.]?\s*\d{4}-\d{2}-\d{2}/gi,
  roleSignature: /\b(?:architect|tech\s+lead|engineering\s+manager|cto|vp\s+engineering)\s*[:]/gi
};

// ADR numbering patterns (enterprise documentation standards)
export const ADR_NUMBERING_PATTERNS = {
  titleNumber: /^#+\s*(?:ADR|Decision)[-\s]?(\d{3,4})(?:\s*[:\-])/im,
  fileNumber: /ADR[-_]?(\d{3,4})/gi,
  inlineRef: /\bADR[-\s]?(\d{3,4})\b/gi
};

// Architecture Significant Requirements (ASR) patterns
export const ASR_PATTERNS = {
  asrSection: /^#+\s*(?:ASR|architecture\s+significant|significant\s+requirements?|key\s+requirements?)\b/im,
  asrLanguage: /\b(?:architecturally\s+significant|architecture\s+decision|critical\s+requirement|key\s+driver)\b/gi,
  qualityDrivers: /\b(?:quality\s+driver|quality\s+scenario|quality\s+attribute\s+scenario)\b/gi
};

// Cost estimation patterns
export const COST_PATTERNS = {
  costSection: /^#+\s*(?:cost|budget|resources?|effort|investment)\b/im,
  costLanguage: /\b(?:cost|budget|expense|spend|invest\w*|price|dollar|euro|£|\$|€)\b/gi,
  effortLanguage: /\b(?:person[-\s]?days?|person[-\s]?weeks?|person[-\s]?months?|story\s+points?|sprint|FTE|headcount)\b/gi,
  roiLanguage: /\b(?:ROI|return\s+on\s+invest\w+|payback|break[-\s]?even|cost[-\s]?benefit)\b/gi
};

// Timeline and deadline patterns
export const TIMELINE_PATTERNS = {
  timelineSection: /^#+\s*(?:timeline|schedule|milestones?|deadlines?|target\s+dates?)\b/im,
  deadlineLanguage: /\b(?:deadline|due\s+date|target\s+date|completion\s+date|launch\s+date|go[-\s]?live)\b/gi,
  quarterLanguage: /\bQ[1-4]\s*(?:20\d{2}|'\d{2}|\d{2})\b/gi,
  monthYearLanguage: /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+20\d{2}\b/gi
};

// Security impact patterns
export const SECURITY_PATTERNS = {
  securitySection: /^#+\s*(?:security|privacy|compliance|data\s+protection|access\s+control)\b/im,
  securityLanguage: /\b(?:authentication|authorization|encryption|TLS|SSL|OAuth|RBAC|ABAC|PII|GDPR|HIPAA|SOC\s*2|PCI[-\s]?DSS)\b/gi,
  threatLanguage: /\b(?:threat|vulnerability|attack|exploit|injection|XSS|CSRF|malicious|adversar\w+)\b/gi,
  auditLanguage: /\b(?:audit|logging|traceability|forensic|compliance|regulatory)\b/gi
};

// Dependencies documentation patterns
export const DEPENDENCIES_PATTERNS = {
  dependenciesSection: /^#+\s*(?:dependencies|prerequisites|requirements|blockers?)\b/im,
  upstreamLanguage: /\b(?:upstream|depends\s+on|requires|prerequisite|blocked\s+by|waiting\s+on)\b/gi,
  downstreamLanguage: /\b(?:downstream|blocks|required\s+by|enables|unblocks)\b/gi,
  integrationLanguage: /\b(?:integrate|integration|API|interface|contract|protocol)\b/gi
};

// Diagram and visual references
export const DIAGRAM_PATTERNS = {
  diagramSection: /^#+\s*(?:diagrams?|architecture|visuals?|figures?)\b/im,
  diagramReference: /\b(?:see\s+(?:diagram|figure|chart)|(?:diagram|figure|chart)\s+\d+|as\s+shown\s+in|illustrated\s+in)\b/gi,
  diagramType: /\b(?:sequence\s+diagram|class\s+diagram|flow\s*chart|UML|C4\s+model|ERD|data\s+flow|state\s+machine)\b/gi,
  mermaidBlock: /```(?:mermaid|plantuml|graphviz)/gi
};

// Observability and monitoring patterns
export const OBSERVABILITY_PATTERNS = {
  observabilitySection: /^#+\s*(?:observability|monitoring|metrics|alerting|SLOs?|SLAs?)\b/im,
  metricsLanguage: /\b(?:SLO|SLA|SLI|latency|throughput|error\s+rate|availability|uptime|p99|p95|p50)\b/gi,
  monitoringLanguage: /\b(?:dashboard|alert|notification|on[-\s]?call|incident|runbook|playbook|grafana|datadog|prometheus)\b/gi,
  tracingLanguage: /\b(?:tracing|distributed\s+tracing|trace|span|correlation\s+ID|request\s+ID|opentelemetry|jaeger)\b/gi
};

