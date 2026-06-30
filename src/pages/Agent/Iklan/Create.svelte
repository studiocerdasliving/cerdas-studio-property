<script>
  import AgentLayout from '../../../components/AgentLayout.svelte'
  import { apiFetch } from '../../../lib/api.js'
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { url } from '../../../lib/url.svelte.js'

  let form = $state({
    nama_property: '', tipe: 'jual', harga: '', lt: '', lb: '', kamar_tidur: '', kamar_mandi: '', 
    alamat: '', jenis_sewa: 'tahunan', surat: 'SHM', id_provinsi: '', id_kabupaten: '', id_kecamatan: '', 
    id_kategori_property: '', isi: ''
  });

  /** @type {any[]} */
  let provinsiList = $state([]);
  /** @type {any[]} */
  let kabupatenList = $state([]);
  /** @type {any[]} */
  let kecamatanList = $state([]);
  /** @type {any[]} */
  let kategoriList = $state([]);

  let isSubmitting = $state(false);
  let errorMsg = $state('');

  onMount(async () => {
    try {
      const [prov, kat] = await Promise.all([
        apiFetch('/provinsi'),
        apiFetch('/kategori')
      ]);
      provinsiList = prov || [];
      kategoriList = kat || [];
    } catch(e) {
      console.error(e);
    }
  });

  async function loadKabupaten() {
    form.id_kabupaten = '';
    form.id_kecamatan = '';
    kabupatenList = [];
    kecamatanList = [];
    if (!form.id_provinsi) return;
    try {
      kabupatenList = await apiFetch(`/kabupaten?id_provinsi=${form.id_provinsi}`);
    } catch(e) { console.error(e); }
  }

  async function loadKecamatan() {
    form.id_kecamatan = '';
    kecamatanList = [];
    if (!form.id_kabupaten) return;
    try {
      kecamatanList = await apiFetch(`/kecamatan?id_kabupaten=${form.id_kabupaten}`);
    } catch(e) { console.error(e); }
  }

  /** @param {Event} e */
  async function handleSubmit(e) {
    e.preventDefault();
    isSubmitting = true;
    errorMsg = '';
    
    try {
      // Backend expects numbers where applicable
      const payload = {
        ...form,
        harga: parseFloat(form.harga),
        lt: parseInt(form.lt),
        lb: parseInt(form.lb),
        kamar_tidur: parseInt(form.kamar_tidur),
        kamar_mandi: parseInt(form.kamar_mandi),
        id_provinsi: parseInt(form.id_provinsi),
        id_kabupaten: parseInt(form.id_kabupaten),
        id_kecamatan: form.id_kecamatan ? parseInt(form.id_kecamatan) : null,
        id_kategori_property: parseInt(form.id_kategori_property),
      };

      await apiFetch('/agent/iklan', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      alert('Properti berhasil ditambahkan!');
      navigate(url('/agent/iklan'));
    } catch(error) {
      const err = /** @type {any} */ (error);
      errorMsg = err.message || 'Gagal menyimpan properti';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<AgentLayout title="Tambah Iklan">
  <div class="container" style="padding: 40px 0; max-width: 800px;">
    <h1 style="font-family: 'Playfair Display', serif; font-size: 2rem; color: var(--text-1); margin-bottom: 32px;">Informasi Properti</h1>
    
    <form class="card" style="padding: 32px;" onsubmit={handleSubmit}>
      {#if errorMsg}
        <div style="background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 12px 16px; border-radius: var(--radius); margin-bottom: 24px; font-size: 0.9rem;">{errorMsg}</div>
      {/if}

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div class="form-group">
          <label class="form-label" for="nama">Judul Iklan</label>
          <input class="form-input" id="nama" type="text" bind:value={form.nama_property} required placeholder="Rumah Mewah di Jakarta" />
        </div>
        <div class="form-group">
          <label class="form-label" for="kategori">Kategori</label>
          <select class="form-input" id="kategori" bind:value={form.id_kategori_property} required>
            <option value="">Pilih Kategori</option>
            {#each kategoriList as kat}
              <option value={kat.id_kategori_property}>{kat.nama_kategori_property}</option>
            {/each}
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 20px;">
        <div class="form-group">
          <label class="form-label" for="tipe">Tipe Transaksi</label>
          <select class="form-input" id="tipe" bind:value={form.tipe} required>
            <option value="jual">Dijual</option>
            <option value="sewa">Disewa</option>
          </select>
        </div>
        {#if form.tipe === 'sewa'}
          <div class="form-group">
            <label class="form-label" for="jenis_sewa">Jenis Sewa</label>
            <select class="form-input" id="jenis_sewa" bind:value={form.jenis_sewa} required>
              <option value="bulanan">Bulanan</option>
              <option value="tahunan">Tahunan</option>
            </select>
          </div>
        {/if}
        <div class="form-group" style="grid-column: span {form.tipe === 'sewa' ? 1 : 2};">
          <label class="form-label" for="harga">Harga (Rp)</label>
          <input class="form-input" id="harga" type="number" bind:value={form.harga} required placeholder="Contoh: 1500000000" min="0" />
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 20px; margin-top: 20px;">
        <div class="form-group">
          <label class="form-label" for="lt">Luas Tanah (m²)</label>
          <input class="form-input" id="lt" type="number" bind:value={form.lt} required min="0" />
        </div>
        <div class="form-group">
          <label class="form-label" for="lb">Luas Bangunan (m²)</label>
          <input class="form-input" id="lb" type="number" bind:value={form.lb} required min="0" />
        </div>
        <div class="form-group">
          <label class="form-label" for="kamar_tidur">Kamar Tidur</label>
          <input class="form-input" id="kamar_tidur" type="number" bind:value={form.kamar_tidur} required min="0" />
        </div>
        <div class="form-group">
          <label class="form-label" for="kamar_mandi">Kamar Mandi</label>
          <input class="form-input" id="kamar_mandi" type="number" bind:value={form.kamar_mandi} required min="0" />
        </div>
      </div>

      <div style="margin-top: 32px; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
        <h3 style="font-size: 1.2rem; color: var(--text-1);">Lokasi Properti</h3>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
        <div class="form-group">
          <label class="form-label" for="id_provinsi">Provinsi</label>
          <select class="form-input" id="id_provinsi" bind:value={form.id_provinsi} onchange={loadKabupaten} required>
            <option value="">Pilih Provinsi</option>
            {#each provinsiList as p}
              <option value={p.id}>{p.nama}</option>
            {/each}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="id_kabupaten">Kabupaten/Kota</label>
          <select class="form-input" id="id_kabupaten" bind:value={form.id_kabupaten} onchange={loadKecamatan} required disabled={!form.id_provinsi}>
            <option value="">Pilih Kabupaten</option>
            {#each kabupatenList as k}
              <option value={k.id}>{k.nama}</option>
            {/each}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="id_kecamatan">Kecamatan</label>
          <select class="form-input" id="id_kecamatan" bind:value={form.id_kecamatan} disabled={!form.id_kabupaten}>
            <option value="">Pilih Kecamatan (Opsional)</option>
            {#each kecamatanList as kec}
              <option value={kec.id}>{kec.nama}</option>
            {/each}
          </select>
        </div>
      </div>

      <div class="form-group" style="margin-top: 20px;">
        <label class="form-label" for="alamat">Alamat Lengkap</label>
        <textarea class="form-input" id="alamat" bind:value={form.alamat} required rows="2" placeholder="Jalan Raya No 1, RT/RW..."></textarea>
      </div>

      <div style="margin-top: 32px; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
        <h3 style="font-size: 1.2rem; color: var(--text-1);">Detail Tambahan</h3>
      </div>

      <div class="form-group" style="margin-bottom: 20px;">
        <label class="form-label" for="surat">Surat Legalitas</label>
        <select class="form-input" id="surat" bind:value={form.surat} required>
          <option value="SHM">SHM (Sertifikat Hak Milik)</option>
          <option value="HGB">HGB (Hak Guna Bangunan)</option>
          <option value="AJB">AJB (Akta Jual Beli)</option>
          <option value="Lainnya">Lainnya</option>
        </select>
      </div>

      <div class="form-group" style="margin-bottom: 32px;">
        <label class="form-label" for="isi">Deskripsi Lengkap</label>
        <textarea class="form-input" id="isi" bind:value={form.isi} required rows="6" placeholder="Ceritakan keunggulan properti Anda..."></textarea>
      </div>

      <button type="submit" class="btn btn-gold btn-full" disabled={isSubmitting}>
        {isSubmitting ? 'Menyimpan...' : 'Simpan Properti'}
      </button>
      
      <p style="text-align:center; font-size: 0.85rem; color: var(--text-3); margin-top: 16px;">
        Note: Anda bisa menambahkan gambar cover melalui menu Edit setelah properti tersimpan.
      </p>
    </form>
  </div>
</AgentLayout>
