class OverviewPage {

  render(app) {
      const container = makeElement('div', { className: 'flex flex-col gap-8' });
      const isUnlocked = typeof SensitiveContextGate !== 'undefined' && SensitiveContextGate.isUnlocked();

      // 1. Current Situational Status (November 2026)
      const statusBanner = makeElement('div', {
        className: 'cad-panel',
        'data-block-id': 'status_current_nov2026',
        style: {
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.09) 0%, rgba(59, 130, 246, 0.09) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.42)',
          borderRadius: '14px',
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 8px 28px rgba(0, 0, 0, 0.22)'
        }
      }, [
        makeElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' } }, [
          makeElement('strong', { style: { color: '#10b981', fontSize: '16.5px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'ui-monospace, monospace', lineHeight: '1.35' } }, '🏠 Current Status (November 2026): Chico Housing Stabilized & Active Priorities'),
          makeElement('span', { style: { fontSize: '11px', fontWeight: 'bold', color: '#10b981', background: 'rgba(16, 185, 129, 0.14)', border: '1px solid rgba(16, 185, 129, 0.5)', padding: '4px 11px', borderRadius: '14px', fontFamily: 'ui-monospace, monospace' } }, '● Chico Apartment + SS Active')
        ]),
        makeElement('p', { 'data-editable-text': 'true', style: { color: 'var(--text-primary)', fontSize: '15.2px', lineHeight: '1.78', margin: '0' } },
          'Day-to-day housing in Chico, CA recently stabilized after my brother-in-law Jack traveled out to help move me into a new apartment and get Social Security started (~$1,900/month, with EBT phasing out as Social Security takes effect). Upfront for clarity: I am out of contact with all of my blood relatives—including my 94-year-old mother, the sister I used to talk to regularly, and my 12-year-old daughter Stella. This is not a distance I chose; earlier efforts to speak with my mother involved supervision over what I was allowed to talk about, leaving contact strained and uncomfortable. Carrying the weight of losing contact with both my daughter and my mother\'s side at the same time—for completely different reasons—pushed me into an unstable mental-health crisis I nearly didn\'t survive. Jack is the only family-side contact I communicate with right now, alongside Don (a good-hearted investigator Jack hired during an earlier wellness check who remains on email and helped keep communication between Jack and me alive).'
        ),
        makeElement('p', { 'data-editable-text': 'true', style: { color: 'var(--text-primary)', fontSize: '15.2px', lineHeight: '1.78', margin: '0' } },
          'People also often misunderstand my career: I have done very well when I am in an environment suited to my technical strengths, whereas being forced into the wrong situations goes poorly. Alongside pursuing software work, I am applying for Social Security disability related to executive dysfunction and avoiding overwhelming paperwork—which is also why I keep my records organized in AI-ready documents here. Regarding June 2026: during an acute crisis when power had been shut off, I had no access to my computer, family was unresponsive, and I felt completely abandoned while calling out my sister\'s actions, I recorded and shared several videos. Jack told me they offended people and were counterproductive; looking back, I see how destabilizing that period was and am taking a much calmer, measured approach now.'
        ),
        makeElement('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' } }, [
          makeElement('button', {
            className: 'dr-nav-btn primary',
            style: { padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', borderRadius: '8px' },
            onclick: () => { window.location.hash = '#/court-filing'; }
          }, `${isUnlocked ? '⚖️' : '🔒'} Open Daughter & Court Filing Workspace ➔`)
        ])
      ]);
      container.appendChild(statusBanner);

      // 2. Daughter (Stella), SF Custody & San Mateo Support Summary
      const courtPrepPanel = makeElement('div', {
        className: 'cad-panel flex flex-col gap-4',
        'data-block-id': 'overview_daughter_and_courts'
      }, [
        makeElement('div', { className: 'dashboard-header-group mb-1' }, [
          makeElement('h3', {}, 'Daughter (Stella, 12), San Francisco Custody & San Mateo Support Context'),
          makeElement('p', {}, 'A calm, factual overview for legal counsel, family reviewers, and court preparation.')
        ]),
        makeElement('p', { 'data-editable-text': 'true', className: 'text-sm text-[var(--text-primary)] leading-relaxed' },
          'My divorce and custody proceedings were filed in San Francisco Superior Court, while child support enforcement is handled through San Mateo County. In 2017, when my daughter Stella was three years old, I won primary custody; earlier in our marriage/parenting years, I supported her mother for roughly three years while she earned a new degree and stepped back from advancing my own career to handle parenting before she moved back to San Francisco when Stella started kindergarten. Stella is now 12, and I have been out of contact with her for over a year despite prior 50/50 time under a temporary order.'
        ),
        makeElement('p', { 'data-editable-text': 'true', className: 'text-sm text-[var(--text-primary)] leading-relaxed' },
          'Early this spring, while housing and family support were collapsing and executive-function paralysis during a mental-health breakdown left me unable to handle legal paperwork, I received thick packages from Stella\'s mother\'s lawyer that I couldn\'t bring myself to open. Now stabilized in Chico, I am bringing those unopened packages to my therapy appointment tomorrow so I can go through them constructively and respond properly. On the financial side, roughly three years ago I was fired from a return coding role at Bentley Systems (where my earlier work created billions in enterprise value) amid early post-ChatGPT AI tool bans, leading to depression and prolonged lack of traditional employment. Because an older Bentley-era child support order was never adjusted downward—even after $6,000 in arrears was paid a year ago to secure my Chico apartment—San Mateo is currently withholding roughly $600/month from my ~$1,900/month Social Security while Stella\'s mother is employed. I am preparing a support modification request so basic stability is protected while I rebuild to be back in Stella\'s life and help support her future, including college.'
        ),
        makeElement('details', {
          'data-block-id': 'overview_jack_don_context',
          style: {
            marginTop: '4px',
            backgroundColor: 'var(--bg-panel-inner)',
            border: '1px solid var(--border-color)',
            borderLeft: '3px solid #64748b',
            borderRadius: '10px',
            padding: '14px 18px'
          }
        }, [
          makeElement('summary', {
            style: { cursor: 'pointer', fontSize: '13.5px', fontWeight: '700', color: 'var(--text-secondary)', outline: 'none', lineHeight: '1.5' }
          }, '▸ Additional Context: Conversations with Jack & Don, AI Valuations & Career Fit (Optional Expand • Included in AI Q&A)'),
          makeElement('div', { style: { marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '14px' } }, [
            makeElement('p', { 'data-editable-text': 'true', className: 'text-sm text-[var(--text-secondary)] leading-relaxed' },
              'Because Jack is my sole family-side contact and Don remains on the email thread, this record is meant to help them—and Stella\'s mother and her attorneys—understand why I keep working on software rather than only pursuing disability. Jack has not shared a full long-term plan with me, and neither Jack nor Don understands software technology or where I thrive: I have done very well in environments suited to my technical strengths, while misaligned jobs go poorly.'
            ),
            makeElement('p', { 'data-editable-text': 'true', className: 'text-sm text-[var(--text-secondary)] leading-relaxed' },
              'A major point of friction is that independent LLMs (ChatGPT, Gemini, Claude, Grok) and Google Search consistently estimate my past inventions at Bentley Systems (AccuDraw and SmartLine) generated billions in enterprise value and rank among the highest-ROI hires in software history—even though that wealth did not come to me. Jack rejects this outright, claiming he could get an AI to say the same about anyone, yet he will not try running the neutral prompt himself. Having built this entire AI-orchestration system myself, I specifically crafted those verification queries blindly (without mentioning my name) to eliminate sycophancy and ego-stroking. This context is kept tucked in here rather than out front so it does not inflame difficult conversations, while ensuring any AI answering Jack\'s questions has the full picture.'
            )
          ])
        ])
      ]);
      container.appendChild(courtPrepPanel);

      // 3. Chronological Log (Updated through November 2026)
      const timelinePanel = makeElement('div', { className: 'cad-panel flex flex-col gap-6' }, [
        makeElement('div', { className: 'dashboard-header-group mb-2' }, [
          makeElement('h3', {}, 'Chronological Log: Custody, Career & Living Stability'),
          makeElement('p', {}, 'Verified sequence connecting 2017–2026 parenting, employment, housing stabilization, and current legal steps.')
        ]),
        makeElement('div', { className: 'space-y-4' }, [
          this.buildTimelineCard(
            '2017 & Early Years (San Francisco)',
            'Primary Custody Win & Supporting Ex-Wife\'s Degree',
            'Supported ex-wife for ~3 years while she completed a new degree; won primary custody of Stella at age 3 in 2017 and stepped back from career advancement during custody litigation before she moved back to San Francisco around kindergarten.',
            '👨‍👧 Custody History',
            'timeline_2017_custody'
          ),
          this.buildTimelineCard(
            '~2023 (3 Years Ago)',
            'Bentley Systems Return & Firing Amid Early AI Restrictions',
            'Returned briefly to Bentley Systems in a coding role; terminated amid early post-ChatGPT AI bans and organizational friction, followed by depression and prolonged lack of traditional employment.',
            '💼 Career Disruption',
            'timeline_bentley_firing'
          ),
          this.buildTimelineCard(
            '2024 – 2025 (San Mateo / Chico)',
            'Unmodified Support Order & $6,000 Arrears Payment',
            'Support order based on earlier Bentley salary continued accruing without adjustment; ~$6,000 paid off a year ago to enable Chico apartment move, though no modification motion was filed in the year since.',
            '⚖️ Support History',
            'timeline_support_6000'
          ),
          this.buildTimelineCard(
            'Spring – Aug 2026',
            'Unopened Legal Mail, June Crisis & Housing Transition',
            'Received thick lawyer packets in spring during housing/family collapse (unable to open due to executive-function breakdown); June power shutoff & acute instability when videos were shared; August housing transition before Chico stabilization.',
            '📋 Historical Crisis',
            'timeline_utility_eviction'
          ),
          this.buildTimelineCard(
            'November 2026 (Current)',
            'Chico Stabilization, Social Security & Therapy Packet Review',
            'Jack helped move into new Chico apartment and set up Social Security (~$1,900/mo; ~$600/mo withheld by San Mateo; EBT phasing out). Bringing unopened spring legal packets to therapy tomorrow; preparing San Mateo support modification and San Francisco custody response.',
            '🏠 Current Focus',
            'timeline_nov2026_stability'
          )
        ])
      ]);
      container.appendChild(timelinePanel);

      // 4. Complete Inventions & Product Catalog
      const productPanel = makeElement('div', { className: 'cad-panel flex flex-col gap-6' }, [
        makeElement('div', { className: 'dashboard-header-group mb-2' }, [
          makeElement('h3', {}, 'Active Intellectual Property & Product Inventory'),
          makeElement('p', {}, 'Detailed overview of physical assets, software platforms, and interactive training tools ready for commercialization.')
        ]),
        makeElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' }, [
          makeElement('div', { className: 'elder-analysis-card', 'data-block-id': 'inv_piano_guides' }, [
            makeElement('span', { className: 'elder-card-badge mb-2 inline-block' }, '📦 Physical Inventory (3,000 Units)'),
            makeElement('h4', { className: 'text-base font-bold text-[var(--text-title)] mb-2' }, 'Full-Bleed Silicone Piano Key Guides'),
            makeElement('p', { 'data-editable-text': 'true', className: 'text-sm text-[var(--text-secondary)] leading-relaxed mb-3' },
              'Manufactured inventory of ~3,000 custom silicone keyboard strips (15 boxes / ~375 lbs total). Unlike existing market alternatives, these feature full-bleed edge color printing aligned with standard rainbow notation and direct software integration.'
            ),
            makeElement('div', { className: 'text-xs font-mono text-slate-400 bg-slate-900/60 p-2.5 rounded border border-slate-800' },
              'Status: In storage, ready for direct-to-consumer and e-commerce distribution.'
            )
          ]),

          makeElement('div', { className: 'elder-analysis-card', 'data-block-id': 'inv_ear_training_app' }, [
            makeElement('span', { className: 'elder-card-badge mb-2 inline-block' }, '🎵 Interactive Training Software'),
            makeElement('h4', { className: 'text-base font-bold text-[var(--text-title)] mb-2' }, 'Ear Training & Dynamic Staff Games'),
            makeElement('p', { 'data-editable-text': 'true', className: 'text-sm text-[var(--text-secondary)] leading-relaxed mb-3' },
              'Browser-based gamified music learning system featuring: (1) Missing-note harmonic ear training, (2) Real-time interactive staff reading across treble and bass clefs with key signatures, and (3) Play-along YouTube integration.'
            ),
            makeElement('div', { className: 'text-xs font-mono text-slate-400 bg-slate-900/60 p-2.5 rounded border border-slate-800' },
              'Engine: 2D SVG & Three.js 3D modeled keyboard with authentic key geometries and low latency.'
            )
          ]),

          makeElement('div', { className: 'elder-analysis-card', 'data-block-id': 'inv_vibe_coding_ide' }, [
            makeElement('span', { className: 'elder-card-badge mb-2 inline-block' }, '💻 Visual & Mobile Coding Platform'),
            makeElement('h4', { className: 'text-base font-bold text-[var(--text-title)] mb-2' }, 'Natural Language Browser IDE'),
            makeElement('p', { 'data-editable-text': 'true', className: 'text-sm text-[var(--text-secondary)] leading-relaxed mb-3' },
              'A fully bootstrapped, mobile-first visual coding environment capable of building, modifying, and live-patching web applications directly on mobile devices without complex local toolchains.'
            ),
            makeElement('div', { className: 'text-xs font-mono text-slate-400 bg-slate-900/60 p-2.5 rounded border border-slate-800' },
              'Capabilities: AST parsing, IndexedDB state caching, and one-tap GitHub Pages deployment.'
            )
          ]),

          makeElement('div', { className: 'elder-analysis-card', 'data-block-id': 'inv_accudraw_3d_engine' }, [
            makeElement('span', { className: 'elder-card-badge mb-2 inline-block' }, '📐 CAD & Spatial Modeling Legacy'),
            makeElement('h4', { className: 'text-base font-bold text-[var(--text-title)] mb-2' }, 'AccuDraw & 3D Web Implementation'),
            makeElement('p', { 'data-editable-text': 'true', className: 'text-sm text-[var(--text-secondary)] leading-relaxed mb-3' },
              'Three-decade legacy of high-leverage CAD UI design (originating MicroStation AccuDraw and SmartLine), now adapted into modern Three.js geometric manipulation tools following patent expiration.'
            ),
            makeElement('div', { className: 'text-xs font-mono text-slate-400 bg-slate-900/60 p-2.5 rounded border border-slate-800' },
              'Valuation: Multi-billion dollar enterprise impact verified across four major AI consensus models.'
            )
          ])
        ])
      ]);
      container.appendChild(productPanel);

      return container;
    }
  buildTimelineCard(date, title, description, badge, blockId = null) {
      const cardId = blockId || `timeline_${date.replace(/\s+/g, '_')}_${title.replace(/\s+/g, '_')}`;
      return makeElement('div', {
        'data-block-id': cardId,
        style: {
          padding: '20px 24px',
          backgroundColor: 'var(--bg-panel-inner)',
          border: '1px solid var(--border-color)',
          borderLeft: '3.5px solid #3b82f6',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }
      }, [
        makeElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' } }, [
          makeElement('span', { style: { fontSize: '12.5px', fontFamily: 'ui-monospace, monospace', fontWeight: '700', color: '#60a5fa' } }, date),
          makeElement('span', { className: 'elder-card-badge' }, badge)
        ]),
        makeElement('h4', { style: { fontSize: '16px', fontWeight: '700', color: 'var(--text-title)', lineHeight: '1.35', margin: '0' } }, title),
        makeElement('p', { 'data-editable-text': 'true', style: { fontSize: '14.5px', color: 'var(--text-primary)', lineHeight: '1.72', margin: '0' } }, description)
      ]);
    }
}

window.OverviewPage = OverviewPage;
globalThis.OverviewPage = OverviewPage;
if (typeof module !== 'undefined' && module.exports) module.exports = OverviewPage;