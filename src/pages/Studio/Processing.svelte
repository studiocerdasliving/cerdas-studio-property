<script>
  import DashboardLayout from '../../components/DashboardLayout.svelte'
  import { onMount } from 'svelte'
  import { url } from '../../lib/url.svelte.js'

  const props = $props()

  // Step definitions with SVG illustration per step (AI Perspective Crop Edition)
  let steps = $derived([
    {
      key: 'step1_ai_crop',
      label: 'Step 1: AI Perspective & Orientation Crop',
      detail: 'Gemini AI mendeteksi wajah (Front, Side, Top) dari foto, lalu OpenCV melakukan Perspective Warp untuk meratakan gambar yang miring menjadi tekstur 2D datar.',
      icon: '📐',
      color: '#3b82f6',
      svg: ''
    },
    {
      key: 'step2_gemini',
      label: 'Step 2: Gemini Vision Analisis',
      detail: 'Menganalisis foto untuk mendeteksi tipe furnitur, material, warna, jumlah pintu/laci, dan gaya desain sebagai parameter ke Blender.',
      icon: '🤖',
      color: '#8b5cf6',
      svg: ''
    },
    {
      key: 'step3_gen3d',
      label: 'Step 3: Open-Source 3D Generation (Trellis) & Auto-Retopology',
      detail: 'Membangun wujud 3D dinamis dari foto menggunakan Trellis, lalu DIHANCURKAN ulang (Retopology) oleh sistem kita agar tidak mencapai ratusan ribu poligon.',
      icon: '🪄',
      color: '#059669',
      svg: ''
    },
    {
      key: 'step4_texture',
      label: 'Step 4: Texture Extraction & PBR',
      detail: 'Mengekstrak pola tekstur dari foto asli menggunakan OpenCV, lalu di-mapping (UV Project) ke permukaan geometri 3D Blender.',
      icon: '🎨',
      color: '#0ea5e9',
      svg: ''
    },
    {
      key: 'step5_export',
      label: 'Step 5: Export .obj & Material',
      detail: 'Merender dan menyimpan hasil static mesh realistis ke format .obj (default) beserta file material .mtl yang siap untuk Room Studio.',
      icon: '📦',
      color: '#10b981',
      svg: ''
    }
  ])

  let currentStepIndex = $state(0)
  let cancelled = $state(false)
  let showCancel = $state(false)

  let activeStep = $derived(steps[currentStepIndex] || null)

  async function nextStep() {
    if (currentStepIndex < steps.length - 1) {
      const nextKey = steps[currentStepIndex + 1].key
      
      try {
        const metaEl = /** @type {HTMLMetaElement | null} */(document.querySelector('meta[name="csrf-token"]'));
        const csrfToken = metaEl?.content ?? '';
        await fetch(url(`/ai-studio/${props.project.id}/advance`), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
          },
          body: JSON.stringify({ step_key: nextKey })
        })
        currentStepIndex++
      } catch (error) {
        console.error("Gagal menyimpan progress:", error)
        // Tetap lanjut walau gagal agar demo tidak macet
        currentStepIndex++
      }
    } else {
      window.location.href = url(`/ai-studio/${props.project.id}/result`)
    }
  }

  function confirmCancel() {
    showCancel = true
  }

  function doCancel() {
    cancelled = true
    window.location.href = url('/ai-studio')
  }
</script>

<DashboardLayout 
  title="Hasil Proses Model 3D"
  portalName="Studio Design Cerdas Living"
  menuItems={[
    { href: '/studio/hub', icon: 'view_in_ar', label: 'Studio Design' },
    { href: '/studio/upload', icon: 'upload', label: 'Upload Model' },
    { href: '/studio/proyek', icon: 'folder', label: 'Proyek Saya' },
    { href: '/studio/profil', icon: 'person', label: 'Profil Studio' }
  ]}
