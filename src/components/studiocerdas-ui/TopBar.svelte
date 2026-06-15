<script>
    import { editor } from './stores.svelte.js';
</script>

<div id="kalepa-topbar-wrap">
    <div class="kalepa-topbar">
        <div class="kb-brand">
            <div class="kb-logo">
                <span style="font-weight:700; color:#fff;">S</span>
            </div>
            <div class="kb-brand-text">
                <div class="kb-brand-title">studiocerdas UI</div>
                <div class="kb-brand-sub">Studio Design Room</div>
            </div>
        </div>

        <div class="kb-sep"></div>

        <div class="kb-stage-toggles">
            <button class="kb-stage-btn active">
                <span class="material-symbols-rounded">architecture</span>
                Architecture
            </button>
            <button class="kb-stage-btn">
                <span class="material-symbols-rounded">electrical_services</span>
                MEP
            </button>
            <button class="kb-stage-btn">
                <span class="material-symbols-rounded">edit_document</span>
                Annotate
            </button>
            <button class="kb-stage-btn">
                <span class="material-symbols-rounded">ios_share</span>
                Export
            </button>
        </div>

        <div class="kb-top-right">
            <button class="kb-back-btn">
                <i class="fas fa-arrow-left"></i>
                Back to Kalepa
            </button>
            <button class="kb-back-btn" style="background: rgba(255,255,255,0.1); color: #fff; border-color: rgba(255,255,255,0.2);">
                <i class="fas fa-folder-open"></i>
                Buka Project
            </button>
            <button class="kb-tool-btn" title="Undo"><i class="fas fa-undo"></i></button>
            <button class="kb-tool-btn" title="Redo"><i class="fas fa-redo"></i></button>
            <button class="kb-save-btn">
                <i class="fas fa-save"></i>
                Simpan Project
            </button>
        </div>
    </div>
</div>

<style>
    .kalepa-topbar {
        height: var(--kalepa-topbar-h);
        background: var(--bg-topbar);
        border-bottom: 1px solid var(--border-tb);
        display: flex;
        align-items: center;
        padding: 0 16px;
        gap: 16px;
    }
    
    .kb-brand { display: flex; align-items: center; gap: 10px; min-width: 160px; }
    .kb-logo {
        width: 28px; height: 28px; border-radius: 6px;
        background: linear-gradient(135deg, var(--accent), var(--accent-hover));
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 2px 8px rgba(124,58,237,0.4);
    }
    .kb-brand-text { display: flex; flex-direction: column; }
    .kb-brand-title { font-size: 13px; font-weight: 700; color: var(--text-tb); line-height: 1.1; }
    .kb-brand-sub { font-size: 9.5px; color: var(--text-muted-tb); }

    .kb-sep { width: 1px; height: 24px; background: var(--border-tb); }

    .kb-stage-toggles { display: flex; gap: 4px; flex: 1; }
    .kb-stage-btn {
        display: flex; align-items: center; gap: 6px; padding: 6px 12px;
        background: transparent; border: none; border-radius: 6px;
        color: var(--text-muted-tb); font-size: 12px; font-weight: 600;
        cursor: pointer; transition: all 0.2s;
    }
    .kb-stage-btn span { font-size: 16px; }
    .kb-stage-btn:hover { background: rgba(255,255,255,0.05); color: var(--text-tb); }
    .kb-stage-btn.active { color: #fff; text-shadow: 0 0 10px rgba(255,255,255,0.3); }

    .kb-top-right { display: flex; align-items: center; gap: 8px; margin-left: auto; }
    .kb-back-btn {
        display: flex; align-items: center; gap: 6px; padding: 6px 12px; font-size: 11px; font-weight: 600;
        color: var(--text-muted-tb); background: transparent; border: 1px solid var(--border-tb);
        border-radius: 6px; cursor: pointer; transition: 0.2s;
    }
    .kb-back-btn:hover { background: rgba(255,255,255,0.05); color: var(--text-tb); }
    
    .kb-tool-btn {
        width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
        background: transparent; border: 1px solid transparent; border-radius: 5px; color: var(--text-muted-tb);
        cursor: pointer; font-size: 12px; transition: all 0.13s;
    }
    .kb-tool-btn:hover { background: rgba(255,255,255,0.09); color: var(--text-tb); }

    .kb-save-btn {
        display: flex; align-items: center; gap: 6px; padding: 6px 14px; border: none; border-radius: 6px;
        background: var(--accent); color: #fff; font-size: 12px; font-weight: 600; cursor: pointer;
        box-shadow: 0 2px 8px rgba(124,58,237,0.3); transition: 0.2s;
    }
    .kb-save-btn:hover { background: var(--accent-hover); }

    /* Light Mode */
    :global([data-theme="light"]) .kalepa-topbar { background: var(--bg-topbar-light); border-bottom-color: var(--border-tb-light); }
    :global([data-theme="light"]) .kb-brand-title { color: var(--text-tb-light); }
    :global([data-theme="light"]) .kb-stage-btn { color: var(--text-muted-tb-light); }
    :global([data-theme="light"]) .kb-stage-btn.active { color: var(--accent); text-shadow: none; }
    :global([data-theme="light"]) .kb-back-btn { color: var(--text-muted-tb-light); border-color: var(--border-tb-light); }
    :global([data-theme="light"]) .kb-back-btn:hover { color: var(--accent); background: rgba(124,58,237,0.05); }
    :global([data-theme="light"]) .kb-tool-btn { color: var(--text-muted-tb-light); }
    :global([data-theme="light"]) .kb-tool-btn:hover { color: var(--accent); background: rgba(124,58,237,0.05); }
    :global([data-theme="light"]) .kb-sep { background: var(--border-tb-light); }
</style>
