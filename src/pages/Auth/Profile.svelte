<script>
    import { onMount } from 'svelte';
    import { url } from '../../lib/url.svelte.js';
    import { apiFetch } from '../../lib/api.js';
    import DashboardLayout from '../../components/DashboardLayout.svelte';

    let { user = {}, staff = {}, errors = $bindable({}) } = $props();

    // svelte-ignore state_referenced_locally
    let nama = $state(user.nama || '');
    // svelte-ignore state_referenced_locally
    let telepon = $state(user.telepon || '');
    // svelte-ignore state_referenced_locally
    let whatsapp = $state(user.whatsapp || '');
    /** @type {File | null} */
    let photo = $state(null);
    let photoPreview = $state('');
    let processing = $state(false);
    let successMsg = $state('');

    /** @param {any} e */
    function handlePhotoChange(e) {
        const file = e.target.files[0];
        if (file) {
            photo = file;
            photoPreview = URL.createObjectURL(file);
        }
    }

    /** @param {Event} e */
    function handleSubmit(e) {
        e.preventDefault();
        processing = true;
        successMsg = '';

        const fd = new FormData();
        fd.append('nama', nama);
        fd.append('telepon', telepon);
        fd.append('whatsapp', whatsapp);
        if (photo) {
            fd.append('photo', photo);
        }

        apiFetch('/profile', {
            method: 'POST',
            body: fd,
            forceFormData: true
        }).then(() => {
            successMsg = 'Profil berhasil diperbarui!';
        }).catch((errs) => {
            errors = errs;
        }).finally(() => {
            processing = false;
        });
    }
</script>

<DashboardLayout title="Profil Saya">
    <div style="background: var(--surface-2); padding: 14px 0; border-bottom: 1px solid var(--border)">
        <div class="container" style="font-size: 0.8rem; color: var(--text-3)">
            <a href={url('/')} style="color: var(--text-3); text-decoration: none;">Beranda</a>
            <span>›</span>
            <span style="color: var(--text-1)">Profil Saya</span>
        </div>
    </div>

    <div class="container" style="padding: 48px 24px 80px;">
        <div class="profile-layout">
            <!-- Left Sidebar Summary -->
            <div class="card profile-sidebar" style="padding: 32px; text-align: center;">
                <div class="avatar-box-large">
                    {#if photoPreview}
                        <img src={photoPreview} alt="Avatar Preview" class="avatar-img-large" />
                    {:else if user.gambar}
                        <img src={`/upload/staff/${user.gambar}`} alt={user.nama} class="avatar-img-large" />
                    {:else}
                        <div class="avatar-placeholder-large">{user.nama?.substring(0,1) || 'U'}</div>
                    {/if}
                </div>
                <h2 style="font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; color: var(--text-1); margin: 16px 0 4px;">{user.nama}</h2>
                <p style="font-size: 0.82rem; color: var(--text-3); text-transform: uppercase; font-weight: 600; letter-spacing: 1px; margin-bottom: 20px;">{user.akses_level}</p>
                <div class="divider" style="margin: 16px 0;"></div>
                <div style="text-align: left; font-size: 0.85rem; color: var(--text-2); display: flex; flex-direction: column; gap: 8px;">
                    <div><strong>📧 Email:</strong> {user.email}</div>
                    <div><strong>🏷️ Username:</strong> @{user.username}</div>
                    {#if staff && staff.jabatan}
                        <div><strong>💼 Jabatan:</strong> {staff.jabatan}</div>
                    {/if}
                </div>
            </div>

            <!-- Main Form Card -->
            <div class="card profile-content" style="padding: 40px;">
                <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-1); margin-bottom: 24px;">✏️ Perbarui Profil</h3>

                {#if successMsg}
                    <div class="alert alert-success animate-in" style="margin-bottom: 20px;">
                        <span>{successMsg}</span>
                    </div>
                {/if}

                <form onsubmit={handleSubmit} class="profile-form">
                    <div class="form-group">
                        <label for="nama">Nama Lengkap</label>
                        <input id="nama" type="text" bind:value={nama} required />
                        {#if errors.nama}
                            <span class="error-msg">{errors.nama}</span>
                        {/if}
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="telepon">No. Telepon</label>
                            <input id="telepon" type="text" bind:value={telepon} required />
                            {#if errors.telepon}
                                <span class="error-msg">{errors.telepon}</span>
                            {/if}
                        </div>
                        <div class="form-group">
                            <label for="whatsapp">No. WhatsApp</label>
                            <input id="whatsapp" type="text" bind:value={whatsapp} required />
                            {#if errors.whatsapp}
                                <span class="error-msg">{errors.whatsapp}</span>
                            {/if}
                        </div>
                    </div>

                    <!-- Photo Upload -->
                    <div class="form-group" style="margin-top: 8px;">
                        <label for="profile_photo">Ubah Foto Profil</label>
                        <div class="photo-upload-container">
                            <label class="btn btn-outline" style="cursor: pointer; font-size: 0.82rem; padding: 8px 16px;">
                                <span class="material-symbols-rounded" style="font-size: 1.1rem;">cloud_upload</span>
                                <span>Pilih File</span>
                                <input 
                                    id="profile_photo" 
                                    type="file" 
                                    accept="image/jpeg, image/png, image/jpg" 
                                    onchange={handlePhotoChange} 
                                    style="display: none;" 
                                />
                            </label>
                            {#if photo}
                                <span class="photo-selected-name" style="font-size: 0.82rem; color: var(--text-2); font-weight: 500;">{photo.name}</span>
                            {/if}
                        </div>
                        {#if errors.photo}
                            <span class="error-msg">{errors.photo}</span>
                        {/if}
                    </div>

                    <div class="divider" style="margin: 24px 0 16px;"></div>

                    <button type="submit" class="btn btn-gold btn-lg" style="align-self: flex-start; min-width: 180px;" disabled={processing}>
                        {#if processing}
                            <span class="material-symbols-rounded spinning" style="font-size: 1.1rem;">refresh</span>
                            <span>Menyimpan...</span>
                        {:else}
                            <span>Simpan Perubahan</span>
                        {/if}
                    </button>
                </form>
            </div>
        </div>
    </div>
</DashboardLayout>

<style>
    .profile-layout {
        display: grid;
        grid-template-columns: 320px 1fr;
        gap: 32px;
        align-items: start;
    }

    .avatar-box-large {
        width: 110px;
        height: 110px;
        border-radius: 50%;
        overflow: hidden;
        border: 3px solid var(--gold-light);
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--surface-2);
        box-shadow: var(--shadow-sm);
    }

    .avatar-img-large {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .avatar-placeholder-large {
        font-family: 'Playfair Display', serif;
        font-size: 2.8rem;
        font-weight: 800;
        color: var(--gold);
    }

    .profile-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
    }

    .photo-upload-container {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 4px;
    }

    .alert {
        padding: 12px 16px;
        border-radius: var(--radius);
        font-size: 0.85rem;
        font-weight: 500;
        background: var(--primary-light);
        border: 1px solid rgba(43, 92, 138, 0.15);
        color: var(--primary);
    }

    .spinning {
        animation: spin 1s linear infinite;
    }

    .error-msg {
        font-size: 0.78rem;
        color: var(--coral);
        font-weight: 500;
        margin-top: 2px;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    @media (max-width: 900px) {
        .profile-layout {
            grid-template-columns: 1fr;
        }
    }
</style>
