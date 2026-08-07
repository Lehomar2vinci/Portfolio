(function () {
  "use strict";

  const { cases, mixTexts, palettes, tourSteps, uiText } = window.PortfolioData;
  const { copyToClipboard, preference } = window.PortfolioUtils;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [
    ...root.querySelectorAll(selector),
  ];

  const html = document.documentElement;
  const languageButton = $("#lang-toggle");
  const paletteButton = $("#palette-toggle");
  const contrastButton = $("#contrast-toggle");
  const motionButton = $("#motion-toggle");
  const menuButton = $(".menu-button");
  const mobileNav = $(".mobile-nav");
  const toast = $(".toast");

  let toastTimer;
  let currentLang = preference.get("portfolio-language", "fr");
  let activeCaseKey = null;
  const languageHooks = [];

  function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 2200);
  }

  function refreshPreferenceLabels() {
    const contrastOn = contrastButton?.getAttribute("aria-pressed") === "true";
    const motionOn = motionButton?.getAttribute("aria-pressed") === "true";

    paletteButton?.setAttribute(
      "aria-label",
      `${uiText[currentLang].palette}: ${paletteButton.textContent}`,
    );

    contrastButton?.setAttribute(
      "aria-label",
      currentLang === "en"
        ? `${contrastOn ? "Disable" : "Enable"} enhanced contrast`
        : `${contrastOn ? "Désactiver" : "Activer"} le contraste renforcé`,
    );

    motionButton?.setAttribute(
      "aria-label",
      currentLang === "en"
        ? `${motionOn ? "Restore" : "Reduce"} motion`
        : `${motionOn ? "Rétablir" : "Réduire"} les animations`,
    );
  }

  const translatable = $$("[data-en]");
  translatable.forEach((element) => {
    element.dataset.fr = element.innerHTML;
  });

  const labelled = $$("[data-label-en]");
  labelled.forEach((element) => {
    element.dataset.labelFr = element.getAttribute("aria-label") || "";
  });

  const placeholders = $$("[data-placeholder-en]");
  placeholders.forEach((element) => {
    element.dataset.placeholderFr = element.getAttribute("placeholder") || "";
  });

  function applyLanguage(language) {
    currentLang = language === "en" ? "en" : "fr";
    html.lang = currentLang;

    translatable.forEach((element) => {
      element.innerHTML =
        currentLang === "en" ? element.dataset.en : element.dataset.fr;
    });

    labelled.forEach((element) => {
      element.setAttribute(
        "aria-label",
        currentLang === "en"
          ? element.dataset.labelEn
          : element.dataset.labelFr,
      );
    });

    placeholders.forEach((element) => {
      element.setAttribute(
        "placeholder",
        currentLang === "en"
          ? element.dataset.placeholderEn
          : element.dataset.placeholderFr,
      );
    });

    if (languageButton) {
      languageButton.textContent = currentLang === "en" ? "FR" : "EN";
      languageButton.setAttribute(
        "aria-label",
        currentLang === "en"
          ? "Afficher le site en français"
          : "Display the site in English",
      );
    }

    document.title =
      currentLang === "en"
        ? "Nathan Chambrette — Code, sound & interactions"
        : "Nathan Chambrette — Code, son & interactions";

    const description = $('meta[name="description"]');
    if (description) {
      description.content =
        currentLang === "en"
          ? "Nathan Chambrette creates interactive experiences at the crossroads of code and sound."
          : "Nathan Chambrette conçoit des expériences interactives à la croisée du code et du son.";
    }

    const playControl = $("#play");
    if (playControl?.getAttribute("aria-pressed") === "true") {
      playControl.innerHTML = `<span aria-hidden="true">■</span> ${uiText[currentLang].stop}`;
    }

    refreshPreferenceLabels();
    preference.set("portfolio-language", currentLang);

    if (activeCaseKey) renderCase(activeCaseKey);
    languageHooks.forEach((hook) => hook(currentLang));
  }

  function applyToggle(button, className, key, enabled) {
    if (!button) return;

    html.classList.toggle(className, enabled);
    button.setAttribute("aria-pressed", String(enabled));
    preference.set(key, String(enabled));
    refreshPreferenceLabels();
  }

  function applyPalette(key) {
    const palette = palettes.find((item) => item.key === key) || palettes[0];

    palettes.forEach((item) => {
      if (item.className) html.classList.remove(item.className);
    });

    if (palette.className) html.classList.add(palette.className);
    if (paletteButton) paletteButton.textContent = palette.label;

    preference.set("portfolio-palette", palette.key);
    refreshPreferenceLabels();
  }

  languageButton?.addEventListener("click", () => {
    applyLanguage(currentLang === "fr" ? "en" : "fr");
  });

  paletteButton?.addEventListener("click", () => {
    const activeKey =
      palettes.find((item) => item.label === paletteButton.textContent)?.key ||
      palettes[0].key;
    const activeIndex = palettes.findIndex((item) => item.key === activeKey);
    const next = palettes[(activeIndex + 1) % palettes.length];
    applyPalette(next.key);
  });

  contrastButton?.addEventListener("click", () => {
    const enabled = contrastButton.getAttribute("aria-pressed") !== "true";
    applyToggle(contrastButton, "high-contrast", "portfolio-contrast", enabled);
  });

  motionButton?.addEventListener("click", () => {
    const enabled = motionButton.getAttribute("aria-pressed") !== "true";
    applyToggle(motionButton, "reduce-motion", "portfolio-motion", enabled);
    if (enabled) stop();
  });

  applyPalette(preference.get("portfolio-palette", "signal"));
  applyToggle(
    contrastButton,
    "high-contrast",
    "portfolio-contrast",
    preference.get("portfolio-contrast", "false") === "true",
  );
  applyToggle(
    motionButton,
    "reduce-motion",
    "portfolio-motion",
    preference.get("portfolio-motion", "false") === "true",
  );
  applyLanguage(currentLang);

  menuButton?.addEventListener("click", () => {
    const open = mobileNav?.classList.toggle("open") || false;
    menuButton.setAttribute("aria-expanded", String(open));
  });

  $$(".mobile-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav?.classList.remove("open");
      menuButton?.setAttribute("aria-expanded", "false");
    });
  });

  // Ticker infini : construit deux groupes identiques et suffisamment longs
  // pour qu’aucun espace vide ne puisse apparaître pendant le défilement.
  const ticker = $(".ticker");
  const tickerTrack = $(".ticker-track");
  const tickerGroup = $(".ticker-group");

  if (ticker && tickerTrack && tickerGroup) {
    const seedNodes = [...tickerGroup.children].map((node) =>
      node.cloneNode(true),
    );
    let resizeFrame;

    function appendTickerSeed(target) {
      seedNodes.forEach((node) => target.append(node.cloneNode(true)));
    }

    function buildTicker() {
      tickerTrack
        .querySelectorAll(".ticker-group[aria-hidden='true']")
        .forEach((group) => group.remove());
      tickerGroup.replaceChildren();
      appendTickerSeed(tickerGroup);

      // On dépasse volontairement la largeur visible pour garantir une couverture
      // continue même pendant les redimensionnements et sur les grands écrans.
      const minimumWidth = Math.max(ticker.clientWidth * 1.25, 900);
      while (tickerGroup.scrollWidth < minimumWidth)
        appendTickerSeed(tickerGroup);

      const clone = tickerGroup.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      tickerTrack.append(clone);

      // Vitesse constante (~72 px/s), indépendamment de la largeur générée.
      const duration = Math.max(12, tickerGroup.scrollWidth / 72);
      ticker.style.setProperty("--ticker-duration", `${duration.toFixed(2)}s`);
    }

    buildTicker();

    window.addEventListener(
      "resize",
      () => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(buildTicker);
      },
      { passive: true },
    );
  }

  const progress = $(".reading-progress span");

  function updateProgress() {
    if (!progress) return;

    const available = html.scrollHeight - window.innerHeight;
    const ratio = available > 0 ? window.scrollY / available : 0;
    progress.style.width = `${ratio * 100}%`;
  }

  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  const navLinks = $$(".desktop-nav a");
  const navTargets = navLinks
    .map((link) => $(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          navLinks.forEach((link) => {
            const active = link.getAttribute("href") === `#${entry.target.id}`;
            link.classList.toggle("active", active);

            if (active) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-35% 0px -60%" },
    );

    navTargets.forEach((target) => navObserver.observe(target));
  }

  const commandDialog = $("#command-dialog");
  const commandTrigger = $("#command-trigger");
  const commandInput = $("#command-input");
  const commandClose = $(".command-close");
  const commandItems = $$(".command-list > [role='option']");

  let commandReturnFocus = null;
  let commandIndex = 0;

  function visibleCommands() {
    return commandItems.filter((item) => !item.hidden);
  }

  function selectCommand(index) {
    const visible = visibleCommands();
    if (!visible.length || !commandInput) return;

    commandIndex = (index + visible.length) % visible.length;

    commandItems.forEach((item) => {
      item.classList.remove("selected");
      item.setAttribute("aria-selected", "false");
    });

    const selected = visible[commandIndex];
    selected.classList.add("selected");
    selected.setAttribute("aria-selected", "true");
    commandInput.setAttribute("aria-activedescendant", selected.id || "");
    selected.scrollIntoView({ block: "nearest" });
  }

  function filterCommands() {
    if (!commandInput) return;

    const query = commandInput.value.trim().toLocaleLowerCase(currentLang);

    commandItems.forEach((item) => {
      item.hidden =
        Boolean(query) &&
        !item.textContent.toLocaleLowerCase(currentLang).includes(query);
    });

    selectCommand(0);
  }

  function openCommands(trigger = document.activeElement) {
    if (!commandDialog || !commandInput) return;

    commandReturnFocus = trigger;
    commandInput.value = "";
    commandItems.forEach((item) => {
      item.hidden = false;
    });

    commandDialog.showModal();
    commandInput.setAttribute("aria-expanded", "true");
    selectCommand(0);
    requestAnimationFrame(() => commandInput.focus());
  }

  commandTrigger?.addEventListener("click", () => openCommands(commandTrigger));
  commandClose?.addEventListener("click", () => commandDialog?.close());
  commandInput?.addEventListener("input", filterCommands);
  commandInput?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      selectCommand(commandIndex + 1);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      selectCommand(commandIndex - 1);
    }

    if (event.key === "Enter") {
      event.preventDefault();
      visibleCommands()[commandIndex]?.click();
    }
  });

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();

      if (commandDialog?.open) commandDialog.close();
      else openCommands();
    }
  });

  commandItems.forEach((item) => {
    item.addEventListener("click", () => {
      const target = item.dataset.target;
      commandDialog?.close();

      if (item.dataset.command === "tour") {
        openTour();
        return;
      }

      if (target) {
        $(target)?.scrollIntoView({
          behavior: html.classList.contains("reduce-motion")
            ? "auto"
            : "smooth",
        });
      }
    });
  });

  commandDialog?.addEventListener("click", (event) => {
    if (event.target === commandDialog) commandDialog.close();
  });

  commandDialog?.addEventListener("close", () => {
    commandInput?.setAttribute("aria-expanded", "false");
    commandInput?.removeAttribute("aria-activedescendant");
    commandReturnFocus?.focus?.();
  });

  const reveals = $$(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.12 },
    );

    reveals.forEach((element) => observer.observe(element));
  } else {
    reveals.forEach((element) => element.classList.add("visible"));
  }

  const instrument = $(".instrument");
  const pads = $$(".pad");
  const screenLabel = $("#screen-label");
  const playButton = $("#play");
  const clearButton = $("#clear");
  const tempo = $("#tempo");
  const waveform = $("#waveform");
  const bpmLabel = $("#bpm-label");

  let audioContext;
  let sequence = [];
  let timer;
  let step = 0;

  function context() {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === "suspended") audioContext.resume();
    return audioContext;
  }

  function tone(pad, record = true) {
    if (!pad) return;

    const ctx = context();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = waveform?.value || "triangle";
    oscillator.frequency.value = Number(pad.dataset.note);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.24);

    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.26);

    pad.classList.add("active");
    setTimeout(() => pad.classList.remove("active"), 150);

    if (screenLabel) {
      const note = pad.querySelector("span")?.textContent || "";
      screenLabel.textContent = `${pad.dataset.key} · ${note}`;
    }

    if (record && !timer) {
      sequence.push(pad);
      if (sequence.length > 16) sequence.shift();

      if (screenLabel) {
        screenLabel.textContent += ` · ${sequence.length} ${uiText[currentLang].steps}`;
      }
    }
  }

  function stop() {
    clearInterval(timer);
    timer = undefined;
    step = 0;

    playButton?.setAttribute("aria-pressed", "false");
    if (playButton) {
      playButton.innerHTML = `<span aria-hidden="true">▶</span> ${uiText[currentLang].play}`;
    }

    instrument?.classList.remove("playing");
  }

  function play() {
    if (timer) {
      stop();
      return;
    }

    if (!sequence.length) {
      sequence = pads.filter((_, index) => [0, 2, 4, 7].includes(index));
    }

    const beat = () => {
      tone(sequence[step % sequence.length], false);
      step += 1;
    };

    beat();
    timer = setInterval(beat, 60000 / Number(tempo?.value || 96) / 2);

    playButton?.setAttribute("aria-pressed", "true");
    if (playButton) {
      playButton.innerHTML = `<span aria-hidden="true">■</span> ${uiText[currentLang].stop}`;
    }

    instrument?.classList.add("playing");
  }

  pads.forEach((pad) => {
    pad.addEventListener("click", () => tone(pad));
  });

  document.addEventListener("keydown", (event) => {
    const active = document.activeElement;
    const isTyping = active?.matches?.(
      "input, textarea, select, [contenteditable='true']",
    );
    const dialogOpen =
      commandDialog?.open || $("#tour-dialog")?.open || $("#case-dialog")?.open;

    if (event.repeat || isTyping || dialogOpen) return;

    const pad = pads.find(
      (item) => item.dataset.key === event.key.toUpperCase(),
    );
    if (!pad) return;

    event.preventDefault();
    tone(pad);
  });

  playButton?.addEventListener("click", play);

  clearButton?.addEventListener("click", () => {
    stop();
    sequence = [];
    if (screenLabel) screenLabel.textContent = uiText[currentLang].cleared;
  });

  tempo?.addEventListener("input", () => {
    if (bpmLabel) bpmLabel.textContent = `${tempo.value} BPM`;

    if (timer) {
      stop();
      play();
    }
  });

  const filterButtons = $$("[data-filter]");
  const projectCards = $$("[data-project-tags]");
  const projectCount = $("#project-count");

  function filterProjects(filter = "all") {
    let visible = 0;

    projectCards.forEach((project) => {
      const tags = project.dataset.projectTags.split(" ");
      const show = filter === "all" || tags.includes(filter);

      project.classList.toggle("filtered-out", !show);
      if (show) visible += 1;
    });

    filterButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.filter === filter);
    });

    if (projectCount) {
      projectCount.textContent =
        visible === 1
          ? uiText[currentLang].projectShown
          : `${visible} ${uiText[currentLang].projectsShown}`;
    }
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () =>
      filterProjects(button.dataset.filter),
    );
  });

  languageHooks.push(() => {
    const activeFilter =
      filterButtons.find((button) => button.classList.contains("active"))
        ?.dataset.filter || "all";
    filterProjects(activeFilter);
  });

  filterProjects("all");

  const skillRanges = $$(".skill-range");
  const mixBars = $$(".mix-bars i");
  const skillValueLabels = Object.fromEntries(
    $$("[data-skill-value]").map((item) => [item.dataset.skillValue, item]),
  );
  const mixHeadline = $("#mix-headline");
  const mixDescription = $("#mix-description");
  const mixDominant = $("#mix-dominant");
  const mixAverage = $("#mix-average");
  const mixReset = $("#mix-reset");
  const mixDefaults = { code: 86, audio: 78, ux: 74, live: 68 };

  function storedMix() {
    try {
      return {
        ...mixDefaults,
        ...JSON.parse(preference.get("portfolio-skill-mix", "{}")),
      };
    } catch {
      return { ...mixDefaults };
    }
  }

  function setMix(values) {
    skillRanges.forEach((range, index) => {
      const value = Number(values[range.dataset.skill] ?? range.value);

      range.value = value;
      range.setAttribute("aria-valuetext", `${value}%`);

      const valueLabel = skillValueLabels[range.dataset.skill];
      if (valueLabel) valueLabel.textContent = `${value}%`;
      if (mixBars[index]) mixBars[index].style.setProperty("--h", `${value}%`);
    });
  }

  function updateSkillMix(save = true) {
    const values = Object.fromEntries(
      skillRanges.map((range) => [range.dataset.skill, Number(range.value)]),
    );
    const entries = Object.entries(values).sort((a, b) => b[1] - a[1]);
    const spread = entries[0][1] - entries[entries.length - 1][1];
    const dominant = spread < 16 ? "balanced" : entries[0][0];
    const average = Math.round(
      Object.values(values).reduce((total, value) => total + value, 0) /
        Object.values(values).length,
    );
    const [headline, description] = mixTexts[currentLang][dominant];

    if (mixHeadline) mixHeadline.textContent = headline;
    if (mixDescription) mixDescription.textContent = description;
    if (mixDominant) {
      mixDominant.textContent =
        dominant === "balanced" ? headline : entries[0][0].toUpperCase();
    }
    if (mixAverage) mixAverage.textContent = `${average}%`;

    setMix(values);

    if (save) {
      preference.set("portfolio-skill-mix", JSON.stringify(values));
    }
  }

  setMix(storedMix());

  skillRanges.forEach((range) => {
    range.addEventListener("input", () => updateSkillMix());
  });

  mixReset?.addEventListener("click", () => {
    setMix(mixDefaults);
    updateSkillMix();
  });

  languageHooks.push(() => updateSkillMix(false));
  updateSkillMix(false);

  const briefChoices = $$(".choice");
  const briefResult = $("#brief-result");
  const briefMeter = $("#brief-meter");
  const briefScore = $("#brief-score");
  const briefCopy = $("#brief-copy");

  let currentBrief = "";

  function activeBriefChoice(group) {
    return $(`[data-brief-group="${group}"] .choice.active`);
  }

  function briefPhrase(choice) {
    return currentLang === "en"
      ? choice.dataset.briefEn
      : choice.dataset.briefFr;
  }

  function updateBrief() {
    const goal = activeBriefChoice("goal");
    const format = activeBriefChoice("format");
    const constraint = activeBriefChoice("constraint");

    if (!goal || !format || !constraint) return;

    const score = Math.min(
      99,
      Number(goal.dataset.score) +
        Number(format.dataset.score) +
        Number(constraint.dataset.score),
    );

    currentBrief =
      currentLang === "en"
        ? `I can help you ${briefPhrase(goal)} ${briefPhrase(format)}, ${briefPhrase(constraint)}.`
        : `Je peux vous aider à ${briefPhrase(goal)} ${briefPhrase(format)}, ${briefPhrase(constraint)}.`;

    if (briefResult) briefResult.textContent = currentBrief;
    if (briefScore) briefScore.textContent = `${score}%`;
    if (briefMeter) briefMeter.style.width = `${score}%`;
  }

  briefChoices.forEach((choice) => {
    choice.addEventListener("click", () => {
      const group = choice.closest("[data-brief-group]");
      group
        ?.querySelectorAll(".choice")
        .forEach((item) => item.classList.remove("active"));

      choice.classList.add("active");
      updateBrief();
    });
  });

  languageHooks.push(updateBrief);
  updateBrief();

  briefCopy?.addEventListener("click", async () => {
    try {
      await copyToClipboard(currentBrief);
      showToast(uiText[currentLang].briefCopied);
    } catch {
      window.location.href = `mailto:n.chambrette@gmail.com?subject=Brief%20portfolio&body=${encodeURIComponent(currentBrief)}`;
    }
  });

  const tourDialog = $("#tour-dialog");
  const tourTrigger = $("#tour-trigger");
  const mobileTourTrigger = $("#mobile-tour-trigger");
  const tourStep = $("#tour-step");
  const tourTitle = $("#tour-title");
  const tourText = $("#tour-text");
  const tourPrev = $("#tour-prev");
  const tourNext = $("#tour-next");
  const tourClose = $("#tour-close");

  let tourIndex = 0;

  function renderTour() {
    const stepData = tourSteps[tourIndex];
    if (!stepData) return;

    const data = stepData[currentLang];

    if (tourStep) {
      tourStep.textContent = `${String(tourIndex + 1).padStart(2, "0")} / ${String(tourSteps.length).padStart(2, "0")}`;
    }
    if (tourTitle) tourTitle.textContent = data[0];
    if (tourText) tourText.textContent = data[1];
    if (tourPrev) tourPrev.disabled = tourIndex === 0;
    if (tourNext) {
      tourNext.textContent =
        tourIndex === tourSteps.length - 1
          ? currentLang === "en"
            ? "Finish"
            : "Terminer"
          : currentLang === "en"
            ? "Next"
            : "Suivant";
    }

    $(stepData.target)?.scrollIntoView({
      behavior: html.classList.contains("reduce-motion") ? "auto" : "smooth",
      block: "start",
    });
  }

  function openTour() {
    if (!tourDialog) return;

    tourIndex = 0;
    renderTour();
    tourDialog.showModal();
  }

  tourTrigger?.addEventListener("click", openTour);

  mobileTourTrigger?.addEventListener("click", () => {
    mobileNav?.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
    openTour();
  });

  tourPrev?.addEventListener("click", () => {
    if (tourIndex > 0) {
      tourIndex -= 1;
      renderTour();
    }
  });

  tourNext?.addEventListener("click", () => {
    if (tourIndex >= tourSteps.length - 1) {
      tourDialog?.close();
      return;
    }

    tourIndex += 1;
    renderTour();
  });

  tourClose?.addEventListener("click", () => tourDialog?.close());

  tourDialog?.addEventListener("click", (event) => {
    if (event.target === tourDialog) tourDialog.close();
  });

  languageHooks.push(() => {
    if (tourDialog?.open) renderTour();
  });

  if (window.matchMedia("(pointer: fine)").matches) {
    $$("[data-tilt]").forEach((element) => {
      element.addEventListener("pointermove", (event) => {
        if (html.classList.contains("reduce-motion")) return;

        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        element.style.setProperty("--tilt-x", `${(x - 0.5) * 5}deg`);
        element.style.setProperty("--tilt-y", `${(0.5 - y) * 5}deg`);
        element.style.setProperty("--glow-x", `${x * 100}%`);
        element.style.setProperty("--glow-y", `${y * 100}%`);
      });

      element.addEventListener("pointerleave", () => {
        element.style.setProperty("--tilt-x", "0deg");
        element.style.setProperty("--tilt-y", "0deg");
        element.style.setProperty("--glow-x", "50%");
        element.style.setProperty("--glow-y", "50%");
      });
    });
  }

  const dialog = $("#case-dialog");
  const caseFields = {
    kicker: $("#case-kicker"),
    title: $("#case-title"),
    lead: $("#case-lead"),
    gesture: $("#case-gesture"),
    system: $("#case-system"),
    explore: $("#case-explore"),
  };
  const caseLink = $("#case-link");

  let caseTrigger;

  function renderCase(key) {
    const entry = cases[key];
    if (!entry) return;

    const data = entry[currentLang];

    Object.entries(caseFields).forEach(([field, element]) => {
      if (element) element.textContent = data[field];
    });

    if (caseLink) caseLink.href = entry.link;
  }

  $$("[data-case]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!cases[button.dataset.case]) return;

      caseTrigger = button;
      activeCaseKey = button.dataset.case;
      renderCase(activeCaseKey);
      dialog?.showModal();
    });
  });

  $(".case-close")?.addEventListener("click", () => dialog?.close());

  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog?.addEventListener("close", () => {
    activeCaseKey = null;
    caseTrigger?.focus?.();
  });

  const copyButton = $(".copy-email");

  copyButton?.addEventListener("click", async () => {
    const value = copyButton.dataset.copy;

    try {
      await copyToClipboard(value);
      showToast(uiText[currentLang].copied);
    } catch {
      window.location.href = `mailto:${value}`;
    }
  });
})();
