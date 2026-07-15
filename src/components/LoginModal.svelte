<script>
    let studioUrl = import.meta.env.VITE_STUDIODESIGN_URL || 'https://studio.cerdasliving.com';
    import { navigate  } from 'svelte-routing';
    import { onMount } from 'svelte';
    import { fade, scale } from 'svelte/transition';
    import { url } from '../lib/url.svelte.js';
    import { apiFetch } from '../lib/api.js';
    import { AuthModalFrame } from '@cerdas/shell';

    let { open = $bindable(false), google_client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID || '', onSwitchToRegister, intendedRoute = null } = $props();

    let email       = $state('');
    let password    = $state('');
    let captcha     = $state('');
    let captchaImg  = $state('');
    let showPass    = $state(false);
    let refreshing  = $state(false);
    let processing  = $state(false);
    /** @type {any} */
    let errors      = $state({});

    // Google confirm popup
    let showGooglePopup   = $state(false);
    /** @type {any} */
    let googleAccountInfo = $state(null);
    let pendingCredential = $state('');
    let googleProcessing  = $state(false);

    function resetForm() {
        email = ''; password = ''; captcha = ''; showPass = false;
        processing = false; errors = {};
        showGooglePopup = false; googleAccountInfo = null;
        pendingCredential = ''; googleProcessing = false;
    }

    function closeModal() {
        open = false;
        resetForm();
    }

    // Lock/unlock scroll + fetch captcha when opened
    $effect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
            if (!captchaImg) fetchCaptcha();
            if (google_client_id) {
                if (/** @type {any} */ (window).google) initLoginGSI();
            }
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    });

    onMount(() => {
        if (!google_client_id) return;
        if (!(/** @type {any} */ (window)).google) {
            const script = document.createElement('script');
            script.src   = 'https://accounts.google.com/gsi/client';
            script.async = true; script.defer = true;
            script.id    = 'gsi-login-modal-script';
            script.onload = initLoginGSI;
            document.head.appendChild(script);
        } else {
            initLoginGSI();
        }
        return () => { document.getElementById('gsi-login-modal-script')?.remove(); };
    });

    function initLoginGSI() {
        /** @type {any} */
        const w = window;
        if (!w.google || !google_client_id) return;
        w.google.accounts.id.initialize({
            client_id: google_client_id,
            callback: handleGoogleCallback,
            context: 'signin',
            ux_mode: 'popup',
        });
        const container = document.getElementById('g_id_signin_login_modal');
        if (container) {
            w.google.accounts.id.renderButton(container, {
                type: 'standard', size: 'medium', theme: 'outline', width: 320
            });
        }
    }

    /** @param {any} response */
    function handleGoogleCallback(response) {
        try {
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            pendingCredential  = response.credential;
            googleAccountInfo  = { name: payload.name||'', email: payload.email||'', picture: payload.picture||'' };
            showGooglePopup    = true;
        } catch {
            errors = { google: 'Gagal memproses akun Google. Coba lagi.' };
        }
    }

    async function confirmGoogleLogin() {
        if (!pendingCredential || googleProcessing) return;
        errors = {};
        googleProcessing = true;
        try {
            const res = await apiFetch('/auth/google', {
                method: 'POST',
                body: JSON.stringify({ token: pendingCredential }),
            });

            if (res.status === 409) {
                window.location.href = res.headers.get('X-Inertia-Location') || url('/');
                return;
            }
            if (res.token) {
                login(res.token, res.user);
                closeModal();
                if (intendedRoute) {
                    if (intendedRoute === '/studio/hub') {
                        window.location.href = studioUrl + '/studio/hub';
                    } else {
                        navigate(intendedRoute);
                    }
                } else {
                    navigate('/agent/dashboard');
                }
            } else {
                errors = { google: res.errors?.google ?? res.message ?? 'Login Google gagal.' };
                showGooglePopup = false;
            }
        } catch {
            errors = { google: 'Terjadi kesalahan jaringan.' };
            showGooglePopup = false;
        } finally {
            googleProcessing = false;
        }
    }

    function cancelGoogleLogin() {
        showGooglePopup = false; googleAccountInfo = null;
        pendingCredential = ''; googleProcessing = false;
    }

    let expectedCaptcha = '';

    function generateCaptchaImage(text) {
        const canvas = document.createElement('canvas');
        canvas.width = 120;
        canvas.height = 48;
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';
        
        // Background
        ctx.fillStyle = '#f0ede8';
        ctx.fillRect(0, 0, 120, 48);
        
        // Noise lines
        for (let i = 0; i < 5; i++) {
            ctx.strokeStyle = ['#C9A84C', '#9c9080', '#e2e8f0'][Math.floor(Math.random()*3)];
            ctx.beginPath();
            ctx.moveTo(Math.random() * 120, Math.random() * 48);
            ctx.lineTo(Math.random() * 120, Math.random() * 48);
            ctx.stroke();
        }
        
        // Text
        ctx.font = 'bold 24px monospace';
        ctx.fillStyle = '#4A4A4A';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw characters with slight rotation
        for (let i = 0; i < text.length; i++) {
            ctx.save();
            ctx.translate(20 + i * 20, 24);
            ctx.rotate((Math.random() - 0.5) * 0.4);
            ctx.fillText(text[i], 0, 0);
            ctx.restore();
        }
        
        return canvas.toDataURL('image/png');
    }

    async function fetchCaptcha() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let text = '';
        for (let i = 0; i < 5; i++) {
            text += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        expectedCaptcha = text;
        captchaImg = generateCaptchaImage(text);
    }

    async function refreshCaptcha() {
        refreshing = true;
        await fetchCaptcha();
        captcha = '';
        setTimeout(() => refreshing = false, 300);
    }

    import { login } from '../lib/stores/auth.js';

    /** @param {any} e */
    function handleSubmit(e) {
        e.preventDefault();
        errors = {};
        
        if (captcha.toUpperCase() !== expectedCaptcha) {
            errors.captcha = 'Kode verifikasi tidak sesuai';
            refreshCaptcha();
            return;
        }
        
        processing = true;
        apiFetch('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        })
        .then(data => {
            if (data.token) {
                login(data.token, data.user);
                closeModal();
                if (intendedRoute) {
                    if (intendedRoute === '/studio/hub') {
                        window.location.href = studioUrl + '/studio/hub';
                    } else {
                        navigate(intendedRoute);
                    }
                } else {
                    navigate('/agent/dashboard');
                }
            } else {
                errors = { general: 'Gagal memproses login' };
            }
        })
        .catch(err => { errors = { general: err.message || 'Login gagal' }; })
        .finally(() => { processing = false; });
    }

    /** @param {any} e */
    function handleOverlayKey(e) { if (e.key === 'Escape') closeModal(); }
</script>

<AuthModalFrame
    open={open}
    onClose={closeModal}
    mode="login"
    title="Masuk Akun"
    subtitle="Akses portal properti & lifestyle terbaik"
    customHeadline={intendedRoute === '/studio/hub' ? 'Studio Design AI' : 'Selamat Datang Kembali!'}
    customHighlight={intendedRoute === '/studio/hub' ? 'Design' : 'Datang'}
    customDescription={intendedRoute === '/studio/hub' ? 'Wujudkan rumah impian Anda dalam hitungan menit dengan dukungan teknologi kecerdasan buatan.' : 'Masuk ke akun Anda untuk mengakses semua fitur platform properti terlengkap di Indonesia.'}
    customFeatures={intendedRoute === '/studio/hub' ? ['Desain Arsitektur Cerdas', 'AI Interior Otomatis', 'Denah Lantai Presisi', 'Koleksi Material Premium'] : ['Kelola listing properti Anda', 'AI Property Analytics', 'Properti favorit tersimpan', 'Hubungi agen profesional']}
>
    <!-- Google Confirm Sub-Modal -->
    {#if showGooglePopup && googleAccountInfo}
        <div class="g-confirm-overlay" transition:fade={{ duration:150 }}>
            <div class="g-confirm-box" transition:scale={{ duration:200, start:0.95 }}>
                <div class="g-confirm-icon">
                    <svg viewBox="0 0 24 24" width="28" height="28">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                </div>
                <h3>Konfirmasi Login Google</h3>
                <p>Apakah Anda ingin masuk menggunakan akun Google berikut?</p>
                <div class="g-confirm-account">
                    {#if googleAccountInfo.picture}
                        <img src={googleAccountInfo.picture} alt="" referrerpolicy="no-referrer" />
                    {:else}
                        <div class="g-confirm-avatar-ph"></div>
                    {/if}
                    <div>
                        <span class="g-confirm-name">{googleAccountInfo.name}</span>
                        <span class="g-confirm-email">{googleAccountInfo.email}</span>
                    </div>
                </div>
                <div class="g-confirm-btns">
                    <button class="g-btn-cancel" onclick={cancelGoogleLogin} disabled={googleProcessing}>Batal</button>
                    <button class="g-btn-ok" onclick={confirmGoogleLogin} disabled={googleProcessing}>
                        {#if googleProcessing}<span class="spin material-symbols-rounded">refresh</span> Memproses...
                        {:else}<span class="material-symbols-rounded">login</span> Ya, Masuk Sekarang{/if}
                    </button>
                </div>
            </div>
        </div>
    {/if}
    <div class="modal-form-wrap">
        {#if errors.google || errors.general}
            <div class="form-alert alert-danger">
                <span class="material-symbols-rounded">error</span> {errors.google || errors.general}
            </div>
        {/if}

        <!-- Google Login -->
        {#if google_client_id}
            <div id="g_id_signin_login_modal" style="display:flex; justify-content:center; margin-bottom: 16px;"></div>
            <div class="form-divider"><span>atau gunakan email</span></div>
        {/if}

        <!-- Login Form -->
        <form onsubmit={handleSubmit}>
            <div class="form-group">
                <label for="lm-email">Email / Username</label>
                <div class="input-icon-wrap">
                    <span class="material-symbols-rounded i-ico">person</span>
                    <input id="lm-email" type="text" placeholder="email@domain.com" bind:value={email} required class="{errors.email ? 'err' : ''} has-icon" autocomplete="username" />
                </div>
                {#if errors.email}<span class="err-msg">{errors.email}</span>{/if}
            </div>

            <div class="form-group">
                <label for="lm-pass">Kata Sandi</label>
                <div class="input-icon-wrap">
                    <span class="material-symbols-rounded i-ico">lock</span>
                    <input id="lm-pass" type={showPass ? 'text' : 'password'} placeholder="••••••••" bind:value={password} required class="{errors.password ? 'err' : ''} has-icon has-right-ico" autocomplete="current-password" />
                    <button type="button" class="pass-eye" onclick={() => showPass = !showPass} aria-label="Tampilkan kata sandi">
                        <span class="material-symbols-rounded">{showPass ? 'visibility_off' : 'visibility'}</span>
                    </button>
                </div>
                {#if errors.password}<span class="err-msg">{errors.password}</span>{/if}
            </div>

            <!-- CAPTCHA -->
            <div class="form-group">
                <label for="lm-captcha">Kode Verifikasi</label>
                <div class="captcha-row">
                    {#if captchaImg}
                        <img src={captchaImg} alt="CAPTCHA" class="captcha-img" />
                    {:else}
                        <div class="captcha-ph"></div>
                    {/if}
                    <button type="button" class="captcha-refresh" onclick={refreshCaptcha} disabled={refreshing} aria-label="Perbarui CAPTCHA">
                        <span class="material-symbols-rounded {refreshing ? 'spin' : ''}">refresh</span>
                    </button>
                </div>
                <div class="input-icon-wrap" style="margin-top:8px">
                    <span class="material-symbols-rounded i-ico">key</span>
                    <input id="lm-captcha" type="text" placeholder="Ketik kode di atas" bind:value={captcha} required maxlength="6" class="{errors.captcha ? 'err' : ''} has-icon captcha-input" oninput={(e) => captcha = /** @type {HTMLInputElement} */ (e.target).value.toUpperCase()} autocomplete="off" />
                </div>
                {#if errors.captcha}<span class="err-msg">{errors.captcha}</span>{/if}
            </div>

            <button type="submit" class="btn-submit" disabled={processing}>
                {#if processing}
                    <span class="material-symbols-rounded spin">refresh</span> Memproses...
                {:else}
                    <span class="material-symbols-rounded">login</span> Masuk Sekarang
                {/if}
            </button>

            <p class="switch-cta">
                Belum punya akun?
                <button type="button" class="link-btn" onclick={() => { closeModal(); onSwitchToRegister?.(); }}>Daftar gratis</button>
            </p>
        </form>
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
    .g-confirm-account img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
    .g-confirm-avatar-ph { width: 40px; height: 40px; border-radius: 50%; background: #f4511e; flex-shrink: 0; }
    .g-confirm-name { font-size: 0.88rem; font-weight: 700; color: #1a1a1a; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .g-confirm-email { font-size: 0.76rem; color: #6B6B6B; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .g-confirm-btns { display: flex; gap: 10px; }
    .g-btn-cancel {
        flex: 1; padding: 10px; border: 1.5px solid #E8E0D0; border-radius: 10px;
        background: #fff; color: #6B6B6B; font-size: 0.86rem; font-weight: 600; cursor: pointer;
        font-family: inherit;
    }
    .g-btn-ok {
        flex: 2; padding: 10px; border: none; border-radius: 10px;
        background: linear-gradient(135deg, #C9A84C, #E0B850);
        color: white; font-size: 0.86rem; font-weight: 700; cursor: pointer;
        font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 6px;
        box-shadow: 0 4px 12px rgba(201,168,76,0.35);
    }
    .g-btn-cancel:disabled,
    .g-btn-ok:disabled { opacity: 0.7; cursor: not-allowed; }

    .modal-form-wrap {
        display: flex; flex-direction: column; gap: 0; flex: 1; padding: 16px 0;
    }

    .form-alert {
        display: flex; align-items: center; gap: 8px;
        border-radius: 10px; padding: 10px 14px;
        font-size: 0.83rem; font-weight: 500; margin-bottom: 16px;
        border: 1px solid transparent;
    }
    .form-alert .material-symbols-rounded { font-size: 18px; flex-shrink: 0; }
    .alert-danger { background: #FEF2F2; border-color: #FECACA; color: #B91C1C; }

    .form-divider {
        display: flex; align-items: center; gap: 12px; margin-bottom: 16px;
    }
    .form-divider::before,.form-divider::after { content:''; flex:1; height:1px; background:#ebe8e1; }
    .form-divider span { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 600; white-space: nowrap; }

    .form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; position: relative; }
    .form-group label { font-size: 0.78rem; font-weight: 600; color: #4A4A4A; }

    .form-group input {
        width: 100%; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px;
        font-family: inherit; font-size: 0.88rem; color: #1e293b; background: #fff;
        outline: none; transition: all 0.2s; box-sizing: border-box;
    }
    .form-group input:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.12); }
    .form-group input.err { border-color: #fca5a5; background: #FEF2F2; }

    .err-msg { font-size: 0.75rem; color: #dc2626; margin-top: 2px; }

    .input-icon-wrap { position: relative; }
    .i-ico {
        position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
        font-size: 17px; color: #B8A882; pointer-events: none;
    }
    .input-icon-wrap input.has-icon { padding-left: 38px; }
    .input-icon-wrap input.has-right-ico { padding-right: 40px; }

    .pass-eye {
        position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
        background: none; border: none; cursor: pointer; color: #B8A882; padding: 4px;
    }
    .pass-eye:hover { color: #1a1611; }
    .pass-eye .material-symbols-rounded { font-size: 17px; }

    .captcha-row { display: flex; gap: 10px; align-items: center; }
    .captcha-img { height: 48px; border-radius: 10px; border: 1px solid #e2e8f0; object-fit: cover; }
    .captcha-ph { width: 120px; height: 48px; background: #f1f5f9; border-radius: 10px; border: 1px solid #e2e8f0; }
    .captcha-refresh {
        height: 48px; width: 48px; display: flex; align-items: center; justify-content: center;
        background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px;
        cursor: pointer; color: #64748b; transition: all 0.2s;
    }
    .captcha-refresh:hover { background: #e2e8f0; color: #334155; }
    .captcha-input { text-transform: uppercase; font-family: monospace; letter-spacing: 2px; font-weight: bold; }

    .btn-submit {
        width: 100%; display: flex; align-items: center; justify-content: center;
        gap: 8px; padding: 13px; margin-top: 10px;
        background: linear-gradient(135deg, #C9A84C, #E0B850);
        color: white; border: none; border-radius: 12px;
        font-family: inherit; font-size: 0.95rem; font-weight: 700;
        cursor: pointer; transition: all 0.2s;
        box-shadow: 0 4px 14px rgba(201,168,76,0.38);
    }
    .btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,168,76,0.48); }
    .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
    .btn-submit .material-symbols-rounded { font-size: 18px; }

    .switch-cta {
        text-align: center; font-size: 0.85rem; margin-top: 20px; color: #6B6B6B;
    }
    .link-btn {
        background: none; border: none; cursor: pointer;
        color: #C9A84C; font-size: 0.85rem; font-weight: 700;
        font-family: inherit; padding: 0; text-decoration: none;
    }
    .link-btn:hover { text-decoration: underline; }

    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin 0.9s linear infinite; display: inline-block; }

    @media (max-width: 680px) {
        .modal-form-wrap { padding: 0; }
    }
</style>
