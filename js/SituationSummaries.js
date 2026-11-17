class SituationSummaries {

  static getAll() {
      const isUnlocked = typeof SensitiveContextGate !== 'undefined' && SensitiveContextGate.isUnlocked();
      return {
        overview: {
          title: 'Executive Summary & Current Status',
          tldr: 'Updated Nov 2026: documents stabilized Chico apartment living (with Jack\'s move help) and Social Security (~$1,900/mo, EBT phasing out), Don on email, out of contact—not by choice—with all blood relatives (94-year-old mother, sister, and 12-year-old daughter Stella), SF custody & San Mateo ~$600/mo withholding after $6,000 paid, executive-dysfunction / career-fit context, June 2026 crisis background, and $1.2B–$5.54B+ in created Bentley Systems value.',
          whatsNext: 'Next views include the gated Daughter & Court Filing, Fiduciary Care, and Family Exhibits pages, followed by AI Timeline, Current Work, and Valuation.'
        },
        'court-filing': {
          title: 'Daughter & Court Filing Workspace',
          tldr: isUnlocked
            ? 'Organizes Rob Brown\'s Chico stability, San Francisco custody chronology (2017 primary custody of Stella, court-ordered video contact refused by ex-wife), San Mateo child-support modification facts, and therapy/spring-packet action items.'
            : 'Protected court and daughter preparation workspace (hidden by default; enter access code to view).',
          whatsNext: 'Follows with protected Care & Communication Review.'
        },
        'elder-advocacy': {
          title: 'Care Arrangements & Family Communication Review',
          tldr: isUnlocked
            ? 'Reviews Virginia legal standards (Va. Code § 64.2-1612 / § 64.2-2019.1), visitation boundaries, and the therapy-initiated Virginia elder-welfare inquiry.'
            : 'Protected caregiving and family communication review page (hidden by default; enter access code to view).',
          whatsNext: 'Family Conflict & Exhibits documents archived social-media and interpersonal exhibits.'
        },
        'caretaker-bias': {
          title: 'Family Conflict & Exhibits Review',
          tldr: isUnlocked
            ? 'Chronicles archived LinkedIn/social-media exhibits, Virginia timeline, and family financial/caregiving disputes.'
            : 'Protected family conflict and social-media exhibits archive (hidden by default; enter access code to view).',
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