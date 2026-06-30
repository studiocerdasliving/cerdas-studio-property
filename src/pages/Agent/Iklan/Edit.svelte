<script>
  import AgentLayout from '../../../components/AgentLayout.svelte'
  import { apiFetch } from '../../../lib/api.js'
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { url } from '../../../lib/url.svelte.js'

  let { id = '' } = $props(); // From routing

  let form = $state({
    nama_property: '', tipe: 'jual', harga: '', lt: '', lb: '', kamar_tidur: '', kamar_mandi: '', 
    alamat: '', jenis_sewa: 'tahunan', surat: 'SHM', id_provinsi: '', id_kabupaten: '', id_kecamatan: '', 
    id_kategori_property: '', isi: ''
  });

  /** @type {any[]} */
  let existingPhotos = $state([]);
  /** @type {any[]} */
  let previewPhotos = $state([]);
  /** @type {HTMLInputElement | null} */
  let fileInput = $state(null);

  /** @type {any[]} */
  let provinsiList = $state([]);
  /** @type {any[]} */
  let kabupatenList = $state([]);
  /** @type {any[]} */
  let kecamatanList = $state([]);
  /** @type {any[]} */
  let kategoriList = $state([]);

  let isLoading = $state(true);
  let isSubmitting = $state(false);
  let errorMsg = $state('');

  onMount(async () => {
    try {
      const [prov, kat, prop] = await Promise.all([
        apiFetch('/provinsi'),
        apiFetch('/kategori'),
        apiFetch(`/agent/iklan/${id}`)
      ]);
      provinsiList = prov || [];
      kategoriList = kat || [];

      // Populate form
      if (prop && prop.property) {
        existingPhotos = prop.images || [];
        const p = prop.property;
        form = {
          nama_property: p.nama_property || '',
          tipe: p.tipe || 'jual',
          harga: p.harga || '',
          lt: p.lt || '',
          lb: p.lb || '',
          kamar_tidur: p.kamar_tidur || '',
          kamar_mandi: p.kamar_mandi || '',
          alamat: p.alamat || '',
          jenis_sewa: p.jenis_sewa || 'tahunan',
          surat: p.surat || 'SHM',
          id_provinsi: p.id_provinsi || '',
          id_kabupaten: p.id_kabupaten || '',
          id_kecamatan: p.id_kecamatan || '',
          id_kategori_property: p.id_kategori_property || '',
          isi: p.isi || ''
        };

        // Load dependencies
        if (form.id_provinsi) {
          kabupatenList = await apiFetch(`/kabupaten?id_provinsi=${form.id_provinsi}`);
        }
        if (form.id_kabupaten) {
          kecamatanList = await apiFetch(`/kecamatan?id_kabupaten=${form.id_kabupaten}`);
        }
      }
    } catch(e) {
      console.error(e);
      errorMsg = 'Gagal memuat data properti';
    } finally {
      isLoading = false;
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

  /** @param {any} e */
  function onFileChange(e) {
    const files = Array.from(e.target.files ?? []);
    previewPhotos = files.map(f => ({
      file: f,
      url: URL.createObjectURL(f),
      name: f.name,
    }));
  }

  /** @param {number} idx */
  function removePreviewPhoto(idx) {
    previewPhotos = previewPhotos.filter((_, i) => i !== idx);
    if (previewPhotos.length === 0 && fileInput) {
      fileInput.value = '';
    }
  }

  /** @param {any} photo */
  async function deleteExistingPhoto(photo) {
    if (!confirm('Hapus foto ini?')) return;
    try {
      await apiFetch(`/agent/iklan/gambar/${photo.id_property_img}`, { method: 'DELETE' });
      existingPhotos = existingPhotos.filter((p) => p.id_property_img !== photo.id_property_img);
    } catch(err) {
      const error = /** @type {Error} */ (err);
      alert('Gagal menghapus foto: ' + error.message);
    }
  }

  /** @param {Event} e */
  async function handleSubmit(e) {
    e.preventDefault();
    isSubmitting = true;
    errorMsg = '';
    
    try {
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

      await apiFetch(`/agent/iklan/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      
      // Upload new images if any
      if (previewPhotos.length > 0) {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        previewPhotos.forEach(p => formData.append('gambar[]', p.file));
        
        // Cannot use apiFetch for multipart directly easily, so fetch manually
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/agent/iklan/${id}/gambar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (!res.ok) throw new Error('Gagal mengupload gambar');
      }
      
      alert('Properti berhasil diperbarui!');
      navigate(url('/agent/iklan'));
    } catch(err) {
      const error = /** @type {Error} */ (err);
      errorMsg = error.message || 'Gagal menyimpan pembaruan';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<AgentLayout title="Edit Iklan">
  <div class="container" style="padding: 40px 0; max-width: 800px;">
    <h1 style="font-family: 'Playfair Display', serif; font-size: 2rem; color: var(--text-1); margin-bottom: 32px;">Edit Informasi Properti</h1>
    
    {#if isLoading}
      <div style="text-align: center; padding: 60px; color: var(--text-3);">Memuat data properti...</div>
    {:else}
      <form class="card" style="padding: 32px;" onsubmit={handleSubmit}>
        {#if errorMsg}
          <div style="background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 12px 16px; border-radius: var(--radius); margin-bottom: 24px; font-size: 0.9rem;">{errorMsg}</div>
        {/if}

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div class="form-group">
            <label class="form-label" for="nama">Judul Iklan</label>
            <input class="form-input" id="nama" type="text" bind:value={form.nama_property} required />
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
            <label class="form-label" for="tipe_transaksi">Tipe Transaksi</label>
            <select id="tipe_transaksi" class="form-input" bind:value={form.tipe} required>
              <option value="jual">Dijual</option>
              <option value="sewa">Disewa</option>
            </select>
          </div>
          {#if form.tipe === 'sewa'}
            <div class="form-group">
              <label class="form-label" for="jenis_sewa">Jenis Sewa</label>
              <select id="jenis_sewa" class="form-input" bind:value={form.jenis_sewa} required>
                <option value="bulanan">Bulanan</option>
                <option value="tahunan">Tahunan</option>
              </select>
            </div>
          {/if}
          <div class="form-group" style="grid-column: span {form.tipe === 'sewa' ? 1 : 2};">
            <label class="form-label" for="harga">Harga (Rp)</label>
            <input id="harga" class="form-input" type="number" bind:value={form.harga} required min="0" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 20px; margin-top: 20px;">
          <div class="form-group">
            <label class="form-label" for="lt">Luas Tanah (m²)</label>
            <input id="lt" class="form-input" type="number" bind:value={form.lt} required min="0" />
          </div>
          <div class="form-group">
            <label class="form-label" for="lb">Luas Bangunan (m²)</label>
            <input id="lb" class="form-input" type="number" bind:value={form.lb} required min="0" />
          </div>
          <div class="form-group">
            <label class="form-label" for="kamar_tidur">Kamar Tidur</label>
            <input id="kamar_tidur" class="form-input" type="number" bind:value={form.kamar_tidur} required min="0" />
          </div>
          <div class="form-group">
            <label class="form-label" for="kamar_mandi">Kamar Mandi</label>
            <input id="kamar_mandi" class="form-input" type="number" bind:value={form.kamar_mandi} required min="0" />
          </div>
        </div>

        <div style="margin-top: 32px; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
          <h3 style="font-size: 1.2rem; color: var(--text-1);">Lokasi Properti</h3>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
          <div class="form-group">
            <label class="form-label" for="id_provinsi">Provinsi</label>
            <select id="id_provinsi" class="form-input" bind:value={form.id_provinsi} onchange={loadKabupaten} required>
              <option value="">Pilih Provinsi</option>
              {#each provinsiList as p}
                <option value={p.id}>{p.nama}</option>
              {/each}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="id_kabupaten">Kabupaten/Kota</label>
            <select id="id_kabupaten" class="form-input" bind:value={form.id_kabupaten} onchange={loadKecamatan} required disabled={!form.id_provinsi}>
              <option value="">Pilih Kabupaten</option>
              {#each kabupatenList as k}
                <option value={k.id}>{k.nama}</option>
              {/each}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="id_kecamatan">Kecamatan</label>
            <select id="id_kecamatan" class="form-input" bind:value={form.id_kecamatan} disabled={!form.id_kabupaten}>
              <option value="">Pilih Kecamatan (Opsional)</option>
              {#each kecamatanList as kec}
                <option value={kec.id}>{kec.nama}</option>
              {/each}
            </select>
          </div>
        </div>

        <div class="form-group" style="margin-top: 20px;">
          <label class="form-label" for="alamat">Alamat Lengkap</label>
          <textarea id="alamat" class="form-input" bind:value={form.alamat} required rows="2"></textarea>
        </div>

        <div style="margin-top: 32px; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
          <h3 style="font-size: 1.2rem; color: var(--text-1);">Detail Tambahan</h3>
        </div>

        <div class="form-group" style="margin-bottom: 20px;">
          <label class="form-label" for="surat">Surat Legalitas</label>
          <select id="surat" class="form-input" bind:value={form.surat} required>
            <option value="SHM">SHM (Sertifikat Hak Milik)</option>
            <option value="HGB">HGB (Hak Guna Bangunan)</option>
            <option value="AJB">AJB (Akta Jual Beli)</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 32px;">
          <label class="form-label" for="isi">Deskripsi Lengkap</label>
          <textarea id="isi" class="form-input" bind:value={form.isi} required rows="6"></textarea>
        </div>

        <div style="margin-top: 32px; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
          <h3 style="font-size: 1.2rem; color: var(--text-1);">Foto Properti</h3>
        </div>

        {#if existingPhotos.length > 0}
          <div style="margin-bottom: 20px;">
            <p style="font-size: 0.9rem; color: var(--text-3); margin-bottom: 12px;">Foto yang sudah ada:</p>
            <div style="display: flex; flex-wrap: wrap; gap: 16px;">
              {#each existingPhotos as photo, idx}
                <div style="position: relative; width: 120px; height: 100px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border);">
                  {#if idx === 0}
                    <div style="position: absolute; top: 0; left: 0; background: var(--gold); color: white; font-size: 0.65rem; padding: 2px 6px; font-weight: bold; border-bottom-right-radius: 6px; z-index: 2;">COVER</div>
                  {/if}
                  <img src="/upload/property/{photo.gambar}" alt="Foto {idx+1}" style="width: 100%; height: 100%; object-fit: cover;" onerror={(e) => /** @type {HTMLImageElement} */(e.currentTarget).src='https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=150&q=60'} />
                  <button type="button" onclick={() => deleteExistingPhoto(photo)} style="position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.6); color: white; border: none; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 2;">
                    <span class="material-symbols-rounded" style="font-size: 14px;">close</span>
                  </button>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <div style="margin-bottom: 32px;">
          <div role="button" tabindex="0" onclick={() => fileInput?.click()} onkeydown={(e) => e.key === 'Enter' && fileInput?.click()} style="border: 2px dashed var(--border); border-radius: 12px; padding: 32px; text-align: center; cursor: pointer; background: #fafafa; transition: border-color 0.2s;">
            <input type="file" multiple accept="image/jpeg,image/png,image/jpg,image/webp" onchange={onFileChange} bind:this={fileInput} hidden />
            <span class="material-symbols-rounded" style="font-size: 32px; color: var(--gold); margin-bottom: 8px;">cloud_upload</span>
            <p style="font-weight: 600; color: var(--text-1); margin-bottom: 4px;">Klik atau drag foto di sini</p>
            <p style="font-size: 0.85rem; color: var(--text-3);">JPG, PNG, WEBP — bisa pilih banyak foto sekaligus</p>
          </div>

          {#if previewPhotos.length > 0}
            <div style="margin-top: 16px;">
              <p style="font-size: 0.9rem; color: var(--text-3); margin-bottom: 12px;">Foto yang akan diupload:</p>
              <div style="display: flex; flex-wrap: wrap; gap: 16px;">
                {#each previewPhotos as photo, idx}
                  <div style="position: relative; width: 120px; height: 100px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border);">
                    <img src={photo.url} alt={photo.name} style="width: 100%; height: 100%; object-fit: cover;" />
                    <button type="button" onclick={() => removePreviewPhoto(idx)} style="position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.6); color: white; border: none; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 2;">
                      <span class="material-symbols-rounded" style="font-size: 14px;">close</span>
                    </button>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>

        <button type="submit" class="btn btn-gold btn-full" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan Perubahan...' : 'Simpan Perubahan'}
        </button>
      </form>
    {/if}
  </div>
</AgentLayout>
