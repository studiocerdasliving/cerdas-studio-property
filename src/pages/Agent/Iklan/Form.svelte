<script>
  import { navigate } from 'svelte-routing'
  import { useForm } from '../../../lib/useForm.svelte.js'
  import { apiFetch } from '../../../lib/api.js'
  import AgentLayout from '../../../components/AgentLayout.svelte'
  import { url } from '../../../lib/url.svelte.js'
  import { onMount } from 'svelte'

  let {
    property      = null,
    gambar_list   = [],
    kategori_list = [],
    provinsi_list = [],
    kabupaten_list: initKab = [],
    kecamatan_list: initKec = [],
    staff         = null,
    isEdit        = false,
    flash         = null,
    flash_type    = null,
  } = $props()

  // ── Kabupaten / Kecamatan lazy load ──
  // svelte-ignore state_referenced_locally
  let kabupatenList = $state(initKab)
  // svelte-ignore state_referenced_locally
  let kecamatanList = $state(initKec)
  let loadingKab    = $state(false)
  let loadingKec    = $state(false)

  // ── Foto-foto existing (untuk edit) ──
  // svelte-ignore state_referenced_locally
  // svelte-ignore state_referenced_locally
  let existingPhotos = $state([...gambar_list])
  /** @type {any[]} */
  let previewPhotos  = $state([])
  /** @type {HTMLInputElement | null} */
  let fileInput

  // ── Koordinat manual ──
  let gunakanKoordinat = $state(false)

  // ── Tag fasilitas ──
  let fasilitasInput = $state('')
  // svelte-ignore state_referenced_locally
  let fasilitasTags  = $state(
    property?.fasilitas_dekorasi
      ? (typeof property.fasilitas_dekorasi === 'string'
          ? JSON.parse(property.fasilitas_dekorasi)
          : property.fasilitas_dekorasi)
      : []
  )

  // ── Form ──
  // svelte-ignore state_referenced_locally
  const form = useForm({
    id_kategori_property : property?.id_kategori_property ?? '',
    kode                 : property?.kode ?? '',
    nama_property        : property?.nama_property ?? '',
    tipe                 : property?.tipe ?? 'jual',
    jenis_sewa           : property?.jenis_sewa ?? '',
    harga                : property?.harga ?? '',
    status               : property?.status ?? 1,
    surat                : property?.surat ?? '',
    lt                   : property?.lt ?? '',
    lb                   : property?.lb ?? '',
    kamar_tidur          : property?.kamar_tidur ?? '',
    kamar_mandi          : property?.kamar_mandi ?? '',
    lantai               : property?.lantai ?? 1,
    id_provinsi          : property?.id_provinsi ?? '',
    id_kabupaten         : property?.id_kabupaten ?? '',
    id_kecamatan         : property?.id_kecamatan ?? '',
    alamat               : property?.alamat ?? '',
    keywords             : property?.keywords ?? '',
    isi                  : property?.isi ?? '',
    url_tiktok           : property?.url_tiktok ?? '',
    url_youtube          : property?.url_youtube ?? '',
    url_video_tour       : property?.url_video_tour ?? '',
    // Koordinat manual
    gunakan_koordinat_manual : false,
    koordinat_keterangan     : '',
    latitude_manual          : '',
    longitude_manual         : '',
    // AI settings
    auto_ai_insight    : true,
    auto_ai_fasilitas  : true,
    auto_ai_peta       : true,
    force_regenerate_ai: false,
    // gambar akan dihandle via FormData
    fasilitas_dekorasi : [],
  })

  // Sync gunakanKoordinat ke form
  $effect(() => {
    form.data.gunakan_koordinat_manual = gunakanKoordinat
  })

  // Sync fasilitas tags ke form
  $effect(() => {
    form.data.fasilitas_dekorasi = [...fasilitasTags]
  })

  // Parse peta_map existing
  let petaMap = $derived((() => {
    try {
      if (property?.peta_map) return JSON.parse(property.peta_map)
    } catch {}
    return null
  })())

  onMount(() => {
    // Isi koordinat jika existing custom
    if (petaMap?.custom) {
      gunakanKoordinat = true
      form.data.gunakan_koordinat_manual = true
      form.data.koordinat_keterangan = petaMap.custom_address ?? petaMap.maps_query ?? ''
      form.data.latitude_manual       = petaMap.latitude ?? ''
      form.data.longitude_manual      = petaMap.longitude ?? ''
    }
  })

  // Lazy load kabupaten
  /** @param {any} e */
  async function onProvinsiChange(e) {
    const idProv = e.target.value
    form.data.id_provinsi  = idProv
    form.data.id_kabupaten = ''
    form.data.id_kecamatan = ''
    kabupatenList = []
    kecamatanList = []
    if (!idProv) return
    loadingKab = true
    try {
      const res  = await fetch(url(`/agent/api/kabupaten/${idProv}`))
      kabupatenList = await res.json()
    } catch {}
    loadingKab = false
  }

  /** @param {any} e */
  async function onKabupatenChange(e) {
    const idKab = e.target.value
    form.data.id_kabupaten = idKab
    form.data.id_kecamatan = ''
    kecamatanList = []
    if (!idKab) return
    loadingKec = true
    try {
      const res  = await fetch(url(`/agent/api/kecamatan/${idKab}`))
      kecamatanList = await res.json()
    } catch {}
    loadingKec = false
  }

  // Preview foto yang baru dipilih
  /** @param {any} e */
  function onFileChange(e) {
    const files = Array.from(e.target.files ?? [])
    previewPhotos = files.map(f => ({
      file: f,
      url:  URL.createObjectURL(f),
      name: f.name,
    }))
  }

  /** @param {number} idx */
  function removePreviewPhoto(idx) {
    previewPhotos = previewPhotos.filter((_, i) => i !== idx)
    // Hapus dari file input (buat ulang FileList tidak bisa, jadi kosongkan saja)
    if (previewPhotos.length === 0 && fileInput) {
      fileInput.value = ''
    }
  }

  /** @param {any} e */
  function addFasilitasTag(e) {
    if ((e.key === 'Enter' || e.key === ',') && fasilitasInput.trim()) {
      e.preventDefault()
      const val = fasilitasInput.trim().replace(/,$/, '')
      if (val && !fasilitasTags.includes(val)) {
        fasilitasTags = [...fasilitasTags, val]
      }
      fasilitasInput = ''
    }
  }

  /** @param {string} tag */
  function removeTag(tag) {
    fasilitasTags = fasilitasTags.filter((/** @type {string} */ t) => t !== tag)
  }

  // Hapus foto existing via AJAX
  /** @param {any} photo */
  function deleteExistingPhoto(photo) {
    if (!confirm('Hapus foto ini?')) return
    if (!photo.id) {
      existingPhotos = existingPhotos.filter((/** @type {any} */ p) => p !== photo)
      return
    }
    apiFetch(url(`/agent/iklan/gambar/${photo.id}`), { method: 'DELETE' })
      .then(() => {
        existingPhotos = existingPhotos.filter((/** @type {any} */ p) => p !== photo)
      })
      .catch((err) => {
         alert('Gagal menghapus: ' + err.message);
      });
  }

  // Submit form (multipart)
  /** @param {any} e */
  function handleSubmit(e) {
    e.preventDefault()
    const opts = {
      forceFormData: true,
      preserveScroll: true,
      onError: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      },
    }
    if (isEdit) {
      form.post(url(`/agent/iklan/${property.id_property}?_method=PUT`), opts)
    } else {
      form.post(url('/agent/iklan'), opts)
    }
  }

  let showFlash = $state(true)
  $effect(() => {
    if (flash) {
      showFlash = true
      const t = setTimeout(() => showFlash = false, 5000)
      return () => clearTimeout(t)
    }
  })

  let pageTitle = $derived(isEdit ? `Edit Iklan` : 'Pasang Iklan Baru')
