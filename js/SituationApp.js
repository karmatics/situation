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
        this.targetElement.innerHTML = "";

        const themeClass = this.currentTheme === "light"
          ? "cad-container cad-grid-bg theme-light"
          : "cad-container cad-grid-bg";

        const appContainer = makeElement("div", { className: themeClass });
        appContainer.style.setProperty("--motion-scale", String(this.motionValue));

        const innerWrapper = makeElement("div", {
          className: "cad-wrapper",
          'data-dossier': 'situation',
          'data-page-id': this.currentView
        });

        if (this.currentView === "elder-advocacy") {
          innerWrapper.appendChild(this.buildElderHeader());
        } else if (this.currentView === "caretaker-bias") {
          innerWrapper.appendChild(this.buildCaretakerHeader());
        } else {
          innerWrapper.appendChild(this.buildMinimalHeader());
        }

        if (this.currentView === "court-filing" && typeof CourtFilingPage !== 'undefined') {
          const page = new CourtFilingPage();
          innerWrapper.appendChild(page.render(this));
        } else if (this.currentView === "overview") {
          const page = new OverviewPage();
          innerWrapper.appendChild(page.render(this));
        } else if (this.currentView === "ai-perspective") {
          const page = new AiPerspectivePage();
          innerWrapper.appendChild(page.render(this));
        } else if (this.currentView === "elder-advocacy") {
          const page = new ElderAdvocacyPage();
          innerWrapper.appendChild(page.render(this));
        } else if (this.currentView === "caretaker-bias") {
          const page = new CaretakerBiasPage();
          innerWrapper.appendChild(page.render(this));
        } else if (this.currentView === "current-work") {
          const page = new CurrentWorkPage();
          innerWrapper.appendChild(page.render(this));
        } else {
          const page = new ValuationPage();
          innerWrapper.appendChild(page.render(this));
        }

        innerWrapper.appendChild(this.buildFooter());
        appContainer.appendChild(innerWrapper);
        this.targetElement.appendChild(appContainer);

        if (typeof DocumentReader !== 'undefined' && typeof DocumentReader.decorateContainer === 'function') {
          setTimeout(() => {
            DocumentReader.decorateContainer(innerWrapper, {
              dossierId: 'situation',
              pageId: this.currentView
            });

            if (this._pendingScrollBlockId) {
              const targetId = this._pendingScrollBlockId;
              this._pendingScrollBlockId = null;
              const targetEl = innerWrapper.querySelector(`[data-block-id="${targetId}"], [data-block="${targetId}"]`) ||
                               document.getElementById(targetId);
              if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetEl.style.transition = 'box-shadow 0.3s ease';
                targetEl.style.boxShadow = '0 0 0 2px #00f2fe, 0 0 24px rgba(0, 242, 254, 0.45)';
                setTimeout(() => { targetEl.style.boxShadow = ''; }, 2400);
              }
            }
          }, 0);
        }

        if (this.currentView === "valuation" && this.resultsRevealed && !this._isAwaitingRecalculation()) {
          const emberValText = this.targetElement.querySelector(".glowing-consensus-value");
          if (emberValText) {
            if (this.valueEmberLogo) {
              this.valueEmberLogo.destroy();
            }
            this.valueEmberLogo = new ValueEmberLogo(emberValText, {
              isAwake: true,
              emberCountMultiplier: 0.4 * this.motionValue,
              emberSpeedMultiplier: 0.3 * this.motionValue,
              emberSizeMultiplier: 0.4 * this.motionValue
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

        const controlsGroup = makeElement('div', {
          className: 'flex flex-col items-end gap-1'
        }, [
          makeElement('div', { style: { display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' } }, this._buildLivingToolButtons()),
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
        return makeElement("header", { className: "minimal-header" }, [
          makeElement("div", { className: "header-top" }, [
            makeElement("span", { className: "tag-pill tag-pill-blue" }, "Elder Advocacy Review"),
            makeElement("div", { style: { display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" } }, this._buildLivingToolButtons())
          ]),
          makeElement("div", { className: "title-group" }, [
            makeElement("h1", {}, "Care Arrangements & Family Communication Review"),
            makeElement("p", { className: "title-subtitle" }, "A factual analysis of Power of Attorney limits and visitation guidelines")
          ]),
          this.buildGlobalNavigation("elder-advocacy")
        ]);
      }

  buildCaretakerHeader() {
        return makeElement("header", { className: "minimal-header" }, [
          makeElement("div", { className: "header-top" }, [
            makeElement("span", { className: "tag-pill tag-pill-blue" }, "Caretaker Bias Review"),
            makeElement("div", { style: { display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" } }, this._buildLivingToolButtons())
          ]),
          makeElement("div", { className: "title-group" }, [
            makeElement("h1", {}, "Caretaker Bias & LinkedIn Exhibits Review"),
            makeElement("p", { className: "title-subtitle" }, "A documentary archive of ideological, personal, and communication obstacles")
          ]),
          this.buildGlobalNavigation("caretaker-bias")
        ]);
      }
  buildGlobalNavigation(activeRoute) {
      return makeElement('div', { className: 'global-nav-bar' }, [
        makeElement('a', {
          href: '#/overview',
          className: 'global-nav-link ' + (activeRoute === 'overview' ? 'active' : ''),
          onclick: (e) => { e.preventDefault(); window.location.hash = '#/overview'; }
        }, 'Executive Summary'),
        makeElement('a', {
          href: '#/court-filing',
          className: 'global-nav-link ' + (activeRoute === 'court-filing' ? 'active' : ''),
          onclick: (e) => { e.preventDefault(); window.location.hash = '#/court-filing'; }
        }, '⚖️ Daughter & Court Filing'),
        makeElement('a', {
          href: '#/elder-advocacy',
          className: 'global-nav-link ' + (activeRoute === 'elder-advocacy' ? 'active' : ''),
          onclick: (e) => { e.preventDefault(); window.location.hash = '#/elder-advocacy'; }
        }, 'Fiduciary & Care Arrangements'),
        makeElement('a', {
          href: '#/caretaker-bias',
          className: 'global-nav-link ' + (activeRoute === 'caretaker-bias' ? 'active' : ''),
          onclick: (e) => { e.preventDefault(); window.location.hash = '#/caretaker-bias'; }
        }, 'Caretaker Bias & Exhibits'),
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
  }

  applyCoreResetCSS() {
    applyCss("html, body { margin: 0 !important; padding: 0 !important; min-height: 100vh; width: 100%; background-color: #070a12; } .cad-container, .cad-container * { box-sizing: border-box; margin: 0; padding: 0; }", "cad-core-reset-styles");
  }

  applyCoreLayoutCSS() {
      applyCss(`
        .cad-container {
          --bg-primary: #070a12;
          --bg-grid: rgba(255, 255, 255, 0.02);
          --bg-panel: #0c111d;
          --bg-panel-inner: #05070a;
          --text-primary: #cbd5e1;
          --text-secondary: #94a3b8;
          --text-title: #ffffff;
          --border-color: #1e293b;
          --border-hover: #334155;
          --btn-bg: #1e293b;
          --btn-hover: #334155;
          --btn-text: #e2e8f0;
          --accent-story-from: rgba(59, 130, 246, 0.06);
          --accent-story-to: rgba(168, 85, 247, 0.06);
          background-color: var(--bg-primary);
          color: var(--text-primary);
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          min-height: 100vh;
          width: 100%;
          padding: 48px 16px;
        }
        .cad-container.theme-light {
          --bg-primary: #f8fafc;
          --bg-grid: rgba(15, 23, 42, 0.04);
          --bg-panel: #ffffff;
          --bg-panel-inner: #f1f5f9;
          --text-primary: #1e293b;
          --text-secondary: #475569;
          --text-title: #0f172a;
          --border-color: #cbd5e1;
          --border-hover: #94a3b8;
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
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 48px;
        }
        .cad-panel {
          background-color: var(--bg-panel);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 32px;
        }
      `, "cad-core-layout-styles");
    }
  applyHeaderCSS() {
    applyCss(".minimal-header { display: flex; flex-direction: column; gap: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 24px; } .header-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; } .tags-wrapper { display: flex; gap: 8px; } .tag-pill { font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; padding: 4px 10px; border-radius: 4px; } .tag-pill-blue { background-color: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); } .tag-pill-slate { background-color: rgba(148, 163, 184, 0.1); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.2); } .title-group h1 { font-size: 32px; font-weight: 800; color: var(--text-title); letter-spacing: -0.02em; margin-bottom: 8px; line-height: 1.1; } @media (min-width: 768px) { .title-group h1 { font-size: 44px; } } .title-subtitle { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; font-family: ui-monospace, monospace; color: var(--text-secondary); font-weight: 600; }", "cad-header-styles");
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
}

window.SituationApp = SituationApp;
globalThis.SituationApp = SituationApp;