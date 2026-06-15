<script>
  import { onMount } from 'svelte';

  // ─── Sidebar collapse state ───────────────────────────────────────────────
  let leftCollapsed  = $state(false);
  let rightCollapsed = $state(false);

  onMount(() => {
    // ─── 1. Panel Accordion Toggle (data-toggle) ─────────────────────────────
    function collapsePanel(contentId) {
      const header = document.querySelector(`[data-toggle="${contentId}"]`);
      if (!header) return;
      const content = document.getElementById(contentId);
      header.classList.add('collapsed');
      if (content) {
        content.style.maxHeight = '0';
        content.style.opacity = '0';
        content.style.paddingTop = '0';
        content.style.paddingBottom = '0';
      }
    }

    function expandPanel(contentId) {
      const header = document.querySelector(`[data-toggle="${contentId}"]`);
      if (!header) return;
      const content = document.getElementById(contentId);
      header.classList.remove('collapsed');
      if (content) {
        content.style.maxHeight = '1200px';
        content.style.opacity = '1';
        content.style.paddingTop = '';
        content.style.paddingBottom = '';
      }
    }

    document.querySelectorAll('[data-toggle]').forEach(header => {
      const contentId = header.getAttribute('data-toggle');
      header.addEventListener('click', () => {
        if (header.classList.contains('collapsed')) {
          expandPanel(contentId);
        } else {
          collapsePanel(contentId);
        }
      });
    });

    // ─── 2. Mobile Bottom Nav ─────────────────────────────────────────────────
    const isMobile = () => window.innerWidth <= 899;

    const backdrop = document.getElementById('sidebar-backdrop');
    const sidebarLeft  = document.getElementById('sidebar-left');
    const sidebarRight = document.getElementById('sidebar-right');

    function closeMobileAll() {
      if (sidebarLeft)  sidebarLeft.classList.remove('sidebar-open');
      if (sidebarRight) sidebarRight.classList.remove('sidebar-open');
      if (backdrop) backdrop.classList.remove('active');
    }
    function setMobActive(id) {
      document.querySelectorAll('.mob-nav-btn').forEach(b => b.classList.remove('active'));
      const btn = document.getElementById(id);
      if (btn) btn.classList.add('active');
    }
    function mobileOpenLeft() {
      closeMobileAll();
      if (sidebarLeft) sidebarLeft.classList.add('sidebar-open');
      if (backdrop) backdrop.classList.add('active');
      setMobActive('mob-btn-left');
    }
    function mobileOpenRight() {
      closeMobileAll();
      if (sidebarRight) sidebarRight.classList.add('sidebar-open');
      if (backdrop) backdrop.classList.add('active');
      setMobActive('mob-btn-right');
    }

    if (backdrop) backdrop.addEventListener('click', () => { closeMobileAll(); setMobActive('mob-btn-canvas'); });

    const mobCanvas = document.getElementById('mob-btn-canvas');
    const mobLeft   = document.getElementById('mob-btn-left');
    const mobRight  = document.getElementById('mob-btn-right');
    if (mobCanvas) mobCanvas.addEventListener('click', () => { closeMobileAll(); setMobActive('mob-btn-canvas'); });
    if (mobLeft)   mobLeft.addEventListener('click', () => {
      if (sidebarLeft && sidebarLeft.classList.contains('sidebar-open')) { closeMobileAll(); setMobActive('mob-btn-canvas'); }
      else mobileOpenLeft();
    });
    if (mobRight)  mobRight.addEventListener('click', () => {
      if (sidebarRight && sidebarRight.classList.contains('sidebar-open')) { closeMobileAll(); setMobActive('mob-btn-canvas'); }
      else mobileOpenRight();
    });

    window.addEventListener('resize', () => { if (!isMobile()) closeMobileAll(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isMobile()) { closeMobileAll(); setMobActive('mob-btn-canvas'); }
    });

    // ─── 3. Theme Toggle ─────────────────────────────────────────────────────
    let isDarkTheme = true;
    document.documentElement.setAttribute('data-theme', 'dark');

    function toggleTheme() {
      isDarkTheme = !isDarkTheme;
      document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
      const icon  = document.getElementById('kb-theme-icon');
      const label = document.getElementById('kb-theme-label');
      if (icon)  icon.className = isDarkTheme ? 'fas fa-moon' : 'fas fa-sun';
      if (label) label.textContent = isDarkTheme ? 'Dark' : 'Light';
    }

    const kbBtnTheme = document.getElementById('kb-btn-theme');
    if (kbBtnTheme) kbBtnTheme.addEventListener('click', toggleTheme);
  });
</script>

<!-- ═══════════════════════════════════════════════════════════════════════════
     ERROR DIAGNOSTIC OVERLAY
     ═══════════════════════════════════════════════════════════════════════════ -->
<div id="kalepa-diag-overlay" style="display:none;position:fixed;top:10px;right:10px;z-index:9999;background:#1a1030;border:1px solid #ef4444;border-radius:12px;padding:16px 20px;max-width:460px;font-family:monospace;font-size:12px;color:#e8e8f0;box-shadow:0 8px 32px rgba(0,0,0,0.6)">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
    <span style="font-size:20px">⚠️</span>
    <strong style="color:#ef4444;font-size:13px">Studio Baik — JavaScript Error</strong>
    <button onclick={(e) => e.currentTarget.closest('#kalepa-diag-overlay').style.display='none'} style="margin-left:auto;background:none;border:none;color:#9a9ab0;font-size:16px;cursor:pointer">✕</button>
  </div>
  <div id="kalepa-diag-msg" style="color:#fca5a5;word-break:break-all;line-height:1.5"></div>
  <div id="kalepa-diag-stack" style="margin-top:8px;color:#6a6a80;font-size:10px;white-space:pre-wrap;max-height:150px;overflow:auto"></div>
</div>

<!-- ═══════════════════════════════════════════════════════════════════════════
     LOADING SCREEN
     ═══════════════════════════════════════════════════════════════════════════ -->
<div id="loading-screen" style="display:none;">
  <div class="loader-content">
    <div class="loader-spinner"></div>
    <h2>Studio Baik</h2>
    <p>Loading 3D Room Designer...</p>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════════════════════
     ERASER INDICATOR
     ═══════════════════════════════════════════════════════════════════════════ -->
<div id="eraser-indicator">
  <i class="fas fa-eraser"></i>&nbsp; ERASER MODE — Klik elemen untuk menghapus &nbsp;(ESC untuk keluar)
</div>

<!-- ═══════════════════════════════════════════════════════════════════════════
     TOP BAR — BARIS 1: Logo + Stages + Save/Load
     ═══════════════════════════════════════════════════════════════════════════ -->
