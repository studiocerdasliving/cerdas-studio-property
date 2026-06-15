<script>
  import DashboardLayout from '../../components/DashboardLayout.svelte'
  import { Link  } from 'svelte-routing'
  import { onMount } from 'svelte'
  import { url } from '../../lib/url.svelte.js'

  const props = $props()

  // State UI
  let wireframe   = $state(false)
  let showGrid    = $state(true)
  let autoRotate  = $state(false)

  /** @type {HTMLCanvasElement | undefined} */
  let canvas;
  /** @type {import('@babylonjs/core').Engine | undefined} */
  let engine;
  /** @type {import('@babylonjs/core').Scene | undefined} */
  let scene;
  /** @type {import('@babylonjs/core').ArcRotateCamera | undefined} */
  let camera;
  /** @type {any} */
  let mesh;
  /** @type {import('@babylonjs/core').Mesh | undefined} */
  let gridHelper;

  const objUrl   = $derived(props.project.obj_path ? `/storage/${props.project.obj_path}` : null)
  const hasModel = $derived(!!objUrl)

  const scale = $derived(
    props.project.grid_meta?.scale_threejs || {
      x: props.project.panjang_cm/100,
      y: props.project.tinggi_cm/100,
      z: props.project.lebar_cm/100
    }
  )
  const footprint = $derived({
    x:      (props.project.panjang_cm/50).toFixed(1),
    z:      (props.project.lebar_cm/50).toFixed(1),
    tinggi: (props.project.tinggi_cm/50).toFixed(1),
  })

  const premiumFormats = [
    { ext: '.glb', use: 'AR Android · Three.js', credit: 1, icon: '🌐' },
    { ext: '.usdz', use: 'AR iOS Quick Look', credit: 1, icon: '📱' },
    { ext: '.fbx', use: 'Unity · Unreal · Maya', credit: 2, icon: '🎮' },
    { ext: '.blend', use: 'Blender editable', credit: 4, icon: '🎨' },
  ]

  // Photos that were uploaded
  const uploadedPhotos = $derived(
    ['foto_depan','foto_kiri','foto_kanan','foto_atas']
      .filter(k => props.project[k])
      .map(k => ({ key: k, label: k.replace('foto_','').toUpperCase(), url: `/storage/${props.project[k]}` }))
  )

  onMount(() => {
    if (!canvas) return;

    let isMounted = true;
    let cleanup = () => {};

    const initBabylon = async () => {
        const BABYLON = await import('@babylonjs/core');
        // @ts-ignore
        await import('@babylonjs/loaders');

        if (!isMounted || !canvas) return;

        engine = new BABYLON.Engine(canvas, true);
        scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color4(0.957, 0.957, 0.961, 1);

        camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 5, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);
        camera.wheelPrecision = 50;

        const ambient = new BABYLON.HemisphericLight("ambient", new BABYLON.Vector3(0, 1, 0), scene);
        ambient.intensity = 0.6;

        const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
        dirLight.position = new BABYLON.Vector3(20, 40, 20);
        dirLight.intensity = 1.4;

        gridHelper = BABYLON.MeshBuilder.CreateGround("grid", {width: 10, height: 10, subdivisions: 20}, scene);
        const gridMat = new BABYLON.StandardMaterial("gridMat", scene);
        gridMat.wireframe = true;
        gridMat.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.8);
        gridHelper.material = gridMat;
        gridHelper.isPickable = false;

        if (hasModel) {
            try {
                const pathParts = objUrl?.split('/') || [];
                const fileName = pathParts.pop() || '';
                const rootUrl = pathParts.join('/') + '/';
                
                BABYLON.SceneLoader.ImportMeshAsync("", rootUrl, fileName, scene).then((result) => {
                    mesh = result.meshes[0];
                    if (mesh && mesh.parent) mesh = mesh.parent;
                });
            } catch(e) {
                console.error(e);
            }
        } else {
            const cabinetGroup = new BABYLON.TransformNode("cabinetGroup", scene);

            let bodyHeight = scale.y;
            let yOffset = 0;
            const hasKaki = props.project.ada_kaki;
            const legHeight = 0.15;

            if (hasKaki) {
                bodyHeight -= legHeight;
                yOffset = legHeight;
            }

            const bodyMesh = BABYLON.MeshBuilder.CreateBox("body", {width: scale.x, height: bodyHeight, depth: scale.z}, scene);
            bodyMesh.position.y = bodyHeight / 2 + yOffset;
            bodyMesh.parent = cabinetGroup;

            const texMat = new BABYLON.StandardMaterial("texMat", scene);
            if (props.project.foto_depan) {
                texMat.diffuseTexture = new BABYLON.Texture(`/storage/${props.project.foto_depan}`, scene);
            } else {
                texMat.diffuseColor = new BABYLON.Color3(0.8, 0.6, 0.4);
            }
            bodyMesh.material = texMat;

            if (hasKaki) {
                const legMat = new BABYLON.StandardMaterial("legMat", scene);
                legMat.diffuseColor = new BABYLON.Color3(0.24, 0.14, 0.08);

                const positions = [
                    [scale.x/2 - 0.05, legHeight/2, scale.z/2 - 0.05],
                    [-scale.x/2 + 0.05, legHeight/2, scale.z/2 - 0.05],
                    [scale.x/2 - 0.05, legHeight/2, -scale.z/2 + 0.05],
                    [-scale.x/2 + 0.05, legHeight/2, -scale.z/2 + 0.05]
                ];
                
                positions.forEach((pos, i) => {
                    const leg = BABYLON.MeshBuilder.CreateBox(`leg${i}`, {width: 0.06, height: legHeight, depth: 0.06}, scene);
                    leg.position = new BABYLON.Vector3(pos[0], pos[1], pos[2]);
                    leg.material = legMat;
                    leg.parent = cabinetGroup;
                });
            }

            const crown = BABYLON.MeshBuilder.CreateBox("crown", {width: scale.x + 0.08, height: 0.06, depth: scale.z + 0.08}, scene);
            crown.position.y = bodyHeight + yOffset + 0.03;
            crown.material = texMat;
            crown.parent = cabinetGroup;
            
            mesh = cabinetGroup;
        }

        engine.runRenderLoop(() => {
            if (autoRotate && mesh) {
                if (mesh.rotationQuaternion) {
                    mesh.rotate(BABYLON.Axis.Y, 0.005, BABYLON.Space.LOCAL);
                } else {
                    mesh.rotation.y += 0.005;
                }
            }
            if (scene) scene.render();
        });

        const handleResize = () => {
            if (engine) engine.resize();
        };
        window.addEventListener("resize", handleResize);

        cleanup = () => {
            if (engine) engine.dispose();
            window.removeEventListener("resize", handleResize);
        };
    };

    initBabylon();
    
    return () => {
        isMounted = false;
        cleanup();
    };
  });

  function toggleWireframe() {
    wireframe = !wireframe
    if (mesh) {
        // @ts-ignore
        const meshes = mesh.getChildMeshes ? mesh.getChildMeshes() : [mesh]
        // @ts-ignore
        meshes.forEach(m => {
            if (m.material) m.material.wireframe = wireframe
        })
    }
  }

  function toggleGrid() {
    showGrid = !showGrid
    if (gridHelper) gridHelper.isEnabled(showGrid)
  }
