<script>
  import Layout from '../../components/Layout.svelte'
  import { Link  } from 'svelte-routing'
  import { url } from '../../lib/url.svelte.js'
  import { apiFetch } from '../../lib/api.js'
  import { onMount } from 'svelte'

  let { slug = '' } = $props(); // Svelte-routing parameter

  /** @type {any} */
  let article = $state({ judul_berita: 'Loading...', isi: '', gambar: '', tanggal: '' })
  /** @type {any[]} */
  let latestArticles = $state([])
  let studiocerdasImgUrl = $state('')
  let isLoading = $state(true)

  onMount(async () => {
    try {
      const res = await apiFetch(`/berita/${slug}`);
      if (res.article) {
          article = res.article;
          latestArticles = res.latest_articles || res.latest || [];
      } else if (res.berita) {
          article = res.berita;
          latestArticles = res.latest_articles || res.latest || [];
      } else {
          article = res; 
      }
      studiocerdasImgUrl = res.studiocerdasImgUrl || 'http://localhost/studiocerdas/public';
    } catch (e) {
      console.error(e);
      article.judul_berita = 'Artikel Tidak Ditemukan';
    } finally {
      isLoading = false;
    }
  });

  /** @param {string} d */
  function formatDate(d) {
    if (!d) return ''
    const date = new Date(d)
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  /** @param {string} filename */
  function artikelImg(filename) {
    if (!filename) return ''
    const base = studiocerdasImgUrl || 'http://localhost/studiocerdas/public'
    return base + '/upload/image/' + filename
  }

  /** @param {string} html */
  function stripHtml(html) {
    if (!html) return ''
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim().substring(0, 150) + '...'
  }
</script>

<Layout 
  title={article.judul_berita}
  description={stripHtml(article.isi)}
  keywords={article.keywords || 'berita properti, artikel properti, cerdas living'}
  ogImage={article.gambar ? artikelImg(article.gambar) : ''}
  ogType="article"
>
  <div class="container" style="padding-top: 40px; padding-bottom: 80px;">
    <div class="content-wrapper">
      <Link to={url('/')} class="back-link">← Kembali ke Beranda</Link>
      <div class="article-meta">
        <span class="meta-date">{formatDate(article.tanggal)}</span>
        {#if article.hits}
          <span class="meta-divider">•</span>
          <span class="meta-views">👁 {article.hits} kali dibaca</span>
        {/if}
      </div>
      <h1 class="article-title">{article.judul_berita}</h1>
      
      {#if article.gambar}
        <div class="article-main-img-wrap">
          <img src={artikelImg(article.gambar)} alt={article.judul_berita} class="article-main-img" />
        </div>
      {/if}

      <div class="article-content">
        {@html article.isi}
      </div>
      
      <!-- Share / Footer Artikel -->
      <div class="article-footer">
        <div style="font-weight: 600; color: var(--text-1); margin-bottom: 12px;">Bagikan artikel ini:</div>
        <div style="display: flex; gap: 10px;">
          <button class="share-btn" onclick={() => navigator.clipboard.writeText(window.location.href).then(() => alert('Link disalin!'))}>
            🔗 Salin Tautan
          </button>
          <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.judul_berita + ' ' + window.location.href)}`} target="_blank" class="share-btn whatsapp">
            📱 WhatsApp
          </a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" class="share-btn facebook">
            📘 Facebook
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- Related Articles -->
  {#if latestArticles && latestArticles.length > 0}
    <section class="section" style="background:var(--cream);border-top:1px solid var(--border); padding-top: 60px; padding-bottom: 80px;">
      <div class="container" style="max-width: 1000px;">
        <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:36px">
          <div>
            <h2 class="article-title" style="margin-bottom: 8px; font-size: 2.5rem; color: var(--text-1); font-weight: 800;">Artikel Lainnya</h2>
            <div style="color: var(--text-2); font-size: 1.1rem;">Wawasan menarik lainnya untuk Anda</div>
          </div>
          <Link to={url('/berita')} style="color: var(--gold); font-weight: 600; text-decoration: none; padding-bottom: 6px;">
            Lihat Semua →
          </Link>
        </div>
        
        <div class="grid-3">
          {#each latestArticles as art}
            <Link to={url('/berita/' + art.slug_berita)} class="article-card">
              <div class="article-img-wrap">
                {#if art.gambar}
                  <img src={artikelImg(art.gambar)} alt={art.judul_berita} class="article-img" loading="lazy" />
                {:else}
                  <div class="article-img-placeholder">📰</div>
                {/if}
              </div>
              <div class="article-body">
                <div class="article-tag">
                  <span class="material-symbols-rounded" style="font-size: 16px;">menu_book</span> BERITA
                </div>
                <h3 class="card-title">{art.judul_berita}</h3>
              </div>
            </Link>
          {/each}
        </div>
      </div>
    </section>
  {/if}

</Layout>

<style>
  :global(.back-link) {
    display: inline-flex;
    align-items: center;
    color: var(--text-2);
    text-decoration: none;
    margin-bottom: 24px;
    font-size: 0.95rem;
    font-weight: 600;
    transition: color 0.2s;
  }
  :global(.back-link:hover) {
    color: var(--gold);
  }
  
  .article-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--text-3);
  }
  .meta-date { color: var(--gold); }
  .article-title {
    font-family: 'Playfair Display', serif;
    font-size: 3rem;
    font-weight: 800;
    color: var(--text-1);
    line-height: 1.2;
    margin: 0 0 32px 0;
  }
  @media (max-width: 768px) {
    .article-title { font-size: 2rem; }
  }

  .article-main-img-wrap {
    width: 100%;
    border-radius: var(--radius-lg);
    overflow: hidden;
    margin-bottom: 40px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  }
  .article-main-img {
    width: 100%;
    max-height: 500px;
    object-fit: cover;
    display: block;
  }

  .content-wrapper {
    background: var(--white);
    border-radius: var(--radius-xl);
    padding: 60px;
    box-shadow: var(--shadow-xl);
    max-width: 1000px;
    margin: 40px auto;
  }
  @media (max-width: 768px) {
    .content-wrapper { padding: 30px 20px; border-radius: var(--radius-lg); }
  }

  .article-content {
    font-size: 1.1rem;
    line-height: 1.8;
    color: var(--text-2);
  }
  
  /* Styling HTML content from CKEditor/TinyMCE */
  :global(.article-content h2, .article-content h3, .article-content h4) {
    color: var(--text-1);
    font-family: 'Playfair Display', serif;
    margin: 40px 0 20px;
    font-weight: 700;
  }
  :global(.article-content h2) { font-size: 2rem; }
  :global(.article-content h3) { font-size: 1.6rem; }
  :global(.article-content p) { margin-bottom: 24px; }
  :global(.article-content img) {
    max-width: 100%;
    height: auto;
    border-radius: var(--radius);
    margin: 20px 0;
  }
  :global(.article-content ul, .article-content ol) { margin-bottom: 24px; padding-left: 20px; }
  :global(.article-content li) { margin-bottom: 10px; }
  :global(.article-content blockquote) {
    border-left: 4px solid var(--gold);
    padding: 20px 30px;
    background: var(--surface);
    margin: 30px 0;
    font-style: italic;
    font-size: 1.2rem;
    color: var(--text-1);
    border-radius: 0 var(--radius) var(--radius) 0;
  }

  .article-footer {
    margin-top: 60px;
    padding-top: 30px;
    border-top: 1px solid var(--border);
  }
  .share-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text-2);
    font-size: 0.85rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s;
  }
  .share-btn:hover { background: var(--surface-2); color: var(--text-1); }
  .share-btn.whatsapp { color: #25D366; border-color: rgba(37, 211, 102, 0.3); }
  .share-btn.whatsapp:hover { background: rgba(37, 211, 102, 0.1); }
  .share-btn.facebook { color: #1877F2; border-color: rgba(24, 119, 242, 0.3); }
  .share-btn.facebook:hover { background: rgba(24, 119, 242, 0.1); }

  /* Related Articles Grid */
  .grid-3 {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 30px;
  }
  :global(.article-card) {
    display: block;
    text-decoration: none;
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  }
  :global(.article-card:hover) {
    box-shadow: var(--shadow-xl);
    transform: translateY(-4px);
    border-color: transparent;
  }
  .article-img-wrap { overflow: hidden; position: relative; }
  .article-img { width: 100%; aspect-ratio: 2/1; object-fit: cover; display: block; transition: transform 0.4s ease; }
  :global(.article-card:hover .article-img) { transform: scale(1.04); }
  .article-img-placeholder {
    width: 100%; aspect-ratio: 2/1;
    background: linear-gradient(145deg,var(--surface-2),var(--surface-3));
    display: flex; align-items: center; justify-content: center; font-size: 3rem;
  }
  .article-body { padding: 24px; }
  .article-tag { font-size: 0.75rem; color: var(--gold); font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
  .card-title { font-size: 1.15rem; font-weight: 700; color: var(--text-1); line-height: 1.4; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
