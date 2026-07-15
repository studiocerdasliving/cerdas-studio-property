<script>
  import AgentLayout from "../../../components/AgentLayout.svelte";
  import { apiFetch } from "../../../lib/api.js";
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import { url } from "../../../lib/url.svelte.js";

  let form = $state({
    nama_property: "",
    id_kategori_property: "",
    tipe: "jual",
    harga: "",
    lt: "",
    lb: "",
    kamar_tidur: "",
    kamar_mandi: "",
    jumlah_lantai: "",
    daya_listrik: "",
    surat: "SHM",
    kondisi_properti: "",
    id_provinsi: "",
    id_kabupaten: "",
    id_kecamatan: "",
    alamat: "",
    jalan: "",
    cluster: "",
    fasilitas: [],
    isi: "",
    latitude: -6.2,
    longitude: 106.816666,
  });

  /** @type {{id: number, file: File, url: string}[]} */
  let selectedFiles = $state([]);
  let nextFileId = 0;
  let dragHover = $state(false);
  let draggedItemIndex = $state(null);

  /** @type {any[]} */
  let provinsiList = $state([]);
  /** @type {any[]} */
  let kabupatenList = $state([]);
  /** @type {any[]} */
  let kecamatanList = $state([]);
  /** @type {any[]} */
  let kategoriList = $state([]);

  const fasilitasOptions = [
    "Carport",
    "Garasi",
    "Taman",
    "Kolam Renang",
    "AC",
    "Water Heater",
    "Keamanan 24 Jam",
    "CCTV",
    "Gym",
    "Playground",
    "Balkon",
    "Dapur Bersih",
    "Ruang Tamu",
    "Lainnya",
  ];

  let isSubmitting = $state(false);
  let isPreviewing = $state(false);
  let errorMsg = $state("");

  let showMapPicker = $state(false);
  let isAiProcessing = $state(false);

  $effect(() => {
    if (form.id_provinsi) {
      loadKabupaten();
    } else {
      form.id_kabupaten = "";
      form.id_kecamatan = "";
      kabupatenList = [];
      kecamatanList = [];
    }
  });

  $effect(() => {
    if (form.id_kabupaten) {
      loadKecamatan();
    } else {
      form.id_kecamatan = "";
      kecamatanList = [];
    }
  });

  onMount(async () => {
    try {
      const [prov, kat] = await Promise.all([
        apiFetch("/provinsi"),
        apiFetch("/kategori"),
      ]);
      provinsiList = prov || [];
      kategoriList = kat || [];

      // Load draft if exists
      const savedDraft = localStorage.getItem('draft_iklan_property');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          form = { ...form, ...parsed };
        } catch(e) {
          console.error("Gagal membaca draft", e);
        }
      }

    } catch (e) {
      console.error(e);
    }
  });

  async function loadKabupaten() {
    try {
      kabupatenList = await apiFetch(
        `/kabupaten?id_provinsi=${form.id_provinsi}`,
      );
    } catch (e) {
      console.error(e);
    }
  }

  async function loadKecamatan() {
    try {
      kecamatanList = await apiFetch(
        `/kecamatan?id_kabupaten=${form.id_kabupaten}`,
      );
    } catch (e) {
      console.error(e);
    }
  }

  function openMapPicker() {
    showMapPicker = true;
    setTimeout(initMap, 300); // Wait for modal to render
  }

  function closeMapPicker() {
    showMapPicker = false;
  }

  let leafletMap = null;
  let leafletMarker = null;
  let mapSearchQuery = $state('');
  let isSearchingMap = $state(false);

  async function searchLocation() {
    if (!mapSearchQuery) return;
    isSearchingMap = true;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=id&accept-language=id&q=${encodeURIComponent(mapSearchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        form.latitude = lat;
        form.longitude = lon;
        if (leafletMap && leafletMarker) {
          leafletMap.setView([lat, lon], 14);
          leafletMarker.setLatLng([lat, lon]);
        }
      } else {
        alert("Lokasi tidak ditemukan");
      }
    } catch (e) {
      console.error(e);
      alert("Gagal mencari lokasi");
    } finally {
      isSearchingMap = false;
    }
  }

  function initMap() {
    if (window.leafletMap) {
      window.leafletMap.remove();
    }
    const L = window.L;
    if (!L) return;

    const map = L.map("map-container").setView(
      [form.latitude, form.longitude],
      13,
    );
    window.leafletMap = map;
    leafletMap = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const marker = L.marker([form.latitude, form.longitude], {
      draggable: true,
    }).addTo(map);
    leafletMarker = marker;

    marker.on("dragend", function (e) {
      const position = marker.getLatLng();
      form.latitude = position.lat;
      form.longitude = position.lng;
    });

    map.on("click", function (e) {
      marker.setLatLng(e.latlng);
      form.latitude = e.latlng.lat;
      form.longitude = e.latlng.lng;
    });
  }

  function toggleFasilitas(fas) {
    if (form.fasilitas.includes(fas)) {
      form.fasilitas = form.fasilitas.filter((f) => f !== fas);
    } else {
      form.fasilitas = [...form.fasilitas, fas];
    }
  }

  function handleFileSelect(e) {
    const files = e.target.files;
    if (files) {
      addFiles(Array.from(files));
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    dragHover = false;
    const files = e.dataTransfer.files;
    if (files) {
      addFiles(Array.from(files));
    }
  }

  function addFiles(files) {
    const newFiles = files.map((file) => ({
      id: nextFileId++,
      file: file,
      url: URL.createObjectURL(file),
    }));
    selectedFiles = [...selectedFiles, ...newFiles];
  }

  function removeFile(index) {
    URL.revokeObjectURL(selectedFiles[index].url);
    selectedFiles = selectedFiles.filter((_, i) => i !== index);
  }

  function handleDragStartItem(e, index) {
    draggedItemIndex = index;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index);
  }

  function handleDragOverItem(e, index) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDropItem(e, targetIndex) {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;

    const items = [...selectedFiles];
    const [draggedItem] = items.splice(draggedItemIndex, 1);
    items.splice(targetIndex, 0, draggedItem);

    selectedFiles = items;
    draggedItemIndex = null;
  }

  function saveDraft() {
    try {
      localStorage.setItem('draft_iklan_property', JSON.stringify(form));
      alert('Draft berhasil disimpan ke penyimpanan lokal.');
      // navigate(url('/agent/iklan')); // Optionally navigate away, or stay on page
    } catch(e) {
      console.error(e);
      alert('Gagal menyimpan draft.');
    }
  }

  async function handlePreview() {
    if (!form.nama_property || !form.alamat || !form.harga) {
      alert("Harap lengkapi Judul Iklan, Harga, dan Alamat Lengkap terlebih dahulu sebelum melihat pratinjau (Preview).");
      return;
    }
    
    isPreviewing = true;
    try {
      const previewData = { ...form };
      previewData.preview_images = selectedFiles.map(f => f.url);
      
      const payload = {
        nama_property: form.nama_property,
        tipe: form.tipe,
        harga: parseFloat(form.harga),
        lt: parseInt(form.lt) || 0,
        lb: parseInt(form.lb) || 0,
        kamar_tidur: parseInt(form.kamar_tidur) || 0,
        kamar_mandi: parseInt(form.kamar_mandi) || 0,
        alamat: form.alamat,
        jalan: form.jalan,
        cluster: form.cluster,
        id_provinsi: parseInt(form.id_provinsi) || null,
        id_kabupaten: parseInt(form.id_kabupaten) || null,
        id_kecamatan: parseInt(form.id_kecamatan) || null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        fasilitas: form.fasilitas,
      };

      const aiResponse = await apiFetch('/ai/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (aiResponse && aiResponse.success && aiResponse.data) {
        previewData.analisis_property = aiResponse.data.ai_insight || null;
        previewData.score_investasi_ai = 95; // Dummy score for preview
        previewData.label_investasi_ai = 'High Potential';
        previewData.fasilitas_di_sekitar = aiResponse.data.ai_fasilitas || null;
        previewData.peta_map = JSON.stringify(aiResponse.data.peta_map);
      } else {
        alert("Gagal memproses AI Preview, menggunakan fallback data.");
      }

      localStorage.setItem('preview_iklan', JSON.stringify(previewData));
      window.open(url('/properti/preview'), '_blank');
    } catch (e) {
      console.error(e);
      alert('Gagal memproses preview AI.');
    } finally {
      isPreviewing = false;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    isSubmitting = true;
    errorMsg = "";

    try {
      localStorage.removeItem('preview_iklan');
      
      const payload = {
        ...form,
        harga: parseFloat(form.harga) || 0,
        lt: parseInt(form.lt) || 0,
        lb: parseInt(form.lb) || 0,
        kamar_tidur: parseInt(form.kamar_tidur) || 0,
        kamar_mandi: parseInt(form.kamar_mandi) || 0,
        jumlah_lantai: form.jumlah_lantai ? parseInt(form.jumlah_lantai) : null,
        daya_listrik: form.daya_listrik ? parseInt(form.daya_listrik) : null,
        id_provinsi: parseInt(form.id_provinsi) || null,
        id_kabupaten: parseInt(form.id_kabupaten) || null,
        id_kecamatan: form.id_kecamatan ? parseInt(form.id_kecamatan) : null,
        id_kategori_property: parseInt(form.id_kategori_property) || null,
        latitude: form.latitude,
        longitude: form.longitude,
      };

      const res = await apiFetch("/agent/iklan", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (selectedFiles.length > 0 && res.id_property) {
        const formData = new FormData();
        for (const item of selectedFiles) {
          formData.append("gambar[]", item.file);
        }
        await apiFetch(`/agent/iklan/${res.id_property}/gambar`, {
          method: "POST",
          body: formData,
        });
      }

      // Execute AI Functions in parallel
      isAiProcessing = true;
      try {
        const aiEndpoints = [
          apiFetch(`/ai/property/${res.id_property}/analyze`, { method: "POST" }),
          apiFetch(`/ai/property/${res.id_property}/facilities`),
          apiFetch(`/ai/property/${res.id_property}/map`, { method: "POST" }),
          apiFetch(`/ai/property/${res.id_property}/average-price`)
        ];
        await Promise.allSettled(aiEndpoints);
      } catch (e) {
        console.error("Kesalahan saat menjalankan AI:", e);
      } finally {
        isAiProcessing = false;
      }

      // Hapus draft jika berhasil dipublish
      localStorage.removeItem('draft_iklan_property');

      alert("Properti berhasil ditambahkan!");
      navigate(url("/agent/iklan"));
    } catch (error) {
      const err = error;
      errorMsg = err.message || "Gagal menyimpan properti";
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</svelte:head>

<AgentLayout title="Tambah Iklan">
  <div class="page-container">
    <div class="page-header">
      <div class="header-left">
        <div class="breadcrumbs">
          Dashboard <span class="material-symbols-rounded">chevron_right</span>
          Daftar Iklan
          <span class="material-symbols-rounded">chevron_right</span> Tambah Iklan
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="content-left">
        <div class="banner-card">
          <div class="banner-icon">
            <span class="material-symbols-rounded">home</span>
          </div>
          <div class="banner-text">
            <h2>Buat iklan properti Anda</h2>
            <p>
              Lengkapi informasi properti untuk menarik calon pembeli dan
              mempercepat penjualan properti Anda.
            </p>
          </div>
          <button class="btn-help">
            <span class="material-symbols-rounded" style="font-size:18px;"
              >help</span
            > Butuh Bantuan?
          </button>
        </div>

        <form onsubmit={handleSubmit}>
          {#if errorMsg}
            <div class="alert-error">{errorMsg}</div>
          {/if}

          <!-- SECTION 1 -->
          <div class="form-section">
            <div class="section-title">
              <div class="number-badge">1</div>
              <h3>Informasi Dasar</h3>
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label>Judul Iklan <span class="required">*</span></label>
                <input
                  type="text"
                  bind:value={form.nama_property}
                  placeholder="Contoh: Rumah Mewah di Jakarta Selatan"
                  required
                />
              </div>
              <div class="form-group">
                <label>Kategori <span class="required">*</span></label>
                <select bind:value={form.id_kategori_property} required>
                  <option value="">Pilih Kategori</option>
                  {#each kategoriList as kat}
                    <option value={kat.id_kategori_property}
                      >{kat.nama_kategori_property}</option
                    >
                  {/each}
                </select>
              </div>
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label>Tipe Transaksi <span class="required">*</span></label>
                <select bind:value={form.tipe} required>
                  <option value="jual">Dijual</option>
                  <option value="sewa">Disewa</option>
                </select>
              </div>
              <div class="form-group">
                <label>Harga (Rp) <span class="required">*</span></label>
                <div class="input-prefix">
                  <span class="prefix">Rp</span>
                  <input
                    type="number"
                    bind:value={form.harga}
                    placeholder="Contoh: 1.500.000.000"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 2 -->
          <div class="form-section">
            <div class="section-title">
              <div class="number-badge">2</div>
              <h3>Detail Properti</h3>
            </div>

            <div class="grid-4">
              <div class="form-group">
                <label>Luas Tanah (m²)</label>
                <div class="input-suffix">
                  <input
                    type="number"
                    bind:value={form.lt}
                    placeholder="Contoh: 120"
                  />
                  <span class="suffix">m²</span>
                </div>
              </div>
              <div class="form-group">
                <label>Luas Bangunan (m²)</label>
                <div class="input-suffix">
                  <input
                    type="number"
                    bind:value={form.lb}
                    placeholder="Contoh: 100"
                  />
                  <span class="suffix">m²</span>
                </div>
              </div>
              <div class="form-group">
                <label>Kamar Tidur</label>
                <div class="input-suffix">
                  <input
                    type="number"
                    bind:value={form.kamar_tidur}
                    placeholder="Contoh: 3"
                  />
                  <span class="suffix material-symbols-rounded">bed</span>
                </div>
              </div>
              <div class="form-group">
                <label>Kamar Mandi</label>
                <div class="input-suffix">
                  <input
                    type="number"
                    bind:value={form.kamar_mandi}
                    placeholder="Contoh: 2"
                  />
                  <span class="suffix material-symbols-rounded">bathtub</span>
                </div>
              </div>
            </div>

            <div class="grid-4">
              <div class="form-group">
                <label>Jumlah Lantai</label>
                <div class="input-suffix">
                  <input
                    type="number"
                    bind:value={form.jumlah_lantai}
                    placeholder="Contoh: 2"
                  />
                  <span class="suffix material-symbols-rounded">layers</span>
                </div>
              </div>
              <div class="form-group">
                <label>Daya Listrik (Watt)</label>
                <div class="input-suffix">
                  <input
                    type="number"
                    bind:value={form.daya_listrik}
                    placeholder="Contoh: 2200"
                  />
                  <span class="suffix material-symbols-rounded">bolt</span>
                </div>
              </div>
              <div class="form-group">
                <label>Sertifikat</label>
                <select bind:value={form.surat}>
                  <option value="SHM">Pilih Jenis Sertifikat</option>
                  <option value="SHM">SHM</option>
                  <option value="HGB">HGB</option>
                  <option value="AJB">AJB</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div class="form-group">
                <label>Kondisi Properti</label>
                <select bind:value={form.kondisi_properti}>
                  <option value="">Pilih Kondisi</option>
                  <option value="Baru">Baru</option>
                  <option value="Bagus">Bagus</option>
                  <option value="Butuh Renovasi">Butuh Renovasi</option>
                </select>
              </div>
            </div>
          </div>

          <!-- SECTION 3 -->
          <div class="form-section">
            <div class="section-title">
              <div class="number-badge">3</div>
              <h3>Lokasi Properti</h3>
            </div>

            <div class="grid-3">
              <div class="form-group">
                <label>Provinsi <span class="required">*</span></label>
                <select bind:value={form.id_provinsi} required>
                  <option value="">Pilih Provinsi</option>
                  {#each provinsiList as p}
                    <option value={p.id}>{p.nama}</option>
                  {/each}
                </select>
              </div>
              <div class="form-group">
                <label>Kabupaten/Kota <span class="required">*</span></label>
                <select
                  bind:value={form.id_kabupaten}
                  required
                  disabled={!form.id_provinsi}
                >
                  <option value="">Pilih Kabupaten/Kota</option>
                  {#each kabupatenList as k}
                    <option value={k.id}>{k.nama}</option>
                  {/each}
                </select>
              </div>
              <div class="form-group">
                <label>Kecamatan <span class="required">*</span></label>
                <select
                  bind:value={form.id_kecamatan}
                  required
                  disabled={!form.id_kabupaten}
                >
                  <option value="">Pilih Kecamatan</option>
                  {#each kecamatanList as kec}
                    <option value={kec.id}>{kec.nama}</option>
                  {/each}
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Alamat Lengkap <span class="required">*</span></label>
              <input
                type="text"
                bind:value={form.alamat}
                required
                placeholder="Contoh: Jalan Raya No 1, RT/RW, Kecamatan..."
              />
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label>Jalan (Opsional)</label>
                <input
                  type="text"
                  bind:value={form.jalan}
                  placeholder="Nama jalan, patokan..."
                />
              </div>
              <div class="form-group">
                <label>Cluster/Kompleks (Opsional)</label>
                <input
                  type="text"
                  bind:value={form.cluster}
                  placeholder="Nama cluster/perumahan..."
                />
              </div>
            </div>

            <div class="map-location-btn">
              <div class="map-text">
                <span class="material-symbols-rounded">location_on</span>
                {#if form.latitude !== -6.2}
                  Lokasi terpilih: {form.latitude.toFixed(6)}, {form.longitude.toFixed(
                    6,
                  )}
                {:else}
                  Tandai lokasi properti Anda di peta untuk memudahkan calon
                  pembeli
                {/if}
              </div>
              <button
                type="button"
                class="btn-map-pick"
                onclick={openMapPicker}
              >
                <span class="material-symbols-rounded">pin_drop</span> Pilih Lokasi
                di Peta
              </button>
            </div>
          </div>

          <!-- SECTION 4 -->
          <div class="form-section">
            <div class="section-title">
              <div class="number-badge">4</div>
              <h3>Detail Tambahan</h3>
            </div>

            <div class="form-group" style="max-width: 50%;">
              <label>Surat Legalitas <span class="required">*</span></label>
              <select bind:value={form.surat} required>
                <option value="SHM">SHM (Sertifikat Hak Milik)</option>
                <option value="HGB">HGB (Hak Guna Bangunan)</option>
                <option value="AJB">AJB (Akta Jual Beli)</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div class="form-group" style="margin-top: 20px;">
              <label
                >Fasilitas Properti <span class="note"
                  >(Pilih semua yang sesuai)</span
                ></label
              >
              <div class="fasilitas-grid">
                {#each fasilitasOptions as fas}
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.fasilitas.includes(fas)}
                      onchange={() => toggleFasilitas(fas)}
                    />
                    <span>{fas}</span>
                  </label>
                {/each}
              </div>
            </div>

            <div class="form-group" style="margin-top: 20px;">
              <label>Deskripsi Properti <span class="required">*</span></label>
              <div class="rich-text-editor">
                <div class="editor-toolbar">
                  <button type="button"
                    ><span class="material-symbols-rounded">format_bold</span
                    ></button
                  >
                  <button type="button"
                    ><span class="material-symbols-rounded">format_italic</span
                    ></button
                  >
                  <button type="button"
                    ><span class="material-symbols-rounded"
                      >format_underlined</span
                    ></button
                  >
                  <div class="divider"></div>
                  <button type="button"
                    ><span class="material-symbols-rounded"
                      >format_list_bulleted</span
                    ></button
                  >
                  <button type="button"
                    ><span class="material-symbols-rounded"
                      >format_list_numbered</span
                    ></button
                  >
                </div>
                <textarea
                  bind:value={form.isi}
                  rows="5"
                  required
                  placeholder="Ceritakan keunggulan properti Anda, lingkungan sekitar, akses transportasi, fasilitas terdekat, dll..."
                ></textarea>
                <div class="char-count">0/2000</div>
              </div>
            </div>
          </div>

          <!-- SECTION 5 -->
          <div class="form-section">
            <div class="section-title">
              <div class="number-badge">5</div>
              <h3>Foto & Media</h3>
            </div>

            <div class="upload-area-container">
              <div class="upload-left">
                <label
                  >Upload Foto Properti <span class="required">*</span></label
                >
                <div class="note" style="margin-bottom: 8px;">
                  Maksimal 20 foto, ukuran maksimal 5MB per foto
                </div>

                <div
                  class="drag-drop-zone {dragHover ? 'hover' : ''}"
                  ondragover={(e) => {
                    e.preventDefault();
                    dragHover = true;
                  }}
                  ondragleave={() => (dragHover = false)}
                  ondrop={handleDrop}
                >
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept="image/*"
                    onchange={handleFileSelect}
                    style="display:none"
                  />
                  <span class="material-symbols-rounded upload-icon"
                    >cloud_upload</span
                  >
                  <div class="drag-text">
                    <strong>Drag & drop foto di sini</strong>
                  </div>
                  <div class="drag-text">
                    atau <label for="file-upload" class="browse-link"
                      >klik untuk browse</label
                    >
                  </div>
                  <div class="drag-note">JPG, PNG, WebP (Maks. 5MB)</div>
                </div>

                {#if selectedFiles.length > 0}
                  <div class="photo-grid">
                    {#each selectedFiles as item, index (item.id)}
                      <div
                        class="photo-item {index === 0 ? 'main-photo' : ''}"
                        draggable="true"
                        ondragstart={(e) => handleDragStartItem(e, index)}
                        ondragover={(e) => handleDragOverItem(e, index)}
                        ondrop={(e) => handleDropItem(e, index)}
                      >
                        <img src={item.url} alt="Preview {index}" />
                        {#if index === 0}
                          <div class="main-badge">Foto Utama</div>
                        {/if}
                        <button
                          type="button"
                          class="btn-remove-photo"
                          onclick={() => removeFile(index)}>&times;</button
                        >
                        <div class="drag-handle">
                          <span class="material-symbols-rounded"
                            >drag_indicator</span
                          >
                        </div>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>

              <div class="upload-right">
                <div class="tips-box">
                  <div class="tips-header">
                    <span class="material-symbols-rounded">star</span>
                    <span
                      >Foto cover akan menjadi foto utama iklan Anda<br />Anda
                      dapat mengubahnya setelah upload</span
                    >
                  </div>
                  <div class="tips-list-title">Tips Foto Berkualitas:</div>
                  <ul class="tips-list">
                    <li>
                      <span class="material-symbols-rounded">check</span> Gunakan
                      pencahayaan alami
                    </li>
                    <li>
                      <span class="material-symbols-rounded">check</span> Ambil foto
                      dari berbagai sudut
                    </li>
                    <li>
                      <span class="material-symbols-rounded">check</span> Pastikan
                      ruangan terlihat rapi
                    </li>
                    <li>
                      <span class="material-symbols-rounded">check</span> Upload
                      minimal 5 foto
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button
              type="button"
              class="btn-draft"
              onclick={saveDraft}
            >
              <span class="material-symbols-rounded" style="font-size:18px;"
                >save</span
              > Simpan Draft
            </button>
            <div class="right-actions">
              <button type="button" class="btn-preview" onclick={handlePreview} disabled={isPreviewing}>
                {#if isPreviewing}
                  Menganalisa...
                {:else}
                  <span class="material-symbols-rounded" style="font-size:18px;">visibility</span> Preview Iklan
                {/if}
              </button>
              <button type="submit" class="btn-submit" disabled={isSubmitting}>
                {#if isSubmitting}
                  Menyimpan...
                {:else}
                  <span class="material-symbols-rounded" style="font-size:18px;"
                    >send</span
                  > Simpan & Publikasikan
                {/if}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div class="content-right">
        <div class="tips-sidebar">
          <h3>Tips Sukses Iklan</h3>
          <ul>
            <li>
              <div class="icon-wrap">
                <span class="material-symbols-rounded">photo_camera</span>
              </div>
              <p>Gunakan foto berkualitas tinggi dan pencahayaan baik</p>
            </li>
            <li>
              <div class="icon-wrap">
                <span class="material-symbols-rounded">description</span>
              </div>
              <p>Lengkapi informasi dengan detail</p>
            </li>
            <li>
              <div class="icon-wrap">
                <span class="material-symbols-rounded">edit_note</span>
              </div>
              <p>Tulis deskripsi menarik dan jujur</p>
            </li>
            <li>
              <div class="icon-wrap">
                <span class="material-symbols-rounded">sell</span>
              </div>
              <p>Pastikan harga sesuai dengan pasar</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  {#if showMapPicker}
    <div class="map-modal-overlay">
      <div class="map-modal">
        <div class="map-modal-header">
          <h3>Pilih Lokasi di Peta</h3>
          <button type="button" class="btn-close-map" onclick={closeMapPicker}
            >&times;</button
          >
        </div>
        <div class="map-modal-body">
          <div class="map-instruction">
            Geser marker (pin) atau klik pada peta untuk menentukan lokasi properti Anda.
          </div>
          <div class="map-search" style="display:flex; gap:8px; margin-bottom:12px;">
            <input 
              type="text" 
              class="form-input" 
              placeholder="Cari nama tempat, jalan, atau kota..." 
              bind:value={mapSearchQuery} 
              onkeydown={(e) => e.key === 'Enter' && searchLocation()}
            />
            <button 
              type="button" 
              class="btn-submit" 
              style="width:auto; padding:0 20px; white-space:nowrap;"
              onclick={searchLocation} 
              disabled={isSearchingMap}
            >
              {#if isSearchingMap}
                ...
              {:else}
                <span class="material-symbols-rounded" style="font-size:18px;">search</span> Cari
              {/if}
            </button>
          </div>
          <div id="map-container"></div>
        </div>
        <div class="map-modal-footer">
          <div class="current-coords">
            Lat: {form.latitude.toFixed(6)}, Lng: {form.longitude.toFixed(6)}
          </div>
          <button type="button" class="btn-save-map" onclick={closeMapPicker}
            >Selesai</button
          >
        </div>
      </div>
    </div>
  {/if}

  {#if isPreviewing}
    <div class="map-modal-overlay" style="z-index:99999; display:flex; align-items:center; justify-content:center;">
      <div class="map-modal" style="max-width:400px; padding:30px; text-align:center; border-radius:12px;">
        <div style="font-size:3.5rem; margin-bottom:15px; display:inline-block; animation:ai-spin 2s linear infinite;">🤖</div>
        <h3 style="margin-bottom:12px; font-weight:700; color:var(--c-text-main); font-size:1.2rem;">AI sedang memproses Insight, Fasilitas, dan Peta...</h3>
        <p style="font-size:0.9rem; color:var(--c-text-muted); line-height:1.5;">Mohon ditunggu yah. Begitu selesai memproses, popup ini akan otomatis hilang.</p>
      </div>
    </div>
  {/if}

  {#if isAiProcessing || isSubmitting}
    <div class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-text">
        {#if isAiProcessing}
          Sedang menganalisis dan melengkapi properti dengan AI, mohon tunggu...
        {:else}
          Sedang menyimpan properti, mohon tunggu...
        {/if}
      </p>
    </div>
  {/if}
</AgentLayout>

<style>
  :global(:root) {
    --c-gold: #d4af37;
    --c-gold-hover: #b5952f;
    --c-bg: #ffffff;
    --c-border: #e5e7eb;
    --c-text-main: #1f2937;
    --c-text-muted: #6b7280;
    --c-primary: #1a56db;
  }

  :global(.agent-content) {
    background: #ffffff !important;
  }

  .page-container {
    padding: 12px;
    background: var(--c-bg);
    min-height: 100vh;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .header-left h1 {
    font-size: 18px;
    font-weight: 700;
    color: var(--c-text-main);
    margin: 0 0 4px 0;
  }

  .breadcrumbs {
    font-size: 13px;
    color: var(--c-text-muted);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .breadcrumbs span {
    font-size: 16px;
  }

  .main-content {
    display: flex;
    gap: 24px;
    align-items: flex-start;
  }

  .content-left {
    flex: 1;
    min-width: 0;
  }

  .content-right {
    width: 260px;
    position: sticky;
    top: 24px;
  }

  .banner-card {
    background: #fff;
    border: 1px solid var(--c-border);
    border-radius: 6px;
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  }

  .banner-icon {
    width: 36px;
    height: 36px;
    background: #fff8e1;
    color: var(--c-gold);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .banner-icon span {
    font-size: 20px;
  }

  .banner-text {
    flex: 1;
  }
  .banner-text h2 {
    margin: 0 0 2px 0;
    font-size: 14px;
    color: var(--c-text-main);
  }
  .banner-text p {
    margin: 0;
    font-size: 11px;
    color: var(--c-text-muted);
    line-height: 1.3;
  }

  .btn-help {
    background: #fff8e1;
    color: var(--c-gold);
    border: 1px solid #fde68a;
    padding: 10px 20px;
    border-radius: 30px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: 0.2s;
  }
  .btn-help:hover {
    background: #fef3c7;
  }

  .form-section {
    background: #fff;
    border: 1px solid var(--c-border);
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .number-badge {
    width: 20px;
    height: 20px;
    background: var(--c-gold);
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 11px;
  }

  .section-title h3 {
    margin: 0;
    font-size: 14px;
    color: var(--c-text-main);
  }

  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 8px;
  }
  .grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    margin-bottom: 8px;
  }
  .grid-4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 8px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .form-group label {
    font-size: 11px;
    font-weight: 600;
    color: var(--c-text-main);
  }

  .required {
    color: #ef4444;
    margin-left: 2px;
  }
  .note {
    font-size: 10px;
    color: var(--c-text-muted);
    font-weight: normal;
  }

  input[type="text"],
  input[type="number"],
  select,
  textarea {
    padding: 6px 8px;
    border: 1px solid var(--c-border);
    border-radius: 4px;
    font-size: 11px;
    font-family: inherit;
    outline: none;
    transition: border 0.2s;
    background: #fff;
  }

  input:focus,
  select:focus,
  textarea:focus {
    border-color: var(--c-gold);
  }

  .input-prefix,
  .input-suffix {
    display: flex;
    align-items: stretch;
    border: 1px solid var(--c-border);
    border-radius: 6px;
    overflow: hidden;
  }

  .input-prefix input,
  .input-suffix input {
    border: none;
    flex: 1;
    min-width: 0;
  }

  .prefix,
  .suffix {
    background: #f9fafb;
    padding: 0 8px;
    display: flex;
    align-items: center;
    color: var(--c-text-muted);
    font-size: 11px;
    border-right: 1px solid var(--c-border);
  }
  .input-suffix .suffix {
    border-right: none;
    border-left: 1px solid var(--c-border);
  }

  .map-location-btn {
    background: #fff8e1;
    border-radius: 6px;
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
  }

  .map-text {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #927823;
  }
  .map-text span {
    color: var(--c-gold);
    font-size: 16px;
  }

  .btn-map-pick {
    background: #fff;
    border: 1px solid var(--c-gold);
    color: var(--c-text-main);
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .btn-map-pick span {
    font-size: 16px;
  }

  .fasilitas-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
    margin-top: 4px;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--c-text-muted);
    font-weight: normal !important;
    cursor: pointer;
  }
  .checkbox-label input {
    width: 12px;
    height: 12px;
  }

  .rich-text-editor {
    border: 1px solid var(--c-border);
    border-radius: 6px;
    overflow: hidden;
  }

  .editor-toolbar {
    background: #f9fafb;
    border-bottom: 1px solid var(--c-border);
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .editor-toolbar button {
    background: transparent;
    border: none;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    cursor: pointer;
    color: var(--c-text-muted);
  }
  .editor-toolbar button:hover {
    background: #e5e7eb;
  }
  .editor-toolbar .divider {
    width: 1px;
    height: 20px;
    background: var(--c-border);
    margin: 0 4px;
  }

  .rich-text-editor textarea {
    border: none;
    width: 100%;
    border-radius: 0;
    resize: vertical;
    padding: 16px;
  }

  .char-count {
    text-align: right;
    padding: 12px 16px;
    font-size: 12px;
    color: var(--c-text-muted);
    border-top: 1px solid var(--c-border);
    background: #f9fafb;
  }

  .upload-area-container {
    display: flex;
    gap: 32px;
  }

  .upload-left {
    flex: 2;
  }
  .upload-right {
    flex: 1.2;
  }

  .drag-drop-zone {
    border: 2px dashed var(--c-border);
    border-radius: 6px;
    padding: 16px 12px;
    text-align: center;
    background: #fafafa;
    transition: all 0.2s;
  }
  .drag-drop-zone.hover {
    border-color: var(--c-primary);
    background: #eff6ff;
  }

  .upload-icon {
    font-size: 24px;
    color: #9ca3af;
    margin-bottom: 6px;
  }
  .drag-text {
    font-size: 11px;
    color: var(--c-text-main);
    margin-bottom: 2px;
  }
  .browse-link {
    color: var(--c-gold);
    cursor: pointer;
    font-weight: 600;
  }
  .drag-note {
    font-size: 10px;
    color: var(--c-text-muted);
    margin-top: 4px;
  }

  .photo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
    margin-top: 16px;
  }
  .photo-item {
    position: relative;
    border-radius: 6px;
    overflow: hidden;
    aspect-ratio: 1;
    border: 2px solid transparent;
    cursor: grab;
    background: #f0f0f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  .photo-item:active {
    cursor: grabbing;
  }
  .photo-item.main-photo {
    border-color: var(--c-gold);
  }
  .photo-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
  }
  .main-badge {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--c-gold);
    color: white;
    font-size: 11px;
    text-align: center;
    padding: 4px 0;
    font-weight: 600;
    pointer-events: none;
  }
  .btn-remove-photo {
    position: absolute;
    top: 6px;
    right: 6px;
    background: rgba(239, 68, 68, 0.9);
    color: white;
    border: none;
    border-radius: 50%;
    width: 22px;
    height: 22px;
    font-size: 14px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    z-index: 2;
  }
  .btn-remove-photo:hover {
    background: #dc2626;
  }
  .drag-handle {
    position: absolute;
    top: 6px;
    left: 6px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border-radius: 4px;
    padding: 2px;
    display: flex;
    align-items: center;
    pointer-events: none;
  }
  .drag-handle span {
    font-size: 14px;
  }

  .tips-box {
    background: #fff8e1;
    border-radius: 6px;
    padding: 12px;
  }

  .tips-header {
    display: flex;
    gap: 8px;
    font-size: 11px;
    color: #927823;
    line-height: 1.4;
    margin-bottom: 8px;
  }

  .tips-list-title {
    font-size: 11px;
    font-weight: 600;
    color: var(--c-text-main);
    margin-bottom: 6px;
  }

  .tips-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .tips-list li {
    font-size: 11px;
    color: var(--c-text-muted);
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
  }
  .tips-list li span {
    color: var(--c-gold);
    font-size: 14px;
  }

  .form-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 0 40px 0;
  }

  .right-actions {
    display: flex;
    gap: 16px;
  }

  .btn-draft {
    background: #fff;
    border: 1px solid var(--c-border);
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    color: var(--c-text-main);
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
  }

  .btn-preview {
    background: #fff;
    border: 1px solid var(--c-gold);
    color: var(--c-gold);
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
  }

  .btn-submit {
    background: var(--c-gold);
    border: none;
    color: #fff;
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
  }

  /* SIDEBAR TIPS */
  .tips-sidebar {
    background: #fff8e1;
    border-radius: 8px;
    padding: 24px;
  }
  .tips-sidebar h3 {
    margin: 0 0 24px 0;
    font-size: 16px;
    color: var(--c-text-main);
  }
  .tips-sidebar ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .tips-sidebar li {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
    align-items: flex-start;
  }
  .icon-wrap {
    color: var(--c-gold);
    margin-top: -2px;
  }
  .tips-sidebar li p {
    margin: 0;
    font-size: 13px;
    color: var(--c-text-main);
    line-height: 1.5;
    font-weight: 500;
  }

  .alert-error {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    padding: 16px;
    border-radius: 6px;
    margin-bottom: 24px;
    font-weight: 500;
  }

  .map-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .map-modal {
    background: white;
    width: 90%;
    max-width: 800px;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
  }
  .map-modal-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--c-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .map-modal-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
  .btn-close-map {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: var(--c-text-muted);
  }
  .map-modal-body {
    padding: 16px 20px;
  }
  .map-instruction {
    margin-bottom: 12px;
    font-size: 13px;
    color: var(--c-text-muted);
  }
  #map-container {
    height: 400px;
    width: 100%;
    border-radius: 6px;
    border: 1px solid var(--c-border);
    background: #e9e9e9;
  }
  .map-modal-footer {
    padding: 16px 20px;
    border-top: 1px solid var(--c-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .current-coords {
    font-size: 13px;
    color: var(--c-text-muted);
    font-family: monospace;
  }
  .btn-save-map {
    background: var(--c-gold);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
  }
  .btn-save-map:hover {
    background: var(--c-gold-hover);
  }

  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f4f6;
    border-top: 5px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .loading-text {
    font-size: 18px;
    color: #1f2937;
    font-weight: 600;
  }
  @keyframes ai-spin {
    0% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(10deg) scale(1.1); }
    100% { transform: rotate(0deg) scale(1); }
  }
</style>
