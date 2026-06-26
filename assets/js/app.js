(function () {
  "use strict";

  const { cases, mixTexts, palettes, tourSteps, uiText } = window.PortfolioData;
  const { copyToClipboard, preference } = window.PortfolioUtils;

  const menuButton = document.querySelector(".menu-button");
  const mobileNav = document.querySelector(".mobile-nav");
  menuButton?.addEventListener("click", () => {
    const open = mobileNav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
  mobileNav?.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    }),
  );

  const translatable = [...document.querySelectorAll("[data-en]")];
  translatable.forEach((element) => {
    element.dataset.fr = element.innerHTML;
  });
  const labelled = [...document.querySelectorAll("[data-label-en]")];
  labelled.forEach((element) => {
    element.dataset.labelFr = element.getAttribute("aria-label");
  });
  const placeholders = [...document.querySelectorAll("[data-placeholder-en]")];
  placeholders.forEach((element) => {
    element.dataset.placeholderFr = element.getAttribute("placeholder");
  });
  const languageButton = document.querySelector("#lang-toggle");
  const paletteButton = document.querySelector("#palette-toggle");
  const contrastButton = document.querySelector("#contrast-toggle");
  const motionButton = document.querySelector("#motion-toggle");
  let currentLang = preference.get("portfolio-language", "fr");
  let activeCaseKey = null;
  const languageHooks = [];
  function applyLanguage(language) {
    currentLang = language === "en" ? "en" : "fr";
    document.documentElement.lang = currentLang;
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
    languageButton.textContent = currentLang === "en" ? "FR" : "EN";
    languageButton.setAttribute(
      "aria-label",
      currentLang === "en"
        ? "Afficher le site en français"
        : "Display the site in English",
    );
    document.title =
      currentLang === "en"
        ? "Nathan Chambrette — Code, sound & interactions"
        : "Nathan Chambrette — Code, son & interactions";
    document.querySelector('meta[name="description"]').content =
      currentLang === "en"
        ? "Nathan Chambrette creates interactive experiences at the crossroads of code and sound."
        : "Nathan Chambrette conçoit des expériences interactives à la croisée du code et du son.";
    const playControl = document.querySelector("#play");
    if (playControl?.getAttribute("aria-pressed") === "true") {
      playControl.innerHTML = `<span aria-hidden="true">■</span> ${uiText[currentLang].stop}`;
    }
    refreshPreferenceLabels();
    preference.set("portfolio-language", currentLang);
    if (activeCaseKey) renderCase(activeCaseKey);
    languageHooks.forEach((hook) => hook(currentLang));
  }

  function applyToggle(button, className, key, enabled) {
    document.documentElement.classList.toggle(className, enabled);
    button.setAttribute("aria-pressed", String(enabled));
    preference.set(key, String(enabled));
    refreshPreferenceLabels();
  }

  function applyPalette(key) {
    const palette = palettes.find((item) => item.key === key) || palettes[0];
    palettes.forEach((item) => {
      if (item.className)
        document.documentElement.classList.remove(item.className);
    });
    if (palette.className)
      document.documentElement.classList.add(palette.className);
    if (paletteButton) paletteButton.textContent = palette.label;
    preference.set("portfolio-palette", palette.key);
    refreshPreferenceLabels();
  }

  function refreshPreferenceLabels() {
    const contrastOn = contrastButton?.getAttribute("aria-pressed") === "true";
    const motionOn = motionButton?.getAttribute("aria-pressed") === "true";
    if (paletteButton)
      paletteButton.setAttribute(
        "aria-label",
        `${uiText[currentLang].palette}: ${paletteButton.textContent}`,
      );
    if (contrastButton)
      contrastButton.setAttribute(
        "aria-label",
        currentLang === "en"
          ? `${contrastOn ? "Disable" : "Enable"} enhanced contrast`
          : `${contrastOn ? "Désactiver" : "Activer"} le contraste renforcé`,
      );
    if (motionButton)
      motionButton.setAttribute(
        "aria-label",
        currentLang === "en"
          ? `${motionOn ? "Restore" : "Reduce"} motion`
          : `${motionOn ? "Rétablir" : "Réduire"} les animations`,
      );
  }

  languageButton?.addEventListener("click", () =>
    applyLanguage(currentLang === "fr" ? "en" : "fr"),
  );
  paletteButton?.addEventListener("click", () => {
    const activeKey =
      palettes.find((item) => item.label === paletteButton.textContent)?.key ||
      palettes[0].key;
    const next =
      palettes[
        (palettes.findIndex((item) => item.key === activeKey) + 1) %
          palettes.length
      ];
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

  const progress = document.querySelector(".reading-progress span");
  function updateProgress() {
    const available =
      document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${available > 0 ? (window.scrollY / available) * 100 : 0}%`;
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  const navLinks = [...document.querySelectorAll(".desktop-nav a")];
  const navTargets = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            const active = link.getAttribute("href") === `#${entry.target.id}`;
            link.classList.toggle("active", active);
            if (active) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        }),
      { rootMargin: "-35% 0px -60%" },
    );
    navTargets.forEach((target) => navObserver.observe(target));
  }

  const commandDialog = document.querySelector("#command-dialog");
  const commandTrigger = document.querySelector("#command-trigger");
  const commandInput = document.querySelector("#command-input");
  const commandClose = document.querySelector(".command-close");
  const commandItems = [
    ...document.querySelectorAll(".command-list > [role='option']"),
  ];
  let commandReturnFocus = null;
  let commandIndex = 0;

  function visibleCommands() {
    return commandItems.filter((item) => !item.hidden);
  }

  function selectCommand(index) {
    const visible = visibleCommands();
    if (!visible.length) return;
    commandIndex = (index + visible.length) % visible.length;
    commandItems.forEach((item) => {
      item.classList.remove("selected");
      item.setAttribute("aria-selected", "false");
    });
    visible[commandIndex].classList.add("selected");
    visible[commandIndex].setAttribute("aria-selected", "true");
    commandInput.setAttribute(
      "aria-activedescendant",
      visible[commandIndex].id,
    );
    visible[commandIndex].scrollIntoView({ block: "nearest" });
  }

  function filterCommands() {
    const query = commandInput.value.trim().toLocaleLowerCase(currentLang);
    commandItems.forEach((item) => {
      item.hidden =
        Boolean(query) &&
        !item.textContent.toLocaleLowerCase(currentLang).includes(query);
    });
    commandIndex = 0;
    selectCommand(0);
  }

  function openCommands(trigger = document.activeElement) {
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
  commandClose?.addEventListener("click", () => commandDialog.close());
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
      if (commandDialog.open) commandDialog.close();
      else openCommands();
    }
  });
  commandItems.forEach((item) =>
    item.addEventListener("click", () => {
      const target = item.dataset.target;
      commandDialog.close();
      if (item.dataset.command === "tour") {
        openTour();
        return;
      }
      if (target)
        document
          .querySelector(target)
          ?.scrollIntoView({
            behavior: document.documentElement.classList.contains(
              "reduce-motion",
            )
              ? "auto"
              : "smooth",
          });
    }),
  );
  commandDialog?.addEventListener("click", (event) => {
    if (event.target === commandDialog) commandDialog.close();
  });
  commandDialog?.addEventListener("close", () => {
    commandInput.setAttribute("aria-expanded", "false");
    commandInput.removeAttribute("aria-activedescendant");
    commandReturnFocus?.focus();
  });

  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        }),
      { threshold: 0.12 },
    );
    reveals.forEach((element) => observer.observe(element));
  } else {
    reveals.forEach((element) => element.classList.add("visible"));
  }

  const instrument = document.querySelector(".instrument");
  const pads = [...document.querySelectorAll(".pad")];
  const screenLabel = document.querySelector("#screen-label");
  const playButton = document.querySelector("#play");
  const clearButton = document.querySelector("#clear");
  const tempo = document.querySelector("#tempo");
  const waveform = document.querySelector("#waveform");
  const bpmLabel = document.querySelector("#bpm-label");
  let audioContext;
  let sequence = [];
  let timer;
  let step = 0;

  function context() {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    return audioContext;
  }

  function tone(pad, record = true) {
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
    screenLabel.textContent = `${pad.dataset.key} · ${pad.querySelector("span").textContent}`;
    if (record && !timer) {
      sequence.push(pad);
      if (sequence.length > 16) sequence.shift();
      screenLabel.textContent += ` · ${sequence.length} ${uiText[currentLang].steps}`;
    }
  }

  function stop() {
    clearInterval(timer);
    timer = undefined;
    step = 0;
    playButton.setAttribute("aria-pressed", "false");
    playButton.innerHTML = `<span aria-hidden="true">▶</span> ${uiText[currentLang].play}`;
    instrument.classList.remove("playing");
  }

  function play() {
    if (timer) return stop();
    if (!sequence.length)
      sequence = pads.filter((_, index) => [0, 2, 4, 7].includes(index));
    const beat = () => {
      tone(sequence[step % sequence.length], false);
      step += 1;
    };
    beat();
    timer = setInterval(beat, 60000 / Number(tempo.value) / 2);
    playButton.setAttribute("aria-pressed", "true");
    playButton.innerHTML = `<span aria-hidden="true">■</span> ${uiText[currentLang].stop}`;
    instrument.classList.add("playing");
  }

  pads.forEach((pad) => pad.addEventListener("click", () => tone(pad)));
  document.addEventListener("keydown", (event) => {
    if (event.repeat || /INPUT|BUTTON|A/.test(document.activeElement.tagName))
      return;
    const pad = pads.find(
      (item) => item.dataset.key === event.key.toUpperCase(),
    );
    if (pad) tone(pad);
  });
  playButton?.addEventListener("click", play);
  clearButton?.addEventListener("click", () => {
    stop();
    sequence = [];
    screenLabel.textContent = uiText[currentLang].cleared;
  });
  tempo?.addEventListener("input", () => {
    bpmLabel.textContent = `${tempo.value} BPM`;
    if (timer) {
      stop();
      play();
    }
  });

  const filterButtons = [...document.querySelectorAll("[data-filter]")];
  const projectCards = [...document.querySelectorAll("[data-project-tags]")];
  const projectCount = document.querySelector("#project-count");

  function filterProjects(filter = "all") {
    let visible = 0;
    projectCards.forEach((project) => {
      const show =
        filter === "all" ||
        project.dataset.projectTags.split(" ").includes(filter);
      project.classList.toggle("filtered-out", !show);
      if (show) visible += 1;
    });
    filterButtons.forEach((button) =>
      button.classList.toggle("active", button.dataset.filter === filter),
    );
    if (projectCount) {
      projectCount.textContent =
        visible === 1
          ? uiText[currentLang].projectShown
          : `${visible} ${uiText[currentLang].projectsShown}`;
    }
  }

  filterButtons.forEach((button) =>
    button.addEventListener("click", () =>
      filterProjects(button.dataset.filter),
    ),
  );
  languageHooks.push(() => {
    const activeFilter =
      filterButtons.find((button) => button.classList.contains("active"))
        ?.dataset.filter || "all";
    filterProjects(activeFilter);
  });
  filterProjects("all");

  const skillRanges = [...document.querySelectorAll(".skill-range")];
  const mixBars = [...document.querySelectorAll(".mix-bars i")];
  const skillValueLabels = Object.fromEntries(
    [...document.querySelectorAll("[data-skill-value]")].map((item) => [
      item.dataset.skillValue,
      item,
    ]),
  );
  const mixHeadline = document.querySelector("#mix-headline");
  const mixDescription = document.querySelector("#mix-description");
  const mixDominant = document.querySelector("#mix-dominant");
  const mixAverage = document.querySelector("#mix-average");
  const mixReset = document.querySelector("#mix-reset");
  const mixDefaults = { code: 86, audio: 78, ux: 74, live: 68 };
  function storedMix() {
    try {
      const value = JSON.parse(preference.get("portfolio-skill-mix", "{}"));
      return { ...mixDefaults, ...value };
    } catch {
      return { ...mixDefaults };
    }
  }

  function setMix(values) {
    skillRanges.forEach((range, index) => {
      const value = Number(values[range.dataset.skill] ?? range.value);
      range.value = value;
      range.setAttribute("aria-valuetext", `${value}%`);
      if (skillValueLabels[range.dataset.skill])
        skillValueLabels[range.dataset.skill].textContent = `${value}%`;
      if (mixBars[index]) mixBars[index].style.setProperty("--h", `${value}%`);
    });
  }

  function updateSkillMix(save = true) {
    const values = Object.fromEntries(
      skillRanges.map((range) => [range.dataset.skill, Number(range.value)]),
    );
    const entries = Object.entries(values).sort((a, b) => b[1] - a[1]);
    const dominant =
      entries[0][1] - entries[entries.length - 1][1] < 16
        ? "balanced"
        : entries[0][0];
    const average = Math.round(
      Object.values(values).reduce((total, value) => total + value, 0) /
        Object.values(values).length,
    );
    const [headline, description] = mixTexts[currentLang][dominant];
    mixHeadline.textContent = headline;
    mixDescription.textContent = description;
    mixDominant.textContent =
      dominant === "balanced" ? headline : entries[0][0].toUpperCase();
    mixAverage.textContent = `${average}%`;
    setMix(values);
    if (save) preference.set("portfolio-skill-mix", JSON.stringify(values));
  }

  setMix(storedMix());
  skillRanges.forEach((range) =>
    range.addEventListener("input", () => updateSkillMix()),
  );
  mixReset?.addEventListener("click", () => {
    setMix(mixDefaults);
    updateSkillMix();
  });
  languageHooks.push(() => updateSkillMix(false));
  updateSkillMix(false);

  const briefChoices = [...document.querySelectorAll(".choice")];
  const briefResult = document.querySelector("#brief-result");
  const briefMeter = document.querySelector("#brief-meter");
  const briefScore = document.querySelector("#brief-score");
  const briefCopy = document.querySelector("#brief-copy");
  let currentBrief = "";

  function activeBriefChoice(group) {
    return document.querySelector(
      `[data-brief-group="${group}"] .choice.active`,
    );
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
    briefResult.textContent = currentBrief;
    briefScore.textContent = `${score}%`;
    briefMeter.style.width = `${score}%`;
  }

  briefChoices.forEach((choice) =>
    choice.addEventListener("click", () => {
      const group = choice.closest("[data-brief-group]");
      group
        .querySelectorAll(".choice")
        .forEach((item) => item.classList.remove("active"));
      choice.classList.add("active");
      updateBrief();
    }),
  );
  languageHooks.push(updateBrief);
  updateBrief();

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 2200);
  }

  briefCopy?.addEventListener("click", async () => {
    try {
      await copyToClipboard(currentBrief);
      showToast(uiText[currentLang].briefCopied);
    } catch {
      window.location.href = `mailto:n.chambrette@gmail.com?subject=Brief%20portfolio&body=${encodeURIComponent(currentBrief)}`;
    }
  });

  const tourDialog = document.querySelector("#tour-dialog");
  const tourTrigger = document.querySelector("#tour-trigger");
  const mobileTourTrigger = document.querySelector("#mobile-tour-trigger");
  const tourStep = document.querySelector("#tour-step");
  const tourTitle = document.querySelector("#tour-title");
  const tourText = document.querySelector("#tour-text");
  const tourPrev = document.querySelector("#tour-prev");
  const tourNext = document.querySelector("#tour-next");
  const tourClose = document.querySelector("#tour-close");
  let tourIndex = 0;
  function renderTour() {
    const step = tourSteps[tourIndex];
    const data = step[currentLang];
    tourStep.textContent = `${String(tourIndex + 1).padStart(2, "0")} / ${String(tourSteps.length).padStart(2, "0")}`;
    tourTitle.textContent = data[0];
    tourText.textContent = data[1];
    tourPrev.disabled = tourIndex === 0;
    tourNext.textContent =
      tourIndex === tourSteps.length - 1
        ? currentLang === "en"
          ? "Finish"
          : "Terminer"
        : currentLang === "en"
          ? "Next"
          : "Suivant";
    document
      .querySelector(step.target)
      ?.scrollIntoView({
        behavior: document.documentElement.classList.contains("reduce-motion")
          ? "auto"
          : "smooth",
        block: "start",
      });
  }

  function openTour() {
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
    if (tourIndex >= tourSteps.length - 1) tourDialog.close();
    else {
      tourIndex += 1;
      renderTour();
    }
  });
  tourClose?.addEventListener("click", () => tourDialog.close());
  tourDialog?.addEventListener("click", (event) => {
    if (event.target === tourDialog) tourDialog.close();
  });
  languageHooks.push(() => {
    if (tourDialog?.open) renderTour();
  });

  if (window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll("[data-tilt]").forEach((element) => {
      element.addEventListener("pointermove", (event) => {
        if (document.documentElement.classList.contains("reduce-motion"))
          return;
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

  const dialog = document.querySelector("#case-dialog");
  const caseFields = {
    kicker: document.querySelector("#case-kicker"),
    title: document.querySelector("#case-title"),
    lead: document.querySelector("#case-lead"),
    gesture: document.querySelector("#case-gesture"),
    system: document.querySelector("#case-system"),
    explore: document.querySelector("#case-explore"),
  };
  const caseLink = document.querySelector("#case-link");
  let caseTrigger;

  function renderCase(key) {
    const entry = cases[key];
    if (!entry) return;
    const data = entry[currentLang];
    Object.entries(caseFields).forEach(([field, element]) => {
      element.textContent = data[field];
    });
    caseLink.href = entry.link;
  }

  document.querySelectorAll("[data-case]").forEach((button) =>
    button.addEventListener("click", () => {
      if (!cases[button.dataset.case]) return;
      caseTrigger = button;
      activeCaseKey = button.dataset.case;
      renderCase(activeCaseKey);
      dialog.showModal();
    }),
  );
  document
    .querySelector(".case-close")
    ?.addEventListener("click", () => dialog.close());
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog?.addEventListener("close", () => {
    activeCaseKey = null;
    caseTrigger?.focus();
  });

  const copyButton = document.querySelector(".copy-email");
  const toast = document.querySelector(".toast");
  let toastTimer;
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
