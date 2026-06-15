<script>
    import { Link, navigate  } from 'svelte-routing';
    import { onMount } from 'svelte';
    import { url } from '../../lib/url.svelte.js';
    import { apiFetch } from '../../lib/api.js';

    let { google_client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID || '', errors = {} } = $props();

    let nama_lengkap = $state('');
    let username = $state('');
    let email = $state('');
    let password = $state('');
    let telepon = $state('');
    /** @type {File | null} */
    let photo = $state(null);
    let credential = $state('');

    let showPassword = $state(false);
    let photoPreview = $state('');
    let usingGoogle = $state(false);
    /** @type {string | null} */
    let googlePic = $state(null);
    let processing = $state(false);

    // Google popup confirmation state
    let showGooglePopup = $state(false);
    let submitBtnDisabled = $state(false);

    /** @type {{name: string, email: string, picture: string, token: string} | null} */
    let pendingGoogleInfo = $state(null); // { name, email, picture, token }

    function initGSI() {
        // @ts-ignore
        if (window.google) {
            // @ts-ignore
            window.google.accounts.id.initialize({
                client_id: google_client_id,
                callback: handleGoogleCallback,
                context: 'signup',
                ux_mode: 'popup',
            });
            const container = document.getElementById('gsi-hidden-register-btn');
            if (container) {
                // @ts-ignore
                window.google.accounts.id.renderButton(container, {
                    type: 'standard', size: 'medium', theme: 'outline', width: 320
                });
            }
        }
    }

    onMount(() => {
        if (!google_client_id) return;

        if (!(/** @type {any} */ (window)).google) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.id = 'gsi-register-script';
            script.onload = initGSI;
            document.head.appendChild(script);
        } else {
            initGSI();
        }

        return () => {
            const el = document.getElementById('gsi-register-script');
            if (el) document.head.removeChild(el);
        };
    });



    // Google GSI callback – show confirmation popup
    /** @param {any} response */
    async function handleGoogleCallback(response) {
        const token = response.credential;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));

            // Check if email already exists before showing popup
            const checkData = await apiFetch('/auth/check-email', {
                method: 'POST',
                body: JSON.stringify({ email: payload.email })
            });

            if (checkData.exists) {
                alert('Email ini sudah terdaftar. Silakan login menggunakan akun yang sudah ada.');
                return;
            }

            // Show confirmation popup
            pendingGoogleInfo = {
                name: payload.name || '',
                email: payload.email || '',
                picture: payload.picture || '',
                token,
            };
            showGooglePopup = true;
        } catch (error) {
            console.error('Google verification error', error);
            alert('Gagal membaca data Google. Silakan coba lagi.');
        }
    }

    // User confirmed using Google — populate form and dismiss popup
    function confirmGoogleRegister() {
        if (!pendingGoogleInfo) return;

        credential = pendingGoogleInfo.token;
        nama_lengkap = pendingGoogleInfo.name || nama_lengkap;
        email = pendingGoogleInfo.email || email;
        googlePic = pendingGoogleInfo.picture || null;
        usingGoogle = true;
        password = '';
        errors = {};

        showGooglePopup = false;
        pendingGoogleInfo = null;
    }

    function cancelGooglePopup() {
        showGooglePopup = false;
        pendingGoogleInfo = null;
    }

    /** @param {any} e */
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            photo = file;
            photoPreview = URL.createObjectURL(file);
        }
    };

    function cancelGoogle() {
        usingGoogle = false;
        credential = '';
        googlePic = null;
        email = '';
        nama_lengkap = '';
    }

    /** @param {Event} e */
    function submit(e) {
        e.preventDefault();
        processing = true;

        const fd = new FormData();
        fd.append('nama_lengkap', nama_lengkap);
        fd.append('username', username);
        fd.append('email', email);
        fd.append('telepon', telepon);
        fd.append('credential', credential);

        if (!usingGoogle) {
            fd.append('password', password);
        }
        if (photo) {
            fd.append('photo', photo);
        }
        if (googlePic) fd.append('googlePic', googlePic);

        apiFetch('/pasang-iklan', {
            method: 'POST',
            body: fd,
            forceFormData: true
        }).then(res => {
            processing = false;
        }).catch(errs => {
            errors = errs;
            processing = false;
        });
    }
</script>

