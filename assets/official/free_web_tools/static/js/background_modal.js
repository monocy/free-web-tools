export default {
  name: 'BackgroundModal',
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
  emits: ['close'],
  delimiters: ['[[', ']]'],
  template: `
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" @click.self="$emit('close')" v-cloak>
      <div class="modal-content w-full max-w-lg p-6 rounded-2xl border bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-main)] shadow-2xl relative">
        <h3 class="text-xl font-bold mb-6 flex items-center justify-between">
          <span>[[ t('bg_settings', 'Background Customization') ]]</span>
          <button @click="$emit('close')" class="text-[var(--text-muted)] hover:text-[var(--text-main)]">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </h3>
        
        <div class="space-y-6">
          <!-- Preset Images -->
          <div>
            <label class="block text-sm font-semibold text-[var(--text-muted)] mb-2">[[ t('preset_images', 'Preset Images') ]]</label>
            <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-teal-600">
              <div 
                v-for="p in presets" 
                :key="p.url" 
                class="flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 cursor-pointer transition-all hover:scale-105"
                :class="settings.bgUrl === p.url ? 'border-teal-500 scale-105' : 'border-transparent'"
                @click="selectBg(p.url)"
              >
                <img :src="p.url" class="w-full h-full object-cover" alt="Preset background">
              </div>
            </div>
          </div>

          <!-- Drag and Drop Zone -->
          <div>
            <label class="block text-sm font-semibold text-[var(--text-muted)] mb-2">[[ t('upload_image', 'Upload Custom Image') ]]</label>
            <div 
              class="border-2 border-dashed border-[var(--border-color)] hover:border-teal-500 rounded-xl p-6 text-center cursor-pointer transition-colors duration-200"
              @dragover.prevent="dragOver = true"
              @dragleave.prevent="dragOver = false"
              @drop.prevent="onDrop"
              @click="triggerFileInput"
              :class="dragOver ? 'border-teal-500 bg-teal-500/10' : ''"
            >
              <svg class="mx-auto h-8 w-8 text-[var(--text-muted)] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <p class="text-xs text-[var(--text-muted)]">[[ t('drag_drop_text', 'Drag & drop an image here, or click to browse') ]]</p>
              <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="onFileChange">
            </div>
          </div>

          <!-- Custom Images -->
          <div v-if="customImages.length > 0">
            <label class="block text-sm font-semibold text-[var(--text-muted)] mb-2">[[ t('custom_images', 'Custom Images') ]]</label>
            <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-teal-600">
              <div 
                v-for="img in customImages" 
                :key="img.id" 
                class="flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 relative group"
                :class="settings.bgUrl === img.data ? 'border-teal-500 scale-105' : 'border-transparent'"
                @click="selectBg(img.data)"
              >
                <img :src="img.data" class="w-full h-full object-cover" alt="Custom background">
                
                <!-- Trash/Delete Button -->
                <button 
                  @click.stop="removeCustom(img.id)" 
                  class="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-500 text-white rounded transition duration-200"
                  :title="t('delete', 'Delete')"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 flex justify-end">
          <button @click="$emit('close')" class="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-sm font-bold text-[var(--text-main)] rounded-xl transition duration-200">
            [[ t('close', 'Close') ]]
          </button>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      presets: [
        { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80' },
        { url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&q=80' },
        { url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=1200&q=80' },
        { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' }
      ],
      customImages: [],
      dragOver: false,
      db: null
    };
  },
  async mounted() {
    try {
      this.db = await this.openDB();
      await this.loadCustomImages();
    } catch (e) {
      console.error('Failed to initialize DB', e);
    }
  },
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
    },
    selectBg(url) {
      this.settings.bgUrl = url;
    },
    openDB() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('portal-bg-db', 1);
        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('backgrounds')) {
            db.createObjectStore('backgrounds', { keyPath: 'id' });
          }
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
      });
    },
    async loadCustomImages() {
      if (!this.db) return;
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction('backgrounds', 'readonly');
        const store = transaction.objectStore('backgrounds');
        const request = store.getAll();
        request.onsuccess = () => {
          this.customImages = request.result || [];
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    onFileChange(e) {
      const files = e.target.files;
      if (files && files[0]) {
        this.processFile(files[0]);
      }
    },
    onDrop(e) {
      this.dragOver = false;
      const files = e.dataTransfer.files;
      if (files && files[0]) {
        this.processFile(files[0]);
      }
    },
    processFile(file) {
      if (!file.type.startsWith('image/')) {
        alert('Please drop an image file.');
        return;
      }
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target.result;
        const newBg = {
          id: Date.now().toString(),
          name: file.name,
          data: base64Data
        };
        try {
          await this.saveToDB(newBg);
          this.customImages.push(newBg);
          this.selectBg(base64Data);
        } catch (e) {
          console.error('Failed to save to DB', e);
        }
      };
      reader.readAsDataURL(file);
    },
    saveToDB(item) {
      return new Promise((resolve, reject) => {
        if (!this.db) return reject(new Error('DB not opened'));
        const transaction = this.db.transaction('backgrounds', 'readwrite');
        const store = transaction.objectStore('backgrounds');
        const request = store.put(item);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    },
    async removeCustom(id) {
      try {
        await this.removeFromDB(id);
        const index = this.customImages.findIndex(img => img.id === id);
        if (index !== -1) {
          const removed = this.customImages.splice(index, 1)[0];
          if (this.settings.bgUrl === removed.data) {
            this.settings.bgUrl = '';
          }
        }
      } catch (e) {
        console.error('Failed to delete from DB', e);
      }
    },
    removeFromDB(id) {
      return new Promise((resolve, reject) => {
        if (!this.db) return reject(new Error('DB not opened'));
        const transaction = this.db.transaction('backgrounds', 'readwrite');
        const store = transaction.objectStore('backgrounds');
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }
};
