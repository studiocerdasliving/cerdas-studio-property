<script>
  import AgentLayout from '../../../components/AgentLayout.svelte'
  import { url, propertyImg } from '../../../lib/url.svelte.js'

  let {
    stats         = {},
    iklan_terbaru = [],
    staff         = null,
    flash         = null,
    flash_type    = null,
  } = $props()

  /** @param {any} h */
  function formatHarga(h) {
    if (!h) return '–'
    const n = parseFloat(h)
    if (n >= 1_000_000_000) return 'Rp ' + (n / 1_000_000_000).toFixed(n % 1_000_000_000 === 0 ? 0 : 2) + ' M'
    if (n >= 1_000_000)     return 'Rp ' + (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + ' Jt'
    return 'Rp ' + n.toLocaleString('id-ID')
  }

  /** @param {any} d */
  function formatTanggal(d) {
    if (!d) return '–'
    return new Date(d).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' })
  }

  let showFlash = $state(true)
  $effect(() => {
    if (flash) {
      showFlash = true
      const t = setTimeout(() => showFlash = false, 5000)
      return () => clearTimeout(t)
    }
  })

  let kuotaPct = $derived(
    stats.kuota_total > 0
      ? Math.max(0, Math.min(100, (stats.kuota_sisa / stats.kuota_total) * 100))
      : 0
  )
</script>

<svelte:head><title>Dashboard Agent — Cerdas Living</title></svelte:head>

<AgentLayout title="Dashboard">
  <!-- Flash notification -->
  {#if flash && showFlash}
    <div class="flash {flash_type === 'error' ? 'flash-error' : 'flash-success'}">
      <span class="material-symbols-rounded">{flash_type === 'error' ? 'error' : 'check_circle'}</span>
      <span>{flash}</span>
      <button onclick={() => showFlash = false} class="flash-close">
        <span class="material-symbols-rounded">close</span>
      </button>
    </div>
  {/if}

  <!-- Greeting -->
  <div class="greeting">
    <div>
      <h1 class="greeting-title">
        Selamat datang, {staff?.nama_staff ?? 'Agent'}! 👋
      </h1>
      <p class="greeting-sub">
        Kelola iklan properti dan pantau performa Anda di sini.
      </p>
    </div>
    <a href={url('/agent/iklan/tambah')} class="btn-primary">
      <span class="material-symbols-rounded">add</span>
      Pasang Iklan Baru
    </a>
  </div>

  <!-- ═══ STAT CARDS ═══ -->
  <div class="stat-grid">
    <div class="stat-card" style="--accent:#C9A84C">
      <div class="stat-icon" style="background:#FDF6E4;color:#C9A84C">
        <span class="material-symbols-rounded">campaign</span>
      </div>
      <div class="stat-body">
        <div class="stat-val">{stats.total_iklan ?? 0}</div>
        <div class="stat-label">Total Iklan</div>
      </div>
    </div>

    <div class="stat-card" style="--accent:#16A34A">
      <div class="stat-icon" style="background:#F0FDF4;color:#16A34A">
        <span class="material-symbols-rounded">verified</span>
      </div>
      <div class="stat-body">
        <div class="stat-val">{stats.iklan_aktif ?? 0}</div>
        <div class="stat-label">Iklan Aktif</div>
      </div>
    </div>

    <div class="stat-card" style="--accent:#DC2626">
      <div class="stat-icon" style="background:#FEF2F2;color:#DC2626">
        <span class="material-symbols-rounded">pause_circle</span>
      </div>
      <div class="stat-body">
        <div class="stat-val">{stats.iklan_nonaktif ?? 0}</div>
        <div class="stat-label">Non-aktif</div>
      </div>
    </div>

    <div class="stat-card" style="--accent:#7C3AED">
      <div class="stat-icon" style="background:#F5F3FF;color:#7C3AED">
        <span class="material-symbols-rounded">auto_awesome</span>
      </div>
      <div class="stat-body">
        <div class="stat-val">{stats.avg_ai_score ? stats.avg_ai_score + '/100' : '–'}</div>
        <div class="stat-label">Rata-rata AI Score</div>
      </div>
    </div>
  </div>

  <!-- ═══ KUOTA CARD ═══ -->
  <div class="kuota-card">
    <div class="kuota-header">
      <div class="kuota-title">
        <span class="material-symbols-rounded" style="color:#C9A84C;font-size:20px">workspace_premium</span>
        Kuota Iklan
      </div>
      <div class="kuota-nums">
        <span class="kuota-sisa">{stats.kuota_sisa ?? 0}</span>
        <span class="kuota-sep">/ {stats.kuota_total ?? 0}</span>
        <span class="kuota-unit">tersisa</span>
      </div>
    </div>
    <div class="kuota-bar-wrap">
      <div class="kuota-bar-track">
        <div
          class="kuota-bar-fill {kuotaPct < 20 ? 'low' : ''}"
          style="width:{kuotaPct}%"
        ></div>
      </div>
      <span class="kuota-pct">{Math.round(kuotaPct)}%</span>
    </div>
    {#if (stats.kuota_sisa ?? 0) <= 0}
      <p class="kuota-warning">
        <span class="material-symbols-rounded" style="font-size:15px">warning</span>
        Kuota iklan habis. Hubungi admin untuk penambahan kuota.
      </p>
    {:else if (stats.kuota_sisa ?? 0) <= 2}
      <p class="kuota-warning kuota-caution">
        <span class="material-symbols-rounded" style="font-size:15px">info</span>
        Kuota iklan tersisa sedikit. Segera hubungi admin.
      </p>
    {/if}
  </div>

  <!-- ═══ IKLAN TERBARU ═══ -->
  <div class="section-card">
    <div class="section-header">
      <h2 class="section-title">
        <span class="material-symbols-rounded">history</span>
        Iklan Terbaru
      </h2>
      <a href={url('/agent/iklan')} class="btn-secondary">
        Lihat Semua
        <span class="material-symbols-rounded" style="font-size:16px">arrow_forward</span>
      </a>
    </div>

    {#if iklan_terbaru.length === 0}
      <div class="empty-state">
        <span class="material-symbols-rounded" style="font-size:48px;color:#D4C5A0">home</span>
        <p>Belum ada iklan. <a href={url('/agent/iklan/tambah')} class="link-gold">Pasang iklan pertama Anda!</a></p>
      </div>
    {:else}
      <div class="iklan-list">
        {#each iklan_terbaru as item}
          <div class="iklan-row">
            <!-- Foto -->
            <div class="iklan-photo">
              <img
                src={propertyImg(item.cover_img)}
                alt={item.nama_property}
                onerror={(e) => /** @type {HTMLImageElement} */(e.currentTarget).src='https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=80&q=60'}
              />
            </div>

            <!-- Info -->
            <div class="iklan-info">
              <div class="iklan-name">{item.nama_property}</div>
              <div class="iklan-meta">
                <span class="badge {item.tipe === 'jual' ? 'badge-jual' : 'badge-sewa'}">
                  {item.tipe === 'jual' ? 'Dijual' : 'Disewa'}
                </span>
                <span class="iklan-harga">{formatHarga(item.harga)}</span>
              </div>
              <div class="iklan-date">{formatTanggal(item.tanggal)}</div>
            </div>

            <!-- Status & AI -->
            <div class="iklan-right">
              {#if item.score_investasi_ai}
                <div class="ai-score">
                  <span class="material-symbols-rounded" style="font-size:13px;color:#7C3AED">auto_awesome</span>
                  <span class="ai-num">{item.score_investasi_ai}</span>
                </div>
              {/if}
              <div class="status-badge {item.status ? 'status-aktif' : 'status-off'}">
                {item.status ? 'Aktif' : 'Non-aktif'}
              </div>
            </div>

            <!-- Aksi -->
            <div class="iklan-aksi">
              <a href={url(`/agent/iklan/${item.id_property}/preview`)} target="_blank" class="aksi-btn" title="Preview">
                <span class="material-symbols-rounded">visibility</span>
              </a>
              <a href={url(`/agent/iklan/${item.id_property}/edit`)} class="aksi-btn" title="Edit">
                <span class="material-symbols-rounded">edit</span>
              </a>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Quick actions -->
  <div class="quick-actions">
    <a href={url('/agent/iklan/tambah')} class="quick-card">
      <span class="material-symbols-rounded quick-icon" style="color:#C9A84C">add_home</span>
      <div class="quick-label">Pasang Iklan Baru</div>
      <div class="quick-sub">Tambah properti untuk dijual/disewa</div>
    </a>
    <a href={url('/agent/iklan')} class="quick-card">
      <span class="material-symbols-rounded quick-icon" style="color:#7C3AED">list_alt</span>
      <div class="quick-label">Kelola Semua Iklan</div>
      <div class="quick-sub">Edit, hapus, atau ubah status iklan</div>
    </a>
    <a href={url('/agent/profil')} class="quick-card">
      <span class="material-symbols-rounded quick-icon" style="color:#16A34A">manage_accounts</span>
      <div class="quick-label">Perbarui Profil</div>
      <div class="quick-sub">Foto, nomor WA, dan info agen</div>
    </a>
  </div>
</AgentLayout>

<style>
  /* ─── Greeting ───────────────────────────────── */
  .greeting {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 24px;
  }
  .greeting-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1A1A1A;
    margin: 0 0 4px;
  }
  .greeting-sub { font-size: 0.9rem; color: #6B6B6B; margin: 0; }

  .btn-primary {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    background: linear-gradient(135deg, #C9A84C, #E0B850);
    color: white;
    border-radius: 12px;
    font-size: 0.88rem;
    font-weight: 700;
    text-decoration: none;
    box-shadow: 0 4px 12px rgba(201,168,76,0.3);
    transition: all 0.2s;
    white-space: nowrap;
  }
  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(201,168,76,0.4);
  }
  .btn-primary .material-symbols-rounded { font-size: 18px; }

  /* ─── Flash ──────────────────────────────────── */
  .flash {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-radius: 12px;
    margin-bottom: 20px;
    font-size: 0.88rem;
    font-weight: 500;
    animation: slideDown 0.3s ease;
  }
  .flash .material-symbols-rounded { font-size: 18px; }
  .flash-error   { background: #FEF2F2; color: #B91C1C; border: 1px solid #FECACA; }
  .flash-success { background: #F0FDF4; color: #166534; border: 1px solid #BBF7D0; }
  .flash-close {
    margin-left: auto;
    background: none;
    border: none;
    cursor: pointer;
    color: inherit;
    opacity: 0.6;
    padding: 0;
    display: flex;
  }
  .flash-close .material-symbols-rounded { font-size: 16px; }

  /* ─── Stat Grid ──────────────────────────────── */
  .stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }
  .stat-card {
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    border-top: 3px solid var(--accent);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  }
  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .stat-icon .material-symbols-rounded {
    font-size: 24px;
    font-variation-settings: 'FILL' 1;
  }
  .stat-val {
    font-size: 1.6rem;
    font-weight: 800;
    color: #1A1A1A;
    line-height: 1;
    font-family: 'Playfair Display', serif;
  }
  .stat-label { font-size: 0.78rem; color: #6B6B6B; margin-top: 4px; font-weight: 500; }

  /* ─── Kuota Card ─────────────────────────────── */
  .kuota-card {
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }
  .kuota-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .kuota-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 0.9rem;
    color: #4A4A4A;
  }
  .kuota-nums { display: flex; align-items: baseline; gap: 4px; }
  .kuota-sisa { font-size: 1.6rem; font-weight: 800; color: #1A1A1A; }
  .kuota-sep  { font-size: 0.9rem; color: #9CA3AF; }
  .kuota-unit { font-size: 0.78rem; color: #9CA3AF; }
  .kuota-bar-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .kuota-bar-track {
    flex: 1;
    height: 8px;
    background: #F0EAE0;
    border-radius: 99px;
    overflow: hidden;
  }
  .kuota-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #C9A84C, #E8C87A);
    border-radius: 99px;
    transition: width 1s ease;
  }
  .kuota-bar-fill.low { background: linear-gradient(90deg, #DC2626, #EF4444); }
  .kuota-pct { font-size: 0.8rem; font-weight: 600; color: #6B6B6B; min-width: 36px; text-align: right; }
  .kuota-warning {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 10px 0 0;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 0.8rem;
    background: #FEF2F2;
    color: #B91C1C;
  }
  .kuota-warning.kuota-caution { background: #FFFBEB; color: #92400E; }

  /* ─── Section Card ───────────────────────────── */
  .section-card {
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1rem;
    font-weight: 700;
    color: #1A1A1A;
    margin: 0;
  }
  .section-title .material-symbols-rounded { font-size: 20px; color: #C9A84C; font-variation-settings: 'FILL' 1; }
  .btn-secondary {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.82rem;
    font-weight: 600;
    color: #475569;
    text-decoration: none;
    padding: 6px 12px;
    border-radius: 8px;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    transition: all 0.2s;
  }
  .btn-secondary:hover { background: #f8fafc; border-color: #94a3b8; }

  /* ─── Iklan List ─────────────────────────────── */
  .iklan-list { display: flex; flex-direction: column; gap: 12px; }

  .iklan-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px;
    border-radius: 12px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    transition: background 0.2s, box-shadow 0.2s;
  }
  .iklan-row:hover { background: #f8fafc; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }

  .iklan-photo {
    width: 60px;
    height: 50px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
  }
  .iklan-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .iklan-info { flex: 1; min-width: 0; }
  .iklan-name {
    font-size: 0.88rem;
    font-weight: 600;
    color: #1A1A1A;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 280px;
  }
  .iklan-meta { display: flex; align-items: center; gap: 8px; margin: 3px 0; }
  .badge {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .badge-jual { background: #FEF3C7; color: #92400E; }
  .badge-sewa { background: #EDE9FE; color: #5B21B6; }
  .iklan-harga { font-size: 0.85rem; font-weight: 600; color: #C9A84C; }
  .iklan-date  { font-size: 0.75rem; color: #9CA3AF; }

  .iklan-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    flex-shrink: 0;
  }
  .ai-score {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.78rem;
    font-weight: 700;
    color: #7C3AED;
  }
  .ai-num { font-size: 0.85rem; }
  .status-badge {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 6px;
    text-transform: uppercase;
  }
  .status-aktif { background: #DCFCE7; color: #166534; }
  .status-off   { background: #F3F4F6; color: #6B7280; }

  .iklan-aksi {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }
  .aksi-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    text-decoration: none;
    transition: all 0.2s;
  }
  .aksi-btn:hover { color: #1e293b; border-color: #cbd5e1; background: #e2e8f0; }
  .aksi-btn .material-symbols-rounded { font-size: 16px; }

  /* ─── Empty state ────────────────────────────── */
  .empty-state {
    text-align: center;
    padding: 32px;
    color: #9CA3AF;
    font-size: 0.9rem;
  }
  .link-gold { color: #C9A84C; font-weight: 600; }

  /* ─── Quick Actions ──────────────────────────── */
  .quick-actions {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
  .quick-card {
    background: #ffffff;
    border-radius: 14px;
    border: 1px solid #e2e8f0;
    padding: 18px;
    text-decoration: none;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    gap: 6px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }
  .quick-card:hover {
    border-color: #C9A84C;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(201,168,76,0.12);
  }
  .quick-icon { font-size: 28px; font-variation-settings: 'FILL' 1; }
  .quick-label { font-size: 0.88rem; font-weight: 700; color: #1A1A1A; }
  .quick-sub   { font-size: 0.78rem; color: #9CA3AF; }

  /* ─── Responsive ─────────────────────────────── */
  @media (max-width: 1024px) {
    .stat-grid { grid-template-columns: repeat(2, 1fr); }
    .quick-actions { grid-template-columns: repeat(2, 1fr); }
    .iklan-name { max-width: 180px; }
  }
  @media (max-width: 640px) {
    .stat-grid { grid-template-columns: 1fr 1fr; }
    .quick-actions { grid-template-columns: 1fr; }
    .greeting { flex-direction: column; align-items: stretch; }
    .btn-primary { justify-content: center; }
    .iklan-row { flex-wrap: wrap; }
    .iklan-info { min-width: 100%; order: 3; margin-top: 8px; }
    .iklan-right { flex-direction: row; align-items: center; justify-content: space-between; flex: 1; }
    .iklan-aksi { margin-left: auto; }
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
</style>
