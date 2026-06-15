/**
 * stores.svelte.js
 * Store untuk menyimpan state UI secara global (tema, mode editor).
 */

export const editor = $state({
    isDarkTheme: true,
    mode: 'position',  // position | rotation | scale
    tool: 'select',    // select | pan
    showGrid: true,
    eraserMode: false,
    
    // Dimensi ruangan mockup
    roomWidth: 5,
    roomLength: 6,
    roomHeight: 3,

    // Catalog state
    activeCategory: null,
    isCatalogOpen: false
});

export const status = $state({
    message: 'Mockup studiocerdas UI Ready',
    objectCount: 0,
    fps: 60
});
