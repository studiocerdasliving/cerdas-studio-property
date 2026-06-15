<script>
  import Layout from '../components/Layout.svelte'
  import { Link  } from 'svelte-routing'
  import { url } from '../lib/url.svelte.js'
  import { apiFetch } from '../lib/api.js'
  import { onMount } from 'svelte'

  let projects = $state({ data: [] })
  let filter = $state('semua')
  let isLoading = $state(true)

  onMount(async () => {
    try {
      const res = await apiFetch('/projects');
      projects = { data: res || [] };
    } catch (e) {
      console.error(e);
    } finally {
      isLoading = false;
    }
  });

  const cats = ['semua','lemari','meja','rak','bufet','nakas','sofa','kursi']
  /** @type {Record<string, string>} */
  const catIcons = { lemari:'🚪', meja:'🪵', rak:'📚', bufet:'📺', nakas:'🛏️', sofa:'🛋️', kursi:'🪑' }
  /** @type {any[]} */
  const items = $derived(
    filter === 'semua'
      ? projects.data
      : projects.data.filter((/** @type {any} */ p) => p.category === filter)
  )
</script>

<Layout title="Galeri Model 3D">
  <div class="container section-sm">
    <div style="text-align:center;margin-bottom:40px;" class="animate-in">
      <span class="badge badge-primary" style="margin-bottom:12px;">📦 Model 3D .obj Realistis</span>
      <h1 class="section-title">Galeri Model 3D</h1>
      <p class="section-sub" style="margin-bottom:20px;">Koleksi furnitur yang sudah dikonversi — siap di-drag ke Room Studio</p>
      <Link to={url('/ai-studio')} class="btn btn-primary">+ Buat Model Baru</Link>
    </div>

    <!-- Filter -->
    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:36px;">
      {#each cats as c}
        <button onclick={() => filter=c} class="chip {filter===c ? 'active' : ''}" style="text-transform:capitalize;">
          {#if c !== 'semua'}{catIcons[c] || '📦'} {/if}{c}
        </button>
      {/each}
    </div>

    {#if isLoading}
      <div style="text-align:center;padding:80px 0;color:var(--text-3);">Memuat galeri...</div>
    {:else if items.length === 0}
      <div style="text-align:center;padding:80px 0;" class="animate-in">
        <div style="font-size:3.5rem;margin-bottom:16px;opacity:0.5;">📦</div>
        <p style="font-size:1.1rem;font-weight:600;color:var(--text-2);margin:0 0 6px;">Belum ada model di kategori ini</p>
        <p style="color:var(--text-3);margin:0 0 20px;font-size:0.9rem;">Upload foto furnitur pertama untuk memulai.</p>
        <Link to={url('/ai-studio')} class="btn btn-primary">Upload Foto Pertama</Link>
      </div>
    {:else}
      <div class="grid-3" style="gap:20px;">
        {#each items as p}
          <Link to={url(`/ai-studio/${p.id}/result`)} style="text-decoration:none;">
            <div class="card card-hover" style="overflow:hidden;">
              <!-- Thumbnail area -->
              <div style="height:180px;background:linear-gradient(135deg,#f0f0f3,#e4e4ea);display:flex;align-items:center;justify-content:center;position:relative;">
                {#if p.foto_depan}
                  <img src="/storage/{p.foto_depan}" alt={p.name} style="width:100%;height:100%;object-fit:cover;" />
                {:else}
                  <div style="font-size:3.5rem;opacity:0.7;">{catIcons[p.category] || '📦'}</div>
                {/if}
                <!-- Mode badge -->
                <div style="position:absolute;top:8px;right:8px;">
                  <span class="badge {p.mode_upload === '4foto' ? 'badge-success' : 'badge-warning'}" style="font-size:0.65rem;">
                    {p.mode_upload === '4foto' ? '📷 4 Foto' : '📷 1 Foto'}
                  </span>
                </div>
              </div>
              <div style="padding:16px;">
                <p style="font-weight:700;font-size:0.92rem;margin:0 0 4px;color:var(--text-1);">{p.name || `${p.subcategory||p.category}`}</p>
                <p style="font-size:0.78rem;color:var(--text-3);margin:0 0 10px;font-family:'JetBrains Mono',monospace;">
                  {p.panjang_cm}×{p.tinggi_cm}×{p.lebar_cm}cm
                </p>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                  <span class="badge badge-primary" style="font-size:0.68rem;">{p.material}</span>
                  <span class="badge badge-accent" style="font-size:0.68rem;">{p.style}</span>
                  {#if p.jumlah_pintu > 0}
                    <span class="badge badge-teal" style="font-size:0.68rem;">{p.jumlah_pintu} pintu</span>
                  {/if}
                </div>
              </div>
            </div>
          </Link>
        {/each}
      </div>
    {/if}
  </div>
</Layout>