</script>

<svelte:head><title>{pageTitle} — Agent Portal</title></svelte:head>

<AgentLayout title={pageTitle}>
  <!-- Flash -->
  {#if flash && showFlash}
    <div class="flash {flash_type === 'error' ? 'flash-error' : 'flash-success'}">
      <span class="material-symbols-rounded">{flash_type === 'error' ? 'error' : 'check_circle'}</span>
      <span>{flash}</span>
      <button onclick={() => showFlash = false} class="flash-close">
        <span class="material-symbols-rounded">close</span>
      </button>
    </div>
  {/if}

  <!-- Error summary -->
  {#if Object.keys(form.errors).length > 0}
    <div class="error-summary">
      <span class="material-symbols-rounded" style="font-size:20px">error</span>
      <div>
        <div class="error-sum-title">Mohon periksa isian form:</div>
        <ul class="error-sum-list">
          {#each Object.values(form.errors) as err}
            <li>{err}</li>
          {/each}
        </ul>
      </div>
    </div>
  {/if}

  <form onsubmit={handleSubmit} enctype="multipart/form-data">

    <!-- ═══ SECTION 1: Informasi Dasar ═══ -->
    <div class="form-section">
      <div class="section-head">
        <span class="material-symbols-rounded sec-icon">article</span>
        <h2 class="sec-title">Informasi Dasar</h2>
      </div>
      <div class="form-grid-2">
        <!-- Nama -->
        <div class="field-group col-full">
          <label class="field-label" for="nama_property">Nama Properti <span class="req">*</span></label>
          <input
            id="nama_property"
            name="nama_property"
            type="text"
            class="field-input {form.errors.nama_property ? 'has-error' : ''}"
            bind:value={form.data.nama_property}
            placeholder="Contoh: Rumah 2 Lantai di Cluster Visalia Kota Wisata"
          />
          {#if form.errors.nama_property}<span class="field-err">{form.errors.nama_property}</span>{/if}
        </div>

        <!-- Kategori -->
        <div class="field-group">
          <label class="field-label" for="id_kategori_property">Kategori <span class="req">*</span></label>
          <select id="id_kategori_property" name="id_kategori_property" class="field-select {form.errors.id_kategori_property ? 'has-error' : ''}" bind:value={form.data.id_kategori_property}>
            <option value="">-- Pilih Kategori --</option>
            {#each kategori_list as kat}
              <option value={kat.id_kategori_property}>{kat.nama_kategori_property}</option>
            {/each}
          </select>
          {#if form.errors.id_kategori_property}<span class="field-err">{form.errors.id_kategori_property}</span>{/if}
        </div>

        <!-- Kode -->
        <div class="field-group">
          <label class="field-label" for="kode">Kode Iklan</label>
          <input id="kode" name="kode" type="text" class="field-input" bind:value={form.data.kode} placeholder="Auto-generate jika kosong" />
        </div>

        <!-- Tipe -->
        <div class="field-group">
          <span class="field-label">Tipe <span class="req">*</span></span>
          <div class="radio-group">
            <label class="radio-opt {form.data.tipe === 'jual' ? 'active' : ''}">
              <input type="radio" name="tipe" value="jual" bind:group={form.data.tipe} hidden />
              <span class="material-symbols-rounded" style="font-size:17px">sell</span>
              Dijual
            </label>
            <label class="radio-opt {form.data.tipe === 'sewa' ? 'active' : ''}">
              <input type="radio" name="tipe" value="sewa" bind:group={form.data.tipe} hidden />
              <span class="material-symbols-rounded" style="font-size:17px">key</span>
              Disewa
            </label>
          </div>
        </div>

        <!-- Harga -->
        <div class="field-group">
          <label class="field-label" for="harga">Harga (Rp) <span class="req">*</span></label>
          <div class="input-prefix-wrap">
            <span class="input-prefix">Rp</span>
            <input id="harga" name="harga" type="number" class="field-input with-prefix {form.errors.harga ? 'has-error' : ''}" bind:value={form.data.harga} placeholder="0" min="0" />
          </div>
          {#if form.errors.harga}<span class="field-err">{form.errors.harga}</span>{/if}
        </div>

        <!-- Jenis Sewa (hanya tampil jika tipe = sewa) -->
        {#if form.data.tipe === 'sewa'}
          <div class="field-group">
            <label class="field-label" for="jenis_sewa">Jenis Sewa</label>
            <select id="jenis_sewa" name="jenis_sewa" class="field-select" bind:value={form.data.jenis_sewa}>
              <option value="">-- Pilih --</option>
              <option value="Bulanan">Per Bulan</option>
              <option value="Tahunan">Per Tahun</option>
              <option value="Harian">Per Hari</option>
            </select>
          </div>
        {/if}

        <!-- Sertifikat -->
        <div class="field-group">
          <label class="field-label" for="surat">Sertifikat</label>
          <select id="surat" name="surat" class="field-select" bind:value={form.data.surat}>
            <option value="">-- Pilih Sertifikat --</option>
            <option>SHM</option>
            <option>HGB</option>
            <option>SHGB</option>
            <option>AJB</option>
            <option>Girik</option>
            <option>PPJB</option>
          </select>
        </div>

        <!-- Status Iklan Dihilangkan, default Aktif -->
      </div>
    </div>

    <!-- ═══ SECTION 2: Spesifikasi ═══ -->
    <div class="form-section">
      <div class="section-head">
        <span class="material-symbols-rounded sec-icon">straighten</span>
        <h2 class="sec-title">Spesifikasi Properti</h2>
      </div>
      <div class="form-grid-3">
        <div class="field-group">
          <label class="field-label" for="lt">Luas Tanah (m²)</label>
          <input id="lt" name="lt" type="number" class="field-input" bind:value={form.data.lt} placeholder="0" min="0" />
        </div>
        <div class="field-group">
          <label class="field-label" for="lb">Luas Bangunan (m²)</label>
          <input id="lb" name="lb" type="number" class="field-input" bind:value={form.data.lb} placeholder="0" min="0" />
        </div>
        <div class="field-group">
          <label class="field-label" for="kamar_tidur">Kamar Tidur</label>
          <input id="kamar_tidur" name="kamar_tidur" type="number" class="field-input" bind:value={form.data.kamar_tidur} placeholder="0" min="0" />
        </div>
        <div class="field-group">
          <label class="field-label" for="kamar_mandi">Kamar Mandi</label>
          <input id="kamar_mandi" name="kamar_mandi" type="number" class="field-input" bind:value={form.data.kamar_mandi} placeholder="0" min="0" />
        </div>
        <div class="field-group">
          <label class="field-label" for="lantai">Jumlah Lantai</label>
          <input id="lantai" name="lantai" type="number" class="field-input" bind:value={form.data.lantai} placeholder="1" min="1" />
        </div>
      </div>
    </div>

    <!-- ═══ SECTION 3: Lokasi ═══ -->
    <div class="form-section">
      <div class="section-head">
        <span class="material-symbols-rounded sec-icon">location_on</span>
        <h2 class="sec-title">Lokasi Properti</h2>
      </div>
      <div class="form-grid-3">
        <!-- Provinsi -->
        <div class="field-group">
          <label class="field-label" for="id_provinsi">Provinsi <span class="req">*</span></label>
          <select
            id="id_provinsi"
            name="id_provinsi"
            class="field-select {form.errors.id_provinsi ? 'has-error' : ''}"
            bind:value={form.data.id_provinsi}
            onchange={onProvinsiChange}
          >
            <option value="">-- Pilih Provinsi --</option>
            {#each provinsi_list as prov}
              <option value={prov.id}>{prov.nama}</option>
            {/each}
          </select>
          {#if form.errors.id_provinsi}<span class="field-err">{form.errors.id_provinsi}</span>{/if}
        </div>

        <!-- Kabupaten -->
        <div class="field-group">
          <label class="field-label" for="id_kabupaten">Kabupaten/Kota <span class="req">*</span></label>
          <select
            id="id_kabupaten"
            name="id_kabupaten"
            class="field-select {form.errors.id_kabupaten ? 'has-error' : ''}"
            bind:value={form.data.id_kabupaten}
            onchange={onKabupatenChange}
            disabled={loadingKab || kabupatenList.length === 0}
          >
            <option value="">{loadingKab ? 'Memuat...' : '-- Pilih Kabupaten --'}</option>
            {#each kabupatenList as kab}
              <option value={kab.id}>{kab.nama}</option>
            {/each}
          </select>
          {#if form.errors.id_kabupaten}<span class="field-err">{form.errors.id_kabupaten}</span>{/if}
        </div>

        <!-- Kecamatan -->
        <div class="field-group">
          <label class="field-label" for="id_kecamatan">Kecamatan <span class="req">*</span></label>
          <select
            id="id_kecamatan"
            name="id_kecamatan"
            class="field-select {form.errors.id_kecamatan ? 'has-error' : ''}"
            bind:value={form.data.id_kecamatan}
            disabled={loadingKec || kecamatanList.length === 0}
          >
            <option value="">{loadingKec ? 'Memuat...' : '-- Pilih Kecamatan --'}</option>
            {#each kecamatanList as kec}
              <option value={kec.id}>{kec.nama}</option>
            {/each}
          </select>
          {#if form.errors.id_kecamatan}<span class="field-err">{form.errors.id_kecamatan}</span>{/if}
        </div>

        <!-- Alamat full -->
        <div class="field-group col-full-3">
          <label class="field-label" for="alamat">Alamat Lengkap <span class="req">*</span></label>
          <textarea
            id="alamat"
            name="alamat"
            class="field-textarea {form.errors.alamat ? 'has-error' : ''}"
            bind:value={form.data.alamat}
            rows="3"
            placeholder="Contoh: Jl. Raya Kota Wisata Blok C No. 12, Cileungsi, Bogor"
          ></textarea>
          {#if form.errors.alamat}<span class="field-err">{form.errors.alamat}</span>{/if}
        </div>
      </div>
    </div>

    <!-- ═══ SECTION 4: Peta Lokasi ═══ -->
    <div class="form-section">
      <div class="section-head">
        <span class="material-symbols-rounded sec-icon">map</span>
        <h2 class="sec-title">Peta Lokasi</h2>
      </div>

      <!-- Checkbox gunakan koordinat sendiri -->
      <div class="koordinat-toggle">
        <div class="toggle-switch {gunakanKoordinat ? 'on' : 'off'}" onclick={() => gunakanKoordinat = !gunakanKoordinat} role="switch" aria-checked={gunakanKoordinat} tabindex="0" onkeydown={(e) => e.key === 'Enter' && (gunakanKoordinat = !gunakanKoordinat)}>
          <div class="toggle-thumb"></div>
        </div>
        <div class="toggle-label-wrap">
          <span class="toggle-label">Gunakan koordinat peta dari saya</span>
          <span class="toggle-sub">Centang jika ingin menentukan koordinat sendiri. Jika dicentang, AI tidak akan generate peta otomatis.</span>
        </div>
      </div>

      {#if gunakanKoordinat}
        <div class="koordinat-form form-grid-3">
          <!-- Keterangan Lokasi -->
          <div class="field-group col-full-3">
            <label class="field-label" for="koordinat_keterangan">Nama / Keterangan Lokasi</label>
            <input
              id="koordinat_keterangan"
              name="koordinat_keterangan"
              type="text"
              class="field-input"
              bind:value={form.data.koordinat_keterangan}
              placeholder="Contoh: Cluster Nebraska Kota Wisata, Cileungsi"
            />
          </div>

          <!-- Latitude -->
          <div class="field-group">
            <label class="field-label" for="latitude_manual">Latitude</label>
            <input
              id="latitude_manual"
              name="latitude_manual"
              type="number"
              step="any"
              class="field-input"
              bind:value={form.data.latitude_manual}
              placeholder="-6.302..."
            />
          </div>

          <!-- Longitude -->
          <div class="field-group">
            <label class="field-label" for="longitude_manual">Longitude</label>
            <input
              id="longitude_manual"
              name="longitude_manual"
              type="number"
              step="any"
              class="field-input"
              bind:value={form.data.longitude_manual}
              placeholder="106.652..."
            />
          </div>

          <!-- Preview Map jika ada koordinat -->
          {#if form.data.latitude_manual && form.data.longitude_manual}
            <div class="col-full-3">
              <a
                href="https://www.google.com/maps?q={form.data.latitude_manual},{form.data.longitude_manual}"
                target="_blank"
                class="preview-map-link"
              >
                <span class="material-symbols-rounded" style="font-size:16px">open_in_new</span>
                Verifikasi di Google Maps
              </a>
            </div>
          {/if}

          <!-- Tip -->
          <div class="tip-box col-full-3">
            <span class="material-symbols-rounded" style="font-size:16px;color:#C9A84C">lightbulb</span>
            <span>
              <strong>Cara mendapatkan koordinat:</strong> Buka Google Maps → klik titik lokasi →
              koordinat muncul di URL atau di info card bawah. Contoh: <code>-6.3021, 106.6524</code>
            </span>
          </div>
        </div>
      {:else}
        <div class="ai-auto-note">
          <span class="material-symbols-rounded" style="font-size:18px;color:#7C3AED">auto_awesome</span>
          <span>Koordinat peta akan di-generate otomatis oleh <strong>Cerdas AI</strong> jika tidak memberikan koordinat dengan berdasarkan lokasi properti.</span>
        </div>
      {/if}
    </div>

    <!-- ═══ SECTION 5: Deskripsi & Fasilitas ═══ -->
    <div class="form-section">
      <div class="section-head">
        <span class="material-symbols-rounded sec-icon">description</span>
        <h2 class="sec-title">Deskripsi & Fasilitas</h2>
      </div>

      <!-- Fasilitas Dekorasi (tag input) -->
      <div class="field-group" style="margin-bottom:16px">
        <span class="field-label">Fasilitas Interior (tag)</span>
        <div class="tag-input-wrap">
          {#each fasilitasTags as tag}
            <span class="tag">
              {tag}
              <button type="button" onclick={() => removeTag(tag)} class="tag-remove">×</button>
            </span>
          {/each}
          <input
            type="text"
            class="tag-input"
            bind:value={fasilitasInput}
            onkeydown={addFasilitasTag}
            placeholder="Ketik lalu tekan Enter..."
          />
        </div>
        <p class="field-hint">Contoh: Carport, Water Heater, AC, Shower, Taman</p>
      </div>

      <!-- Hidden input untuk fasilitas_dekorasi -->
      {#each fasilitasTags as tag, i}
        <input type="hidden" name="fasilitas_dekorasi[]" value={tag} />
      {/each}

      <!-- Deskripsi -->
      <div class="field-group">
        <label class="field-label" for="isi">Deskripsi Properti</label>
        <textarea
          id="isi"
          name="isi"
          class="field-textarea"
          bind:value={form.data.isi}
          rows="5"
          placeholder="Tuliskan detail lengkap tentang properti ini..."
        ></textarea>
      </div>

      <!-- Keywords -->
      <div class="field-group" style="margin-top:16px">
        <label class="field-label" for="keywords">Keywords SEO</label>
        <input
          id="keywords"
          name="keywords"
          type="text"
          class="field-input"
          bind:value={form.data.keywords}
          placeholder="Contoh: rumah bogor, kota wisata, cluster visalia"
        />
        <p class="field-hint">Pisahkan dengan koma. Membantu pencarian di Google.</p>
      </div>
    </div>

    <!-- ═══ SECTION 5.5: Media Sosial & Virtual Tour ═══ -->
    <div class="form-section">
      <div class="section-head">
        <span class="material-symbols-rounded sec-icon">smart_display</span>
        <h2 class="sec-title">Media Sosial & Virtual Tour</h2>
      </div>
      <div class="form-grid-2">
        <div class="field-group">
          <label class="field-label" for="url_tiktok">URL TikTok</label>
          <input
            id="url_tiktok"
            name="url_tiktok"
            type="url"
            class="field-input"
            bind:value={form.data.url_tiktok}
            placeholder="Contoh: https://www.tiktok.com/@akun/video/..."
          />
        </div>
        <div class="field-group">
          <label class="field-label" for="url_youtube">URL YouTube</label>
          <input
            id="url_youtube"
            name="url_youtube"
            type="url"
            class="field-input"
            bind:value={form.data.url_youtube}
            placeholder="Contoh: https://www.youtube.com/watch?v=..."
          />
        </div>
        <div class="field-group col-full">
          <label class="field-label" for="url_video_tour">URL Video Tour 360</label>
          <input
            id="url_video_tour"
            name="url_video_tour"
            type="url"
            class="field-input"
            bind:value={form.data.url_video_tour}
            placeholder="Contoh: https://my.matterport.com/show/?m=..."
          />
        </div>
      </div>
    </div>

    <!-- ═══ SECTION 6: Upload Foto ═══ -->
    <div class="form-section">
      <div class="section-head">
        <span class="material-symbols-rounded sec-icon">photo_library</span>
        <h2 class="sec-title">Foto Properti</h2>
      </div>

      <!-- Foto existing (edit mode) -->
      {#if existingPhotos.length > 0}
        <div class="photos-existing">
          <p class="photos-existing-label">Foto yang sudah ada:</p>
          <div class="photos-grid">
            {#each existingPhotos as photo, idx}
              <div class="photo-item {idx === 0 ? 'is-cover' : ''}">
                {#if idx === 0}
                  <div class="cover-badge">COVER</div>
                {/if}
                <img
                  src="/upload/property/{photo.file}"
                  alt="Foto {idx+1}"
                  onerror={/** @param {any} e */ (e) => { e.currentTarget.src='https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=150&q=60' }}
                />
                <button
                  type="button"
                  class="photo-delete"
                  onclick={() => deleteExistingPhoto(photo)}
                  title="Hapus foto"
                >
                  <span class="material-symbols-rounded">close</span>
                </button>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Upload baru -->
      <div class="upload-zone" onclick={() => fileInput?.click()} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && fileInput?.click()}>
        <input
          type="file"
          name="gambar[]"
          multiple
          accept="image/jpeg,image/png,image/jpg,image/webp"
          onchange={onFileChange}
          bind:this={fileInput}
          hidden
        />
        <span class="material-symbols-rounded upload-ico">cloud_upload</span>
        <div class="upload-text">
          <strong>Klik atau drag foto di sini</strong>
          <span>JPG, PNG, WEBP — bisa pilih banyak foto sekaligus</span>
          {#if isEdit}
            <span class="upload-note">Foto baru akan ditambahkan, foto lama tidak dihapus</span>
          {:else}
            <span class="upload-note">Foto pertama = Cover / Foto Utama</span>
          {/if}
        </div>
      </div>

      <!-- Preview foto baru -->
      {#if previewPhotos.length > 0}
        <div class="photos-preview">
          <p class="photos-existing-label">Foto akan diupload ({previewPhotos.length}):</p>
          <div class="photos-grid">
            {#each previewPhotos as photo, idx}
              <div class="photo-item {idx === 0 && existingPhotos.length === 0 ? 'is-cover' : ''}">
                {#if idx === 0 && existingPhotos.length === 0}
                  <div class="cover-badge">COVER</div>
                {/if}
                <img src={photo.url} alt={photo.name} />
                <button type="button" class="photo-delete" onclick={() => removePreviewPhoto(idx)}>
                  <span class="material-symbols-rounded">close</span>
                </button>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- ═══ SECTION 7: Cerdas AI Settings ═══ -->
    <div class="form-section ai-section">
      <div class="section-head">
        <span class="material-symbols-rounded sec-icon" style="color:#7C3AED">auto_awesome</span>
        <h2 class="sec-title">Cerdas AI — Pengaturan Analisis Otomatis</h2>
      </div>
      <p class="ai-desc">
        Setelah menyimpan iklan, Cerdas AI akan otomatis menganalisis properti dan mengisi konten berikut.
        Proses membutuhkan 15-60 detik.
      </p>

      <div class="ai-checks">
        <label class="ai-check-item disabled">
          <input type="checkbox" name="auto_ai_insight" bind:checked={form.data.auto_ai_insight} disabled />
          <div class="ai-check-body">
            <span class="material-symbols-rounded" style="font-size:18px;color:#C9A84C">trending_up</span>
            <div>
              <div class="ai-check-title">AI Insight (Skor Investasi)</div>
              <div class="ai-check-sub">Skor investasi 0-100, analisis pasar, rekomendasi</div>
            </div>
          </div>
        </label>

        <label class="ai-check-item disabled">
          <input type="checkbox" name="auto_ai_fasilitas" bind:checked={form.data.auto_ai_fasilitas} disabled />
          <div class="ai-check-body">
            <span class="material-symbols-rounded" style="font-size:18px;color:#16A34A">restaurant</span>
            <div>
              <div class="ai-check-title">Fasilitas di Sekitar</div>
              <div class="ai-check-sub">Mall, sekolah, RS, kuliner, bank, dll.</div>
            </div>
          </div>
        </label>

        {#if !gunakanKoordinat}
          <label class="ai-check-item disabled">
            <input type="checkbox" name="auto_ai_peta" bind:checked={form.data.auto_ai_peta} disabled />
            <div class="ai-check-body">
              <span class="material-symbols-rounded" style="font-size:18px;color:#2563EB">location_on</span>
              <div>
                <div class="ai-check-title">Peta Lokasi (AI)</div>
                <div class="ai-check-sub">Koordinat lokasi otomatis dari nama & alamat. (Akan digenerate AI jika tidak memberikan koordinat lokasi secara manual)</div>
              </div>
            </div>
          </label>
        {:else}
          <div class="ai-check-item disabled">
            <div class="ai-check-body">
              <span class="material-symbols-rounded" style="font-size:18px;color:#9CA3AF">location_off</span>
              <div>
                <div class="ai-check-title" style="color:#9CA3AF">Peta Lokasi (Dinonaktifkan)</div>
                <div class="ai-check-sub">Anda memilih input koordinat sendiri — AI peta tidak dijalankan.</div>
              </div>
            </div>
          </div>
        {/if}

        {#if isEdit}
          <label class="ai-check-item ai-force">
            <input type="checkbox" name="force_regenerate_ai" bind:checked={form.data.force_regenerate_ai} />
            <div class="ai-check-body">
              <span class="material-symbols-rounded" style="font-size:18px;color:#DC2626">refresh</span>
              <div>
                <div class="ai-check-title">Regenerate Ulang Semua AI</div>
                <div class="ai-check-sub">Hapus data AI lama dan generate ulang. Gunakan jika data berubah signifikan.</div>
              </div>
            </div>
          </label>
        {/if}
      </div>
    </div>

    <!-- ═══ TOMBOL AKSI ═══ -->
    <div class="form-actions">
      <a href={url('/agent/iklan')} class="btn-cancel">
        <span class="material-symbols-rounded">arrow_back</span>
        Batal
      </a>
      {#if isEdit && property}
        <a
          href={url(`/agent/iklan/${property.id_property}/preview`)}
          target="_blank"
          class="btn-preview"
        >
          <span class="material-symbols-rounded">visibility</span>
          Preview Iklan
        </a>
      {/if}
      <button type="submit" disabled={form.processing} class="btn-submit">
        {#if form.processing}
          <span class="material-symbols-rounded spin">progress_activity</span>
          {isEdit ? 'Menyimpan...' : 'Menambahkan Iklan...'}
        {:else}
          <span class="material-symbols-rounded">save</span>
          {isEdit ? 'Simpan Perubahan' : 'Pasang Iklan'}
        {/if}
      </button>
    </div>

  </form>
</AgentLayout>

<style>
  /* ─── Form Section ──────────────────────────── */
  .form-section {
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #E8E0D0;
    padding: 24px;
    margin-bottom: 16px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  }
  .section-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    padding-bottom: 14px;
    border-bottom: 1px solid #F0EAE0;
  }
  .sec-icon {
    font-size: 22px;
    color: #C9A84C;
    font-variation-settings: 'FILL' 1;
  }
  .sec-title {
    font-family: 'Playfair Display', serif;
    font-size: 1rem;
    font-weight: 700;
    color: #1A1A1A;
    margin: 0;
  }

  /* ─── Grid ──────────────────────────────────── */
  .form-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .form-grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
  }
  .col-full   { grid-column: 1 / -1; }
  .col-full-3 { grid-column: 1 / -1; }

  /* ─── Fields ────────────────────────────────── */
  .field-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .field-label {
    font-size: 0.77rem;
    font-weight: 700;
    color: #4A4A4A;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .req { color: #DC2626; }

  .field-input, .field-select, .field-textarea {
    padding: 10px 14px;
    border: 1.5px solid #E8E0D0;
    border-radius: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    color: #1A1A1A;
    background: #FAFAFA;
    outline: none;
    transition: all 0.2s;
    width: 100%;
    box-sizing: border-box;
  }
  .field-input:focus, .field-select:focus, .field-textarea:focus {
    border-color: #C9A84C;
    background: #FFF;
    box-shadow: 0 0 0 3px rgba(201,168,76,0.1);
  }
  .field-input.has-error, .field-select.has-error, .field-textarea.has-error {
    border-color: #EF4444;
  }
  .field-textarea { resize: vertical; min-height: 90px; }
  .field-err  { font-size: 0.78rem; color: #DC2626; }
  .field-hint { font-size: 0.75rem; color: #9CA3AF; margin: 0; }

  /* Prefix input */
  .input-prefix-wrap { position: relative; }
  .input-prefix {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.85rem;
    font-weight: 600;
    color: #B8A882;
  }
  .field-input.with-prefix { padding-left: 36px; }

  /* Radio group */
  .radio-group { display: flex; gap: 8px; flex-wrap: wrap; }
  .radio-opt {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 10px;
    border: 1.5px solid #E8E0D0;
    cursor: pointer;
    font-size: 0.86rem;
    font-weight: 500;
    color: #6B6B6B;
    transition: all 0.2s;
    background: #FAF8F5;
  }
  .radio-opt.active {
    background: #FDF6E4;
    border-color: #C9A84C;
    color: #8B6914;
    font-weight: 700;
  }

  /* ─── Koordinat Toggle ──────────────────────── */
  .koordinat-toggle {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    cursor: pointer;
    margin-bottom: 16px;
    padding: 14px;
    border-radius: 12px;
    background: #FAF8F5;
    border: 1.5px solid #E8E0D0;
    transition: border-color 0.2s;
  }
  .koordinat-toggle:hover { border-color: #C9A84C; }
  .toggle-switch {
    width: 44px;
    height: 24px;
    border-radius: 12px;
    background: #D1D5DB;
    position: relative;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.3s;
    margin-top: 2px;
  }
  .toggle-switch.on { background: #C9A84C; }
  .toggle-thumb {
    position: absolute;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: white;
    top: 3px;
    left: 3px;
    transition: transform 0.3s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  .toggle-switch.on .toggle-thumb { transform: translateX(20px); }
  .toggle-label-wrap { flex: 1; }
  .toggle-label { font-weight: 600; font-size: 0.9rem; color: #1A1A1A; display: block; }
  .toggle-sub   { font-size: 0.78rem; color: #9CA3AF; margin-top: 2px; display: block; }

  .koordinat-form { margin-top: 0; }
  .tip-box {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 14px;
    background: #FDF6E4;
    border-radius: 10px;
    border: 1px solid #EFE0B0;
    font-size: 0.8rem;
    color: #7B6A40;
  }
  .tip-box code { background: #EFE0B0; padding: 1px 6px; border-radius: 4px; font-size: 0.78rem; }

  .ai-auto-note {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: #F5F3FF;
    border: 1px solid #DDD6FE;
    border-radius: 10px;
    font-size: 0.85rem;
    color: #5B21B6;
  }

  .preview-map-link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.8rem;
    color: #C9A84C;
    font-weight: 600;
    text-decoration: none;
  }
  .preview-map-link:hover { text-decoration: underline; }

  /* ─── Tag Input ─────────────────────────────── */
  .tag-input-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 8px 10px;
    border: 1.5px solid #E8E0D0;
    border-radius: 10px;
    background: #FAFAFA;
    min-height: 44px;
    align-items: center;
    cursor: text;
    transition: border-color 0.2s;
  }
  .tag-input-wrap:focus-within { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.1); }
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    background: #FDF6E4;
    border: 1px solid #E8C87A;
    border-radius: 20px;
    font-size: 0.8rem;
    color: #8B6914;
    font-weight: 500;
  }
  .tag-remove {
    background: none;
    border: none;
    cursor: pointer;
    color: #B8A882;
    padding: 0;
    font-size: 14px;
    line-height: 1;
  }
  .tag-remove:hover { color: #DC2626; }
  .tag-input {
    border: none;
    outline: none;
    background: transparent;
    font-family: 'Inter', sans-serif;
    font-size: 0.88rem;
    flex: 1;
    min-width: 120px;
    color: #1A1A1A;
  }

  /* ─── Foto Upload ────────────────────────────── */
  .photos-existing { margin-bottom: 16px; }
  .photos-existing-label {
    font-size: 0.78rem;
    font-weight: 600;
    color: #6B6B6B;
    margin: 0 0 10px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .photos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 10px;
  }
  .photo-item {
    position: relative;
    aspect-ratio: 4/3;
    border-radius: 10px;
    overflow: hidden;
    border: 2px solid #E8E0D0;
  }
  .photo-item.is-cover { border-color: #C9A84C; }
  .photo-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .cover-badge {
    position: absolute;
    top: 6px;
    left: 6px;
    background: #C9A84C;
    color: white;
    font-size: 0.62rem;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 4px;
    letter-spacing: 0.5px;
  }
  .photo-delete {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(220,38,38,0.85);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: all 0.2s;
  }
  .photo-delete:hover { background: #B91C1C; }
  .photo-delete .material-symbols-rounded { font-size: 13px; }

  .photos-preview { margin-top: 14px; }

  .upload-zone {
    border: 2px dashed #D4C5A0;
    border-radius: 14px;
    padding: 28px 20px;
    text-align: center;
    cursor: pointer;
    background: #FAF8F5;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .upload-zone:hover { border-color: #C9A84C; background: #FDF6E4; }
  .upload-ico {
    font-size: 36px;
    color: #C9A84C;
    font-variation-settings: 'FILL' 1;
  }
  .upload-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 0.85rem;
    color: #6B6B6B;
  }
  .upload-text strong { color: #1A1A1A; }
  .upload-note { font-size: 0.75rem; color: #C9A84C; font-weight: 600; }

  /* ─── AI Section ─────────────────────────────── */
  .ai-section { border-color: #DDD6FE; background: linear-gradient(135deg, #F9F8FF, #F5F3FF); }
  .ai-section .sec-icon { color: #7C3AED; }
  .ai-desc {
    font-size: 0.85rem;
    color: #6B6B6B;
    margin: 0 0 16px;
    padding: 10px 14px;
    background: rgba(255,255,255,0.7);
    border-radius: 8px;
    border: 1px solid #E5E7EB;
  }
  .ai-checks { display: flex; flex-direction: column; gap: 10px; }
  .ai-check-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.8);
    border-radius: 12px;
    border: 1.5px solid #E5E7EB;
    cursor: pointer;
    transition: all 0.2s;
  }
  .ai-check-item:hover { border-color: #7C3AED; background: #fff; }
  .ai-check-item input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #7C3AED;
    cursor: pointer;
    flex-shrink: 0;
  }
  .ai-check-body { display: flex; align-items: center; gap: 12px; flex: 1; }
  .ai-check-title { font-size: 0.88rem; font-weight: 600; color: #1A1A1A; }
  .ai-check-sub   { font-size: 0.76rem; color: #9CA3AF; }
  .ai-check-item.disabled { opacity: 0.6; cursor: default; pointer-events: none; }
  .ai-force { border-color: #FECACA; background: #FFF9F9; }
  .ai-force:hover { border-color: #DC2626; }

  /* ─── Form Actions ───────────────────────────── */
  .form-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 8px;
  }
  .btn-cancel {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    border-radius: 10px;
    border: 1.5px solid #E8E0D0;
    background: #FAF8F5;
    color: #6B6B6B;
    font-size: 0.88rem;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s;
  }
  .btn-cancel:hover { color: #1A1A1A; border-color: #C9A84C; }
  .btn-cancel .material-symbols-rounded { font-size: 17px; }

  .btn-preview {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    border-radius: 10px;
    border: 1.5px solid #7C3AED;
    background: #F5F3FF;
    color: #7C3AED;
    font-size: 0.88rem;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s;
  }
  .btn-preview:hover { background: #EDE9FE; }
  .btn-preview .material-symbols-rounded { font-size: 17px; }

  .btn-submit {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 11px 24px;
    background: linear-gradient(135deg, #C9A84C, #E0B850);
    color: white;
    border: none;
    border-radius: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 0.92rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(201,168,76,0.35);
  }
  .btn-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(201,168,76,0.45);
  }
  .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
  .btn-submit .material-symbols-rounded { font-size: 19px; }

  /* Flash & Errors */
  .flash {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-radius: 12px;
    margin-bottom: 16px;
    font-size: 0.88rem;
    font-weight: 500;
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

  .error-summary {
    display: flex;
    gap: 12px;
    padding: 14px 16px;
    background: #FEF2F2;
    border: 1px solid #FECACA;
    border-radius: 12px;
    margin-bottom: 16px;
    color: #B91C1C;
  }
  .error-sum-title { font-weight: 700; font-size: 0.88rem; margin-bottom: 4px; }
  .error-sum-list  { margin: 0; padding-left: 18px; font-size: 0.82rem; }
  .error-sum-list li { margin-bottom: 2px; }

  /* Spin */
  .spin { animation: spin 1s linear infinite; display: inline-flex; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Responsive */
  @media (max-width: 768px) {
    .form-grid-2, .form-grid-3 { grid-template-columns: 1fr; }
    .col-full-3 { grid-column: auto; }
    .form-actions { flex-direction: column; align-items: stretch; }
    .btn-submit, .btn-preview, .btn-cancel { justify-content: center; }
  }
</style>
