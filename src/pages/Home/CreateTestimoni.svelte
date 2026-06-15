<script>
    import { Link, navigate } from 'svelte-routing';
    import { onMount } from 'svelte';
    import Layout from '../../components/Layout.svelte';
    import { url } from '../../lib/url.svelte.js';
    import { user } from '../../lib/stores/auth.js';
    import { apiFetch } from '../../lib/api.js';

    let { site_config = {}, google_client_id = '', has_testimonial = false, errors = {} } = $props();

    let auth = $derived({ user: $user });

    let nama = $state('');
    let rating = $state(5);
    let title = $state('');
    let testimonial = $state('');
    let processing = $state(false);
    let recentlySuccessful = $state(false);

    $effect(() => {
        if (auth?.user?.nama && !nama) {
            nama = auth.user.nama;
        }
    });

    onMount(() => {
        if (!auth?.user) {
            // Load Google Identity Services script
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.id = 'google-gsi-client';
            document.body.appendChild(script);

            /** @type {any} */
            (window).handleGoogleLogin = /** @param {any} response */ (response) => {
                apiFetch(url('/auth/google/callback'), {
                    method: 'POST',
                    body: JSON.stringify({ credential: response.credential })
                })
                .then(() => {
                    window.location.reload();
                })
                .catch(/** @param {any} err */ (err) => {
                    console.error('Login Error:', err);
                    alert('Login Google gagal atau terjadi kesalahan jaringan.');
                });
            };

            return () => {
                const el = document.getElementById('google-gsi-client');
                if (el) document.body.removeChild(el);
            };
        }
    });

    /** @param {any} e */
    function handleSubmit(e) {
        e.preventDefault();
        processing = true;

        apiFetch(url('/testimoni'), {
            method: 'POST',
            body: JSON.stringify({
                nama,
                rating,
                title,
                testimonial
            })
        })
        .then(() => {
            recentlySuccessful = true;
        })
        .catch(/** @param {any} errs */ (errs) => {
            errors = errs.errors || errs;
        })
        .finally(() => {
            processing = false;
        });
    }

    /** @param {number} r */
    function getRatingLabel(r) {
        if (r === 5) return 'Luar Biasa!';
        if (r === 4) return 'Sangat Bagus';
        if (r === 3) return 'Cukup';
        if (r === 2) return 'Butuh Perbaikan';
        return 'Kecewa';
    }
</script>



