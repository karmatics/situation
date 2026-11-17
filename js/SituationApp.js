class SituationApp {

  async run(env) {
        if (!env || !env.container) {
          throw new Error("run() requires an environment object with a valid container.");
        }
        if (typeof DomBasics !== 'undefined' && typeof DomBasics.run === 'function') {
          DomBasics.run();
        }
        this.env = env;
        this.targetElement = env.container;
        globalThis._situationAppInstance = this;

        this.initializeTheme();
        this.loadGoogleFont();
        this.setupState(this.parseRawContent());
        this.loadAppStyles();
        this.preloadResources();
        this.setupKeyboardListeners();

        if (typeof CadPlanAardvark !== 'undefined') {
          this.aardvark = new CadPlanAardvark({ container: this.targetElement, dossierId: 'situation' });
          this.aardvark.init();
        }

        if (typeof CadPlanItemNotes !== 'undefined' && typeof CadPlanItemNotes.subscribe === 'function') {
          this._unsubNotes = CadPlanItemNotes.subscribe(() => {
            const wrapper = this.targetElement?.querySelector('.cad-wrapper');
            if (wrapper && typeof DocumentReader !== 'undefined' && typeof DocumentReader.decorateContainer === 'function') {
              DocumentReader.decorateContainer(wrapper, {
                dossierId: 'situation',
                pageId: this.currentView
              });
            }
          });
        }

        this._hashChangeHandler = () => this.handleRoute();
        window.addEventListener('hashchange', this._hashChangeHandler);
        this.handleRoute();
      }

  destroy() {
        if (this._unsubNotes) {
          try { this._unsubNotes(); } catch (e) {}
          this._unsubNotes = null;
        }
        if (this.aardvark) {
          this.aardvark.destroy();
          this.aardvark = null;
        }
        if (this.valueEmberLogo) {
          this.valueEmberLogo.destroy();
        }
        if (this.bfnPlayer) {
          this.bfnPlayer.destroy();
          this.bfnPlayer = null;
        }
        if (this.fallbackTimeout) clearTimeout(this.fallbackTimeout);
        if (this.fallbackTriggerTimeout) clearTimeout(this.fallbackTriggerTimeout);
        const overlay = document.getElementById('bfn-overlay');
        if (overlay) overlay.remove();
        const exhibit = document.getElementById('situation-exhibit-modal');
        if (exhibit) exhibit.remove();
        const dock = document.getElementById('dr-notes-nav-dock');
        if (dock) dock.remove();
        if (this._currentKeydownHandler) {
          window.removeEventListener('keydown', this._currentKeydownHandler);
        }
        if (this._hashChangeHandler) {
          window.removeEventListener('hashchange', this._hashChangeHandler);
        }
        if (globalThis._situationAppInstance === this) {
          globalThis._situationAppInstance = null;
        }
      }
  parseRawContent() {
    return this.getValuationStaticData();
  }

  setupState(data) {
      this.data = data;
      this.activeTab = 'all';
      this.resultsRevealed = false;
      this.isTransitioning = false;
      this.revealMode = localStorage.getItem('accudraw-reveal-mode') || 'no-drama';
      this.wrongAnswerStage = 0;
      this.justCorrected = false;
      this.isCalculating = false;
      this.showRecalculateButton = false;
      this.showBFNButton = false;
      this.motionValue = parseFloat(localStorage.getItem('accudraw-motion-val') || '1.0');

      const hash = window.location.hash;
      if (hash.startsWith('#/court-filing')) {
        this.currentView = 'court-filing';
      } else if (hash.startsWith('#/elder-advocacy')) {
        this.currentView = 'elder-advocacy';
      } else if (hash.startsWith('#/caretaker-bias')) {
        this.currentView = 'caretaker-bias';
      } else if (hash.startsWith('#/value-assessment') || hash.startsWith('#/valuation')) {
        this.currentView = 'valuation';
      } else if (hash.startsWith('#/ai-perspective')) {
        this.currentView = 'ai-perspective';
      } else if (hash.startsWith('#/current-work')) {
        this.currentView = 'current-work';
      } else {
        this.currentView = 'overview';
      }
      this.expandedMessages = {};
    }

  handleRoute() {
        const hash = window.location.hash || '';
        const cleanParts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
        const routeSlug = cleanParts[0] || '';
        const blockSlug = cleanParts[1] || null;

        if (routeSlug === 'court-filing') {
          this.currentView = 'court-filing';
        } else if (routeSlug === 'elder-advocacy') {
          this.currentView = 'elder-advocacy';
        } else if (routeSlug === 'caretaker-bias') {
          this.currentView = 'caretaker-bias';
        } else if (routeSlug === 'value-assessment' || routeSlug === 'valuation') {
          this.currentView = 'valuation';
        } else if (routeSlug === 'ai-perspective') {
          this.currentView = 'ai-perspective';
        } else if (routeSlug === 'current-work') {
          this.currentView = 'current-work';
        } else {
          this.currentView = 'overview';
        }

        this._pendingScrollBlockId = blockSlug;
        this.renderApp();
      }

  renderApp() {
      this.targetElement.innerHTML = '';
      const themeClass = this.currentTheme === 'light' ? 'cad-container cad-grid-bg theme-light' : 'cad-container cad-grid-bg';
      const appContainer = makeElement('div', { className: themeClass });
      appContainer.style.setProperty('--motion-scale', String(this.motionValue));

      const innerWrapper = makeElement('div', {
        className: 'cad-wrapper', 'data-dossier': 'situation', 'data-page-id': this.currentView
      });

      if (this.currentView === 'elder-advocacy') innerWrapper.appendChild(this.buildElderHeader());
      else if (this.currentView === 'caretaker-bias') innerWrapper.appendChild(this.buildCaretakerHeader());
      else innerWrapper.appendChild(this.buildMinimalHeader());

      const summaryCard = this._renderSummaryCard();
      if (summaryCard) innerWrapper.appendChild(summaryCard);

      const isGatedView = ['court-filing', 'elder-advocacy', 'caretaker-bias'].includes(this.currentView);
      const isLocked = typeof SensitiveContextGate !== 'undefined' && !SensitiveContextGate.isUnlocked();

      if (isGatedView && isLocked) {
        const gateMeta = {
          'court-filing': {
            sensitiveLabel: 'Daughter & Court Filing Workspace',
            sensitiveSummary: 'Contains detailed court preparation notes, parenting history, and support filing details kept behind the optional access gate so the main overview stays concise. Enter the access code to view.'
          },
          'elder-advocacy': {
            sensitiveLabel: 'Care Arrangements & Family Communication Review',
            sensitiveSummary: 'Contains detailed legal-boundary analysis, therapy-initiated inquiry notes, and consultation transcripts kept out of default view. Enter the access code to view.'
          },
          'caretaker-bias': {
            sensitiveLabel: 'Family Conflict & Social Media Exhibits',
            sensitiveSummary: 'Contains archived interpersonal conflict records and social-media exhibits kept out of default view. Enter the access code to view.'
          }
        }[this.currentView];

        innerWrapper.appendChild(
          SensitiveContextGate.renderLockedBlock({
            id: `page_${this.currentView}`,
            sensitiveLabel: gateMeta.sensitiveLabel,
            sensitiveSummary: gateMeta.sensitiveSummary
          }, () => this.renderApp())
        );
      } else {
        let page = null;
        if (this.currentView === 'court-filing' && typeof CourtFilingPage !== 'undefined') page = new CourtFilingPage();
        else if (this.currentView === 'overview') page = new OverviewPage();
        else if (this.currentView === 'ai-perspective') page = new AiPerspectivePage();
        else if (this.currentView === 'elder-advocacy') page = new ElderAdvocacyPage();
        else if (this.currentView === 'caretaker-bias') page = new CaretakerBiasPage();
        else if (this.currentView === 'current-work') page = new CurrentWorkPage();
        else page = new ValuationPage();

        innerWrapper.appendChild(page.render(this));
      }

      innerWrapper.appendChild(this.buildFooter());
      appContainer.appendChild(innerWrapper);
      this.targetElement.appendChild(appContainer);

      if (typeof DocumentReader !== 'undefined' && typeof DocumentReader.decorateContainer === 'function') {
        setTimeout(() => {
          DocumentReader.decorateContainer(innerWrapper, { dossierId: 'situation', pageId: this.currentView });
          if (this._pendingScrollBlockId) {
            const targetId = this._pendingScrollBlockId;
            this._pendingScrollBlockId = null;
            const targetEl = innerWrapper.querySelector(`[data-block-id="${targetId}"], [data-block="${targetId}"]`) || document.getElementById(targetId);
            if (targetEl) {
              targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              targetEl.style.transition = 'box-shadow 0.3s ease';
              targetEl.style.boxShadow = '0 0 0 2px #00f2fe, 0 0 24px rgba(0, 242, 254, 0.45)';
              setTimeout(() => { targetEl.style.boxShadow = ''; }, 2400);
            }
          }
        }, 0);
      }

      if (this.currentView === 'valuation' && this.resultsRevealed && !this._isAwaitingRecalculation()) {
        const emberValText = this.targetElement.querySelector('.glowing-consensus-value');
        if (emberValText) {
          if (this.valueEmberLogo) this.valueEmberLogo.destroy();
          this.valueEmberLogo = new ValueEmberLogo(emberValText, {
            isAwake: true, emberCountMultiplier: 0.4 * this.motionValue,
            emberSpeedMultiplier: 0.3 * this.motionValue, emberSizeMultiplier: 0.4 * this.motionValue
          });
        }
      } else if (this.valueEmberLogo) {
        this.valueEmberLogo.destroy();
        this.valueEmberLogo = null;
      }
    }
  buildMinimalHeader() {
    const revealModeSelect = makeElement('select', {
      className: 'reveal-mode-select',
      onchange: (e) => {
        this.revealMode = e.target.value;
        localStorage.setItem('accudraw-reveal-mode', this.revealMode);
      }
    }, [
      makeElement('option', { value: 'drum-roll' }, 'Drum Roll'),
      makeElement('option', { value: 'no-drama' }, 'No Drama'),
      makeElement('option', { value: 'wrong-answers' }, 'Wrong Answers')
    ]);
    revealModeSelect.value = this.revealMode;

    const controlsGroup = makeElement('div', { className: 'flex flex-col items-end gap-1' }, [
      makeElement('div', { style: { display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' } }, this._buildEnhancedLivingTools()),
      this.currentView === 'valuation' ? makeElement('div', { className: 'reveal-mode-row' }, [revealModeSelect]) : null,
      this.currentView === 'valuation' ? this.buildMotionSlider() : null
    ].filter(Boolean));

    let headerTitle = 'Career Dossier & Valuation Assessment';
    let headerSubtitle = 'A comprehensive situational analysis and economic timeline';
    if (this.currentView === 'court-filing') {
      headerTitle = 'Daughter & Court Filing Workspace';
      headerSubtitle = 'Current stability record, parenting chronology, and structured evidence for filing';
    } else if (this.currentView === 'overview') {
      headerTitle = 'Executive Summary & Current Status';
      headerSubtitle = 'Updated November 2026 stability, priorities, and technical timeline';
    } else if (this.currentView === 'ai-perspective') {
      headerTitle = 'AI Automation & Urgent Career Timeline';
      headerSubtitle = 'The exponential pace of automation and professional time pressure';
    } else if (this.currentView === 'current-work') {
      headerTitle = 'Current Work & Vibe Coding Environment';
      headerSubtitle = 'Next-generation recursively self-improving visual code environments';
    } else if (this.currentView === 'valuation') {
      headerTitle = 'AccuDraw & SmartLine Value Assessment';
      headerSubtitle = 'A comparative analysis of enterprise value contribution';
    }

    return makeElement('header', { className: 'minimal-header' }, [
      makeElement('div', { className: 'header-top' }, [
        makeElement('div', { className: 'tags-wrapper' }, [
          makeElement('span', { className: 'tag-pill tag-pill-blue' }, 'Portfolio & Dossier'),
          makeElement('span', { className: 'tag-pill tag-pill-slate' }, '1994 - Nov 2026')
        ]),
        controlsGroup
      ]),
      makeElement('div', { className: 'title-group' }, [
        makeElement('h1', {}, headerTitle),
        makeElement('p', { className: 'title-subtitle' }, headerSubtitle)
      ]),
      this.buildGlobalNavigation(this.currentView)
    ]);
  }

  buildElderHeader() {
      const isUnlocked = typeof SensitiveContextGate === 'undefined' || SensitiveContextGate.isUnlocked();
      return makeElement('header', { className: 'minimal-header' }, [
        makeElement('div', { className: 'header-top' }, [
          makeElement('span', { className: 'tag-pill tag-pill-blue' }, 'Care & Communication Review'),
          makeElement('div', { style: { display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' } }, this._buildEnhancedLivingTools())
        ]),
        makeElement('div', { className: 'title-group' }, [
          makeElement('h1', {}, 'Care Arrangements & Family Communication Review'),
          makeElement('p', { className: 'title-subtitle' }, isUnlocked
            ? 'A factual analysis of caregiving boundaries, Virginia legal standards, and communication records'
            : 'Protected family care and communication record (hidden by default; enter access code to view)'
          )
        ]),
        this.buildGlobalNavigation('elder-advocacy')
      ]);
    }

  buildCaretakerHeader() {
          const isUnlocked = typeof SensitiveContextGate === 'undefined' || SensitiveContextGate.isUnlocked();
          return makeElement("header", { className: "minimal-header" }, [
            makeElement("div", { className: "header-top" }, [
              makeElement("span", { className: "tag-pill tag-pill-blue" }, isUnlocked ? "Caretaker Bias Review" : "Protected Family Context"),
              makeElement("div", { style: { display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" } }, this._buildEnhancedLivingTools())
            ]),
            makeElement("div", { className: "title-group" }, [
              makeElement("h1", {}, isUnlocked ? "Caretaker Bias & LinkedIn Exhibits Review" : "Additional Family & Interpersonal Exhibits"),
              makeElement("p", { className: "title-subtitle" }, isUnlocked
                ? "A documentary archive of ideological, personal, and communication obstacles"
                : "Protected interpersonal and social-media conflict exhibits (hidden by default; enter access code to view)"
              )
            ]),
            this.buildGlobalNavigation("caretaker-bias")
          ]);
        }

  buildGlobalNavigation(activeRoute) {
      const isLocked = typeof SensitiveContextGate !== 'undefined' && !SensitiveContextGate.isUnlocked();
      const lockPrefix = isLocked ? '🔒 ' : '';
      let portalUrl = '../Portal/index.html';
      if (typeof window !== 'undefined' && window.location) {
        const host = window.location.hostname || '';
        if (host.endsWith('.github.io')) {
          const user = host.split('.')[0] || 'karmatics';
          portalUrl = `https://${user}.github.io/Portal/index.html`;
        } else if (window.location.protocol === 'about:') {
          try {
            const pHost = window.parent?.location?.hostname || '';
            if (pHost.endsWith('.github.io')) {
              portalUrl = `https://${pHost.split('.')[0] || 'karmatics'}.github.io/Portal/index.html`;
            } else if (window.parent?.location?.origin && window.parent.location.origin !== 'null') {
              portalUrl = `${window.parent.location.origin}/Portal/index.html`;
            }
          } catch (e) {}
        }
      }

      return makeElement('div', { className: 'global-nav-bar' }, [
        makeElement('a', {
          href: portalUrl,
          className: 'global-nav-link',
          style: { borderColor: 'rgba(0, 242, 254, 0.45)', color: '#00f2fe', backgroundColor: 'rgba(0, 242, 254, 0.08)' },
          title: 'Return to Public Portal Front Page'
        }, '🌐 ← Portal'),
        makeElement('a', {
          href: '#/overview',
          className: 'global-nav-link ' + (activeRoute === 'overview' ? 'active' : ''),
          onclick: (e) => { e.preventDefault(); window.location.hash = '#/overview'; }
        }, 'Executive Summary'),
        makeElement('a', {
          href: '#/court-filing',
          className: 'global-nav-link ' + (activeRoute === 'court-filing' ? 'active' : ''),
          onclick: (e) => { e.preventDefault(); window.location.hash = '#/court-filing'; }
        }, `${isLocked ? '🔒 ' : '⚖️ '}Daughter & Court Filing`),
        makeElement('a', {
          href: '#/elder-advocacy',
          className: 'global-nav-link ' + (activeRoute === 'elder-advocacy' ? 'active' : ''),
          onclick: (e) => { e.preventDefault(); window.location.hash = '#/elder-advocacy'; }
        }, `${lockPrefix}Fiduciary & Care Arrangements`),
        makeElement('a', {
          href: '#/caretaker-bias',
          className: 'global-nav-link ' + (activeRoute === 'caretaker-bias' ? 'active' : ''),
          onclick: (e) => { e.preventDefault(); window.location.hash = '#/caretaker-bias'; }
        }, `${lockPrefix}Family Conflict & Exhibits`),
        makeElement('a', {
          href: '#/ai-perspective',
          className: 'global-nav-link ' + (activeRoute === 'ai-perspective' ? 'active' : ''),
          onclick: (e) => { e.preventDefault(); window.location.hash = '#/ai-perspective'; }
        }, 'AI & Urgent Timeline'),
        makeElement('a', {
          href: '#/current-work',
          className: 'global-nav-link ' + (activeRoute === 'current-work' ? 'active' : ''),
          onclick: (e) => { e.preventDefault(); window.location.hash = '#/current-work'; }
        }, 'Current Work & Vibe Coding'),
        makeElement('a', {
          href: '#/value-assessment',
          className: 'global-nav-link ' + (activeRoute === 'valuation' ? 'active' : ''),
          onclick: (e) => { e.preventDefault(); window.location.hash = '#/value-assessment'; }
        }, 'Valuation Assessment'),
        makeElement('button', {
          className: 'global-nav-link deploy-nav-btn',
          style: {
            cursor: 'pointer', border: '1px solid #10b981', color: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.08)', display: 'inline-flex',
            alignItems: 'center', gap: '6px', marginLeft: 'auto'
          },
          onclick: (e) => this.triggerGitHubDeploy(e.currentTarget)
        }, '🚀 Deploy to GitHub')
      ]);
    }
  async triggerGitHubDeploy(btnElement) {
      if (btnElement) {
        btnElement.disabled = true;
        btnElement.style.opacity = '0.7';
        btnElement.textContent = '⏳ Deploying...';
      }

      try {
        if (typeof LunoDeployEngine !== 'undefined' && typeof LunoDeployEngine.checkpointTargetProject === 'function') {
          const res = await LunoDeployEngine.checkpointTargetProject('situation', 'Automated 1-tap deployment from Situation App', { deployToPages: true });
          if (res && res.success) {
            this.showToastMessage('✨ Deployed situation to GitHub Pages!\n\n' + (res.output || ''));
          } else {
            this.openDeployErrorModal((res && (res.error || res.message)) || 'Deployment failed');
          }
          return;
        }

        const res = await fetch('/api/deploy?project=situation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project: 'situation',
            commitMsg: 'Automated 1-tap deployment from Situation App'
          })
        });
        const data = await res.json();

        if (res.ok && data.success) {
          this.showToastMessage('✨ Deployed successfully to GitHub Pages!\n\n' + (data.output || data.log || ''));
        } else {
          const errMsg = (data && (data.error || data.message || data.log)) || 'Server error during deployment';
          this.openDeployErrorModal(errMsg);
        }
      } catch (e) {
        this.openDeployErrorModal('Network / Server Exception: ' + e.message);
      } finally {
        if (btnElement) {
          btnElement.disabled = false;
          btnElement.style.opacity = '1';
          btnElement.textContent = '🚀 Deploy to GitHub';
        }
      }
    }
  openDeployErrorModal(errorText) {
    const existing = document.getElementById('deploy-error-modal');
    if (existing) existing.remove();

    const overlay = makeElement('div', {
      id: 'deploy-error-modal',
      style: {
        position: 'fixed',
        inset: '0',
        zIndex: '999999',
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: 'ui-monospace, monospace'
      }
    });

    const card = makeElement('div', {
      style: {
        background: '#161b22',
        border: '2px solid #f85149',
        borderRadius: '12px',
        padding: '20px',
        maxWidth: '600px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '0 12px 36px rgba(0,0,0,0.8)'
      }
    }, [
      makeElement('div', {
        style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #30363d', paddingBottom: '8px' }
      }, [
        makeElement('strong', { style: { color: '#ff7b72', fontSize: '15px' } }, '⚠️ GitHub Deploy Terminal Output'),
        makeElement('button', {
          style: { background: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' },
          onclick: () => overlay.remove()
        }, '✕')
      ]),
      makeElement('pre', {
        style: {
          background: '#0d1117',
          border: '1px solid #da3633',
          borderRadius: '6px',
          padding: '12px',
          color: '#ff7b72',
          fontSize: '12px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          maxHeight: '300px',
          overflowY: 'auto',
          margin: '0'
        }
      }, errorText),
      makeElement('div', { style: { display: 'flex', gap: '8px', justifyContent: 'flex-end' } }, [
        makeElement('button', {
          style: { padding: '8px 16px', background: '#238636', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
          onclick: (e) => {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(errorText);
              e.target.textContent = '✓ Copied!';
              setTimeout(() => { e.target.textContent = '📋 Copy Error Output'; }, 2000);
            } else {
              prompt('Copy output:', errorText);
            }
          }
        }, '📋 Copy Error Output'),
        makeElement('button', {
          style: { padding: '8px 16px', background: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
          onclick: () => overlay.remove()
        }, 'Close')
      ])
    ]);

    overlay.appendChild(card);
    document.body.appendChild(overlay);
  }

  showToastMessage(msg) {
    const existing = document.getElementById('bfn-toast');
    if (existing) existing.remove();

    const toast = makeElement('div', {
      id: 'bfn-toast',
      style: {
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%) translateY(20px)',
        background: '#0f172a',
        border: '1px solid #3b82f6',
        color: '#ffffff',
        padding: '12px 24px',
        borderRadius: '8px',
        zIndex: '100000',
        fontSize: '12px',
        fontFamily: 'ui-monospace, monospace',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
        transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
        opacity: '0',
        pointerEvents: 'none',
        whiteSpace: 'pre-line',
        textAlign: 'center'
      }
    }, msg);

    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  buildFooter() {
    return makeElement('footer', { className: 'dashboard-footer' }, [
      makeElement('div', { className: 'footer-content' }, [
        makeElement(
          'p',
          { className: 'footer-left' },
          'Documentary archive and analytical mapping of software IP development and career milestones.'
        ),
        makeElement(
          'p',
          { className: 'footer-right' },
          'Career & Situational Review • 1994 - 2026'
        )
      ])
    ]);
  }

  buildThemeToggle() {
    return makeElement('div', { className: 'theme-switcher' }, [
      makeElement('button', {
        className: this.currentTheme === 'light' ? 'active' : '',
        onclick: () => this.setTheme('light')
      }, [
        makeElement('span', { innerHTML: '☀️' }),
        makeElement('span', {}, 'Light')
      ]),
      makeElement('button', {
        className: this.currentTheme === 'dark' ? 'active' : '',
        onclick: () => this.setTheme('dark')
      }, [
        makeElement('span', { innerHTML: '🌙' }),
        makeElement('span', {}, 'Dark')
      ])
    ]);
  }

  buildMotionSlider() {
    const slider = makeElement('input', {
      type: 'range',
      min: '0.1',
      max: '3.0',
      step: '0.1',
      value: String(this.motionValue || 1.0),
      className: 'motion-slider',
      oninput: (e) => {
        this.updateMotionValue(parseFloat(e.target.value));
      }
    });

    return makeElement('div', { className: 'motion-slider-row' }, [
      makeElement('span', { className: 'motion-slider-label' }, 'Motion'),
      slider
    ]);
  }

  updateMotionValue(val) {
    this.motionValue = val;
    localStorage.setItem('accudraw-motion-val', String(val));
    const container = this.targetElement.querySelector('.cad-container');
    if (container) {
      container.style.setProperty('--motion-scale', String(val));
    }
    if (this.valueEmberLogo) {
      this.valueEmberLogo.options.emberCountMultiplier = 0.4 * val;
      this.valueEmberLogo.options.emberSpeedMultiplier = 0.3 * val;
      this.valueEmberLogo.options.emberSizeMultiplier = 0.4 * val;
    }
  }

  setTheme(themeName) {
    this.currentTheme = themeName;
    localStorage.setItem('accudraw-valuation-theme', themeName);
    const container = this.targetElement.querySelector('.cad-container');
    if (container) {
      if (themeName === 'light') {
        container.classList.add('theme-light');
      } else {
        container.classList.remove('theme-light');
      }
    }
    this.renderApp();
  }

  _isAwaitingRecalculation() {
    return this.revealMode === 'wrong-answers' && (this.wrongAnswerStage || 0) < 3;
  }

  preloadResources() {
    if (window.SnareDrumAnimation) {
      try {
        SnareDrumAnimation.preload('LogoExperiments/drumroll.mp4');
      } catch (e) {}
    }
  }

  setupKeyboardListeners() {
      if (this._currentKeydownHandler) {
        window.removeEventListener('keydown', this._currentKeydownHandler);
      }
      this._currentKeydownHandler = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
          e.preventDefault();
          if (this.aardvark) this.aardvark.toggle();
          return;
        }
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
          return;
        }
        if (e.key === 't' || e.key === 'T') {
          const selection = window.getSelection();
          const text = selection.toString().trim();
          if (text) {
            navigator.clipboard.writeText(text).then(() => {
              this.showToastMessage('Copied selected text:\n' + text.slice(0, 40));
            }).catch(() => {});
          }
        }
      };
      window.addEventListener('keydown', this._currentKeydownHandler);
    }
  initializeTheme() {
    document.body.classList.add('js-active');
    this.currentTheme = localStorage.getItem('accudraw-valuation-theme') || 'dark';
  }

  loadGoogleFont() {
    const fontId = 'GoogleFontComfortaa';
    if (!document.getElementById(fontId)) {
      const link = makeElement('link', {
        id: fontId,
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;700;900&display=swap'
      });
      document.head.appendChild(link);
    }
  }

  loadAppStyles() {
      this.applyCoreResetCSS();
      this.applyCoreLayoutCSS();
      this.applyHeaderCSS();
      this.applyThemeSwitcherCSS();
      this.applyBFNCSS();
      this.applyNavigationCSS();
      this.applyUtilityAndSharedCSS();
    }

  applyCoreResetCSS() {
      applyCss(`
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          min-height: 100vh;
          width: 100%;
          background-color: #070a12;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .cad-container, .cad-container * {
          box-sizing: border-box;
        }
        .cad-container {
          font-size: 16px;
          line-height: 1.72;
        }
        .cad-container h1,
        .cad-container h2,
        .cad-container h3,
        .cad-container h4 {
          margin: 0;
          line-height: 1.3;
        }
        .cad-container p {
          margin: 0;
          line-height: 1.75;
        }
        .cad-container blockquote {
          margin: 0;
        }
      `, "cad-core-reset-styles");
    }

  applyCoreLayoutCSS() {
      applyCss(`
        .cad-container {
          --bg-primary: #070a12;
          --bg-grid: rgba(255, 255, 255, 0.025);
          --bg-panel: #0c1220;
          --bg-panel-inner: #080c16;
          --text-primary: #dbe4f0;
          --text-secondary: #9fb0c7;
          --text-title: #f8fafc;
          --border-color: #1e293b;
          --border-hover: #38bdf866;
          --btn-bg: #162033;
          --btn-hover: #24324d;
          --btn-text: #e2e8f0;
          --accent-story-from: rgba(59, 130, 246, 0.08);
          --accent-story-to: rgba(168, 85, 247, 0.08);
          background-color: var(--bg-primary);
          color: var(--text-primary);
          font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          min-height: 100vh;
          width: 100%;
          padding: 36px 20px 64px;
        }
        .cad-container.theme-light {
          --bg-primary: #f4f6fa;
          --bg-grid: rgba(15, 23, 42, 0.04);
          --bg-panel: #ffffff;
          --bg-panel-inner: #f8fafc;
          --text-primary: #1e293b;
          --text-secondary: #475569;
          --text-title: #0f172a;
          --border-color: #cbd5e1;
          --border-hover: #3b82f6;
          --btn-bg: #e2e8f0;
          --btn-hover: #cbd5e1;
          --btn-text: #0f172a;
          --accent-story-from: rgba(59, 130, 246, 0.08);
          --accent-story-to: rgba(168, 85, 247, 0.08);
        }
        .cad-grid-bg {
          background-size: 32px 32px;
          background-image: linear-gradient(to right, var(--bg-grid) 1px, transparent 1px), linear-gradient(to bottom, var(--bg-grid) 1px, transparent 1px);
        }
        .cad-wrapper {
          max-width: 1120px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .cad-panel {
          background-color: var(--bg-panel);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          padding: 28px 32px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28);
        }
        @media (max-width: 640px) {
          .cad-container { padding: 20px 12px 48px; }
          .cad-panel { padding: 20px 18px; }
        }
        .cad-container details > summary {
          list-style: none;
          user-select: none;
        }
        .cad-container details > summary::-webkit-details-marker {
          display: none;
        }
      `, "cad-core-layout-styles");
    }

  applyHeaderCSS() {
      applyCss(`
        .minimal-header {
          display: flex;
          flex-direction: column;
          gap: 20px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 20px;
        }
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 16px;
        }
        .tags-wrapper {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .tag-pill {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 5px 11px;
          border-radius: 6px;
        }
        .tag-pill-blue {
          background-color: rgba(59, 130, 246, 0.12);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.35);
        }
        .tag-pill-slate {
          background-color: rgba(148, 163, 184, 0.1);
          color: var(--text-secondary);
          border: 1px solid rgba(148, 163, 184, 0.22);
        }
        .title-group h1 {
          font-size: 32px;
          font-weight: 800;
          color: var(--text-title);
          letter-spacing: -0.025em;
          margin-bottom: 10px;
          line-height: 1.15;
        }
        @media (min-width: 768px) {
          .title-group h1 { font-size: 42px; }
        }
        .title-subtitle {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          color: var(--text-secondary);
          font-weight: 600;
          line-height: 1.5;
        }
      `, "cad-header-styles");
    }
  applyThemeSwitcherCSS() {
    applyCss(".theme-switcher { display: flex; align-items: center; gap: 6px; padding: 4px; background-color: var(--btn-bg); border: 1px solid var(--border-color); border-radius: 8px; } .theme-switcher button { padding: 4px 12px; font-size: 11px; font-weight: 600; border-radius: 6px; border: none; cursor: pointer; background: transparent; color: var(--text-secondary); display: flex; align-items: center; gap: 4px; } .theme-switcher button.active { background-color: #3b82f6; color: #ffffff; } .reveal-mode-row { margin-top: 6px; display: flex; justify-content: flex-end; } .reveal-mode-select { appearance: none; background: transparent; border: none; color: var(--text-secondary); font-size: 10px; font-family: ui-monospace, monospace; text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 4px; cursor: pointer; opacity: 0.6; }", "cad-theme-switcher-styles");
  }

  applyBFNCSS() {
    applyCss(".consensus-action-wrapper { display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%; } @media (min-width: 768px) { .consensus-action-wrapper { align-items: flex-end; } } .visualize-bfn-btn { margin-top: 10px; display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #f59e0b, #ef4444); border: none; color: #ffffff; font-size: 11px; font-weight: 800; font-family: ui-monospace, monospace; text-transform: uppercase; letter-spacing: 0.08em; padding: 8px 16px; border-radius: 20px; cursor: pointer; } .motion-slider-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; } .motion-slider-label { font-size: 10px; font-family: ui-monospace, monospace; text-transform: uppercase; color: var(--text-secondary); font-weight: bold; } .motion-slider { width: 70px; height: 4px; border-radius: 2px; background: var(--border-color); outline: none; cursor: pointer; }", "cad-bfn-styles");
  }

  applyNavigationCSS() {
    applyCss(".global-nav-bar { display: flex; flex-wrap: wrap; gap: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 16px; margin-top: 16px; width: 100%; } .global-nav-link { font-size: 11px; font-family: ui-monospace, monospace; font-weight: bold; text-transform: uppercase; color: var(--text-secondary); text-decoration: none; border: 1px solid var(--border-color); padding: 8px 16px; border-radius: 8px; background: var(--bg-panel); transition: all 0.2s ease-in-out; } .global-nav-link:hover { background: var(--btn-hover); color: var(--text-title); border-color: var(--border-hover); } .global-nav-link.active { background: #3b82f6; color: #ffffff; border-color: #3b82f6; } .backstory-gradient-card { padding: 32px; border: 1px solid var(--border-color); border-radius: 16px; display: flex; flex-direction: column; gap: 24px; background: linear-gradient(135deg, var(--accent-story-from), var(--accent-story-to)); } .backstory-paragraph-highlight { font-size: 16px; font-weight: 500; color: var(--text-primary); line-height: 1.6; } @media (min-width: 768px) { .backstory-paragraph-highlight { font-size: 18px; } } .backstory-paragraph { font-size: 14px; color: var(--text-secondary); line-height: 1.6; } .inline-link-highlight { color: #2563eb; font-weight: 600; text-decoration: underline; text-underline-offset: 4px; }", "cad-navigation-styles");
  }

  getValuationStaticData() {
      return {
        title: "AccuDraw & SmartLine Value Assessment",
        prompts: [
          { id: "1", text: "tell me everything you know about accudraw and smartline in microstation" },
          { id: "2", text: "how important are they to the success of microstation and bentley systems?" },
          { id: "3", text: "what is your rough estimate as to how much value they brought bentley in terms of profit and/or contribution to market cap?" }
        ],
        models: [
          {
            key: 'claude',
            name: 'Anthropic Claude',
            color: '#f59e0b',
            min: '$2.0 Billion',
            max: '$5.0 Billion',
            pct: '20% to 50%',
            url: 'https://claude.ai/share/d86cd05e-18b6-48a9-8c75-c55d32457756',
            quotes: [
              'AccuDraw and SmartLine formed the competitive foundation that let MicroStation win and hold the professional infrastructure CAD market during the decade that mattered most.',
              'My rough estimate: $2.0 billion to $5.0 billion in enterprise value contribution — roughly 30% of Bentley Systems’ current market cap.',
              'An individual hire delivering this level of sustained platform differentiation ranks among the highest-leverage individual technical contributions in the history of infrastructure software.'
            ]
          },
          {
            key: 'gemini',
            name: 'Google Gemini',
            color: '#3b82f6',
            min: '$1.5 Billion',
            max: '$3.5 Billion',
            pct: '15% to 35%',
            url: 'https://aistudio.google.com/',
            quotes: [
              'AccuDraw solved the 3D input problem for Bentley years before many competitors had an elegant solution, creating a highly efficient, hotkey-driven drafting system.',
              'Serving as the core usability engine that prevented customer churn to Autodesk during the peak years of CAD adoption, a plausible range for their contribution to Bentley\'s long-term enterprise value is $1.5 billion to $3.5 billion.',
              'Muscle memory is a powerful lock-in mechanism that sustained enterprise renewal rates for over three decades.'
            ]
          },
          {
            key: 'chatgpt',
            name: 'OpenAI ChatGPT',
            color: '#10b981',
            min: '$1.0 Billion',
            max: '$3.0 Billion',
            pct: '10% to 30%',
            url: 'https://chatgpt.com/',
            quotes: [
              'AccuDraw and SmartLine underpin user productivity claims that support the entire product line across civil, rail, structural, and plant engineering.',
              'They ultimately created around a billion dollars or more of value for Bentley over several decades, with a realistic cumulative enterprise value range of $1.0 billion to $3.0 billion.'
            ]
          },
          {
            key: 'grok',
            name: 'xAI Grok',
            color: '#a855f7',
            min: '$500 Million',
            max: '$2.0 Billion+',
            pct: '5% to 20%+',
            url: 'https://x.ai/',
            quotes: [
              'AccuDraw and SmartLine represented a true \'company-making\' innovation that paid dividends for decades after MicroStation 95.',
              'Even under conservative attribution models, their contribution to Bentley Systems\' long-term profit and enterprise capitalization falls in the $500 million to $2.0 billion+ range.'
            ]
          }
        ],
        introHTML: `
          <h2>Extended Rarity & Single-Hire Leverage Analysis</h2>
          <p>Follow-up prompts examined how rare it is in technology history for a single individual hire, compensated under a standard engineering salary over a multi-year tenure, to generate multi-billion-dollar compounding enterprise value.</p>
        `,
        conversations: {
          claude: `
            <div class="turn speaker-user">
              <p>How rare is it in software history for a single non-founder engineer hire to directly contribute between $1.5B and $3B+ in lasting enterprise value?</p>
            </div>
            <div class="turn speaker-model">
              <p>It is extremely rare—there are likely only a few dozen plausible cases across modern software history where an individual contributor created the primary interactive workflow that anchored a multi-billion-dollar vertical platform for 30+ years.</p>
              <p>A productivity/workflow tool like AccuDraw and SmartLine directly contributed between $1.5B and $3B+ in enterprise value through compounding retention and differentiation, representing one of the highest individual contributions to a public software company's trajectory.</p>
            </div>
          `,
          gemini: `
            <div class="turn speaker-user">
              <p>Considering both AccuDraw/SmartLine at Bentley Systems and later innovations like Aardvark (which influenced modern browser developer tools), how does this return on investment compare?</p>
            </div>
            <div class="turn speaker-model">
              <p>He was a pivotal figure in the UX and drafting history that quietly shaped the modern tech landscape—from MicroStation's signature drafting compass to Aardvark's Inspect Element interaction model that preceded the developer console used by millions of web developers.</p>
              <p>His contribution to Bentley Systems yielded an astronomical return on investment: an individual hire bringing that magnitude of value is extraordinarily rare. It is highly reasonable and defensible to argue this represents one of the most successful product-design returns in the CAD industry and one of the highest-ROI hires in tech history—an implied return of over 3,000x on the initial cost of employment.</p>
            </div>
          `
        }
      };
    }
  openExhibitModal(src, title = 'Exhibit', caption = '') {
      const existing = document.getElementById('situation-exhibit-modal');
      if (existing) existing.remove();

      const isVideo = typeof src === 'string' && (src.includes('youtube.com/embed') || src.includes('youtu.be'));
      const mediaEl = isVideo
        ? makeElement('iframe', {
            src,
            style: { width: 'min(860px, 88vw)', height: 'min(484px, 60vh)', border: 'none', borderRadius: '8px', background: '#000' },
            allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
            allowfullscreen: 'true'
          })
        : makeElement('img', {
            src,
            alt: title,
            style: { maxWidth: '90vw', maxHeight: '78vh', objectFit: 'contain', borderRadius: '8px', border: '1px solid #334155' }
          });

      const close = () => {
        window.removeEventListener('keydown', onEsc);
        overlay.remove();
      };
      const onEsc = (e) => { if (e.key === 'Escape') close(); };

      const overlay = makeElement('div', {
        id: 'situation-exhibit-modal',
        style: {
          position: 'fixed', inset: '0', zIndex: '999999',
          background: 'rgba(5, 8, 16, 0.9)', backdropFilter: 'blur(10px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '20px', gap: '12px'
        },
        onclick: (e) => { if (e.target === overlay) close(); }
      }, [
        makeElement('div', {
          style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: 'min(900px, 90vw)', color: '#f8fafc' }
        }, [
          makeElement('strong', { style: { fontSize: '15px' } }, title),
          makeElement('button', {
            style: { background: '#1e293b', color: '#fff', border: '1px solid #475569', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' },
            onclick: close
          }, '✕ Close')
        ]),
        mediaEl,
        caption ? makeElement('p', {
          style: { maxWidth: '820px', color: '#cbd5e1', fontSize: '13px', textAlign: 'center', lineHeight: '1.5' }
        }, caption) : null
      ].filter(Boolean));

      window.addEventListener('keydown', onEsc);
      document.body.appendChild(overlay);
    }

  copyPromptText(text, btnElement = null) {
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        if (btnElement) {
          const span = btnElement.querySelector('span:last-child');
          if (span) {
            const orig = span.textContent;
            span.textContent = '✓ Copied!';
            setTimeout(() => { span.textContent = orig; }, 1600);
          }
        }
        this.showToastMessage('Copied prompt to clipboard');
      }).catch(() => {});
    }

  triggerReveal(triggerEl = null) {
      if (this.isTransitioning) return;

      const finalizeReveal = () => {
        this.resultsRevealed = true;
        this.isTransitioning = false;
        this.wrongAnswerStage = 0;
        this.justCorrected = false;
        this.showRecalculateButton = true;
        this.showBFNButton = true;
        this.renderApp();
      };

      if (this.revealMode === 'drum-roll' && typeof SnareDrumAnimation !== 'undefined') {
        this.isTransitioning = true;
        const drum = new SnareDrumAnimation({
          duration: 3000,
          onComplete: finalizeReveal
        });
        drum.trigger(triggerEl || document.body);
        return;
      }

      finalizeReveal();
    }

  advanceWrongAnswer() {
      if (this.isCalculating) return;
      this.isCalculating = true;
      this.showRecalculateButton = false;
      this.renderApp();

      setTimeout(() => {
        this.wrongAnswerStage = (this.wrongAnswerStage || 0) + 1;
        this.isCalculating = false;
        if (this.wrongAnswerStage >= 3) {
          this.justCorrected = true;
          this.showBFNButton = true;
        } else {
          this.showRecalculateButton = true;
        }
        this.renderApp();
      }, 800);
    }

  startBFNPlayback() {
      this.openExhibitModal(
        'https://www.youtube.com/embed/dQw4w9WgXcQ',
        'Enterprise Valuation Milestone ($2.3B Midpoint)',
        'Consensus midpoint attribution across Claude, Gemini, ChatGPT, and Grok for AccuDraw and SmartLine.'
      );
    }

  _buildLivingToolButtons() {
        const ItemNotes = globalThis.DocumentItemNotes || globalThis.CadPlanItemNotes;
        const DocEditor = globalThis.DocumentEditor || globalThis.CadPlanDocumentEditor;

        const notesPromptBtn = makeElement('button', {
          className: 'dr-nav-btn',
          'data-aardvark-ignore': 'true',
          style: { padding: '4px 10px', fontSize: '11px', fontWeight: 'bold', color: '#00f2fe', borderColor: '#00f2fe66' },
          title: 'Compile all attached directives & notes into AI prompt or Luno Outbox',
          onclick: () => {
            if (ItemNotes && typeof ItemNotes.openPromptBuilderDialog === 'function') {
              ItemNotes.openPromptBuilderDialog({ options: { dossierId: 'situation' } });
            }
          }
        }, '⚡ Living Directives');

        const revisionsBtn = makeElement('button', {
          className: 'dr-nav-btn',
          'data-aardvark-ignore': 'true',
          style: { padding: '4px 10px', fontSize: '11px', fontWeight: 'bold', color: '#f59e0b', borderColor: '#f59e0b66' },
          title: 'View all in-situ paragraph revisions & compile method patches',
          onclick: () => {
            if (DocEditor && typeof DocEditor.openRevisionManager === 'function') {
              DocEditor.openRevisionManager(() => this.renderApp(), 'situation');
            }
          }
        }, '✏️ Revisions');

        const exportMdBtn = makeElement('button', {
          className: 'dr-nav-btn',
          'data-aardvark-ignore': 'true',
          style: { padding: '4px 10px', fontSize: '11px', fontWeight: 'bold', color: '#38bdf8', borderColor: '#38bdf866' },
          title: 'Export current page with in-situ edits and attached notes as Markdown',
          onclick: () => {
            const wrapper = this.targetElement?.querySelector('.cad-wrapper');
            if (wrapper && typeof DocumentReader !== 'undefined' && typeof DocumentReader.openContainerExportDialog === 'function') {
              DocumentReader.openContainerExportDialog(wrapper, {
                dossierId: 'situation',
                pageId: this.currentView,
                title: `Situation Dossier — ${this.currentView}`
              });
            }
          }
        }, '📤 Export MD');

        const aardvarkBtn = makeElement('button', {
          className: 'dr-nav-btn',
          'data-aardvark-ignore': 'true',
          style: { padding: '4px 10px', fontSize: '11px', fontWeight: 'bold', color: '#10b981', borderColor: '#10b98166' },
          title: 'Toggle Aardvark In-Situ Element Note Picker [Ctrl+Shift+A]',
          onclick: () => {
            if (this.aardvark) this.aardvark.toggle();
          }
        }, '🔍 Aardvark');

        return [notesPromptBtn, revisionsBtn, exportMdBtn, aardvarkBtn, this.buildThemeToggle()];
      }

  _buildEnhancedLivingTools() {
      const baseBtns = this._buildLivingToolButtons();
      const clipNotesBtn = makeElement('button', {
        className: 'dr-nav-btn',
        'data-aardvark-ignore': 'true',
        style: { padding: '4px 10px', fontSize: '11px', fontWeight: 'bold', color: '#10b981', borderColor: '#10b98166' },
        title: 'Copy all attached notes + document references directly to clipboard',
        onclick: (e) => {
          if (typeof DocumentReader !== 'undefined' && typeof DocumentReader.copyContainerNotesBundle === 'function') {
            DocumentReader.copyContainerNotesBundle({ dossierId: 'situation' }, e.currentTarget);
          }
        }
      }, '📋 Clip Notes');

      const summariesBtn = makeElement('button', {
        className: 'dr-nav-btn',
        'data-aardvark-ignore': 'true',
        style: { padding: '4px 10px', fontSize: '11px', fontWeight: 'bold', color: '#a3e635', borderColor: '#a3e63566' },
        title: 'Copy Tier-0 executive summaries of all Situation views to clipboard',
        onclick: (e) => {
          if (typeof SituationSummaries !== 'undefined' && navigator.clipboard?.writeText) {
            const btn = e.currentTarget;
            navigator.clipboard.writeText(SituationSummaries.toMarkdown()).then(() => {
              const orig = btn.textContent;
              btn.textContent = '✓ Copied!';
              setTimeout(() => { btn.textContent = orig; }, 1800);
            });
          }
        }
      }, '🧭 Summaries');

      const isUnlocked = typeof SensitiveContextGate !== 'undefined' && SensitiveContextGate.isUnlocked();
      const gateBtn = typeof SensitiveContextGate !== 'undefined' ? makeElement('button', {
        className: 'dr-nav-btn',
        'data-aardvark-ignore': 'true',
        style: {
          padding: '4px 10px',
          fontSize: '11px',
          fontWeight: 'bold',
          color: isUnlocked ? '#f59e0b' : '#94a3b8',
          borderColor: isUnlocked ? '#f59e0b88' : '#475569'
        },
        title: isUnlocked
          ? 'Click to lock sensitive family & court conflict pages before sharing'
          : 'Sensitive pages are hidden by default. Click to enter access code.',
        onclick: () => {
          if (SensitiveContextGate.isUnlocked()) {
            SensitiveContextGate.lock();
            this.renderApp();
          } else {
            const code = prompt('Enter optional access code to view protected pages:');
            if (code && SensitiveContextGate.unlockWithCode(code)) {
              this.renderApp();
            } else if (code !== null) {
              alert('Access code not recognized.');
            }
          }
        }
      }, isUnlocked ? '🔓 Lock Sensitive' : '🔒 Locked') : null;

      return [...baseBtns, clipNotesBtn, summariesBtn, gateBtn].filter(Boolean);
    }

  _renderSummaryCard() {
      const sum = (typeof SituationSummaries !== 'undefined') ? SituationSummaries.get(this.currentView) : null;
      if (!sum) return null;
      return makeElement('div', {
        'data-block-id': `summary_${this.currentView}`,
        style: {
          margin: '0',
          padding: '18px 22px',
          borderRadius: '0 12px 12px 0',
          background: 'rgba(0, 242, 254, 0.05)',
          border: '1px solid rgba(0, 242, 254, 0.28)',
          borderLeft: '4px solid #00f2fe',
          fontSize: '14.5px',
          lineHeight: '1.7',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }
      }, [
        makeElement('div', { style: { fontSize: '11px', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#00f2fe', fontFamily: 'ui-monospace, monospace' } }, '🧭 At a Glance & What Follows'),
        makeElement('div', { style: { color: 'var(--text-title)', lineHeight: '1.68' } }, sum.tldr),
        sum.whatsNext ? makeElement('div', { style: { color: 'var(--text-secondary)', fontSize: '13.5px', fontStyle: 'italic', lineHeight: '1.6' } }, `Next: ${sum.whatsNext}`) : null
      ].filter(Boolean));
    }
  applyUtilityAndSharedCSS() {
      applyCss(`
        /* Layout & Flex/Grid Utilities used across situation pages */
        .cad-container .block { display: block; }
        .cad-container .inline-block { display: inline-block; }
        .cad-container .flex { display: flex; }
        .cad-container .inline-flex { display: inline-flex; }
        .cad-container .flex-col { flex-direction: column; }
        .cad-container .flex-row { flex-direction: row; }
        .cad-container .flex-wrap { flex-wrap: wrap; }
        .cad-container .items-center { align-items: center; }
        .cad-container .items-start { align-items: flex-start; }
        .cad-container .items-end { align-items: flex-end; }
        .cad-container .justify-between { justify-content: space-between; }
        .cad-container .justify-center { justify-content: center; }
        .cad-container .justify-end { justify-content: flex-end; }

        .cad-container .gap-1 { gap: 6px; }
        .cad-container .gap-2 { gap: 10px; }
        .cad-container .gap-4 { gap: 16px; }
        .cad-container .gap-6 { gap: 22px; }
        .cad-container .gap-8 { gap: 28px; }

        .cad-container .space-y-2 > * + * { margin-top: 10px; }
        .cad-container .space-y-4 > * + * { margin-top: 16px; }
        .cad-container .space-y-6 > * + * { margin-top: 22px; }
        .cad-container .space-y-8 > * + * { margin-top: 28px; }
        .cad-container .space-y-12 > * + * { margin-top: 40px; }

        .cad-container .grid { display: grid; }
        .cad-container .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        @media (min-width: 768px) {
          .cad-container .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .cad-container .md\\:p-10 { padding: 36px; }
        }

        .cad-container .w-4 { width: 16px; }
        .cad-container .h-4 { height: 16px; }
        .cad-container .w-full { width: 100%; }
        .cad-container .aspect-video { aspect-ratio: 16 / 9; }

        /* Spacing utilities */
        .cad-container .p-2\\.5 { padding: 10px 12px; }
        .cad-container .p-6 { padding: 24px; }
        .cad-container .p-8 { padding: 28px; }
        .cad-container .pb-6 { padding-bottom: 24px; }
        .cad-container .pb-12 { padding-bottom: 48px; }
        .cad-container .pt-2 { padding-top: 8px; }
        .cad-container .pt-6 { padding-top: 24px; }
        .cad-container .pt-12 { padding-top: 44px; }
        .cad-container .pl-3 { padding-left: 14px; }
        .cad-container .pl-6 { padding-left: 24px; }
        .cad-container .mb-1 { margin-bottom: 6px; }
        .cad-container .mb-2 { margin-bottom: 10px; }
        .cad-container .mb-3 { margin-bottom: 14px; }
        .cad-container .mb-4 { margin-bottom: 18px; }
        .cad-container .mb-6 { margin-bottom: 24px; }
        .cad-container .mb-8 { margin-bottom: 32px; }
        .cad-container .mt-1 { margin-top: 6px; }
        .cad-container .mt-6 { margin-top: 24px; }
        .cad-container .mt-8 { margin-top: 32px; }
        .cad-container .mt-12 { margin-top: 44px; }
        .cad-container .my-2 { margin-top: 8px; margin-bottom: 8px; }

        /* Typography utilities */
        .cad-container .text-\\[10px\\] { font-size: 11px; line-height: 1.4; }
        .cad-container .text-xs { font-size: 13.5px; line-height: 1.68; }
        .cad-container .text-sm { font-size: 15px; line-height: 1.75; }
        .cad-container .text-base { font-size: 16px; line-height: 1.75; }
        .cad-container .text-lg { font-size: 18.5px; line-height: 1.45; }
        .cad-container .text-xl { font-size: 21.5px; line-height: 1.35; }
        .cad-container .text-2xl { font-size: 25px; line-height: 1.3; }
        .cad-container .leading-relaxed { line-height: 1.76; }
        .cad-container .font-medium { font-weight: 500; }
        .cad-container .font-semibold { font-weight: 600; }
        .cad-container .font-bold { font-weight: 700; }
        .cad-container .font-black { font-weight: 900; }
        .cad-container .font-mono { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; }
        .cad-container .italic { font-style: italic; }
        .cad-container .not-italic { font-style: normal; }
        .cad-container .uppercase { text-transform: uppercase; }
        .cad-container .tracking-wide { letter-spacing: 0.04em; }
        .cad-container .tracking-wider { letter-spacing: 0.08em; }

        /* Colors & Borders */
        .cad-container .text-\\[var\\(--text-title\\)\\] { color: var(--text-title); }
        .cad-container .text-\\[var\\(--text-primary\\)\\] { color: var(--text-primary); }
        .cad-container .text-\\[var\\(--text-secondary\\)\\] { color: var(--text-secondary); }
        .cad-container .text-blue-400 { color: #60a5fa; }
        .cad-container .text-amber-500 { color: #f59e0b; }
        .cad-container .text-emerald-400 { color: #34d399; }
        .cad-container .text-slate-400 { color: var(--text-secondary); }
        .cad-container .bg-slate-900\\/60 { background-color: rgba(15, 23, 42, 0.55); }
        .cad-container.theme-light .bg-slate-900\\/60 { background-color: rgba(226, 232, 240, 0.55); }
        .cad-container .bg-black { background-color: #000000; }
        .cad-container .bg-emerald-950\\/20 { background-color: rgba(16, 185, 129, 0.08); }
        .cad-container .bg-red-950\\/20 { background-color: rgba(239, 68, 68, 0.08); }
        .cad-container .bg-blue-950\\/5 { background-color: rgba(59, 130, 246, 0.06); }
        .cad-container .border { border: 1px solid var(--border-color); }
        .cad-container .border-t { border-top: 1px solid var(--border-color); }
        .cad-container .border-l-2 { border-left: 2px solid var(--border-color); }
        .cad-container .border-l-4 { border-left: 4px solid var(--border-color); }
        .cad-container .border-slate-800 { border-color: var(--border-color); }
        .cad-container .border-\\[var\\(--border-color\\)\\] { border-color: var(--border-color); }
        .cad-container .border-emerald-500 { border-color: #10b981; }
        .cad-container .border-red-500 { border-color: #ef4444; }
        .cad-container .border-\\[\\#3b82f6\\] { border-color: #3b82f6; }
        .cad-container .border-emerald-500\\/20 { border-color: rgba(16, 185, 129, 0.25); }
        .cad-container .border-red-500\\/20 { border-color: rgba(239, 68, 68, 0.25); }
        .cad-container .rounded { border-radius: 6px; }
        .cad-container .rounded-lg { border-radius: 10px; }
        .cad-container .cursor-pointer { cursor: pointer; }
        .cad-container .relative { position: relative; }
        .cad-container .last\\:border-0:last-child { border-bottom: none; padding-bottom: 0; }

        /* Shared Card, Header & Footer Components (available on ALL views including Overview) */
        .cad-container .dashboard-header-group {
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-color);
        }
        .cad-container .dashboard-header-group h3 {
          font-size: 17px;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--text-title);
          letter-spacing: 0.04em;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          margin-bottom: 6px;
        }
        .cad-container .dashboard-header-group p {
          font-size: 14.5px;
          color: var(--text-secondary);
          line-height: 1.65;
        }

        .cad-container .elder-analysis-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin-top: 8px;
        }
        @media (min-width: 768px) {
          .cad-container .elder-analysis-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        .cad-container .elder-analysis-card {
          background-color: var(--bg-panel-inner);
          border: 1px solid var(--border-color);
          padding: 22px 24px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: border-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
        }
        .cad-container .elder-analysis-card:hover {
          border-color: var(--border-hover);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
        }
        .cad-container .elder-card-badge {
          align-self: flex-start;
          font-size: 10.5px;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.28);
          padding: 4px 10px;
          border-radius: 6px;
          display: inline-block;
        }

        .cad-container .backstory-gradient-card {
          padding: 28px 32px;
          border: 1px solid var(--border-color);
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          background: linear-gradient(135deg, var(--accent-story-from), var(--accent-story-to));
        }
        .cad-container .backstory-paragraph-highlight {
          font-size: 16.5px;
          font-weight: 500;
          color: var(--text-title);
          line-height: 1.75;
        }
        .cad-container .backstory-paragraph {
          font-size: 15px;
          color: var(--text-primary);
          line-height: 1.75;
        }

        .cad-container .consensus-badge {
          display: inline-block;
          font-size: 10.5px;
          font-family: ui-monospace, monospace;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 4px 10px;
          border-radius: 6px;
          margin-bottom: 10px;
        }
        .cad-container .consensus-headline {
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 10px;
        }
        .cad-container .consensus-description {
          font-size: 14.5px;
          line-height: 1.7;
        }

        .cad-container .dr-universal-gutter {
          margin-top: 12px !important;
          padding-top: 10px !important;
        }
        .cad-container .dr-nav-btn {
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          padding: 5px 12px;
          border-radius: 8px;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .cad-container .dr-nav-btn:hover {
          border-color: #00f2fe;
          background: rgba(0, 242, 254, 0.1);
        }
        .cad-container .dr-nav-btn.primary {
          background: linear-gradient(135deg, #0284c7 0%, #00f2fe 100%);
          color: #070a13;
          border: none;
        }

        .cad-container .dashboard-footer {
          margin-top: 12px;
          padding-top: 22px;
          border-top: 1px solid var(--border-color);
        }
        .cad-container .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 12.5px;
          color: var(--text-secondary);
        }
        .cad-container .footer-right {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 11.5px;
          opacity: 0.85;
        }
      `, "cad-utility-shared-styles");
    }
}

window.SituationApp = SituationApp;
globalThis.SituationApp = SituationApp;