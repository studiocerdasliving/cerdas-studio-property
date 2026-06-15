<script>
  import { onMount } from 'svelte';
  import { apiFetch } from '../lib/api.js';

  /** @type {any[]} */
  let properties = [];
  let isLoading = true;
  let errorMsg = '';

  onMount(async () => {
    try {
      properties = await apiFetch('/properties');
    } catch (err) {
      errorMsg = 'Gagal memuat properti: ' + (err instanceof Error ? err.message : String(err));
    } finally {
      isLoading = false;
    }
  });
</script>

<div class="min-h-screen bg-slate-900 pt-20 px-4 sm:px-6 lg:px-8">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-extrabold text-white">Daftar Properti</h1>
      <p class="mt-4 text-slate-400">Jelajahi listing properti terbaru dengan dukungan data cerdas.</p>
    </div>

    {#if isLoading}
      <div class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    {:else if errorMsg}
      <div class="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-2xl text-center">
        {errorMsg}
      </div>
    {:else if properties.length === 0}
      <div class="text-center text-slate-500 py-12">
        Belum ada properti yang tersedia.
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each properties as prop}
          <div class="bg-slate-800/80 backdrop-blur-lg border border-slate-700/50 rounded-3xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 shadow-xl group">
            <div class="h-48 bg-slate-700 relative overflow-hidden">
              <!-- Placeholder Image -->
              <div class="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 group-hover:scale-110 transition-transform duration-500"></div>
              <div class="absolute inset-0 flex items-center justify-center text-slate-500">
                <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              </div>
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-white mb-2">{prop.title}</h3>
              <p class="text-slate-400 text-sm mb-4 line-clamp-2">{prop.description || 'Tidak ada deskripsi'}</p>
              <div class="flex items-center justify-between mt-6">
                <span class="text-blue-400 font-bold text-lg">
                  Rp {prop.price ? prop.price.toLocaleString('id-ID') : 'Hubungi Agen'}
                </span>
                <button class="px-4 py-2 bg-slate-700 hover:bg-blue-600 text-white text-sm font-medium rounded-full transition-colors">
                  Detail
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