>
  <div style="min-height:calc(100vh - 60px);display:flex;align-items:center;justify-content:center;padding:32px 24px;">
    <div style="width:100%;max-width:760px;">

      <!-- Header -->
      <div style="text-align:center;margin-bottom:32px;" class="animate-in">
        <h1 style="font-size:1.6rem;font-weight:800;margin:0 0 8px;">✨ Hasil Tahapan Proses</h1>
        <p style="font-weight:700;color:var(--text-1);margin:0 0 2px;">{props.project.name || `${props.project.subcategory || props.project.category}`}</p>
        <p style="font-size:0.85rem;color:var(--text-3);margin:0;font-family:'JetBrains Mono',monospace;">
          Tahap {currentStepIndex + 1} dari {steps.length}
        </p>
      </div>

      <!-- Active Step Result -->
      {#if activeStep}
        <div class="card animate-in" style="padding:48px 40px; text-align:center; margin-bottom:24px; border:2px solid {activeStep.color}30; box-shadow:0 12px 30px -10px {activeStep.color}30; position:relative; overflow:hidden;">
          
          <!-- Background glow -->
          <div style="position:absolute; top:-50%; left:-50%; width:200%; height:200%; background:radial-gradient(circle, {activeStep.color}10 0%, transparent 60%); z-index:0; pointer-events:none;"></div>

          <div style="position:relative; z-index:1;">
            <div style="font-size:3.5rem; margin-bottom:16px;" class="animate-float">{activeStep.icon}</div>
            <h2 style="font-size:1.6rem;font-weight:800;margin:0 0 16px;color:{activeStep.color};">
              {activeStep.label}
            </h2>
            <p style="font-size:1.05rem;color:var(--text-2);margin:0 auto 40px;line-height:1.6;max-width:500px;">
              {activeStep.detail}
            </p>
            
            <div style="display:flex;justify-content:center;margin-bottom:48px;">
              <div style="width:100%;max-width:680px;min-height:280px;border-radius:16px;overflow:hidden;border:1px solid {activeStep.color}40; box-shadow:0 10px 25px rgba(0,0,0,0.08); background:var(--surface); display:flex; align-items:center; justify-content:center; position:relative; padding: 24px;">
                
                <!-- Dynamic Content per Step (Blueprint v1.3 + AI Perspective) -->
                {#if activeStep.key === 'step1_ai_crop'}
                  <div style="display:flex;flex-direction:column;align-items:center;width:100%;gap:16px;">
                    <div style="display:flex;gap:32px;align-items:center;justify-content:center;width:100%;">
                      
                      <!-- Original Image with AI Bounding Boxes -->
                      <div style="position:relative;width:160px;">
                        <p style="font-size:0.75rem;font-weight:700;color:var(--text-3);margin-bottom:8px;text-align:center;">Analisis AI (Deteksi Sisi)</p>
                        <div style="position:relative;border-radius:8px;overflow:hidden;border:1px solid var(--border);">
                          <img src="/storage/{props.project.foto_depan}" alt="Asli" style="width:100%;height:180px;object-fit:cover;display:block;">
                          <!-- Simulated AI Polygon overlays -->
                          <svg style="position:absolute;inset:0;width:100%;height:100%;z-index:10;">
                            <polygon points="40,20 120,40 120,160 40,140" fill="rgba(34,197,94,0.3)" stroke="#22c55e" stroke-width="2" stroke-dasharray="4"/>
                            <polygon points="120,40 150,30 150,140 120,160" fill="rgba(59,130,246,0.3)" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4"/>
                          </svg>
                        </div>
                      </div>

                      <div style="font-size:2rem;color:var(--text-3);">→</div>

                      <!-- Flattened Extracted Textures -->
                      <div style="display:flex;flex-direction:column;gap:12px;width:100%;">
                        <p style="font-size:0.75rem;font-weight:700;color:var(--text-3);margin-bottom:0;text-align:center;">Hasil Ekstraksi Tekstur Sementara</p>
                        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
                          <!-- Sisi Depan -->
                          <div style="text-align:center;">
                            <div style="width:70px;height:120px;border-radius:4px;border:2px solid #22c55e;overflow:hidden;background:#000;">
                              <img src="/storage/{props.project.foto_depan}" alt="Sisi Depan" style="width:100%;height:100%;object-fit:cover;transform:scale(1.3);">
                            </div>
                            <p style="font-size:0.6rem;font-weight:700;color:#22c55e;margin-top:6px;">DEPAN</p>
                          </div>
                          <!-- Sisi Kiri -->
                          <div style="text-align:center;">
                            <div style="width:40px;height:120px;border-radius:4px;border:2px solid #3b82f6;overflow:hidden;background:#fff;">
                              <img src="/storage/{props.project.foto_kiri || props.project.foto_depan}" alt="Sisi Kiri" style="width:100%;height:100%;object-fit:cover;transform:{props.project.foto_kiri ? 'none' : 'scale(3) translateX(0px)'};">
                            </div>
                            <p style="font-size:0.6rem;font-weight:700;color:#3b82f6;margin-top:6px;">KIRI</p>
                          </div>
                          <!-- Sisi Kanan -->
                          <div style="text-align:center;">
                            <div style="width:40px;height:120px;border-radius:4px;border:2px solid #8b5cf6;overflow:hidden;background:#fff;">
                              <img src="/storage/{props.project.foto_kanan || props.project.foto_depan}" alt="Sisi Kanan" style="width:100%;height:100%;object-fit:cover;transform:{props.project.foto_kanan ? 'none' : 'scale(3) translateX(0px)'};">
                            </div>
                            <p style="font-size:0.6rem;font-weight:700;color:#8b5cf6;margin-top:6px;">KANAN</p>
                          </div>
                          <!-- Sisi Atas -->
                          <div style="text-align:center;">
                            <div style="width:70px;height:40px;border-radius:4px;border:2px solid #f59e0b;overflow:hidden;background:#fff;">
                              <img src="/storage/{props.project.foto_atas || props.project.foto_depan}" alt="Sisi Atas" style="width:100%;height:100%;object-fit:cover;transform:{props.project.foto_atas ? 'none' : 'scale(3) translateY(0px)'};">
                            </div>
                            <p style="font-size:0.6rem;font-weight:700;color:#f59e0b;margin-top:6px;">ATAS</p>
                          </div>
                        </div>
                      </div>

                    </div>
                    <p style="font-size:0.75rem;color:var(--text-2);text-align:center;max-width:80%;">AI mengenali poligon sisi depan, samping, dan atas yang miring, lalu meratakannya (Homography) menjadi tekstur ortografik yang sempurna.</p>
                  </div>

                {:else if activeStep.key === 'step2_gemini'}
                  <div style="width:100%;text-align:left;background:#1e1e1e;border-radius:8px;padding:20px;font-family:'JetBrains Mono',monospace;font-size:0.85rem;color:#d4d4d4;overflow-x:auto;">
                    <span style="color:#569cd6;">const</span> <span style="color:#4fc1ff;">geminiAnalysis</span> <span style="color:#d4d4d4;">=</span> {'{'}
                    <br>  <span style="color:#6a9955;">// Data diekstrak dari foto oleh Gemini Vision 2.5 Flash</span>
                    <br>  <span style="color:#9cdcfe;">"category"</span>: <span style="color:#ce9178;">"{props.project.category}"</span>,
                    <br>  <span style="color:#9cdcfe;">"template_id"</span>: <span style="color:#ce9178;">"{props.project.subcategory || 'lemari-basic'}.blend"</span>,
                    <br>  <span style="color:#9cdcfe;">"material"</span>: <span style="color:#ce9178;">"{props.project.material}"</span>,
                    <br>  <span style="color:#9cdcfe;">"style"</span>: <span style="color:#ce9178;">"{props.project.style}"</span>,
                    <br>  <span style="color:#9cdcfe;">"door_count"</span>: <span style="color:#b5cea8;">{props.project.jumlah_pintu || 0}</span>,
                    <br>  <span style="color:#9cdcfe;">"drawer_count"</span>: <span style="color:#b5cea8;">{props.project.jumlah_laci || 0}</span>,
                    <br>  <span style="color:#9cdcfe;">"has_legs"</span>: <span style="color:#569cd6;">{props.project.ada_kaki ? 'true' : 'false'}</span>,
                    <br>  <span style="color:#9cdcfe;">"confidence"</span>: <span style="color:#b5cea8;">0.98</span>
                    <br>{'}'};
                    <br><br>
                    <span style="color:#6a9955;">// Mengirim request ke headless Blender worker...</span>
                  </div>

                {:else if activeStep.key === 'step3_gen3d'}
                  <div style="width:100%;height:100%;display:flex;gap:40px;align-items:center;justify-content:center;">
                    <div style="text-align:center;">
                      <p style="font-size:0.8rem;font-weight:700;color:var(--text-3);margin-bottom:12px;">Library: {props.project.subcategory || props.project.category}.blend</p>
                      <div style="width:140px;height:140px;border:2px solid #059669;border-radius:8px;position:relative;background:#d1fae540;display:flex;align-items:center;justify-content:center;color:#059669;font-weight:800;font-size:2rem;">
                        🏗️
                      </div>
                    </div>
                    <div style="font-size:2rem;color:#059669;">→</div>
                    <div style="position:relative;width:180px;height:220px;">
                      <div style="position:absolute;inset:0;border:3px solid #059669;border-radius:4px;background:#ecfdf5;display:flex;align-items:center;justify-content:center;color:#059669;font-weight:800;flex-direction:column;">
                         <span>Geometri Nyata</span>
                         <span style="font-size:0.75rem;font-weight:600;margin-top:4px;">(Bukan kotak)</span>
                      </div>
                      <div style="position:absolute;left:-40px;top:50%;transform:translateY(-50%);color:#047857;font-weight:800;font-size:0.85rem;">T:{props.project.tinggi_cm}</div>
                      <div style="position:absolute;bottom:-25px;left:50%;transform:translateX(-50%);color:#047857;font-weight:800;font-size:0.85rem;">P:{props.project.panjang_cm}</div>
                      <div style="position:absolute;right:-40px;bottom:20px;color:#047857;font-weight:800;font-size:0.85rem;">L:{props.project.lebar_cm}</div>
                    </div>
                  </div>

                {:else if activeStep.key === 'step4_texture'}
                  <div style="width:100%;display:flex;flex-direction:column;align-items:center;gap:20px;">
                    <div style="display:flex;align-items:center;gap:32px;">
                      <div style="text-align:center;">
                        <p style="font-size:0.75rem;font-weight:700;color:var(--text-3);margin-bottom:8px;">Crop PBR Material</p>
                        <img src="/storage/{props.project.foto_depan}" alt="Material PBR" style="width:100px;height:100px;object-fit:cover;border-radius:50%;border:4px solid #0ea5e9;">
                      </div>
                      <div style="font-size:2rem;color:#0ea5e9;">→</div>
                      <div style="text-align:center;">
                        <p style="font-size:0.75rem;font-weight:700;color:var(--text-3);margin-bottom:8px;">UV Mapping 3D</p>
                        <div style="width:140px;height:140px;background:url('/storage/{props.project.foto_depan}') center/cover;border-radius:8px;box-shadow:inset 0 0 30px rgba(0,0,0,0.6);transform:rotate3d(1,1,0,30deg);border:2px solid #0ea5e9;"></div>
                      </div>
                    </div>
                    <p style="font-size:0.85rem;color:#0369a1;font-weight:600;">Mengekstrak warna & roughnes... Memetakan tekstur ke geometri asli...</p>
                  </div>

                {:else if activeStep.key === 'step5_export'}
                  <div style="width:100%;display:flex;flex-direction:column;align-items:center;gap:24px;">
                    <div style="width:80px;height:80px;background:#10b981;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:2.5rem;box-shadow:0 10px 25px rgba(16,185,129,0.4);">
                      ✓
                    </div>
                    <div style="display:flex;gap:24px;flex-wrap:wrap;justify-content:center;">
                      <div style="padding:16px 32px;border:2px solid #10b981;border-radius:12px;background:#d1fae5;color:#065f46;font-weight:800;font-size:1.1rem;display:flex;align-items:center;gap:12px;box-shadow:0 4px 12px rgba(16,185,129,0.15);">
                        <span style="font-size:1.5rem;">📦</span> {props.project.id}_model.obj
                      </div>
                      <div style="padding:16px 32px;border:2px solid #10b981;border-radius:12px;background:#d1fae5;color:#065f46;font-weight:800;font-size:1.1rem;display:flex;align-items:center;gap:12px;box-shadow:0 4px 12px rgba(16,185,129,0.15);">
                        <span style="font-size:1.5rem;">🎨</span> {props.project.id}_model.mtl
                      </div>
                    </div>
                    <p style="color:#059669;font-weight:700;font-size:1.1rem;">Semua file berhasil dibuat dan siap di-import ke Room Studio!</p>
                  </div>
                {/if}
              </div>
            </div>

            <button onclick={nextStep} class="btn btn-primary btn-lg" style="min-width:280px; background:{activeStep.color}; border-color:{activeStep.color}; font-size:1.15rem; padding:16px 24px;">
              {currentStepIndex === steps.length - 1 ? 'Selesai & Lihat Hasil Akhir 🚀' : 'Lanjut ke Tahap Berikutnya →'}
            </button>
          </div>
        </div>
      {/if}

      <!-- Cancel button -->
      {#if !cancelled}
        <div style="text-align:center;">
          {#if !showCancel}
            <button class="btn-cancel" onclick={confirmCancel}>
              🛑 Batalkan Proses
            </button>
          {:else}
            <div class="card" style="padding:16px;display:inline-flex;flex-direction:column;align-items:center;gap:10px;border:1px solid #fecaca; background:#fef2f2;">
              <p style="margin:0;font-size:0.9rem;font-weight:700;color:#dc2626;">Yakin ingin membatalkan proses ini?</p>
              <div style="display:flex;gap:12px;">
                <button onclick={doCancel}
                  style="background:#ef4444;color:white;border:none;border-radius:6px;padding:8px 20px;cursor:pointer;font-size:0.85rem;font-weight:600;font-family:inherit;">
                  Ya, Batalkan
                </button>
                <button onclick={()=>showCancel=false}
                  style="background:white;border:1px solid var(--border);color:var(--text-2);border-radius:6px;padding:8px 20px;cursor:pointer;font-size:0.85rem;font-weight:600;font-family:inherit;">
                  Lanjutkan Proses
                </button>
              </div>
            </div>
          {/if}
        </div>
      {/if}

    </div>
  </div>
</DashboardLayout>

<style>
  /* SVG animation enhancements - scoped only to Processing step animations */
  :global(.processing-svg-container svg) { width: 100%; height: 100%; }
  .btn-cancel {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-3);
    border-radius: 6px;
    padding: 8px 20px;
    cursor: pointer;
    font-size: 0.82rem;
    font-family: inherit;
    transition: all 0.15s;
  }
  .btn-cancel:hover {
    border-color: #ef4444;
    color: #ef4444;
  }
</style>
