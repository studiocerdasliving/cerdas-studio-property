<script>
  import Layout from '../../components/Layout.svelte'
  import { Link, navigate  } from 'svelte-routing'
  import { url, propertyImg } from '../../lib/url.svelte.js'
  import { apiFetch } from '../../lib/api.js'
  import { onMount, onDestroy } from 'svelte'

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
  let banksLoaded = $state(false)
  let isLoading = $state(true)

  /** Same bank list as KprCalculator.svelte — used as fallback when API returns no banks */
  const kprFallbackBanks = [
    { id: 'bca', nama_bank: 'Bank BCA', logo: '/bank-logos/BCA.jpg',
      rates: [
        { label: 'Fixed 1 Tahun', value: 2.75, fixedYears: 1 },
        { label: 'Fixed 3 Tahun', value: 3.75, fixedYears: 3 },
        { label: 'Fixed 5 Tahun', value: 4.75, fixedYears: 5 },
      ], floating: 11.00, min_dp_persen: 10, max_tenor: 30 },
    { id: 'mandiri', nama_bank: 'Bank Mandiri', logo: '/bank-logos/Mandiri.jpg',
      rates: [
        { label: 'Fixed 1 Tahun', value: 2.55, fixedYears: 1 },
        { label: 'Fixed 3 Tahun', value: 3.99, fixedYears: 3 },
        { label: 'Fixed 5 Tahun', value: 4.99, fixedYears: 5 },
      ], floating: 12.00, min_dp_persen: 10, max_tenor: 30 },
    { id: 'bni', nama_bank: 'Bank BNI', logo: '/bank-logos/BNI.jpg',
      rates: [
        { label: 'Fixed 1 Tahun', value: 2.75, fixedYears: 1 },
        { label: 'Fixed 3 Tahun', value: 3.75, fixedYears: 3 },
        { label: 'Fixed 5 Tahun', value: 4.75, fixedYears: 5 },
      ], floating: 12.50, min_dp_persen: 10, max_tenor: 30 },
    { id: 'bri', nama_bank: 'Bank BRI', logo: '/bank-logos/BRI.jpg',
      rates: [
        { label: 'Fixed 1 Tahun', value: 2.75, fixedYears: 1 },
        { label: 'Fixed 3 Tahun', value: 3.75, fixedYears: 3 },
        { label: 'Fixed 5 Tahun', value: 4.75, fixedYears: 5 },
      ], floating: 13.00, min_dp_persen: 10, max_tenor: 30 },
    { id: 'btn', nama_bank: 'Bank BTN', logo: '/bank-logos/BTN.jpg',
      rates: [
        { label: 'Fixed 1 Tahun', value: 2.99, fixedYears: 1 },
        { label: 'Fixed 3 Tahun', value: 3.99, fixedYears: 3 },
        { label: 'Fixed 5 Tahun', value: 4.99, fixedYears: 5 },
      ], floating: 12.50, min_dp_persen: 10, max_tenor: 30 },
    { id: 'cimb', nama_bank: 'Bank CIMB Niaga', logo: '/bank-logos/CIMB.jpg',
      rates: [
        { label: 'Fixed 3 Tahun', value: 4.25, fixedYears: 3 },
        { label: 'Fixed 5 Tahun', value: 5.50, fixedYears: 5 },
      ], floating: 11.00, min_dp_persen: 10, max_tenor: 30 },
    { id: 'ocbc', nama_bank: 'Bank OCBC Indonesia', logo: '/bank-logos/OCBC.jpg',
      rates: [
        { label: 'Fixed 3 Tahun', value: 3.99, fixedYears: 3 },
        { label: 'Fixed 5 Tahun', value: 4.99, fixedYears: 5 },
      ], floating: 11.50, min_dp_persen: 10, max_tenor: 30 },
    { id: 'panin', nama_bank: 'Bank Panin', logo: '/bank-logos/Panin.jpg',
      rates: [
        { label: 'Fixed 1 Tahun', value: 2.50, fixedYears: 1 },
        { label: 'Fixed 3 Tahun', value: 3.50, fixedYears: 3 },
        { label: 'Fixed 5 Tahun', value: 4.50, fixedYears: 5 },
      ], floating: 10.50, min_dp_persen: 10, max_tenor: 30 },
  ];

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
      banksLoaded = true;

      // Auto-select first bank: prefer API banks, fall back to hardcoded list
      if (selectedBankId === null) {
        const bks = banks.length > 0 ? banks : kprFallbackBanks;
        if (bks.length > 0) selectedBankId = bks[0].id;
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
  let bankDropdownOpen = $state(false);
  let rateDropdownOpen = $state(false);

  /** @param {MouseEvent} e */
  function handleKprWindowClick(e) {
    const t = /** @type {HTMLElement} */(e.target);
    if (!t.closest?.('.kpr-bank-dropdown')) bankDropdownOpen = false;
    if (!t.closest?.('.kpr-rate-dropdown')) rateDropdownOpen = false;
  }

  onMount(() => {
    window.addEventListener('click', handleKprWindowClick);
    return () => window.removeEventListener('click', handleKprWindowClick);
  });

  // KPR Calculator — uses same bank list structure as KprCalculator.svelte
  /** @type {any} */
  let selectedBankId = $state(null);
  let selectedRateIdx = $state(0);

  /** Effective bank list: API banks if available, else hardcoded fallback */
  let banksData = $derived(banksLoaded ? (banks.length > 0 ? banks : kprFallbackBanks) : kprFallbackBanks);

  /** @type {any} */
  let selectedBank = $derived(banksData.find((/** @type {any} */ b) => b.id == selectedBankId) ?? banksData[0]);

  /** Active rate index clamped to bank's available rates */
  let activeRateIdx = $derived(selectedBank ? Math.min(selectedRateIdx, (selectedBank.rates || []).length - 1) : 0);
  let activeRate    = $derived(selectedBank?.rates?.[activeRateIdx]);

  let dp = $state(30);
  let tenor = $state(15);

  // Reactivity: when bank changes, clamp DP/tenor and reset rate idx
  let _prevBankId = $state(null);
  $effect(() => {
    if (selectedBank && selectedBankId !== _prevBankId) {
      _prevBankId = selectedBankId;
      if (dp < (selectedBank.min_dp_persen ?? 10)) dp = selectedBank.min_dp_persen ?? 10;
      if (tenor > (selectedBank.max_tenor ?? 30)) tenor = selectedBank.max_tenor ?? 30;
      // Reset rate to first available for this bank
      selectedRateIdx = 0;
    }
  });

  let fixedYears   = $derived(activeRate?.fixedYears ?? 3);
  let fixedRate    = $derived(activeRate?.value ?? 9.5);
  let floatingRate = $derived(selectedBank?.floating ?? 12);

  let downPayment   = $derived(((property.harga || 0) * dp) / 100);
  let principal     = $derived((property.harga || 0) - downPayment);
  let floatingYears = $derived(Math.max(0, tenor - fixedYears));

  let calc = $derived.by(() => {
        if (principal <= 0 || tenor <= 0) return {
            fixedMonthly: 0, floatingMonthly: 0,
            totalFixed: 0, totalFloating: 0,
            totalInterest: 0, totalPayment: 0,
            remainingAfterFixed: 0, isMixed: false
        };

        const totalM = tenor * 12;
        const fixedM = Math.min(fixedYears * 12, totalM);
        const floatM = totalM - fixedM;

        // --- FASE FIXED ---
        const mfixed = (fixedRate / 100) / 12;
        let fixedMonthly = 0;
        if (mfixed === 0) {
            fixedMonthly = principal / totalM;
        } else {
            fixedMonthly = principal * (mfixed * Math.pow(1 + mfixed, totalM)) / (Math.pow(1 + mfixed, totalM) - 1);
        }

        // Hitung outstanding pokok setelah masa fixed selesai
        let remaining = principal;
        for (let m = 0; m < fixedM; m++) {
            const ip = remaining * mfixed;
            const pp = fixedMonthly - ip;
            remaining = Math.max(0, remaining - pp);
        }

        // --- FASE FLOATING ---
        let floatingMonthly = 0;
        const isMixed = floatM > 0;
        if (floatM > 0 && remaining > 0) {
            const mf = (floatingRate / 100) / 12;
            if (mf === 0) {
                floatingMonthly = remaining / floatM;
            } else {
                floatingMonthly = remaining * (mf * Math.pow(1 + mf, floatM)) / (Math.pow(1 + mf, floatM) - 1);
            }
        } else if (floatM === 0) {
            floatingMonthly = fixedMonthly;
        }

        const totalFixed    = fixedMonthly * fixedM;
        const totalFloating = floatingMonthly * floatM;
        const totalPayment  = totalFixed + totalFloating;
        const totalInterest = totalPayment - principal;

        return { fixedMonthly, floatingMonthly, totalFixed, totalFloating,
                 totalInterest, totalPayment, remainingAfterFixed: remaining, isMixed };
  });

  /** @param {number} h */
  function formatHarga(h) {
    if (!h) return 'Harga Negosiasi'
    if (h >= 1_000_000_000) return 'Rp ' + (h / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '') + ' Miliar'
    if (h >= 1_000_000) return 'Rp ' + Math.round(h / 1_000_000).toLocaleString('id-ID') + ' Juta'
    return 'Rp ' + Number(h).toLocaleString('id-ID')
  }

  /** @param {number|string|null} n */
  function fmt(n) {
      if (!n || isNaN(Number(n)) || !isFinite(Number(n))) return 'Rp 0';
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(n));
  }

  /** @param {number} n @returns {string} */
  function terbilang(n) {
      if (!n || n <= 0) return 'Nol rupiah';
      /** @param {number} x @returns {string} */
      function cv(x) {
          const h = ['','satu','dua','tiga','empat','lima','enam','tujuh','delapan','sembilan','sepuluh','sebelas'];
          if (x < 12) return h[x];
          if (x < 20) return cv(x-10)+' belas';
          if (x < 100) return cv(Math.floor(x/10))+' puluh '+cv(x%10);
          if (x < 200) return 'seratus '+cv(x-100);
          if (x < 1000) return cv(Math.floor(x/100))+' ratus '+cv(x%100);
          if (x < 2000) return 'seribu '+cv(x-1000);
          if (x < 1e6) return cv(Math.floor(x/1000))+' ribu '+cv(x%1000);
          if (x < 1e9) return cv(Math.floor(x/1e6))+' juta '+cv(x%1e6);
          if (x < 1e12) return cv(Math.floor(x/1e9))+' milyar '+cv(x%1e9);
          return cv(Math.floor(x/1e12))+' triliun '+cv(x%1e12);
      }
      return cv(n).trim().replace(/\s+/g,' ') + ' rupiah';
  }

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

  /**
   * Memecah teks analisis AI menjadi array paragraf.
   * Tiap ~2–3 kalimat dijadikan satu paragraf agar mudah dibaca.
   * @param {string} text
   * @param {number} sentencesPerParagraph
   * @returns {string[]}
   */
  function formatAnalisis(text, sentencesPerParagraph = 2) {
    if (!text) return [];
    // Pisahkan berdasarkan titik, tanda tanya, atau tanda seru — pertahankan tanda baca
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const paragraphs = [];
    for (let i = 0; i < sentences.length; i += sentencesPerParagraph) {
      const chunk = sentences.slice(i, i + sentencesPerParagraph).join(' ').trim();
      if (chunk) paragraphs.push(chunk);
    }
    return paragraphs;
  }

  const allImages = $derived(
    images && images.length > 0 
      ? images 
      : (property.cover_img ? [{ gambar: property.cover_img }] : [null])
  )
  
  /** @param {string} gambar */
  const imgSrc = (gambar) => propertyImg(gambar)

  /** @param {string} phone */
  function maskPhone(phone) {
    if (!phone) return '';
    if (phone.length <= 4) return phone;
    return phone.substring(0, 4) + 'xxxx' + 'x'.repeat(Math.max(0, phone.length - 8));
  }
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
    <div class="prop-layout-main">

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
            <div class="detail-thumbs" style="padding:12px; display:flex; flex-wrap:nowrap; overflow-x:auto;">
              {#each allImages as img, i}
                <button
                  type="button"
                  onclick={() => activeImg = i}
                  style="border:none;background:none;padding:0;cursor:pointer;flex-shrink:0"
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
          <div class="prop-header-flex">
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
          <div class="prop-specs-grid">
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
        <div class="ai-insight-box">
          <div class="ai-insight-flex">
            <div>
              <div style="font-size:0.72rem;font-weight:700;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">🤖 Waisaka AI Insight</div>
              {#if property.score_investasi_ai}
                {#each formatAnalisis(property.analisis_property || 'Properti ini memiliki potensi investasi yang baik berdasarkan lokasi dan kondisi pasar.') as para, i}
                  <p style="font-size:0.9rem;color:rgba(255,255,255,0.75);line-height:1.8;max-width:480px;margin:0{i > 0 ? ';margin-top:10px' : ''}">{para}</p>
                {/each}
                {#if property.trend_harga}
                  <div style="margin-top:12px;font-size:0.82rem;color:var(--gold)">📈 Tren Harga: {property.trend_harga}</div>
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
        <!-- Agent Card -->
        <div class="contact-card" style="margin-bottom:16px;">
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
              <a href="tel:{agent.telepon}" class="btn btn-outline btn-full">📞 {maskPhone(agent.telepon)}</a>
            {/if}
          </div>
        </div>

        <div class="kpr-sidebar-wrapper">
          <!-- KPR Header -->
          <div class="kpr-header">
            <div>
              <h2 class="kpr-title">Kalkulator KPR <span class="kpr-title-gold">Mixed Rate</span></h2>
              <p class="kpr-subtitle">Simulasi cicilan fixed + floating</p>
            </div>
          </div>

          <div class="kpr-grid-vertical">

            <!-- FORM CARD -->
            <div class="kpr-card">
              <div class="kpr-form">

                <!-- Harga Properti (locked) -->
                <div class="form-group">
                  <label class="kpr-label" for="kprPropertyPrice">
                    <span>Harga Properti</span>
                    <span class="kpr-locked-badge">🔒 Terkunci</span>
                  </label>
                  <div class="kpr-price-display">
                    <span class="kpr-price-prefix">Rp</span>
                    <span class="kpr-price-value">{(property.harga || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div class="terbilang">{terbilang(property.harga || 0)}</div>
                </div>

                <!-- DP Slider -->
                <div class="form-group">
                  <div class="label-row">
                    <label class="kpr-label-plain" for="dpSlider">Uang Muka (DP)</label>
                    <span class="dp-badge">{dp}% &nbsp;·&nbsp; {fmt(downPayment)}</span>
                  </div>
                  <input id="dpSlider" type="range" bind:value={dp} min={selectedBank ? selectedBank.min_dp_persen : 10} max="90" step="5" class="slider" />
                  <div class="slider-ticks">
                    {#each [10,30,50,70,90] as t}
                      <span>{t}%</span>
                    {/each}
                  </div>
                </div>

                <!-- Tenor -->
                <div class="form-group">
                  <label class="kpr-label-plain" for="kprTenor">Tenor</label>
                  <div class="input-wrap suffix-wrap">
                    <input id="kprTenor" type="number" bind:value={tenor} min="1" max={selectedBank ? selectedBank.max_tenor : 30} class="form-input" />
                    <span class="affix suffix">Tahun</span>
                  </div>
                  <div class="hint">Maks. {selectedBank ? selectedBank.max_tenor : 30} tahun</div>
                </div>

                <!-- Pilih Bank (Custom Dropdown with Logo) -->
                <div class="form-group">
                  <div class="kpr-label-plain">Pilih Bank</div>
                  <div class="kpr-bank-dropdown">
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div class="kpr-dd-selected {bankDropdownOpen ? 'open' : ''}" onclick={() => bankDropdownOpen = !bankDropdownOpen}>
                      <div class="kpr-dd-left">
                        {#if selectedBank}
                          <img src={selectedBank.logo ?? `/bank-logos/${selectedBank.nama_bank.replace('Bank ', '').replace(' Indonesia','').split(' ')[0]}.jpg`}
                            alt={selectedBank.nama_bank}
                            onerror={(e) => { /** @type {HTMLImageElement} */(e.currentTarget).style.display='none'; }}
                            class="kpr-bk-logo" />
                          <span class="kpr-dd-name">{selectedBank.nama_bank}</span>
                        {:else}
                          <span class="kpr-bk-placeholder">🏦</span>
                          <span class="kpr-dd-name kpr-dd-placeholder">Pilih Bank KPR...</span>
                        {/if}
                      </div>
                      <span class="kpr-dd-arrow">{bankDropdownOpen ? '▲' : '▼'}</span>
                    </div>
                    {#if bankDropdownOpen}
                      <div class="kpr-dd-menu">
                        {#each banksData as b}
                          <!-- svelte-ignore a11y_click_events_have_key_events -->
                          <!-- svelte-ignore a11y_no_static_element_interactions -->
                          <div class="kpr-dd-item {selectedBankId === b.id ? 'active' : ''}"
                            onclick={() => { selectedBankId = b.id; bankDropdownOpen = false; }}>
                            <img src={b.logo ?? `/bank-logos/${b.nama_bank.replace('Bank ', '').replace(' Indonesia','').split(' ')[0]}.jpg`}
                              alt={b.nama_bank}
                              onerror={(e) => { /** @type {HTMLImageElement} */(e.currentTarget).style.display='none'; }}
                              class="kpr-bk-logo" />
                            <span class="kpr-dd-item-name">{b.nama_bank}</span>
                            {#if selectedBankId === b.id}
                              <span class="kpr-dd-check">✓</span>
                            {/if}
                          </div>
                        {/each}
                      </div>
                    {/if}
                  </div>
                </div>

                <!-- Tipe Suku Bunga Fixed -->
                <div class="form-group">
                  <div class="kpr-label-plain">Tipe Suku Bunga Fixed</div>
                  <div class="kpr-rate-dropdown">
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div class="kpr-dd-selected {rateDropdownOpen ? 'open' : ''}" onclick={() => rateDropdownOpen = !rateDropdownOpen}>
                      <div class="kpr-dd-left">
                        <span class="kpr-rate-icon">%</span>
                        <span class="kpr-dd-name">{activeRate?.label ?? 'Pilih Tenor Fixed'}</span>
                      </div>
                      <div style="display:flex;align-items:center;gap:8px">
                        <span class="kpr-rate-badge">{fixedRate}% p.a.</span>
                        <span class="kpr-dd-arrow">{rateDropdownOpen ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    {#if rateDropdownOpen && selectedBank?.rates}
                      <div class="kpr-dd-menu">
                        {#each selectedBank.rates as r, i}
                          <!-- svelte-ignore a11y_click_events_have_key_events -->
                          <!-- svelte-ignore a11y_no_static_element_interactions -->
                          <div class="kpr-dd-item kpr-rate-item {activeRateIdx === i ? 'active' : ''}"
                            onclick={() => { selectedRateIdx = i; rateDropdownOpen = false; }}>
                            <span class="kpr-rate-icon">%</span>
                            <span class="kpr-dd-item-name">{r.label}</span>
                            <span class="kpr-dd-rate-val">{r.value}% p.a.</span>
                          </div>
                        {/each}
                      </div>
                    {/if}
                  </div>
                </div>

                <!-- Mixed Rate Visual -->
                {#if floatingYears > 0}
                  <div class="mixed-info-v2">
                    <div class="mi-v2-phase fixed-v2">
                      <div class="mi-v2-header">Fixed</div>
                      <div class="mi-v2-years">{fixedYears} Tahun Pertama</div>
                      <div class="mi-v2-rate">{fixedRate}%</div>
                      <div class="mi-v2-cicilan">{fmt(calc.fixedMonthly)}<span>/bln</span></div>
                    </div>
                    <div class="mi-v2-arrow">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                    <div class="mi-v2-phase floating-v2">
                      <div class="mi-v2-header">Floating</div>
                      <div class="mi-v2-years">{floatingYears} Tahun Berikutnya</div>
                      <div class="mi-v2-rate">{floatingRate}%</div>
                      <div class="mi-v2-cicilan">{fmt(calc.floatingMonthly)}<span>/bln</span></div>
                    </div>
                  </div>
                {/if}

              </div>
            </div>

            <!-- SUMMARY DARK CARD -->
            <div class="kpr-summary-dark">
              <div class="sum-bank-header">
                <div class="sum-bank-logo-wrap">
                  <img src={selectedBank?.logo ?? `/bank-logos/${(selectedBank?.nama_bank ?? '').replace('Bank ', '').replace(' Indonesia','').split(' ')[0]}.jpg`}
                    alt={selectedBank?.nama_bank ?? 'Bank'}
                    onerror={(e) => {
                      /** @type {HTMLImageElement} */(e.currentTarget).style.display='none';
                      const p = e.currentTarget.parentElement;
                      if (p) { p.style.background = 'rgba(201,168,76,0.15)'; p.style.border = '1px solid rgba(201,168,76,0.3)'; p.innerHTML = '<span style="color:var(--gold);font-weight:700;font-size:0.75rem">KPR</span>'; }
                    }}
                    class="sum-bank-logo-img" />
                </div>
                <div style="flex:1;min-width:0">
                  <div class="sum-bank-name">{selectedBank?.nama_bank ?? 'Bank KPR'}</div>
                  <div class="sum-bank-scheme">
                    Fixed {fixedYears}Y @ {fixedRate}%{floatingYears > 0 ? ` + Floating ${floatingYears}Y @ ${floatingRate}%` : ''}
                  </div>
                </div>
              </div>

              <div class="sum-main">
                <div class="sum-label" style="color: rgba(255,255,255,0.5);">Cicilan Masa Fixed</div>
                <div class="sum-amount text-gradient-gold">{fmt(calc.fixedMonthly)}</div>
                <div class="sum-sub" style="color: rgba(255,255,255,0.4);">per bulan · {fixedYears} tahun pertama</div>
                {#if calc.isMixed}
                  <div class="sum-floating-cta" style="background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); color: rgba(255,255,255,0.55);">
                    <span>Setelah masa fixed berakhir →</span>
                    <strong style="color: var(--gold);">{fmt(calc.floatingMonthly)}/bulan</strong>
                    <span class="fc-sub" style="color: rgba(255,255,255,0.35);">(floating {floatingRate}% · {floatingYears} tahun)</span>
                  </div>
                {/if}
              </div>

              <div class="sum-breakdown-dark">
                <div class="br-row-dark">
                  <span>Harga Properti</span>
                  <span class="br-val-dark">{fmt(property.harga || 0)}</span>
                </div>
                <div class="br-row-dark">
                  <span>Uang Muka ({dp}%)</span>
                  <span class="br-val-dark">{fmt(downPayment)}</span>
                </div>
                <div class="br-row-dark highlight">
                  <span>Pokok Pinjaman</span>
                  <span class="br-val-dark gold">{fmt(principal)}</span>
                </div>
              </div>

              <div class="sum-details-dark">
                <div class="d-box-dark">
                  <div class="d-lbl-dark">TENOR</div>
                  <div class="d-val-dark">{tenor} Tahun</div>
                  <div class="d-sub-dark">{tenor * 12} bulan</div>
                </div>
                <div class="d-box-dark">
                  <div class="d-lbl-dark">FIXED RATE</div>
                  <div class="d-val-dark">{fixedRate}%</div>
                  <div class="d-sub-dark">{fixedYears} tahun</div>
                </div>
                {#if calc.isMixed}
                  <div class="d-box-dark">
                    <div class="d-lbl-dark">FLOATING</div>
                    <div class="d-val-dark">{floatingRate}%</div>
                    <div class="d-sub-dark">{floatingYears} tahun</div>
                  </div>
                {/if}
                <div class="d-box-dark">
                  <div class="d-lbl-dark">SISA POKOK</div>
                  <div class="d-val-sm-dark">{fmt(calc.remainingAfterFixed)}</div>
                  <div class="d-sub-dark">setelah masa fixed</div>
                </div>
              </div>

              <div class="sum-totals-dark">
                {#if calc.isMixed}
                  <div class="t-row-dark">
                    <span>Total Bayar Fixed ({fixedYears}Y)</span>
                    <span>{fmt(calc.totalFixed)}</span>
                  </div>
                  <div class="t-row-dark">
                    <span>Total Bayar Floating ({floatingYears}Y)</span>
                    <span>{fmt(calc.totalFloating)}</span>
                  </div>
                  <div class="t-divider-dark"></div>
                {/if}
                <div class="t-row-dark">
                  <span>Total Bunga</span>
                  <span class="c-red-dark">{fmt(calc.totalInterest)}</span>
                </div>
                <div class="t-row-dark grand">
                  <span>Total Pembayaran</span>
                  <span class="c-gold-dark">{fmt(calc.totalPayment)}</span>
                </div>
              </div>

              <div class="disclaimer">
                <span class="disc-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                </span>
                <p>Cicilan <strong>fixed</strong> berlaku {fixedYears} tahun pertama pada {fixedRate}% p.a., kemudian beralih ke <strong>floating</strong> {floatingRate}% p.a. untuk {floatingYears} tahun sisanya. Nilai aktual bergantung pada provisi, asuransi jiwa, kebakaran, dan kebijakan bank.</p>
              </div>
            </div>

          </div>
        </div>

      </aside>
    </div>
  </div>
</Layout>

<style>
  /* ===== KPR SIDEBAR WRAPPER ===== */
  .kpr-sidebar-wrapper { margin-top: 24px; }

  /* Header */
  .kpr-header {
    margin-bottom: 20px; padding: 14px 20px;
    background: linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.04) 100%);
    border: 1px solid rgba(201,168,76,0.25);
    border-radius: var(--radius-xl);
  }
  .kpr-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.15rem; font-weight: 800;
    color: var(--text-1); margin: 0; line-height: 1.2;
  }
  .kpr-title-gold { color: var(--gold); }
  .kpr-subtitle { font-size: 0.72rem; color: var(--text-3); margin: 2px 0 0; }

  /* KPR Vertical Layout for Sidebar */
  .kpr-grid-vertical { display: flex; flex-direction: column; gap: 20px; }

  .kpr-card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: var(--radius-xl); padding: 22px;
    box-shadow: 0 2px 20px rgba(0,0,0,0.07);
  }

  .kpr-form { display: flex; flex-direction: column; gap: 18px; }

  /* Labels */
  .kpr-label {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 0.82rem; font-weight: 600; color: var(--text-2); margin-bottom: 8px;
  }
  .kpr-label-plain { display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-2); margin-bottom: 8px; }
  .kpr-locked-badge {
    font-size: 0.68rem; font-weight: 600;
    color: var(--text-3); background: var(--surface-2);
    border: 1px solid var(--border); border-radius: 999px;
    padding: 2px 8px; letter-spacing: 0.3px;
  }

  /* Price Display (locked) */
  .kpr-price-display {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 16px;
    background: linear-gradient(135deg, var(--surface-2) 0%, rgba(201,168,76,0.06) 100%);
    border: 1.5px solid rgba(201,168,76,0.2);
    border-radius: var(--radius-lg);
    cursor: not-allowed; user-select: none;
  }
  .kpr-price-prefix {
    font-size: 0.85rem; font-weight: 700;
    color: var(--text-3);
    flex-shrink: 0;
  }
  .kpr-price-value {
    font-size: 1.05rem; font-weight: 700;
    color: var(--text-1); flex: 1;
    font-family: 'Inter', sans-serif;
  }

  .terbilang { font-size: 0.72rem; color: var(--gold); font-weight: 500; font-style: italic; text-transform: capitalize; margin-top: 5px; }
  .input-wrap { position: relative; display: flex; align-items: center; }
  .suffix-wrap .form-input { padding-right: 60px; }
  .affix { position: absolute; font-weight: 600; color: var(--text-3); font-size: 0.9rem; pointer-events: none; user-select: none; }
  .suffix { right: 16px; }

  .form-input { width: 100%; padding: 12px 16px; border: 1.5px solid var(--border); border-radius: var(--radius-lg); font-family: inherit; font-size: 1rem; color: var(--text-1); background: var(--white); transition: all 0.2s; outline: none; box-sizing: border-box; }
  .form-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,168,76,0.15); }

  .label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .label-row label { margin-bottom: 0; }
  .dp-badge { font-size: 0.88rem; font-weight: 700; color: var(--gold); }
  .hint { font-size: 0.72rem; color: var(--text-3); margin-top: 4px; }

  .slider { appearance: none; -webkit-appearance: none; width: 100%; height: 6px; background: var(--border); border-radius: 4px; outline: none; }
  .slider::-webkit-slider-thumb { appearance: none; -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: var(--gold); cursor: pointer; border: 3px solid var(--white); box-shadow: 0 1px 6px rgba(0,0,0,0.2); transition: transform 0.1s; }
  .slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
  .slider-ticks { display: flex; justify-content: space-between; font-size: 0.65rem; color: var(--text-3); margin-top: 5px; }

  /* ===== CUSTOM DROPDOWN (Bank & Rate) ===== */
  .kpr-bank-dropdown, .kpr-rate-dropdown { position: relative; }
  .kpr-dd-selected {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 14px; border: 1.5px solid var(--border);
    border-radius: var(--radius-lg); cursor: pointer; background: var(--white);
    transition: all 0.2s; user-select: none; gap: 8px;
  }
  .kpr-dd-selected:hover { border-color: rgba(201,168,76,0.5); }
  .kpr-dd-selected.open { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,168,76,0.12); }
  .kpr-dd-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
  .kpr-dd-name { font-size: 0.88rem; color: var(--text-1); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .kpr-dd-placeholder { color: var(--text-3); }
  .kpr-dd-arrow { font-size: 0.65rem; color: var(--text-3); flex-shrink: 0; }
  .kpr-bk-logo { width: 30px; height: 30px; object-fit: contain; border-radius: 6px; background: var(--surface-2); padding: 3px; flex-shrink: 0; border: 1px solid var(--border); }
  .kpr-bk-placeholder {
    width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
    font-size: 1rem; background: var(--surface-2); border-radius: 6px; flex-shrink: 0;
    border: 1px solid var(--border);
  }
  .kpr-rate-icon {
    width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
    font-size: 0.9rem; font-weight: 700; background: rgba(201,168,76,0.12);
    color: var(--gold); border-radius: 6px; flex-shrink: 0; border: 1px solid rgba(201,168,76,0.25);
  }
  .kpr-rate-badge {
    font-size: 0.75rem; font-weight: 700; color: var(--gold);
    background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.25);
    border-radius: 999px; padding: 2px 8px; flex-shrink: 0;
  }
  .kpr-dd-menu {
    position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 100;
    background: var(--white); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    max-height: 260px; overflow-y: auto; padding: 6px;
    animation: kprMenuFadeIn 0.15s ease;
  }
  @keyframes kprMenuFadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .kpr-dd-item {
    display: flex; align-items: center; gap: 10px; padding: 9px 10px;
    border-radius: calc(var(--radius-lg) - 4px); cursor: pointer;
    transition: background 0.15s; font-size: 0.85rem; color: var(--text-2);
  }
  .kpr-dd-item:hover { background: var(--surface-2); color: var(--text-1); }
  .kpr-dd-item.active { background: rgba(201,168,76,0.1); color: var(--gold-hover, var(--gold)); font-weight: 600; }
  .kpr-dd-item-name { flex: 1; }
  .kpr-dd-check { color: var(--gold); font-weight: 700; font-size: 0.85rem; }
  .kpr-dd-rate-val { font-size: 0.75rem; color: var(--text-3); font-weight: 600; }
  .kpr-rate-item .kpr-dd-rate-val { color: var(--gold); }
  .kpr-rate-item.active .kpr-dd-rate-val { color: var(--gold); }

  /* ===== MIXED INFO V2 ===== */
  .mixed-info-v2 {
    display: flex; align-items: stretch; gap: 0;
    border-radius: var(--radius-lg); overflow: hidden;
    border: 1px solid var(--border);
  }
  .mi-v2-phase { flex: 1; padding: 14px 12px; text-align: center; }
  .fixed-v2 {
    background: linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.05) 100%);
    border-right: 1px solid var(--border);
  }
  .floating-v2 {
    background: var(--surface-2);
  }
  .mi-v2-header { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
  .fixed-v2 .mi-v2-header { color: var(--gold); }
  .floating-v2 .mi-v2-header { color: var(--text-3); }
  .mi-v2-years { font-size: 0.68rem; color: var(--text-3); margin-bottom: 6px; }
  .mi-v2-rate { font-size: 1.5rem; font-weight: 800; line-height: 1; margin-bottom: 4px; }
  .fixed-v2 .mi-v2-rate { color: var(--gold); }
  .floating-v2 .mi-v2-rate { color: var(--text-2); }
  .mi-v2-cicilan { font-size: 0.75rem; font-weight: 700; }
  .fixed-v2 .mi-v2-cicilan { color: var(--gold); }
  .floating-v2 .mi-v2-cicilan { color: var(--text-2); }
  .mi-v2-cicilan span { font-size: 0.62rem; font-weight: 400; }
  .mi-v2-arrow {
    display: flex; align-items: center; justify-content: center;
    padding: 0 4px; color: var(--text-3); background: var(--border);
    flex-shrink: 0;
  }

  /* ===== SUMMARY DARK ===== */
  .kpr-summary-dark {
    background: linear-gradient(145deg, #1A150F 0%, #2A241A 100%);
    border-radius: var(--radius-xl); padding: 24px;
    color: var(--cream); box-shadow: 0 8px 40px rgba(0,0,0,0.25);
    display: flex; flex-direction: column; gap: 18px;
  }
  .sum-bank-header {
    display: flex; align-items: center; gap: 14px;
    padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .sum-bank-logo-wrap {
    width: 48px; height: 48px; border-radius: 12px;
    background: rgba(255,255,255,0.95); display: flex;
    align-items: center; justify-content: center;
    flex-shrink: 0; overflow: hidden; padding: 4px;
    box-sizing: border-box;
  }
  .sum-bank-logo-img { width: 100%; height: 100%; object-fit: contain; }
  .sum-bank-name { font-size: 0.95rem; font-weight: 700; color: var(--white); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sum-bank-scheme { font-size: 0.68rem; color: var(--gold); margin-top: 3px; line-height: 1.4; }

  .sum-main { text-align: center; }
  .sum-label { font-size: 0.68rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-bottom: 6px; }
  .sum-amount { font-size: clamp(1.5rem,4vw,2.2rem); font-weight: 800; line-height: 1.1; }
  .sum-sub { font-size: 0.75rem; color: rgba(255,255,255,0.4); margin-top: 4px; }
  .sum-floating-cta {
    margin-top: 12px; padding: 12px 14px;
    border-radius: var(--radius-lg); font-size: 0.78rem;
    display: flex; flex-direction: column; align-items: center; gap: 3px; border: 1px solid;
  }
  .sum-floating-cta strong { font-size: 1rem; }
  .fc-sub { font-size: 0.68rem; }

  .sum-breakdown-dark { display: flex; flex-direction: column; gap: 9px; }
  .br-row-dark { display: flex; justify-content: space-between; font-size: 0.85rem; color: rgba(255,255,255,0.6); }
  .br-val-dark { font-weight: 600; color: var(--white); }
  .br-row-dark.highlight { padding-top: 9px; border-top: 1px dashed rgba(255,255,255,0.15); }
  .br-row-dark.highlight .br-val-dark.gold { color: var(--gold); }

  .sum-details-dark { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
  .d-box-dark {
    background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06);
    border-radius: var(--radius-lg); padding: 12px 10px; text-align: center;
    transition: border-color 0.2s;
  }
  .d-box-dark:hover { border-color: rgba(201,168,76,0.2); }
  .d-lbl-dark { font-size: 0.62rem; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
  .d-val-dark { font-size: 1.05rem; font-weight: 700; color: var(--white); line-height: 1.2; }
  .d-val-sm-dark { font-size: 0.72rem; font-weight: 700; color: var(--white); line-height: 1.4; word-break: break-word; }
  .d-sub-dark { font-size: 0.65rem; color: var(--gold); margin-top: 2px; }

  .sum-totals-dark { background: rgba(0,0,0,0.3); border-radius: var(--radius-lg); padding: 16px; display: flex; flex-direction: column; gap: 9px; }
  .t-row-dark { display: flex; justify-content: space-between; font-size: 0.82rem; color: rgba(255,255,255,0.6); }
  .t-divider-dark { border: none; border-top: 1px solid rgba(255,255,255,0.08); }
  .t-row-dark .c-red-dark { color: #FFA8A8; font-weight: 600; }
  .t-row-dark.grand { padding-top: 9px; border-top: 1px solid rgba(255,255,255,0.1); color: var(--white); font-weight: 700; font-size: 0.9rem; }
  .t-row-dark.grand .c-gold-dark { color: var(--gold); font-size: 1.05rem; }

  .disclaimer { display: flex; gap: 10px; align-items: flex-start; font-size: 0.68rem; color: rgba(255,255,255,0.35); line-height: 1.6; }
  .disc-icon { flex-shrink: 0; margin-top: 2px; color: rgba(255,255,255,0.5); display: flex; align-items: center; }
  .disclaimer strong { color: rgba(255,255,255,0.55); }
  .text-gradient-gold { background: linear-gradient(to right, #C9A84C, #E5C973); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }

  /* ===== RESPONSIVE LAYOUT CLASSES ===== */
  .prop-layout-main { display: grid; grid-template-columns: 1fr 340px; gap: 40px; align-items: start; }
  .prop-header-flex { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .prop-specs-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; text-align: center; }
  .ai-insight-box { background: var(--text-1); border-radius: var(--radius-xl); padding: 24px; margin-bottom: 24px; color: white; }
  .ai-insight-flex { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }

  @media (max-width: 992px) {
    .prop-layout-main { grid-template-columns: 1fr; gap: 32px; }
    /* Limit the height of gallery main image on smaller screens */
    .detail-gallery-main { max-height: 50vh; object-fit: cover; }
  }

  @media (max-width: 768px) {
    .prop-header-flex { flex-direction: column; align-items: flex-start; }
    .prop-header-flex > div:last-child { text-align: left; }
    .prop-specs-grid { grid-template-columns: repeat(2, 1fr); }
    
    .ai-insight-flex { flex-direction: column-reverse; align-items: center; text-align: center; }
    .ai-insight-flex > div:first-child p { text-align: center; margin: 0 auto; }
  }

  /* Visible thin scrollbar for gallery thumbs */
  .detail-thumbs { scroll-behavior: smooth; padding-bottom: 8px; }
  .detail-thumbs::-webkit-scrollbar { height: 6px; }
  .detail-thumbs::-webkit-scrollbar-track { background: var(--surface-2); border-radius: 4px; }
  .detail-thumbs::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.4); border-radius: 4px; }
  .detail-thumbs::-webkit-scrollbar-thumb:hover { background: var(--gold); }
</style>
