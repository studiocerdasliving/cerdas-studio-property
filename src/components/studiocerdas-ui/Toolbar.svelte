<script>
    import { editor } from './stores.svelte.js';

    function toggleGrid() { editor.showGrid = !editor.showGrid; }
    function toggleTheme() { editor.isDarkTheme = !editor.isDarkTheme; }
    function setMode(mode) { editor.mode = mode; }
    function setTool(tool) { editor.tool = tool; }
</script>

<div class="kalepa-toolbar" role="toolbar">
    <!-- Build -->
    <div class="kb-tool-group-wrap">
        <span class="kb-tool-group-label">Build</span>
        <div class="kb-tool-group-row">
            <button class="kb-tool-btn" title="Build Room"><i class="fas fa-square"></i></button>
            <button class="kb-tool-btn" title="Build Wall"><i class="fas fa-layer-group"></i></button>
            <button class="kb-tool-btn" title="Add Door"><i class="fas fa-door-open"></i></button>
            <button class="kb-tool-btn" title="Add Window"><i class="fas fa-window-maximize"></i></button>
        </div>
    </div>

    <!-- Eraser -->
    <div class="kb-tool-group-wrap">
        <span class="kb-tool-group-label">Eraser</span>
        <div class="kb-tool-group-row">
            <button class="kb-tool-btn" title="Eraser Tool"><i class="fas fa-eraser"></i></button>
            <button class="kb-tool-btn" title="Box Eraser"><i class="fas fa-object-group"></i></button>
        </div>
    </div>

    <!-- Transform -->
    <div class="kb-tool-group-wrap">
        <span class="kb-tool-group-label">Transform</span>
        <div class="kb-tool-group-row">
            <button class="kb-tool-btn" class:active={editor.mode === 'position'} onclick={() => setMode('position')} title="Move"><i class="fas fa-arrows-alt"></i></button>
            <button class="kb-tool-btn" class:active={editor.mode === 'rotation'} onclick={() => setMode('rotation')} title="Rotate"><i class="fas fa-sync-alt"></i></button>
            <button class="kb-tool-btn" class:active={editor.mode === 'scale'} onclick={() => setMode('scale')} title="Scale"><i class="fas fa-expand-arrows-alt"></i></button>
        </div>
    </div>

    <!-- Navigate -->
    <div class="kb-tool-group-wrap">
        <span class="kb-tool-group-label">Navigate</span>
        <div class="kb-tool-group-row">
            <button class="kb-tool-btn" class:active={editor.tool === 'select'} onclick={() => setTool('select')} title="Select"><i class="fas fa-mouse-pointer"></i></button>
            <button class="kb-tool-btn" class:active={editor.tool === 'pan'} onclick={() => setTool('pan')} title="Pan"><i class="fas fa-hand-paper"></i></button>
        </div>
    </div>

    <!-- Views -->
    <div class="kb-tool-group-wrap">
        <span class="kb-tool-group-label">Views</span>
        <div class="kb-tool-group-row">
            <button class="kb-tool-btn" class:active={editor.showGrid} onclick={toggleGrid} title="Toggle Grid"><i class="fas fa-border-all"></i></button>
            <button class="kb-tool-btn" title="View 2D"><i class="fas fa-map"></i></button>
            <button class="kb-tool-btn" title="View 3D"><i class="fas fa-cube"></i></button>
        </div>
    </div>

    <!-- Zoom -->
    <div class="kb-tool-group-wrap">
        <span class="kb-tool-group-label">Zoom</span>
        <div class="kb-tool-group-row" style="align-items:center; gap:4px;">
            <button class="kb-tool-btn" title="Zoom Out"><i class="fa-solid fa-magnifying-glass-minus"></i></button>
            <span style="font-size:11px; font-weight:600; color:var(--text-tb); width:36px; text-align:center;">100%</span>
            <button class="kb-tool-btn" title="Zoom In"><i class="fa-solid fa-magnifying-glass-plus"></i></button>
        </div>
    </div>

    <!-- Tema -->
    <div class="kb-tool-group-wrap kb-no-border">
        <span class="kb-tool-group-label">Tema</span>
        <div class="kb-tool-group-row">
            <button class="kb-theme-btn" class:dark-mode={editor.isDarkTheme} onclick={toggleTheme}>
                <i class="fas {editor.isDarkTheme ? 'fa-moon' : 'fa-sun'}"></i>
                <span>{editor.isDarkTheme ? 'Dark' : 'Light'}</span>
            </button>
        </div>
    </div>

    <div style="flex:1;"></div>

    <!-- Next Stage -->
    <div class="kb-tool-group-wrap kb-no-border" style="border-left: 1px solid var(--border-tb); padding-left: 12px;">
        <span class="kb-tool-group-label">Tahap</span>
        <div class="kb-tool-group-row">
            <button class="btn-next">Next &nbsp;<i class="fas fa-arrow-right"></i></button>
        </div>
    </div>
