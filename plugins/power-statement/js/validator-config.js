/**
 * Power Statement Validator - Configuration and Patterns
 */

// Strong action verbs for power statements
export const STRONG_ACTION_VERBS = [
  'achieved', 'accelerated', 'accomplished', 'acquired', 'activated', 'adapted',
  'administered', 'advanced', 'advised', 'advocated', 'allocated', 'amplified',
  'analyzed', 'anchored', 'applied', 'appointed', 'appraised', 'approved',
  'architected', 'arranged', 'assembled', 'assessed', 'assigned', 'attained',
  'audited', 'authored', 'automated', 'awarded', 'balanced', 'boosted',
  'bridged', 'budgeted', 'built', 'calculated', 'captured', 'cataloged',
  'centralized', 'chaired', 'championed', 'changed', 'clarified', 'coached',
  'collaborated', 'combined', 'commanded', 'communicated', 'compared', 'compiled',
  'completed', 'composed', 'computed', 'conceived', 'conceptualized', 'condensed',
  'conducted', 'configured', 'conserved', 'consolidated', 'constructed', 'consulted',
  'contracted', 'contributed', 'controlled', 'converted', 'convinced', 'coordinated',
  'corrected', 'counseled', 'created', 'critiqued', 'cultivated', 'customized',
  'cut', 'debugged', 'decentralized', 'decreased', 'defined', 'delegated',
  'delivered', 'demonstrated', 'deployed', 'designed', 'detected', 'determined',
  'developed', 'devised', 'diagnosed', 'directed', 'discovered', 'dispatched',
  'displayed', 'dissected', 'distributed', 'diversified', 'diverted', 'documented',
  'doubled', 'drafted', 'drove', 'earned', 'edited', 'educated', 'effected',
  'elected', 'elevated', 'eliminated', 'enabled', 'encouraged', 'endorsed',
  'enforced', 'engaged', 'engineered', 'enhanced', 'enlarged', 'enlisted',
  'ensured', 'established', 'estimated', 'evaluated', 'examined', 'exceeded',
  'executed', 'expanded', 'expedited', 'experimented', 'explained', 'explored',
  'expressed', 'extended', 'extracted', 'fabricated', 'facilitated', 'fashioned',
  'finalized', 'fixed', 'focused', 'forecasted', 'forged', 'formalized',
  'formed', 'formulated', 'fortified', 'fostered', 'founded', 'fulfilled',
  'gained', 'gathered', 'generated', 'governed', 'grew', 'guided', 'halved',
  'handled', 'headed', 'heightened', 'hired', 'hosted', 'identified',
  'illustrated', 'implemented', 'improved', 'improvised', 'inaugurated', 'increased',
  'incubated', 'influenced', 'informed', 'initiated', 'innovated', 'inspected',
  'inspired', 'installed', 'instituted', 'instructed', 'integrated', 'intensified',
  'interpreted', 'interviewed', 'introduced', 'invented', 'invested', 'investigated',
  'launched', 'led', 'leveraged', 'licensed', 'lifted', 'linked', 'lobbied',
  'localized', 'located', 'logged', 'lowered', 'maintained', 'managed', 'mapped',
  'marketed', 'mastered', 'maximized', 'measured', 'mediated', 'mentored', 'merged',
  'minimized', 'mobilized', 'modeled', 'moderated', 'modernized', 'modified',
  'monitored', 'motivated', 'multiplied', 'navigated', 'negotiated', 'netted',
  'nurtured', 'observed', 'obtained', 'opened', 'operated', 'optimized', 'orchestrated',
  'ordered', 'organized', 'originated', 'outlined', 'outpaced', 'outperformed',
  'overcame', 'overhauled', 'oversaw', 'partnered', 'passed', 'performed', 'persuaded',
  'piloted', 'pioneered', 'placed', 'planned', 'positioned', 'predicted', 'prepared',
  'presented', 'preserved', 'presided', 'prevented', 'prioritized', 'processed',
  'procured', 'produced', 'profiled', 'programmed', 'projected', 'promoted',
  'proposed', 'protected', 'proved', 'provided', 'publicized', 'published',
  'purchased', 'pursued', 'qualified', 'quantified', 'questioned', 'raised',
  'ranked', 'rated', 'reached', 'realigned', 'realized', 'rearranged', 'rebuilt',
  'recaptured', 'received', 'recognized', 'recommended', 'reconciled', 'reconstructed',
  'recorded', 'recovered', 'recruited', 'rectified', 'redesigned', 'reduced',
  'reengineered', 'referred', 'refined', 'reformed', 'refurbished', 'regained',
  'registered', 'regulated', 'rehabilitated', 'reinforced', 'reinstated', 'rejuvenated',
  'related', 'released', 'remodeled', 'renegotiated', 'renewed', 'reorganized',
  'repaired', 'replaced', 'replicated', 'reported', 'repositioned', 'represented',
  'reproduced', 'requested', 'researched', 'reshaped', 'resolved', 'responded',
  'restored', 'restructured', 'retained', 'retrieved', 'revamped', 'revealed',
  'reversed', 'reviewed', 'revised', 'revitalized', 'revolutionized', 'rewarded',
  'routed', 'safeguarded', 'salvaged', 'saved', 'scheduled', 'screened', 'secured',
  'segmented', 'selected', 'separated', 'served', 'serviced', 'set', 'settled',
  'shaped', 'shared', 'sharpened', 'shipped', 'shortened', 'showcased', 'simplified',
  'simulated', 'slashed', 'sold', 'solicited', 'solved', 'sorted', 'sourced',
  'sparked', 'spearheaded', 'specialized', 'specified', 'sponsored', 'stabilized',
  'staffed', 'staged', 'standardized', 'started', 'steered', 'stimulated',
  'strategized', 'streamlined', 'strengthened', 'stretched', 'structured', 'studied',
  'submitted', 'succeeded', 'summarized', 'superseded', 'supervised', 'supplied',
  'supported', 'surpassed', 'surveyed', 'sustained', 'synchronized', 'synthesized',
  'systematized', 'tabulated', 'tailored', 'targeted', 'taught', 'terminated',
  'tested', 'tightened', 'traced', 'tracked', 'traded', 'trained', 'transcribed',
  'transferred', 'transformed', 'transitioned', 'translated', 'transmitted',
  'transported', 'traveled', 'treated', 'trimmed', 'tripled', 'troubleshot',
  'turned', 'tutored', 'uncovered', 'undertook', 'unified', 'united', 'updated',
  'upgraded', 'upheld', 'utilized', 'validated', 'valued', 'verified', 'visualized',
  'volunteered', 'widened', 'won', 'worked', 'wrote'
];

