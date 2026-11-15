class CourtFilingPage {
  render(app) {
    this.app = app;
    const container = makeElement('div', { className: 'flex flex-col gap-8' });

    const introCard = makeElement('div', {
      className: 'backstory-gradient-card',
      'data-block-id': 'court_filing_overview'
    }, [
      makeElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' } }, [
        makeElement('h2', { className: 'text-xl font-bold text-[var(--text-title)]' }, 'Court Filing & Daughter Advocacy Workspace'),
        makeElement('span', { className: 'elder-card-badge' }, '⚖️ November 2026 • Active Preparation')
      ]),
      makeElement('p', { className: 'backstory-paragraph-highlight' },
        'This dedicated workspace organizes verified facts, current living stability, chronological records, and supporting exhibits for matters concerning my daughter and upcoming court filings. Click "📝 Note" or "✎ Edit" on any block below to dictate details directly and compile them via "⚡ Living Directives".'
      )
    ]);
    container.appendChild(introCard);

    const sections = [
      {
        id: 'court_current_stability',
        badge: '🏠 Current Stability (Nov 2026)',
        title: '1. Current Living Situation & Day-to-Day Stability',
        text: 'Currently established in a stable, reliable living situation with consistent housing, utilities, and internet connectivity. The acute August 2026 transition is resolved, providing a settled foundation for ongoing software/IP work and parenting responsibilities.'
      },
      {
        id: 'court_daughter_issues',
        badge: '👨‍👧 Daughter & Parenting Matters',
        title: '2. Issues & Relief Sought Regarding My Daughter',
        text: 'Use "📝 Note" (voice dictation) or "✎ Edit" on this block to record the specific parenting, custody/visitation, communication, or support facts to be presented in the court filing and the exact relief being requested.'
      },
      {
        id: 'court_family_context',
        badge: '🔒 Family Dynamics & Context',
        title: '3. Relevant Family Context & Communication Barriers',
        text: 'Family dynamics and communication remain strained/complicated. Relevant documented history (including care/fiduciary gatekeeping and communication records) is cross-referenced in the Fiduciary & Care Arrangements and Caretaker Bias tabs for verification if needed.'
      },
      {
        id: 'court_evidence_checklist',
        badge: '📎 Exhibits & Documentary Record',
        title: '4. Documentary Evidence, Messages & Timeline Checklist',
        text: 'Attach or dictate dates, messages, records, financial/support documentation, and witness points here. Once captured as Living Directives, click "⚡ Living Directives" in the header to compile a clean court-ready outline or LLM revision prompt.'
      }
    ];

    const gridPanel = makeElement('section', { className: 'cad-panel flex flex-col gap-6' }, [
      makeElement('div', { className: 'dashboard-header-group mb-2' }, [
        makeElement('h3', {}, 'Structured Filing Sections'),
        makeElement('p', {}, 'Every section below supports voice dictation (📝 Note), in-situ editing (✎ Edit), and Aardvark element selection (🔍 Aardvark).')
      ]),
      makeElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
        sections.map(sec => makeElement('div', {
          className: 'elder-analysis-card',
          'data-block-id': sec.id
        }, [
          makeElement('span', { className: 'elder-card-badge mb-2 inline-block' }, sec.badge),
          makeElement('h4', { className: 'text-base font-bold text-[var(--text-title)] mb-2' }, sec.title),
          makeElement('p', {
            'data-editable-text': 'true',
            className: 'text-sm text-[var(--text-secondary)] leading-relaxed'
          }, sec.text)
        ]))
      )
    ]);
    container.appendChild(gridPanel);

    return container;
  }
}

window.CourtFilingPage = CourtFilingPage;
globalThis.CourtFilingPage = CourtFilingPage;
if (typeof module !== 'undefined' && module.exports) module.exports = CourtFilingPage;