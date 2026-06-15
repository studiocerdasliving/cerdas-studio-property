<script>
    import { editor } from './stores.svelte.js';
    
    let isDimOpen = $state(true);
    let isPropOpen = $state(true);
</script>

<div class="sidebar-wrapper right">
    <!-- Room Dimension Panel -->
    <aside class="kalepa-panel" style="margin-bottom: 12px;">
        <div class="panel-header" role="button" tabindex="0" onclick={() => isDimOpen = !isDimOpen} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') isDimOpen = !isDimOpen }}>
            <div class="header-title">
                <i class="fas fa-ruler-combined"></i>
                ROOM DIMENSION
            </div>
            <i class="fas fa-chevron-up chevron" style="transform: rotate({isDimOpen ? '0deg' : '180deg'})"></i>
        </div>

        {#if isDimOpen}
            <div class="panel-content">
                <div class="prop-group">
                    <div class="prop-label">LEBAR (W) — {editor.roomWidth}M</div>
                    <input type="range" bind:value={editor.roomWidth} min="2" max="20" step="0.5">
                </div>
                <div class="prop-group">
                    <div class="prop-label">PANJANG (L) — {editor.roomLength}M</div>
                    <input type="range" bind:value={editor.roomLength} min="2" max="20" step="0.5">
                </div>
                <div class="prop-group">
                    <div class="prop-label">TINGGI (H) — {editor.roomHeight}M</div>
                    <input type="range" bind:value={editor.roomHeight} min="2" max="5" step="0.1">
                </div>
            </div>
        {/if}
    </aside>

    <!-- Object Properties Panel -->
    <aside class="kalepa-panel">
        <div class="panel-header" role="button" tabindex="0" onclick={() => isPropOpen = !isPropOpen} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') isPropOpen = !isPropOpen }}>
            <div class="header-title">
                <i class="fas fa-sliders-h"></i>
                OBJECT PROPERTIES
            </div>
            <i class="fas fa-chevron-up chevron" style="transform: rotate({isPropOpen ? '0deg' : '180deg'})"></i>
        </div>

        {#if isPropOpen}
            <div class="panel-content">
                <div class="prop-group">
                    <div class="prop-label">Position (X, Y, Z)</div>
                    <div class="prop-row">
                        <input type="number" step="0.1" value="0.0">
                        <input type="number" step="0.1" value="0.0">
                        <input type="number" step="0.1" value="0.0">
                    </div>
                </div>
                <div class="prop-group">
                    <div class="prop-label">Rotation (X, Y, Z)</div>
                    <div class="prop-row">
                        <input type="number" step="15" value="0">
                        <input type="number" step="15" value="0">
                        <input type="number" step="15" value="0">
                    </div>
                </div>
                <div class="prop-group">
                    <div class="prop-label">Material Color</div>
                    <input type="color" value="#7c3aed" style="width: 100%; height: 32px; border: none; padding: 0; background: none; cursor: pointer;">
                </div>

                <div style="margin-top: 16px; display: flex; gap: 8px;">
                    <button class="action-btn" style="flex: 1;"><i class="fas fa-copy"></i> Clone</button>
                    <button class="action-btn danger" style="flex: 1;"><i class="fas fa-trash"></i> Delete</button>
                </div>
            </div>
        {/if}
    </aside>
</div>

<style>
    .sidebar-wrapper {
        position: absolute;
        top: 16px;
        bottom: 16px;
        width: 280px;
        z-index: 10;
        pointer-events: none;
    }
    
    .sidebar-wrapper > * { pointer-events: auto; }
    .sidebar-wrapper.right { right: 16px; }
    
    .kalepa-panel {
        background: var(--bg-panel);
        border: 1px solid var(--border-tb);
        border-radius: 8px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }

    .panel-header {
        padding: 12px 16px;
        background: rgba(255,255,255,0.02);
        border-bottom: 1px solid var(--border-tb);
        display: flex; justify-content: space-between; align-items: center;
        cursor: pointer; user-select: none;
    }
    .header-title {
        font-size: 11px; font-weight: 700; color: var(--text-muted-tb);
        letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;
    }
    .panel-content { padding: 16px; }

    .prop-group { margin-bottom: 16px; }
    .prop-label { display: block; font-size: 11px; font-weight: 600; color: var(--text-muted-tb); margin-bottom: 8px; text-transform: uppercase; }
    
    .prop-group input[type="range"] {
        width: 100%; accent-color: var(--accent);
    }
    
    .prop-row { display: flex; gap: 4px; }
    .prop-row input {
        width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--border-tb);
        color: var(--text-tb); padding: 6px; border-radius: 4px; font-size: 11px; text-align: center;
    }
    
    .action-btn {
        background: rgba(255,255,255,0.05); border: 1px solid var(--border-tb);
        color: var(--text-tb); padding: 8px; border-radius: 6px; font-size: 11px;
        font-weight: 600; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px;
    }
    .action-btn:hover { background: rgba(255,255,255,0.1); }
    .action-btn.danger { color: #f87171; border-color: rgba(248,113,113,0.2); }
    .action-btn.danger:hover { background: rgba(248,113,113,0.1); }

    .chevron { transition: transform 0.2s; color: var(--text-muted-tb); }

    /* Light Mode */
    :global([data-theme="light"]) .kalepa-panel { background: var(--bg-panel-light); border-color: var(--border-tb-light); box-shadow: 0 4px 20px rgba(124,58,237,0.08); }
    :global([data-theme="light"]) .panel-header { background: rgba(124,58,237,0.02); border-bottom-color: var(--border-tb-light); }
    :global([data-theme="light"]) .header-title { color: var(--text-muted-tb-light); }
    :global([data-theme="light"]) .prop-label { color: var(--text-muted-tb-light); }
    :global([data-theme="light"]) .prop-row input { background: #fff; border-color: var(--border-tb-light); color: var(--text-tb-light); }
    :global([data-theme="light"]) .action-btn { background: #fff; border-color: var(--border-tb-light); color: var(--text-tb-light); }
    :global([data-theme="light"]) .action-btn:hover { background: rgba(124,58,237,0.05); border-color: var(--accent); }
</style>