</script>

<DashboardLayout 
  title={props.project.name || 'Hasil Model 3D'}
  portalName="Studio Design Cerdas Living"
  menuItems={[
    { href: '/studio/hub', icon: 'view_in_ar', label: 'Studio Design' },
    { href: '/studio/upload', icon: 'upload', label: 'Upload Model' },
    { href: '/studio/proyek', icon: 'folder', label: 'Proyek Saya' },
    { href: '/studio/profil', icon: 'person', label: 'Profil Studio' }
  ]}
>
  <div style="height:calc(100vh - 64px);display:grid;grid-template-columns:1fr 340px;">

    <!-- CANVAS 3D -->
    <div style="position:relative;background:linear-gradient(180deg,#f0f0f3,#e8e8ec);">
      <canvas bind:this={canvas} style="width:100%;height:100%;display:block;"></canvas>

      <!-- Toolbar -->
      <div style="position:absolute;bottom:16px;left:16px;display:flex;gap:6px;flex-wrap:wrap;">
        <button class="canvas-btn {wireframe ? 'active' : ''}" onclick={toggleWireframe}>⛶ Wireframe</button>
        <button class="canvas-btn {showGrid ? 'active' : ''}" onclick={toggleGrid}>⊞ Grid</button>
        <button class="canvas-btn {autoRotate ? 'active' : ''}" onclick={() => autoRotate = !autoRotate}>↻ Putar</button>
      </div>

      <!-- Hint -->
      <div style="position:absolute;bottom:16px;right:16px;">
        <div style="background:rgba(255,255,255,0.85);backdrop-filter:blur(8px);padding:5px 10px;border-radius:var(--radius-sm);font-size:0.72rem;color:var(--text-3);border:1px solid rgba(0,0,0,0.06);">
          🖱 Putar · Geser · Zoom
        </div>
      </div>

      {#if !hasModel}
      <div style="position:absolute;top:16px;left:16px;background:rgba(255,255,255,0.9);backdrop-filter:blur(8px);padding:8px 14px;border-radius:var(--radius);border:1px solid rgba(217,119,6,0.2);font-size:0.78rem;color:var(--warning);">
        ⚠️ Demo — Python AI Worker belum terhubung. Menampilkan preview dimensi.
      </div>
      {/if}
    </div>

    <!-- PANEL KANAN -->
    <div style="overflow-y:auto;padding:20px;border-left:1px solid var(--border);background:var(--surface);">
      <!-- Header -->
      <div style="margin-bottom:16px;">
        <span class="badge badge-success" style="margin-bottom:8px;">✅ Selesai</span>
        <h1 style="font-size:1.1rem;font-weight:800;margin:0 0 4px;">{props.project.name || `${props.project.subcategory || props.project.category}`}</h1>
        <p style="font-size:0.78rem;color:var(--text-3);margin:0;">{props.project.category} · {props.project.material} · {props.project.style}</p>
      </div>

      <div class="divider"></div>

      <!-- Dimensi -->
      <p style="font-size:0.72rem;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em;margin:0 0 8px;">📐 Dimensi</p>
      <table class="dim-table" style="margin-bottom:14px;">
        <tbody>
          <tr><td>Panjang</td><td>{props.project.panjang_cm} cm</td></tr>
          <tr><td>Tinggi</td><td>{props.project.tinggi_cm} cm</td></tr>
          <tr><td>Lebar</td><td>{props.project.lebar_cm} cm</td></tr>
        </tbody>
      </table>

      <!-- Grid Info -->
      <p style="font-size:0.72rem;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em;margin:0 0 8px;">🏠 Room Studio</p>
      <div style="background:var(--surface-2);border-radius:var(--radius);padding:10px;margin-bottom:14px;font-family:'JetBrains Mono',monospace;font-size:0.75rem;line-height:1.8;color:var(--text-2);">
        Jejak: {footprint.x} × {footprint.z} kotak<br>
        Tinggi: {footprint.tinggi} kotak<br>
        Scale: ({scale.x.toFixed(2)}, {scale.y.toFixed(2)}, {scale.z.toFixed(2)})
      </div>

      <!-- Komponen -->
      {#if props.project.jumlah_pintu > 0 || props.project.jumlah_laci > 0}
      <p style="font-size:0.72rem;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em;margin:0 0 6px;">🔧 Komponen</p>
      <div style="font-size:0.8rem;color:var(--text-2);line-height:1.8;margin-bottom:14px;">
        {#if props.project.jumlah_pintu > 0}• {props.project.jumlah_pintu} Pintu {props.project.jenis_rel}<br>{/if}
        {#if props.project.jumlah_laci > 0}• {props.project.jumlah_laci} Laci<br>{/if}
        {#if props.project.jumlah_rak_dalam > 0}• {props.project.jumlah_rak_dalam} Rak Dalam<br>{/if}
        • Kaki: {props.project.ada_kaki ? `Ada (${props.project.tinggi_kaki_cm}cm)` : 'Tidak Ada'}
      </div>
      {/if}

      <!-- Foto yang diupload -->
      {#if uploadedPhotos.length > 0}
      <p style="font-size:0.72rem;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em;margin:0 0 8px;">📷 Foto Upload</p>
      <div style="display:grid;grid-template-columns:repeat({Math.min(uploadedPhotos.length, 4)}, 1fr);gap:6px;margin-bottom:14px;">
        {#each uploadedPhotos as photo}
          <div style="position:relative;border-radius:6px;overflow:hidden;border:1px solid var(--border);">
            <img src={photo.url} alt={photo.label} style="width:100%;height:54px;object-fit:cover;display:block;" />
            <div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.6);color:white;font-size:0.6rem;text-align:center;padding:1px 0;font-weight:600;">{photo.label}</div>
          </div>
        {/each}
      </div>
      {/if}

      <div class="divider"></div>

      <!-- Download: Default FREE -->
      <p style="font-size:0.72rem;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em;margin:0 0 10px;">📥 Download</p>
      <div class="format-card free" style="margin-bottom:8px;">
        <div style="flex:1;">
          <div style="font-family:'JetBrains Mono',monospace;font-size:0.82rem;font-weight:700;">.obj + .mtl</div>
          <div style="font-size:0.7rem;color:var(--text-3);">Static mesh · Room Studio</div>
        </div>
        {#if hasModel}
          <a href={objUrl} download class="btn btn-success btn-sm">⬇ Download</a>
        {:else}
          <button disabled class="btn btn-ghost btn-sm">Demo</button>
        {/if}
      </div>

      <!-- Premium Formats -->
      <p style="font-size:0.68rem;font-weight:600;color:var(--text-3);margin:12px 0 8px;">💎 Premium Formats</p>
      {#each premiumFormats as fmt}
        <div class="format-card premium" style="margin-bottom:6px;">
          <div style="flex:1;">
            <div style="font-family:'JetBrains Mono',monospace;font-size:0.8rem;font-weight:700;">{fmt.icon} {fmt.ext}</div>
            <div style="font-size:0.68rem;color:var(--text-3);">{fmt.use}</div>
          </div>
          <span style="font-size:0.7rem;font-weight:600;color:var(--primary);">{fmt.credit} credit</span>
        </div>
      {/each}

      <div class="divider"></div>

      <!-- Info Proses -->
      <p style="font-size:0.72rem;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em;margin:0 0 6px;">⚙️ Info Proses</p>
      <div style="font-size:0.78rem;color:var(--text-2);line-height:1.8;margin-bottom:16px;">
        {#if props.project.processing_time_seconds}⏱ {props.project.processing_time_seconds} detik<br>{/if}
        🤖 {props.project.mode_upload === '1foto' ? 'AI View Synthesis' : '4 Foto langsung'}<br>
        🏗️ Blender Parametric Template<br>
        📐 UV Baking tekstur
      </div>

      <div style="display:flex;flex-direction:column;gap:8px;">
        <Link to={url('/ai-studio')} class="btn btn-primary btn-full">+ Buat Model Baru</Link>
        <Link to={url('/gallery')} class="btn btn-ghost btn-full">Lihat Galeri</Link>
      </div>
    </div>

  </div>
</DashboardLayout>
