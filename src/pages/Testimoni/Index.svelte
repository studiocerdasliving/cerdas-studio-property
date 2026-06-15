<script>
  import Layout from '../../components/Layout.svelte'
  import { apiFetch } from '../../lib/api.js'
  import { onMount } from 'svelte'
  import { Link } from 'svelte-routing'
  import { url } from '../../lib/url.svelte.js'

  /** @type {any[]} */
  let testimonis = $state([])
  let isLoading = $state(true)

  onMount(async () => {
    try {
      const res = await apiFetch('/testimoni');
      testimonis = res || [];
    } catch (e) {
      console.error(e);
    } finally {
      isLoading = false;
    }
  });
</script>

<Layout title="Testimoni Publik">
  <div class="container" style="padding: 60px 0; min-height: 60vh;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;">
      <div>
        <h1 style="font-family: 'Playfair Display', serif; font-size: 2.5rem; color: var(--text-1);">Suara Mereka</h1>
        <p style="color: var(--text-3);">Apa kata mereka tentang pengalaman bersama kami?</p>
      </div>
      <Link to={url("/testimoni/kirim")} class="btn btn-gold">Beri Ulasan</Link>
    </div>

    {#if isLoading}
      <div style="text-align: center; color: var(--text-3); padding: 40px;">Memuat testimoni...</div>
    {:else if testimonis.length === 0}
      <div class="card" style="padding: 40px; text-align: center;">
        <span style="font-size: 3rem; display: block; margin-bottom: 16px;">💬</span>
        <h3 style="color: var(--text-1); margin-bottom: 8px;">Belum ada testimoni</h3>
        <p style="color: var(--text-3);">Jadilah yang pertama memberikan ulasan.</p>
      </div>
    {:else}
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px;">
        {#each testimonis as t}
          <div class="card" style="padding: 24px;">
            <div style="display: flex; gap: 4px; margin-bottom: 12px; color: var(--gold);">
              {#each Array(t.rating || 5) as _, i}
                <span class="material-symbols-rounded" style="font-size: 1.2rem; font-variation-settings: 'FILL' 1;">star</span>
              {/each}
            </div>
            <p style="color: var(--text-2); line-height: 1.6; margin-bottom: 20px; font-style: italic;">"{t.komentar}"</p>
            <div style="font-weight: 700; color: var(--text-1);">{t.nama_user || 'Pengguna'}</div>
            <div style="font-size: 0.8rem; color: var(--text-3);">{t.tanggal ? new Date(t.tanggal).toLocaleDateString('id-ID') : 'Baru saja'}</div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</Layout>
