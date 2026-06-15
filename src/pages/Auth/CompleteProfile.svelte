<script>
    import { onMount } from 'svelte';
    import { navigate } from 'svelte-routing';
    import { url } from '../../lib/url.svelte.js';
    import { apiFetch } from '../../lib/api.js';

    let { user = {}, errors = {} } = $props();

    // svelte-ignore state_referenced_locally
    let nama = $state(user.nama || '');
    let telepon = $state('');
    let whatsapp = $state('');
    let processing = $state(false);

    /** @param {Event} e */
    function handleSubmit(e) {
        e.preventDefault();
        processing = true;
        apiFetch('/complete-profile', {
            method: 'POST',
            body: JSON.stringify({ nama, telepon, whatsapp })
        }).then(res => {
            navigate('/agent/dashboard');
        }).catch(errs => {
            errors = errs;
        }).finally(() => {
            processing = false;
        });
    }
</script>

<svelte:head>
    <title>Lengkapi Profil — Cerdas Living</title>
</svelte:head>

<div class="complete-wrapper">
    <div class="complete-decor">
        <div class="decor-circle"></div>
    </div>

    <div class="complete-container">
        <div class="complete-header">
            <div class="logo-box">CL</div>
            <h2>Lengkapi Profil Anda</h2>
            <p>Silakan lengkapi nomor telepon dan WhatsApp untuk mulai memasang iklan.</p>
        </div>

        <form onsubmit={handleSubmit} class="complete-form">
            <div class="form-group">
                <label for="nama">Nama Lengkap</label>
                <input 
                    id="nama" 
                    type="text" 
                    bind:value={nama} 
                    required 
                />
                {#if errors.nama}
                    <span class="error-msg">{errors.nama}</span>
                {/if}
            </div>

            <div class="form-group">
                <label for="telepon">Nomor Telepon</label>
                <input 
                    id="telepon" 
                    type="text" 
                    placeholder="Cth: 081234567890" 
                    bind:value={telepon} 
                    required 
                />
                {#if errors.telepon}
                    <span class="error-msg">{errors.telepon}</span>
                {/if}
            </div>

            <div class="form-group">
                <label for="whatsapp">Nomor WhatsApp</label>
                <input 
                    id="whatsapp" 
                    type="text" 
                    placeholder="Cth: 081234567890" 
                    bind:value={whatsapp} 
                    required 
                />
                {#if errors.whatsapp}
                    <span class="error-msg">{errors.whatsapp}</span>
                {/if}
            </div>

            <button type="submit" class="btn btn-gold btn-full btn-submit" disabled={processing}>
                {#if processing}
                    <span class="material-symbols-rounded spinning">refresh</span>
                    <span>Menyimpan Profil...</span>
                {:else}
                    <span>Simpan & Selesai</span>
                {/if}
            </button>
        </form>
    </div>
</div>

<style>
    .complete-wrapper {
        min-height: 100vh;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        position: relative;
        overflow: hidden;
        color: #f1f5f9;
        font-family: 'Inter', sans-serif;
    }

    .complete-decor {
        position: absolute;
        inset: 0;
        pointer-events: none;
    }

    .decor-circle {
        position: absolute;
        width: 450px;
        height: 450px;
        border-radius: 50%;
        filter: blur(90px);
        opacity: 0.15;
        background: #c9a84c;
        top: -150px;
        left: -150px;
    }

    .complete-container {
        width: 100%;
        max-width: 440px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 24px;
        backdrop-filter: blur(20px);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
        padding: 40px;
        position: relative;
        z-index: 10;
        animation: fadeInUp 0.5s ease-out;
    }

    .complete-header {
        text-align: center;
        margin-bottom: 28px;
    }

    .logo-box {
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #c9a84c, #b8943d);
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #1e293b;
        font-family: 'Playfair Display', serif;
        font-size: 1.3rem;
        font-weight: 800;
        margin: 0 auto 16px;
        box-shadow: 0 6px 12px rgba(201, 168, 76, 0.2);
    }

    .complete-header h2 {
        font-size: 1.5rem;
        font-weight: 800;
        margin-bottom: 6px;
    }

    .complete-header p {
        color: #94a3b8;
        font-size: 0.85rem;
        line-height: 1.5;
    }

    .complete-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .form-group label {
        font-size: 0.8rem;
        font-weight: 600;
        color: #cbd5e1;
    }

    .form-group input {
        width: 100%;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 11px 16px;
        color: #f8fafc;
        font-size: 0.9rem;
        outline: none;
        transition: all 0.2s;
    }

    .form-group input:focus {
        border-color: #c9a84c;
        background: rgba(255, 255, 255, 0.05);
        box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.15);
    }

    .error-msg {
        font-size: 0.78rem;
        color: #f87171;
        font-weight: 500;
        margin-top: 2px;
    }

    .btn-submit {
        height: 48px;
        margin-top: 8px;
    }

    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
</style>
