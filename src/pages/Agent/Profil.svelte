<script>
  import Layout from '../../components/Layout.svelte'
  import { apiFetch } from '../../lib/api.js'
  import { onMount } from 'svelte'

  let name = $state('');
  let whatsapp = $state('');
  let email = $state(''); // Readonly
  let password = $state('');

  let isLoading = $state(true);
  let isSaving = $state(false);
  let errorMsg = $state('');
  let successMsg = $state('');

  let stats = $state({
    total_iklan: 0,
    iklan_aktif: 0,
    iklan_nonaktif: 0,
    avg_ai_score: 0
  });

  onMount(async () => {
    try {
      // Kita bisa ambil data dashboard untuk tahu data profil staff saat ini
      const res = await apiFetch('/agent/dashboard');
      if (res.agent) {
        name = res.agent.nama_staff || '';
        whatsapp = res.agent.telepon_staff || '';
        email = res.agent.email || '';
      }
      if (res.stats) {
        stats = res.stats;
      }
    } catch (e) {
      errorMsg = 'Gagal memuat data profil';
      console.error(e);
    } finally {
      isLoading = false;
    }
  });

  /** @param {Event} e */
  async function saveProfile(e) {
    e.preventDefault();
    isSaving = true;
    errorMsg = '';
    successMsg = '';
    
    try {
      await apiFetch('/agent/profil', {
        method: 'PUT',
        body: JSON.stringify({ nama: name, telepon: whatsapp })
      });
      successMsg = 'Profil berhasil diperbarui!';
    } catch(error) {
      const err = /** @type {any} */ (error);
      errorMsg = err.message || 'Gagal menyimpan profil';
    } finally {
      isSaving = false;
    }
  }
</script>

<Layout title="Profil Agen">
  <div class="container" style="padding: 60px 0; max-width: 900px;">
    <h1 style="font-family: 'Playfair Display', serif; font-size: 2rem; color: var(--text-1); margin-bottom: 32px;">Pengaturan Profil</h1>
    
    {#if isLoading}
      <div style="text-align: center; padding: 40px; color: var(--text-3);">Memuat profil...</div>
    {:else}
      <div style="display: grid; grid-template-columns: 1fr; gap: 32px;">
        <!-- STATS ROW -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <div class="card" style="padding: 24px; text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 8px;">🏠</div>
            <div style="font-size: 1.8rem; font-weight: 700; color: var(--text-1);">{stats.total_iklan}</div>
            <div style="font-size: 0.85rem; color: var(--text-3);">Total Iklan</div>
          </div>
          <div class="card" style="padding: 24px; text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 8px;">🟢</div>
            <div style="font-size: 1.8rem; font-weight: 700; color: var(--text-1);">{stats.iklan_aktif}</div>
            <div style="font-size: 0.85rem; color: var(--text-3);">Iklan Aktif</div>
          </div>
          <div class="card" style="padding: 24px; text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 8px;">🤖</div>
            <div style="font-size: 1.8rem; font-weight: 700; color: var(--gold);">{stats.avg_ai_score ? Math.round(stats.avg_ai_score) : 0}</div>
            <div style="font-size: 0.85rem; color: var(--text-3);">Rata-rata AI Score</div>
          </div>
        </div>

      <form class="card" style="padding: 32px;" onsubmit={saveProfile}>
        {#if errorMsg}
          <div style="background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 12px 16px; border-radius: var(--radius); margin-bottom: 24px; font-size: 0.9rem;">{errorMsg}</div>
        {/if}
        {#if successMsg}
          <div style="background: rgba(34, 197, 94, 0.1); color: #22c55e; padding: 12px 16px; border-radius: var(--radius); margin-bottom: 24px; font-size: 0.9rem;">{successMsg}</div>
        {/if}

        <div class="form-group" style="margin-bottom: 20px;">
          <label class="form-label" for="email">Email (Akun)</label>
          <input class="form-input" id="email" type="text" value={email} readonly aria-label="Email" style="background: var(--surface); color: var(--text-3);" />
        </div>

        <div class="form-group" style="margin-bottom: 20px;">
          <label class="form-label" for="password">Password Baru (Opsional)</label>
          <input class="form-input" id="password" type="password" bind:value={password} placeholder="Kosongkan jika tidak diubah" />
        </div>

        <div class="form-group" style="margin-bottom: 20px;">
          <label class="form-label" for="name">Nama Publik</label>
          <input class="form-input" id="name" type="text" bind:value={name} required />
        </div>

        <div class="form-group" style="margin-bottom: 32px;">
          <label class="form-label" for="wa">Nomor WhatsApp</label>
          <input class="form-input" id="wa" type="text" bind:value={whatsapp} required />
          <div style="font-size: 0.75rem; color: var(--text-3); margin-top: 4px;">Penting agar calon pembeli dapat menghubungi Anda (Gunakan awalan 62).</div>
        </div>

        <button type="submit" class="btn btn-gold btn-full" disabled={isSaving}>
          {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
      </div>
    {/if}
  </div>
</Layout>
