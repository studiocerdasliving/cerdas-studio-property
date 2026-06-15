<script>
    import { editor } from './stores.svelte.js';
    let isOpen = $state(true);

    const catalogItems = [
        { id: 'sofa', name: 'Sofa', icon: '🛋️' },
        { id: 'armchair', name: 'Armchair', icon: '🪑' },
        { id: 'double-bed', name: 'Double Bed', icon: '🛌' },
        { id: 'dining-table', name: 'Dining Table', icon: '🪵' },
        { id: 'dining-chair', name: 'Dining Chair', icon: '🪑' },
        { id: 'wardrobe', name: 'Wardrobe', icon: '🪚' },
        { id: 'floor-lamp', name: 'Floor Lamp', icon: '💡' }
    ];
</script>

<div class="sidebar-wrapper left" class:closed={!isOpen}>
    <aside class="kalepa-panel">
        <div class="panel-header" role="button" tabindex="0" onclick={() => isOpen = !isOpen} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') isOpen = !isOpen }}>
            <div class="header-title">
                <i class="fas fa-shapes"></i>
                FURNITURE CATALOG
            </div>
            <i class="fas fa-chevron-up chevron" style="transform: rotate({isOpen ? '0deg' : '180deg'})"></i>
        </div>

        {#if isOpen}
            <div class="panel-content">
                <div class="catalog-grid">
                    {#each catalogItems as item}
                        <div class="catalog-item">
                            <div class="item-preview">{item.icon}</div>
                            <div class="item-name">{item.name}</div>
                        </div>
                    {/each}
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
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: none; /* Let clicks pass through empty space */
    }
    
    .sidebar-wrapper > * { pointer-events: auto; } /* Re-enable clicks on panel */

    .sidebar-wrapper.left { left: 16px; }
    
    .kalepa-panel {
        background: var(--bg-panel);
        border: 1px solid var(--border-tb);
        border-radius: 8px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        max-height: 100%;
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
    .panel-content { padding: 12px; overflow-y: auto; }

    .catalog-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
    }

    .catalog-item {
        background: rgba(255,255,255,0.03);
        border: 1px solid var(--border-tb);
        border-radius: 8px;
        padding: 16px 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        cursor: grab;
        transition: all 0.2s;
    }

    .catalog-item:hover {
        background: rgba(255,255,255,0.08);
        border-color: rgba(255,255,255,0.2);
        transform: translateY(-2px);
    }

    .item-preview {
        font-size: 32px;
        height: 40px;
        display: flex; align-items: center; justify-content: center;
    }

    .item-name {
        font-size: 11px; font-weight: 600; text-align: center; color: var(--text-tb);
    }

    .chevron { transition: transform 0.2s; color: var(--text-muted-tb); }

    /* Light Mode */
    :global([data-theme="light"]) .kalepa-panel { background: var(--bg-panel-light); border-color: var(--border-tb-light); box-shadow: 0 4px 20px rgba(124,58,237,0.08); }
    :global([data-theme="light"]) .panel-header { background: rgba(124,58,237,0.02); border-bottom-color: var(--border-tb-light); }
    :global([data-theme="light"]) .header-title { color: var(--text-muted-tb-light); }
    :global([data-theme="light"]) .catalog-item { background: #fff; border-color: var(--border-tb-light); }
    :global([data-theme="light"]) .catalog-item:hover { background: rgba(124,58,237,0.04); border-color: var(--accent); }
    :global([data-theme="light"]) .item-name { color: var(--text-tb-light); }
</style>
