export default {
  name: 'SettingsModal',
  props: {
    settings: {
      type: Object,
      required: true
    },
    translations: {
      type: Object,
      required: false,
      default: () => ({})
    },
    isOpen: {
      type: Boolean,
      required: true
    }
  },
  emits: ['close', 'reset', 'open-bg-modal'],
  delimiters: ['[[', ']]'],
  template: `
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-transparent" @click.self="$emit('close')" v-cloak>
      <div class="modal-content w-full max-w-md p-6 rounded-2xl border bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-main)] shadow-2xl relative">
        <h3 class="text-xl font-bold mb-6 flex items-center justify-between">
          <span>[[ t('settings', 'Settings') ]]</span>
          <button @click="$emit('close')" class="text-[var(--text-muted)] hover:text-[var(--text-main)] theme-light:text-slate-500 theme-light:hover:text-slate-800">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </h3>
        
        <div class="space-y-6">
          <!-- Language -->
          <div>
            <label class="block text-sm font-semibold text-[var(--text-muted)] mb-2">[[ t('lang', 'Language') ]]</label>
            <select v-model="settings.lang" class="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:border-teal-500 text-[var(--text-main)] theme-light:border-slate-300 theme-light:text-slate-800 theme-light:focus:border-blue-600">
              <option value="ja">日本語</option>
              <option value="en">English</option>
            </select>
          </div>

          <!-- Theme -->
          <div>
            <label class="block text-sm font-semibold text-[var(--text-muted)] mb-2">[[ t('theme', 'Theme') ]]</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="settings.theme" value="dark" class="accent-teal-500 theme-light:accent-blue-600">
                <span>[[ t('theme_dark', 'Dark') ]]</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="settings.theme" value="light" class="accent-teal-500 theme-light:accent-blue-600">
                <span>[[ t('theme_light', 'Light') ]]</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="settings.theme" value="neon" class="accent-teal-500 theme-light:accent-blue-600">
                <span>[[ t('theme_neon', 'Neon') ]]</span>
              </label>
            </div>
          </div>

          <!-- Font Size -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="block text-sm font-semibold text-[var(--text-muted)]">[[ t('font_size', 'Font Size') ]]</label>
              <span class="text-sm font-mono text-[var(--text-main)]">[[ settings.fontSize ]]px</span>
            </div>
            <input type="range" min="14" max="24" v-model.number="settings.fontSize" class="w-full h-2 bg-[var(--border-color)] rounded-lg cursor-pointer accent-teal-500 theme-light:accent-blue-600">
          </div>

          <!-- Custom Background -->
          <div class="border-t border-[var(--border-color)] pt-4 space-y-4">
            <div class="flex justify-between items-center">
              <label class="block text-sm font-semibold text-[var(--text-muted)]">[[ t('bg_settings', 'Background Customization') ]]</label>
              <button @click="$emit('open-bg-modal')" class="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-xs font-bold text-[var(--text-main)] rounded-lg transition duration-200 theme-light:bg-blue-600 theme-light:hover:bg-blue-700 theme-light:text-white">
                [[ t('change_bg', '背景画像を変更...') ]]
              </button>
            </div>
          </div>
        </div>

        <div class="mt-8 flex justify-between items-center">
          <button @click="$emit('reset')" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl transition duration-200 theme-light:bg-slate-200 theme-light:hover:bg-slate-300 theme-light:text-slate-800 theme-light:border theme-light:border-slate-300">
            Reset
          </button>
          <button @click="$emit('close')" class="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-sm font-bold text-[var(--text-main)] rounded-xl transition duration-200 theme-light:bg-blue-600 theme-light:hover:bg-blue-700 theme-light:text-white">
            [[ t('close', 'Close') ]]
          </button>
        </div>
      </div>
    </div>
  `,
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