</div>

<style>
    .kalepa-toolbar {
        height: var(--kalepa-toolbar-h);
        background: var(--bg-toolbar);
        border-bottom: 1px solid var(--border-tb);
        display: flex;
        align-items: center;
        padding: 0 6px;
        gap: 0;
        overflow: hidden;
    }
    .kb-tool-group-wrap {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        border-right: 1px solid var(--border-tb); padding: 4px 8px; height: 100%; gap: 3px; flex-shrink: 0;
    }
    .kb-no-border { border-right: none; }
    .kb-tool-group-label { font-size: 8.5px; font-weight: 700; color: var(--text-muted-tb); text-transform: uppercase; }
    .kb-tool-group-row { display: flex; gap: 2px; }
    .kb-tool-btn {
        width: 30px; height: 26px; display: flex; align-items: center; justify-content: center;
        background: transparent; border: 1px solid transparent; border-radius: 5px; color: var(--text-muted-tb);
        cursor: pointer; font-size: 12px; transition: all 0.13s;
    }
    .kb-tool-btn:hover { background: rgba(255,255,255,0.09); color: var(--text-tb); }
    .kb-tool-btn.active { background: var(--accent); color: #fff; box-shadow: 0 1px 6px rgba(124,58,237,0.35); }
    
    .kb-theme-btn {
        display: flex; align-items: center; gap: 5px; padding: 5px 11px; font-size: 11px; font-weight: 600;
        color: var(--text-muted-tb); background: transparent; border: 1px solid var(--border-tb); border-radius: 6px;
        cursor: pointer;
    }
    .kb-theme-btn.dark-mode { color: var(--gold-kb); border-color: rgba(201,168,76,0.25); background: var(--gold-dim); }
    .btn-next {
        display: flex; align-items: center; gap: 6px; padding: 6px 14px; border: none; border-radius: 8px;
        background: linear-gradient(135deg, #4c240c, #2b1203); color: #fef3c7; font-size: 12px; font-weight: 700; cursor: pointer;
    }

    /* Light Mode */
    :global([data-theme="light"]) .kalepa-toolbar { background: var(--bg-toolbar-light); border-bottom-color: var(--border-tb-light); }
    :global([data-theme="light"]) .kb-tool-group-wrap { border-right-color: var(--border-tb-light); }
    :global([data-theme="light"]) .kb-tool-group-label { color: var(--text-muted-tb-light); }
    :global([data-theme="light"]) .kb-tool-btn { color: var(--text-muted-tb-light); }
    :global([data-theme="light"]) .kb-tool-btn:hover { background: rgba(124,58,237,0.05); color: var(--accent); }
    :global([data-theme="light"]) .kb-theme-btn { color: var(--text-muted-tb-light); border-color: var(--border-tb-light); }
    :global([data-theme="light"]) .kb-tool-group-wrap[style] { border-left-color: var(--border-tb-light) !important; }
</style>