<svelte:head>
    <title>Pasang Iklan Properti — Cerdas Living</title>
</svelte:head>


<!-- Google Confirmation Popup Modal -->
{#if showGooglePopup && pendingGoogleInfo}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="google-modal-overlay" onclick={cancelGooglePopup} onkeydown={(e) => e.key === 'Escape' && cancelGooglePopup()} role="presentation">
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="google-modal" tabindex="-1" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title-register">
      <div class="google-modal-icon">
        <svg viewBox="0 0 24 24" class="g-logo">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      </div>
      <h3 class="google-modal-title" id="modal-title-register">Daftar dengan Google?</h3>
      <p class="google-modal-desc">Formulir pendaftaran akan diisi menggunakan data dari akun Google berikut. Anda masih perlu melengkapi beberapa data lainnya.</p>

      <div class="google-account-card">
        {#if pendingGoogleInfo.picture}
          <img src={pendingGoogleInfo.picture} alt="Foto Profil" class="google-avatar" referrerpolicy="no-referrer" />
        {:else}
          <div class="google-avatar-placeholder">
            <span class="material-symbols-rounded">person</span>
          </div>
        {/if}
        <div class="google-account-info">
          <span class="google-account-name">{pendingGoogleInfo.name}</span>
          <span class="google-account-email">{pendingGoogleInfo.email}</span>
        </div>
      </div>

      <div class="google-modal-actions">
        <button class="btn-modal-cancel" onclick={cancelGooglePopup}>
          Batal
        </button>
        <button class="btn-modal-confirm" onclick={confirmGoogleRegister}>
          <span class="material-symbols-rounded">check_circle</span>
          Ya, Gunakan Akun Ini
        </button>
      </div>
    </div>
  </div>
{/if}

<div class="register-wrapper">
    <div class="register-container">
        <!-- Header with Logo -->
        <div class="register-header">
            <Link to={url('/')} class="brand-link">
                <img src={url('/images/logo-new.png')} alt="Cerdas Living" class="brand-logo" />
                <div class="brand-info">
                    <span class="brand-name">CerdasLiving</span>
                    <span class="brand-tagline">Smart Property, Better Living</span>
                </div>
            </Link>
            <h2 class="register-title">Pasang Iklan Gratis</h2>
            <p class="register-subtitle">Bergabung bersama Cerdas Living sebagai agen prioritas</p>
        </div>

        {#if errors.general}
            <div class="alert alert-danger animate-in">
                <span class="material-symbols-rounded">error</span>
                {errors.general}
            </div>
        {/if}
        {#if errors.google}
            <div class="alert alert-danger animate-in">
                <span class="material-symbols-rounded">error</span>
                {errors.google}
            </div>
        {/if}

        <form onsubmit={submit} class="register-form">
            <!-- Google Section (shown when not using Google yet) -->
            {#if !usingGoogle}
                {#if google_client_id}
                    <div class="register-header">
                        <p class="google-section-label">Daftar cepat menggunakan akun Google</p>
                        <div id="gsi-hidden-register-btn" style="display:flex; justify-content:center; margin-bottom: 16px; margin-top: 16px;"></div>

                        <div class="divider-row">
                            <span class="divider-line"></span>
                            <span class="divider-text">Atau Isi Manual</span>
                            <span class="divider-line"></span>
                        </div>
                    </div>
                {/if}
            {/if}

            <!-- Google Connected Badge (shown after Google auth confirmed) -->
            {#if usingGoogle}
                <div class="google-connected-badge animate-in">
                    <div class="google-connected-left">
                        {#if googlePic}
                            <img src={googlePic} alt="Google Avatar" class="google-badge-avatar" referrerpolicy="no-referrer" />
                        {:else}
                            <div class="google-badge-avatar-ph">
                                <span class="material-symbols-rounded">person</span>
                            </div>
                        {/if}
                        <div class="google-connected-info">
                            <div class="google-connected-label">
                                <svg viewBox="0 0 16 16" width="14" height="14" class="g-icon-small">
                                    <path fill="#4285F4" d="M15.04 8.17c0-.52-.05-1.02-.13-1.5H8v2.84h3.94c-.17.91-.69 1.68-1.47 2.2v1.85h2.38c1.39-1.28 2.19-3.16 2.19-5.39z"/>
                                    <path fill="#34A853" d="M8 16c1.98 0 3.64-.66 4.85-1.78l-2.38-1.85c-.66.44-1.49.7-2.47.7-1.9 0-3.51-1.28-4.09-3.01H1.46v1.91C2.66 14.17 5.15 16 8 16z"/>
                                    <path fill="#FBBC05" d="M3.91 9.06c-.15-.44-.23-.91-.23-1.4s.08-.96.23-1.4V4.35H1.46C.97 5.31.7 6.38.7 7.5s.27 2.19.76 3.15l2.45-1.59z"/>
                                    <path fill="#EA4335" d="M8 3.18c1.07 0 2.03.37 2.79 1.09l2.09-2.09C11.64.97 9.98.18 8 .18 5.15.18 2.66 2 1.46 4.53l2.45 1.59C4.49 4.47 6.1 3.18 8 3.18z"/>
                                </svg>
                                <span>Terkoneksi dengan Google</span>
                            </div>
                            <span class="google-connected-email">{email}</span>
                        </div>
                    </div>
                    <button type="button" class="btn-cancel-google" onclick={cancelGoogle}>
                        <span class="material-symbols-rounded">close</span>
                    </button>
                </div>
            {/if}

            <!-- Nama Lengkap & Username (side by side) -->
            <div class="form-row">
                <div class="form-group">
                    <label for="nama_lengkap">Nama Lengkap <span class="required">*</span></label>
                    <input
                        id="nama_lengkap"
                        type="text"
                        placeholder="Nama lengkap Anda"
                        bind:value={nama_lengkap}
                        required
                        class="{errors.nama_lengkap ? 'has-error' : ''}"
                    />
                    {#if errors.nama_lengkap}
                        <span class="error-msg">{errors.nama_lengkap}</span>
                    {/if}
                </div>

                <div class="form-group">
                    <label for="username">Username <span class="required">*</span></label>
                    <input
                        id="username"
                        type="text"
                        placeholder="Username unik"
                        bind:value={username}
                        required
                        class="{errors.username ? 'has-error' : ''}"
                    />
                    {#if errors.username}
                        <span class="error-msg">{errors.username}</span>
                    {/if}
                </div>
            </div>

            <!-- Email -->
            <div class="form-group">
                <label for="email">Alamat Email <span class="required">*</span></label>
                <div class="input-with-icon">
                    <span class="material-symbols-rounded input-ico">mail</span>
                    <input
                        id="email"
                        type="email"
                        placeholder="nama@email.com"
                        bind:value={email}
                        disabled={usingGoogle}
                        required
                        class="has-icon {errors.email ? 'has-error' : ''} {usingGoogle ? 'is-disabled' : ''}"
                    />
                    {#if usingGoogle}
                        <span class="input-badge-verified">
                            <span class="material-symbols-rounded">verified</span>
                        </span>
                    {/if}
                </div>
                {#if errors.email}
                    <span class="error-msg">{errors.email}</span>
                {/if}
            </div>

            <!-- Telepon -->
            <div class="form-group">
                <label for="telepon">No. Telepon / WhatsApp <span class="required">*</span></label>
                <div class="input-with-icon">
                    <span class="material-symbols-rounded input-ico">phone_iphone</span>
                    <input
                        id="telepon"
                        type="text"
                        placeholder="Cth: 081234567890"
                        bind:value={telepon}
                        required
                        class="has-icon {errors.telepon ? 'has-error' : ''}"
                    />
                </div>
                {#if errors.telepon}
                    <span class="error-msg">{errors.telepon}</span>
                {/if}
            </div>

            <!-- Password (only for manual) -->
            {#if !usingGoogle}
                <div class="form-group animate-in">
                    <label for="password">Kata Sandi <span class="required">*</span></label>
                    <div class="input-wrap">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Minimal 6 karakter"
                            bind:value={password}
                            required={!usingGoogle}
                            class="{errors.password ? 'has-error' : ''}"
                        />
                        <button
                            type="button"
                            class="pass-toggle"
                            onclick={() => showPassword = !showPassword}
                        >
                            <span class="material-symbols-rounded">
                                {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    </div>
                    {#if errors.password}
                        <span class="error-msg">{errors.password}</span>
                    {/if}
                </div>
            {/if}

            <!-- Upload Photo -->
            <div class="form-group">
                <label for="photo">Foto Profil Agen {#if !usingGoogle || !googlePic}<span class="required">*</span>{/if}</label>
                <div class="photo-upload-row">
                    <div class="photo-preview-box">
                        {#if photoPreview}
                            <img src={photoPreview} alt="Preview Foto" class="preview-img" />
                        {:else if usingGoogle && googlePic}
                            <img src={googlePic} alt="Foto Google" class="preview-img" referrerpolicy="no-referrer" />
                        {:else}
                            <span class="material-symbols-rounded">person_add</span>
                        {/if}
                    </div>
                    <div class="photo-upload-actions">
                        <label class="btn-upload">
                            <span class="material-symbols-rounded">cloud_upload</span>
                            <span>{photo ? photo.name : 'Pilih Foto'}</span>
                            <input
                                id="photo"
                                type="file"
                                accept="image/jpeg, image/png, image/jpg"
                                onchange={handlePhotoChange}
                                style="display: none;"
                            />
                        </label>
                        <p class="upload-hint">
                            JPEG, PNG maks 5MB.
                            {usingGoogle && googlePic ? 'Foto Google akan digunakan jika tidak diunggah.' : 'Wajib diunggah.'}
                        </p>
                    </div>
                </div>
                {#if errors.photo}
                    <span class="error-msg">{errors.photo}</span>
                {/if}
            </div>

            <!-- Submit Button -->
            <button type="submit" class="btn-submit" disabled={processing}>
                {#if processing}
                    <span class="material-symbols-rounded spinning">refresh</span>
                    <span>Menyimpan Data...</span>
                {:else}
                    <span>Daftar Sekarang &amp; Pasang Iklan</span>
                    <span class="material-symbols-rounded">arrow_forward</span>
                {/if}
            </button>

            <div class="register-footer-info">
                <p>Sudah punya akun? <Link to={url('/login')}>Login di sini</Link></p>
            </div>
        </form>
    </div>
</div>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@700;800&display=swap');

    * { box-sizing: border-box; }

    /* ─── Google Confirmation Modal ─── */
    .google-modal-overlay {
        position: fixed;
        inset: 0;
        z-index: 9999;
        background: rgba(0,0,0,0.45);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        animation: fadeIn 0.2s ease;
    }

    .google-modal {
        background: #ffffff;
        border-radius: 20px;
        padding: 32px 28px 28px;
        max-width: 380px;
        width: 100%;
        box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08);
        text-align: center;
        animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .google-modal-icon {
        width: 56px;
        height: 56px;
        background: #f8f9fa;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
        border: 1px solid #e8eaed;
    }

    .g-logo { width: 28px; height: 28px; }

    .google-modal-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: #1a1a1a;
        margin: 0 0 8px;
        font-family: 'Inter', sans-serif;
    }

    .google-modal-desc {
        font-size: 0.83rem;
        color: #6B6B6B;
        margin: 0 0 20px;
        line-height: 1.55;
    }

    .google-account-card {
        display: flex;
        align-items: center;
        gap: 12px;
        background: #FAF8F5;
        border: 1.5px solid #E8E0D0;
        border-radius: 14px;
        padding: 12px 16px;
        margin-bottom: 24px;
        text-align: left;
    }

    .google-avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #E8E0D0;
        flex-shrink: 0;
    }

    .google-avatar-placeholder {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: #e8eaed;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .google-avatar-placeholder .material-symbols-rounded { font-size: 22px; color: #6B6B6B; }

    .google-account-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
    }

    .google-account-name {
        font-size: 0.9rem;
        font-weight: 600;
        color: #1a1a1a;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .google-account-email {
        font-size: 0.78rem;
        color: #6B6B6B;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .google-modal-actions {
        display: flex;
        gap: 10px;
    }

    .btn-modal-cancel {
        flex: 1;
        padding: 11px 16px;
        border: 1.5px solid #E8E0D0;
        border-radius: 12px;
        background: #ffffff;
        color: #6B6B6B;
        font-size: 0.88rem;
        font-weight: 600;
        cursor: pointer;
        font-family: 'Inter', sans-serif;
        transition: all 0.2s;
    }

    .btn-modal-cancel:hover { background: #f5f5f5; border-color: #d0d0d0; }

    .btn-modal-confirm {
        flex: 2;
        padding: 11px 16px;
        border: none;
        border-radius: 12px;
        background: linear-gradient(135deg, #C9A84C, #E0B850);
        color: white;
        font-size: 0.88rem;
        font-weight: 700;
        cursor: pointer;
        font-family: 'Inter', sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(201,168,76,0.35);
    }

    .btn-modal-confirm:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(201,168,76,0.45);
    }
    .btn-modal-confirm .material-symbols-rounded { font-size: 17px; }

    /* ─── Page ─── */
    .register-wrapper {
        min-height: 100vh;
        background: #ffffff;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 40px 24px;
        position: relative;
        color: #1e293b;
        font-family: 'Inter', sans-serif;
    }

    .register-container {
        width: 100%;
        max-width: 560px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 20px;
        box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
        overflow: hidden;
        animation: fadeInUp 0.5s ease-out;
    }

    /* Header */
    .register-header {
        text-align: center;
        padding: 32px 36px 28px;
        background: linear-gradient(135deg, #FDF6E4, #FAF0D0);
        border-bottom: 1px solid #EFE4C0;
    }

    :global(.brand-link) {
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        gap: 14px;
        margin-bottom: 20px;
        text-decoration: none;
    }

    .brand-logo {
        height: 72px;
        width: auto;
        object-fit: contain;
        mix-blend-mode: multiply;
    }

    .brand-info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .brand-name {
        font-family: 'Playfair Display', serif;
        font-size: 1.55rem;
        font-weight: 800;
        color: #1a1611;
        letter-spacing: -0.3px;
        line-height: 1.1;
    }

    .brand-tagline {
        font-size: 0.7rem;
        font-weight: 700;
        color: #C9A84C;
        text-transform: uppercase;
        letter-spacing: 1.2px;
        margin-top: 2px;
    }

    .register-title {
        font-size: 1.5rem;
        font-weight: 800;
        color: #1a1611;
        margin: 0 0 6px;
        font-family: 'Playfair Display', serif;
    }

    .register-subtitle {
        font-size: 0.85rem;
        color: #7B6A40;
        margin: 0;
    }

    /* Alert */
    .alert {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 16px 32px 0;
        padding: 12px 16px;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 500;
    }

    .alert-danger {
        background: rgba(239, 68, 68, 0.08);
        border: 1px solid rgba(239, 68, 68, 0.2);
        color: #dc2626;
    }

    .alert .material-symbols-rounded { font-size: 18px; flex-shrink: 0; }

    /* Form */
    .register-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 28px 32px 32px;
    }

    /* Google section */
    .register-header p.google-section-label {
        font-size: 0.8rem;
        font-weight: 600;
        text-align: center;
        color: #94a3b8;
        margin: 0;
    }



    /* Divider */
    .divider-row {
        display: flex;
        align-items: center;
        margin: 4px 0;
    }

    .divider-line {
        flex: 1;
        height: 1px;
        background: #f0ede6;
    }

    .divider-text {
        padding: 0 16px;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        color: #94a3b8;
        font-weight: 600;
    }

    /* Google connected badge */
    .google-connected-badge {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        background: rgba(16, 185, 129, 0.06);
        border: 1.5px solid rgba(16, 185, 129, 0.25);
        border-radius: 14px;
        padding: 12px 16px;
    }

    .google-connected-left {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
    }

    .google-badge-avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid rgba(16, 185, 129, 0.3);
        flex-shrink: 0;
    }

    .google-badge-avatar-ph {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: #d1fae5;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .google-badge-avatar-ph .material-symbols-rounded { font-size: 18px; color: #059669; }

    .google-connected-info {
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
    }

    .google-connected-label {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 0.78rem;
        font-weight: 700;
        color: #059669;
    }

    .google-connected-email {
        font-size: 0.8rem;
        color: #047857;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .btn-cancel-google {
        background: none;
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 8px;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #6ee7b7;
        transition: all 0.2s;
        flex-shrink: 0;
    }

    .btn-cancel-google:hover {
        background: rgba(239, 68, 68, 0.08);
        border-color: rgba(239, 68, 68, 0.3);
        color: #dc2626;
    }

    .btn-cancel-google .material-symbols-rounded { font-size: 16px; }

    /* Form row */
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
    }

    /* Form group */
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .form-group label {
        font-size: 0.8rem;
        font-weight: 600;
        color: #4A4A4A;
        letter-spacing: 0.2px;
    }

    .required { color: #ef4444; }

    .form-group input {
        width: 100%;
        background: #ffffff;
        border: 1.5px solid #e2e8f0;
        border-radius: 12px;
        padding: 11px 16px;
        color: #1e293b;
        font-size: 0.9rem;
        outline: none;
        transition: all 0.2s;
        font-family: 'Inter', sans-serif;
        box-sizing: border-box;
    }

    .form-group input:focus {
        border-color: #c9a84c;
        box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.15);
    }

    .form-group input.has-error { border-color: #ef4444; }

    .form-group input.is-disabled {
        background: #f8f8f8;
        color: #6B6B6B;
        cursor: not-allowed;
    }

    /* Input with icon */
    .input-with-icon {
        position: relative;
    }

    .input-ico {
        position: absolute;
        left: 13px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 18px;
        color: #B8A882;
        pointer-events: none;
    }

    .input-with-icon input.has-icon {
        padding-left: 42px;
    }

    .input-badge-verified {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #10b981;
    }

    .input-badge-verified .material-symbols-rounded { font-size: 18px; }

    /* Password */
    .input-wrap {
        position: relative;
    }

    .input-wrap input {
        width: 100%;
        background: #ffffff;
        border: 1.5px solid #e2e8f0;
        border-radius: 12px;
        padding: 11px 44px 11px 16px;
        color: #1e293b;
        font-size: 0.9rem;
        outline: none;
        transition: all 0.2s;
        font-family: 'Inter', sans-serif;
        box-sizing: border-box;
    }

    .input-wrap input:focus {
        border-color: #c9a84c;
        box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.15);
    }

    .input-wrap input.has-error { border-color: #ef4444; }

    .pass-toggle {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: transparent;
        border: none;
        color: #B8A882;
        cursor: pointer;
        padding: 4px;
    }

    .pass-toggle:hover { color: #1a1611; }
    .pass-toggle .material-symbols-rounded { font-size: 18px; }

    /* Photo upload */
    .photo-upload-row {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-top: 4px;
    }

    .photo-preview-box {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        border: 2px dashed #cbd5e1;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        background: #f8fafc;
        flex-shrink: 0;
    }

    .photo-preview-box .material-symbols-rounded { font-size: 1.8rem; color: #94a3b8; }

    .preview-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .photo-upload-actions { flex-grow: 1; }

    .btn-upload {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 9px 16px;
        border-radius: 10px;
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        background: #f1f5f9;
        border: 1.5px solid #e2e8f0;
        color: #475569;
        transition: all 0.2s;
        font-family: 'Inter', sans-serif;
    }

    .btn-upload:hover {
        background: #e2e8f0;
        border-color: #cbd5e1;
    }

    .btn-upload .material-symbols-rounded { font-size: 18px; }

    .upload-hint {
        font-size: 0.72rem;
        color: #94a3b8;
        margin-top: 6px;
        line-height: 1.4;
    }

    .error-msg {
        font-size: 0.78rem;
        color: #dc2626;
        font-weight: 500;
        margin-top: 2px;
    }

    /* Submit */
    .btn-submit {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 14px;
        background: linear-gradient(135deg, #C9A84C, #E0B850);
        color: white;
        border: none;
        border-radius: 14px;
        font-family: 'Inter', sans-serif;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 14px rgba(201,168,76,0.4);
        margin-top: 4px;
        letter-spacing: 0.2px;
    }

    .btn-submit:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(201,168,76,0.5);
    }

    .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

    .btn-submit .material-symbols-rounded { font-size: 20px; }

    .spinning { animation: spin 1s linear infinite; }

    .register-footer-info {
        text-align: center;
        font-size: 0.83rem;
        color: #64748b;
        margin-top: 4px;
    }

    :global(.register-footer-info a) {
        color: #c9a84c;
        text-decoration: none;
        font-weight: 600;
    }

    :global(.register-footer-info a:hover) { text-decoration: underline; }

    @media (max-width: 576px) {
        .form-row { grid-template-columns: 1fr; }
        .register-form { padding: 24px 20px 28px; }
        .register-header { padding: 24px 20px 20px; }
        :global(.brand-link) { gap: 10px; }
        .brand-logo { height: 56px; }
    }

    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    .animate-in { animation: fadeIn 0.3s ease-out; }
</style>
