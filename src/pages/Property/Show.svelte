<script>
  import Layout from '../../components/Layout.svelte'
  import { Link, navigate  } from 'svelte-routing'
  import { url, propertyImg } from '../../lib/url.svelte.js'
  import { apiFetch } from '../../lib/api.js'
  import { onMount } from 'svelte'

  let { slug = "" } = $props()

  /** @type {any} */
  let property = $state({})
  /** @type {any[]} */
  let images = $state([])
  /** @type {any} */
  let agent = $state({})
  /** @type {any[]} */
  let related = $state([])
  /** @type {any[]} */
  let banks = $state([])
  let isLoading = $state(true)

  $effect(() => {
    if (slug) {
      loadData();
    }
  });

  async function loadData() {
    isLoading = true;
    try {
      const res = await apiFetch(`/properti/${slug}`);
      property = res.property;
      images = res.images || [];
      agent = res.agent || {};
      related = res.related || [];
      banks = res.banks || [];
      
      // Auto assign Bank default if available
      if (selectedBankId === null && banks && banks.length > 0) {
        selectedBankId = banks[0].id;
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error(e);
    } finally {
      isLoading = false;
    }
  }

  let isGeneratingAI = $state(false);
  let isGeneratingFasilitas = $state(false);
  let isGeneratingMap = $state(false);

  async function generateAIInsight() {
    isGeneratingAI = true;
    try {
      await apiFetch(`/ai/property/${property.id_property}/analyze`, {
        method: 'POST'
      });
      // In Svelte SPA we would re-fetch the property here instead of router.reload
      // For now, reload window
      window.location.reload();
    } catch (e) { console.error(e); } finally { isGeneratingAI = false; }
  }

  async function generateFasilitas() {
    isGeneratingFasilitas = true;
    try {
      await apiFetch(`/ai/property/${property.id_property}/facilities`);
      window.location.reload();
    } catch (e) { console.error(e); } finally { isGeneratingFasilitas = false; }
  }

  let rating = $state(5);
  let title = $state('');
  let testimonial = $state('');
  let isSubmittingTestimoni = $state(false);

  /** @param {Event} e */
  async function submitTestimoni(e) {
    e.preventDefault();
    isSubmittingTestimoni = true;
    try {
      await apiFetch(`/properti/${property.id_property}/testimoni`, {
        method: 'POST',
        body: JSON.stringify({
          rating: parseInt(rating.toString()),
          title: title,
          testimonial: testimonial,
          nama: contactName || 'Pengunjung', // Provide default
        })
      });
      alert('Ulasan berhasil dikirim!');
      rating = 5; title = ''; testimonial = '';
    } catch (err) {
      const error = /** @type {Error} */ (err);
      alert(error.message || 'Gagal mengirim ulasan');
    } finally {
      isSubmittingTestimoni = false;
    }
  }

  async function generateMap() {
    isGeneratingMap = true;
    try {
      await apiFetch(`/ai/property/${property.id_property}/map`, {
        method: 'POST'
      });
      window.location.reload();
    } catch (e) { console.error(e); } finally { isGeneratingMap = false; }
  }

  let activeImg = $state(0)
  let showContact = $state(false)
  let showKPR = $state(false)

  // KPR Calculator
  /** @type {any} */
  let selectedBankId = $state(null);
  // Effect handled in loadData for selectedBankId
  // Remove the old $effect that conflicts with state reset
  /** @type {any} */
  let selectedBank = $derived(banks.find((/** @type {any} */ b) => b.id == selectedBankId));
  let dp = $state(30);
  let tenor = $state(15);
  let rateType = $state('fixed_3y');

  // Reactivity to update DP/Tenor constraints when bank changes
  $effect(() => {
    if (selectedBank) {
      if (dp < selectedBank.min_dp_persen) dp = selectedBank.min_dp_persen;
      if (tenor > selectedBank.max_tenor) tenor = selectedBank.max_tenor;
    }
  });

  let bunga = $derived.by(() => {
    if (!selectedBank) return 9.5;
    if (rateType === 'fixed_1y') return parseFloat(selectedBank.bunga_fixed_1y);
    if (rateType === 'fixed_3y') return parseFloat(selectedBank.bunga_fixed_3y);
    if (rateType === 'fixed_5y') return parseFloat(selectedBank.bunga_fixed_5y);
    return parseFloat(selectedBank.bunga_floating);
  });

  /** @param {number} h */
  function formatHarga(h) {
    if (!h) return 'Harga Negosiasi'
    if (h >= 1_000_000_000) return 'Rp ' + (h / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '') + ' Miliar'
    if (h >= 1_000_000) return 'Rp ' + Math.round(h / 1_000_000).toLocaleString('id-ID') + ' Juta'
    return 'Rp ' + Number(h).toLocaleString('id-ID')
  }

  /**
   * @param {number} harga 
   * @param {number} dpPct 
   * @param {number} tenorTh 
   * @param {number} bungaPct 
   */
  function hitungKPR(harga, dpPct, tenorTh, bungaPct) {
    const pinjaman = harga * (1 - dpPct / 100)
    const bBulan = bungaPct / 100 / 12
    const n = tenorTh * 12
    const cicilan = pinjaman * (bBulan * Math.pow(1 + bBulan, n)) / (Math.pow(1 + bBulan, n) - 1)
    return isNaN(cicilan) ? 0 : Math.round(cicilan)
  }

  let cicilan = $derived(hitungKPR(property.harga || 0, dp, tenor, bunga))

  // Contact Form
  let contactName = $state('');
  let contactPhone = $state('');
  let contactMsg = $state('');
  $effect(() => {
    if (property.nama_property && !contactMsg) {
      contactMsg = `Halo, saya tertarik dengan ${property.nama_property}`;
    }
  });

  let fasilitas = $derived.by(() => {
    try { return JSON.parse(property.fasilitas_dekorasi || '[]') }
    catch { return property.fasilitas_dekorasi ? [property.fasilitas_dekorasi] : [] }
  })

  // Fasilitas Tabs Parser
  let activeFasilitasTab = $state('Semua');
  let fasilitasTabs = $derived.by(() => {
    if (!property.fasilitas_di_sekitar) return [];
    try {
      let div = document.createElement('div');
      div.innerHTML = property.fasilitas_di_sekitar;
      let items = Array.from(div.querySelectorAll('li'));
      let lines = [];
      if (items.length > 0) {
        lines = items.map(li => li.textContent.trim());
      } else {
        lines = div.textContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      }
      
      /** @type {any[]} */
      let tabs = [];
      lines.forEach(text => {
        let parts = text.split(':');
        if (parts.length >= 2) {
            tabs.push({ category: parts[0].trim(), items: parts.slice(1).join(':').trim() });
        } else if (text.length > 5) {
            tabs.push({ category: 'Lainnya', items: text });
        }
      });
      // Deduplicate categories if needed, but for now simple mapping
      return tabs;
    } catch { return []; }
  });

  /** @param {string} cat */
  function getFacilityIcon(cat) {
    const lower = cat.toLowerCase();
    if (lower.includes('pendidikan') || lower.includes('sekolah')) return '🎓';
    if (lower.includes('internet')) return '🌐';
    if (lower.includes('kesehatan') || lower.includes('rumah')) return '🏥';
    if (lower.includes('transportasi') || lower.includes('stasiun') || lower.includes('tol')) return '🚍';
    if (lower.includes('komersial') || lower.includes('mall') || lower.includes('belanja')) return '🛍️';
    if (lower.includes('ibadah') || lower.includes('masjid')) return '🕌';
    if (lower.includes('wisata') || lower.includes('rekreasi')) return '🌳';
    if (lower.includes('layanan') || lower.includes('publik')) return '🏢';
    return '📍';
  }

  let petaMapObj = $derived.by(() => {
    if (!property.peta_map) return null;
    try {
      return typeof property.peta_map === 'string' ? JSON.parse(property.peta_map) : property.peta_map;
    } catch { return null; }
  });

  const allImages = $derived(
    images && images.length > 0 
      ? images 
      : (property.cover_img ? [{ gambar: property.cover_img }] : [null])
  )
  
  /** @param {string} gambar */
  const imgSrc = (gambar) => propertyImg(gambar)
</script>

<Layout title={property.nama_property || 'Detail Properti'}>
  <div style="background:var(--surface-2);padding:14px 0;border-bottom:1px solid var(--border)">
    <div class="container" style="display:flex;align-items:center;gap:8px;font-size:0.8rem;color:var(--text-3)">
      <Link to={url('/')} style="color:var(--text-3);text-decoration:none;hover:color:var(--gold)">Home</Link>
      <span>›</span>
      <Link to={url('/properti')} style="color:var(--text-3);text-decoration:none">Properti</Link>
      <span>›</span>
      <span style="color:var(--text-1)">{property.nama_property}</span>
    </div>
  </div>

  <div class="container" style="padding-top:32px;padding-bottom:64px">
    <div style="display:grid;grid-template-columns:1fr 340px;gap:40px;align-items:start">

      <!-- LEFT: Gallery + Info -->
      <div style="min-width:0">
        <!-- Gallery -->
        <div class="detail-gallery" style="margin-bottom:24px">
          <img class="detail-gallery-main" src={imgSrc(allImages[activeImg]?.gambar || allImages[activeImg])} alt={property.nama_property} id="detail-main-img" />

          <!-- Badges Left -->
          <div style="position:absolute;top:16px;left:16px;z-index:1">
            <span class="prop-badge {property.tipe==='jual'?'prop-badge-jual':'prop-badge-sewa'}">
              {property.tipe === 'jual' ? 'DIJUAL' : 'DISEWA'}
            </span>
          </div>

          <!-- Badges Right -->
          {#if property.surat}
            <div style="position:absolute;top:16px;right:16px;z-index:1">
              <span class="badge badge-gold">{property.surat}</span>
            </div>
          {/if}

          {#if allImages.length > 1}
            <div class="detail-thumbs" style="padding:12px">
              {#each allImages as img, i}
                <button
                  type="button"
                  onclick={() => activeImg = i}
                  style="border:none;background:none;padding:0;cursor:pointer"
                  aria-label="Foto {i+1}"
                >
                  <img
                    class="detail-thumb {i === activeImg ? 'active' : ''}"
                    src={imgSrc(img?.gambar || img)}
                    alt="Foto {i+1}"
                  />
                </button>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Title & Price -->
        <div style="margin-bottom:24px">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap">
            <div>
              <h1 style="font-family:'Playfair Display',serif;font-size:1.7rem;font-weight:700;color:var(--text-1);line-height:1.25;margin-bottom:8px">{property.nama_property}</h1>
              <div style="font-size:0.9rem;display:flex;align-items:center;gap:6px">
                {property.alamat}{#if property.nama_kabupaten}, {property.nama_kabupaten}{/if}{#if property.nama_provinsi}, {property.nama_provinsi}{/if}
              </div>
            </div>
            <div style="text-align:right">
              <div style="font-family:'Playfair Display',serif;font-size:1.9rem;font-weight:800;color:var(--text-1)">{formatHarga(property.harga)}</div>
              {#if property.tipe === 'sewa'}
                <div style="font-size:0.82rem;color:var(--text-3)">per {property.jenis_sewa || 'tahun'}</div>
              {/if}
            </div>
          </div>
        </div>

        <!-- Specs Grid -->
        <div class="card" style="padding:24px;margin-bottom:24px">
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;text-align:center">
            {#each [
              { icon:'🛏', val: property.kamar_tidur, label:'Kamar Tidur' },
              { icon:'🚿', val: property.kamar_mandi, label:'Kamar Mandi' },
              { icon:'📐', val: property.lt ? property.lt + ' m²' : '-', label:'Luas Tanah' },
              { icon:'🏗', val: property.lb ? property.lb + ' m²' : '-', label:'Luas Bangunan' },
            ] as s}
              <div>
                <div style="font-size:1.6rem;margin-bottom:6px">{s.icon}</div>
                <div style="font-size:1.1rem;font-weight:700;color:var(--text-1)">{s.val || '-'}</div>
                <div style="font-size:0.72rem;color:var(--text-3);margin-top:2px">{s.label}</div>
              </div>
            {/each}
          </div>
          {#if property.lantai}
            <div class="divider"></div>
            <div style="display:flex;gap:20px;flex-wrap:wrap;font-size:0.85rem;color:var(--text-2)">
              <span>🏢 {property.lantai} Lantai</span>
              {#if property.surat}<span>📜 Sertifikat: {property.surat}</span>{/if}
              {#if property.kode}<span>🔖 Kode: {property.kode}</span>{/if}
            </div>
          {/if}
        </div>

        <!-- Deskripsi -->
        {#if property.isi}
          <div class="card" style="padding:24px;margin-bottom:24px">
            <h2 style="font-size:1rem;font-weight:700;color:var(--text-1);margin-bottom:14px">📝 Deskripsi Properti</h2>
            <div class="html-content" style="font-size:0.9rem;color:var(--text-2);line-height:1.85">{@html property.isi}</div>
          </div>
        {/if}

        <!-- AI Investment Score -->
        <div style="background:var(--text-1);border-radius:var(--radius-xl);padding:24px;margin-bottom:24px;color:white">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
            <div>
              <div style="font-size:0.72rem;font-weight:700;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">🤖 Waisaka AI Insight</div>
              {#if property.score_investasi_ai}
                <div style="font-size:0.9rem;color:rgba(255,255,255,0.7);line-height:1.7;max-width:480px">{property.analisis_property || 'Properti ini memiliki potensi investasi yang baik berdasarkan lokasi dan kondisi pasar.'}</div>
                {#if property.trend_harga}
                  <div style="margin-top:10px;font-size:0.82rem;color:var(--gold)">📈 Tren Harga: {property.trend_harga}</div>
                {/if}
              {:else}
                <div style="font-size:0.9rem;color:rgba(255,255,255,0.7);line-height:1.7;max-width:480px;font-style:italic">Data assessment AI insight belum tersedia...</div>
              {/if}
            </div>
            
            <div style="text-align:center;flex-shrink:0">
              {#if property.score_investasi_ai}
                <div style="font-family:'Playfair Display',serif;font-size:3rem;font-weight:800;color:var(--gold);line-height:1">{property.score_investasi_ai}</div>
                <div style="font-size:0.72rem;color:rgba(255,255,255,0.4);letter-spacing:1px;margin-top:4px">INVESTMENT SCORE</div>
                <div style="height:6px;width:80px;background:rgba(255,255,255,0.1);border-radius:999px;margin:8px auto 0">
                  <div style="height:100%;width:{property.score_investasi_ai}%;background:linear-gradient(90deg,var(--gold),#E8C87A);border-radius:999px"></div>
                </div>
                {#if property.label_investasi_ai}
                  <span class="badge badge-gold" style="margin-top:10px">{property.label_investasi_ai}</span>
                {/if}
              {:else}
                <button class="btn btn-gold" style="font-size:0.8rem;padding:10px 20px" onclick={generateAIInsight} disabled={isGeneratingAI}>
                  {isGeneratingAI ? '🔄 Generating...' : '✨ Jalankan AI Insight'}
                </button>
              {/if}
            </div>
          </div>
        </div>

        <!-- Fasilitas -->
        {#if fasilitas.length > 0}
          <div class="card" style="padding:24px;margin-bottom:24px">
            <h2 style="font-size:1rem;font-weight:700;color:var(--text-1);margin-bottom:14px">✨ Fasilitas & Dekorasi</h2>
            <div style="display:flex;flex-wrap:wrap;gap:10px">
              {#each fasilitas as f}
                <span class="badge badge-gold">{f}</span>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Fasilitas di Sekitar -->
        <div class="card" style="padding:24px;margin-bottom:24px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px">
            <h2 style="font-size:1rem;font-weight:700;color:var(--text-1);margin:0">🏙 Fasilitas di Sekitar</h2>
            {#if !property.fasilitas_di_sekitar}
              <button class="btn btn-gold" style="font-size:0.75rem;padding:6px 14px" onclick={generateFasilitas} disabled={isGeneratingFasilitas}>
                {isGeneratingFasilitas ? '🔄 Generating...' : '✨ Jalankan AI Fasilitas'}
              </button>
            {/if}
          </div>

          {#if property.fasilitas_di_sekitar}
            <!-- TABS -->
            {#if fasilitasTabs.length > 0}
              <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;">
                <button 
                  onclick={() => activeFasilitasTab = 'Semua'}
                  style="display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:999px;border:1px solid {activeFasilitasTab === 'Semua' ? 'var(--gold)' : 'var(--border)'};background:{activeFasilitasTab === 'Semua' ? 'var(--gold)' : 'var(--surface-1)'};color:{activeFasilitasTab === 'Semua' ? 'var(--text-1)' : 'var(--text-2)'};font-size:0.85rem;font-weight:500;cursor:pointer;transition:all 0.2s"
                >
                  ⭐ Semua
                </button>
                {#each fasilitasTabs as tab}
                  <button 
                    onclick={() => activeFasilitasTab = tab.category}
                    style="display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:999px;border:1px solid {activeFasilitasTab === tab.category ? 'var(--gold)' : 'var(--border)'};background:{activeFasilitasTab === tab.category ? 'var(--gold)' : 'var(--surface-1)'};color:{activeFasilitasTab === tab.category ? 'var(--text-1)' : 'var(--text-2)'};font-size:0.85rem;font-weight:500;cursor:pointer;transition:all 0.2s"
                  >
                    {getFacilityIcon(tab.category)} {tab.category}
                  </button>
                {/each}
              </div>
              <div style="background:var(--cream);border-radius:12px;padding:20px;border:1px solid var(--border);font-size:0.9rem;color:var(--text-2);line-height:1.7">
                {#if activeFasilitasTab === 'Semua'}
                  <div style="display:flex;flex-direction:column;gap:16px;animation:fadein 0.3s ease">
                    {#each fasilitasTabs as tab}
                      <div>
                        <span style="font-weight:700;color:var(--text-1)">{tab.category}: </span>
                        <span>{tab.items}</span>
                      </div>
                    {/each}
                  </div>
                {:else}
                  {#each fasilitasTabs as tab}
                    {#if activeFasilitasTab === tab.category}
                      <div style="animation:fadein 0.3s ease">
                        <span style="font-weight:700;color:var(--text-1)">{tab.category}: </span>
                        <span>{tab.items}</span>
                      </div>
                    {/if}
                  {/each}
                {/if}
              </div>
            {:else}
              <div class="html-content" style="color:var(--text-2);line-height:1.7;font-size:0.9rem;">
                {@html property.fasilitas_di_sekitar}
              </div>
            {/if}
          {:else}
            <div style="text-align:center;padding:40px 20px;background:var(--cream);border-radius:8px;color:var(--text-3);font-size:0.85rem;border:1px dashed var(--border)">
              <div style="font-size:2rem;margin-bottom:10px">📍</div>
              Belum pernah diproses. Klik <strong>Jalankan AI Fasilitas</strong> untuk men-generate otomatis.
            </div>
          {/if}
        </div>

        <!-- Peta -->
        <div class="card" style="padding:24px;margin-bottom:24px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px">
            <h2 style="font-size:1rem;font-weight:700;color:var(--text-1);margin:0">🗺 Lokasi Properti</h2>
            {#if !petaMapObj?.maps_query}
              <button class="btn btn-gold" style="font-size:0.75rem;padding:6px 14px" onclick={generateMap} disabled={isGeneratingMap}>
                {isGeneratingMap ? '🔄 Generating...' : '✨ Jalankan AI Peta'}
              </button>
            {/if}
          </div>

          {#if petaMapObj?.maps_query}
            <div class="map-embed" style="width:100%;height:350px;border-radius:8px;overflow:hidden;border:1px solid var(--border)">
              <iframe
                title="Peta Lokasi Properti"
                width="100%"
                height="100%"
                style="border:0;"
                loading="lazy"
                allowfullscreen
                referrerpolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(petaMapObj.maps_query)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              ></iframe>
            </div>
          {:else}
            <div style="text-align:center;padding:40px 20px;background:var(--cream);border-radius:8px;color:var(--text-3);font-size:0.85rem;border:1px dashed var(--border)">
              <div style="font-size:2rem;margin-bottom:10px">🗺️</div>
              Koordinat belum digenerate. Klik <strong>Jalankan AI Peta</strong> untuk mencari koordinat area properti ini secara otomatis.
            </div>
          {/if}
        </div>

        <!-- Related Properties -->
        {#if related.length > 0}
          <div style="margin-top:40px">
            <h2 style="font-size:1.1rem;font-weight:700;color:var(--text-1);margin-bottom:20px">Properti Serupa</h2>
            <div class="grid-3">
              {#each related as rel}
                <Link to={url(`/properti/${rel.slug_property}`)} class="prop-card" style="text-decoration:none">
                  <img class="prop-card-img" src={imgSrc(rel.cover_img)} alt={rel.nama_property} />
                  <div class="prop-card-body">
                    <div class="prop-price" style="font-size:1rem">{formatHarga(rel.harga)}</div>
                    <div class="prop-title">{rel.nama_property}</div>
                  </div>
                </Link>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Testimonial Form -->
        <div class="card" style="padding:24px;margin-top:40px;margin-bottom:24px">
          <h2 style="font-size:1rem;font-weight:700;color:var(--text-1);margin-bottom:14px">Berikan Ulasan Anda</h2>
          <form onsubmit={submitTestimoni} style="display:flex;flex-direction:column;gap:12px">
            <div>
              <label class="form-label" for="rating" style="display:block;margin-bottom:4px">Rating (1-5)</label>
              <input type="number" id="rating" bind:value={rating} min="1" max="5" class="form-input" required />
            </div>
            
            <div>
              <label class="form-label" for="title" style="display:block;margin-bottom:4px">Judul Ulasan</label>
              <input type="text" id="title" bind:value={title} class="form-input" required placeholder="Contoh: Properti sangat bagus!" />
            </div>
            
            <div>
              <label class="form-label" for="testimonial" style="display:block;margin-bottom:4px">Ulasan Lengkap</label>
              <textarea id="testimonial" bind:value={testimonial} class="form-input" rows="4" required placeholder="Ceritakan pengalaman Anda..."></textarea>
            </div>
            
            <button type="submit" class="btn btn-gold" style="align-self:flex-start" disabled={isSubmittingTestimoni}>
              {isSubmittingTestimoni ? 'Mengirim...' : 'Kirim Ulasan'}
            </button>
          </form>
        </div>
      </div>

      <!-- RIGHT: Contact Sidebar -->
      <aside class="sticky-sidebar">
        <!-- KPR Calculator -->
        <div class="contact-card" style="margin-bottom:16px;background:var(--cream)">
          <div style="font-size:0.8rem;font-weight:700;color:var(--text-3);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:16px">🏦 Kalkulator KPR</div>
          <div style="font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700;color:var(--text-1);margin-bottom:4px">{formatHarga(cicilan)}</div>
          <div style="font-size:0.78rem;color:var(--text-3);margin-bottom:20px">estimasi cicilan / bulan</div>

          {#if banks.length > 0}
            <div class="form-group" style="margin-bottom:12px">
              <label class="form-label" for="bank">Pilih Bank</label>
              <select id="bank" class="form-input form-select" bind:value={selectedBankId}>
                {#each banks as b}
                  <option value={b.id}>{b.nama_bank}</option>
                {/each}
              </select>
            </div>
            {#if selectedBank}
              <div class="form-group" style="margin-bottom:12px">
                <label class="form-label" for="rateType">Masa Bunga</label>
                <select id="rateType" class="form-input form-select" bind:value={rateType}>
                  <option value="fixed_1y">Fixed 1 Thn ({selectedBank.bunga_fixed_1y}%)</option>
                  <option value="fixed_3y">Fixed 3 Thn ({selectedBank.bunga_fixed_3y}%)</option>
                  <option value="fixed_5y">Fixed 5 Thn ({selectedBank.bunga_fixed_5y}%)</option>
                  <option value="floating">Floating ({selectedBank.bunga_floating}%)</option>
                </select>
              </div>
            {/if}
          {/if}

          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label" for="dp-pct">DP {dp}%</label>
            <input id="dp-pct" type="range" min={selectedBank ? selectedBank.min_dp_persen : 10} max="90" step="5" bind:value={dp} style="width:100%;accent-color:var(--gold)" />
          </div>
          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label" for="tenor">Tenor {tenor} Tahun</label>
            <input id="tenor" type="range" min="1" max={selectedBank ? selectedBank.max_tenor : 30} step="1" bind:value={tenor} style="width:100%;accent-color:var(--gold)" />
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label" for="bunga">Bunga {bunga}%/thn</label>
            <input id="bunga" type="range" min="1" max="20" step="0.1" bind:value={bunga} style="width:100%;accent-color:var(--gold)" disabled={banks.length > 0} />
          </div>
        </div>

        <!-- Agent Card -->
        <div class="contact-card">
          <div style="font-size:0.8rem;font-weight:700;color:var(--text-3);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:16px">Hubungi Agen</div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
            <img
              class="agent-avatar"
              src={agent.gambar ? `http://localhost/studiocerdas/public/upload/staff/${agent.gambar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.nama_staff || 'Agen')}&background=C9A84C&color=fff&size=56`}
              alt={agent.nama_staff}
            />
            <div>
              <div style="font-weight:700;color:var(--text-1);font-size:0.95rem">{agent.nama_staff || 'Agen Cerdas Living'}</div>
              <div style="font-size:0.78rem;color:var(--text-3)">{agent.jabatan || 'Property Consultant'}</div>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:10px">
            {#if agent.whatsapp || agent.telepon}
              <a
                href="https://wa.me/{(agent.whatsapp || agent.telepon || '').replace(/\D/g,'')}?text={encodeURIComponent('Halo, saya tertarik dengan properti: ' + property.nama_property)}"
                target="_blank"
                class="btn btn-gold btn-full"
              >💬 WhatsApp</a>
            {/if}
            {#if agent.telepon}
              <a href="tel:{agent.telepon}" class="btn btn-outline btn-full">📞 {agent.telepon}</a>
            {/if}
          </div>

          <div class="divider"></div>

          <!-- Quick Form -->
          <div style="font-size:0.82rem;font-weight:600;color:var(--text-2);margin-bottom:12px">Kirim Pesan</div>
          <div style="display:flex;flex-direction:column;gap:10px">
            <input class="form-input" style="font-size:0.85rem" placeholder="Nama Anda" bind:value={contactName} />
            <input class="form-input" style="font-size:0.85rem" placeholder="No. WhatsApp" bind:value={contactPhone} />
            <textarea class="form-input" style="font-size:0.85rem;resize:none" rows="3"
              bind:value={contactMsg}></textarea>
            <button class="btn btn-dark btn-full" onclick={() => {
              const wa = (agent.whatsapp || agent.telepon || '').replace(/\D/g,'')
              window.open(`https://wa.me/${wa}?text=${encodeURIComponent(contactMsg + ' - ' + contactName + ' (' + contactPhone + ')')}`, '_blank')
            }}>Kirim via WhatsApp</button>
          </div>
        </div>
      </aside>
    </div>
  </div>
</Layout>
