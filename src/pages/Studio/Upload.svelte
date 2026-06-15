<script>
  import DashboardLayout from '../../components/DashboardLayout.svelte'
  import { navigate  } from 'svelte-routing'
  import { onMount } from 'svelte'
  import { url } from '../../lib/url.svelte.js'
  import { apiFetch } from '../../lib/api.js'

  // phase: 'upload' | 'bg_removal' | 'ai_analysis' | 'review'
  let phase = $state('upload')

  // Uploaded files
  /** @type {File | null} */
  let fotoDepan = $state(null)
  /** @type {File | null} */
  let fotoKiri  = $state(null)
  /** @type {File | null} */
  let fotoKanan = $state(null)
  /** @type {File | null} */
  let fotoAtas  = $state(null)

  /** @type {Record<string, boolean>} */
  let dragging = $state({ depan:false, kiri:false, kanan:false, atas:false })

  // Data form (akan di-auto-fill oleh AI simulation)
  let category    = $state('lemari')
  let subcategory = $state('Lemari 2 Pintu Geser')
  let name        = $state('')
  let material    = $state('🪵 Kayu')
  let style       = $state('Minimalis')
  let panjangCm   = $state(120)
  let tinggiCm    = $state(200)
  let lebarCm     = $state(60)
  let jumlahPintu = $state(2)
  let jumlahLaci  = $state(0)
  let adaKaki     = $state(false)
  let tinggiKaki  = $state(0)
  let jenisRel    = $state('geser')
  let adaHandle   = $state(true)
  let jumlahRakDalam = $state(3)

  const categories = [
    { id:'lemari', icon:'🚪', label:'Lemari' },
    { id:'meja',   icon:'🪵', label:'Meja' },
    { id:'rak',    icon:'📚', label:'Rak' },
    { id:'bufet',  icon:'📺', label:'Bufet TV' },
    { id:'nakas',  icon:'🛏️', label:'Nakas' },
    { id:'sofa',   icon:'🛋️', label:'Sofa' },
  ]

  const slots = [
    { field:'depan', label:'DEPAN',  emoji:'⬛', required:true,  hint:'Wajib — tampak depan penuh' },
    { field:'kiri',  label:'KIRI',   emoji:'◀️', required:false, hint:'Opsional' },
    { field:'kanan', label:'KANAN',  emoji:'▶️', required:false, hint:'Opsional' },
    { field:'atas',  label:'ATAS',   emoji:'🔼', required:false, hint:'Opsional' },
  ]

  /** 
   * @param {string} field 
   * @returns {File | null}
   */
  function getFile(field) {
    if (field==='depan') return fotoDepan
    if (field==='kiri')  return fotoKiri
    if (field==='kanan') return fotoKanan
    if (field==='atas')  return fotoAtas
    return null
  }

  /**
   * @param {string} field
   * @param {File | null} file
   */
  function setFile(field, file) {
    if (field==='depan') fotoDepan = file
    else if (field==='kiri')  fotoKiri  = file
    else if (field==='kanan') fotoKanan = file
    else if (field==='atas')  fotoAtas  = file
  }

  /**
   * @param {any} e
   * @param {string} field
   */
  function handleInput(e, field) {
    const file = e.target.files?.[0]
    if (file) setFile(field, file)
  }

  /**
   * @param {any} e
   * @param {string} field
   */
  function handleDrop(e, field) {
    e.preventDefault()
    dragging[field] = false
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) setFile(field, file)
  }

  /**
   * @param {any} e
   * @param {string} field
   */
  function handleDragOver(e, field) { e.preventDefault(); dragging[field] = true }
  /** @param {string} field */
  function handleDragLeave(field)   { dragging[field] = false }
  /**
   * @param {string} field
   * @param {any} e
   */
  function removeFile(field, e)     { e.preventDefault(); e.stopPropagation(); setFile(field, null) }

  /** @param {File | null} file */
  function getPreview(file) {
    return file ? URL.createObjectURL(file) : null
  }

  let fotoCount = $derived([fotoDepan, fotoKiri, fotoKanan, fotoAtas].filter(Boolean).length)
  let missingCount = $derived(4 - fotoCount)
  
  // Pipeline Transitions
  let isProcessing = $state(false)

  function startPipeline() {
    phase = 'bg_removal'
    isProcessing = true
    setTimeout(() => {
      isProcessing = false
    }, 2500)
  }

  function nextToAiAnalysis() {
    phase = 'ai_analysis'
    isProcessing = true
    setTimeout(() => {
      isProcessing = false
    }, 2500)
  }

  function nextToReview() {
    if(fotoCount >= 1 && !name) {
       name = "Generate AI " + Math.floor(Math.random() * 1000)
    }
    phase = 'review'
  }

  function submit() {
    const fd = new FormData()
    fd.append('name', name || `${subcategory || category} ${material}`)
    fd.append('category', category)
    fd.append('subcategory', subcategory)
    fd.append('material', material.replace(/[^\w]/g,''))
    fd.append('style', style)
    fd.append('panjang_cm', panjangCm.toString())
    fd.append('tinggi_cm',  tinggiCm.toString())
    fd.append('lebar_cm',   lebarCm.toString())
    fd.append('jumlah_pintu', jumlahPintu.toString())
    fd.append('jumlah_laci',  jumlahLaci.toString())
    fd.append('ada_kaki',    adaKaki ? '1' : '0')
    fd.append('tinggi_kaki_cm', tinggiKaki.toString())
    fd.append('jenis_rel',   jenisRel)
    fd.append('ada_handle',  adaHandle ? '1' : '0')
    fd.append('jumlah_rak_dalam', jumlahRakDalam.toString())
    fd.append('mode_upload', (fotoKiri && fotoKanan && fotoAtas) ? '4foto' : '1foto')
    if (fotoDepan) fd.append('foto_depan', fotoDepan)
    if (fotoKiri)  fd.append('foto_kiri',  fotoKiri)
    if (fotoKanan) fd.append('foto_kanan', fotoKanan)
    if (fotoAtas)  fd.append('foto_atas',  fotoAtas)
    
    // Kirim ke backend, controller akan redirect ke Processing page
    apiFetch('/ai-studio', { 
        method: 'POST', 
        body: fd, 
        forceFormData: true 
    }).catch(e => console.error("Upload error", e));
  }