<div id="kalepa-topbar-wrap">

  <!-- ── BARIS 1: TOP BAR ──────────────────────────────────────────── -->
  <div class="kalepa-topbar" role="banner">

    <!-- Logo + Brand -->
    <div class="kb-logo-wrap">
      <div class="kb-logo">S</div>
      <div>
        <span class="kb-brand">Studio Baik</span>
        <span class="kb-brand-sub">Studio Design Room</span>
      </div>
    </div>

    <div class="kb-sep"></div>

    <!-- Tahapan / Stages -->
    <div class="kb-stages" role="tablist" aria-label="Tahapan Desain">
      <button class="kb-stage-btn active" role="tab" aria-selected="true" id="kb-tab-arch" title="Arsitektur">
        <i class="fas fa-drafting-compass"></i>
        Architecture
      </button>
      <button class="kb-stage-btn locked" role="tab" aria-selected="false" id="kb-tab-mep"
        title="Selesaikan Arsitektur terlebih dahulu">
        <i class="fas fa-lock kb-lock-icon"></i>
        MEP
      </button>
      <button class="kb-stage-btn locked" role="tab" aria-selected="false" id="kb-tab-annotate"
        title="Selesaikan MEP terlebih dahulu">
        <i class="fas fa-lock kb-lock-icon"></i>
        Annotate
      </button>
      <button class="kb-stage-btn locked" role="tab" aria-selected="false" id="kb-tab-export"
        title="Export tersedia setelah semua tahap selesai">
        <i class="fas fa-lock kb-lock-icon"></i>
        Export
      </button>
    </div>

    <!-- Spacer -->
    <div class="kb-spacer"></div>

    <!-- Back to Baik -->
    <a href="http://localhost/studiocerdas/public" class="kb-back-btn" id="kb-btn-back" title="Kembali ke halaman utama Studio Baik">
      <i class="fas fa-arrow-left"></i>
      Back to Baik
    </a>

    <!-- Buka Project -->
    <button class="kb-save-btn" id="kb-btn-load" title="Buka Project" style="margin-right:8px;background-color:#4a5568;">
      <i class="fas fa-folder-open"></i>
      Buka Project
    </button>

    <!-- Undo / Redo -->
    <div class="kb-undo-redo">
      <button class="kb-save-btn" id="kb-btn-undo" title="Undo (Ctrl+Z)"
        style="background:rgba(255,255,255,0.05);padding:6px 12px;">
        <i class="fas fa-undo"></i>
      </button>
      <button class="kb-save-btn" id="kb-btn-redo" title="Redo (Ctrl+Y)"
        style="background:rgba(255,255,255,0.05);padding:6px 12px;">
        <i class="fas fa-redo"></i>
      </button>
    </div>

    <!-- Simpan Project -->
    <button class="kb-save-btn" id="kb-btn-save" title="Simpan Project">
      <i class="fas fa-save"></i>
      Simpan Project
    </button>

  </div><!-- /.kalepa-topbar -->

  <!-- ── BARIS 2: TOOLBAR ──────────────────────────────────────────── -->
  <div class="kalepa-toolbar" role="toolbar" aria-label="Studio Tools">

    <!-- Build -->
    <div class="kb-tool-group-wrap">
      <span class="kb-tool-group-label">Build</span>
      <div class="kb-tool-group-row">
        <button class="kb-tool-btn" data-kb-action="room"   title="Draw Room"   id="kb-tool-room">  <i class="fas fa-square"></i></button>
        <button class="kb-tool-btn" data-kb-action="wall"   title="Draw Wall"   id="kb-tool-wall">  <i class="fas fa-layer-group"></i></button>
        <button class="kb-tool-btn" data-kb-action="door"   title="Add Door"    id="kb-tool-door">  <i class="fas fa-door-open"></i></button>
        <button class="kb-tool-btn" data-kb-action="window" title="Add Window"  id="kb-tool-window"><i class="fas fa-window-maximize"></i></button>
        <button class="kb-tool-btn" data-kb-action="stairs" title="Add Stairs"  id="kb-tool-stairs"><i class="fas fa-stream"></i></button>
      </div>
    </div>

    <!-- Eraser -->
    <div class="kb-tool-group-wrap">
      <span class="kb-tool-group-label">Eraser</span>
      <div class="kb-tool-group-row">
        <button class="kb-tool-btn" data-kb-action="delete_item" title="Hapus (Klik)"       id="kb-tool-eraser">    <i class="fas fa-eraser"></i></button>
        <button class="kb-tool-btn" data-kb-action="box_eraser"  title="Hapus Area (Drag)"  id="kb-tool-box-eraser"><i class="fas fa-object-group"></i></button>
      </div>
    </div>

    <!-- Navigate -->
    <div class="kb-tool-group-wrap">
      <span class="kb-tool-group-label">Navigate</span>
      <div class="kb-tool-group-row">
        <button class="kb-tool-btn active" data-kb-action="select"     title="Select Normal (Esc)"  id="kb-tool-select">    <i class="fas fa-mouse-pointer"></i></button>
        <button class="kb-tool-btn"        data-kb-action="pan-single" title="Select per Element"   id="kb-tool-pan-single"><i class="fas fa-vector-square"></i></button>
        <button class="kb-tool-btn"        data-kb-action="pan"        title="Select Group (Pan)"   id="kb-tool-pan">       <i class="fas fa-hand-paper"></i></button>
      </div>
    </div>

    <!-- Tools -->
    <div class="kb-tool-group-wrap">
      <span class="kb-tool-group-label">Tools</span>
      <div class="kb-tool-group-row">
        <button class="kb-tool-btn" data-kb-action="text"       title="Add Text"       id="kb-tool-text">   <i class="fas fa-font"></i></button>
        <button class="kb-tool-btn" data-kb-action="rect_label" title="Text Box"       id="kb-tool-textbox"><i class="fas fa-comment-alt"></i></button>
        <button class="kb-tool-btn" data-kb-action="dimension"  title="Dimension Line" id="kb-tool-dim">    <i class="fas fa-ruler-horizontal"></i></button>
      </div>
    </div>

    <!-- Views -->
    <div class="kb-tool-group-wrap">
      <span class="kb-tool-group-label">Views</span>
      <div class="kb-tool-group-row">
        <button class="kb-tool-btn" data-kb-action="toggle_grid" title="Toggle Grid"   id="kb-tool-grid"><i class="fas fa-border-all"></i></button>
        <button class="kb-tool-btn" id="kb-tool-undo" title="Undo (Ctrl+Z)"><i class="fas fa-undo"></i></button>
        <button class="kb-tool-btn" id="kb-tool-redo" title="Redo (Ctrl+Y)"><i class="fas fa-redo"></i></button>
      </div>
    </div>

    <!-- Wall Cut -->
    <div class="kb-tool-group-wrap">
      <span class="kb-tool-group-label">Wall Cut</span>
      <div class="kb-tool-group-row">
        <button class="kb-tool-btn" data-kb-action="wall_hole" title="Wall Hole (Magnet)"  id="kb-tool-wall-hole"><i class="fas fa-door-open"></i></button>
        <button class="kb-tool-btn" data-kb-action="wall_grid" title="Wall Grid Eraser"    id="kb-tool-wall-grid"><i class="fas fa-th-large"></i></button>
      </div>
    </div>

    <!-- Zoom -->
    <div class="kb-tool-group-wrap">
      <span class="kb-tool-group-label">Zoom</span>
      <div class="kb-tool-group-row" style="align-items:center;gap:4px;">
        <button class="kb-tool-btn" data-kb-action="zoom_out" title="Zoom Out" id="kb-tool-zoomout"><i class="fa-solid fa-magnifying-glass-minus"></i></button>
        <span id="kb-zoom-text" style="font-size:11px;font-weight:600;color:var(--text-color);width:36px;text-align:center;">100%</span>
        <button class="kb-tool-btn" data-kb-action="zoom_in"  title="Zoom In"  id="kb-tool-zoomin"> <i class="fa-solid fa-magnifying-glass-plus"></i></button>
      </div>
    </div>

    <!-- Tema -->
    <div class="kb-tool-group-wrap">
      <span class="kb-tool-group-label">Tema</span>
      <div class="kb-tool-group-row">
        <button class="kb-theme-btn" id="kb-btn-theme" title="Toggle Dark / Light Mode">
          <i class="fas fa-moon" id="kb-theme-icon"></i>
          <span id="kb-theme-label">Dark</span>
        </button>
      </div>
    </div>

    <!-- Spacer -->
    <div style="flex:1;"></div>

    <!-- Next Stage -->
    <div class="kb-tool-group-wrap" style="border-left:1px solid var(--border-color);padding-left:12px;border-right:none;">
      <span class="kb-tool-group-label">Tahap</span>
      <div class="kb-tool-group-row">
        <button id="kb-btn-next" class="btn-next" title="Lanjut ke tahap berikutnya">
          Next &nbsp;<i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>

  </div><!-- /.kalepa-toolbar -->

</div><!-- /#kalepa-topbar-wrap -->


<!-- ═══════════════════════════════════════════════════════════════════════════
     STUDIO LAYOUT — [Sidebar Kiri | Canvas | Sidebar Kanan]
     ═══════════════════════════════════════════════════════════════════════════ -->
