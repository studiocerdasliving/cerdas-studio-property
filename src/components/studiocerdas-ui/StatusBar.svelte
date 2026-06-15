<script>
    import { status } from './stores.svelte.js';
</script>

<footer id="statusbar">
    <div class="status-left">
        <span class="material-symbols-rounded">info</span>
        <span id="status-text">{status.message}</span>
        <span class="status-divider">|</span>
        <a href="http://localhost/studiocerdas/public" class="k-link-muted" title="Kembali">← studiocerdas Studio</a>
    </div>
    <div class="status-center">
        <span id="object-count">Objects: {status.objectCount}</span>
    </div>
    <div class="status-right">
        <span id="cursor-pos">Cursor: 0.0, 0.0, 0.0</span>
        <span class="status-divider">|</span>
        <span id="fps-counter">FPS: {status.fps}</span>
    </div>
</footer>

<style>
    #statusbar {
        height: 24px;
        background: var(--bg-topbar);
        border-top: 1px solid var(--border-tb);
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 12px;
        font-size: 10px;
        color: var(--text-muted-tb);
        flex-shrink: 0;
        z-index: 100;
    }
    
    .status-left, .status-right, .status-center {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .status-left .material-symbols-rounded { font-size: 14px; }
    .status-divider { color: var(--border-tb); }
    .k-link-muted { color: var(--text-muted-tb); text-decoration: none; transition: 0.2s; }
    .k-link-muted:hover { color: var(--accent); }

    /* Light Mode */
    :global([data-theme="light"]) #statusbar {
        background: var(--bg-topbar-light);
        border-top-color: var(--border-tb-light);
        color: var(--text-muted-tb-light);
    }
    :global([data-theme="light"]) .status-divider { color: var(--border-tb-light); }
    :global([data-theme="light"]) .k-link-muted { color: var(--text-muted-tb-light); }
    :global([data-theme="light"]) .k-link-muted:hover { color: var(--accent); }
</style>
