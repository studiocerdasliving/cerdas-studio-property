<script>
  import Layout from '../../components/Layout.svelte'
  import { Link, navigate  } from 'svelte-routing'
  import { untrack, onMount } from 'svelte'
  import { url, propertyImg } from '../../lib/url.svelte.js'
  import { apiFetch } from '../../lib/api.js'

  /** @type {any} */
  let properties = $state({ data: [], current_page: 1, last_page: 1, total: 0 })
  /** @type {any[]} */
  let categories = $state([])
  /** @type {any[]} */
  let provinces = $state([])
  let isLoading = $state(true)
  let isAiLoading = $state(false)

  // Assuming you can pass filters via URL search params (e.g. from location.search)
  /** @type {any} */
  let filters = {}
  
  let tipe     = $state('')
  let kategori = $state('')
  let lokasi   = $state('')
  let q        = $state('')
  let harga_min = $state('')
  let harga_max = $state('')
  let kamar_tidur = $state('')
  let kamar_mandi = $state('')
  let lt_min = $state('')
  let lt_max = $state('')
  let lb_min = $state('')
  let lb_max = $state('')
  let surat = $state('')
  let sort     = $state('terbaru')

  onMount(async () => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has('tipe')) tipe = searchParams.get('tipe') || '';
      if (searchParams.has('kategori')) kategori = searchParams.get('kategori') || '';
      if (searchParams.has('lokasi')) lokasi = searchParams.get('lokasi') || '';
      if (searchParams.has('q')) q = searchParams.get('q') || '';
      if (searchParams.has('harga_min')) harga_min = searchParams.get('harga_min') || '';
      if (searchParams.has('harga_max')) harga_max = searchParams.get('harga_max') || '';
      if (searchParams.has('kamar_tidur')) kamar_tidur = searchParams.get('kamar_tidur') || '';
      if (searchParams.has('kamar_mandi')) kamar_mandi = searchParams.get('kamar_mandi') || '';
      if (searchParams.has('lt_min')) lt_min = searchParams.get('lt_min') || '';
      if (searchParams.has('lt_max')) lt_max = searchParams.get('lt_max') || '';
      if (searchParams.has('lb_min')) lb_min = searchParams.get('lb_min') || '';
      if (searchParams.has('lb_max')) lb_max = searchParams.get('lb_max') || '';
      if (searchParams.has('surat')) surat = searchParams.get('surat') || '';
      if (searchParams.has('sort')) sort = searchParams.get('sort') || 'terbaru';

      /** @type {Record<string, string>} */
      const paramsObj = {};
      if (tipe) paramsObj.tipe = tipe;
      if (kategori) paramsObj.kategori = kategori;
      if (lokasi) paramsObj.lokasi = lokasi;
      if (q) paramsObj.q = q;
      if (harga_min) paramsObj.harga_min = harga_min;
      if (harga_max) paramsObj.harga_max = harga_max;
      if (kamar_tidur) paramsObj.kamar_tidur = kamar_tidur;
      if (kamar_mandi) paramsObj.kamar_mandi = kamar_mandi;
      if (lt_min) paramsObj.lt_min = lt_min;
      if (lt_max) paramsObj.lt_max = lt_max;
      if (lb_min) paramsObj.lb_min = lb_min;
      if (lb_max) paramsObj.lb_max = lb_max;
      if (surat) paramsObj.surat = surat;
      if (sort && sort !== 'terbaru') paramsObj.sort = sort;

      const qParams = new URLSearchParams(paramsObj).toString();
      
      const res = await apiFetch(`/properti?${qParams}`);
      if (res.properties) {
        properties = res.properties;
        categories = res.categories || [];
        provinces = res.provinces || [];
      } else if (Array.isArray(res)) {
        properties = { data: res, current_page: 1, last_page: 1, total: res.length };
      } else {
        properties = res;
      }
    } catch (e) {
      console.error(e);
    } finally {
      isLoading = false;
    }
  });

  function applyFilter() {
    const params = new URLSearchParams();
    if(tipe) params.set('tipe', tipe);
    if(kategori) params.set('kategori', kategori);
    if(lokasi) params.set('lokasi', lokasi);
    if(q) params.set('q', q);
    if(harga_min) params.set('harga_min', harga_min);
    if(harga_max) params.set('harga_max', harga_max);
    if(kamar_tidur) params.set('kamar_tidur', kamar_tidur);
    if(kamar_mandi) params.set('kamar_mandi', kamar_mandi);
    if(lt_min) params.set('lt_min', lt_min);
    if(lt_max) params.set('lt_max', lt_max);
    if(lb_min) params.set('lb_min', lb_min);
    if(lb_max) params.set('lb_max', lb_max);
    if(surat) params.set('surat', surat);
    if(sort && sort !== 'terbaru') params.set('sort', sort);
    
    navigate(url(`/properti?${params.toString()}`));
    window.location.reload();
  }

  async function handleAiSearch() {
    if (!q.trim()) return;
    isAiLoading = true;
    try {
      const res = await apiFetch("/ai/parse-search", {
        method: "POST",
        body: JSON.stringify({ query: q }),
      });
      
      if (res.filters && Object.keys(res.filters).length > 0) {
        if (res.filters.keywords) q = res.filters.keywords; else q = "";
        if (res.filters.lokasi) lokasi = res.filters.lokasi;
        if (res.filters.kategori) kategori = res.filters.kategori;
        if (res.filters.harga_min) harga_min = String(res.filters.harga_min);
        if (res.filters.harga_max) harga_max = String(res.filters.harga_max);
        if (res.filters.kamar_tidur) kamar_tidur = String(res.filters.kamar_tidur);
        if (res.filters.kamar_mandi) kamar_mandi = String(res.filters.kamar_mandi);
        if (res.filters.lt_min) lt_min = String(res.filters.lt_min);
        if (res.filters.lt_max) lt_max = String(res.filters.lt_max);
        if (res.filters.lb_min) lb_min = String(res.filters.lb_min);
        if (res.filters.lb_max) lb_max = String(res.filters.lb_max);
        if (res.filters.surat) surat = res.filters.surat;
        if (res.filters.tipe) tipe = res.filters.tipe;
      }
      applyFilter();
    } catch (e) {
      console.error(e);
      applyFilter();
    } finally {
      isAiLoading = false;
    }
  }

  /** @param {number} h */
  function formatHarga(h) {
    if (!h) return 'Harga Negosiasi'
    if (h >= 1_000_000_000) return 'Rp ' + (h / 1_000_000_000).toFixed(1).replace('.0','') + ' M'
    if (h >= 1_000_000) return 'Rp ' + Math.round(h / 1_000_000) + ' Jt'
    return 'Rp ' + Number(h).toLocaleString('id-ID')
  }

  const sortOptions = [
    { val: 'terbaru', label: 'Terbaru' },
    { val: 'termurah', label: 'Harga Terendah' },
    { val: 'termahal', label: 'Harga Tertinggi' },
    { val: 'ai_score', label: 'AI Score Terbaik' },
  ]


