const { ref, reactive, watch, onMounted, isRef } = Vue;

const fallbackTranslations = {
  en: {
    settings: "Settings",
    font_size: "Font Size",
    theme: "Theme",
    theme_light: "Light",
    theme_dark: "Dark",
    theme_neon: "Neon",
    lang: "Language",
    lang_en: "English",
    lang_ja: "Japanese",
    bg_settings: "Background Customization",
    bg_image_url: "Background Image URL",
    bg_opacity: "Opacity",
    bg_blur: "Blur",
    fullscreen: "Fullscreen",
    fullscreen_toggle: "Toggle Fullscreen",
    close: "Close",
    reset: "Reset",
    settings_title: "Settings",
    lang_label: "Language",
    theme_label: "Theme",
    bg_url_label: "Background Image URL",
    bg_opacity_label: "Opacity",
    bg_blur_label: "Blur",
    change_bg: "Change Background...",
    preset_images: "Preset Images",
    upload_image: "Upload Custom Image",
    drag_drop_text: "Drag & drop an image here, or click to browse",
    custom_images: "Custom Images",
    delete: "Delete",
    save_settings: "Save Settings"
  },
  ja: {
    settings: "設定",
    font_size: "文字の大きさ",
    theme: "テーマ",
    theme_light: "ライト",
    theme_dark: "ダーク",
    theme_neon: "ネオン",
    lang: "言語",
    lang_en: "英語",
    lang_ja: "日本語",
    bg_settings: "背景カスタマイズ",
    bg_image_url: "背景画像 URL",
    bg_opacity: "不透明度",
    bg_blur: "ぼかし",
    fullscreen: "全画面表示",
    fullscreen_toggle: "全画面切り替え",
    close: "閉じる",
    reset: "リセット",
    settings_title: "設定",
    lang_label: "言語",
    theme_label: "テーマ",
    bg_url_label: "背景画像 URL",
    bg_opacity_label: "不透明度",
    bg_blur_label: "ぼかし",
    change_bg: "背景画像を変更...",
    preset_images: "プリセット画像",
    upload_image: "カスタム画像をアップロード",
    drag_drop_text: "画像をここにドラッグ＆ドロップ、またはクリックして選択",
    custom_images: "カスタム画像",
    delete: "削除",
    save_settings: "設定を保存"
  }
};

export function usePortalCommon(arg1 = {}, arg2 = {}) {
  let translationsRef;
  let defaultCustomSettings = {};

  if (isRef(arg1) || (arg1 && (arg1.en || arg1.ja))) {
    translationsRef = isRef(arg1) ? arg1 : ref(arg1);
    defaultCustomSettings = arg2 || {};
  } else {
    translationsRef = ref({});
    defaultCustomSettings = arg1 || {};
  }

  // Initialize with fallback translations
  translationsRef.value = {
    en: { ...fallbackTranslations.en, ...(translationsRef.value.en || {}) },
    ja: { ...fallbackTranslations.ja, ...(translationsRef.value.ja || {}) }
  };

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

  const loadTranslations = async () => {
    try {
      const res = await fetch('./i18n.json');
      if (res.ok) {
        const data = await res.json();
        translationsRef.value = {
          en: { ...translationsRef.value.en, ...(data.en || {}) },
          ja: { ...translationsRef.value.ja, ...(data.ja || {}) }
        };
      }
    } catch (e) {
      console.log('Failed to fetch ./i18n.json (CORS block or file not found), using local fallback translations:', e);
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

  onMounted(async () => {
    loadSettings();
    document.documentElement.style.fontSize = settings.fontSize + 'px';
    applyTheme(settings.theme);
    document.documentElement.lang = settings.lang;
    document.addEventListener('fullscreenchange', updateFullscreenState);
    await loadTranslations();
  });

  const t = (key, fallback = '') => {
    const parts = key.split('.');
    const trans = translationsRef.value || translationsRef;
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
    translations: translationsRef,
    t,
    toggleFullscreen,
    resetSettings,
    toggleTheme,
    loadTranslations
  };
}