<div class="studio-layout">

  <!-- ── SIDEBAR KIRI ─────────────────────────────────────────────────────── -->
  <div class="sidebar-wrapper sidebar-wrapper--left" class:collapsed={leftCollapsed}>
    <!-- Toggle Button -->
    <button
      id="toggle-left"
      class="sidebar-toggle sidebar-toggle--left"
      onclick={() => leftCollapsed = !leftCollapsed}
      title="Toggle sidebar kiri"
      aria-label="Toggle left sidebar"
    >
      <span class="material-symbols-rounded">
        {leftCollapsed ? 'chevron_right' : 'chevron_left'}
      </span>
    </button>

    <aside id="sidebar-left" class="sidebar">

      <!-- LEFT PANEL: Kalepa Categories (Tools) -->
      <div class="panel" id="panel-kalepa-categories">
        <div class="panel-header" data-toggle="kalepa-cat-content">
          <span class="material-symbols-rounded">category</span>
          <h3>Kalepa Tools</h3>
          <span class="material-symbols-rounded chevron">expand_more</span>
        </div>
        <div class="panel-content" id="kalepa-cat-content" style="padding:10px">
          <div class="kt-list">
            <div class="kt-list-item action-btn" data-category="build">
              <i class="fas fa-hammer" style="color:#7c3aed;font-size:18px;width:30px;"></i>
              <div class="kt-item-text">
                <div class="kt-item-title">Build</div>
                <div class="kt-item-sub">Struktur Ruangan</div>
              </div>
            </div>
            <div class="kt-list-item action-btn" data-category="roofs">
              <i class="fas fa-campground" style="color:#e11d48;font-size:18px;width:30px;"></i>
              <div class="kt-item-text">
                <div class="kt-item-title">Roofs</div>
                <div class="kt-item-sub">Atap &amp; Plafon</div>
              </div>
            </div>
            <div class="kt-list-item action-btn" data-category="furnish">
              <i class="fas fa-couch" style="color:#d97706;font-size:18px;width:30px;"></i>
              <div class="kt-item-text">
                <div class="kt-item-title">Furnish</div>
                <div class="kt-item-sub">Sofa, Meja, Kursi</div>
              </div>
            </div>
            <div class="kt-list-item action-btn" data-category="kitchen">
              <i class="fas fa-utensils" style="color:#059669;font-size:18px;width:30px;"></i>
              <div class="kt-item-text">
                <div class="kt-item-title">Kitchen</div>
                <div class="kt-item-sub">Kabinet &amp; Dapur</div>
              </div>
            </div>
            <div class="kt-list-item action-btn" data-category="plumbing">
              <i class="fas fa-faucet" style="color:#0284c7;font-size:18px;width:30px;"></i>
              <div class="kt-item-text">
                <div class="kt-item-title">Plumbing</div>
                <div class="kt-item-sub">Kamar Mandi</div>
              </div>
            </div>
            <div class="kt-list-item action-btn" data-category="lighting">
              <i class="fas fa-lightbulb" style="color:#eab308;font-size:18px;width:30px;"></i>
              <div class="kt-item-text">
                <div class="kt-item-title">Lighting</div>
                <div class="kt-item-sub">Lampu &amp; Sorot</div>
              </div>
            </div>
            <div class="kt-list-item action-btn" data-category="electrical">
              <i class="fas fa-plug" style="color:#dc2626;font-size:18px;width:30px;"></i>
              <div class="kt-item-text">
                <div class="kt-item-title">Electrical</div>
                <div class="kt-item-sub">Stop Kontak, Saklar</div>
              </div>
            </div>
            <div class="kt-list-item action-btn" data-category="decorate">
              <i class="fas fa-paint-roller" style="color:#db2777;font-size:18px;width:30px;"></i>
              <div class="kt-item-text">
                <div class="kt-item-title">Decorate</div>
                <div class="kt-item-sub">Dekorasi</div>
              </div>
            </div>
            <div class="kt-list-item action-btn" data-category="outdoor">
              <i class="fas fa-tree" style="color:#15803d;font-size:18px;width:30px;"></i>
              <div class="kt-item-text">
                <div class="kt-item-title">Outdoor</div>
                <div class="kt-item-sub">Eksterior</div>
              </div>
            </div>
          </div>
        </div>
      </div><!-- /#panel-kalepa-categories -->

      <!-- LEFT PANEL: Room Styles -->
      <div class="panel" id="panel-styles">
        <div class="panel-header" data-toggle="styles-content">
          <span class="material-symbols-rounded">style</span>
          <h3>Room Styles</h3>
          <span class="material-symbols-rounded chevron">expand_more</span>
        </div>
        <div class="panel-content" id="styles-content">
          <p class="styles-hint">6 curated elegant styles</p>
          <div id="room-styles-grid"></div>
        </div>
      </div><!-- /#panel-styles -->

      <!-- LEFT PANEL: Floor Texture -->
      <div class="panel" id="panel-floor">
        <div class="panel-header" data-toggle="floor-content">
          <span class="material-symbols-rounded">layers</span>
          <h3>Floor Texture</h3>
          <span class="material-symbols-rounded chevron">expand_more</span>
        </div>
        <div class="panel-content" id="floor-content">
          <div class="texture-grid" id="floor-textures">
            <div class="texture-swatch" title="Kayu Terang"><canvas width="64" height="64" style="background:#DEB887;"></canvas><span class="tex-label">Kayu Terang</span></div>
            <div class="texture-swatch" title="Kayu Gelap"><canvas width="64" height="64" style="background:#8B4513;"></canvas><span class="tex-label">Kayu Gelap</span></div>
            <div class="texture-swatch" title="Keramik Putih"><canvas width="64" height="64" style="background:#F5F5F5;"></canvas><span class="tex-label">Keramik Putih</span></div>
            <div class="texture-swatch" title="Keramik Abu"><canvas width="64" height="64" style="background:#808080;"></canvas><span class="tex-label">Keramik Abu</span></div>
          </div>
        </div>
      </div><!-- /#panel-floor -->

      <!-- LEFT PANEL: Wall Texture -->
      <div class="panel" id="panel-walls">
        <div class="panel-header" data-toggle="walls-content">
          <span class="material-symbols-rounded">wallpaper</span>
          <h3>Wall Texture</h3>
          <span class="material-symbols-rounded chevron">expand_more</span>
        </div>
        <div class="panel-content" id="walls-content">
          <div class="wall-selector">
            <button class="wall-tab active" data-wall="all">All Walls</button>
            <button class="wall-tab" data-wall="back">Back</button>
            <button class="wall-tab" data-wall="left">Left</button>
            <button class="wall-tab" data-wall="right">Right</button>
            <button class="wall-tab" data-wall="front">Front</button>
          </div>
          <div class="texture-grid" id="wall-textures">
            <div class="texture-swatch" title="Cat Putih"><canvas width="64" height="64" style="background:#FFFFFF;"></canvas><span class="tex-label">Cat Putih</span></div>
            <div class="texture-swatch" title="Cat Krem"><canvas width="64" height="64" style="background:#F5F5DC;"></canvas><span class="tex-label">Cat Krem</span></div>
            <div class="texture-swatch" title="Bata Merah"><canvas width="64" height="64" style="background:#B22222;"></canvas><span class="tex-label">Bata Merah</span></div>
            <div class="texture-swatch" title="Bata Putih"><canvas width="64" height="64" style="background:#F0F8FF;"></canvas><span class="tex-label">Bata Putih</span></div>
          </div>
          <div class="wall-visibility">
            <label class="checkbox-label">
              <input type="checkbox" id="show-front-wall" checked>
              <span>Show Front Wall</span>
            </label>
          </div>
        </div>
      </div><!-- /#panel-walls -->

      <!-- LEFT PANEL: Ceiling Texture -->
      <div class="panel" id="panel-ceiling">
        <div class="panel-header" data-toggle="ceiling-content">
          <span class="material-symbols-rounded">roofing</span>
          <h3>Ceiling Texture</h3>
          <span class="material-symbols-rounded chevron">expand_more</span>
        </div>
        <div class="panel-content" id="ceiling-content">
          <div class="texture-grid" id="ceiling-textures">
            <div class="texture-swatch" title="Plafon Putih"><canvas width="64" height="64" style="background:#FFFFFF;"></canvas><span class="tex-label">Plafon Putih</span></div>
            <div class="texture-swatch" title="Plafon Gypsum"><canvas width="64" height="64" style="background:#F8F8FF;"></canvas><span class="tex-label">Plafon Gypsum</span></div>
            <div class="texture-swatch" title="Kayu Plafon"><canvas width="64" height="64" style="background:#DEB887;"></canvas><span class="tex-label">Kayu Plafon</span></div>
            <div class="texture-swatch" title="Beton Ekspos"><canvas width="64" height="64" style="background:#A9A9A9;"></canvas><span class="tex-label">Beton Ekspos</span></div>
          </div>
          <div class="wall-visibility">
            <label class="checkbox-label">
              <input type="checkbox" id="show-ceiling">
              <span>Show Ceiling</span>
            </label>
          </div>
        </div>
      </div><!-- /#panel-ceiling -->

    </aside>
  </div><!-- /sidebar-wrapper--left -->

  <!-- ── 3D VIEWPORT ─────────────────────────────────────────────────────── -->
  <div class="canvas-area" id="viewport">
    <!-- Mobile backdrop -->
    <div id="sidebar-backdrop"></div>

    <canvas id="canvas3d"></canvas>
    <div id="viewport-overlay"></div>

    <!-- Camera View Controls -->
    <div id="camera-nav">
      <button class="cam-btn" id="cam-top" title="Top View">
        <span class="material-symbols-rounded">vertical_align_top</span>
        <span>Top View</span>
      </button>
      <button class="cam-btn" id="cam-eye" title="Front View">
        <span class="material-symbols-rounded">panorama_horizontal</span>
        <span>Front View</span>
      </button>
      <button class="cam-btn active" id="cam-persp" title="3D View">
        <span class="material-symbols-rounded">view_in_ar</span>
        <span>3D</span>
      </button>
    </div>
  </div><!-- /viewport -->

  <!-- ── SIDEBAR KANAN ────────────────────────────────────────────────────── -->
  <div class="sidebar-wrapper sidebar-wrapper--right" class:collapsed={rightCollapsed}>
    <!-- Toggle Button -->
    <button
      id="toggle-right"
      class="sidebar-toggle sidebar-toggle--right"
      onclick={() => rightCollapsed = !rightCollapsed}
      title="Toggle sidebar kanan"
      aria-label="Toggle right sidebar"
    >
      <span class="material-symbols-rounded">
        {rightCollapsed ? 'chevron_left' : 'chevron_right'}
      </span>
    </button>

    <aside id="sidebar-right" class="sidebar">

      <!-- RIGHT PANEL: Project Properties -->
      <div class="panel" id="panel-kalepa-props">
        <div class="panel-header" data-toggle="kalepa-props-content">
          <span class="material-symbols-rounded">architecture</span>
          <h3 id="panel-header-title">Project Properties</h3>
          <span class="material-symbols-rounded chevron">expand_more</span>
        </div>
        <div class="panel-content" id="kalepa-props-content">

          <!-- Project Name -->
          <div class="prop-section">
            <div class="prop-section-label">Project Name</div>
            <div class="prop-input-row">
              <span class="material-symbols-rounded prop-icon">edit_document</span>
              <input type="text" id="input-project-name" class="prop-text-input" placeholder="Nama project..." value="Project Baru">
            </div>
          </div>

          <!-- Land Size -->
          <div class="prop-section">
            <div class="prop-section-label">Ukuran Lahan (Meter)</div>
            <div class="prop-axis-row">
              <div class="prop-input-row prop-input-row--half">
                <span class="prop-axis-tag prop-axis-tag--p">P</span>
                <input type="number" id="input-canvas-length" class="prop-num-input" value="30" min="6" max="100" title="Panjang">
              </div>
              <div class="prop-input-row prop-input-row--half">
                <span class="prop-axis-tag prop-axis-tag--l">L</span>
                <input type="number" id="input-canvas-width" class="prop-num-input" value="30" min="6" max="100" title="Lebar">
              </div>
            </div>
          </div>

          <!-- Dynamic Properties (JS injected) -->
          <div id="dynamic-properties-container" class="prop-hidden">
            <div class="prop-section-label" id="dynamic-prop-title">Properties</div>
            <div id="dynamic-prop-content"></div>
          </div>

          <div class="prop-divider"></div>

          <!-- Floors -->
          <div class="prop-section">
            <div class="prop-section-row">
              <div class="prop-section-label prop-section-label--inline">Floors</div>
              <button id="btn-add-floor" class="prop-chip-btn">
                <i class="fas fa-plus"></i> Add
              </button>
            </div>
            <div id="floor-list-container" class="prop-floor-list"></div>
          </div>

          <div class="prop-divider"></div>

          <!-- Build Assets Stats -->
          <div class="prop-section">
            <div class="prop-section-label">Build Assets</div>
            <div class="prop-stats-grid">
              <div class="prop-stat">
                <i class="fas fa-vector-square prop-stat-icon"></i>
                <span class="prop-stat-label">Rooms</span>
                <span id="val-room" class="prop-stat-val">0</span>
              </div>
              <div class="prop-stat">
                <i class="fas fa-minus prop-stat-icon"></i>
                <span class="prop-stat-label">Walls</span>
                <span id="val-wall" class="prop-stat-val">0</span>
              </div>
              <div class="prop-stat">
                <i class="fas fa-door-closed prop-stat-icon"></i>
                <span class="prop-stat-label">Doors</span>
                <span id="val-door" class="prop-stat-val">0</span>
              </div>
              <div class="prop-stat">
                <i class="fas fa-border-all prop-stat-icon"></i>
                <span class="prop-stat-label">Windows</span>
                <span id="val-window" class="prop-stat-val">0</span>
              </div>
              <div class="prop-stat">
                <i class="fas fa-stairs prop-stat-icon"></i>
                <span class="prop-stat-label">Tangga</span>
                <span id="val-stair" class="prop-stat-val">0</span>
              </div>
            </div>
          </div>

          <div class="prop-divider"></div>

          <!-- Project Assets -->
          <div class="prop-section">
            <div class="prop-section-label">Project Assets</div>

            <!-- Electrical -->
            <div class="prop-acc prop-acc--locked">
              <div class="prop-acc-header">
                <div class="prop-acc-left">
                  <i class="fas fa-plug prop-acc-icon"></i>
                  <span class="prop-acc-title">Electrical</span>
                  <span class="prop-acc-badge" id="count-electrical">0</span>
                </div>
                <i class="fas fa-lock prop-acc-lock"></i>
              </div>
              <div class="prop-acc-body" id="asset-electrical">
                <div class="prop-acc-item"><i class="fas fa-snowflake"></i><span>AC Unit</span><b id="cnt-ac">0</b></div>
                <div class="prop-acc-item"><i class="fas fa-fan"></i><span>Fan</span><b id="cnt-fan">0</b></div>
                <div class="prop-acc-item"><i class="fas fa-lightbulb"></i><span>Floor Lamp</span><b id="cnt-lamp">0</b></div>
              </div>
            </div>

            <!-- Furnitures -->
            <div class="prop-acc prop-acc--locked">
              <div class="prop-acc-header">
                <div class="prop-acc-left">
                  <i class="fas fa-couch prop-acc-icon"></i>
                  <span class="prop-acc-title">Furnitures</span>
                  <span class="prop-acc-badge" id="count-furnitures">0</span>
                </div>
                <i class="fas fa-lock prop-acc-lock"></i>
              </div>
              <div class="prop-acc-body" id="asset-furnitures">
                <div class="prop-acc-item"><i class="fas fa-couch"></i><span>Sofa</span><b id="cnt-sofa">0</b></div>
                <div class="prop-acc-item"><i class="fas fa-bed"></i><span>Bed</span><b id="cnt-bed">0</b></div>
                <div class="prop-acc-item"><i class="fas fa-table"></i><span>Table</span><b id="cnt-table">0</b></div>
                <div class="prop-acc-item"><i class="fas fa-chair"></i><span>Chair</span><b id="cnt-chair">0</b></div>
                <div class="prop-acc-item"><i class="fas fa-box"></i><span>Cabinet</span><b id="cnt-cabinet">0</b></div>
                <div class="prop-acc-item"><i class="fas fa-boxes"></i><span>Dresser</span><b id="cnt-dresser">0</b></div>
                <div class="prop-acc-item"><i class="fas fa-book"></i><span>Bookshelf</span><b id="cnt-bookshelf">0</b></div>
                <div class="prop-acc-item"><i class="fas fa-tv"></i><span>TV</span><b id="cnt-tv">0</b></div>
              </div>
            </div>

            <!-- Kitchen -->
            <div class="prop-acc prop-acc--locked">
              <div class="prop-acc-header">
                <div class="prop-acc-left">
                  <i class="fas fa-utensils prop-acc-icon"></i>
                  <span class="prop-acc-title">Kitchen</span>
                  <span class="prop-acc-badge" id="count-kitchen">0</span>
                </div>
                <i class="fas fa-lock prop-acc-lock"></i>
              </div>
              <div class="prop-acc-body" id="asset-kitchen">
                <div class="prop-acc-item"><i class="fas fa-temperature-low"></i><span>Fridge</span><b id="cnt-fridge">0</b></div>
                <div class="prop-acc-item"><i class="fas fa-fire"></i><span>Stove</span><b id="cnt-stove">0</b></div>
                <div class="prop-acc-item"><i class="fas fa-sink"></i><span>Kitchen Sink</span><b id="cnt-kitchensink">0</b></div>
              </div>
            </div>

            <!-- Plumbing -->
            <div class="prop-acc prop-acc--locked">
              <div class="prop-acc-header">
                <div class="prop-acc-left">
                  <i class="fas fa-faucet prop-acc-icon"></i>
                  <span class="prop-acc-title">Plumbing</span>
                  <span class="prop-acc-badge" id="count-plumbing">0</span>
                </div>
                <i class="fas fa-lock prop-acc-lock"></i>
              </div>
              <div class="prop-acc-body" id="asset-plumbing">
                <div class="prop-acc-item"><i class="fas fa-soap"></i><span>Wastafel</span><b id="cnt-sink">0</b></div>
                <div class="prop-acc-item"><i class="fas fa-bath"></i><span>Bathtub</span><b id="cnt-bathtub">0</b></div>
                <div class="prop-acc-item"><i class="fas fa-shower"></i><span>Shower</span><b id="cnt-shower">0</b></div>
                <div class="prop-acc-item"><i class="fas fa-toilet"></i><span>Toilet</span><b id="cnt-toilet">0</b></div>
              </div>
            </div>

            <!-- Textures -->
            <div class="prop-acc prop-acc--locked">
              <div class="prop-acc-header">
                <div class="prop-acc-left">
                  <i class="fas fa-paint-roller prop-acc-icon"></i>
                  <span class="prop-acc-title">Textures</span>
                </div>
                <i class="fas fa-lock prop-acc-lock"></i>
              </div>
              <div class="prop-acc-body" id="asset-textures">
                <div class="prop-acc-item"><i class="fas fa-chess-board"></i><span>Floor Tile</span></div>
                <div class="prop-acc-item"><i class="fas fa-grip-lines"></i><span>Hardwood</span></div>
                <div class="prop-acc-item"><i class="fas fa-square-full"></i><span>Wall Paint</span></div>
                <div class="prop-acc-item"><i class="fas fa-th-large"></i><span>Marble</span></div>
              </div>
            </div>

          </div><!-- /prop-section Project Assets -->
        </div><!-- /panel-content -->
      </div><!-- /#panel-kalepa-props -->

      <!-- RIGHT PANEL: Element Properties -->
      <div class="panel" id="panel-element-info">
        <div class="panel-header" data-toggle="element-info-content">
          <span class="material-symbols-rounded">info</span>
          <h3>Element Properties</h3>
          <span class="material-symbols-rounded chevron">expand_more</span>
        </div>
        <div class="panel-content" id="element-info-content">
          <div style="padding:15px;color:var(--text-muted);text-align:center;font-size:13px;">
            Pilih elemen di kanvas untuk melihat propertinya.
          </div>
          <!-- Dynamically populated by ElementInfoPanel -->
        </div>
      </div><!-- /#panel-element-info -->

      <!-- SELECTED OBJECT PANEL (legacy — hidden, used for position/rotation sync) -->
      <div class="panel panel-hidden" id="panel-selected" style="display:none!important">
        <div class="panel-header">
          <span class="material-symbols-rounded">tune</span>
          <h3 id="selected-name">Selected Object</h3>
        </div>
        <div class="panel-content">
          <div class="prop-group">
            <label for="pos-x">Position</label>
            <div class="prop-row">
              <div class="prop-field"><span class="axis x">X</span><input type="number" id="pos-x" step="0.1" value="0" aria-label="Position X"></div>
              <div class="prop-field"><span class="axis y">Y</span><input type="number" id="pos-y" step="0.1" value="0" aria-label="Position Y"></div>
              <div class="prop-field"><span class="axis z">Z</span><input type="number" id="pos-z" step="0.1" value="0" aria-label="Position Z"></div>
            </div>
          </div>
          <div class="prop-group">
            <label for="rot-y">Rotation (Y)</label>
            <div class="rotation-control">
              <input type="range" id="rot-y" min="0" max="360" step="15" value="0" aria-label="Rotation Y">
              <span class="slider-value" id="rot-y-value">0</span>
            </div>
          </div>
          <div class="prop-group">
            <label for="obj-color">Color</label>
            <input type="color" id="obj-color" value="#8B7355" aria-label="Object Color">
          </div>
          <div class="prop-actions">
            <button id="btn-duplicate-selected" class="action-btn">
              <span class="material-symbols-rounded">content_copy</span> Duplicate
            </button>
            <button id="btn-delete-selected" class="action-btn danger">
              <span class="material-symbols-rounded">delete</span> Delete
            </button>
          </div>
        </div>
      </div><!-- /#panel-selected -->

    </aside>
  </div><!-- /sidebar-wrapper--right -->

