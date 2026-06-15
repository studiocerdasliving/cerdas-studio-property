<script>
    import { apiFetch } from '../lib/api.js';
    import { navigate, Link } from 'svelte-routing';

    let name = '';
    let category = 'custom';
    /** @type {any} */
    let file_3d;
    /** @type {any} */
    let albedo;
    /** @type {any} */
    let normal;
    /** @type {any} */
    let roughness;
    /** @type {any} */
    let metalness;

    /** @type {string[]} */
    let errorMsgs = [];
    let isUploading = false;

    async function handleUpload() {
        errorMsgs = [];
        if (!name || !file_3d || file_3d.length === 0) {
            errorMsgs = ["Nama objek dan File 3D wajib diisi."];
            return;
        }

        isUploading = true;
        const formData = new FormData();
        formData.append('name', name);
        formData.append('category', category);
        formData.append('file_3d', file_3d[0]);
        
        if (albedo && albedo.length > 0) formData.append('albedo', albedo[0]);
        if (normal && normal.length > 0) formData.append('normal', normal[0]);
        if (roughness && roughness.length > 0) formData.append('roughness', roughness[0]);
        if (metalness && metalness.length > 0) formData.append('metalness', metalness[0]);

        try {
            // Needs a custom fetch because apiFetch usually sends JSON
            const token = localStorage.getItem('jwt_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Gagal mengunggah file.');
            }

            // Success, go back to dashboard
            navigate('/studio/hub');
        } catch (err) {
            errorMsgs = [err instanceof Error ? err.message : String(err)];
        } finally {
            isUploading = false;
        }
    }
</script>

<svelte:head>
    <title>Upload Object 3D - Studio Kalepa</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</svelte:head>

<div class="topbar">
    <Link to="/studio/hub" class="btn-back">
        <i class="fa-solid fa-arrow-left"></i> Kembali ke Dashboard
    </Link>
</div>

