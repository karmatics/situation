class SituationSummaries {
  static getAll() {
    return {
      overview: {
        title: 'Executive Summary & Current Status',
        tldr: 'Updated Nov 2026: documents stabilized housing/utilities, active focus on daughter court filings and software commercialization, and the contrast with $1.2B–$5.54B+ in created Bentley Systems enterprise value.',
        whatsNext: 'Next views cover the daughter court filing workspace, elder advocacy boundaries, caretaker records, AI timeline, current software work, and the 4-model valuation.'
      },
      'court-filing': {
        title: 'Daughter & Court Filing Workspace',
        tldr: 'Organizes Rob Brown\'s current stability record, parenting chronology, and structured evidence for upcoming daughter court filings.',
        whatsNext: 'Follows with Elder Advocacy & Virginia POA legal boundary analysis.'
      },
      'elder-advocacy': {
        title: 'Elder Advocacy & POA Boundaries',
        tldr: 'Reviews Virginia Uniform Power of Attorney Act (Va. Code § 64.2-1612 / § 64.2-2019.1) boundaries regarding visitation and honoring a principal\'s stated wishes.',
        whatsNext: 'Caretaker Bias documents the factual record of family resource obstruction.'
      },
      'caretaker-bias': {
        title: 'Caretaker Bias & Resource Obstruction Record',
        tldr: 'Chronicles family Power of Attorney interference blocking Rob\'s mother from sending her desired financial support (sensitive context; separate from public technical showcases).',
        whatsNext: 'AI Perspective frames the urgency of software commercialization in an accelerating AI economy.'
      },
      'ai-perspective': {
        title: 'AI Automation & Urgent Career Timeline',
        tldr: 'Explains why accelerating AI coding and automation compress traditional employment timelines and increase urgency for independent commercialization.',
        whatsNext: 'Current Work inventories active Vibe Coding, Luno, CAD, and music/piano IP projects.'
      },
      'current-work': {
        title: 'Current Work & Vibe Coding Environment',
        tldr: 'Showcases Rob Brown\'s active living-specification software suite (Luno, Opus, CadPlan, QuoraToys, piano/music tools).',
        whatsNext: 'Valuation presents the 4-model consensus ($2.3B midpoint) and unprimed Google counterfactual ($1.2B–$5.54B+).'
      },
      valuation: {
        title: 'AccuDraw & SmartLine Value Assessment',
        tldr: 'Compares independent valuation estimates across Claude, Gemini, ChatGPT, and Grok ($2.3B consensus midpoint; $1.2B–$5.54B+ counterfactual) anchored on US Patent #5,754,182.',
        whatsNext: 'End of dossier; use Directives or Clip Notes to export notes with exact references.'
      }
    };
  }

  static get(pageId) {
    return this.getAll()[pageId] || null;
  }

  static toMarkdown() {
    const all = this.getAll();
    const lines = ['# Situation Dossier — Executive Summaries (Tier 0)', ''];
    for (const [id, s] of Object.entries(all)) {
      lines.push(`## ${s.title} (\`${id}\`)`);
      lines.push(`- **Summary:** ${s.tldr}`);
      lines.push(`- **What Follows:** ${s.whatsNext}`);
      lines.push('');
    }
    return lines.join('\n').trim();
  }
}

globalThis.SituationSummaries = SituationSummaries;
if (typeof module !== 'undefined' && module.exports) module.exports = SituationSummaries;