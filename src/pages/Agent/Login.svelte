<script>
  import { useForm } from '../../lib/useForm.svelte.js'
  import { url } from '../../lib/url.svelte.js'
  import { onMount } from 'svelte'

  let {
    google_client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    captcha_image: initialCaptcha = '',
    flash = null,
    flash_type = null,
  } = $props()

  // svelte-ignore state_referenced_locally
  let captchaImg  = $state(initialCaptcha)
  let refreshing  = $state(false)
  let showPass    = $state(false)

  // Google popup confirmation state
  let showGooglePopup = $state(false)
  /** @type {{ name: string, email: string, picture: string } | null} */
  let googleAccountInfo = $state(null)  // { name, email, picture }
  let pendingCredential = $state('')
  let googleProcessing = $state(false)

  $effect(() => {
    if (initialCaptcha) captchaImg = initialCaptcha
  })

  const form = useForm({
    email:    '',
    password: '',
    captcha:  '',
  })

  async function refreshCaptcha() {
    refreshing = true
    try {
      const res  = await fetch(url('/agent/captcha/refresh'))
      const json = await res.json()
      captchaImg = json.image
      form.data.captcha = ''
    } catch {}
    refreshing = false
  }

  /** @param {any} e */
  function handleSubmit(e) {
    e.preventDefault()
    form.post(url('/agent/login'))
  }

  function initGSI() {
    if ((/** @type {any} */ (window)).google) {
      (/** @type {any} */ (window)).google.accounts.id.initialize({
        client_id: google_client_id,
        callback: handleGoogleCallback,
        context: 'signin',
        ux_mode: 'popup',
      })
      const container = document.getElementById('gsi-hidden-btn')
      if (container) {
        (/** @type {any} */ (window)).google.accounts.id.renderButton(container, {
            type: 'standard', size: 'medium', theme: 'outline', width: 320
        });
      }
    }
  }

  onMount(() => {
    if (!google_client_id) return

    if (!(/** @type {any} */ (window)).google) {
      const script = document.createElement('script')
      script.src   = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.id    = 'gsi-login-script'
      script.onload = initGSI
      document.head.appendChild(script)
    } else {
      initGSI()
    }

    return () => {
      const el = document.getElementById('gsi-login-script')
      if (el) document.head.removeChild(el)
    }
  })



  // Google GSI callback – show confirmation popup
  /** @param {any} response */
  function handleGoogleCallback(response) {
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]))
      pendingCredential = response.credential
      googleAccountInfo = {
        name: payload.name || '',
        email: payload.email || '',
        picture: payload.picture || '',
      }
      showGooglePopup = true
    } catch (err) {
      console.error('Google decode error:', err)
      alert('Gagal membaca data Google. Silakan coba lagi.')
    }
  }

  // User confirmed login with Google
  async function confirmGoogleLogin() {
    if (!pendingCredential || googleProcessing) return
    googleProcessing = true
    try {
      const csrfToken = document.cookie
        .split('; ')
        .find(r => r.startsWith('XSRF-TOKEN='))
        ?.split('=')[1]

      const res = await fetch(url('/agent/auth/google'), {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
          'X-XSRF-TOKEN': csrfToken ? decodeURIComponent(csrfToken) : '',
          'X-Inertia': 'true',
          'X-Inertia-Version': document.querySelector('meta[name="inertia-version"]')?.getAttribute('content') ?? '',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ credential: pendingCredential }),
      })

      if (res.status === 409) {
        const loc = res.headers.get('X-Inertia-Location')
        window.location.href = loc || url('/agent/dashboard')
        return
      }

      if (res.ok) {
        window.location.href = url('/agent/dashboard')
      } else {
        const json = await res.json().catch(() => ({}))
        cancelGoogleLogin()
        alert(json?.errors?.google ?? 'Login Google gagal. Coba lagi.')
      }
    } catch (err) {
      console.error(err)
      cancelGoogleLogin()
      alert('Terjadi kesalahan jaringan. Silakan coba lagi.')
    } finally {
      googleProcessing = false
    }
  }

  function cancelGoogleLogin() {
    showGooglePopup    = false
    googleAccountInfo  = null
    pendingCredential  = ''
    googleProcessing   = false
  }
</script>

<svelte:head><title>Login Agent — Cerdas Living</title></svelte:head>