<div class="container">
    <div class="card">
        <h2>Upload Objek 3D & Material PBR</h2>
        <p style="color:#aaa; margin-top:-16px; margin-bottom:32px; font-size:14px;">
            Tambahkan model kustom Anda ke dalam katalog privat. File yang diunggah hanya dapat dilihat dan digunakan oleh Anda.
        </p>

        {#if errorMsgs.length > 0}
            <div class="alert-error">
                <ul style="margin:0; padding-left:20px;">
                    {#each errorMsgs as error}
                        <li>{error}</li>
                    {/each}
                </ul>
            </div>
        {/if}

        <form on:submit|preventDefault={handleUpload}>
            <div class="form-group">
                <label for="name">Nama Objek</label>
                <input type="text" id="name" bind:value={name} class="form-control" required placeholder="Contoh: Sofa Kulit Kustom">
            </div>

            <div class="form-group">
                <label for="category">Kategori</label>
                <select id="category" bind:value={category} class="form-control" required>
                    <option value="custom">Custom (Lainnya)</option>
                    <option value="seating">Tempat Duduk (Seating)</option>
                    <option value="tables">Meja (Tables)</option>
                    <option value="storage">Penyimpanan (Storage)</option>
                    <option value="decor">Dekorasi (Decor)</option>
                </select>
            </div>

            <div class="form-group">
                <label for="file_3d">File 3D (.obj atau .glb)</label>
                <div class="file-upload-box">
                    <input type="file" id="file_3d" bind:files={file_3d} accept=".obj,.glb,.gltf" required>
                    <div class="icon"><i class="fa-solid fa-cube"></i></div>
                    <div class="text">Klik atau Drag & Drop file 3D di sini (Maks 20MB)</div>
                    {#if file_3d && file_3d.length > 0}
                        <div style="margin-top:8px; color:#7c3aed; font-size:14px;">{file_3d[0].name}</div>
                    {/if}
                </div>
            </div>

            <hr style="border:0; border-top:1px solid #333; margin:32px 0;">
            <h3 style="margin-top:0;">Tekstur PBR (Opsional)</h3>
            <p style="color:#888; font-size:13px; margin-bottom:20px;">
                Unggah peta tekstur (image map) satu per satu jika Anda ingin merender material yang sangat realistis. Kosongkan jika file .glb Anda sudah memuat tekstur.
            </p>

            <div class="textures-grid">
                <div class="texture-item">
                    <label for="albedo" style="display:block; margin-bottom:8px; font-size:13px;">Base Color / Albedo Map (.jpg / .png)</label>
                    <input type="file" id="albedo" bind:files={albedo} accept="image/*" class="form-control" style="padding:8px;">
                </div>
                <div class="texture-item">
                    <label for="normal" style="display:block; margin-bottom:8px; font-size:13px;">Normal Map (.jpg / .png)</label>
                    <input type="file" id="normal" bind:files={normal} accept="image/*" class="form-control" style="padding:8px;">
                </div>
                <div class="texture-item">
                    <label for="roughness" style="display:block; margin-bottom:8px; font-size:13px;">Roughness Map (.jpg / .png)</label>
                    <input type="file" id="roughness" bind:files={roughness} accept="image/*" class="form-control" style="padding:8px;">
                </div>
                <div class="texture-item">
                    <label for="metalness" style="display:block; margin-bottom:8px; font-size:13px;">Metalness Map (.jpg / .png)</label>
                    <input type="file" id="metalness" bind:files={metalness} accept="image/*" class="form-control" style="padding:8px;">
                </div>
            </div>

            <button type="submit" class="btn-submit" disabled={isUploading}>
                <i class="fa-solid fa-cloud-arrow-up"></i> {isUploading ? 'Mengunggah...' : 'Upload Sekarang'}
            </button>
        </form>
    </div>
</div>

<style>
    :global(body) {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background-color: #121212;
        color: #ffffff;
        margin: 0;
        padding: 0;
    }
    .topbar {
        background-color: #1e1e1e;
        padding: 16px 32px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #333;
    }
    :global(.btn-back) {
        color: #a0a0a0;
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
        transition: color 0.2s;
    }
    :global(.btn-back:hover) {
        color: white;
    }
    
    .container {
        max-width: 800px;
        margin: 40px auto;
        padding: 0 20px;
        box-sizing: border-box;
    }
    .card {
        background-color: #1e1e1e;
        border: 1px solid #333;
        border-radius: 12px;
        padding: 32px;
    }
    .card h2 {
        margin: 0 0 24px 0;
        font-size: 24px;
    }

    .form-group {
        margin-bottom: 24px;
    }
    .form-group label {
        display: block;
        margin-bottom: 8px;
        color: #ddd;
        font-weight: 500;
        font-size: 14px;
    }
    .form-control {
        width: 100%;
        padding: 12px;
        background-color: #2a2a2a;
        border: 1px solid #444;
        color: white;
        border-radius: 8px;
        font-size: 15px;
        box-sizing: border-box;
    }
    .form-control:focus {
        outline: none;
        border-color: #7c3aed;
    }
    
    .file-upload-box {
        border: 2px dashed #444;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        background-color: #1a1a1a;
        position: relative;
        cursor: pointer;
        transition: border-color 0.3s;
    }
    .file-upload-box:hover {
        border-color: #7c3aed;
    }
    .file-upload-box input[type="file"] {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0; left: 0;
        opacity: 0;
        cursor: pointer;
    }
    .file-upload-box .icon {
        font-size: 32px;
        color: #7c3aed;
        margin-bottom: 12px;
    }
    .file-upload-box .text {
        color: #aaa;
        font-size: 14px;
    }

    .textures-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
    }
    @media (max-width: 600px) {
        .textures-grid {
            grid-template-columns: 1fr;
        }
    }
    .texture-item {
        background-color: #222;
        border: 1px solid #333;
        padding: 16px;
        border-radius: 8px;
    }

    .btn-submit {
        background-color: #7c3aed;
        color: white;
        border: none;
        padding: 14px 24px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        margin-top: 24px;
        transition: background-color 0.2s;
    }
    .btn-submit:hover:not(:disabled) {
        background-color: #4f46e5;
    }
    .btn-submit:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .alert-error {
        background-color: rgba(239, 68, 68, 0.2);
        color: #ef4444;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 24px;
        border: 1px solid #ef4444;
    }
</style>