<Layout title="Kirim Testimonial">
    <div style="background: var(--surface-2); padding: 14px 0; border-bottom: 1px solid var(--border)">
        <div class="container" style="font-size: 0.8rem; color: var(--text-3)">
            <Link to={url('/')} style="color: var(--text-3); text-decoration: none;">Beranda</Link>
            <span>›</span>
            <Link to={url('/testimoni')} style="color: var(--text-3); text-decoration: none;">Testimoni</Link>
            <span>›</span>
            <span style="color: var(--text-1)">Tulis Ulasan</span>
        </div>
    </div>

    <div class="create-testi-wrapper">
        <div class="container">
            {#if recentlySuccessful}
                <div class="login-needed-card">
                    <div class="icon-box" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
                        <span class="material-symbols-rounded">check_circle</span>
                    </div>
                    <h2 style="font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 800; color: var(--text-1); margin-bottom: 12px;">Terima Kasih!</h2>
                    <p style="font-size: 0.95rem; color: var(--text-3); margin-bottom: 32px; line-height: 1.6;">
                        Testimoni Anda telah berhasil dikirimkan. Tim kami akan meninjau ulasan Anda sebelum ditampilkan di website Cerdas Living.
                    </p>
                    <Link to={url('/testimoni')} class="btn btn-gold btn-lg" style="min-width: 200px;">
                        Kembali ke Testimonial
                    </Link>
                </div>
            {:else if !auth?.user}
                <!-- Login Shield -->
                <div class="login-needed-card">
                    <div class="icon-box">
                        <span class="material-symbols-rounded">gpp_maybe</span>
                    </div>
                    <h2 style="font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 800; color: var(--text-1); margin-bottom: 12px;">Login Dibutuhkan</h2>
                    <p style="font-size: 0.95rem; color: var(--text-3); margin-bottom: 32px; line-height: 1.6;">
                        Maaf, Anda harus masuk dengan akun Google terlebih dahulu untuk dapat mengirimkan testimonial di Cerdas Living.
                    </p>

                    <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
                        <div 
                            id="g_id_onload"
                            data-client_id={google_client_id}
                            data-context="signin"
                            data-ux_mode="popup"
                            data-callback="handleGoogleLogin"
                            data-auto_prompt="false"
                        ></div>

                        <div 
                            class="g_id_signin"
                            data-type="standard"
                            data-shape="pill"
                            data-theme="outline"
                            data-text="continue_with"
                            data-size="large"
                            data-logo_alignment="left"
                            data-width="320"
                        ></div>

                        <Link to={url('/')} style="font-size: 0.82rem; color: var(--text-3); text-decoration: underline; margin-top: 16px;">
                            Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            {:else}
                <!-- Has testimonial check -->
                {#if has_testimonial}
                    <div class="login-needed-card">
                        <div class="icon-box" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
                            <span class="material-symbols-rounded">verified</span>
                        </div>
                        <h2 style="font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 800; color: var(--text-1); margin-bottom: 12px;">Ulasan Terkirim!</h2>
                        <p style="font-size: 0.95rem; color: var(--text-3); margin-bottom: 32px; line-height: 1.6;">
                            Terima kasih {auth.user.nama}! Anda sudah pernah mengirimkan ulasan untuk Cerdas Living. Setiap akun hanya diperbolehkan mengirim satu ulasan terbaiknya.
                        </p>
                        <Link to={url('/testimoni')} class="btn btn-gold btn-lg" style="min-width: 200px;">
                            Lihat Semua Testimonial
                        </Link>
                    </div>
                {:else}
                    <!-- Create Testimonial Form -->
                    <div class="text-center" style="margin-bottom: 40px;">
                        <h1 style="font-family: 'Playfair Display', serif; font-size: 2.4rem; font-weight: 800; color: var(--text-1); margin-bottom: 8px;">Bagikan Pengalaman Anda</h1>
                        <p style="font-size: 1rem; color: var(--text-3); max-width: 500px; margin: 0 auto;">
                            Bantu pelanggan lain menemukan hunian impian dengan ulasan jujur Anda bersama Cerdas Living.
                        </p>
                    </div>

                    <div class="form-card">
                        <form onsubmit={handleSubmit} style="display: flex; flex-direction: column; gap: 24px;">
                            
                            <!-- User Status Card -->
                            <div style="display: flex; align-items: center; gap: 16px; background: var(--surface-2); padding: 16px 20px; border-radius: var(--radius-lg); border: 1px solid var(--border);">
                                <div style="width: 48px; height: 48px; border-radius: 50%; overflow: hidden; border: 2px solid var(--gold-light); display: flex; align-items: center; justify-content: center; background: var(--surface-1);">
                                    {#if auth.user.foto}
                                        <img src={auth.user.foto} alt={auth.user.nama} style="width: 100%; height: 100%; object-fit: cover;" />
                                    {:else}
                                        <span class="material-symbols-rounded" style="color: var(--gold); font-size: 1.8rem;">person</span>
                                    {/if}
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 2px;">
                                    <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--gold); letter-spacing: 0.5px;">Status Akun</span>
                                    <span style="font-size: 0.88rem; font-weight: 700; color: var(--text-1);">Terverifikasi Google SSO</span>
                                </div>
                            </div>

                            <!-- Form Fields -->
                            <div class="form-group">
                                <label for="nama">Nama yang Ditampilkan</label>
                                <input id="nama" type="text" bind:value={nama} required />
                                {#if errors.nama}
                                    <span style="font-size: 0.78rem; color: var(--coral); font-weight: 600;">{errors.nama}</span>
                                {/if}
                            </div>

                            <!-- Rating Selector -->
                            <div class="rating-selector">
                                <span class="rating-label">Berikan Rating Layanan</span>
                                <div class="rating-stars">
                                    {#each [1, 2, 3, 4, 5] as s}
                                        <button 
                                            type="button" 
                                            class="star-btn {rating >= s ? 'active' : ''}"
                                            onclick={() => rating = s}
                                        >
                                            ★
                                        </button>
                                    {/each}
                                </div>
                                <div class="rating-desc">{getRatingLabel(rating)}</div>
                            </div>

                            <div class="form-group">
                                <label for="title">Judul Ulasan</label>
                                <input id="title" type="text" placeholder="Contoh: Sangat Puas dengan Layanan Agen" bind:value={title} required />
                                {#if errors.title}
                                    <span style="font-size: 0.78rem; color: var(--coral); font-weight: 600;">{errors.title}</span>
                                {/if}
                            </div>

                            <div class="form-group">
                                <label for="testimonial">Detail Ulasan</label>
                                <textarea id="testimonial" rows="5" placeholder="Tuliskan ulasan lengkap Anda di sini mengenai pelayanan, keramahan, dan transparansi tim Cerdas Living..." bind:value={testimonial} required></textarea>
                                {#if errors.testimonial}
                                    <span style="font-size: 0.78rem; color: var(--coral); font-weight: 600;">{errors.testimonial}</span>
                                {/if}
                            </div>

                            <button type="submit" class="btn btn-gold btn-lg btn-full" style="padding: 16px; margin-top: 8px;" disabled={processing}>
                                {#if processing}
                                    <span class="material-symbols-rounded spinning" style="font-size: 1.2rem;">refresh</span>
                                    <span>Sedang Mengirim...</span>
                                {:else}
                                    <span class="material-symbols-rounded" style="font-size: 1.2rem;">send</span>
                                    <span>Kirim Ulasan Saya</span>
                                {/if}
                            </button>
                        </form>
                    </div>

                    <!-- Guidelines -->
                    <div class="guidelines-grid">
                        <div class="guideline-card">
                            <div style="font-size: 1.8rem; margin-bottom: 8px; color: var(--gold);">✨</div>
                            <h4>Jujur & Relevan</h4>
                            <p>Tuliskan ulasan berdasarkan pengalaman nyata Anda dengan transaksi properti kami.</p>
                        </div>
                        <div class="guideline-card">
                            <div style="font-size: 1.8rem; margin-bottom: 8px; color: var(--gold);">💬</div>
                            <h4>Sopan & Jelas</h4>
                            <p>Gunakan bahasa Indonesia yang baik dan sopan serta hindari kata-kata bernada SARA.</p>
                        </div>
                        <div class="guideline-card">
                            <div style="font-size: 1.8rem; margin-bottom: 8px; color: var(--gold);">🛡️</div>
                            <h4>Privasi Terjaga</h4>
                            <p>Sistem kami menjaga data pribadi Anda tetap aman dan hanya menampilkan ulasan yang disetujui.</p>
                        </div>
                    </div>
                {/if}
            {/if}
        </div>
    </div>
</Layout>

<style>
    .create-testi-wrapper {
        background: var(--surface-1);
        min-height: calc(100vh - 120px);
        padding: 56px 0 80px;
    }
    .form-card {
        background: var(--white);
        border: 1px solid var(--border);
        border-radius: var(--radius-xl);
        padding: 40px;
        box-shadow: var(--shadow-sm);
        max-width: 680px;
        margin: 0 auto;
    }
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .form-group label {
        font-size: 0.88rem;
        font-weight: 700;
        color: var(--text-1);
    }
    .form-group input, .form-group textarea {
        background: var(--surface-2);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 12px 16px;
        color: var(--text-1);
        font-size: 0.9rem;
        outline: none;
        transition: all 0.2s;
    }
    .form-group input:focus, .form-group textarea:focus {
        border-color: var(--gold);
        box-shadow: 0 0 0 3px var(--gold-light);
    }
    .rating-selector {
        background: var(--surface-2);
        padding: 24px;
        border-radius: var(--radius-lg);
        border: 1px solid var(--border);
        text-align: center;
    }
    .rating-selector .rating-label {
        display: block;
        font-size: 0.82rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-3);
        margin-bottom: 12px;
    }
    .rating-stars {
        display: flex;
        justify-content: center;
        gap: 8px;
    }
    .star-btn {
        background: transparent;
        border: none;
        font-size: 2.5rem;
        cursor: pointer;
        color: var(--border);
        transition: all 0.2s;
        padding: 0;
        line-height: 1;
    }
    .star-btn:hover {
        transform: scale(1.1);
    }
    .star-btn.active {
        color: #f59e0b;
    }
    .rating-desc {
        margin-top: 12px;
        font-size: 0.85rem;
        font-weight: 800;
        color: var(--gold);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .login-needed-card {
        text-align: center;
        background: var(--white);
        border: 1px solid var(--border);
        border-radius: var(--radius-xl);
        padding: 60px 40px;
        max-width: 500px;
        margin: 60px auto;
        box-shadow: var(--shadow-sm);
    }
    .icon-box {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: var(--gold-light);
        color: var(--gold);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
    }
    .icon-box span {
        font-size: 2rem;
    }
    .guidelines-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        max-width: 680px;
        margin: 40px auto 0;
    }
    .guideline-card {
        background: var(--white);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: 20px;
        text-align: center;
    }
    .guideline-card h4 {
        font-size: 0.88rem;
        font-weight: 700;
        color: var(--text-1);
        margin-bottom: 6px;
    }
    .guideline-card p {
        font-size: 0.75rem;
        color: var(--text-3);
        line-height: 1.5;
    }
    .spinning {
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    @media (max-width: 680px) {
        .guidelines-grid {
            grid-template-columns: 1fr;
        }
        .form-card {
            padding: 24px;
        }
    }
</style>
