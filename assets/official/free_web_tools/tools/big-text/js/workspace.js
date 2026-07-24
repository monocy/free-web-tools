const ToolWorkspace = {
  props: {
    settings: { type: Object, required: true },
    translations: { type: Object, required: true }
  },
  template: `
    <div class="w-full flex flex-col space-y-6">
      
      <!-- Showcase Screen -->
      <div 
        class="w-full h-80 sm:h-96 rounded-3xl glass-panel border border-[var(--border-color)] hover:border-[var(--accent-color)] neon-shadow flex items-center justify-center overflow-hidden relative cursor-pointer select-none transition-all duration-300"
        :class="{ 'p-4': customSettings.animation !== 'scroll' }"
        @click.stop="togglePanel"
      >
        <!-- Canvas/Display Area -->
        <div 
          class="flex items-center justify-center select-all whitespace-pre-wrap transition-all duration-300"
          :class="[
            displayClasses,
            customSettings.orientation === 'vertical' ? 'h-full flex-col' : 'w-full flex-row'
          ]"
          :style="displayStyles"
        >
          <!-- Text Box -->
          <div 
            :class="animationClass"
            :style="animationStyles"
            class="text-center font-bold tracking-normal leading-none"
          >
            {{ customSettings.textContent || 'TEXT' }}
          </div>
        </div>
        
        <!-- Status indicator overlay (top right) -->
        <div class="absolute top-4 right-4 text-[10px] font-mono opacity-50 flex items-center gap-1.5 select-none">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>LIVE DISPLAY</span>
        </div>

        <!-- Help/Hint Overlay (bottom center) -->
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] font-semibold opacity-60 bg-[var(--bg-primary)]/80 px-3 py-1.5 rounded-full border border-[var(--border-color)] select-none hover:opacity-100 transition-opacity flex items-center gap-1.5 shadow-md">
          <i class="fa-solid fa-sliders text-[var(--accent-color)]"></i>
          <span>{{ t('click_to_edit', 'Click display area to edit text & styles') }}</span>
        </div>
      </div>

      <!-- Backdrop for Click-Outside closing -->
      <div 
        v-if="isPanelOpen" 
        class="fixed inset-0 bg-black/35 z-40 transition-opacity duration-300"
        @click="closePanel"
      ></div>

      <!-- Bottom Slide-up Panel (Editing Window) -->
      <div 
        ref="panelRef"
        :class="[
          'fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl z-50 glass-panel border-t border-l border-r border-[var(--border-color)] rounded-t-3xl shadow-2xl transition-all duration-300 ease-out flex flex-col',
          isPanelOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'
        ]"
        style="max-height: 75vh;"
        @click.stop
      >
        <!-- Panel Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] shrink-0">
          <div class="flex items-center gap-2 font-bold text-sm tracking-widest text-[var(--accent-color)] uppercase">
            <i class="fa-solid fa-sliders"></i>
            <span>{{ t('custom_settings_title', 'Customize Settings') }}</span>
          </div>
          <button 
            @click="closePanel"
            class="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors p-1.5 hover:bg-[var(--bg-primary)] rounded-lg flex items-center gap-1 text-xs font-semibold"
          >
            <i class="fa-solid fa-circle-xmark text-lg"></i>
          </button>
        </div>

        <!-- Scrollable Control Panel Contents -->
        <div class="flex-grow overflow-y-auto p-6 sm:p-8 space-y-6">
          
          <!-- Text Input Field -->
          <div class="space-y-2">
            <label class="text-xs font-bold tracking-widest text-[var(--accent-color)] uppercase flex items-center gap-2">
              <i class="fa-solid fa-keyboard"></i>
              {{ t('placeholder') }}
            </label>
            <input 
              type="text" 
              v-model="customSettings.textContent"
              class="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] focus:border-[var(--accent-color)] outline-none rounded-2xl px-5 py-3.5 text-lg text-[var(--text-main)] transition duration-300 hover:border-slate-500"
              :placeholder="t('placeholder')"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <!-- Left Column: Text Size & Scroll Speed & Font Family -->
            <div class="space-y-4">
              <!-- Font Size -->
              <div class="space-y-2">
                <div class="flex justify-between items-center text-sm font-semibold text-[var(--text-main)]">
                  <span class="flex items-center gap-2">
                    <i class="fa-solid fa-text-height"></i>
                    {{ t('text_size') }}
                  </span>
                  <span class="font-mono text-[var(--accent-color)] text-xs">{{ customSettings.textSize }}rem</span>
                </div>
                <input 
                  type="range" 
                  v-model.number="customSettings.textSize"
                  min="1" 
                  max="15" 
                  step="0.5"
                  class="w-full accent-[var(--accent-color)] h-1.5 bg-[var(--bg-primary)] rounded-lg cursor-pointer"
                />
              </div>

              <!-- Scroll Speed (Shown only if animation is 'scroll') -->
              <div v-if="customSettings.animation === 'scroll'" class="space-y-2 transition-all duration-300">
                <div class="flex justify-between items-center text-sm font-semibold text-[var(--text-main)]">
                  <span class="flex items-center gap-2">
                    <i class="fa-solid fa-gauge-high"></i>
                    {{ t('scroll_speed') }}
                  </span>
                  <span class="font-mono text-[var(--accent-color)] text-xs">Speed {{ customSettings.scrollSpeed }}</span>
                </div>
                <input 
                  type="range" 
                  v-model.number="customSettings.scrollSpeed"
                  min="1" 
                  max="10" 
                  step="1"
                  class="w-full accent-[var(--accent-color)] h-1.5 bg-[var(--bg-primary)] rounded-lg cursor-pointer"
                />
              </div>

              <!-- Font Family Selector -->
              <div class="space-y-2">
                <label class="text-sm font-semibold text-[var(--text-main)] flex items-center gap-2">
                  <i class="fa-solid fa-font"></i>
                  {{ t('font_family') }}
                </label>
                <select 
                  v-model="customSettings.fontFamily"
                  class="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] focus:border-[var(--accent-color)] outline-none rounded-xl px-4 py-2.5 text-sm text-[var(--text-main)] transition duration-300"
                >
                  <option value="Outfit">Outfit (Modern Sans)</option>
                  <option value="Share Tech Mono">Share Tech Mono (Futuristic Mono)</option>
                  <option value="Pacifico">Pacifico (Handwriting)</option>
                  <option value="Kaushan Script">Kaushan Script (Script)</option>
                  <option value="Dela Gothic One">Dela Gothic One (Bold Impact JP)</option>
                  <option value="Sawarabi Mincho">Sawarabi Mincho (Mincho JP)</option>
                  <option value="sans-serif">Sans-Serif (Standard)</option>
                  <option value="serif">Serif (Standard)</option>
                </select>
              </div>
            </div>

            <!-- Right Column: Color Picker, Effect, Animation & Orientation -->
            <div class="space-y-4">
              
              <!-- Redesigned Custom Native Color Picker & Presets UI -->
              <div class="space-y-2">
                <label class="text-sm font-semibold text-[var(--text-main)] flex items-center gap-2">
                  <i class="fa-solid fa-palette"></i>
                  {{ t('text_color') }}
                </label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-color)] shadow-inner">
                  <!-- Left: Native Color Picker and HEX display/edit -->
                  <div class="flex items-center gap-3 w-full">
                    <input 
                      type="color" 
                      v-model="customSettings.textColor"
                      class="w-14 h-14 rounded-xl cursor-pointer border border-[var(--border-color)] bg-transparent p-1 shadow-md hover:scale-105 transition-transform"
                    />
                    <div class="flex-grow flex flex-col justify-center">
                      <span class="text-[10px] text-[var(--text-muted)] font-bold tracking-widest uppercase mb-0.5">HEX VALUE</span>
                      <input 
                        type="text" 
                        v-model="customSettings.textColor"
                        class="bg-transparent text-base font-mono font-bold text-[var(--text-main)] focus:outline-none border-b border-dashed border-[var(--border-color)] focus:border-[var(--accent-color)] uppercase w-28 py-0.5"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <!-- Right: Presets -->
                  <div class="flex flex-wrap gap-1.5 justify-start sm:justify-end">
                    <button 
                      v-for="color in presetColors" 
                      :key="color"
                      @click="customSettings.textColor = color"
                      class="w-7 h-7 rounded-lg border border-[var(--border-color)] transition duration-200 hover:scale-110 active:scale-95 shadow-sm"
                      :style="{ backgroundColor: color }"
                      :title="color"
                    ></button>
                  </div>
                </div>
              </div>

              <!-- Effect & Animation Dropdowns in Grid -->
              <div class="grid grid-cols-2 gap-3">
                <!-- Text Effect Selector -->
                <div class="space-y-2">
                  <label class="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1.5">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                    {{ t('text_effect') }}
                  </label>
                  <select 
                    v-model="customSettings.effect"
                    class="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] focus:border-[var(--accent-color)] outline-none rounded-xl px-3 py-2 text-xs text-[var(--text-main)] transition duration-300"
                  >
                    <option value="none">{{ t('effect_none') }}</option>
                    <option value="shadow">{{ t('effect_shadow') }}</option>
                    <option value="neon">{{ t('effect_neon') }}</option>
                    <option value="glass">{{ t('effect_glass') }}</option>
                  </select>
                </div>

                <!-- Animation Selector -->
                <div class="space-y-2">
                  <label class="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1.5">
                    <i class="fa-solid fa-film"></i>
                    {{ t('animation') }}
                  </label>
                  <select 
                    v-model="customSettings.animation"
                    class="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] focus:border-[var(--accent-color)] outline-none rounded-xl px-3 py-2 text-xs text-[var(--text-main)] transition duration-300"
                  >
                    <option value="none">{{ t('animation_none') }}</option>
                    <option value="bounce">{{ t('animation_bounce') }}</option>
                    <option value="fade">{{ t('animation_fade') }}</option>
                    <option value="zoom">{{ t('animation_zoom') }}</option>
                    <option value="scroll">{{ t('animation_scroll') }}</option>
                  </select>
                </div>
              </div>

              <!-- Orientation Switcher -->
              <div class="space-y-2">
                <label class="text-sm font-semibold text-[var(--text-main)] flex items-center gap-2">
                  <i class="fa-solid fa-arrows-left-right"></i>
                  {{ t('orientation') }}
                </label>
                <div class="grid grid-cols-2 gap-3 bg-[var(--bg-primary)] p-1 rounded-xl border border-[var(--border-color)]">
                  <button 
                    @click="customSettings.orientation = 'horizontal'"
                    class="py-1.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5"
                    :class="customSettings.orientation === 'horizontal' ? 'bg-[var(--accent-color)] text-gray-950 shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'"
                  >
                    <i class="fa-solid fa-arrows-left-right"></i>
                    {{ t('horizontal') }}
                  </button>
                  <button 
                    @click="customSettings.orientation = 'vertical'"
                    class="py-1.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5"
                    :class="customSettings.orientation === 'vertical' ? 'bg-[var(--accent-color)] text-gray-950 shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'"
                  >
                    <i class="fa-solid fa-arrows-up-down"></i>
                    {{ t('vertical') }}
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  `,
  setup(props) {
    const { ref, reactive, computed, onMounted, onUnmounted, watch } = Vue;

    // Panel visibility state
    const isPanelOpen = ref(false);

    const togglePanel = () => {
      isPanelOpen.value = !isPanelOpen.value;
    };

    const closePanel = () => {
      isPanelOpen.value = false;
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closePanel();
      }
    };

    // Global Click handler for fallback close-on-click-outside
    const panelRef = ref(null);

    // Local configuration for standalone mode, syncs with portal settings when available
    const localSettings = reactive({
      textContent: 'HELLO',
      textSize: 6,
      fontFamily: 'Outfit',
      textColor: '#00f0ff',
      effect: 'neon',
      animation: 'bounce',
      orientation: 'horizontal',
      scrollSpeed: 5
    });

    const customSettings = computed(() => {
      if (props.settings && props.settings.custom && Object.keys(props.settings.custom).length > 0) {
        return props.settings.custom;
      }
      return localSettings;
    });

    // Translation helper
    const t = (key, fallback = '') => {
      const parts = key.split('.');
      const currentLang = (props.settings && props.settings.lang) || 'en';
      const trans = props.translations ? (props.translations.value || props.translations) : {};
      let current = trans[currentLang];
      if (!current) return fallback || key;
      for (const part of parts) {
        current = current[part];
        if (current === undefined) return fallback || key;
      }
      return current;
    };

    // Preset color palette
    const presetColors = [
      '#00f0ff', // Neon Cyan
      '#39ff14', // Neon Green
      '#d300ff', // Neon Purple
      '#ff073a', // Neon Red
      '#ff007f', // Pink
      '#ffaa00', // Neon Orange
      '#ffff00', // Yellow
      '#ffffff', // White
      '#a855f7', // Violet
      '#ec4899', // Pinkish Red
    ];

    // CSS Keyframe Injection to avoid external stylesheets dependency
    onMounted(() => {
      window.addEventListener('keydown', handleKeyDown);

      if (!document.getElementById('big-text-custom-styles')) {
        const style = document.createElement('style');
        style.id = 'big-text-custom-styles';
        style.innerHTML = `
          @keyframes custom-bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-24px); }
          }
          @keyframes custom-fade {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
          }
          @keyframes custom-zoom {
            0%, 100% { transform: scale(0.85); }
            50% { transform: scale(1.15); }
          }
          @keyframes custom-scroll-h {
            0% { transform: translateX(80vw); }
            100% { transform: translateX(-100%); }
          }
          @keyframes custom-scroll-v {
            0% { transform: translateY(50vh); }
            100% { transform: translateY(-100%); }
          }
          
          .animate-custom-bounce {
            animation: custom-bounce 1.8s infinite ease-in-out;
          }
          .animate-custom-fade {
            animation: custom-fade 2.2s infinite ease-in-out;
          }
          .animate-custom-zoom {
            animation: custom-zoom 2.8s infinite ease-in-out;
          }
          .animate-custom-scroll-h {
            animation: custom-scroll-h var(--scroll-duration, 12s) infinite linear;
          }
          .animate-custom-scroll-v {
            animation: custom-scroll-v var(--scroll-duration, 12s) infinite linear;
          }
        `;
        document.head.appendChild(style);
      }
    });

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyDown);
    });

    // Compute styles based on user configurations
    const displayClasses = computed(() => {
      const cls = [];
      return cls;
    });

    const displayStyles = computed(() => {
      const styles = {};
      
      // Font family
      styles.fontFamily = `"${customSettings.value.fontFamily}", sans-serif`;
      
      // Orientation layout details
      if (customSettings.value.orientation === 'vertical') {
        styles.writingMode = 'vertical-rl';
        styles.textOrientation = 'mixed';
      }
      
      return styles;
    });

    const animationClass = computed(() => {
      const anim = customSettings.value.animation;
      if (anim === 'bounce') return 'animate-custom-bounce';
      if (anim === 'fade') return 'animate-custom-fade';
      if (anim === 'zoom') return 'animate-custom-zoom';
      if (anim === 'scroll') {
        return customSettings.value.orientation === 'vertical' 
          ? 'animate-custom-scroll-v' 
          : 'animate-custom-scroll-h';
      }
      return '';
    });

    const animationStyles = computed(() => {
      const styles = {};
      const config = customSettings.value;
      
      // Color & Font size
      styles.color = config.textColor;
      styles.fontSize = `${config.textSize}rem`;

      // Apply effects
      if (config.effect === 'shadow') {
        styles.textShadow = '6px 6px 0px rgba(0, 0, 0, 0.4)';
      } else if (config.effect === 'neon') {
        const glowColor = config.textColor;
        styles.textShadow = `0 0 8px ${glowColor}, 0 0 20px ${glowColor}, 0 0 40px ${glowColor}`;
      } else if (config.effect === 'glass') {
        styles.color = 'transparent';
        styles.webkitTextStroke = `1.5px ${config.textColor}`;
        styles.textShadow = `0px 4px 12px rgba(255, 255, 255, 0.1)`;
      }

      // Scroll speed translation to scroll duration
      if (config.animation === 'scroll') {
        // Range 1 to 10 -> map to 20s to 2s
        const speed = config.scrollSpeed || 5;
        const duration = 22 - (speed * 2); 
        styles['--scroll-duration'] = `${duration}s`;
        
        // Ensure continuous inline flow for horizontal scroll
        if (config.orientation === 'horizontal') {
          styles.whiteSpace = 'nowrap';
          styles.width = 'max-content';
        } else {
          styles.height = 'max-content';
        }
      }

      return styles;
    });

    return {
      customSettings,
      t,
      presetColors,
      displayClasses,
      displayStyles,
      animationClass,
      animationStyles,
      isPanelOpen,
      togglePanel,
      closePanel,
      panelRef
    };
  }
};
