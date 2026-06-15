<script>
    import { onMount } from 'svelte';
    
    // URL ke React app Studio Design Tactical
    let designUrl = import.meta.env.VITE_STUDIODESIGN_URL || "http://cerdas-studio-design.music";

    onMount(() => {
        // Ambil query parameter jika ada (misal: ?project=1)
        const queryString = window.location.search;
        
        // Alihkan langsung ke React App
        window.location.href = designUrl + queryString;
    });
</script>

<svelte:head>
    <title>Membuka Studio Design...</title>
</svelte:head>

<div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; background-color:#121212; color:#ffffff; font-family: 'Inter', sans-serif;">
    <i class="fa-solid fa-spinner fa-spin" style="font-size: 48px; color: #7c3aed; margin-bottom: 24px;"></i>
    <h2>Membuka Editor 3D...</h2>
    <p style="color: #a0a0a0;">Anda sedang dialihkan ke Cerdas Studio Design.</p>
</div>
