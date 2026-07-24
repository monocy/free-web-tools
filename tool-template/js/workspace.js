const ToolWorkspace = {
  props: {
    settings: { type: Object, required: true },
    translations: { type: Object, required: true }
  },
  template: `
    <!-- Premium Centerpiece Glass Panel -->
    <div class="w-full glass-panel p-8 rounded-3xl neon-shadow flex flex-col items-center text-center space-y-6">
      <div class="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-4xl">
        <i class="fa-solid fa-shapes"></i>
      </div>
      <div class="space-y-2">
        <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {{ t('tool_title') }}
        </h2>
        <p class="text-sm max-w-md mx-auto" style="color: var(--text-muted);">
          {{ t('description') }}
        </p>
      </div>
      
      <!-- Placeholder Workspace Area (To be replaced by target tool functionality) -->
      <div class="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl p-6 text-center space-y-4">
        <p class="text-xs font-mono tracking-widest text-cyan-500 uppercase">// ACTIVE WORKSPACE PANEL</p>
        <div class="flex gap-4 justify-center">
          <button class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition duration-300">
            Sample Action
          </button>
          <button class="px-5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] font-semibold hover:border-slate-500 transition duration-300">
            Secondary Action
          </button>
        </div>
      </div>
    </div>
  `,
  setup(props) {
    const { ref, onMounted, onUnmounted } = Vue;

    const t = (key, fallback = '') => {
      const parts = key.split('.');
      const currentLang = props.settings.lang;
      const trans = props.translations ? (props.translations.value || props.translations) : {};
      let current = trans[currentLang];
      if (!current) return fallback || key;
      for (const part of parts) {
        current = current[part];
        if (current === undefined) return fallback || key;
      }
      return current;
    };

    // TODO: Define custom reactive variables, refs and methods here

    return {
      t
    };
  }
};
