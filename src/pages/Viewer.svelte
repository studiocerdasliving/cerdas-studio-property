<script>
  import Layout from '../components/Layout.svelte'
  import { onMount } from 'svelte'
  import { apiFetch } from '../lib/api.js'

  /** @type {HTMLCanvasElement} */
  let canvas
  /** @type {any} */
  let engine
  /** @type {any} */
  let scene
  /** @type {any} */
  let camera
  /** @type {any} */
  let mesh
  /** @type {any} */
  let animId
  /** @type {any} */
  let gridHelper

  let wireframe = $state(false)
  let autoRotate = $state(false)
  let loading = $state(false)
  /** @type {any[]} */
  let elements = $state([])
  
  onMount(() => {
    if (!canvas) return;

    const resizeHandler = () => {
      if (engine) engine.resize()
    };
    window.addEventListener("resize", resizeHandler);

    // Run async initialization
    (async () => {
        const BABYLON = await import('@babylonjs/core')
        await import('@babylonjs/loaders')

        engine = new BABYLON.Engine(canvas, true)
        scene = new BABYLON.Scene(engine)
        scene.clearColor = new BABYLON.Color4(0.957, 0.957, 0.961, 1)

        camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 10, BABYLON.Vector3.Zero(), scene)
        camera.attachControl(canvas, true)
        camera.wheelPrecision = 50

        const ambient = new BABYLON.HemisphericLight("ambient", new BABYLON.Vector3(0, 1, 0), scene)
        ambient.intensity = 0.8

        const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene)
        dirLight.position = new BABYLON.Vector3(20, 40, 20)
        dirLight.intensity = 0.8

        gridHelper = BABYLON.MeshBuilder.CreateGround("grid", {width: 20, height: 20, subdivisions: 20}, scene)
        const gridMat = new BABYLON.StandardMaterial("gridMat", scene)
        gridMat.wireframe = true
        gridMat.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.8)
        gridHelper.material = gridMat
        gridHelper.isPickable = false

        engine.runRenderLoop(() => {
            if (autoRotate && mesh) {
                mesh.rotation.y += 0.005
            }
            scene.render()
        })
    })();

    // Load Elements API
    apiFetch('/elements').then(res => {
      if (Array.isArray(res)) elements = res;
    }).catch(e => console.error("Failed to load elements", e));

    return () => { 
        if (engine) engine.dispose()
        window.removeEventListener("resize", resizeHandler)
    }
  })

  /** @param {string} url */
  async function loadModelFromUrl(url) {
    loading = true
    const BABYLON = await import('@babylonjs/core')
    await import('@babylonjs/loaders')
    
    if (mesh) { mesh.dispose(); mesh = null; }

    let parts = url.split('/');
    let fileName = parts.pop() || '';
    let rootUrl = parts.join('/') + '/';

    if (rootUrl.startsWith('/studio/data')) {
      rootUrl = '' + rootUrl;
    }
    
    try {
      BABYLON.SceneLoader.ImportMeshAsync("", rootUrl, fileName, scene).then((/** @type {any} */ result) => {
        mesh = result.meshes[0]
        if (mesh.parent) mesh = mesh.parent
        result.meshes.forEach((/** @type {any} */ m) => {
            if (m.material) {
                m.material.backFaceCulling = false
            }
        })
        centerAndAdd(result.meshes, BABYLON)
        loading = false
      }).catch((/** @type {any} */ err) => {
        console.error('Error loading model from URL:', err)
        loading = false
        alert('Gagal memuat model dari server. Format mungkin tidak didukung atau URL tidak valid.');
      })
    } catch(e) {
      console.error(e)
      loading = false
    }
  }

  /** @param {any} event */
  async function loadFiles(event) {
    const selectedFiles = Array.from(event.target.files)
    if (selectedFiles.length === 0) return
    
    loading = true
    const BABYLON = await import('@babylonjs/core')
    await import('@babylonjs/loaders')

    /** @type {any} */
    let mainFile = selectedFiles.find((/** @type {any} */ f) => f.name.toLowerCase().endsWith('.obj') || f.name.toLowerCase().endsWith('.gltf') || f.name.toLowerCase().endsWith('.glb'))
    
    if (!mainFile) {
        alert("Silakan pilih file .obj, .gltf, atau .glb")
        loading = false
        return
    }

    if (mesh) {
        mesh.dispose()
        mesh = null
    }

    const filePairs = selectedFiles.map((/** @type {any} */ f) => {
        return { name: f.name, file: f }
    })

    // @ts-ignore
    BABYLON.FilesInput.FilesToLoad = {}
    filePairs.forEach(pair => {
        // @ts-ignore
        BABYLON.FilesInput.FilesToLoad[pair.name] = pair.file
    })

    try {
        BABYLON.SceneLoader.ImportMeshAsync("", "file:", mainFile.name, scene).then((/** @type {any} */ result) => {
            mesh = result.meshes[0]
            if (mesh.parent) mesh = mesh.parent
            result.meshes.forEach((/** @type {any} */ m) => {
                if (m.material) m.material.backFaceCulling = false
            })
            centerAndAdd(result.meshes, BABYLON)
            loading = false
        }).catch((/** @type {any} */ err) => {
            console.error(err)
            loading = false
            alert("Gagal memuat file: " + err.message)
        })
    } catch (e) {
        console.error(e)
        loading = false
    }
  }

  /** 
   * @param {any[]} meshes 
   * @param {any} BABYLON 
   */
  function centerAndAdd(meshes, BABYLON) {
    if (!meshes || meshes.length === 0) return
    
    let min = new BABYLON.Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE)
    let max = new BABYLON.Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE)
    
    meshes.forEach(m => {
        m.computeWorldMatrix(true)
        const boundingInfo = m.getBoundingInfo()
        const bmin = boundingInfo.boundingBox.minimumWorld
        const bmax = boundingInfo.boundingBox.maximumWorld
        min = BABYLON.Vector3.Minimize(min, bmin)
        max = BABYLON.Vector3.Maximize(max, bmax)
    })
    
    const center = min.add(max).scale(0.5)
    const size = max.subtract(min)
    const maxDim = Math.max(size.x, size.y, size.z)
    
    let scaleMultiplier = 1
    if (maxDim > 10) scaleMultiplier = 5 / maxDim
    else if (maxDim < 0.5) scaleMultiplier = 2 / maxDim
    
    const root = new BABYLON.TransformNode("root", scene)
    meshes.forEach(m => {
        if (!m.parent) m.setParent(root)
    })
    
    root.position = new BABYLON.Vector3(-center.x * scaleMultiplier, -min.y * scaleMultiplier, -center.z * scaleMultiplier)
    root.scaling = new BABYLON.Vector3(scaleMultiplier, scaleMultiplier, scaleMultiplier)
    
    mesh = root
    
    camera.target = new BABYLON.Vector3(0, (size.y * scaleMultiplier) / 2, 0)
    camera.radius = maxDim * scaleMultiplier * 1.5
  }

  function toggleWireframe() {
    wireframe = !wireframe
    if (mesh) {
        const meshes = mesh.getChildMeshes ? mesh.getChildMeshes() : [mesh]
        meshes.forEach((/** @type {any} */ m) => {
            if (m.material) m.material.wireframe = wireframe
        })
    }
  }
