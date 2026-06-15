<script>
  /**
   * Agent/Preview.svelte
   * Menampilkan preview iklan persis seperti halaman publik (/properti/{slug})
   * dengan banner "MODE PREVIEW" di bagian atas.
   * Import Property/Show.svelte tidak memungkinkan langsung karena perbedaan layout,
   * jadi kita re-render konten serupa dengan banner tambahan.
   */
  import { navigate  } from 'svelte-routing'
  import { url, propertyImg } from '../../lib/url.svelte.js'

  let {
    property = {},
    images   = [],
    agent    = {},
    related  = [],
    banks    = [],
    editUrl  = '',
  } = $props()

  let activeImg  = $state(0)
  let showContact = $state(false)

  // Parse peta map
  let petaMap = $derived.by(() => {
    try {
      if (property.peta_map) return JSON.parse(property.peta_map)
    } catch {}
    return null
  })

  // Parse fasilitas di sekitar (HTML)
  let fasilitasHtml = $derived(property.fasilitas_di_sekitar ?? '')

  // Parse fasilitas dekorasi
  let fasilitasDek = $derived.by(() => {
    try {
      if (!property.fasilitas_dekorasi) return []
      const v = property.fasilitas_dekorasi
      return typeof v === 'string' ? JSON.parse(v) : v
    } catch { return [] }
  })

  // Format harga
  /** @param {number | string} h */
  function formatHarga(h) {
    if (!h) return 'Harga Negosiasi'
    const n = parseFloat(String(h))
    if (n >= 1_000_000_000) return 'Rp ' + (n / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '') + ' Miliar'
    if (n >= 1_000_000)     return 'Rp ' + Math.round(n / 1_000_000).toLocaleString('id-ID') + ' Juta'
    return 'Rp ' + n.toLocaleString('id-ID')
  }

  // Format tipe transaksi
  /** 
   * @param {string} tipe 
   * @param {string} jenisSewa 
   */
  function formatTipe(tipe, jenisSewa) {
    if (tipe === 'jual') return 'Dijual'
    if (jenisSewa) return `Disewa / ${jenisSewa}`
    return 'Disewa'
  }

  // Analisis paragraf  // Split analisis
  let analisisParagraphs = $derived(
    // @ts-ignore
    (property.analisis_property ?? '').split(/\n\n+/).filter(p => p.trim())
  )
</script>

<svelte:head><title>[PREVIEW] {property.nama_property ?? 'Iklan'} — Agent Portal</title></svelte:head>