</div><!-- /.studio-layout -->


<!-- ═══════════════════════════════════════════════════════════════════════════
     STATUS BAR
     ═══════════════════════════════════════════════════════════════════════════ -->
<footer id="statusbar">
  <div class="status-left">
    <span class="material-symbols-rounded">info</span>
    <span id="status-text">Ready — Studio Baik 3D Room Designer</span>
    <span class="status-divider">|</span>
    <a href="http://localhost/studiocerdas/public" class="k-link-muted" title="Kembali ke Studio Baik">← Studio Baik</a>
  </div>
  <div class="status-center">
    <span id="object-count">Objects: 0</span>
  </div>
  <div class="status-right">
    <span id="cursor-pos">Cursor: 0.0, 0.0, 0.0</span>
    <span class="status-divider">|</span>
    <span id="fps-counter">FPS: 60</span>
  </div>
</footer>


<!-- ═══════════════════════════════════════════════════════════════════════════
     MOBILE BOTTOM NAVIGATION
     ═══════════════════════════════════════════════════════════════════════════ -->
<nav id="mobile-nav" aria-label="Mobile navigation">
  <button class="mob-nav-btn" id="mob-btn-left" title="Kalepa Tools">
    <span class="material-symbols-rounded">build</span>
    <span>Tools</span>
  </button>
  <button class="mob-nav-btn active" id="mob-btn-canvas" title="Canvas 3D">
    <span class="material-symbols-rounded">view_in_ar</span>
    <span>Canvas</span>
  </button>
  <button class="mob-nav-btn" id="mob-btn-right" title="Project Properties">
    <span class="material-symbols-rounded">architecture</span>
    <span>Properties</span>
  </button>
