<script>
    import Layout from "../components/Layout.svelte";
    import { Link, navigate } from "svelte-routing";
    import { apiFetch } from "../lib/api.js";
    import { onMount } from "svelte";
    import { url, propertyImg } from "../lib/url.svelte.js";
    import { fly, fade, scale } from "svelte/transition";

    const aiCards = [
        {
            title: "Potensi Investasi",
            value: "Tinggi",
            desc: "ROI 12-18% / tahun",
            type: "chart",
        },
        {
            title: "Trend Harga",
            value: "↑ 8.2%",
            desc: "Kenaikan 12 Bulan",
            type: "stars",
        },
        {
            title: "Risiko Banjir",
            value: "Rendah",
            desc: "Aman untuk Investasi",
            type: "sparkle",
        },
        {
            title: "Akses & Fasilitas",
            value: "Sangat Baik",
            desc: "15 Fasilitas Terdekat",
            type: "radar",
        },
    ];

    /** @type {any[]} */
    let premiumProperties = $state([]);
    /** @type {any[]} */
    let popularProperties = $state([]);
    /** @type {any[]} */
    let topRatedProperties = $state([]);
    /** @type {any[]} */
    let aiRecommendedProperties = $state([]);

    /** @type {any[]} */
    let featuredProducts = $state([]);
    let stats = $state({});
    let studiocerdasImgUrl = $state("");
    /** @type {any[]} */
    let articles = $state([]);

    let searchQuery = $state("");
    let isAiLoading = $state(false);
    let activeTab = $state("property");
    let activePropertyTab = $state("premium");

    let activeProperties = $derived(
        activePropertyTab === 'premium' ? premiumProperties :
        activePropertyTab === 'popular' ? popularProperties :
        activePropertyTab === 'top_rated' ? topRatedProperties :
        aiRecommendedProperties
    );

    /** @type {HTMLElement} */
    let eksplorasiScroll;

    /** @param {'left'|'right'} direction */
    function scrollEksplorasi(direction) {
        if (eksplorasiScroll) {
            const scrollAmount = 300;
            if (direction === 'left') {
                eksplorasiScroll.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                eksplorasiScroll.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    }

    onMount(async () => {
        try {
            const res = await apiFetch("/home-data"); // Map to Rust endpoint
            premiumProperties = res.premiumProperties || [];
            popularProperties = res.popularProperties || [];
            topRatedProperties = res.topRatedProperties || [];
            aiRecommendedProperties = res.aiRecommendedProperties || [];
            featuredProducts = res.featuredProducts || [];
            stats = res.stats || {};
            studiocerdasImgUrl = res.studiocerdasImgUrl || "";
            articles = res.articles || [];
        } catch (e) {
            console.error("Gagal memuat data beranda", e);
        }
    });

    async function handleAiSearch() {
        if (!searchQuery.trim()) return;
        isAiLoading = true;
        try {
            const res = await apiFetch("/ai/parse-search", {
                method: "POST",
                body: JSON.stringify({ query: searchQuery }),
            });
            
            const params = new URLSearchParams();
            
            if (res.filters && Object.keys(res.filters).length > 0) {
                if (res.filters.keywords) params.set("q", res.filters.keywords);
                if (res.filters.lokasi) params.set("lokasi", res.filters.lokasi);
                if (res.filters.kategori) params.set("kategori", res.filters.kategori);
                if (res.filters.harga_min) params.set("harga_min", res.filters.harga_min);
                if (res.filters.harga_max) params.set("harga_max", res.filters.harga_max);
                if (res.filters.kamar_tidur) params.set("kamar_tidur", res.filters.kamar_tidur);
                if (res.filters.kamar_mandi) params.set("kamar_mandi", res.filters.kamar_mandi);
                if (res.filters.lt_min) params.set("lt_min", res.filters.lt_min);
                if (res.filters.lt_max) params.set("lt_max", res.filters.lt_max);
                if (res.filters.lb_min) params.set("lb_min", res.filters.lb_min);
                if (res.filters.lb_max) params.set("lb_max", res.filters.lb_max);
                if (res.filters.surat) params.set("surat", res.filters.surat);
            } else {
                params.set("q", searchQuery);
            }
            navigate(url(`/properti?${params.toString()}`));
        } catch (e) {
            console.error(e);
            navigate(url(`/properti?q=${encodeURIComponent(searchQuery)}`));
        } finally {
            isAiLoading = false;
        }
    }

    /** @param {number} h */
    function formatHargaProduk(h) {
        if (!h) return "Harga Negosiasi";
        if (h >= 1_000_000_000)
            return (
                "Rp " +
                (h / 1_000_000_000).toFixed(2).replace(".00", "") +
                " Miliar"
            );
        if (h >= 1_000_000) return "Rp " + Math.round(h / 1_000_000) + " Juta";
        return "Rp " + Number(h).toLocaleString("id-ID");
    }

    /** @param {string} filename */
    function artikelImg(filename) {
        if (!filename) return "";
        const base = studiocerdasImgUrl || "";
        return base + "/upload/image/" + filename;
    }

    /** @param {string} filename */
    function promoImg(filename) {
        if (!filename) return "";
        const base = studiocerdasImgUrl || "";
        return base + "/upload/image/" + filename;
    }

    /** @param {string} d */
    function formatDate(d) {
        if (!d) return "";
        const date = new Date(d);
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    }

    /** @param {string} html */
    function stripHtml(html) {
        if (!html) return "";
        return (
            html
                .replace(/<[^>]*>/g, "")
                .replace(/&[^;]+;/g, " ")
                .trim()
                .substring(0, 120) + "..."
        );
    }
</script>

<Layout
    title="Beranda"
    description="Cerdas Living – Platform Properti & Bangun Hunian Impian."
>
    <!-- ===================== SECTION 1: HERO ===================== -->
    <section
        class="hero-section"
        style="background-image: url('{url('/images/hero-bg-new.jpg')}')"
    >
        <div class="hero-inner">
            <div class="container">
                <div class="hero-split">
                    <div class="hero-left">
                        <h1 class="hero-h1">
                            Platform Properti &<br />Bangun Hunian Impian
                        </h1>
                        <div class="hero-subtitle">
                            CerdasLiving Smart Property, Better Living
                        </div>
                        <p class="hero-desc">
                            Cari properti terbaik, dapatkan AI Insight, desain
                            bangunan Impian Anda dan wujudkan dengan mudah dalam
                            satu platform.
                        </p>
                    </div>
                </div>

                <!-- Search Bar -->
                <div class="search-area">
                    <div class="search-input-wrapper">
                        <div class="search-mode-indicator">
                            <div class="tab-icon">
                                <span class="material-symbols-rounded"
                                    >location_on</span
                                >
                            </div>
                            <div class="tab-text">
                                <b>AI Property Search</b>
                            </div>
                        </div>
                        <input
                            type="text"
                            class="search-input {isAiLoading ? 'ai-loading' : ''}"
                            bind:value={searchQuery}
                            onkeydown={(e) => { if (e.key === 'Enter') handleAiSearch() }}
                            placeholder={isAiLoading ? "✨ AI sedang mencari..., mohon ditunggu!" : "Coba ketik: \"Rumah 3 kamar dekat stasiun dengan budget 1.5 M\""}
                            disabled={isAiLoading}
                        />
                        <button
                            class="search-btn {isAiLoading ? 'btn-loading' : ''}"
                            onclick={handleAiSearch}
                            disabled={isAiLoading}
                        >
                            {#if isAiLoading}
                                <span class="material-symbols-rounded ai-spin">autorenew</span>
                                ✨ AI sedang mencari..., mohon ditunggu!
                            {:else}
                                <span class="material-symbols-rounded">search</span>
                                Cari
                            {/if}
                        </button>
                    </div>
                </div>

                <!-- Feature Pills -->
                <div
                    class="hero-pills"
                    style="margin-top: 32px; margin-bottom: 32px;"
                >
                    <div class="hero-pill">
                        <div class="pill-icon c-purple">
                            <span class="material-symbols-rounded"
                                >insights</span
                            >
                        </div>
                        <div>
                            <b>AI Insight</b><span>Analisa Properti</span>
                        </div>
                    </div>
                    <div class="hero-pill">
                        <div class="pill-icon c-orange">
                            <span class="material-symbols-rounded">map</span>
                        </div>
                        <div>
                            <b>Fasilitas Sekitar</b><span
                                >Cek Lokasi & Fasilitas</span
                            >
                        </div>
                    </div>
                    <div class="hero-pill">
                        <div class="pill-icon c-yellow">
                            <span class="material-symbols-rounded">explore</span
                            >
                        </div>
                        <div>
                            <b>Peta Lokasi</b><span>Peta Interaktif</span>
                        </div>
                    </div>
                    <div class="hero-pill">
                        <div class="pill-icon c-purple">
                            <span class="material-symbols-rounded"
                                >calculate</span
                            >
                        </div>
                        <div>
                            <b>Kalkulator KPR</b><span>Simulasi Cicilan</span>
                        </div>
                    </div>
                    <div class="hero-pill">
                        <div class="pill-icon c-orange">
                            <span class="material-symbols-rounded"
                                >architecture</span
                            >
                        </div>
                        <div>
                            <b>Studio Design</b><span>Desain & RAB AI</span>
                        </div>
                    </div>
                    <div class="hero-pill">
                        <div class="pill-icon c-blue">
                            <span class="material-symbols-rounded"
                                >request_quote</span
                            >
                        </div>
                        <div>
                            <b>Estimasi Biaya</b><span>Hitung Biaya Bangun</span
                            >
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- ===================== PROMOSI DIHAPUS SESUAI PERMINTAAN ===================== -->

    <!-- ===================== SECTION 2: AI INSIGHT ===================== -->
    <section class="ai-insight-section">
        <!-- Decorative background blobs for glassmorphism contrast -->
        <div class="glass-blob blob-1"></div>
        <div class="glass-blob blob-2"></div>

        <div class="container relative-z">
            <div class="ai-insight-inner">
                <div class="ai-insight-left">
                    <h2>Sistem Analisa Cerdas<br />Berbasis AI</h2>
                    <p>
                        Dapatkan analisa mendalam tentang harga, potensi
                        investasi, risiko, dan fasilitas di sekitar properti
                        pilihan Anda.
                    </p>
                </div>
                <div class="ai-cards-row">
                    {#each aiCards as card, i}
                        <div
                            class="ai-card"
                            in:scale={{ delay: i * 100, duration: 500 }}
                        >
                            <!-- glow -->
                            <div class="ai-card-glow"></div>

                            <div class="relative-z">
                                <div class="ai-card-label">{card.title}</div>
                                <div class="ai-card-value">{card.value}</div>
                                <div class="ai-card-sub">{card.desc}</div>
                            </div>

                            <!-- SVG Decorations -->
                            <div class="ai-card-svg-deco">
                                {#if card.type === "chart"}
                                    <svg width="90" height="60">
                                        <polyline
                                            fill="none"
                                            stroke="#b8a8d0"
                                            stroke-width="2"
                                            points="5,50 20,38 35,42 50,20 70,30 85,8"
                                        />
                                        <line
                                            x1="85"
                                            y1="8"
                                            x2="78"
                                            y2="12"
                                            stroke="#b8a8d0"
                                        />
                                        <line
                                            x1="85"
                                            y1="8"
                                            x2="81"
                                            y2="17"
                                            stroke="#b8a8d0"
                                        />
                                    </svg>
                                {:else if card.type === "stars"}
                                    <svg width="90" height="60">
                                        <circle
                                            cx="20"
                                            cy="30"
                                            r="2"
                                            fill="#b8a8d0"
                                        />
                                        <circle
                                            cx="55"
                                            cy="20"
                                            r="3"
                                            fill="#b8a8d0"
                                        />
                                        <circle
                                            cx="75"
                                            cy="42"
                                            r="2"
                                            fill="#b8a8d0"
                                        />
                                        <path
                                            d="M50 10 L53 17 L60 20 L53 23 L50 30 L47 23 L40 20 L47 17 Z"
                                            fill="#c4b5dc"
                                        />
                                    </svg>
                                {:else if card.type === "sparkle"}
                                    <svg width="90" height="60">
                                        <circle
                                            cx="20"
                                            cy="15"
                                            r="4"
                                            fill="#d9d0e8"
                                        />
                                        <circle
                                            cx="55"
                                            cy="25"
                                            r="3"
                                            fill="#d9d0e8"
                                        />
                                        <circle
                                            cx="75"
                                            cy="12"
                                            r="5"
                                            fill="#d9d0e8"
                                        />
                                        <line
                                            x1="20"
                                            y1="5"
                                            x2="20"
                                            y2="25"
                                            stroke="#d9d0e8"
                                        />
                                        <line
                                            x1="10"
                                            y1="15"
                                            x2="30"
                                            y2="15"
                                            stroke="#d9d0e8"
                                        />
                                    </svg>
                                {:else}
                                    <svg width="90" height="90">
                                        <circle
                                            cx="45"
                                            cy="45"
                                            r="30"
                                            fill="none"
                                            stroke="#c4b5dc"
                                        />
                                        <circle
                                            cx="45"
                                            cy="45"
                                            r="20"
                                            fill="none"
                                            stroke="#c4b5dc"
                                        />
                                        <circle
                                            cx="45"
                                            cy="45"
                                            r="10"
                                            fill="none"
                                            stroke="#c4b5dc"
                                        />
                                        <line
                                            x1="45"
                                            y1="0"
                                            x2="45"
                                            y2="90"
                                            stroke="#c4b5dc"
                                        />
                                        <line
                                            x1="0"
                                            y1="45"
                                            x2="90"
                                            y2="45"
                                            stroke="#c4b5dc"
                                        />
                                    </svg>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </section>

    <!-- ===================== SECTION 3: STUDIO DESIGN ===================== -->
    <section class="studio-section">
        <div class="container">
            <div class="studio-inner">
                <div class="studio-left">
                    <h2>Bangun & Desain Hunian Impian dengan AI</h2>
                    <p>
                        Gunakan AI untuk mendesain, menghitung biaya, hingga
                        menampilkan bangunan Impian Anda.
                    </p>
                    <a href={url("/studio/login")} class="studio-cta-btn"
                        >Mulai Studio Design →</a
                    >
                </div>
                <div class="studio-cards-wrapper">
                    <div class="studio-cards">
                        <div class="studio-card">
                            <div
                                class="studio-card-img"
                                style="background-image: url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&auto=format&fit=crop')"
                            ></div>
                            <div class="studio-card-label">
                                <b>AI Architecture</b><span
                                    >Desain Arsitektur</span
                                >
                            </div>
                        </div>
                        <div class="studio-card">
                            <div
                                class="studio-card-img"
                                style="background-image: url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&auto=format&fit=crop')"
                            ></div>
                            <div class="studio-card-label">
                                <b>AI Interior</b><span>Desain Interior</span>
                            </div>
                        </div>
                        <div class="studio-card">
                            <div
                                class="studio-card-img"
                                style="background-image: url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&auto=format&fit=crop')"
                            ></div>
                            <div class="studio-card-label">
                                <b>AI Floorplan</b><span>Denah Otomatis</span>
                            </div>
                        </div>
                        <div class="studio-card">
                            <div
                                class="studio-card-img"
                                style="background-image: url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop')"
                            ></div>
                            <div class="studio-card-label">
                                <b>AI Landscape</b><span>Desain Lanskap</span>
                            </div>
                        </div>
                        <div class="studio-card rab">
                            <div class="studio-card-img rab-bg">
                                <div class="rab-header">RAB ESTIMASI</div>
                                <div class="rab-pagination">1/3</div>
                                <table class="rab-tbl">
                                    <tbody>
                                        <tr
                                            ><td>Pekerjaan Persiapan</td><td
                                                >13 Jt</td
                                            ></tr
                                        >
                                        <tr
                                            ><td>Pekerjaan Struktur</td><td
                                                >120 Jt</td
                                            ></tr
                                        >
                                        <tr
                                            ><td>Pekerjaan MEP</td><td>15 Jt</td
                                            ></tr
                                        >
                                        <tr
                                            ><td>Pekerjaan Atap</td><td
                                                >45 Jt</td
                                            ></tr
                                        >
                                        <tr class="rab-total"
                                            ><td>Total</td><td
                                                >Rp 1.217.000.000</td
                                            ></tr
                                        >
                                    </tbody>
                                </table>
                                <button class="rab-btn">Lihat Rincian</button>
                            </div>
                            <div class="studio-card-label">
                                <b>RAB & Estimasi</b><span
                                    >Hitung Biaya Bangun</span
                                >
                            </div>
                        </div>
                    </div>
                    <button class="studio-scroll-btn"
                        ><span class="material-symbols-rounded"
                            >chevron_right</span
                        ></button
                    >
                </div>
            </div>
        </div>
    </section>

    <!-- ===================== SECTION 4: PROPERTI TABS ===================== -->
    <section class="prop-section" style="background: #fff;">
        <div class="container">
            <div class="section-hdr" style="flex-direction: column; align-items: flex-start; gap: 16px;">
                <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                    <h2>
                        <span class="material-symbols-rounded">real_estate_agent</span>
                        Eksplorasi Properti <span class="star">✦</span>
                    </h2>
                    <Link to={url("/properti")} class="hdr-link">Lihat Semua Properti →</Link>
                </div>
                
                <!-- TABS -->
                <div class="prop-tabs" style="display:flex; gap:12px; overflow-x:auto; padding-bottom:8px; width:100%; scrollbar-width:none;">
                    <button class="prop-tab {activePropertyTab === 'premium' ? 'active' : ''}" onclick={() => activePropertyTab = 'premium'}>🏆 Premium</button>
                    <button class="prop-tab {activePropertyTab === 'top_rated' ? 'active' : ''}" onclick={() => activePropertyTab = 'top_rated'}>⭐ Rating Terbaik</button>
                    <button class="prop-tab {activePropertyTab === 'popular' ? 'active' : ''}" onclick={() => activePropertyTab = 'popular'}>🔥 Paling Diminati</button>
                    <button class="prop-tab {activePropertyTab === 'ai' ? 'active' : ''}" onclick={() => activePropertyTab = 'ai'}>🤖 Rekomendasi AI</button>
                </div>
            </div>
            
            <div style="position: relative;">
                <button class="slider-arrow left" aria-label="Geser Kiri" onclick={() => scrollEksplorasi('left')}>
                    <span class="material-symbols-rounded">chevron_left</span>
                </button>
                <div class="prop-grid-scroll" bind:this={eksplorasiScroll}>
                    {#if activeProperties?.length}
                    {#each activeProperties.slice(0, 8) as p}
                        <Link
                            to={url("/properti/" + p.slug_property)}
                            class="prop-card"
                        >
                            <div class="prop-img-wrap">
                                <img
                                    src={propertyImg(p.cover_img)}
                                    alt={p.nama_property}
                                    class="prop-img"
                                />
                                <div class="prop-badges-row">
                                    {#if p.tipe}<span
                                            class="pbadge {p.tipe?.toLowerCase().includes('jual')
                                                ? 'jual'
                                                : 'sewa'}">{p.tipe.toUpperCase()}</span
                                        >{/if}
                                    {#if p.kategori}<span class="pbadge kat"
                                            >{p.kategori}</span
                                        >{/if}
                                    {#if activePropertyTab === 'popular'}<span class="pbadge kat"><span class="material-symbols-rounded" style="font-size:12px; margin-right:2px;">local_fire_department</span>Populer</span>{/if}
                                    {#if activePropertyTab === 'ai'}<span class="pbadge" style="background:#6366f1; color:white;"><span class="material-symbols-rounded" style="font-size:12px; margin-right:2px;">auto_awesome</span>Skor AI: {p.score_investasi_ai || 0}</span>{/if}
                                </div>
                            </div>
                            <div class="prop-body">
                                <div class="prop-price">
                                    {formatHargaProduk(p.harga)}
                                </div>
                                <div class="prop-title">
                                    {p.nama_property || "Properti"}
                                </div>
                                <div class="prop-loc">
                                    <span class="material-symbols-rounded"
                                        >location_on</span
                                    >{p.nama_kabupaten ||
                                        ""}{p.nama_kabupaten && p.nama_provinsi
                                        ? ", "
                                        : ""}{p.nama_provinsi || ""}
                                </div>
                                <div class="prop-specs">
                                    <span
                                        ><span class="material-symbols-rounded"
                                            >bed</span
                                        >{p.kamar_tidur || "-"}</span
                                    >
                                    <span
                                        ><span class="material-symbols-rounded"
                                            >shower</span
                                        >{p.kamar_mandi || "-"}</span
                                    >
                                    <span
                                        ><span class="material-symbols-rounded"
                                            >straighten</span
                                        >{p.lb || "-"} m²</span
                                    >
                                </div>
                                <!-- Agent Info & WA -->
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px; padding-top:12px; border-top:1px solid var(--border-light);">
                                    <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:0;">
                                        <img src={p.gambar_staff ? ((studiocerdasImgUrl || '') + '/upload/staff/' + p.gambar_staff) : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nama_staff || 'AGENT')}&background=C9A84C&color=fff&size=56`} alt="Agent" style="width:28px; height:28px; border-radius:50%; object-fit:cover; flex-shrink:0;">
                                        <div style="line-height:1.2; min-width:0; flex:1;">
                                            <div style="font-size:0.75rem; font-weight:700; color:var(--text-1); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title={p.nama_staff || "AGENT"}>{p.nama_staff || "AGENT"}</div>
                                            <div style="font-size:0.6rem; color:var(--text-3); font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">INDEPENDENT AGENT</div>
                                        </div>
                                    </div>
                                    <div style="display:flex; gap:6px; flex-shrink:0; margin-left:8px;">
                                        <button style="width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; background:#25D366; border:none; cursor:pointer;" title="WhatsApp" aria-label="WhatsApp" onclick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(`https://wa.me/${(p.telepon_staff || '628123456789').replace(/\D/g,'')}?text=${encodeURIComponent('Halo, saya tertarik dengan properti: ' + p.nama_property)}`, '_blank'); }}>
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.662-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    {/each}
                {:else}
                    <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background: #fff; border-radius: 16px; border: 1px solid var(--border);">
                        <div style="font-size: 2.5rem; margin-bottom: 12px;">🏠</div>
                        <h3 style="font-size: 1.1rem; color: var(--text-1); margin-bottom: 8px;">Belum Ada Properti</h3>
                        <p style="font-size: 0.9rem; color: var(--text-3);">Properti akan segera hadir di kategori ini.</p>
                    </div>
                {/if}
                </div>
                <button class="slider-arrow right" aria-label="Geser Kanan" onclick={() => scrollEksplorasi('right')}>
                    <span class="material-symbols-rounded">chevron_right</span>
                </button>
            </div>
        </div>
    </section>


    <!-- ===================== SECTION 5: ECOSYSTEM BANNER ===================== -->
    <section class="eco-section">
        <div class="container">
            <div class="eco-card">
                <div class="eco-title">
                    Semua Kebutuhan Properti <span class="eco-arrow">›</span><br
                    /><span class="eco-title-sub">dalam Satu Ekosistem ✨</span>
                </div>
                <div class="eco-items">
                    <div class="eco-item">
                        <span class="material-symbols-rounded">search</span><b
                            >Cari Properti</b
                        ><span>Tepat & Mudah</span>
                    </div>
                    <div class="eco-item">
                        <span class="material-symbols-rounded">insights</span><b
                            >Analisa AI</b
                        ><span>Cepat & Akurat</span>
                    </div>
                    <div class="eco-item">
                        <span class="material-symbols-rounded"
                            >architecture</span
                        ><b>Desain & Bangun</b><span>dengan AI</span>
                    </div>
                    <div class="eco-item">
                        <span class="material-symbols-rounded">calculate</span
                        ><b>Hitung KPR</b><span>Simulasi Instan</span>
                    </div>
                    <div class="eco-item">
                        <span class="material-symbols-rounded"
                            >support_agent</span
                        ><b>Hubungi Agen</b><span>Profesional</span>
                    </div>
                    <div class="eco-item">
                        <span class="material-symbols-rounded"
                            >emoji_events</span
                        ><b>Wujudkan</b><span>Hunian Impian</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- ===================== SECTION 6: AI PROPERTY ASSISTANT ===================== -->
    <section class="ai-assistant-section">
        <div class="ai-assistant-inner">
            <div class="robot-col">
                <img
                    src={url("/images/ai-floating-icon.png")}
                    alt="AI Property Assistant"
                    class="robot-img-new"
                />
            </div>
            <div class="assistant-content">
                <h2>AI Property Assistant</h2>
                <p>
                    Saya siap memberikan analisis investasi yang akurat dan
                    menjawab semua pertanyaan Anda. "Tanyakan Kapan Saja Untuk
                    Wawasan Langsung!"
                </p>
            </div>
            <div class="question-container">
                <button class="question-chip"
                    ><span
                        class="material-symbols-rounded"
                        style="font-size:1rem;margin-right:4px;vertical-align:middle;color:var(--text-3);"
                        >auto_awesome</span
                    > Apakah rumah ini layak investasi?</button
                >
                <button class="question-chip"
                    ><span
                        class="material-symbols-rounded"
                        style="font-size:1rem;margin-right:4px;vertical-align:middle;color:var(--text-3);"
                        >auto_awesome</span
                    > Berapa estimasi biaya renovasi?</button
                >
                <button class="question-chip"
                    ><span
                        class="material-symbols-rounded"
                        style="font-size:1rem;margin-right:4px;vertical-align:middle;color:var(--text-3);"
                        >auto_awesome</span
                    > Berapa cicilan KPR jika DP 20%?</button
                >
                <button class="question-chip"
                    ><span
                        class="material-symbols-rounded"
                        style="font-size:1rem;margin-right:4px;vertical-align:middle;color:var(--text-3);"
                        >auto_awesome</span
                    > Desain ulang rumah ini menjadi modern minimalis</button
                >
            </div>
            <div class="assistant-action">
                <Link to={url("/ai/assistant")} class="chat-button">
                    Mulai Chat AI
                    <span
                        class="material-symbols-rounded"
                        style="font-size:1.2rem;">arrow_forward</span
                    >
                </Link>
            </div>
        </div>
    </section>

    <!-- ===================== SECTION 7: BERITA & ARTIKEL ===================== -->
    <section class="berita-section">
        <div class="container">
            <div class="section-hdr">
                <h2>📰 Berita & Artikel</h2>
            </div>
            {#if articles?.length}
                <div class="berita-grid">
                    {#each articles.slice(0, 3) as art}
                        <Link
                            to={url("/berita/" + (art.slug_berita || ""))}
                            class="berita-card"
                        >
                            <div class="berita-img-wrap">
                                {#if art.gambar}
                                    <img
                                        src={artikelImg(art.gambar)}
                                        alt={art.judul_berita}
                                        class="berita-img"
                                    />
                                {:else}
                                    <div class="berita-img-ph">
                                        <span class="material-symbols-rounded"
                                            >article</span
                                        >
                                    </div>
                                {/if}
                            </div>
                            <div class="berita-body">
                                {#if art.tanggal}<div class="berita-date">
                                        {formatDate(art.tanggal)}
                                    </div>{/if}
                                <div class="berita-title">
                                    {art.judul_berita || "Artikel"}
                                </div>
                                <div class="berita-excerpt">
                                    {stripHtml(art.isi || "")}
                                </div>
                            </div>
                        </Link>
                    {/each}
                </div>
            {:else}
                <div class="berita-empty">
                    <span class="material-symbols-rounded">newspaper</span>
                    <p>Belum ada artikel. Nantikan berita & artikel terbaru.</p>
                </div>
            {/if}
        </div>
    </section>

</Layout>

<style>
    /* ===================== GLOBAL / ROOT ===================== */
    :global(:root) {
        --gold: #c9a84c;
        --gold-hover: #b8932f;
        --text-1: #1a1611;
        --text-2: #5c5347;
        --text-3: #9c9080;
        --text-4: #c4baa8;
        --border: #e8e4da;
        --border-light: #f0ede6;
        --surface: #fafafa;
        --surface-2: #f5f3ef;
    }

    :global(body) {
        background: #fafafa;
        font-family: "Inter", sans-serif;
        color: var(--text-1);
    }

    .container {
        max-width: 1280px;
        margin: 0 auto;
        padding: 0 24px;
    }



    /* ===================== SECTION 1: HERO ===================== */
    .hero-section {
        background: #f8f6f0;
        background-size: cover;
        background-position: right center;
        background-repeat: no-repeat;
        padding: 32px 0 0;
        position: relative;
        overflow: hidden;
    }
    .hero-section::before {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(
            90deg,
            #f8f6f0 0%,
            rgba(239, 231, 221, 0.85) 30%,
            rgba(255, 255, 255, 0) 65%
        );
        z-index: 1;
    }
    .hero-section::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 80px;
        background: linear-gradient(
            to top,
            #efe7dd 0%,
            rgba(239, 231, 221, 0) 100%
        );
        z-index: 1;
    }

    .hero-inner {
        position: relative;
        z-index: 2;
    }

    .hero-split {
        display: flex;
        align-items: flex-start;
        padding-bottom: 24px;
    }

    .hero-left {
        flex: 0 0 55%;
        max-width: 55%;
        padding-top: 10px;
    }

    .hero-h1 {
        font-family: "Playfair Display", serif;
        font-size: clamp(2.2rem, 3.5vw, 3.1rem);
        font-weight: 900;
        line-height: 1.1;
        color: #1a1611;
        margin-bottom: 8px;
    }

    .hero-subtitle {
        font-family: "Inter", sans-serif;
        font-size: clamp(1rem, 1.5vw, 1.2rem);
        font-weight: 600;
        color: rgba(100, 85, 70, 0.55);
        margin-bottom: 14px;
        letter-spacing: 0.5px;
        animation: slideUpFade 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes slideUpFade {
        0% {
            opacity: 0;
            transform: translateY(15px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .hero-desc {
        font-size: 0.9rem;
        color: var(--text-2);
        line-height: 1.6;
        margin-bottom: 24px;
        max-width: 480px;
    }

    /* SEARCH BOX */
    .search-area {
        display: flex;
        gap: 16px;
        align-items: stretch;
        margin-bottom: 0;
        max-width: 720px;
        position: relative;
        z-index: 5;
    }

    .search-input-wrapper {
        flex: 1;
        display: flex;
        align-items: center;
        background: #f4f1eb;
        border-radius: 99px;
        padding: 6px;
        box-shadow: 0 4px 12px rgba(26, 22, 17, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.8);
    }

    .search-mode-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 16px 6px 6px;
        background: #fff;
        border-radius: 99px;
        margin-right: 12px;
    }

    .tab-icon {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-2);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        flex-shrink: 0;
    }

    .tab-icon .material-symbols-rounded {
        font-size: 1rem;
    }

    .tab-text b {
        display: block;
        font-size: 0.9rem;
        color: var(--text-1);
        font-weight: 700;
        white-space: nowrap;
    }

    .search-input {
        flex: 1;
        border: none;
        outline: none;
        font-size: 0.9rem;
        color: var(--text-1);
        font-family: "Inter", sans-serif;
        background: transparent;
        padding: 10px 0;
    }

    .search-input::placeholder {
        color: var(--text-4, #c4baa8);
    }

    .search-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 24px;
        background: #e4dccf;
        color: var(--text-1);
        border: none;
        border-radius: 99px;
        font-size: 0.9rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
        margin-left: 12px;
    }

    .search-btn:hover {
        background: #d5cbb9;
    }

    .search-btn .material-symbols-rounded {
        font-size: 1.1rem;
    }

    .hero-pills {
        display: flex;
        gap: 0;
        border: 1px solid var(--border);
        border-radius: 16px;
        background: #fff;
        overflow: hidden;
        margin-bottom: 0;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        position: relative;
        z-index: 5;
    }

    .hero-pill {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 14px;
        border-right: 1px solid var(--border);
        cursor: pointer;
        transition: background 0.2s;
    }

    .hero-pill:last-child {
        border-right: none;
    }

    .hero-pill:hover {
        background: var(--surface-2, #f5f3ef);
    }

    .pill-icon {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: var(--surface-2, #f5f3ef);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .pill-icon.c-purple {
        background: #f3e8ff;
        color: #9333ea;
    }
    .pill-icon.c-purple .material-symbols-rounded {
        color: #9333ea;
    }

    .pill-icon.c-orange {
        background: #ffedd5;
        color: #ea580c;
    }
    .pill-icon.c-orange .material-symbols-rounded {
        color: #ea580c;
    }

    .pill-icon.c-yellow {
        background: #fef3c7;
        color: #d97706;
    }
    .pill-icon.c-yellow .material-symbols-rounded {
        color: #d97706;
    }

    .pill-icon.c-blue {
        background: #dbeafe;
        color: #2563eb;
    }
    .pill-icon.c-blue .material-symbols-rounded {
        color: #2563eb;
    }

    .pill-icon .material-symbols-rounded {
        font-size: 1.2rem;
    }

    .hero-pill div b {
        display: block;
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-1);
        white-space: nowrap;
    }

    .hero-pill div span {
        display: block;
        font-size: 0.75rem;
        color: var(--text-3);
        white-space: nowrap;
        margin-top: 2px;
    }

    /* ===================== SECTION 2: AI INSIGHT ===================== */
    .ai-insight-section {
        padding: 32px 0 80px;
        background: #efe7dd;
        position: relative;
        overflow: hidden;
    }

    .glass-blob {
        position: absolute;
        border-radius: 50%;
        filter: blur(64px);
        z-index: 0;
    }

    .blob-1 {
        width: 384px;
        height: 384px;
        background: rgba(255, 255, 255, 0.6);
        top: -128px;
        left: 80px;
    }

    .blob-2 {
        width: 288px;
        height: 288px;
        background: rgba(219, 234, 254, 0.4);
        top: 40px;
        right: 80px;
    }

    .relative-z {
        position: relative;
        z-index: 2;
    }

    .ai-insight-inner {
        display: flex;
        align-items: flex-start;
        gap: 30px;
    }

    .ai-insight-left {
        flex: 0 0 260px;
    }

    .ai-insight-left h2 {
        font-family: "Playfair Display", serif;
        font-size: 2rem;
        font-weight: 800;
        line-height: 1.2;
        color: var(--text-1);
        margin-bottom: 16px;
    }

    .ai-insight-left p {
        font-size: 0.95rem;
        color: var(--text-2);
        line-height: 1.6;
    }

    .ai-cards-row {
        flex: 1;
        min-width: 0;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
    }

    .ai-card {
        border-radius: 24px;
        background: linear-gradient(
            135deg,
            rgba(245, 240, 255, 0.55) 0%,
            rgba(220, 215, 235, 0.35) 100%
        );
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        border: 1.5px solid rgba(160, 155, 170, 0.4);
        box-shadow:
            0 0 20px rgba(255, 255, 255, 0.15),
            0 8px 32px rgba(0, 0, 0, 0.06),
            inset 0 1px 2px rgba(255, 255, 255, 0.5);
        padding: 12px 16px;
        min-height: 150px;
        position: relative;
        overflow: hidden;
        transition: all 0.4s ease;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .ai-card:hover {
        border-color: rgba(200, 195, 215, 0.6);
        box-shadow:
            0 0 30px rgba(255, 255, 255, 0.2),
            0 0 60px rgba(180, 170, 200, 0.1),
            0 12px 40px rgba(0, 0, 0, 0.08),
            inset 0 1px 3px rgba(255, 255, 255, 0.6);
    }

    .ai-card-glow {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 150px;
        height: 150px;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        filter: blur(40px);
        opacity: 0.7;
        transition: all 0.5s;
        z-index: 0;
    }

    .ai-card:hover .ai-card-glow {
        width: 170px;
        height: 170px;
        background: rgba(200, 190, 220, 0.5);
        filter: blur(35px);
        opacity: 1;
    }

    .ai-card-label,
    .ai-card-value,
    .ai-card-sub {
        position: relative;
        z-index: 2;
    }

    .ai-card-label {
        font-size: 0.8rem;
        font-weight: 700;
        color: #1a1a1a;
        margin-bottom: 16px;
    }

    .ai-card-value {
        font-size: 1.75rem;
        font-weight: 700;
        color: #000;
        line-height: 1.2;
        margin-bottom: 4px;
    }

    .ai-card-sub {
        font-size: 0.75rem;
        color: #4a4a4a;
        margin-top: 8px;
        font-weight: 500;
    }

    .ai-card-svg-deco {
        position: absolute;
        bottom: 12px;
        right: 12px;
        opacity: 0.5;
        z-index: 1;
        pointer-events: none;
    }

    /* ===================== SECTION 3: STUDIO DESIGN ===================== */
    .studio-section {
        padding: 48px 0;
        background: var(--surface, #fafafa);
    }

    .studio-inner {
        display: flex;
        align-items: flex-start;
        gap: 56px;
    }

    .studio-left {
        flex: 0 0 280px;
        max-width: 280px;
    }

    .studio-left h2 {
        font-family: "Playfair Display", serif;
        font-size: 1.9rem;
        font-weight: 800;
        line-height: 1.2;
        color: var(--text-1);
        margin-bottom: 14px;
    }

    .studio-left p {
        font-size: 0.88rem;
        color: var(--text-3);
        line-height: 1.7;
        margin-bottom: 28px;
    }

    .studio-cta-btn {
        display: inline-flex;
        align-items: center;
        padding: 11px 24px;
        border: 1.5px solid var(--gold);
        border-radius: 10px;
        color: var(--gold);
        font-size: 0.88rem;
        font-weight: 700;
        text-decoration: none;
        transition: all 0.2s;
        background: rgba(201, 168, 76, 0.06);
    }

    .studio-cta-btn:hover {
        background: var(--gold);
        color: #fff;
    }

    .studio-cards-wrapper {
        flex: 1;
        position: relative;
        display: flex;
        align-items: center;
    }

    .studio-cards {
        display: flex;
        gap: 16px;
        overflow-x: auto;
        padding-bottom: 4px;
        scrollbar-width: thin;
        width: 100%;
    }

    .studio-scroll-btn {
        position: absolute;
        right: -20px;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #fff;
        border: 1px solid var(--border);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--text-2);
        z-index: 10;
    }
    .studio-scroll-btn:hover {
        color: var(--gold);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }

    .studio-card {
        flex: 0 0 160px;
        border-radius: 14px;
        overflow: hidden;
        border: 1px solid var(--border);
        background: #fff;
        transition: all 0.25s;
    }

    .studio-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
    }

    .studio-card-img {
        height: 160px;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
    }

    .rab-bg {
        background: #fff;
        display: flex;
        flex-direction: column;
        padding: 10px 12px;
        position: relative;
        border-bottom: 1px solid var(--border-light);
        box-sizing: border-box;
        overflow: hidden;
    }

    .rab-header {
        font-size: 0.65rem;
        font-weight: 800;
        color: var(--text-1);
        margin-bottom: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .rab-pagination {
        position: absolute;
        top: 10px;
        right: 12px;
        font-size: 0.6rem;
        color: var(--text-3);
        font-weight: 600;
    }

    .rab-tbl {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 8px;
    }

    .rab-tbl td {
        font-size: 0.6rem;
        color: var(--text-2);
        padding: 2px 0;
    }

    .rab-tbl td:last-child {
        text-align: right;
        font-weight: 600;
        color: var(--text-1);
    }

    .rab-tbl .rab-total td {
        color: var(--text-1);
        font-weight: 800;
        border-top: 1px solid var(--border);
        padding-top: 6px;
    }

    .rab-btn {
        background: #065f46;
        color: #fff;
        border: none;
        padding: 5px 0;
        border-radius: 6px;
        font-size: 0.65rem;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        transition: background 0.2s;
        margin-top: auto;
    }

    .rab-btn:hover {
        background: #047857;
    }

    .studio-card-label {
        padding: 12px 14px;
        background: #fff;
        position: relative;
        z-index: 2;
    }

    .studio-card-label b {
        display: block;
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--text-1);
    }

    .studio-card-label span {
        display: block;
        font-size: 0.72rem;
        color: var(--text-3);
        margin-top: 2px;
    }

    /* ===================== SECTION 4: PROPERTI ===================== */
    .prop-section {
        padding: 48px 0;
        background: var(--surface, #fafafa);
    }

    .section-hdr {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
    }

    .section-hdr h2 {
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: "Playfair Display", serif;
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-1);
    }

    .section-hdr h2 .material-symbols-rounded {
        font-size: 1.4rem;
        color: var(--gold);
    }

    .section-hdr h2 .star {
        color: var(--gold);
        font-size: 1rem;
    }

    :global(.hdr-link) {
        font-size: 0.88rem;
        color: var(--gold);
        font-weight: 700;
        text-decoration: none;
        white-space: nowrap;
    }

    :global(.hdr-link:hover) {
        text-decoration: underline;
    }



    :global(.prop-card) {
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid var(--border);
        background: #fff;
        text-decoration: none;
        display: block;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    :global(.prop-card:hover) {
        transform: translateY(-5px);
        box-shadow: 0 20px 48px rgba(0, 0, 0, 0.1);
        border-color: transparent;
    }

    .prop-img-wrap {
        position: relative;
        aspect-ratio: 4/3;
        overflow: hidden;
    }

    .prop-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.4s ease;
    }

    :global(.prop-card:hover) .prop-img {
        transform: scale(1.05);
    }


    .prop-badges-row {
        position: absolute;
        top: 10px;
        left: 10px;
        display: flex;
        gap: 5px;
        flex-wrap: wrap;
    }

    .pbadge {
        font-size: 0.65rem;
        font-weight: 800;
        padding: 4px 10px;
        border-radius: 999px;
        letter-spacing: 0.3px;
    }

    .pbadge.jual {
        background: var(--text-1);
        color: var(--gold);
    }

    .pbadge.sewa {
        background: var(--primary);
        color: #fff;
    }

    .pbadge.kat {
        background: rgba(255, 255, 255, 0.92);
        color: var(--text-2);
        -webkit-backdrop-filter: blur(4px);
        backdrop-filter: blur(4px);
    }

    .prop-body {
        padding: 14px 16px;
    }

    .prop-price {
        font-family: "Playfair Display", serif;
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--text-1);
        margin-bottom: 4px;
    }



    .prop-loc {
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 0.75rem;
        color: var(--text-3);
        margin-bottom: 10px;
    }

    .prop-loc .material-symbols-rounded {
        font-size: 0.85rem;
    }

    .prop-specs {
        display: flex;
        gap: 10px;
        border-top: 1px solid var(--border-light, #f0ede6);
        padding-top: 10px;
    }

    .prop-specs span {
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 0.75rem;
        color: var(--text-3);
    }

    .prop-specs .material-symbols-rounded {
        font-size: 0.95rem;
    }

    /* ===================== SECTION 5: ECOSYSTEM ===================== */
    .eco-section {
        padding: 32px 0;
    }

    .eco-card {
        background: #fff;
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 36px 48px;
        display: flex;
        align-items: center;
        gap: 56px;
    }

    .eco-title {
        font-family: "Playfair Display", serif;
        font-size: 1.3rem;
        font-weight: 800;
        color: var(--text-1);
        line-height: 1.3;
        flex-shrink: 0;
    }

    .eco-title-sub {
        font-size: 1.1rem;
    }

    .eco-arrow {
        color: var(--gold);
    }

    .eco-items {
        flex: 1;
        display: flex;
        justify-content: space-between;
    }

    .eco-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        text-align: center;
    }

    .eco-item .material-symbols-rounded {
        font-size: 1.8rem;
        color: var(--gold);
    }

    .eco-item b {
        display: block;
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--text-1);
    }

    .eco-item span {
        display: block;
        font-size: 0.7rem;
        color: var(--text-3);
    }

    /* ===================== SECTION 6: AI ASSISTANT ===================== */
    .ai-assistant-section {
        padding: 0;
        margin: 40px auto;
        max-width: 1200px;
        border-radius: 20px;
        background: linear-gradient(
            135deg,
            #faf8f5 0%,
            #f3ebe1 50%,
            #eaddce 100%
        );
        box-shadow:
            0 12px 30px rgba(0, 0, 0, 0.08),
            inset 0 2px 5px rgba(255, 255, 255, 0.9),
            inset 0 -2px 5px rgba(0, 0, 0, 0.05);
        border: 1.5px solid rgba(160, 155, 170, 0.4);
        position: relative;
        overflow: visible;
    }

    .ai-assistant-inner {
        display: flex;
        align-items: center;
        padding: 24px 32px;
        gap: 32px;
    }

    .robot-col {
        flex: 0 0 120px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .robot-img-new {
        width: 150px;
        height: auto;
        mix-blend-mode: multiply;
        animation: robotFloat 4s ease-in-out infinite;
    }

    .assistant-content {
        flex: 0 0 260px;
    }

    .assistant-content h2 {
        font-size: 1.3rem;
        font-weight: 800;
        color: #1a1a1a;
        margin-bottom: 8px;
    }

    .assistant-content p {
        font-size: 0.82rem;
        line-height: 1.6;
        color: #4a5568;
    }

    .question-container {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
    }

    .question-chip {
        background: rgba(255, 255, 255, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border-radius: 999px;
        padding: 12px 18px;
        font-size: 0.78rem;
        color: #2d3748;
        text-align: left;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
    }

    .question-chip:hover {
        background: rgba(255, 255, 255, 0.9);
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.06);
    }

    .assistant-action {
        flex: 0 0 auto;
    }

    :global(.chat-button) {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        color: #4a3b2a !important;
        font-weight: 700;
        font-size: 0.95rem;
        padding: 14px 28px;
        text-decoration: none;
        transition: all 0.2s;
        border-radius: 24px;
        background: linear-gradient( 135deg, rgba(245, 240, 255, 0.55) 0%, rgba(220, 215, 235, 0.35) 100% );
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        border: 1.5px solid rgba(160, 155, 170, 0.4);
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.15), 0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 2px rgba(255, 255, 255, 0.5);
    }

    :global(.chat-button:hover) {
        transform: translateY(-2px);
        background: linear-gradient( 135deg, rgba(255, 255, 255, 0.65) 0%, rgba(230, 225, 245, 0.45) 100% );
        box-shadow: 0 0 25px rgba(255, 255, 255, 0.25), 0 12px 36px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.6);
    }

    @keyframes robotFloat {
        0% {
            transform: translateY(0px);
        }
        50% {
            transform: translateY(-8px);
        }
        100% {
            transform: translateY(0px);
        }
    }

    /* ===================== SECTION 7: BERITA ===================== */
    .berita-section {
        padding: 72px 0;
        background: var(--surface, #fafafa);
    }

    .berita-section .section-hdr h2 {
        font-family: "Playfair Display", serif;
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-1);
    }


    .prop-tabs {
        margin-top: 8px;
    }
    
    .prop-tab {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 24px;
        padding: 8px 16px;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-2);
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
    }
    
    .prop-tab:hover {
        border-color: var(--gold);
        color: var(--gold);
    }
    
    .prop-tab.active {
        background: var(--gold);
        color: white;
        border-color: var(--gold);
        box-shadow: 0 4px 12px rgba(201, 168, 76, 0.3);
    }

    .slider-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: #fff;
        border: 1px solid var(--border);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10;
        transition: all 0.2s;
        color: var(--text-2);
    }
    .slider-arrow:hover {
        background: var(--gold);
        color: #fff;
        border-color: var(--gold);
    }
    .slider-arrow.left { left: -22px; }
    .slider-arrow.right { right: -22px; }
    @media (max-width: 768px) {
        .slider-arrow { display: none; }
    }

    .prop-grid-scroll {
        display: flex;
        gap: 24px;
        margin-top: 16px;
        overflow-x: auto;
        padding-bottom: 24px;
        scrollbar-width: none;
        scroll-snap-type: x mandatory;
    }
    .prop-grid-scroll::-webkit-scrollbar {
        display: none;
    }
    .prop-grid-scroll :global(.prop-card) {
        flex: 0 0 calc(25% - 18px);
        scroll-snap-align: start;
        min-width: 260px;
    }
    @media (max-width: 1024px) {
        .prop-grid-scroll :global(.prop-card) { flex: 0 0 calc(33.333% - 16px); }
    }
    @media (max-width: 768px) {
        .prop-grid-scroll :global(.prop-card) { flex: 0 0 calc(50% - 12px); }
    }
    @media (max-width: 480px) {
        .prop-grid-scroll :global(.prop-card) { flex: 0 0 85%; }
    }

    .berita-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
        margin-top: 24px;
    }

    :global(.berita-card) {
        border-radius: 16px;
        overflow: hidden;
        background: #fff;
        border: 1px solid var(--border);
        text-decoration: none;
        display: block;
        transition: all 0.25s;
    }

    :global(.berita-card:hover) {
        transform: translateY(-4px);
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
    }

    .berita-img-wrap {
        height: 180px;
        overflow: hidden;
        position: relative;
    }

    .berita-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.4s;
    }

    :global(.berita-card:hover) .berita-img {
        transform: scale(1.05);
    }

    .berita-img-ph {
        width: 100%;
        height: 100%;
        background: var(--surface-2);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .berita-img-ph .material-symbols-rounded {
        font-size: 2.5rem;
        color: var(--text-4);
    }

    .berita-body {
        padding: 18px 20px;
    }

    .berita-date {
        font-size: 0.72rem;
        color: var(--gold);
        font-weight: 600;
        margin-bottom: 8px;
    }

    .berita-title {
        font-size: 0.92rem;
        font-weight: 700;
        color: var(--text-1);
        margin-bottom: 8px;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .berita-excerpt {
        font-size: 0.8rem;
        color: var(--text-3);
        line-height: 1.6;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .berita-empty {
        border: 2px dashed var(--border);
        border-radius: 16px;
        padding: 48px;
        text-align: center;
        margin-top: 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
    }

    .berita-empty .material-symbols-rounded {
        font-size: 2.5rem;
        color: var(--text-4);
    }

    .berita-empty p {
        color: var(--text-3);
        font-size: 0.9rem;
    }



    :global(.promo-cta-btn) {
        display: inline-flex;
        align-items: center;
        padding: 13px 28px;
        background: var(--gold);
        color: #fff;
        font-size: 0.9rem;
        font-weight: 700;
        border-radius: 12px;
        text-decoration: none;
        white-space: nowrap;
        transition: all 0.2s;
        flex-shrink: 0;
    }

    :global(.promo-cta-btn:hover) {
        background: var(--gold-hover);
    }

    /* ===================== RESPONSIVE ===================== */
    @media (max-width: 1024px) {

        .ai-cards-row {
            grid-template-columns: repeat(2, 1fr);
        }

        .eco-card {
            flex-direction: column;
            gap: 28px;
        }

        .eco-items {
            flex-wrap: wrap;
            justify-content: center;
            gap: 24px;
        }

        .ai-assistant-inner {
            flex-wrap: wrap;
            justify-content: center;
            text-align: center;
        }

        .assistant-content, .question-container {
            flex: 1 1 100%;
        }
    }

    @media (max-width: 768px) {
        .hero-split {
            flex-direction: column;
        }

        .hero-left {
            flex: 1;
            max-width: 100%;
        }

        .hero-pills {
            flex-wrap: wrap;
            border-radius: 12px;
        }

        .hero-pill {
            flex: 0 0 calc(33.333% - 2px);
            border-bottom: 1px solid var(--border);
        }

        .ai-insight-inner, .ai-assistant-inner {
            flex-direction: column;
            text-align: center;
        }

        .ai-insight-left, .assistant-content, .robot-col, .assistant-action {
            flex: auto;
            max-width: 100%;
            text-align: center;
        }

        .question-container {
            grid-template-columns: 1fr;
        }

        .ai-cards-row {
            grid-template-columns: repeat(2, 1fr);
        }

        .studio-inner {
            flex-direction: column;
        }

        .studio-left {
            flex: auto;
            max-width: 100%;
        }

        .berita-grid {
            grid-template-columns: 1fr;
        }


    }

    @media (max-width: 480px) {

        .ai-cards-row {
            grid-template-columns: 1fr 1fr;
        }

        .hero-pills {
            border: none;
            gap: 8px;
        }

        .hero-pill {
            flex: 0 0 calc(50% - 4px);
            border: 1px solid var(--border);
            border-radius: 10px;
        }

        .search-btn {
            width: 100%;
            justify-content: center;
        }
    }

    .ai-spin {
        animation: spin 1s linear infinite;
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }
    .btn-loading {
        background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%) !important;
        cursor: wait !important;
    }
    .ai-loading {
        background-color: var(--surface-2);
        color: var(--primary);
        font-weight: 600;
        animation: ai-pulse 1.5s infinite;
    }
    @keyframes ai-pulse {
        0% { opacity: 1; }
        50% { opacity: 0.6; }
        100% { opacity: 1; }
    }
</style>
