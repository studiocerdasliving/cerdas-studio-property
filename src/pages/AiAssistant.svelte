<script>
  import Layout from '../components/Layout.svelte'
  import { navigate  } from 'svelte-routing'
  import { url } from '../lib/url.svelte.js'
  import { apiFetch } from '../lib/api.js'

  // ── State ──────────────────────────────────────────────────────────────────
  /** @type {any[]} */
  let messages    = $state([
    {
      role: 'assistant',
      text: '👋 Halo! Saya adalah **AI Assistant Cerdas Living**. Saya bisa membantu Anda dengan:\n\n• 🏠 **Properti** — info, KPR, investasi\n• 🛋️ **Furnitur & Fashion** — rekomendasi produk\n• 📊 **Harga pasar** — Harga penjualan property',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
  ])
  let input       = $state('')
  let isLoading   = $state(false)
  let searchInput = $state('')
  let isSearching = $state(false)
  /** @type {HTMLElement | null} */
  let chatEl      = $state(null)
  /** @type {any} */
  let searchResult= $state(null)

  // ── Send chat ──────────────────────────────────────────────────────────────
  async function sendMessage() {
    const text = input.trim()
    if (!text || isLoading) return

    messages.push({ role: 'user', text, time: now() })
    input = ''
    isLoading = true
    scrollToBottom()

    try {
      const data = await apiFetch('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text, context: 'general' }),
      })

      if (data.success) {
        messages.push({ role: 'assistant', text: data.reply, time: now() })
      } else {
        messages.push({ role: 'assistant', text: '⚠️ Maaf, AI tidak dapat menjawab saat ini. Coba lagi sebentar.', time: now(), isError: true })
      }
    } catch {
      messages.push({ role: 'assistant', text: '⚠️ Koneksi gagal. Pastikan server aktif.', time: now(), isError: true })
    } finally {
      isLoading = false
      scrollToBottom()
    }
  }

  // ── Smart property search ──────────────────────────────────────────────────
  async function parseSearch() {
    const text = searchInput.trim()
    if (!text || isSearching) return

    isSearching = true
    searchResult = null

    try {
      const data = await apiFetch('/ai/parse-search', {
        method: 'POST',
        body: JSON.stringify({ query: text }),
      })
      if (data.success && data.filters) {
        searchResult = data.filters
        applySearch()
      }
    } catch {}
    finally {
      isSearching = false
    }
  }

  function applySearch() {
    if (!searchResult) return
    const params = new URLSearchParams()
    if (searchResult.keywords)     params.set('q', searchResult.keywords)
    if (searchResult.lokasi || searchResult.location) params.set('lokasi', searchResult.lokasi || searchResult.location)
    if (searchResult.harga_min)    params.set('harga_min', searchResult.harga_min)
    if (searchResult.harga_max)    params.set('harga_max', searchResult.harga_max)
    if (searchResult.kamar_tidur)  params.set('kamar_tidur', searchResult.kamar_tidur)
    if (searchResult.kategori)     params.set('kategori', searchResult.kategori)
    if (searchResult.tipe)         params.set('tipe', searchResult.tipe)
    window.location.href = url('/properti') + '?' + params.toString()
  }

  // ── Keyboard handler ───────────────────────────────────────────────────────
  /** @param {any} e */
  function onKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  /** @param {any} e */
  function onSearchKeydown(e) {
    if (e.key === 'Enter') parseSearch()
  }

  function scrollToBottom() {
    setTimeout(() => {
      if (chatEl) chatEl.scrollTop = chatEl.scrollHeight
    }, 50)
  }

  function now() {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  // ── Markdown-lite renderer ─────────────────────────────────────────────────
  /** @param {string} text */
  function renderMarkdown(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^• (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
  }

  const suggestions = [
    'Cara menghitung KPR dengan uang muka 20%',
    'Properti investasi terbaik di Depok',
    'Bagaimana tren properti tahun ini?',
  ]
</script>

<Layout title="AI Assistant — Cerdas Living">
  <div class="ai-page">

    <!-- HEADER HERO ──────────────────────────────────────────────────────── -->
    <div class="ai-hero">
      <div class="ai-hero-bg"></div>
      <div class="container" style="position:relative;text-align:center;padding:48px 0">
        <div class="section-label" style="color:rgba(201,168,76,0.7);justify-content:center">AI Powered</div>
        <h1 style="font-family:'Playfair Display',serif;font-size:2.4rem;font-weight:800;color:var(--white);margin-bottom:12px">
          Cerdas Living <span style="color:var(--gold)">AI Assistant</span>
        </h1>
        <p style="color:rgba(255,255,255,0.55);max-width:520px;margin:0 auto;font-size:0.95rem;line-height:1.7">
          Powered by Google Gemini — Tanya apa saja seputar properti, furnitur, fashion, dan investasi.
        </p>


      </div>
    </div>

    <div class="container" style="padding-top:32px;padding-bottom:64px">
      <div style="display:grid;grid-template-columns:1fr 360px;gap:32px;align-items:start">

        <!-- CHAT WINDOW ───────────────────────────────────────────────────── -->
        <div class="ai-chat-wrap">

          <!-- Messages -->
          <div class="ai-messages" bind:this={chatEl}>
            {#each messages as msg (msg.time + msg.role + msg.text.slice(0,10))}
              <div class="ai-msg {msg.role === 'user' ? 'ai-msg-user' : 'ai-msg-assistant'} {msg.isError ? 'ai-msg-error' : ''}">
                {#if msg.role === 'assistant'}
                  <div class="ai-avatar" style="overflow:hidden;background:transparent;">
                    <img src="/images/robot-chat.ico" alt="AI" style="width:100%;height:100%;object-fit:contain;transform:scale(1.2);" />
                  </div>
                {/if}
                <div class="ai-bubble">
                  <div class="ai-bubble-content">{@html renderMarkdown(msg.text)}</div>
                  <div class="ai-bubble-time">{msg.time}</div>
                </div>
                {#if msg.role === 'user'}
                  <div class="ai-avatar" style="background:var(--gold-light);color:#8B6914">👤</div>
                {/if}
              </div>
            {/each}

            {#if isLoading}
              <div class="ai-msg ai-msg-assistant">
                  <div class="ai-avatar" style="overflow:hidden;background:transparent;">
                    <img src="/images/robot-chat.ico" alt="AI" style="width:100%;height:100%;object-fit:contain;transform:scale(1.2);" />
                  </div>
                <div class="ai-bubble">
                  <div class="ai-typing">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            {/if}

            <!-- Suggestions (Moved inside messages container) -->
            {#if messages.length <= 1}
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
                {#each suggestions as s}
                  <button
                    class="ai-suggestion"
                    onclick={() => { input = s; sendMessage() }}
                  >{s}</button>
                {/each}
              </div>
            {/if}
          </div>

          <!-- Input area -->
          <div class="ai-input-wrap">
            <textarea
              class="ai-input"
              bind:value={input}
              onkeydown={onKeydown}
              placeholder="Tanya seputar properti, furnitur, atau investasi..."
              rows="2"
              disabled={isLoading}
            ></textarea>
            <button
              class="ai-send-btn {isLoading ? 'loading' : ''}"
              onclick={sendMessage}
              disabled={isLoading || !input.trim()}
            >
              {#if isLoading}
                <span class="spinner"></span>
              {:else}
                ➤
              {/if}
            </button>
          </div>
        </div>

        <!-- SIDEBAR ────────────────────────────────────────────────────────── -->
        <aside class="sticky-sidebar">

          <!-- Smart Property Search -->
          <div class="card" style="padding:24px;margin-bottom:20px">
            <div style="font-size:0.9rem;font-weight:700;color:var(--text-1);margin-bottom:6px">
              🔍 Pencarian AI Properti
            </div>
            <div style="font-size:0.78rem;color:var(--text-3);margin-bottom:14px">
              Ketik natural language, AI akan mengubahnya ke filter pencarian.
            </div>

            <div style="position:relative;margin-bottom:12px">
              <input
                class="form-input"
                bind:value={searchInput}
                onkeydown={onSearchKeydown}
                placeholder="Rumah 3 kamar di Depok harga max 1M..."
                style="padding-right:74px"
              />
              <button
                class="btn btn-gold {isSearching ? 'btn-loading' : ''}"
                onclick={parseSearch}
                disabled={isSearching}
                style="position:absolute;right:4px;top:4px;bottom:4px;padding:0 16px;font-size:0.8rem;font-weight:600; display:flex; align-items:center; gap:6px;"
              >
                {#if isSearching}
                  <span class="material-symbols-rounded ai-spin" style="font-size:1.1rem">autorenew</span> Mencari...
                {:else}
                  Cari
                {/if}
              </button>
            </div>
          </div>

          <!-- Fitur AI tersedia -->
          <div class="card" style="padding:24px;margin-bottom:20px">
            <div style="font-size:0.9rem;font-weight:700;color:var(--text-1);margin-bottom:14px">⚡ Fitur AI Tersedia</div>
            {#each [
              { icon: '🏠', label: 'Analisis Investasi Properti', desc: 'Skor, potensi kenaikan, rekomendasi' },
              { icon: '📍', label: 'Fasilitas Sekitar', desc: 'Sekolah, RS, transport, mall' },
              { icon: '📊', label: 'Harga Pasar', desc: 'Perbandingan harga rata-rata area' },
              { icon: '🛋️', label: 'Insight Produk', desc: 'Skor pasar, deskripsi, SEO otomatis' },
              { icon: '🔍', label: 'Smart Search Parser', desc: 'Natural language → filter' },
              { icon: '💬', label: 'Chat Assistant', desc: 'Tanya apapun seputar properti' },
            ] as feature}
              <div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-light)">
                <span style="font-size:1.1rem;flex-shrink:0">{feature.icon}</span>
                <div>
                  <div style="font-size:0.82rem;font-weight:600;color:var(--text-1)">{feature.label}</div>
                  <div style="font-size:0.72rem;color:var(--text-3)">{feature.desc}</div>
                </div>
              </div>
            {/each}
          </div>



        </aside>
      </div>
    </div>
  </div>
</Layout>

<style>
  /* Hero */
  .ai-page { min-height: 100vh; }
  .ai-hero { background: linear-gradient(135deg, var(--text-1) 0%, #2A241A 100%); position: relative; overflow: hidden; }
  .ai-hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 60% 80% at 70% 50%, rgba(201,168,76,0.08) 0%, transparent 60%); }

  /* Chat Window */
  .ai-chat-wrap { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius-xl); overflow: hidden; display: flex; flex-direction: column; min-height: 400px; max-height: 620px; box-shadow: var(--shadow-lg); }
  .ai-messages { flex: 1; overflow-y: auto; padding: 24px 20px; display: flex; flex-direction: column; gap: 16px; scroll-behavior: smooth; }
  .ai-messages::-webkit-scrollbar { width: 4px; }
  .ai-messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  /* Messages */
  .ai-msg { display: flex; gap: 10px; align-items: flex-end; }
  .ai-msg-user { flex-direction: row-reverse; }
  .ai-avatar { width: 32px; height: 32px; border-radius: 999px; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; background: var(--surface-2); }
  .ai-bubble { max-width: 75%; }
  .ai-bubble-content { padding: 12px 16px; border-radius: 18px; font-size: 0.88rem; line-height: 1.65; }
  .ai-msg-assistant .ai-bubble-content { background: var(--surface-2); color: var(--text-1); border-bottom-left-radius: 4px; }
  .ai-msg-user .ai-bubble-content { background: var(--text-1); color: rgba(255,255,255,0.9); border-bottom-right-radius: 4px; }
  .ai-msg-error .ai-bubble-content { background: #FFF3F3; color: var(--coral); }
  .ai-bubble-time { font-size: 0.65rem; color: var(--text-4); margin-top: 4px; text-align: right; }
  .ai-msg-assistant .ai-bubble-time { text-align: left; }

  /* Typing animation */
  .ai-typing { display: flex; gap: 4px; padding: 12px 16px; }
  .ai-typing span { width: 7px; height: 7px; border-radius: 999px; background: var(--text-3); animation: typing 1.4s infinite; }
  .ai-typing span:nth-child(2) { animation-delay: 0.2s; }
  .ai-typing span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typing { 0%,80%,100% { transform: scale(0.7); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }

  /* Suggestions */
  .ai-suggestion { padding: 6px 12px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface-2); font-size: 0.75rem; color: var(--text-2); cursor: pointer; transition: all 0.2s; text-align: left; }
  .ai-suggestion:hover { border-color: var(--gold); background: var(--gold-light); color: #8B6914; }

  /* Input */
  .ai-input-wrap { padding: 14px 16px; border-top: 1px solid var(--border); display: flex; gap: 10px; align-items: center; background: var(--surface-2); }
  .ai-input { flex: 1; resize: none; border: 1.5px solid var(--border); border-radius: var(--radius-lg); padding: 10px 14px; font-size: 0.9rem; font-family: inherit; outline: none; background: var(--white); color: var(--text-1); transition: border-color 0.2s; }
  .ai-input:focus { border-color: var(--gold); }
  .ai-send-btn { width: 44px; height: 44px; border-radius: var(--radius-lg); background: var(--text-1); color: var(--gold); border: none; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
  .ai-send-btn:hover:not(:disabled) { background: var(--gold); color: var(--text-1); }
  .ai-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .ai-send-btn.loading { background: var(--surface-3); }

  /* Spinner & Animations */
  .spinner { width: 16px; height: 16px; border: 2px solid transparent; border-top-color: var(--gold); border-radius: 999px; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .ai-spin { animation: spin 1s linear infinite; }
  .btn-loading { background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%) !important; color: white !important; border: none !important; cursor: wait !important; }

</style>
