const PortalHeader = {
  name: 'PortalHeader',
  props: {
    settings: {
      type: Object,
      required: true
    },
    translations: {
      type: Object,
      required: true
    },
    isFullscreen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggle-fullscreen', 'toggle-theme', 'open-settings'],
  template: `
    <header v-show="!isFullscreen" class="border-b border-[var(--border-color)] bg-[var(--bg-header)] backdrop-blur-lg fixed top-0 left-0 right-0 w-full z-[9999]" v-cloak>
      <div class="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <a href="../../" class="text-xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
          [[ t('app_title', 'Free Web Tools') ]]
        </a>
        <div class="flex items-center gap-2">
          <button @click="$emit('toggle-theme')" class="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] theme-light:text-slate-700 theme-light:hover:text-slate-900 transition duration-200" :title="t('theme_toggle', 'Toggle Theme')">
            <svg v-if="settings.theme === 'dark' || settings.theme === 'neon'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"></path>
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
          </button>
          <button @click="$emit('open-settings')" class="p-2 text-[var(--text-muted)] hover:text-[var(--text-muted)] dark:hover:text-[var(--text-main)] theme-light:text-slate-700 theme-light:hover:text-slate-900 transition duration-200">
            <svg class="w-6 h-6 animate-[spin_10s_linear_infinite] hover:animate-[spin_2s_linear_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </button>
        </div>
      </div>
    </header>
  `,
  delimiters: ['[[', ']]'],
  methods: {
    t(key, fallback = '') {
      const parts = key.split('.');
      const currentLang = this.settings && this.settings.lang ? this.settings.lang : 'en';
      const translations = this.translations || {};
      let current = translations[currentLang];
      if (!current) return fallback || key;
      for (const part of parts) {
        current = current[part];
        if (current === undefined) return fallback || key;
      }
      return current;
    }
  }
};

const PortalFooter = {
  name: 'PortalFooter',
  template: `
    <footer class="bg-transparent border-none py-4 mt-6 relative z-10" v-cloak>
      <div class="max-w-6xl mx-auto px-4 text-center text-[11px] text-[var(--text-muted)] opacity-60">
        &copy; 2026 Free Web Tools
      </div>
    </footer>
  `
};

const PortalControls = {
  name: 'PortalControls',
  props: {
    settings: {
      type: Object,
      required: true
    },
    translations: {
      type: Object,
      required: true
    }
  },
  emits: ['toggle-fullscreen'],
  template: `
    <button 
      @click="$emit('toggle-fullscreen')" 
      class="fixed bottom-3 right-3 z-40 w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center focus:outline-none opacity-40 hover:opacity-90"
      :title="t('fullscreen_toggle', 'Toggle Fullscreen')"
      v-cloak
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"></path>
      </svg>
    </button>
  `,
  delimiters: ['[[', ']]'],
  methods: {
    t(key, fallback = '') {
      const parts = key.split('.');
      const currentLang = this.settings && this.settings.lang ? this.settings.lang : 'en';
      const translations = this.translations || {};
      let current = translations[currentLang];
      if (!current) return fallback || key;
      for (const part of parts) {
        current = current[part];
        if (current === undefined) return fallback || key;
      }
      return current;
    }
  }
};