</nav>


<style>
  /* ═══════════════════════════════════════════════════════
     CSS VARIABLES — Studio Baik Design System
     ═══════════════════════════════════════════════════════ */
  :global(:root), :global([data-theme="dark"]) {
    --kalepa-topbar-h:   46px;
    --kalepa-toolbar-h:  48px;
    --kalepa-total-h:    94px;

    --bg-topbar:         #0e0e1a;
    --bg-toolbar:        #13131f;
    --bg-sidebar:        #111120;
    --bg-panel:          #16162a;
    --bg-panel-header:   rgba(255,255,255,0.025);
    --bg-canvas:         #1a1a2e;
    --bg-secondary:      #13131f;

    --border-color:      rgba(255,255,255,0.07);
    --border-tb:         rgba(255,255,255,0.07);

    --text-color:        #e8e8f0;
    --text-primary:      #e8e8f0;
    --text-secondary:    #9a9ab0;
    --text-muted:        #6a6a80;
    --text-tb:           rgba(255,255,255,0.9);
    --text-muted-tb:     rgba(255,255,255,0.42);

    --accent:            #7c3aed;
    --accent-hover:      #6d28d9;
    --accent-light:      rgba(124,58,237,0.15);
    --surface-glass-border: rgba(255,255,255,0.08);

    --gold-kb:           #C9A84C;
    --gold-dim:          rgba(201,168,76,0.08);
  }

  :global([data-theme="light"]) {
    --bg-topbar:         #ffffff;
    --bg-toolbar:        #f8f8fc;
    --bg-sidebar:        #f5f5fb;
    --bg-panel:          #ffffff;
    --bg-panel-header:   rgba(124,58,237,0.03);
    --bg-canvas:         #e8e8f0;
    --bg-secondary:      #f5f5fb;

    --border-color:      rgba(0,0,0,0.08);
    --border-tb:         rgba(0,0,0,0.08);

    --text-color:        #1a1a2e;
    --text-primary:      #1a1a2e;
    --text-secondary:    #5a5a7a;
    --text-muted:        #9a9ab0;
    --text-tb:           #1a1a2e;
    --text-muted-tb:     #5a5a7a;
  }

  /* ═══════════════════════════════════════════════════════
     GLOBAL RESET
     ═══════════════════════════════════════════════════════ */
  :global(body) {
    margin: 0;
    overflow: hidden;
    font-family: 'Inter', -apple-system, sans-serif;
    background: var(--bg-canvas);
    color: var(--text-primary);
  }

  /* ═══════════════════════════════════════════════════════
     TOP BAR — BARIS 1
     ═══════════════════════════════════════════════════════ */
  :global(#kalepa-topbar-wrap) {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 500;
  }

  .kalepa-topbar {
    height: var(--kalepa-topbar-h);
    background: var(--bg-topbar);
    border-bottom: 1px solid var(--border-tb);
    display: flex;
    align-items: center;
    padding: 0 14px;
    gap: 0;
  }

  .kb-logo-wrap {
    display: flex; align-items: center; gap: 8px;
    flex-shrink: 0; margin-right: 10px;
  }
  .kb-logo {
    width: 28px; height: 28px; border-radius: 7px;
    background: linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%);
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 14px; color: #fff;
    box-shadow: 0 2px 10px rgba(124,58,237,0.45);
    flex-shrink: 0;
  }
  .kb-brand {
    font-size: 13px; font-weight: 800;
    color: var(--text-tb); letter-spacing: -0.3px;
    line-height: 1; display: block;
  }
  .kb-brand-sub {
    font-size: 9px; font-weight: 400;
    color: var(--text-muted-tb); letter-spacing: 0.3px;
    display: block; margin-top: 1px;
  }
  .kb-sep {
    width: 1px; height: 22px;
    background: var(--border-tb);
    margin: 0 10px; flex-shrink: 0;
  }
  .kb-stages {
    display: flex; align-items: stretch;
    gap: 2px; height: 100%;
  }
  .kb-stage-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 0 13px; font-size: 12px; font-weight: 600;
    color: var(--text-muted-tb); background: transparent;
    border: none; border-bottom: 2px solid transparent;
    cursor: pointer; transition: all 0.15s;
    font-family: inherit; white-space: nowrap;
  }
  .kb-stage-btn:hover { color: var(--text-tb); background: rgba(255,255,255,0.04); }
  .kb-stage-btn.active { color: #fff; border-bottom-color: var(--accent); background: rgba(124,58,237,0.08); }
  .kb-stage-btn.locked { opacity: 0.38; cursor: not-allowed; pointer-events: none; }
  .kb-spacer { flex: 1; }
  .kb-back-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 12px; font-size: 11px; font-weight: 600;
    color: var(--text-muted-tb); background: transparent;
    border: 1px solid var(--border-tb); border-radius: 7px;
    cursor: pointer; text-decoration: none; transition: all 0.15s;
    margin-right: 6px;
  }
  .kb-back-btn:hover { background: rgba(255,255,255,0.07); color: var(--text-tb); }
  .kb-save-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 16px; font-size: 12px; font-weight: 700;
    color: #fff; background: var(--accent);
    border: none; border-radius: 7px; cursor: pointer;
    font-family: inherit; transition: all 0.15s;
    box-shadow: 0 2px 8px rgba(124,58,237,0.35);
  }
  .kb-save-btn:hover { background: var(--accent-hover); transform: translateY(-1px); }
  .kb-undo-redo {
    display: flex; gap: 4px; margin: 0 8px; padding: 0 8px;
    border-left: 1px solid rgba(255,255,255,0.1);
    border-right: 1px solid rgba(255,255,255,0.1);
  }

  /* ═══════════════════════════════════════════════════════
     TOOLBAR — BARIS 2
     ═══════════════════════════════════════════════════════ */
  .kalepa-toolbar {
    height: var(--kalepa-toolbar-h);
    background: var(--bg-toolbar);
    border-bottom: 1px solid var(--border-tb);
    display: flex; align-items: center;
    padding: 0 6px; gap: 0; overflow: hidden;
  }
  .kb-tool-group-wrap {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    border-right: 1px solid var(--border-tb);
    padding: 4px 8px; height: 100%; gap: 3px; flex-shrink: 0;
  }
  .kb-tool-group-label {
    font-size: 8.5px; font-weight: 700;
    color: var(--text-muted-tb); text-transform: uppercase;
    letter-spacing: 0.05em; user-select: none;
  }
  .kb-tool-group-row { display: flex; gap: 2px; }
  .kb-tool-btn {
    width: 30px; height: 26px;
    display: flex; align-items: center; justify-content: center;
    background: transparent; border: 1px solid transparent;
    border-radius: 5px; color: var(--text-muted-tb);
    cursor: pointer; font-size: 12px; transition: all 0.13s; flex-shrink: 0;
  }
  .kb-tool-btn:hover { background: rgba(255,255,255,0.09); color: var(--text-tb); border-color: rgba(255,255,255,0.09); }
  :global(.kb-tool-btn.active) { background: var(--accent); color: #fff; border-color: var(--accent); box-shadow: 0 1px 6px rgba(124,58,237,0.35); }
  .kb-theme-btn {
    display: flex; align-items: center; gap: 5px;
    padding: 5px 11px; font-size: 11px; font-weight: 600;
    color: var(--text-muted-tb); background: transparent;
    border: 1px solid var(--border-tb); border-radius: 6px;
    cursor: pointer; font-family: inherit; transition: all 0.15s; white-space: nowrap;
  }
  .kb-theme-btn:hover { background: rgba(255,255,255,0.07); color: var(--text-tb); }
  .btn-next {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 14px; border: none; border-radius: 8px;
    background: linear-gradient(135deg, #4c240c, #2b1203);
    color: #fef3c7; font-size: 12px; font-weight: 700;
    cursor: pointer; white-space: nowrap; transition: opacity 0.2s;
    box-shadow: 0 2px 8px rgba(43,18,3,0.5); letter-spacing: 0.3px;
    font-family: inherit;
  }
  .btn-next:hover { opacity: 0.85; }

  /* ═══════════════════════════════════════════════════════
     STUDIO LAYOUT
     ═══════════════════════════════════════════════════════ */
  .studio-layout {
    display: flex;
    height: 100vh;
    padding-top: var(--kalepa-total-h);
    padding-bottom: 28px; /* statusbar */
    overflow: hidden;
    box-sizing: border-box;
  }

  /* ═══════════════════════════════════════════════════════
     SIDEBAR WRAPPERS
     ═══════════════════════════════════════════════════════ */
  .sidebar-wrapper {
    position: relative;
    display: flex;
    flex-direction: row;
    transition: width 0.22s ease;
    overflow: hidden;
    flex-shrink: 0;
  }
  .sidebar-wrapper--left  { width: 280px; }
  .sidebar-wrapper--right { width: 272px; }
  .sidebar-wrapper.collapsed { width: 0; }

  .sidebar {
    width: 280px;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    flex-shrink: 0;
    background: var(--bg-sidebar);
    border-right: 1px solid var(--border-color);
  }
  .sidebar-wrapper--right .sidebar {
    width: 272px;
    border-right: none;
    border-left: 1px solid var(--border-color);
  }

  /* Sidebar scrollbar */
  .sidebar::-webkit-scrollbar { width: 4px; }
  .sidebar::-webkit-scrollbar-track { background: transparent; }
  .sidebar::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.25); border-radius: 99px; }
  .sidebar::-webkit-scrollbar-thumb:hover { background: rgba(124,58,237,0.45); }

  /* ─── Toggle Buttons ─────────────────────────────────── */
  .sidebar-toggle {
    position: absolute;
    top: 50%;
    z-index: 100;
    transform: translateY(-50%);
    width: 20px;
    height: 48px;
    background: var(--bg-secondary);
    border: 1px solid var(--surface-glass-border);
    border-radius: 0 6px 6px 0;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.18s, color 0.18s;
    padding: 0;
  }
  .sidebar-toggle .material-symbols-rounded { font-size: 16px; }
  .sidebar-toggle:hover {
    background: var(--accent-light);
    color: var(--accent);
  }
  .sidebar-toggle--left {
    right: -20px;
    border-left: none;
  }
  .sidebar-toggle--right {
    left: -20px;
    border-right: none;
    border-radius: 6px 0 0 6px;
  }

  /* ═══════════════════════════════════════════════════════
     CANVAS AREA
     ═══════════════════════════════════════════════════════ */
  .canvas-area {
    flex: 1;
    position: relative;
    overflow: hidden;
    background: var(--bg-canvas);
  }

  :global(#canvas3d) {
    width: 100% !important;
    height: 100% !important;
    display: block;
  }

  /* Mobile backdrop */
  :global(#sidebar-backdrop) {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.55);
    z-index: 80;
    backdrop-filter: blur(2px);
  }
  :global(#sidebar-backdrop.active) { display: block; }

  /* ═══════════════════════════════════════════════════════
     CAMERA NAV
     ═══════════════════════════════════════════════════════ */
  :global(#camera-nav) {
    position: absolute;
    bottom: 14px;
    right: 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    z-index: 10;
  }
  :global(.cam-btn) {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 12px;
    background: rgba(14,14,26,0.82);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    color: rgba(255,255,255,0.6);
    cursor: pointer; font-size: 11px; font-weight: 600;
    backdrop-filter: blur(8px);
    transition: all 0.18s;
    font-family: inherit;
  }
  :global(.cam-btn:hover) { background: rgba(124,58,237,0.25); color: #fff; border-color: rgba(124,58,237,0.4); }
  :global(.cam-btn.active) { background: rgba(124,58,237,0.35); color: #fff; }
  :global(.cam-btn .material-symbols-rounded) { font-size: 16px; }

  /* ═══════════════════════════════════════════════════════
     PANEL SYSTEM
     ═══════════════════════════════════════════════════════ */
  :global(.panel) {
    border-bottom: 1px solid var(--border-color);
  }
  :global(.panel-header) {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 14px;
    background: var(--bg-panel-header);
    cursor: pointer;
    user-select: none;
    transition: background 0.15s;
  }
  :global(.panel-header:hover) { background: rgba(124,58,237,0.06); }
  :global(.panel-header .material-symbols-rounded:first-child) {
    font-size: 16px; color: var(--accent); flex-shrink: 0;
  }
  :global(.panel-header h3) {
    flex: 1; font-size: 12px; font-weight: 700;
    color: var(--text-primary); margin: 0; letter-spacing: 0.2px;
  }
  :global(.panel-header .chevron) {
    font-size: 18px; color: var(--text-secondary);
    transition: transform 0.22s ease; flex-shrink: 0;
  }
  :global(.panel-header.collapsed .chevron) { transform: rotate(-90deg); }
  :global(.panel-content) {
    padding: 14px;
    overflow: hidden;
    transition: max-height 0.3s ease, opacity 0.25s ease,
                padding-top 0.3s ease, padding-bottom 0.3s ease;
    max-height: 1200px;
    opacity: 1;
  }

  /* ═══════════════════════════════════════════════════════
     KT LIST (Left Sidebar Categories)
     ═══════════════════════════════════════════════════════ */
  :global(.kt-list) {
    display: flex; flex-direction: column; gap: 4px;
  }
  :global(.kt-list-item) {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 10px; border-radius: 7px;
    cursor: pointer; transition: background 0.18s;
  }
  :global(.kt-list-item:hover) { background: rgba(124,58,237,0.10); }
  :global(.kt-list-item.active) { background: rgba(124,58,237,0.16); }
  :global(.kt-item-text) { flex: 1; }
  :global(.kt-item-title) { font-size: 13px; font-weight: 600; color: var(--text-primary); }
  :global(.kt-item-sub) { font-size: 10px; color: var(--text-secondary); margin-top: 1px; }

  /* ═══════════════════════════════════════════════════════
     TEXTURE PANELS (Left Sidebar)
     ═══════════════════════════════════════════════════════ */
  :global(.texture-grid) {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;
  }
  :global(.texture-swatch) {
    border: 1.5px solid var(--border-color); border-radius: 7px;
    overflow: hidden; cursor: pointer; transition: border-color 0.18s;
    display: flex; flex-direction: column; align-items: center;
  }
  :global(.texture-swatch:hover) { border-color: var(--accent); }
  :global(.texture-swatch.active) { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(124,58,237,0.25); }
  :global(.texture-swatch canvas) { width: 100% !important; height: 48px !important; display: block; }
  :global(.tex-label) { font-size: 10px; color: var(--text-secondary); padding: 4px; text-align: center; }

  :global(.wall-selector) { display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap; }
  :global(.wall-tab) {
    padding: 4px 8px; border: 1px solid var(--border-color);
    border-radius: 5px; font-size: 10px; font-weight: 600;
    color: var(--text-secondary); background: transparent;
    cursor: pointer; transition: all 0.15s; font-family: inherit;
  }
  :global(.wall-tab:hover) { border-color: var(--accent); color: var(--accent); }
  :global(.wall-tab.active) { background: var(--accent); color: #fff; border-color: var(--accent); }

  :global(.wall-visibility) { margin-top: 10px; }
  :global(.checkbox-label) { display: flex; align-items: center; gap: 7px; cursor: pointer; font-size: 12px; color: var(--text-secondary); }

  :global(.styles-hint) { font-size: 11px; color: var(--text-secondary); margin-bottom: 10px; }

  /* ═══════════════════════════════════════════════════════
     PROPERTY PANELS (Right Sidebar)
     ═══════════════════════════════════════════════════════ */
  :global(.prop-section) { margin-bottom: 14px; }
  :global(.prop-section-label) {
    font-size: 10px; font-weight: 700; color: var(--text-secondary);
    text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;
  }
  :global(.prop-section-row) { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  :global(.prop-section-label--inline) { margin-bottom: 0; }
  :global(.prop-input-row) {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.04); border: 1px solid var(--border-color);
    border-radius: 7px; padding: 7px 10px;
  }
  :global(.prop-input-row--half) { flex: 1; }
  :global(.prop-axis-row) { display: flex; gap: 8px; }
  :global(.prop-icon) { font-size: 16px; color: var(--text-secondary); flex-shrink: 0; }
  :global(.prop-text-input) {
    flex: 1; background: transparent; border: none; outline: none;
    font-size: 12px; color: var(--text-primary); font-family: inherit;
  }
  :global(.prop-num-input) {
    flex: 1; background: transparent; border: none; outline: none;
    font-size: 13px; font-weight: 600; color: var(--text-primary);
    font-family: inherit; width: 60px; text-align: center;
  }
  :global(.prop-axis-tag) {
    font-size: 10px; font-weight: 800; padding: 2px 5px; border-radius: 4px;
  }
  :global(.prop-axis-tag--p) { background: rgba(124,58,237,0.2); color: #a78bfa; }
  :global(.prop-axis-tag--l) { background: rgba(16,185,129,0.2); color: #6ee7b7; }

  :global(.prop-divider) { height: 1px; background: var(--border-color); margin: 14px 0; }
  :global(.prop-hidden) { display: none; }

  :global(.prop-chip-btn) {
    display: flex; align-items: center; gap: 5px;
    padding: 4px 10px; border: 1px solid var(--border-color); border-radius: 20px;
    background: transparent; color: var(--accent); font-size: 11px; font-weight: 600;
    cursor: pointer; transition: all 0.15s; font-family: inherit;
  }
  :global(.prop-chip-btn:hover) { background: rgba(124,58,237,0.12); border-color: var(--accent); }

  :global(.prop-floor-list) { display: flex; flex-direction: column; gap: 4px; }

  :global(.prop-stats-grid) {
    display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px;
  }
  :global(.prop-stat) {
    display: flex; flex-direction: column; align-items: center;
    gap: 4px; padding: 8px 4px; border-radius: 6px;
    background: rgba(255,255,255,0.03); border: 1px solid var(--border-color);
    text-align: center;
  }
  :global(.prop-stat-icon) { font-size: 12px; color: var(--accent); }
  :global(.prop-stat-label) { font-size: 9px; color: var(--text-secondary); }
  :global(.prop-stat-val) { font-size: 14px; font-weight: 700; color: var(--text-primary); }

  /* Property Asset Accordion */
  :global(.prop-acc) {
    border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 6px; overflow: hidden;
  }
  :global(.prop-acc--locked) { opacity: 0.65; }
  :global(.prop-acc-header) {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 10px; background: rgba(255,255,255,0.025);
    cursor: default;
  }
  :global(.prop-acc-left) { display: flex; align-items: center; gap: 8px; }
  :global(.prop-acc-icon) { font-size: 13px; color: var(--text-secondary); width: 16px; }
  :global(.prop-acc-title) { font-size: 11px; font-weight: 600; color: var(--text-primary); }
  :global(.prop-acc-badge) {
    font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px;
    background: rgba(124,58,237,0.2); color: var(--accent);
  }
  :global(.prop-acc-lock) { font-size: 10px; color: var(--text-muted); }
  :global(.prop-acc-body) {
    padding: 6px 10px 8px; display: flex; flex-wrap: wrap; gap: 4px;
  }
  :global(.prop-acc-item) {
    display: flex; align-items: center; gap: 6px;
    font-size: 10px; color: var(--text-secondary); padding: 3px 6px;
    border-radius: 4px; background: rgba(255,255,255,0.03);
    flex: 1; min-width: 80px;
  }
  :global(.prop-acc-item i) { font-size: 10px; color: var(--accent); }
  :global(.prop-acc-item b) { margin-left: auto; color: var(--text-primary); }

  /* Property Group (element panel) */
  :global(.prop-group) { margin-bottom: 14px; }
  :global(.prop-group label) { display: block; font-size: 10px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 6px; }
  :global(.prop-row) { display: flex; gap: 4px; }
  :global(.prop-field) { display: flex; align-items: center; gap: 4px; flex: 1; background: rgba(255,255,255,0.04); border: 1px solid var(--border-color); border-radius: 6px; padding: 5px 7px; min-width: 0; }
  :global(.prop-field input) { flex: 1; min-width: 0; background: transparent; border: none; outline: none; font-size: 12px; color: var(--text-primary); font-family: inherit; }
  :global(.prop-field input::-webkit-outer-spin-button),
  :global(.prop-field input::-webkit-inner-spin-button) {
      -webkit-appearance: none; margin: 0;
  }
  
  :global(.prop-field.num-box) {
      padding-right: 0; padding-top: 0; padding-bottom: 0; overflow: hidden;
  }
  
  :global(.spin-ctrl) {
      display: flex;
      flex-direction: column;
      border-left: 1px solid var(--border-color);
      margin-left: auto;
      height: 100%;
  }
  
  :global(.spin-btn) {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      cursor: pointer;
      font-size: 10px;
      color: var(--text-muted);
      border-radius: 0 4px 4px 0;
      transition: background 0.15s, color 0.15s;
  }
  :global(.spin-btn:first-child) { border-bottom: 1px solid var(--border-color); border-radius: 0 4px 0 0; }
  :global(.spin-btn:last-child) { border-radius: 0 0 4px 0; }
  :global(.spin-btn:hover) { background: rgba(124,58,237,0.2); color: var(--accent); }
  :global(.prop-field input[type="number"]::-webkit-inner-spin-button) { -webkit-appearance: none; appearance: none; margin: 0; }
  :global(.prop-field input[type="number"]::-webkit-outer-spin-button) { -webkit-appearance: none; appearance: none; margin: 0; }
  :global(.prop-field input[type="number"]) { -moz-appearance: textfield; appearance: textfield; }
  :global(.axis) { font-size: 9px; font-weight: 800; padding: 1px 4px; border-radius: 3px; }
  :global(.axis.x) { background: rgba(239,68,68,0.2); color: #f87171; }
  :global(.axis.y) { background: rgba(34,197,94,0.2); color: #86efac; }
  :global(.axis.z) { background: rgba(59,130,246,0.2); color: #93c5fd; }

  :global(.rotation-control) { display: flex; align-items: center; gap: 10px; }
  :global(.rotation-control input[type="range"]) { flex: 1; accent-color: var(--accent); }
  :global(.slider-value) { font-size: 12px; font-weight: 600; color: var(--text-primary); min-width: 32px; text-align: right; }

  :global(input[type="color"]) { width: 100%; height: 32px; border: 1px solid var(--border-color); border-radius: 6px; padding: 2px; cursor: pointer; background: transparent; }

  :global(.prop-actions) { display: flex; gap: 8px; margin-top: 16px; }
  :global(.action-btn) {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
    padding: 8px; border: 1px solid var(--border-color); border-radius: 7px;
    background: rgba(255,255,255,0.04); color: var(--text-primary);
    font-size: 11px; font-weight: 600; cursor: pointer; transition: 0.18s; font-family: inherit;
  }
  :global(.action-btn:hover) { background: rgba(255,255,255,0.09); }
  :global(.action-btn.danger) { color: #f87171; border-color: rgba(248,113,113,0.2); }
  :global(.action-btn.danger:hover) { background: rgba(248,113,113,0.1); }
  :global(.action-btn .material-symbols-rounded) { font-size: 15px; }

  /* ═══════════════════════════════════════════════════════
     STATUS BAR
     ═══════════════════════════════════════════════════════ */
  :global(#statusbar) {
    position: fixed; bottom: 0; left: 0; right: 0;
    height: 28px;
    background: var(--bg-topbar);
    border-top: 1px solid rgba(255,255,255,0.06);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 12px;
    font-size: 11px; color: rgba(255,255,255,0.5);
    z-index: 400; font-family: 'JetBrains Mono', 'Courier New', monospace;
  }
  :global(.status-divider) { margin: 0 8px; opacity: 0.3; }
  :global(.k-link-muted) { color: rgba(255,255,255,0.4); text-decoration: none; transition: color 0.15s; }
  :global(.k-link-muted:hover) { color: var(--accent); }

  /* ═══════════════════════════════════════════════════════
     LOADING SCREEN
     ═══════════════════════════════════════════════════════ */
  :global(#loading-screen) {
    position: fixed; inset: 0; z-index: 9000;
    background: #0a0a15;
    display: flex; align-items: center; justify-content: center;
  }
  :global(.loader-content) { text-align: center; color: #fff; }
  :global(.loader-spinner) {
    width: 44px; height: 44px; margin: 0 auto 16px;
    border: 3px solid rgba(124,58,237,0.25);
    border-top-color: #7c3aed;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  :global(.loader-content h2) { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
  :global(.loader-content p) { font-size: 13px; color: rgba(255,255,255,0.5); }

  /* ═══════════════════════════════════════════════════════
     ERASER INDICATOR
     ═══════════════════════════════════════════════════════ */
  :global(#eraser-indicator) {
    display: none;
    position: fixed;
    top: calc(var(--kalepa-total-h) + 10px);
    left: 50%; transform: translateX(-50%);
    background: rgba(239,68,68,0.92);
    color: #fff; padding: 6px 20px; border-radius: 20px;
    font-size: 12px; font-weight: 600; z-index: 8000;
    pointer-events: none;
  }

  /* ═══════════════════════════════════════════════════════
     MOBILE NAVIGATION
     ═══════════════════════════════════════════════════════ */
  :global(#mobile-nav) {
    display: none;
    position: fixed; bottom: 28px; left: 0; right: 0;
    background: var(--bg-topbar);
    border-top: 1px solid var(--border-tb);
    padding: 6px 0 4px;
    z-index: 300;
    justify-content: space-around;
  }
  :global(.mob-nav-btn) {
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    background: none; border: none; color: var(--text-secondary);
    font-size: 10px; font-weight: 600; cursor: pointer;
    padding: 4px 16px; font-family: inherit; transition: color 0.15s;
  }
  :global(.mob-nav-btn .material-symbols-rounded) { font-size: 22px; }
  :global(.mob-nav-btn.active) { color: var(--accent); }

  @media (max-width: 899px) {
    :global(#mobile-nav) { display: flex; }

    .sidebar-wrapper--left,
    .sidebar-wrapper--right {
      width: 0;
      position: fixed;
      top: var(--kalepa-total-h);
      bottom: 56px;
      z-index: 200;
      overflow: hidden;
    }
    .sidebar-wrapper--left  { left: 0; }
    .sidebar-wrapper--right { right: 0; }

    :global(.sidebar-open) { width: 280px !important; }

    .sidebar-toggle { display: none; }
  }

  /* ═══════════════════════════════════════════════════════
     ANIMATIONS
     ═══════════════════════════════════════════════════════ */
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
