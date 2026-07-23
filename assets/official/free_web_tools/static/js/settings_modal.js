export default {
  name: 'SettingsModal',
  props: {
    settings: {
      type: Object,
      required: true
    },
    translations: {
      type: Object,
      required: true
    },
    isOpen: {
      type: Boolean,
      required: true
    }
  },
  emits: ['close', 'reset', 'open-bg-modal'],
  delimiters: ['[[', ']]'],
  template: `
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" @click.self="$emit('close')" v-cloak>
      <div class="modal-content w-full max-w-md p-6 rounded-2xl border bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-main)] shadow-2xl relative">
        <h3 class="text-xl font-bold mb-6 flex items-center justify-between">
          <span>[[ t('settings', 'Settings') ]]</span>
          <button @click="$emit('close')" class="text-[var(--text-muted)] hover:text-[var(--text-main)]">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </h3>
        
        <div class="space-y-6">
          <!-- Language -->
          <div>
            <label class="block text-sm font-semibold text-[var(--text-muted)] mb-2">[[ t('lang', 'Language') ]]</label>
            <select v-model="settings.lang" class="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:border-teal-500 text-[var(--text-main)]">
              <option value="ja">日本語</option>
              <option value="en">English</option>
            </select>
          </div>

          <!-- Theme -->
          <div>
            <label class="block text-sm font-semibold text-[var(--text-muted)] mb-2">[[ t('theme', 'Theme') ]]</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="settings.theme" value="dark" class="accent-teal-500">
                <span>[[ t('theme_dark', 'Dark') ]]</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="settings.theme" value="light" class="accent-teal-500">
                <span>[[ t('theme_light', 'Light') ]]</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="settings.theme" value="neon" class="accent-teal-500">
                <span>[[ t('theme_neon', 'Neon') ]]</span>
              </label>
            </div>
          </div>

          <!-- Custom Background -->
          <div class="border-t border-[var(--border-color)] pt-4 space-y-4">
            <div class="flex justify-between items-center">
              <label class="block text-sm font-semibold text-[var(--text-muted)]">[[ t('bg_settings', 'Background Customization') ]]</label>
              <button @click="$emit('open-bg-modal')" class="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-xs font-bold text-[var(--text-main)] rounded-lg transition duration-200">
                [[ t('change_bg', '背景画像を変更...') ]]
              </button>
            </div>
            
            <div>
              <span class="block text-xs text-[var(--text-muted)] mb-1">[[ t('bg_image_url', 'Background Image URL') ]]</span>
              <input type="text" v-model="settings.bgUrl" placeholder="https://example.com/image.jpg" class="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:border-teal-500 text-[var(--text-main)]">
            </div>

            <div>
              <div class="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                <span>[[ t('bg_opacity', 'Opacity') ]]</span>
                <span>[[ Math.round(settings.bgOpacity * 100) ]]%</span>
              </div>
              <input type="range" v-model.number="settings.bgOpacity" min="0" max="1" step="0.05" class="w-full accent-teal-500">
            </div>

            <div>
              <div class="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                <span>[[ t('bg_blur', 'Blur') ]]</span>
                <span>[[ settings.bgBlur ]]px</span>
              </div>
              <input type="range" v-model.number="settings.bgBlur" min="0" max="30" step="1" class="w-full accent-teal-500">
            </div>
          </div>
        </div>

        <div class="mt-8 flex justify-between items-center">
          <button @click="$emit('reset')" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl transition duration-200">
            Reset
          </button>
          <button @click="$emit('close')" class="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-sm font-bold text-[var(--text-main)] rounded-xl transition duration-200">
            [[ t('close', 'Close') ]]
          </button>
        </div>
      </div>
    </div>
  `,
  methods: {
    t(key, fallback = '') {
      const parts = key.split('.');
      let current = this.translations[this.settings.lang];
      if (!current) return fallback || key;
      for (const part of parts) {
        current = current[part];
        if (current === undefined) return fallback || key;
      }
      return current;
    }
  }
};
