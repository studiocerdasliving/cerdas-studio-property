<script>
    import { navigate  } from 'svelte-routing';
    import { onMount } from 'svelte';
    import { fade, scale } from 'svelte/transition';
    import { url } from '../lib/url.svelte.js';
    import { apiFetch } from '../lib/api.js';
    import { AuthModalFrame } from '@cerdas/shell';

    let { open = $bindable(false), google_client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID || '', onSwitchToLogin } = $props();

    // Form fields
    let nama_lengkap = $state('');
    let email        = $state('');
    let password     = $state('');
    let telepon      = $state('');
    /** @type {File|null} */
    let photo        = $state(null);
    let credential   = $state('');

    let showPassword      = $state(false);
    let showGooglePassword = $state(false);
    let googlePassword    = $state('');   // password opsional saat daftar via Google
    /** @type {string|null} */
    let photoPreview  = $state(null);
    let usingGoogle   = $state(false);
    let googlePic     = $state(null);
    let processing    = $state(false);
    /** @type {any} */
    let errors        = $state({});
    // Tampilkan halaman sukses setelah submit email biasa
    let successEmail  = $state('');

    // Google confirm popup
    let showGooglePopup   = $state(false);
    /** @type {any} */
    let pendingGoogleInfo = $state(null);

    function resetForm() {
        nama_lengkap = ''; email = ''; password = ''; telepon = '';
        photo = null; credential = ''; showPassword = false; photoPreview = null;
        usingGoogle = false; googlePic = null; processing = false; errors = {};
        showGooglePopup = false; pendingGoogleInfo = null;
        googlePassword = ''; showGooglePassword = false; successEmail = '';
    }

    function closeModal() {
        open = false;
        resetForm();
    }

    // Lock/unlock body scroll
    $effect(() => {
        if (open) {
            /** @type {any} */
            const w = window;
            if (google_client_id && w.google) {
                setTimeout(initGSI, 10);
            }
        }
    });

    onMount(() => {
        if (!google_client_id) return;
        // @ts-ignore
        if (!window.google) {
            const script = document.createElement('script');
            script.src   = 'https://accounts.google.com/gsi/client';
            script.async = true; script.defer = true;
            script.id    = 'gsi-reg-modal';
            script.onload = initGSI;
            document.head.appendChild(script);
        } else {
            initGSI();
        }
        return () => { document.getElementById('gsi-reg-modal')?.remove(); };
    });

    function initGSI() {
        /** @type {any} */
        const w = window;
        if (!w.google || !google_client_id) return;
        w.google.accounts.id.initialize({
            client_id: google_client_id,
            callback: handleGoogleCallback,
            context: 'signup',
            ux_mode: 'popup',
        });
        const container = document.getElementById('g_id_signin_reg_modal');
        if (container) {
            w.google.accounts.id.renderButton(container, {
                type: 'standard', size: 'medium', theme: 'outline', width: 320
            });
        }
    }

    /** @param {any} response */
    async function handleGoogleCallback(response) {
        try {
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            pendingGoogleInfo = {
                credential: response.credential,
                name: payload.name || '',
                email: payload.email || '',
                picture: payload.picture || ''
            };
            showGooglePopup = true;
        } catch {
            errors = { google: 'Gagal memproses akun Google. Coba lagi.' };
        }
    }

    function confirmGoogleReg() {
        if (!pendingGoogleInfo) return;
        nama_lengkap = pendingGoogleInfo.name;
        email = pendingGoogleInfo.email;
        googlePic = pendingGoogleInfo.picture;
        credential = pendingGoogleInfo.credential;
        usingGoogle = true;
        showGooglePopup = false;
        errors = {};
    }

    function cancelGoogleReg() {
        showGooglePopup = false;
        pendingGoogleInfo = null;
    }

    function cancelGoogle() {
        usingGoogle = false;
        credential = '';
        googlePic = null;
        if (!photoPreview) photo = null;
    }

    /** @param {Event} e */
    function handlePhotoChange(e) {
        const target = /** @type {HTMLInputElement} */ (e.target);
        if (target.files && target.files[0]) {
            photo = target.files[0];
            const reader = new FileReader();
            reader.onload = (ev) => { if (ev.target) photoPreview = /** @type {string} */ (ev.target.result); };
            reader.readAsDataURL(photo);
        } else {
            photo = null;
            photoPreview = null;
        }
    }

    import { login } from '../lib/stores/auth.js';

    /** @param {Event} e */
    async function handleSubmit(e) {
        e.preventDefault();
        errors = {};
        
        // Manual validation client-side
        if (!nama_lengkap.trim()) errors.nama_lengkap = 'Nama lengkap wajib diisi';
        if (!email.trim()) errors.email = 'Email wajib diisi';
        if (!telepon.trim()) errors.telepon = 'No WhatsApp wajib diisi';
        if (!usingGoogle && !password) errors.password = 'Kata sandi wajib diisi';
        if (!usingGoogle && !photo) errors.photo = 'Foto profil wajib diunggah';

        if (Object.keys(errors).length > 0) return;

        processing = true;

        const formData = new FormData();
        formData.append('nama_lengkap', nama_lengkap);
        formData.append('email', email);
        formData.append('telepon', telepon);
        formData.append('role', 'agent');
        
        if (usingGoogle) {
            formData.append('token', credential);
            if (googlePassword) formData.append('password', googlePassword); // opsional password manual
            if (photo) formData.append('photo', photo); // jika ada yg dioverride manual
        } else {
            formData.append('password', password);
            if (photo) formData.append('photo', photo);
        }

        try {
            const res = await fetch(url('/api/register', true), { method: 'POST', body: formData });
            const data = await res.json();
            
            if (res.ok && data.user) {
                // Berhasil
                if (usingGoogle) {
                    // Google langsung login & auto-verify
                    if (data.token) login(data.token, data.user);
                    closeModal();
                    navigate('/agent/dashboard');
                } else {
                    // Manual form: perlu verifikasi email, tunjukkan halaman sukses
                    successEmail = email;
                }
            } else {
                if (res.status === 422) {
                    errors = data.errors || { general: data.message };
                } else {
                    errors = { general: data.message || 'Gagal mendaftar' };
                }
            }
        } catch (err) {
            errors = { general: 'Terjadi kesalahan jaringan' };
        } finally {
            processing = false;
        }
    }

    /** @param {any} e */
    function handleOverlayKey(e) { if (e.key === 'Escape') closeModal(); }