<!-- Google Confirmation Popup Modal -->
{#if showGooglePopup && googleAccountInfo}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="google-modal-overlay" onclick={cancelGoogleLogin} onkeydown={(e) => e.key === 'Escape' && cancelGoogleLogin()} role="presentation">
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="google-modal" tabindex="-1" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title-login">
      <div class="google-modal-icon">
        <svg viewBox="0 0 24 24" class="g-logo">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      </div>
      <h3 class="google-modal-title" id="modal-title-login">Konfirmasi Login Google</h3>
      <p class="google-modal-desc">Apakah Anda ingin masuk ke Agent Portal menggunakan akun Google berikut?</p>

      <div class="google-account-card">
        {#if googleAccountInfo.picture}
          <img src={googleAccountInfo.picture} alt="Foto Profil" class="google-avatar" referrerpolicy="no-referrer" />
        {:else}
          <div class="google-avatar-placeholder">
            <span class="material-symbols-rounded">person</span>
          </div>
        {/if}
        <div class="google-account-info">
          <span class="google-account-name">{googleAccountInfo.name}</span>
          <span class="google-account-email">{googleAccountInfo.email}</span>
        </div>
      </div>

      <div class="google-modal-actions">
        <button class="btn-modal-cancel" onclick={cancelGoogleLogin} disabled={googleProcessing}>
          Batal
        </button>
        <button class="btn-modal-confirm" onclick={confirmGoogleLogin} disabled={googleProcessing}>
          {#if googleProcessing}
            <span class="material-symbols-rounded spin">progress_activity</span>
            Memproses...
          {:else}
            <span class="material-symbols-rounded">login</span>
            Ya, Masuk Sekarang
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Background warm cream dengan dekorasi blob -->
<div class="login-page">
  <!-- Dekorasi blob background -->
  <div class="blob blob-1"></div>
  <div class="blob blob-2"></div>
  <div class="blob blob-3"></div>

  <div class="login-card-wrap">
    <!-- Card Utama -->
    <div class="login-card">
      <!-- Header Card -->
      <div class="card-header">
        <a href={url('/')} class="brand-link">
          <img
            src={url('/images/logo-new.png')}
            alt="CerdasLiving Logo"
            class="brand-logo-img"
          />
          <div class="brand-text">
            <span class="brand-name">CerdasLiving</span>
            <span class="brand-tagline">Smart Property, Better Living</span>
          </div>
        </a>
        <p class="header-desc">Masuk ke Agent Portal &mdash; kelola iklan Anda</p>
      </div>

      <!-- Flash message -->
      {#if flash}
        <div class="flash-msg {flash_type === 'error' ? 'flash-error' : 'flash-success'}">
          <span class="material-symbols-rounded">{flash_type === 'error' ? 'error' : 'check_circle'}</span>
          {flash}
        </div>
      {/if}

      <!-- Google Login Button (Custom Professional) -->
      {#if google_client_id}
        <div class="google-section">
          <div id="gsi-hidden-btn" style="display:flex; justify-content:center; margin-bottom: 16px;"></div>
          {#if form.errors.google}
            <p class="field-err text-center" style="margin-top: 8px;">{form.errors.google}</p>
          {/if}
        </div>

        <div class="divider-row">
          <span class="divider-line"></span>
          <span class="divider-text">Atau Gunakan Email</span>
          <span class="divider-line"></span>
        </div>
      {/if}

      <!-- Form Content -->
      <form onsubmit={handleSubmit} class="login-form">
          <!-- Email / Username -->
          <div class="field-group">
            <label class="field-label" for="agent-email">Email / Username</label>
            <div class="field-input-wrap">
              <span class="material-symbols-rounded field-ico">person</span>
              <input
                id="agent-email"
                type="text"
                class="field-input {form.errors.email ? 'has-error' : ''}"
                bind:value={form.data.email}
                placeholder="email@domain.com"
                autocomplete="username"
              />
            </div>
            {#if form.errors.email}
              <span class="field-err">{form.errors.email}</span>
            {/if}
          </div>

          <!-- Password -->
          <div class="field-group">
            <label class="field-label" for="agent-pass">Kata Sandi</label>
            <div class="field-input-wrap">
              <span class="material-symbols-rounded field-ico">lock</span>
              <input
                id="agent-pass"
                type={showPass ? 'text' : 'password'}
                class="field-input {form.errors.password ? 'has-error' : ''}"
                bind:value={form.data.password}
                placeholder="••••••••"
                autocomplete="current-password"
              />
              <button type="button" class="pass-toggle" onclick={() => showPass = !showPass} aria-label="Toggle password">
                <span class="material-symbols-rounded">{showPass ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            {#if form.errors.password}
              <span class="field-err">{form.errors.password}</span>
            {/if}
          </div>

          <!-- CAPTCHA -->
          <div class="field-group">
            <label class="field-label" for="agent-captcha">Kode Verifikasi (CAPTCHA)</label>
            <div class="captcha-row">
              {#if captchaImg}
                <img src={captchaImg} alt="CAPTCHA" class="captcha-img" />
              {:else}
                <div class="captcha-ph"></div>
              {/if}
              <button
                type="button"
                onclick={refreshCaptcha}
                disabled={refreshing}
                class="captcha-refresh"
                title="Ganti kode"
              >
                <span class="material-symbols-rounded {refreshing ? 'spin' : ''}">refresh</span>
              </button>
            </div>
            <div class="field-input-wrap" style="margin-top:8px">
              <span class="material-symbols-rounded field-ico">pin</span>
              <input
                id="agent-captcha"
                type="text"
                class="field-input font-mono {form.errors.captcha ? 'has-error' : ''}"
                bind:value={form.data.captcha}
                placeholder="Ketik kode di atas"
                maxlength="6"
                autocomplete="off"
                oninput={(e) => form.data.captcha = /** @type {HTMLInputElement} */ (e.target).value.toUpperCase()}
              />
            </div>
            {#if form.errors.captcha}
              <span class="field-err">{form.errors.captcha}</span>
            {/if}
          </div>

          <!-- Submit -->
          <button
            type="submit"
            disabled={form.processing}
            class="btn-submit"
          >
            {#if form.processing}
              <span class="material-symbols-rounded spin">progress_activity</span>
              Memproses...
            {:else}
              <span class="material-symbols-rounded">login</span>
              Masuk Sekarang
            {/if}
          </button>
        </form>
    </div>

    <!-- Footer -->
    <div class="login-footer">
      <a href={url('/')} class="footer-link">
        <span class="material-symbols-rounded" style="font-size:14px">arrow_back</span>
        Kembali ke Cerdas Living
      </a>
      <span class="footer-sep">•</span>
      <a href={url('/pasang-iklan')} class="footer-link">Daftar sebagai Agent</a>
    </div>
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
    font-size: 0.84rem;
    color: #6B6B6B;
    margin: 0 0 20px;
    line-height: 1.5;
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

  .btn-modal-cancel:hover:not(:disabled) {
    background: #f5f5f5;
    border-color: #d0d0d0;
  }

  .btn-modal-cancel:disabled { opacity: 0.6; cursor: not-allowed; }

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

  .btn-modal-confirm:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(201,168,76,0.45);
  }

  .btn-modal-confirm:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
  .btn-modal-confirm .material-symbols-rounded { font-size: 17px; }

  /* ─── Page Layout ─── */
  .login-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #FAF8F5 0%, #F5F0E8 50%, #FAEFD6 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    position: relative;
    overflow: hidden;
  }

  /* Blob dekorasi */
  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    pointer-events: none;
    opacity: 0.5;
  }
  .blob-1 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, #F5E6C0, transparent);
    top: -100px; left: -100px;
  }
  .blob-2 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, #E8D5A0, transparent);
    bottom: -80px; right: -80px;
  }
  .blob-3 {
    width: 250px; height: 250px;
    background: radial-gradient(circle, #C9A84C20, transparent);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
  }

  .login-card-wrap {
    width: 100%;
    max-width: 440px;
    position: relative;
    z-index: 1;
  }

  .login-card {
    background: #ffffff;
    border-radius: 24px;
    border: 1px solid #E8E0D0;
    box-shadow: 0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
    overflow: hidden;
  }

  /* Header */
  .card-header {
    padding: 28px 28px 20px;
    background: linear-gradient(135deg, #FDF6E4, #FAF0D0);
    border-bottom: 1px solid #EFE4C0;
    text-align: center;
  }
  .brand-link {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    margin-bottom: 10px;
  }
  .brand-logo-img {
    width: 64px;
    height: 64px;
    object-fit: contain;
    mix-blend-mode: multiply;
  }
  .brand-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
  .brand-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.45rem;
    font-weight: 800;
    color: #1A1A1A;
    letter-spacing: -0.3px;
    line-height: 1.1;
  }
  .brand-tagline {
    font-size: 0.68rem;
    font-weight: 700;
    color: #C9A84C;
    text-transform: uppercase;
    letter-spacing: 1.2px;
  }
  .header-desc {
    font-size: 0.84rem;
    color: #7B6A40;
    margin: 0;
  }

  /* Flash */
  .flash-msg {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 16px 24px 0;
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 0.84rem;
    font-weight: 500;
  }
  .flash-msg .material-symbols-rounded { font-size: 18px; }
  .flash-error   { background: #FEF2F2; color: #B91C1C; border: 1px solid #FECACA; }
  .flash-success { background: #F0FDF4; color: #166534; border: 1px solid #BBF7D0; }

  /* Google custom button */
  .google-section {
    padding: 20px 24px 0;
  }



  /* Divider */
  .divider-row {
    display: flex;
    align-items: center;
    margin: 20px 24px 0;
  }

  .divider-line {
    flex: 1;
    height: 1px;
    background: #E8E0D0;
  }

  .divider-text {
    padding: 0 16px;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #B8A882;
    font-weight: 600;
    white-space: nowrap;
  }

  /* Form */
  .login-form {
    padding: 20px 24px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .field-group { display: flex; flex-direction: column; gap: 6px; }
  .field-label {
    font-size: 0.78rem;
    font-weight: 600;
    color: #4A4A4A;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .field-input-wrap { position: relative; }
  .field-ico {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 18px;
    color: #B8A882;
    font-variation-settings: 'FILL' 0;
  }
  .field-input {
    width: 100%;
    padding: 11px 40px 11px 40px;
    border: 1.5px solid #E8E0D0;
    border-radius: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    color: #1A1A1A;
    background: #FAFAFA;
    transition: all 0.2s;
    outline: none;
  }
  .field-input:focus {
    border-color: #C9A84C;
    background: #FFF;
    box-shadow: 0 0 0 3px rgba(201,168,76,0.12);
  }
  .field-input.has-error { border-color: #EF4444; }
  .field-input.font-mono { font-family: monospace; letter-spacing: 2px; font-size: 1rem; }
  .field-err { font-size: 0.78rem; color: #DC2626; }

  .pass-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #B8A882;
    padding: 2px;
  }
  .pass-toggle .material-symbols-rounded { font-size: 18px; }

  /* Captcha */
  .captcha-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .captcha-img {
    height: 52px;
    border-radius: 10px;
    border: 1.5px solid #E8E0D0;
    background: #FAFAFA;
    padding: 4px 8px;
    object-fit: contain;
    flex: 1;
  }
  .captcha-ph {
    height: 52px;
    flex: 1;
    border-radius: 10px;
    background: #F0EDE8;
    animation: pulse 1.5s infinite;
  }
  .captcha-refresh {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    border: 1.5px solid #E8E0D0;
    background: #FAF8F5;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6B6B6B;
    transition: all 0.2s;
  }
  .captcha-refresh:hover { color: #C9A84C; border-color: #C9A84C; background: #FDF6E4; }
  .captcha-refresh:disabled { opacity: 0.5; cursor: not-allowed; }
  .captcha-refresh .material-symbols-rounded { font-size: 18px; }

  /* Submit */
  .btn-submit {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 13px;
    background: linear-gradient(135deg, #C9A84C, #E0B850);
    color: white;
    border: none;
    border-radius: 12px;
    font-family: 'Inter', sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 14px rgba(201,168,76,0.35);
    margin-top: 4px;
  }
  .btn-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(201,168,76,0.45);
  }
  .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
  .btn-submit .material-symbols-rounded { font-size: 20px; }

  /* Footer */
  .login-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-top: 20px;
  }
  .footer-link {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.82rem;
    color: #8B6914;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }
  .footer-link:hover { color: #C9A84C; }
  .footer-sep { color: #B8A882; }

  /* Animations */
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.5; }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