<!-- ═══════════════ BANNER PREVIEW ═══════════════ -->
<div class="preview-banner">
  <div class="preview-banner-inner">
    <div class="banner-left">
      <span class="material-symbols-rounded" style="font-size:20px">visibility</span>
      <div>
        <div class="banner-title">MODE PREVIEW IKLAN</div>
        <div class="banner-sub">Begini tampilan iklan Anda di halaman publik. Iklan {property.status ? 'sudah aktif' : 'masih draft'}.</div>
      </div>
    </div>
    <div class="banner-actions">
      <a href={editUrl} class="banner-btn-edit">
        <span class="material-symbols-rounded">edit</span>
        Kembali Edit
      </a>
      {#if property.slug_property && property.status}
        <a href={url(`/properti/${property.slug_property}`)} target="_blank" class="banner-btn-live">
          <span class="material-symbols-rounded">open_in_new</span>
          Lihat Halaman Publik
        </a>
      {/if}
    </div>
  </div>
</div>

<!-- ═══════════════ KONTEN PROPERTI (persis halaman publik) ═══════════════ -->
<div class="prop-page">

  <!-- Hero Section -->
  <section class="hero-section">
    <!-- Gallery -->
    <div class="gallery">
      <div class="gallery-main">
        {#if images.length > 0}
          <img
            src={url(`/upload/image/${property.cover_img}`)}
            alt="Cover Property"
            class="gallery-main-img"
            onerror={(e) => /** @type {HTMLImageElement} */(e.currentTarget).src='https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'}
          />
        {:else}
          <div class="gallery-placeholder">
            <span class="material-symbols-rounded">image</span>
            <p>Belum ada foto</p>
          </div>
        {/if}
        <div class="gallery-count">{images.length} Foto</div>
      </div>

      <!-- Thumbnails -->
      {#if images.length > 1}
        <div class="gallery-thumbs">
          {#each images.slice(0, 5) as img, i}
            <button
              class="gallery-thumb {activeImg === i ? 'active' : ''}"
              onclick={() => activeImg = i}
            >
              <img
                class="gallery-thumb-img"
                alt="Foto {i+1}"
                onerror={(e) => /** @type {HTMLImageElement} */(e.currentTarget).src='https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=100&q=60'}
              />
              {#if i === 4 && images.length > 5}
                <div class="thumb-more">+{images.length - 5}</div>
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Info Panel -->
    <div class="info-panel">
      <!-- Badge tipe -->
      <div class="info-badges">
        <span class="badge-tipe {property.tipe === 'jual' ? 'jual' : 'sewa'}">
          {formatTipe(property.tipe, property.jenis_sewa)}
        </span>
        {#if property.surat}
          <span class="badge-surat">{property.surat}</span>
        {/if}
        {#if property.status == 0}
          <span class="badge-draft">DRAFT</span>
        {/if}
      </div>

      <h1 class="prop-title">{property.nama_property ?? '–'}</h1>

      <!-- Lokasi -->
      <div class="prop-lokasi">
        <span class="material-symbols-rounded" style="font-size:16px;color:#C9A84C">location_on</span>
        {[property.nama_kecamatan, property.nama_kabupaten, property.nama_provinsi].filter(Boolean).join(', ') || property.alamat || '–'}
      </div>

      <!-- Harga -->
      <div class="prop-harga">{formatHarga(property.harga)}</div>
      {#if property.tipe === 'sewa' && property.jenis_sewa}
        <div class="prop-sewa-unit">per {property.jenis_sewa?.toLowerCase()}</div>
      {/if}

      <!-- Spesifikasi -->
      <div class="prop-specs">
        {#if property.lt}
          <div class="spec-item">
            <span class="material-symbols-rounded spec-icon">square_foot</span>
            <span class="spec-val">{property.lt} m²</span>
            <span class="spec-lbl">L. Tanah</span>
          </div>
        {/if}
        {#if property.lb}
          <div class="spec-item">
            <span class="material-symbols-rounded spec-icon">home</span>
            <span class="spec-val">{property.lb} m²</span>
            <span class="spec-lbl">L. Bangunan</span>
          </div>
        {/if}
        {#if property.kamar_tidur}
          <div class="spec-item">
            <span class="material-symbols-rounded spec-icon">bed</span>
            <span class="spec-val">{property.kamar_tidur}</span>
            <span class="spec-lbl">K. Tidur</span>
          </div>
        {/if}
        {#if property.kamar_mandi}
          <div class="spec-item">
            <span class="material-symbols-rounded spec-icon">bathtub</span>
            <span class="spec-val">{property.kamar_mandi}</span>
            <span class="spec-lbl">K. Mandi</span>
          </div>
        {/if}
        {#if property.lantai}
          <div class="spec-item">
            <span class="material-symbols-rounded spec-icon">stairs</span>
            <span class="spec-val">{property.lantai}</span>
            <span class="spec-lbl">Lantai</span>
          </div>
        {/if}
      </div>

      <!-- Agent Card -->
      <div class="agent-card">
        <div class="agent-avatar">
          {#if agent.gambar}
            <img src={url(`/upload/staff/${agent.gambar}`)} alt={agent.nama_staff} onerror={(e) => /** @type {HTMLImageElement} */(e.currentTarget).src=`https://ui-avatars.com/api/?name=${agent.nama_staff}&background=C9A84C&color=fff`} />
          {:else}
            <div class="agent-avatar-ph">
              <span class="material-symbols-rounded">person</span>
            </div>
          {/if}
        </div>
        <div class="agent-info">
          <div class="agent-name">{agent.nama_staff ?? '–'}</div>
          <div class="agent-jabatan">{agent.jabatan ?? 'Property Agent'}</div>
        </div>
        <div class="agent-contacts">
          {#if agent.whatsapp}
            <a href="https://wa.me/{agent.whatsapp?.replace(/\D/g,'')}" target="_blank" class="contact-btn wa">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
          {/if}
        </div>
      </div>
    </div>
  </section>

  <!-- Body -->
  <div class="prop-body">

    <!-- AI Insight Score -->
    {#if property.score_investasi_ai}
      <div class="ai-insight-card">
        <div class="ai-insight-header">
          <span class="material-symbols-rounded" style="font-size:22px;color:#7C3AED;font-variation-settings:'FILL' 1">auto_awesome</span>
          <div>
            <div class="ai-insight-title">Cerdas AI Insight</div>
            <div class="ai-insight-label">{property.label_investasi_ai ?? 'Analisis Investasi'}</div>
          </div>
          <div class="ai-score-circle" style="--score:{property.score_investasi_ai}">
            <svg viewBox="0 0 36 36" class="ai-score-svg">
              <path class="ai-score-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path class="ai-score-fill" stroke-dasharray="{property.score_investasi_ai}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <text x="18" y="20.35" class="ai-score-num">{property.score_investasi_ai}</text>
            </svg>
          </div>
        </div>

        {#if analisisParagraphs.length > 0}
          <div class="ai-analisis">
            {#each analisisParagraphs as par}
              <p class="ai-par">{par}</p>
            {/each}
          </div>
        {/if}

        {#if property.trend_harga}
          <div class="trend-badge">
            <span class="material-symbols-rounded" style="font-size:14px">trending_up</span>
            {property.trend_harga}
          </div>
        {/if}
      </div>
    {/if}

    <!-- Deskripsi -->
    {#if property.isi}
      <div class="content-section">
        <h2 class="content-title">Deskripsi</h2>
        <div class="prop-desc">{@html property.isi}</div>
      </div>
    {/if}

    <!-- Fasilitas Interior -->
    {#if fasilitasDek.length > 0}
      <div class="content-section">
        <h2 class="content-title">Fasilitas Interior</h2>
        <div class="fasilitas-chips">
          {#each fasilitasDek as f}
            <span class="fasilitas-chip">{f}</span>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Fasilitas di Sekitar -->
    {#if fasilitasHtml}
      <div class="content-section">
        <h2 class="content-title">
          <span class="material-symbols-rounded" style="font-size:20px;color:#C9A84C;font-variation-settings:'FILL' 1">place</span>
          Fasilitas di Sekitar
        </h2>
        <div class="fasilitas-html">{@html fasilitasHtml}</div>
      </div>
    {/if}

    <!-- Peta Lokasi -->
    {#if petaMap?.latitude && petaMap?.longitude}
      <div class="content-section">
        <h2 class="content-title">
          <span class="material-symbols-rounded" style="font-size:20px;color:#C9A84C;font-variation-settings:'FILL' 1">map</span>
          Peta Lokasi
          {#if petaMap.custom}
            <span class="custom-peta-badge">Koordinat Agen</span>
          {/if}
        </h2>
        <div class="map-embed-wrap">
          <iframe
            width="100%"
            height="380"
            style="border:0;border-radius:14px"
            loading="lazy"
            allowfullscreen
            src="https://maps.google.com/maps?q={petaMap.latitude},{petaMap.longitude}&z=16&output=embed"
            title="Peta Lokasi {property.nama_property}"
          ></iframe>
        </div>
        <a
          href="https://maps.google.com/?q={petaMap.latitude},{petaMap.longitude}"
          target="_blank"
          class="open-maps-link"
        >
          <span class="material-symbols-rounded" style="font-size:14px">open_in_new</span>
          Buka di Google Maps
        </a>
      </div>
    {/if}

    <!-- Alamat -->
    <div class="content-section">
      <h2 class="content-title">Alamat</h2>
      <p class="prop-alamat">{property.alamat ?? '–'}</p>
      <p class="prop-alamat" style="color:#9CA3AF;font-size:0.85rem">
        {[property.nama_kecamatan, property.nama_kabupaten, property.nama_provinsi].filter(Boolean).join(', ')}
      </p>
    </div>
  </div>

</div>

<style>
  /* ─── Preview Banner ─────────────────────────────── */
  .preview-banner {
    background: linear-gradient(135deg, #FFF9C4, #FFF3A3);
    border-bottom: 2px solid #F9D900;
    position: sticky;
    top: 0;
    z-index: 200;
  }
  .preview-banner-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 12px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }
  .banner-left {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #78640A;
  }
  .banner-title {
    font-weight: 800;
    font-size: 0.88rem;
    letter-spacing: 0.5px;
    color: #5C4A00;
  }
  .banner-sub { font-size: 0.78rem; color: #7B6014; }
  .banner-actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .banner-btn-edit {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 7px 14px;
    border-radius: 8px;
    background: rgba(0,0,0,0.08);
    color: #5C4A00;
    font-size: 0.82rem;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.2s;
  }
  .banner-btn-edit:hover { background: rgba(0,0,0,0.15); }
  .banner-btn-live {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 7px 14px;
    border-radius: 8px;
    background: #2563EB;
    color: white;
    font-size: 0.82rem;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.2s;
  }
  .banner-btn-live:hover { background: #1D4ED8; }
  .banner-btn-edit .material-symbols-rounded,
  .banner-btn-live .material-symbols-rounded { font-size: 15px; }

  /* ─── Page Layout ─────────────────────────────────── */
  :global(body) { margin: 0; font-family: 'Inter', sans-serif; background: #FAF8F5; }
  .prop-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 28px 24px 60px;
  }

  /* ─── Hero Section ────────────────────────────────── */
  .hero-section {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 24px;
    margin-bottom: 32px;
  }

  /* Gallery */
  .gallery-main {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    aspect-ratio: 16/9;
    background: #F0EAE0;
  }
  .gallery-main-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .gallery-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #B8A882;
  }
  .gallery-placeholder .material-symbols-rounded { font-size: 48px; }
  .gallery-count {
    position: absolute;
    bottom: 12px;
    right: 12px;
    background: rgba(0,0,0,0.55);
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 20px;
    backdrop-filter: blur(4px);
  }
  .gallery-thumbs {
    display: flex;
    gap: 8px;
    margin-top: 10px;
    overflow-x: auto;
  }
  .gallery-thumb {
    width: 80px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    border: 2.5px solid transparent;
    cursor: pointer;
    flex-shrink: 0;
    padding: 0;
    position: relative;
    transition: border-color 0.2s;
  }
  .gallery-thumb.active { border-color: #C9A84C; }
  .gallery-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .thumb-more {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.55);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 700;
  }

  /* Info Panel */
  .info-panel {
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #E8E0D0;
    padding: 24px;
    height: fit-content;
    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  }
  .info-badges { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
  .badge-tipe {
    font-size: 0.72rem;
    font-weight: 800;
    padding: 4px 10px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .badge-tipe.jual { background: #FEF3C7; color: #92400E; }
  .badge-tipe.sewa { background: #EDE9FE; color: #5B21B6; }
  .badge-surat {
    font-size: 0.72rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 6px;
    background: #DCFCE7;
    color: #166534;
    text-transform: uppercase;
  }
  .badge-draft {
    font-size: 0.72rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 6px;
    background: #FEF2F2;
    color: #B91C1C;
    text-transform: uppercase;
  }

  .prop-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.2rem;
    font-weight: 700;
    color: #1A1A1A;
    margin: 0 0 10px;
    line-height: 1.35;
  }
  .prop-lokasi {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.82rem;
    color: #6B6B6B;
    margin-bottom: 16px;
  }
  .prop-harga {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    font-weight: 800;
    color: #C9A84C;
    margin-bottom: 4px;
  }
  .prop-sewa-unit { font-size: 0.78rem; color: #9CA3AF; margin-bottom: 16px; }

  /* Specs */
  .prop-specs {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
    padding: 14px;
    background: #FAF8F5;
    border-radius: 12px;
  }
  .spec-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    min-width: 52px;
  }
  .spec-icon {
    font-size: 18px;
    color: #C9A84C;
    font-variation-settings: 'FILL' 1;
  }
  .spec-val { font-size: 0.9rem; font-weight: 700; color: #1A1A1A; }
  .spec-lbl { font-size: 0.65rem; color: #9CA3AF; text-align: center; }

  /* Agent Card */
  .agent-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    background: linear-gradient(135deg, #FDF6E4, #FBF0CC);
    border-radius: 12px;
    border: 1px solid #E8C87A;
  }
  .agent-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    border: 2px solid #C9A84C;
  }
  .agent-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .agent-avatar-ph {
    width: 100%;
    height: 100%;
    background: #E8C87A;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8B6914;
  }
  .agent-avatar-ph .material-symbols-rounded { font-size: 22px; }
  .agent-name    { font-weight: 700; font-size: 0.88rem; color: #1A1A1A; }
  .agent-jabatan { font-size: 0.75rem; color: #9CA3AF; }
  .agent-contacts { margin-left: auto; }
  .contact-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 7px 14px;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 700;
    text-decoration: none;
    transition: all 0.2s;
  }
  .contact-btn.wa {
    background: #25D366;
    color: white;
  }
  .contact-btn.wa:hover { background: #1ead53; }

  /* ─── Body ──────────────────────────────────────── */
  .prop-body { display: flex; flex-direction: column; gap: 20px; }

  /* AI Insight */
  .ai-insight-card {
    background: linear-gradient(135deg, #F5F3FF, #EDE9FE);
    border: 1px solid #DDD6FE;
    border-radius: 16px;
    padding: 20px;
  }
  .ai-insight-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }
  .ai-insight-title { font-weight: 800; font-size: 0.95rem; color: #4C1D95; }
  .ai-insight-label { font-size: 0.78rem; color: #7C3AED; }
  .ai-score-circle {
    margin-left: auto;
    width: 64px;
    height: 64px;
    flex-shrink: 0;
  }
  .ai-score-svg { width: 100%; height: 100%; }
  .ai-score-bg  { fill: none; stroke: #DDD6FE; stroke-width: 3.5; }
  .ai-score-fill {
    fill: none;
    stroke: #7C3AED;
    stroke-width: 3.5;
    stroke-linecap: round;
    transform-origin: center;
    transform: rotate(-90deg);
    transition: stroke-dasharray 1s ease;
  }
  .ai-score-num {
    fill: #4C1D95;
    font-size: 10px;
    font-weight: 800;
    text-anchor: middle;
    font-family: 'Inter', sans-serif;
  }
  .ai-analisis { border-top: 1px solid #DDD6FE; padding-top: 14px; }
  .ai-par {
    font-size: 0.88rem;
    color: #4C1D95;
    line-height: 1.75;
    margin: 0 0 12px;
  }
  .ai-par:last-child { margin-bottom: 0; }
  .trend-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-top: 10px;
    padding: 5px 12px;
    background: rgba(124, 58, 237, 0.12);
    color: #7C3AED;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 700;
  }

  /* Sections */
  .content-section {
    background: #ffffff;
    border-radius: 14px;
    border: 1px solid #E8E0D0;
    padding: 20px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  }
  .content-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Playfair Display', serif;
    font-size: 1.05rem;
    font-weight: 700;
    color: #1A1A1A;
    margin: 0 0 14px;
  }

  .prop-desc { font-size: 0.9rem; color: #4A4A4A; line-height: 1.75; }
  .prop-alamat { font-size: 0.9rem; color: #4A4A4A; margin: 0 0 4px; }

  .fasilitas-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .fasilitas-chip {
    padding: 5px 12px;
    background: #FDF6E4;
    border: 1px solid #E8C87A;
    border-radius: 20px;
    font-size: 0.8rem;
    color: #8B6914;
    font-weight: 500;
  }

  .fasilitas-html :global(ul) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 6px;
    padding: 0;
    list-style: none;
    margin: 0;
  }
  .fasilitas-html :global(li) {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.84rem;
    color: #4A4A4A;
    padding: 6px 10px;
    background: #FAF8F5;
    border-radius: 8px;
    border: 1px solid #EFE8DA;
  }

  .map-embed-wrap {
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid #E8E0D0;
  }

  .open-maps-link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-top: 10px;
    font-size: 0.8rem;
    font-weight: 600;
    color: #2563EB;
    text-decoration: none;
  }
  .open-maps-link:hover { text-decoration: underline; }

  .custom-peta-badge {
    font-size: 0.68rem;
    font-weight: 700;
    padding: 2px 8px;
    background: #FDF6E4;
    border: 1px solid #C9A84C;
    color: #8B6914;
    border-radius: 20px;
  }

  /* ─── Responsive ─────────────────────────────────── */
  @media (max-width: 900px) {
    .hero-section {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 640px) {
    .prop-page { padding: 16px 14px 40px; }
    .preview-banner-inner { padding: 10px 16px; }
    .banner-actions { width: 100%; }
  }
</style>