</script>

<DashboardLayout 
  title="Upload & Analisa AI"
  portalName="Studio Design Cerdas Living"
  menuItems={[
    { href: '/studio/hub', icon: 'view_in_ar', label: 'Studio Design' },
    { href: '/studio/upload', icon: 'upload', label: 'Upload Model' },
    { href: '/studio/proyek', icon: 'folder', label: 'Proyek Saya' },
    { href: '/studio/profil', icon: 'person', label: 'Profil Studio' }
  ]}
>
  <div class="container" style="max-width:1000px; padding: 40px 24px 80px;">

    <!-- Timeline Progress -->
    <div style="display:flex; justify-content:center; margin-bottom: 40px;">
      <div style="display:flex; align-items:center; gap: 8px;">
        <div class="timeline-step {phase==='upload' ? 'active' : 'done'}">1. Upload</div>
        <div class="timeline-line {phase!=='upload' ? 'done' : ''}"></div>
        <div class="timeline-step {phase==='bg_removal' ? 'active' : (phase==='ai_analysis'||phase==='review' ? 'done' : '')}">2. Remove BG</div>
        <div class="timeline-line {phase==='ai_analysis'||phase==='review' ? 'done' : ''}"></div>
        <div class="timeline-step {phase==='ai_analysis' ? 'active' : (phase==='review' ? 'done' : '')}">3. AI Analisis</div>
        <div class="timeline-line {phase==='review' ? 'done' : ''}"></div>
        <div class="timeline-step {phase==='review' ? 'active' : ''}">4. Build .obj</div>
      </div>
    </div>

    <!-- PHASE 1: UPLOAD -->
    {#if phase === 'upload'}
    <div class="card animate-in" style="padding:32px;">
      <div style="text-align:center; margin-bottom:32px;">
        <h2 style="font-size:1.6rem;font-weight:800;margin:0 0 8px;">Upload Foto Furnitur</h2>
        <p style="color:var(--text-2);font-size:0.95rem;margin:0;">
          Sistem akan otomatis menghapus background dan AI akan menganalisa strukturnya.
        </p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:16px;margin-bottom:32px;">
        {#each slots as slot}
          {@const file = getFile(slot.field)}
          {@const preview = getPreview(file)}
          {@const isDragging = dragging[slot.field]}
          <div
            class="dropzone {file ? 'has-file' : ''} {isDragging ? 'drag-over' : ''}"
            style="position:relative;min-height:180px;padding:0;overflow:hidden; border-radius:var(--radius-lg);"
            ondragover={(e) => handleDragOver(e, slot.field)}
            ondragleave={() => handleDragLeave(slot.field)}
            ondrop={(e) => handleDrop(e, slot.field)}
            role="button"
            tabindex="0"
          >
            <label style="position:absolute;inset:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:16px;">
              <input type="file" accept="image/*" onchange={(e) => handleInput(e, slot.field)} style="display:none;" />

              {#if preview}
                <img src={preview} alt={slot.label} style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;" />
                <div style="position:absolute;top:8px;left:8px;background:rgba(0,0,0,0.6);color:#fff;border-radius:6px;padding:4px 8px;font-size:0.7rem;font-weight:700;">
                  {slot.emoji} {slot.label}
                </div>
                <button
                  onclick={(e) => removeFile(slot.field, e)}
                  style="position:absolute;top:8px;right:8px;background:rgba(220,38,38,0.9);color:#fff;border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:1.2rem;line-height:1;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,0.2);"
                >×</button>
              {:else}
                <div style="font-size:2rem;margin-bottom:4px;">{slot.required ? '📷' : '➕'}</div>
                <div style="font-weight:700;font-size:0.85rem;color:var(--text-1);">{slot.label}</div>
                <div style="font-size:0.7rem;color:{slot.required ? 'var(--primary)' : 'var(--text-3)'}; font-weight:600;">
                  {slot.required ? '★ Wajib' : 'Opsional'}
                </div>
              {/if}
            </label>
          </div>
        {/each}
      </div>

      <div style="display:flex;justify-content:center;">
        <button onclick={startPipeline} disabled={!fotoDepan} class="btn btn-primary btn-lg" style="min-width:240px;">
          🚀 Mulai Analisa AI
        </button>
      </div>
    </div>
    {/if}

    <!-- PHASE 2: BG REMOVAL -->
    {#if phase === 'bg_removal'}
    <div class="card animate-in" style="padding:48px 32px; text-align:center;">
      <div style="font-size:3rem; margin-bottom:16px;" class="animate-float">🖼️</div>
      <h2 style="font-size:1.5rem;font-weight:800;margin:0 0 8px;">{isProcessing ? 'Menghapus Background...' : 'Background Berhasil Dihapus!'}</h2>
      <p style="color:var(--text-2);font-size:0.95rem;margin:0 0 32px;">{isProcessing ? 'U²-Net sedang memisahkan objek dari latar belakang' : 'Selesai memisahkan objek dengan presisi.'}</p>

      <div style="display:flex; justify-content:center; gap: 20px; margin-bottom: 32px;">
        {#each slots as slot}
          {@const file = getFile(slot.field)}
          {#if file}
          <div style="position:relative; width:140px; height:140px; border-radius:var(--radius); overflow:hidden; border:2px solid {isProcessing ? 'var(--primary-light)' : 'var(--success-light)'};">
            <img src={getPreview(file)} alt="Processing" style="width:100%;height:100%;object-fit:cover; {isProcessing ? 'filter: grayscale(50%);' : ''}" />
            {#if isProcessing}<div class="scan-line"></div>{/if}
            {#if !isProcessing}<div style="position:absolute; bottom:8px; right:8px; background:var(--success); color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:bold;">✓</div>{/if}
          </div>
          {/if}
        {/each}
      </div>

      <div class="progress-bar-wrap" style="max-width:400px; margin:0 auto; margin-bottom:24px;">
        <div class="progress-bar-fill" style="width:{isProcessing ? '60%' : '100%'}; {isProcessing ? '' : 'background:var(--success); animation:none;'}"></div>
      </div>
      
      {#if !isProcessing}
        <button onclick={nextToAiAnalysis} class="btn btn-primary btn-lg animate-in" style="min-width:240px;">
          Lanjut ke AI Analisis →
        </button>
      {/if}
    </div>
    {/if}

    <!-- PHASE 3: AI ANALYSIS -->
    {#if phase === 'ai_analysis'}
    <div class="card animate-in" style="padding:48px 32px; text-align:center;">
      <div style="font-size:3rem; margin-bottom:16px;" class="animate-float">🤖</div>
      <h2 style="font-size:1.5rem;font-weight:800;margin:0 0 8px;">{isProcessing ? 'Gemini Vision Menganalisa...' : 'Analisis Selesai!'}</h2>
      <p style="color:var(--text-2);font-size:0.95rem;margin:0 0 32px;">{isProcessing ? 'Mengekstrak dimensi, material, dan komponen struktur' : 'Berhasil mengekstrak spesifikasi objek.'}</p>

      <div style="display:flex; justify-content:center; gap: 20px; margin-bottom: 32px;">
        {#each slots as slot}
          {@const file = getFile(slot.field)}
          {#if file}
          <div class="bg-removed-sim" style="position:relative; width:140px; height:140px; border-radius:var(--radius); overflow:hidden; border:2px solid {isProcessing ? 'var(--success-light)' : 'var(--success)'}; padding:10px;">
            <img src={getPreview(file)} alt="Analyzed" style="width:100%;height:100%;object-fit:contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2));" />
            {#if isProcessing}
              <div style="position:absolute; inset:0; background:rgba(109,40,217,0.1); border: 2px solid var(--primary); animation: pulse 1.5s infinite;"></div>
              <div style="position:absolute; top:20%; left:20%; width:8px; height:8px; background:var(--accent); border-radius:50%; box-shadow:0 0 10px var(--accent);"></div>
              <div style="position:absolute; bottom:30%; right:20%; width:8px; height:8px; background:var(--primary); border-radius:50%; box-shadow:0 0 10px var(--primary);"></div>
            {/if}
          </div>
          {/if}
        {/each}
      </div>

      <div class="progress-bar-wrap" style="max-width:400px; margin:0 auto; margin-bottom:24px;">
        <div class="progress-bar-fill" style="width:{isProcessing ? '90%' : '100%'}; {isProcessing ? '' : 'background:var(--success); animation:none;'}"></div>
      </div>

      {#if !isProcessing}
        <button onclick={nextToReview} class="btn btn-primary btn-lg animate-in" style="min-width:240px;">
          Lanjut ke Review Spesifikasi →
        </button>
      {/if}
    </div>
    {/if}

    <!-- PHASE 4: REVIEW & BUILD -->
    {#if phase === 'review'}
    <div class="animate-in">
      <div style="text-align:center; margin-bottom:32px;">
        <h2 style="font-size:1.8rem;font-weight:900;margin:0 0 8px;">✨ Hasil Analisa & Konfirmasi</h2>
        <p style="color:var(--text-2);font-size:1rem;margin:0;">AI telah mengekstrak detail furnitur. Sesuaikan jika diperlukan sebelum dibuild menjadi .obj.</p>
      </div>

      <div class="grid-2" style="gap:24px; align-items:start;">
        <!-- Left: Images -->
        <div class="card" style="padding:24px;">
          <h3 style="font-size:1rem; font-weight:800; margin:0 0 16px;">Gambar Bebas Latar (BG Removed)</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            {#each slots as slot}
              {@const file = getFile(slot.field)}
              {#if file}
              <div class="bg-removed-sim" style="border-radius:var(--radius); padding:12px; height:180px; display:flex; align-items:center; justify-content:center;">
                 <img src={getPreview(file)} alt={slot.label} style="max-width:100%;max-height:100%;object-fit:contain; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.15));" />
                 <div style="position:absolute; top:8px; left:8px; background:rgba(255,255,255,0.9); font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:4px; box-shadow:var(--shadow-sm);">{slot.label}</div>
              </div>
              {/if}
            {/each}
          </div>
          
          {#if missingCount > 0}
            <div style="margin-top:16px; background:var(--primary-light); color:var(--primary); padding:12px; border-radius:var(--radius); font-size:0.8rem; font-weight:600; display:flex; gap:8px;">
              <span>🤖</span>
              <span>AI akan generate tekstur {missingCount} sisi yang kosong menggunakan View Synthesis.</span>
            </div>
          {/if}
        </div>

        <!-- Right: AI Form Data -->
        <div class="card" style="padding:24px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
             <h3 style="font-size:1rem; font-weight:800; margin:0;">Spesifikasi Parametrik</h3>
             <span class="badge badge-success">🤖 AI Auto-filled</span>
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <p class="form-label">Kategori Utama</p>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              {#each categories as c}
                <button onclick={() => category=c.id} class="chip {category===c.id ? 'active' : ''}" style="padding:4px 12px; font-size:0.75rem;">{c.icon} {c.label}</button>
              {/each}
            </div>
          </div>

          <div class="grid-3" style="gap:12px; margin-bottom:16px;">
            <div class="form-group">
              <label for="panjang" class="form-label" style="font-size:0.75rem;">Panjang (cm)</label>
              <input id="panjang" class="form-input form-input-mono" type="number" bind:value={panjangCm} />
            </div>
            <div class="form-group">
              <label for="tinggi" class="form-label" style="font-size:0.75rem;">Tinggi (cm)</label>
              <input id="tinggi" class="form-input form-input-mono" type="number" bind:value={tinggiCm} />
            </div>
            <div class="form-group">
              <label for="lebar" class="form-label" style="font-size:0.75rem;">Lebar (cm)</label>
              <input id="lebar" class="form-input form-input-mono" type="number" bind:value={lebarCm} />
            </div>
          </div>

          <div class="grid-2" style="gap:12px; margin-bottom:16px;">
            <div class="form-group">
              <label for="jml-pintu" class="form-label" style="font-size:0.75rem;">Jumlah Pintu: {jumlahPintu}</label>
              <input id="jml-pintu" type="range" min="0" max="6" bind:value={jumlahPintu} style="accent-color:var(--primary);" />
            </div>
            <div class="form-group">
              <label for="jml-laci" class="form-label" style="font-size:0.75rem;">Jumlah Laci: {jumlahLaci}</label>
              <input id="jml-laci" type="range" min="0" max="8" bind:value={jumlahLaci} style="accent-color:var(--primary);" />
            </div>
          </div>

          <div class="form-group" style="margin-bottom:24px;">
            <label for="material-select" class="form-label" style="font-size:0.75rem;">Material</label>
            <select id="material-select" class="form-input" bind:value={material}>
              <option value="🪵 Kayu">🪵 Kayu Solid / Oak</option>
              <option value="🎨 MDF/HPL">🎨 MDF / HPL</option>
              <option value="🔩 Metal">🔩 Metal / Besi</option>
              <option value="🪟 Kaca">🪟 Kaca</option>
            </select>
          </div>

          <button onclick={submit} class="btn btn-primary btn-full btn-lg" style="font-size:1.05rem;">
            🏗️ Build Menjadi .obj + .mtl
          </button>
          <p style="text-align:center; font-size:0.75rem; color:var(--text-3); margin:12px 0 0;">
            Akan dialihkan ke halaman proses Blender Parametric
          </p>
        </div>
      </div>
    </div>
    {/if}

  </div>
</DashboardLayout>

<style>
  .timeline-step {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-3);
    background: var(--surface);
    border: 1.5px solid var(--border);
    transition: all 0.3s ease;
  }
  .timeline-step.active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
    box-shadow: 0 0 0 4px var(--primary-glow);
  }
  .timeline-step.done {
    background: var(--success-light);
    color: var(--success);
    border-color: var(--success);
  }
  .timeline-line {
    width: 40px;
    height: 2px;
    background: var(--border);
    transition: all 0.3s ease;
  }
  .timeline-line.done {
    background: var(--success);
  }

  .dropzone.drag-over {
    border-color: var(--primary) !important;
    background: var(--primary-light) !important;
    transform: scale(1.02);
  }

  .scan-line {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: var(--primary);
    box-shadow: 0 0 15px 2px var(--primary);
    animation: scan 1.5s infinite ease-in-out;
  }
  @keyframes scan {
    0% { top: 0; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }

  .bg-removed-sim {
    background-image: 
      linear-gradient(45deg, #f0f0f3 25%, transparent 25%), 
      linear-gradient(-45deg, #f0f0f3 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #f0f0f3 75%),
      linear-gradient(-45deg, transparent 75%, #f0f0f3 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    background-color: #ffffff;
    position: relative;
  }
</style>