</script>

<Layout title="3D Viewer | Cerdas Living">
  <div style="height:calc(100vh - 64px);display:flex;position:relative;background:var(--surface-2);">
    
    <!-- Sidebar Elements Library -->
    <div style="width: 280px; background: white; border-right: 1px solid var(--border); display:flex; flex-direction:column; z-index:10; box-shadow: 2px 0 10px rgba(0,0,0,0.02);">
      <div style="padding: 16px; border-bottom: 1px solid var(--border); font-family:'Playfair Display',serif; font-weight:700; font-size:1.1rem; color:var(--text-1);">
        Library 3D
      </div>
      <div style="flex:1; overflow-y:auto; padding: 12px;">
        {#if elements.length > 0}
          <div style="display:grid; grid-template-columns: 1fr; gap: 8px;">
            {#each elements as el}
              <button class="element-card" onclick={() => loadModelFromUrl(el.model_url)} style="background:var(--cream); border:1px solid var(--border); padding:12px; border-radius:8px; text-align:left; cursor:pointer; transition:all 0.2s;">
                <div style="font-weight:600; font-size:0.9rem; color:var(--text-1); margin-bottom:4px;">{el.name}</div>
                <div style="font-size:0.75rem; color:var(--text-3);">{el.category || 'Model 3D'}</div>
              </button>
            {/each}
          </div>
        {:else}
          <div style="text-align:center; padding: 32px 16px; color:var(--text-3); font-size:0.85rem;">
            Belum ada koleksi 3D tersimpan. Anda bisa mengunggah file lokal.
          </div>
        {/if}
      </div>
    </div>

    <div style="flex:1;position:relative;">
      <canvas bind:this={canvas} style="width:100%;height:100%;display:block;outline:none;"></canvas>
      
      <!-- Toolbar -->
      <div style="position:absolute;bottom:24px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.85);backdrop-filter:blur(10px);padding:8px 12px;border-radius:12px;display:flex;gap:8px;box-shadow:0 8px 32px rgba(0,0,0,0.1);border:1px solid rgba(255,255,255,0.4);">
        <button class="btn {wireframe ? 'btn-primary' : 'btn-ghost'} btn-sm" onclick={toggleWireframe}>⛶ Wireframe</button>
        <button class="btn {autoRotate ? 'btn-primary' : 'btn-ghost'} btn-sm" onclick={() => autoRotate = !autoRotate}>↻ Putar</button>
        <label class="btn btn-primary btn-sm" style="cursor:pointer;margin:0;">
          📂 Buka File (.obj/.glb/.gltf)
          <input type="file" multiple accept=".obj,.glb,.gltf,.mtl,.png,.jpg,.jpeg" onchange={loadFiles} style="display:none;">
        </label>
      </div>

      {#if loading}
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);background:rgba(0,0,0,0.7);color:white;padding:16px 32px;border-radius:8px;font-weight:600;">
        Memuat Model 3D...
      </div>
      {/if}

      <!-- Hint -->
      <div style="position:absolute;top:24px;left:24px;background:rgba(255,255,255,0.9);backdrop-filter:blur(8px);padding:16px;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.05);border:1px solid rgba(0,0,0,0.05);max-width:300px;">
        <h3 style="margin:0 0 8px;font-size:1rem;font-weight:800;">Universal 3D Viewer</h3>
        <p style="margin:0;font-size:0.8rem;color:var(--text-2);line-height:1.5;">
          Mendukung format <b>.obj, .glb,</b> dan <b>.gltf</b>. Anda bisa memuat file lokal dengan material/tekstur, atau klik dari Library 3D.
        </p>
      </div>
    </div>
  </div>
</Layout>
