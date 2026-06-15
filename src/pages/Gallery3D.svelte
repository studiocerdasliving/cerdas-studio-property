<script>
  import { apiFetch } from '../lib/api.js';

  /** @type {File | null} */
  let selectedFile = null;
  let isUploading = false;
  let uploadMessage = '';

  /** @param {any} event */
  function handleFileChange(event) {
    selectedFile = event.target.files[0];
  }

  async function handleUpload() {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    isUploading = true;
    uploadMessage = 'Mengunggah aset 3D...';

    try {
      // Kita tidak bisa langsung menggunakan apiFetch karena butuh content-type form-data otomatis
      // jadi kita tangani manual atau tambahkan opsi khusus di apiFetch
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Gagal mengunggah file');
      
      const data = await response.json();
      uploadMessage = `Berhasil! File ${data.files[0]} tersimpan.`;
    } catch (/** @type {any} */ err) {
      uploadMessage = 'Eror: ' + err.message;
    } finally {
      isUploading = false;
    }
  }
</script>

<div class="min-h-screen bg-slate-900 pt-20 px-4 sm:px-6 lg:px-8">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-extrabold text-white">Studio 3D Gallery</h1>
      <p class="mt-4 text-slate-400">Unggah objek desain interior (.glb, .gltf) untuk dirender pada *viewer*.</p>
    </div>

    <!-- Upload Box -->
    <div class="max-w-xl mx-auto bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl shadow-2xl">
      <div class="border-2 border-dashed border-slate-600 rounded-2xl p-10 text-center hover:bg-slate-700/30 transition-colors">
        <svg class="mx-auto h-12 w-12 text-slate-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
        <div class="text-sm text-slate-400">
          <label for="file-upload" class="relative cursor-pointer bg-blue-600 rounded-md font-medium text-white hover:bg-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-3 py-1 mr-2">
            <span>Pilih file</span>
            <input id="file-upload" name="file-upload" type="file" class="sr-only" on:change={handleFileChange} accept=".glb,.gltf">
          </label>
          atau seret dan lepas
        </div>
        <p class="text-xs text-slate-500 mt-2">GLB, GLTF hingga 50MB</p>
      </div>

      {#if selectedFile}
        <div class="mt-6 flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-700">
          <span class="text-sm text-slate-300 truncate w-3/4">{selectedFile.name}</span>
          <button on:click={handleUpload} disabled={isUploading} class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition-colors">
            {isUploading ? 'Loading...' : 'Unggah'}
          </button>
        </div>
      {/if}

      {#if uploadMessage}
        <div class="mt-4 p-3 rounded-lg text-sm text-center {uploadMessage.includes('Eror') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}">
          {uploadMessage}
        </div>
      {/if}
    </div>

    <!-- Viewer Placeholder -->
    <div class="mt-16 bg-slate-800 rounded-3xl border border-slate-700 h-96 flex items-center justify-center">
      <div class="text-center text-slate-500">
        <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path></svg>
        <p>WebGL Viewer Canvas akan dirender di sini (Babylon.js)</p>
      </div>
    </div>
  </div>
</div>
