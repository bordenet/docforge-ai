/**
 * Templates for Job Description
 * Pre-filled content mapped to docforge-ai form field IDs
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
    id: 'softwareEngineer',
    name: 'Software Engineer',
    icon: '💻',
    description: 'Backend/fullstack role',
    fields: {
      jobTitle: 'Software Engineer',
      postingType: 'external',
      department: 'Engineering',
      level: 'senior',
      teamContext:
        "Join our [team name] team building [product/system]. We're responsible for [core function] serving [scale] users/requests.\n\nYou'll work on:\n- [Project/initiative 1]\n- [Project/initiative 2]\n- [Project/initiative 3]",
      requirements:
        '- 5+ years of software development experience\n- Proficiency in [Python/Java/Go/Node.js]\n- Experience with relational databases and SQL\n- Strong understanding of distributed systems\n- BS/MS in Computer Science or equivalent experience',
      niceToHave:
        '- Experience with [specific technology]\n- Background in [domain]\n- Open source contributions\n- Experience at [company type/scale]',
      compensation: '$[X]K-$[Y]K base + equity + benefits',
    },
  },
  {
    id: 'aiEngineer',
    name: 'AI/ML Engineer',
    icon: '🤖',
    description: 'Applied AI role',
    fields: {
      jobTitle: 'Applied AI Engineer',
      postingType: 'external',
      department: 'AI/ML',
      level: 'senior',
      teamContext:
        "Join our Applied AI team building intelligent features across [product]. We're pushing the boundaries of what's possible with LLMs and modern ML.\n\nYou'll work on:\n- Production ML/AI systems\n- LLM integration and fine-tuning\n- RAG pipelines and prompt engineering",
      requirements:
        '- 3+ years of ML/AI engineering experience\n- Hands-on experience with LLMs (GPT, Claude, Llama)\n- Production experience with RAG, embeddings, vector DBs\n- Strong Python and ML framework skills (PyTorch, HuggingFace)\n- Experience deploying models at scale',
      niceToHave:
        '- Experience fine-tuning foundation models\n- Background in NLP or information retrieval\n- Published research in ML/AI\n- Experience with ML infrastructure (MLflow, Kubeflow)',
      compensation: '$[X]K-$[Y]K base + equity + benefits',
    },
  },
  {
    id: 'productManager',
    name: 'Product Manager',
    icon: '📊',
    description: 'PM role',
    fields: {
      jobTitle: 'Product Manager',
      postingType: 'external',
      department: 'Product',
      level: 'senior',
      teamContext:
        "Join our [product area] team shaping the future of [product/experience]. You'll own the roadmap for [specific area] impacting [X] users.\n\nYou'll drive:\n- Product strategy and roadmap\n- Cross-functional delivery\n- Customer research and insights",
      requirements:
        '- 5+ years of product management experience\n- Track record of shipping successful products\n- Strong analytical and data-driven decision making\n- Excellent communication and stakeholder management\n- Experience in [B2B SaaS / Consumer / Platform]',
      niceToHave:
        '- Technical background or CS degree\n- Experience in [specific domain]\n- MBA or equivalent\n- Experience at [growth stage]',
      compensation: '$[X]K-$[Y]K base + equity + benefits',
    },
  },
  {
    id: 'engineeringManager',
    name: 'Engineering Manager',
    icon: '👔',
    description: 'People manager role',
    fields: {
      jobTitle: 'Engineering Manager',
      postingType: 'external',
      department: 'Engineering',
      level: 'manager',
      teamContext:
        "Lead our [team name] team of [X] engineers building [product/system]. You'll be responsible for [scope] while growing and developing your team.\n\nYou'll own:\n- Team performance and delivery\n- Hiring and talent development\n- Technical strategy and execution",
      requirements:
        '- 3+ years of engineering management experience\n- 8+ years of software development experience\n- Track record of building high-performing teams\n- Strong technical judgment and systems thinking\n- Experience scaling teams through growth',
      niceToHave:
        '- Experience managing managers\n- Background in [specific technical area]\n- Experience at similar scale/stage\n- Track record of developing senior talent',
      compensation: '$[X]K-$[Y]K base + equity + benefits',
    },
  },
];

export function getTemplate(templateId) {
  return TEMPLATES.find((t) => t.id === templateId) || null;
}

export function getAllTemplates() {
  return TEMPLATES;
}