// Weak verbs to avoid
export const WEAK_VERBS = [
  'was', 'were', 'been', 'being', 'am', 'is', 'are',
  'had', 'has', 'have', 'having',
  'did', 'does', 'do', 'doing',
  'helped', 'assisted', 'supported', 'worked on', 'was responsible for',
  'participated in', 'was involved in', 'contributed to'
];

// Filler words and phrases to avoid
export const FILLER_PATTERNS = [
  /\b(very|really|quite|somewhat|rather|fairly|pretty much)\b/gi,
  /\b(basically|essentially|actually|literally|virtually)\b/gi,
  /\b(in order to|due to the fact that|for the purpose of)\b/gi,
  /\b(a lot of|lots of|tons of|bunch of)\b/gi,
  /\b(thing|stuff|something|somehow)\b/gi,
  /it'?s worth noting( that)?/gi,
  /in today'?s (competitive )?landscape/gi,
  /let'?s talk about/gi,
  /the reality is/gi
];

// Vague improvement patterns (must be quantified)
export const VAGUE_IMPROVEMENT_PATTERNS = /\b(improve|improved|improving|enhance|enhanced|enhancing|optimize|optimized|optimizing|better results?|significant|significantly)\b/gi;

// Jargon and buzzwords to flag
export const JARGON_PATTERNS = [
  /\b(synergy|synergize|synergistic)\b/gi,
  /\b(leverage|leveraging|leveraged)\b/gi,
  /\b(paradigm|paradigm shift)\b/gi,
  /\b(best.in.class|world.class|cutting.edge|state.of.the.art)\b/gi,
  /\b(move the needle|low.hanging fruit|boil the ocean)\b/gi,
  /\b(circle back|touch base|take offline)\b/gi,
  /\b(bandwidth|bandwidth to)\b/gi,
  /\b(deep dive|drill down)\b/gi
];

