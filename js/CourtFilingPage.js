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
          'This dedicated workspace organizes verified facts, current living stability, chronological records, and supporting exhibits for matters concerning my 12-year-old daughter Stella (San Francisco custody & San Mateo support modification). Click "📝 Note" or "✎ Edit" on any block below to dictate details directly and compile them via "⚡ Living Directives".'
        )
      ]);
      container.appendChild(introCard);

      const sections = [
        {
          id: 'court_current_stability',
          badge: '🏠 Current Stability (Nov 2026)',
          title: '1. Current Living Situation & Day-to-Day Stability',
          text: 'Currently established in a stable Chico apartment with utilities, internet connectivity, and Social Security (~$1,900/month, EBT phasing out) set up with Jack\'s help. Bringing the unopened spring legal packages from Stella\'s mother\'s attorney to therapy tomorrow to review and address constructively after earlier executive-dysfunction paralysis.'
        },
        {
          id: 'court_daughter_issues',
          badge: '👨‍👧 Daughter & Court-Ordered Contact',
          title: '2. Issues & Relief Sought Regarding Stella (12)',
          text: 'Separated from Stella for over a year despite winning primary custody in 2017 and sharing 50/50 time under a temporary order. Her mother turned Stella against me, told me she did not have to talk to me unless she wanted to, and refused to facilitate the video contact ordered by the judge—actively working against the court order. Seeking restoration of court-ordered contact and fair San Mateo child-support modification (stopping ~$600/month withholding from Social Security while Stella\'s mother is employed).'
        },
        {
          id: 'court_family_context',
          badge: '🔒 Parallel Family Context (Unrelated Causes)',
          title: '3. Blood-Relative Estrangement & Mental-Health Toll',
          text: 'Currently out of contact—not by choice—with all blood relatives, including my 94-year-old mother and the sister I used to speak with regularly (who holds POA and whose political/personal posture sits on the polar opposite extreme from my ex-wife\'s). Despite completely different causes, being cut off from both my daughter and my mother\'s family weighed heavily together and contributed to a severe mental-health crisis.'
        },
        {
          id: 'court_evidence_checklist',
          badge: '📎 Exhibits & Documentary Record',
          title: '4. Documentary Evidence, Messages & Timeline Checklist',
          text: 'Attach or dictate dates, court orders, refused video-contact records, financial/support documentation (~$6,000 paid a year ago + current SS withholding), and therapy notes here. Once captured as Living Directives, click "⚡ Living Directives" in the header to compile a clean court-ready outline.'
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