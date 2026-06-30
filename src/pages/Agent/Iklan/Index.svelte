<script>
  import AgentLayout from '../../../components/AgentLayout.svelte'
  import { apiFetch } from '../../../lib/api.js'
  import { onMount } from 'svelte'
  import { Link } from 'svelte-routing'
  import { url } from '../../../lib/url.svelte.js'

  /** @type {{data: any[], current_page: number, last_page: number, total: number}} */
  let properties = $state({ data: [], current_page: 1, last_page: 1, total: 0 });
  let isLoading = $state(true);

  async function loadIklan(page = 1) {
    isLoading = true;
    try {
      const res = await apiFetch(`/agent/iklan?page=${page}`);
      properties = res.properties || { data: res, current_page: 1, last_page: 1, total: res.length };
    } catch(e) {
      console.error(e);
    } finally {
      isLoading = false;
    }
  }

  onMount(() => loadIklan(1));

  /**
   * @param {any} id
   */
  async function toggleStatus(id) {
    if (!confirm('Ubah status aktif/nonaktif untuk properti ini?')) return;
    try {
      await apiFetch(`/agent/iklan/${id}/toggle`, { method: 'POST' });
      await loadIklan(properties.current_page);
    } catch {
      alert('Gagal mengubah status iklan')
    }
  }

  /**
   * @param {any} id
   */
  async function deleteIklan(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus properti ini?')) return;
    try {
      await apiFetch(`/agent/iklan/${id}`, { method: 'DELETE' });
      await loadIklan(properties.current_page);
    } catch {
      alert('Gagal menghapus iklan')
    }
  }
</script>

<AgentLayout title="Manajemen Iklan">
  <div class="container" style="padding: 40px 0;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <h1 style="font-family: 'Playfair Display', serif; font-size: 2rem; color: var(--text-1);">Iklan Properti Anda</h1>
      <Link to={url('/agent/iklan/tambah')} class="btn btn-gold">+ Tambah Iklan Baru</Link>
    </div>

    {#if isLoading}
      <div style="padding: 40px; text-align: center; color: var(--text-3);">Memuat data iklan...</div>
    {:else if !properties.data || properties.data.length === 0}
      <div class="card" style="padding: 60px; text-align: center;">
        <span style="font-size: 3rem; margin-bottom: 16px; display: block;">🏠</span>
        <h3 style="color: var(--text-1); margin-bottom: 8px;">Belum ada iklan properti</h3>
        <p style="color: var(--text-3); margin-bottom: 24px;">Mulai pasarkan properti Anda dan jangkau jutaan pembeli potensial.</p>
        <Link to={url('/agent/iklan/tambah')} class="btn btn-gold">Buat Iklan Pertama</Link>
      </div>
    {:else}
      <div class="card" style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="background: var(--surface); border-bottom: 1px solid var(--border);">
              <th style="padding: 16px; color: var(--text-2); font-weight: 600;">Properti</th>
              <th style="padding: 16px; color: var(--text-2); font-weight: 600;">Harga & Tipe</th>
              <th style="padding: 16px; color: var(--text-2); font-weight: 600;">AI Score</th>
              <th style="padding: 16px; color: var(--text-2); font-weight: 600;">Status</th>
              <th style="padding: 16px; color: var(--text-2); font-weight: 600; text-align: right;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {#each properties.data as prop}
              <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 16px;">
                  <div style="font-weight: 600; color: var(--text-1);">{prop.nama_property}</div>
                  <div style="font-size: 0.85rem; color: var(--text-3);">{prop.alamat}</div>
                </td>
                <td style="padding: 16px;">
                  <div style="color: var(--gold); font-weight: 600;">Rp {(prop.harga / 1000000).toFixed(0)} Jt</div>
                  <div style="font-size: 0.8rem; color: var(--text-2); text-transform: capitalize;">{prop.tipe}</div>
                </td>
                <td style="padding: 16px;">
                  {#if prop.score_investasi_ai}
                    <span style="background: {prop.score_investasi_ai >= 80 ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)'}; color: {prop.score_investasi_ai >= 80 ? '#16a34a' : '#ca8a04'}; padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 0.85rem;">
                      {prop.score_investasi_ai}
                    </span>
                  {:else}
                    <span style="color: var(--text-3); font-size: 0.85rem;">N/A</span>
                  {/if}
                </td>
                <td style="padding: 16px;">
                  <span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; background: {prop.status == 1 ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)'}; color: {prop.status == 1 ? '#16a34a' : '#64748b'};">
                    <span style="width: 6px; height: 6px; border-radius: 50%; background: currentColor;"></span>
                    {prop.status == 1 ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td style="padding: 16px; text-align: right;">
                  <div style="display: flex; gap: 8px; justify-content: flex-end;">
                    <button class="btn btn-outline btn-sm" title="Toggle Status" onclick={() => toggleStatus(prop.id_property)}>
                      {prop.status == 1 ? 'Matikan' : 'Aktifkan'}
                    </button>
                    <Link to={url(`/agent/iklan/${prop.id_property}/edit`)} class="btn btn-outline btn-sm" style="color: var(--gold); border-color: var(--gold);">Edit</Link>
                    <button class="btn btn-outline btn-sm" style="color: #ef4444; border-color: rgba(239,68,68,0.3);" onclick={() => deleteIklan(prop.id_property)}>Hapus</button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      {#if properties.last_page > 1}
        <div style="display: flex; gap: 8px; margin-top: 24px; justify-content: center;">
          {#each Array.from({length: properties.last_page}, (_, i) => i + 1) as p}
            <button class="btn btn-sm {p === properties.current_page ? 'btn-gold' : 'btn-ghost'}" onclick={() => loadIklan(p)}>{p}</button>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</AgentLayout>
