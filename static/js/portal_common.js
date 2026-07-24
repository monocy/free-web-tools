const { ref, reactive, watch, onMounted } = Vue;

export function usePortalCommon(translations, defaultCustomSettings = {}) {
  const showSettings = ref(false);
  const isBgModalOpen = ref(false);
  const isFullscreen = ref(false);

  const updateFullscreenState = () => {
    isFullscreen.value = !!document.fullscreenElement;
  };

  const settings = reactive({
    lang: 'en',
    theme: 'dark',
    fontSize: 16,
    bgUrl: '',
    bgOpacity: 0.3,
    bgBlur: 10,
    custom: { ...defaultCustomSettings }
  });

  const loadSettings = () => {
    const stored = localStorage.getItem('tool-settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const customMerged = { ...defaultCustomSettings, ...parsed.custom };
        Object.assign(settings, parsed);
        settings.custom = customMerged;
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    } else {
      const browserLang = navigator.language || '';
      settings.lang = browserLang.startsWith('ja') ? 'ja' : 'en';
    }
  };

  const saveSettings = () => {
    localStorage.setItem('tool-settings', JSON.stringify(settings));
  };

  const applyTheme = (themeName) => {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-neon', 'dark');
    if (themeName === 'light') {
      root.classList.add('theme-light');
    } else if (themeName === 'neon') {
      root.classList.add('theme-neon');
      root.classList.add('dark');
    } else {
      root.classList.add('dark');
    }
  };

  watch(() => settings.theme, (newTheme) => {
    applyTheme(newTheme);
    saveSettings();
  });

  watch(() => settings.fontSize, (newVal) => {
    document.documentElement.style.fontSize = newVal + 'px';
    saveSettings();
  });

  watch(() => settings.lang, (newLang) => {
    document.documentElement.lang = newLang;
    saveSettings();
  });

  watch(() => settings.bgUrl, saveSettings);
  watch(() => settings.bgOpacity, saveSettings);
  watch(() => settings.bgBlur, saveSettings);

  onMounted(() => {
    loadSettings();
    document.documentElement.style.fontSize = settings.fontSize + 'px';
    applyTheme(settings.theme);
    document.documentElement.lang = settings.lang;
    document.addEventListener('fullscreenchange', updateFullscreenState);
  });

  const t = (key, fallback = '') => {
    const parts = key.split('.');
    const trans = translations.value || translations;
    let current = trans[settings.lang];
    if (!current) return fallback || key;
    for (const part of parts) {
      current = current[part];
      if (current === undefined) return fallback || key;
    }
    return current;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const resetSettings = () => {
    localStorage.removeItem('tool-settings');
    settings.lang = (navigator.language || '').startsWith('ja') ? 'ja' : 'en';
    settings.theme = 'dark';
    settings.fontSize = 16;
    settings.bgUrl = '';
    settings.bgOpacity = 0.3;
    settings.bgBlur = 10;
    settings.custom = { ...defaultCustomSettings };
    applyTheme(settings.theme);
  };

  const toggleTheme = () => {
    settings.theme = settings.theme === 'light' ? 'dark' : 'light';
  };

  return {
    settings,
    showSettings,
    isBgModalOpen,
    isFullscreen,
    t,
    toggleFullscreen,
    resetSettings,
    toggleTheme
  };
}
