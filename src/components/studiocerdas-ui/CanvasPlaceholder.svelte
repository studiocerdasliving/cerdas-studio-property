<script>
    // Hanya placeholder kosong yang cantik
</script>

<div class="canvas-bg">
    <div class="grid-placeholder"></div>
    <div class="canvas-text">
        <i class="fas fa-cube" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
        <h2>3D Canvas Area</h2>
        <p>This is where the 3D Engine will render the scene.</p>
    </div>
</div>

<style>
    .canvas-bg {
        width: 100%;
        height: 100%;
        position: relative;
        background: radial-gradient(circle at center, #1a1a24 0%, #0a0a14 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    
    .grid-placeholder {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background-size: 50px 50px;
        background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        z-index: 1;
    }

    .canvas-text {
        z-index: 2;
        text-align: center;
        color: var(--text-muted-tb);
    }
    
    .canvas-text h2 {
        font-size: 24px;
        font-weight: 700;
        color: var(--text-tb);
        margin-bottom: 8px;
    }

    .canvas-text p {
        font-size: 14px;
    }

    /* Light Mode */
    :global([data-theme="light"]) .canvas-bg {
        background: radial-gradient(circle at center, #ffffff 0%, #f0eeff 100%);
    }
    :global([data-theme="light"]) .grid-placeholder {
        background-image: 
            linear-gradient(to right, rgba(124, 58, 237, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(124, 58, 237, 0.05) 1px, transparent 1px);
    }
    :global([data-theme="light"]) .canvas-text { color: var(--text-muted-tb-light); }
    :global([data-theme="light"]) .canvas-text h2 { color: var(--text-tb-light); }
</style>