</script>

<AuthModalFrame
    open={open}
    onClose={closeModal}
    mode="register"
    title="Daftar Agen Properti"
    subtitle="Pasang iklan properti dan dapatkan pembeli lebih cepat"
>
    <!-- Google Confirm Sub-Modal -->
    {#if showGooglePopup && pendingGoogleInfo}
        <div class="g-confirm-overlay" transition:fade={{ duration:150 }}>
            <div class="g-confirm-box" transition:scale={{ duration:200, start:0.95 }}>
                <div class="g-confirm-icon">
                    <span class="material-symbols-rounded">person_add</span>
                </div>
                <h3>Konfirmasi Google</h3>
                <p>Gunakan akun Google berikut untuk mempercepat pendaftaran?</p>
                <div class="g-confirm-account">
                    {#if pendingGoogleInfo.picture}
                        <img src={pendingGoogleInfo.picture} alt="" referrerpolicy="no-referrer" />
                    {:else}
                        <div class="g-confirm-avatar-ph"></div>
                    {/if}
                    <div>
                        <span class="g-confirm-name">{pendingGoogleInfo.name}</span>
                        <span class="g-confirm-email">{pendingGoogleInfo.email}</span>
                    </div>
                </div>
                <div class="g-confirm-btns">
                    <button class="g-btn-cancel" onclick={cancelGoogleReg}>Batal</button>
                    <button class="g-btn-ok" onclick={confirmGoogleReg}>
                        <span class="material-symbols-rounded">check</span> Gunakan
                    </button>
                </div>
            </div>
        </div>
    {/if}

    <div class="modal-form-wrap">
        {#if successEmail}
            <div class="success-wrap" in:fade>
                <div class="success-icon"><span class="material-symbols-rounded">mark_email_read</span></div>
                <h3>Pendaftaran Berhasil!</h3>
                <p>Silakan periksa email <strong>{successEmail}</strong> untuk link verifikasi akun Anda. Anda bisa login setelah email diverifikasi.</p>
                <button type="button" class="btn-submit" style="margin-top:20px" onclick={() => { closeModal(); onSwitchToLogin?.(); }}>
                    Login Sekarang
                </button>
            </div>
        {:else}

            {#if errors.google || errors.general}
                <div class="form-alert alert-danger">
                    <span class="material-symbols-rounded">error</span> {errors.google || errors.general}
                </div>
            {/if}

            <form onsubmit={handleSubmit}>
                {#if !usingGoogle}
                    {#if google_client_id}
                        <div id="g_id_signin_reg_modal" style="display:flex; justify-content:center; margin-bottom: 16px;"></div>
                        <div class="form-divider"><span>atau daftar dengan email</span></div>
                    {/if}
                {:else}
                    <div class="google-badge">
                        <div class="google-badge-left">
                            {#if googlePic}
                                <img src={googlePic} alt="" class="google-badge-pic" referrerpolicy="no-referrer"/>
                            {:else}
                                <div class="google-badge-ph"><span class="material-symbols-rounded">person</span></div>
                            {/if}
                            <div>
                                <div class="google-badge-lbl">
                                    <svg viewBox="0 0 16 16" width="12" height="12"><path fill="#4285F4" d="M15.04 8.17c0-.52-.05-1.02-.13-1.5H8v2.84h3.94c-.17.91-.69 1.68-1.47 2.2v1.85h2.38c1.39-1.28 2.19-3.16 2.19-5.39z"/><path fill="#34A853" d="M8 16c1.98 0 3.64-.66 4.85-1.78l-2.38-1.85c-.66.44-1.49.7-2.47.7-1.9 0-3.51-1.28-4.09-3.01H1.46v1.91C2.66 14.17 5.15 16 8 16z"/><path fill="#FBBC05" d="M3.91 9.06c-.15-.44-.23-.91-.23-1.4s.08-.96.23-1.4V4.35H1.46C.97 5.31.7 6.38.7 7.5s.27 2.19.76 3.15l2.45-1.59z"/><path fill="#EA4335" d="M8 3.18c1.07 0 2.03.37 2.79 1.09l2.09-2.09C11.64.97 9.98.18 8 .18 5.15.18 2.66 2 1.46 4.53l2.45 1.59C4.49 4.47 6.1 3.18 8 3.18z"/></svg>
                                    Terkoneksi Google
                                </div>
                                <div class="google-badge-email">{email}</div>
                            </div>
                        </div>
                        <button type="button" class="google-badge-x" onclick={cancelGoogle} aria-label="Hapus"><span class="material-symbols-rounded">close</span></button>
                    </div>
                {/if}

                <!-- Row 1: Nama Lengkap saja -->
                <div class="form-group">
                    <label for="rm-nama">Nama Lengkap <span class="req">*</span></label>
                    <input id="rm-nama" type="text" placeholder="Nama lengkap Anda" bind:value={nama_lengkap} required class={errors.nama_lengkap ? 'err' : ''} />
                    {#if errors.nama_lengkap}<span class="err-msg">{errors.nama_lengkap}</span>{/if}
                </div>

                <!-- Email -->
                <div class="form-group">
                    <label for="rm-email">Alamat Email <span class="req">*</span></label>
                    <div class="input-icon-wrap">
                        <span class="material-symbols-rounded i-ico">mail</span>
                        <input id="rm-email" type="email" placeholder="nama@email.com" bind:value={email} required disabled={usingGoogle} class="{errors.email ? 'err' : ''} {usingGoogle ? 'disabled' : ''} has-icon" />
                        {#if usingGoogle}<span class="verified-ico"><span class="material-symbols-rounded">verified</span></span>{/if}
                    </div>
                    {#if errors.email}<span class="err-msg">{errors.email}</span>{/if}
                </div>

                <!-- Telepon -->
                <div class="form-group">
                    <label for="rm-telp">No. WhatsApp / Telepon <span class="req">*</span></label>
                    <div class="input-icon-wrap">
                        <span class="material-symbols-rounded i-ico">phone_iphone</span>
                        <input id="rm-telp" type="text" placeholder="Cth: 081234567890" bind:value={telepon} required class="{errors.telepon ? 'err' : ''} has-icon" />
                    </div>
                    {#if errors.telepon}<span class="err-msg">{errors.telepon}</span>{/if}
                </div>

                <!-- Password -->
                {#if !usingGoogle}
                    <!-- Manual register: password wajib -->
                    <div class="form-group">
                        <label for="rm-pass">Kata Sandi <span class="req">*</span></label>
                        <div class="input-icon-wrap">
                            <span class="material-symbols-rounded i-ico">lock</span>
                            <input id="rm-pass" type={showPassword ? 'text' : 'password'} placeholder="Minimal 6 karakter" bind:value={password} required class="{errors.password ? 'err' : ''} has-icon has-right-ico" />
                            <button type="button" class="pass-eye" onclick={() => showPassword = !showPassword} aria-label="Tampilkan kata sandi">
                                <span class="material-symbols-rounded">{showPassword ? 'visibility_off' : 'visibility'}</span>
                            </button>
                        </div>
                        {#if errors.password}<span class="err-msg">{errors.password}</span>{/if}
                    </div>
                {:else}
                    <!-- Google register: password opsional untuk login via email juga -->
                    <div class="form-group">
                        <label for="rm-gpass">
                            Buat Kata Sandi <span class="req">*</span>
                            <span class="pass-hint-badge">Untuk login via email & password</span>
                        </label>
                        <div class="input-icon-wrap">
                            <span class="material-symbols-rounded i-ico">lock</span>
                            <input id="rm-gpass" type={showGooglePassword ? 'text' : 'password'} placeholder="Minimal 6 karakter" bind:value={googlePassword} class="{errors.password ? 'err' : ''} has-icon has-right-ico" />
                            <button type="button" class="pass-eye" onclick={() => showGooglePassword = !showGooglePassword} aria-label="Tampilkan kata sandi">
                                <span class="material-symbols-rounded">{showGooglePassword ? 'visibility_off' : 'visibility'}</span>
                            </button>
                        </div>
                        <span class="pass-privacy-note"><span class="material-symbols-rounded" style="font-size:13px">security</span> Ini memungkinkan Anda login dengan email & password tanpa Google.</span>
                        {#if errors.password}<span class="err-msg">{errors.password}</span>{/if}
                    </div>
                {/if}

                <!-- Foto Profil -->
                <div class="form-group">
                    <label for="rm-photo">Foto Profil {#if !usingGoogle || !googlePic}<span class="req">*</span>{/if}</label>
                    <div class="photo-row">
                        <div class="photo-preview">
                            {#if photoPreview}
                                <img src={photoPreview} alt="Preview" />
                            {:else if usingGoogle && googlePic}
                                <img src={googlePic} alt="Google" referrerpolicy="no-referrer" />
                            {:else}
                                <span class="material-symbols-rounded">person_add</span>
                            {/if}
                        </div>
                        <label class="photo-btn">
                            <span class="material-symbols-rounded">cloud_upload</span>
                            {photo ? photo.name.substring(0, 20) + '...' : 'Pilih Foto'}
                            <input type="file" accept="image/jpeg,image/png,image/jpg" onchange={handlePhotoChange} style="display:none" />
                        </label>
                        {#if usingGoogle && googlePic && !photoPreview}
                            <span class="photo-hint">Foto Google digunakan</span>
                        {:else}
                            <span class="photo-hint">JPG/PNG maks 5MB</span>
                        {/if}
                    </div>
                    {#if errors.photo}<span class="err-msg">{errors.photo}</span>{/if}
                </div>

                <!-- Submit -->
                <button type="submit" class="btn-submit" disabled={processing}>
                    {#if processing}
                        <span class="material-symbols-rounded spin">refresh</span> Menyimpan...
                    {:else if usingGoogle}
                        Daftar Sekarang &amp; Pasang Iklan
                        <span class="material-symbols-rounded">arrow_forward</span>
                    {:else}
                        <span class="material-symbols-rounded">mark_email_read</span>
                        Kirim Email Verifikasi
                    {/if}
                </button>

                <p class="login-cta">
                    Sudah punya akun?
                    <button type="button" class="link-btn" onclick={() => { closeModal(); onSwitchToLogin?.(); }}>Masuk sekarang</button>
                </p>
                <p class="tos-note">Dengan mendaftar, Anda menyetujui <a href={url('/syarat-ketentuan')} target="_blank">Syarat &amp; Ketentuan</a> CerdasLiving.</p>
            </form>
        {/if}
    </div>
</AuthModalFrame>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

    /* ─── Google confirm sub-modal ─── */
    .g-confirm-overlay {
        position: fixed; inset: 0; z-index: 10100;
        background: rgba(0,0,0,0.5);
        display: flex; align-items: center; justify-content: center; padding: 16px;
    }
    .g-confirm-box {
        background: #fff; border-radius: 20px; padding: 28px 24px 24px;
        max-width: 360px; width: 100%; text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.18);
    }
    .g-confirm-icon {
        width: 52px; height: 52px; background: #f8f9fa; border-radius: 14px;
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 14px; border: 1px solid #e8eaed;
    }
    .g-confirm-box h3 { font-size: 1.1rem; font-weight: 700; color: #1a1a1a; margin: 0 0 6px; }
    .g-confirm-box p  { font-size: 0.82rem; color: #6B6B6B; margin: 0 0 16px; line-height: 1.5; }
    .g-confirm-account {
        display: flex; align-items: center; gap: 10px;
        background: #FAF8F5; border: 1.5px solid #E8E0D0; border-radius: 12px;
        padding: 10px 14px; margin-bottom: 20px; text-align: left;
    }
    .g-confirm-account img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink:0; }
    .g-confirm-avatar-ph { width:40px; height:40px; border-radius:50%; background:#e8eaed; flex-shrink:0; }
    .g-confirm-account div { display: flex; flex-direction: column; gap: 2px; min-width:0; }
    .g-confirm-name  { font-size: 0.88rem; font-weight: 600; color: #1a1a1a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .g-confirm-email { font-size: 0.76rem; color: #6B6B6B; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .g-confirm-btns  { display: flex; gap: 10px; }
    .g-btn-cancel {
        flex:1; padding: 10px; border: 1.5px solid #E8E0D0; border-radius: 10px;
        background: #fff; color: #6B6B6B; font-size: 0.86rem; font-weight: 600; cursor: pointer;
        font-family: inherit; transition: all 0.2s;
    }
    .g-btn-cancel:hover { background: #f5f5f5; }
    .g-btn-ok {
        flex:2; padding: 10px; border: none; border-radius: 10px;
        background: linear-gradient(135deg, #C9A84C, #E0B850);
        color: white; font-size: 0.86rem; font-weight: 700; cursor: pointer;
        font-family: inherit; transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(201,168,76,0.35);
    }
    .g-btn-ok:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(201,168,76,0.45); }

    .modal-form-wrap {
        display: flex; flex-direction: column; gap: 0;
        flex: 1; padding: 16px 0;
    }

    /* Google connection badge */
    .google-badge {
        display: flex; align-items: center; justify-content: space-between;
        background: #FAF8F5; border: 1.5px solid #E8E0D0;
        border-radius: 12px; padding: 10px 14px; margin-bottom: 20px;
    }
    .google-badge-left { display: flex; align-items: center; gap: 12px; }
    .google-badge-pic { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; }
    .google-badge-ph { width: 38px; height: 38px; border-radius: 50%; background: #e2e8f0; display:flex; align-items:center; justify-content:center; color:#64748b; }
    .google-badge-ph .material-symbols-rounded { font-size: 20px; }
    .google-badge-lbl { display: flex; align-items: center; gap: 6px; font-size: 0.72rem; font-weight: 700; color: #4A4A4A; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
    .google-badge-email { font-size: 0.82rem; color: #6B6B6B; font-weight: 500; }
    .google-badge-x {
        background: none; border: none; cursor: pointer; color: #9c9080;
        width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
        border-radius: 50%; transition: all 0.2s;
    }
    .google-badge-x:hover { background: #fee2e2; color: #dc2626; }
    .google-badge-x .material-symbols-rounded { font-size: 16px; }

    /* Success Message */
    .success-wrap { text-align: center; padding: 40px 20px; }
    .success-icon { width: 64px; height: 64px; background: #dcfce7; color: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
    .success-icon .material-symbols-rounded { font-size: 32px; }
    .success-wrap h3 { font-size: 1.4rem; color: #1e293b; margin: 0 0 10px; }
    .success-wrap p { font-size: 0.95rem; color: #475569; line-height: 1.6; }

    .form-alert {
        display: flex; align-items: center; gap: 8px;
        border-radius: 10px; padding: 10px 14px;
        font-size: 0.83rem; font-weight: 500; margin-bottom: 16px;
        border: 1px solid transparent;
    }
    .form-alert .material-symbols-rounded { font-size: 18px; flex-shrink: 0; }
    .alert-danger { background: #FEF2F2; border-color: #FECACA; color: #B91C1C; }

    .form-divider { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .form-divider::before,.form-divider::after { content:''; flex:1; height:1px; background:#ebe8e1; }
    .form-divider span { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 600; white-space: nowrap; }

    .form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; position: relative; }
    .form-group label { font-size: 0.78rem; font-weight: 600; color: #4A4A4A; display:flex; align-items:center; gap:6px; }
    .form-group label .req { color: #dc2626; }

    .pass-hint-badge { background: #f1f5f9; color: #475569; font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
    .pass-privacy-note { font-size: 0.75rem; color: #64748b; display: flex; align-items: center; gap: 4px; margin-top: 4px; }

    .form-group input {
        width: 100%; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px;
        font-family: inherit; font-size: 0.88rem; color: #1e293b; background: #fff;
        outline: none; transition: all 0.2s; box-sizing: border-box;
    }
    .form-group input:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.12); }
    .form-group input.err { border-color: #fca5a5; background: #FEF2F2; }
    .form-group input:disabled { background: #f8fafc; color: #64748b; cursor: not-allowed; border-color: #e2e8f0; }

    .input-icon-wrap { position: relative; }
    .i-ico { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 17px; color: #B8A882; pointer-events: none; }
    .input-icon-wrap input.has-icon { padding-left: 38px; }
    .input-icon-wrap input.has-right-ico { padding-right: 40px; }

    .verified-ico { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #10b981; display:flex; align-items:center; }
    .verified-ico .material-symbols-rounded { font-size: 18px; font-variation-settings: 'FILL' 1; }

    .pass-eye {
        position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
        background: none; border: none; cursor: pointer; color: #B8A882; padding: 4px;
    }
    .pass-eye:hover { color: #1a1611; }
    .pass-eye .material-symbols-rounded { font-size: 17px; }

    .err-msg { font-size: 0.75rem; color: #dc2626; margin-top: 2px; }

    /* Photo Upload */
    .photo-row { display: flex; align-items: center; gap: 12px; }
    .photo-preview {
        width: 46px; height: 46px; border-radius: 50%; background: #f1f5f9;
        display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1.5px solid #e2e8f0;
    }
    .photo-preview img { width: 100%; height: 100%; object-fit: cover; }
    .photo-preview .material-symbols-rounded { color: #94a3b8; font-size: 20px; }

    .photo-btn {
        background: #fff; border: 1.5px solid #e2e8f0; padding: 8px 12px; border-radius: 8px;
        font-size: 0.8rem; font-weight: 600; color: #475569; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s;
    }
    .photo-btn:hover { border-color: #cbd5e1; background: #f8fafc; }
    .photo-btn .material-symbols-rounded { font-size: 16px; color: #64748b; }
    .photo-hint { font-size: 0.72rem; color: #94a3b8; }

    .btn-submit {
        width: 100%; display: flex; align-items: center; justify-content: center;
        gap: 8px; padding: 13px; margin-top: 6px;
        background: linear-gradient(135deg, #C9A84C, #E0B850);
        color: white; border: none; border-radius: 12px;
        font-family: inherit; font-size: 0.95rem; font-weight: 700;
        cursor: pointer; transition: all 0.2s;
        box-shadow: 0 4px 14px rgba(201,168,76,0.38);
    }
    .btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,168,76,0.48); }
    .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
    .btn-submit .material-symbols-rounded { font-size: 18px; }

    .login-cta { text-align: center; font-size: 0.85rem; margin-top: 20px; margin-bottom: 8px; color: #6B6B6B; }
    .link-btn {
        background: none; border: none; cursor: pointer;
        color: #C9A84C; font-size: 0.85rem; font-weight: 700;
        font-family: inherit; padding: 0; text-decoration: none;
    }
    .link-btn:hover { text-decoration: underline; }

    .tos-note {
        text-align: center; font-size: 0.72rem; color: #94a3b8;
        line-height: 1.5; margin: 0;
    }
    .tos-note a { color: #C9A84C; text-decoration: none; font-weight: 600; }
    .tos-note a:hover { text-decoration: underline; }

    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin 0.9s linear infinite; }

    /* Password hint elements */
    .form-group label { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .pass-hint-badge {
        display: inline-block;
        background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.3);
        color: #9C6914; font-size: 0.67rem; font-weight: 600;
        padding: 2px 7px; border-radius: 999px; text-transform: none; letter-spacing: 0;
    }
    .pass-privacy-note {
        display: flex; align-items: center; gap: 4px;
        font-size: 0.72rem; color: #7c6b4e; background: rgba(201,168,76,0.06);
        border: 1px solid rgba(201,168,76,0.18); border-radius: 8px;
        padding: 6px 10px; margin-top: 4px;
    }
    .pass-privacy-note .material-symbols-rounded { color: #C9A84C; flex-shrink: 0; }

    /* Email Verification Success Screen */
    .verify-success {
        display: flex; flex-direction: column; align-items: center;
        text-align: center; padding: 20px 8px; gap: 12px;
    }
    .verify-icon {
        width: 70px; height: 70px; border-radius: 50%;
        background: linear-gradient(135deg, rgba(201,168,76,0.15), rgba(224,184,80,0.2));
        border: 2px solid rgba(201,168,76,0.3);
        display: flex; align-items: center; justify-content: center;
    }
    .verify-icon .material-symbols-rounded {
        font-size: 34px; color: #C9A84C;
    }
    .verify-success h3 { font-size: 1.2rem; font-weight: 800; color: #1a1611; margin: 0; }
    .verify-success p { font-size: 0.84rem; color: #64748b; margin: 0; }
    .verify-email-box {
        background: #f8f5ee; border: 1.5px solid #e2d5b5; border-radius: 10px;
        padding: 8px 18px; font-size: 0.88rem; font-weight: 700; color: #1a1611;
    }
    .verify-hint {
        font-size: 0.8rem !important; color: #9c9080 !important;
        line-height: 1.5; max-width: 300px;
    }

    /* Responsive */
    @media (max-width: 700px) {
        .modal-left { display: none; }
        .modal-form-wrap { padding: 24px 20px 28px; }
    }
</style>