</script>

<Layout title="Properti">
  <!-- HEADER -->
  <div style="background:var(--text-1);padding:40px 0 48px;position:relative;overflow:hidden">
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 80% 50%,rgba(201,168,76,0.08) 0%,transparent 60%)"></div>
    <div class="container" style="position:relative">
      <div class="section-label" style="color:rgba(201,168,76,0.7)">Real Estate</div>
      <h1 style="font-family:'Playfair Display',serif;font-size:2.2rem;font-weight:800;color:var(--white);margin-bottom:8px">
        Properti Indonesia
      </h1>
      <p style="color:rgba(255,255,255,0.5);font-size:0.9rem">{properties.total || 0} listing tersedia</p>

      <!-- Tipe tabs -->
      <div style="display:flex;gap:8px;margin-top:24px">
        {#each [{val:'',label:'Semua'},{val:'jual',label:'Dijual'},{val:'sewa',label:'Disewa'}] as t}
          <button
            class="filter-chip {tipe === t.val ? 'active' : ''}"
            style="background:{tipe===t.val?'var(--gold)':'rgba(255,255,255,0.08)'};border-color:{tipe===t.val?'var(--gold)':'rgba(255,255,255,0.15)'};color:{tipe===t.val?'var(--text-1)':'rgba(255,255,255,0.7)'}"
            onclick={() => { tipe = t.val; applyFilter() }}
          >{t.label}</button>
        {/each}
      </div>

    </div>
  </div>

  <div class="container" style="padding-top:32px;padding-bottom:64px">
    <div style="display:grid;grid-template-columns:280px 1fr;gap:32px;align-items:start">

      <!-- SIDEBAR FILTER -->
      <aside class="sticky-sidebar">
        <div class="card" style="padding:24px">
          <div style="font-size:1.05rem;font-weight:800;color:var(--text-1);margin-bottom:24px;display:flex;align-items:center;gap:8px">
            🔧 Filter Pencarian
          </div>

          <!-- AI Search Section -->
          <div class="form-group" style="margin-bottom:24px">
            <label class="form-label" for="f-q" style="display:flex;align-items:center;gap:6px;color:var(--gold);margin-bottom:12px;font-weight:800;font-size:0.9rem">
              <span class="material-symbols-rounded" style="font-size:1.3rem">smart_toy</span> AI Property Search
            </label>
            <div style="display:flex;flex-direction:column;gap:8px;">
              <input id="f-q" class="form-input {isAiLoading ? 'ai-loading' : ''}" placeholder='Coba ketik: "Rumah 3 kamar di Bogor budget 2M"' bind:value={q} onkeydown={(e) => { if (e.key === 'Enter') handleAiSearch() }} disabled={isAiLoading} style="font-size:0.85rem; border-color:rgba(201,168,76,0.4);" />
              <button class="btn btn-gold btn-full" onclick={handleAiSearch} disabled={isAiLoading} style="display:flex;align-items:center;justify-content:center;gap:6px;padding:10px;">
                {#if isAiLoading}
                  <span class="material-symbols-rounded ai-spin" style="font-size:1.2rem;animation:spin 1s linear infinite">autorenew</span>
                  <span>Menganalisa...</span>
                {:else}
                  <span class="material-symbols-rounded" style="font-size:1.2rem">search</span>
                  <span>Cari dengan AI</span>
                {/if}
              </button>
            </div>
          </div>

          <div style="width:100%;height:1px;background:rgba(0,0,0,0.06);margin:0 0 20px;"></div>

          <div class="form-group" style="margin-bottom:16px">
            <label class="form-label" for="f-kat">Kategori</label>
            <select id="f-kat" class="form-input form-select" bind:value={kategori}>
              <option value="">Semua Kategori</option>
              {#each categories as cat}
                <option value={cat.slug_kategori_property}>{cat.nama_kategori_property}</option>
              {/each}
            </select>
          </div>

          <div class="form-group" style="margin-bottom:16px">
            <label class="form-label" for="f-lok">Lokasi</label>
            <input id="f-lok" class="form-input" placeholder="Kota, kecamatan..." bind:value={lokasi} />
          </div>

          <div style="margin-bottom:16px">
            <div class="form-label" style="margin-bottom:8px">Rentang Harga</div>
            <div style="display:flex;gap:8px">
              <input class="form-input" placeholder="Min (Jt)" bind:value={harga_min} style="width:50%" />
              <input class="form-input" placeholder="Max (Jt)" bind:value={harga_max} style="width:50%" />
            </div>
          </div>

          <!-- Kamar Tidur & Kamar Mandi -->
          <div style="margin-bottom:16px;display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div>
              <label class="form-label" for="f-kt">K. Tidur</label>
              <select id="f-kt" class="form-input form-select" bind:value={kamar_tidur} style="padding-left:12px">
                <option value="">Bebas</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>
            <div>
              <label class="form-label" for="f-km">K. Mandi</label>
              <select id="f-km" class="form-input form-select" bind:value={kamar_mandi} style="padding-left:12px">
                <option value="">Bebas</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>
          </div>

          <!-- Luas Tanah -->
          <div style="margin-bottom:16px">
            <div class="form-label" style="margin-bottom:8px">Luas Tanah (m²)</div>
            <div style="display:flex;gap:8px">
              <input class="form-input" placeholder="Min" bind:value={lt_min} style="width:50%" />
              <input class="form-input" placeholder="Max" bind:value={lt_max} style="width:50%" />
            </div>
          </div>

          <!-- Luas Bangunan -->
          <div style="margin-bottom:16px">
            <div class="form-label" style="margin-bottom:8px">Luas Bangunan (m²)</div>
            <div style="display:flex;gap:8px">
              <input class="form-input" placeholder="Min" bind:value={lb_min} style="width:50%" />
              <input class="form-input" placeholder="Max" bind:value={lb_max} style="width:50%" />
            </div>
          </div>

          <!-- Sertifikat -->
          <div class="form-group" style="margin-bottom:20px">
            <label class="form-label" for="f-surat">Sertifikat</label>
            <select id="f-surat" class="form-input form-select" bind:value={surat}>
              <option value="">Semua Sertifikat</option>
              <option value="SHM">SHM - Hak Milik</option>
              <option value="HGB">HGB - Hak Guna Bangunan</option>
            </select>
          </div>

          <button class="btn btn-gold btn-full" onclick={applyFilter}>Terapkan Filter</button>

          {#if tipe || kategori || lokasi || q || harga_min || harga_max || kamar_tidur || kamar_mandi || lt_min || lt_max || lb_min || lb_max || surat}
            <button class="btn btn-ghost btn-full" style="margin-top:8px" onclick={() => {
              tipe='';kategori='';lokasi='';q='';harga_min='';harga_max='';
              kamar_tidur='';kamar_mandi='';lt_min='';lt_max='';lb_min='';lb_max='';surat='';
              navigate(url('/properti'))
              window.location.reload()
            }}>× Reset Filter</button>
          {/if}
        </div>

        <!-- KPR Calculator teaser -->
        <div class="card" style="padding:20px;margin-top:16px;background:var(--text-1);border-color:transparent">
          <div style="font-size:0.88rem;font-weight:700;color:var(--gold);margin-bottom:6px">🏦 Kalkulator KPR</div>
          <div style="font-size:0.78rem;color:rgba(255,255,255,0.5);line-height:1.6;margin-bottom:14px">
            Hitung estimasi cicilan bulanan sesuai properti pilihan.
          </div>
          <Link to={url('/kpr-calculator')} class="btn btn-gold btn-sm btn-full">Hitung Sekarang</Link>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <div>
        <!-- Sort Bar -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px">
          <div style="font-size:0.88rem;color:var(--text-2)">
            Menampilkan <strong style="color:var(--text-1)">{properties.data?.length || 0}</strong> dari
            <strong style="color:var(--text-1)">{properties.total || 0}</strong> properti
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:0.82rem;color:var(--text-3)">Urutkan:</span>
            <select class="form-input" style="width:auto;padding:7px 32px 7px 12px;font-size:0.82rem" bind:value={sort} onchange={applyFilter}>
              {#each sortOptions as opt}
                <option value={opt.val}>{opt.label}</option>
              {/each}
            </select>
          </div>
        </div>

        <!-- Property Grid -->
        {#if Object.values(properties?.data || []).length > 0}
          <div class="grid-auto">
            {#each Object.values(properties.data) as prop (prop.id_property)}
              <Link to={url(`/properti/${prop.slug_property}`)} class="prop-card">
                <div class="prop-card-img-wrap">
                  <img
                    class="prop-card-img"
                    src={propertyImg(prop.cover_img)}
                    alt={prop.nama_property}
                    loading="lazy"
                  />
                  <span class="prop-badge {prop.tipe === 'jual' ? 'prop-badge-jual' : 'prop-badge-sewa'}">
                    {prop.tipe === 'jual' ? 'DIJUAL' : 'DISEWA'}
                  </span>
                  {#if prop.score_investasi_ai >= 80}
                    <span class="prop-badge-hot">🔥 HOT</span>
                  {/if}
                </div>
                <div class="prop-card-body">
                  <div class="prop-price">{formatHarga(prop.harga)}
                    {#if prop.tipe === 'sewa'}<span style="font-size:0.7rem;font-weight:400;color:var(--text-3)">/th</span>{/if}
                  </div>
                  <div class="prop-title">{prop.nama_property}</div>
                  <div style="font-size:0.8rem;color:var(--text-3);margin-bottom:14px">
                    {prop.alamat || prop.nama_kabupaten || 'Bogor, Jawa Barat'}
                  </div>
                  <div class="prop-specs">
                    {#if prop.kamar_tidur}<span class="prop-spec">🛏 {prop.kamar_tidur} KT</span>{/if}
                    {#if prop.kamar_mandi}<span class="prop-spec">🚿 {prop.kamar_mandi} KM</span>{/if}
                    {#if prop.lt}<span class="prop-spec">📐 LT {prop.lt}m²</span>{/if}
                    {#if prop.lb}<span class="prop-spec">🏗 LB {prop.lb}m²</span>{/if}
                  </div>
                </div>
              </Link>
            {/each}
          </div>

          <!-- Pagination -->
          {#if properties.last_page > 1}
            <div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-top:40px">
              {#if properties.current_page > 1}
                <Link to={url(`/properti?page=${properties.current_page - 1}`)} class="btn btn-outline btn-sm">← Prev</Link>
              {/if}
              {#each Array.from({length: properties.last_page}, (_,i) => i+1) as page}
                <Link
                  to={url(`/properti?page=${page}`)}
                  class="btn btn-sm {page === properties.current_page ? 'btn-gold' : 'btn-ghost'}"
                  style="min-width:36px"
                >{page}</Link>
              {/each}
              {#if properties.current_page < properties.last_page}
                <Link to={url(`/properti?page=${properties.current_page + 1}`)} class="btn btn-outline btn-sm">Next →</Link>
              {/if}
            </div>
          {/if}

        {:else}
          <div class="card" style="padding:64px;text-align:center">
            <div style="font-size:3rem;margin-bottom:16px">🏠</div>
            <div style="font-size:1.1rem;font-weight:600;color:var(--text-1);margin-bottom:8px">Tidak ada properti ditemukan</div>
            <div style="font-size:0.88rem;color:var(--text-3);margin-bottom:24px">Coba ubah filter pencarian Anda</div>
            <button class="btn btn-gold" onclick={() => { tipe='';kategori='';q=''; navigate(url('/properti')) }}>Reset Pencarian</button>
          </div>
        {/if}
      </div>
    </div>
  </div>
</Layout>
