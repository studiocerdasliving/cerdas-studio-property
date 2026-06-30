<script>
  import { onMount } from "svelte";
  import { apiFetch } from "../lib/api.js";
  import { user } from "../lib/stores/auth.js";
  import StudioLayout from "../components/StudioLayout.svelte";
  import { propertyImg, url } from "../lib/url.svelte.js";

  const localPropertyShots = [
    "0ca8ac3b8f2c31-1681787906.jpg",
    "1-1692074511.jpg",
    "10-1692073896.jpg",
    "11-1692073896.jpg",
    "12-1692073896.jpg",
    "1635248895672-1681788814.jpg",
    "165570033181-1681789849.jpeg",
    "2-1692074511.jpg",
    "3-1692074511.jpg",
    "4-1692074511.jpg",
  ];

  const fallbackProjects = [
    {
      id: "project-modern",
      name: "Rumah Modern 2 Lantai",
      updated_at: "2026-06-28T08:00:00Z",
      progress: 75,
      image: propertyImg(localPropertyShots[0]),
    },
    {
      id: "project-villa",
      name: "Villa Bali Resort",
      updated_at: "2026-06-27T08:00:00Z",
      progress: 40,
      image: propertyImg(localPropertyShots[1]),
    },
    {
      id: "project-ruko",
      name: "Ruko 3 Lantai",
      updated_at: "2026-06-26T08:00:00Z",
      progress: 20,
      image: propertyImg(localPropertyShots[2]),
    },
    {
      id: "project-cafe",
      name: "Cafe Industrial",
      updated_at: "2026-06-25T08:00:00Z",
      progress: 10,
      image: propertyImg(localPropertyShots[3]),
    },
  ];

  const featuredDesigners = [
    {
      name: "Studio Arsitek A",
      rating: 4.9,
      reviews: 128,
      meta: "250+ Proyek",
      price: "Mulai Rp 500.000 /m²",
      image: propertyImg(localPropertyShots[4]),
      badge: "PRO",
    },
    {
      name: "Interior Studio B",
      rating: 4.8,
      reviews: 96,
      meta: "180+ Proyek",
      price: "Mulai Rp 350.000 /m²",
      image: propertyImg(localPropertyShots[5]),
      badge: "",
    },
    {
      name: "Design House ID",
      rating: 4.7,
      reviews: 76,
      meta: "120+ Proyek",
      price: "Mulai Rp 400.000 /m²",
      image: propertyImg(localPropertyShots[6]),
      badge: "",
    },
    {
      name: "Arsitek Nusantara",
      rating: 4.9,
      reviews: 58,
      meta: "100+ Proyek",
      price: "Mulai Rp 450.000 /m²",
      image: propertyImg(localPropertyShots[7]),
      badge: "",
    },
    {
      name: "Interior Creative",
      rating: 4.8,
      reviews: 112,
      meta: "300+ Proyek",
      price: "Mulai Rp 375.000 /m²",
      image: propertyImg(localPropertyShots[8]),
      badge: "",
    },
  ];

  const featuredContractors = [
    {
      name: "BuildPro Indonesia",
      rating: 4.9,
      reviews: 142,
      meta: "350+ Proyek",
      price: "Mulai Rp 5 Jt /m²",
      image: propertyImg(localPropertyShots[0]),
    },
    {
      name: "Segera Bangun",
      rating: 4.8,
      reviews: 98,
      meta: "280+ Proyek",
      price: "Mulai Rp 4.5 Jt /m²",
      image: propertyImg(localPropertyShots[1]),
    },
    {
      name: "Konstruksi Prima",
      rating: 4.7,
      reviews: 76,
      meta: "190+ Proyek",
      price: "Mulai Rp 5 Jt /m²",
      image: propertyImg(localPropertyShots[2]),
    },
    {
      name: "Mahakarya Konstruksi",
      rating: 4.9,
      reviews: 64,
      meta: "220+ Proyek",
      price: "Mulai Rp 5.5 Jt /m²",
      image: propertyImg(localPropertyShots[3]),
    },
    {
      name: "Bangun Rumah Idaman",
      rating: 4.8,
      reviews: 88,
      meta: "260+ Proyek",
      price: "Mulai Rp 4.8 Jt /m²",
      image: propertyImg(localPropertyShots[9]),
    },
  ];

  const popularTemplates = [
    {
      name: "Rumah Minimalis",
      meta: "24+ Template",
      icon: "home",
      image: propertyImg(localPropertyShots[4]),
    },
    {
      name: "Rumah Modern",
      meta: "30+ Template",
      icon: "villa",
      image: propertyImg(localPropertyShots[5]),
    },
    {
      name: "Villa",
      meta: "20+ Template",
      icon: "holiday_village",
      image: propertyImg(localPropertyShots[6]),
    },
    {
      name: "Ruko",
      meta: "15+ Template",
      icon: "storefront",
      image: propertyImg(localPropertyShots[7]),
    },
    {
      name: "Cafe",
      meta: "18+ Template",
      icon: "local_cafe",
      image: propertyImg(localPropertyShots[8]),
    },
    {
      name: "Kos-Kosan",
      meta: "12+ Template",
      icon: "apartment",
      image: propertyImg(localPropertyShots[9]),
    },
  ];

  let recentProjects = $state([]);
  let latestEstimate = $state(null);

  const userName = $derived(
    $user?.name || $user?.nama || $user?.username || "Team Development",
  );
  const userRole = $derived($user?.role || $user?.akses_level || "Studio Pro");
  const userInitials = $derived(
    userName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "TD",
  );
  const displayName = userName;

  function formatShortDate(dateString) {
    if (!dateString) return "Baru saja";
    const date = new Date(dateString);
    const diffDays = Math.max(
      0,
      Math.round((Date.now() - date.getTime()) / 86400000),
    );
    if (diffDays === 0) return "Diubah hari ini";
    if (diffDays === 1) return "Diubah 1 hari lalu";
    return `Diubah ${diffDays} hari lalu`;
  }

  function formatCurrency(amount) {
    return `Rp ${Math.round(amount).toLocaleString("id-ID")}`;
  }

  function normalizeProjects(items) {
    if (!Array.isArray(items) || items.length === 0) return fallbackProjects;

    return items.slice(0, 4).map((project, index) => ({
      id: project.id || project.project_id || `project-${index}`,
      name: project.name || project.nama || `Project ${index + 1}`,
      updated_at:
        project.updated_at || project.created_at || new Date().toISOString(),
      progress: Number(project.progress ?? [78, 52, 34, 18][index] ?? 25),
      image: project.cover_img
        ? propertyImg(project.cover_img)
        : propertyImg(localPropertyShots[index % localPropertyShots.length]),
      area: Number(project.area ?? [120, 95, 160, 210][index] ?? 120),
      estimate: Number(
        project.estimate_total ??
          [425000000, 378000000, 680000000, 510000000][index] ??
          425000000,
      ),
      estimateMin: Number(
        project.estimate_min ??
          [410000000, 360000000, 645000000, 480000000][index] ??
          410000000,
      ),
      estimateMax: Number(
        project.estimate_max ??
          [450000000, 392000000, 710000000, 545000000][index] ??
          450000000,
      ),
    }));
  }

  onMount(async () => {
    try {
      const projects = await apiFetch("/projects");
      recentProjects = normalizeProjects(projects);
    } catch (error) {
      console.error("Gagal memuat project studio hub:", error);
      recentProjects = fallbackProjects;
    }

    if (recentProjects.length === 0) {
      recentProjects = fallbackProjects;
    }

    const lead = recentProjects[0];
    latestEstimate = {
      title: lead.name,
      area: lead.area || 120,
      total: lead.estimate || 425000000,
      min: lead.estimateMin || 410000000,
      max: lead.estimateMax || 450000000,
      image: lead.image,
    };
  });
</script>

<StudioLayout title="Studio Hub">
  <div class="hub-page">
    <section class="hero-grid">
      <div class="hero-main-content">
        <div class="hero-content-inner">
          <div class="hero-title-area">
            <h1>
              Selamat Datang Kembali,<br /><span class="team-name"
                >TEAM DEVELOPMENT</span
              > <span class="wave-icon">👏</span>
            </h1>
            <p class="hero-subtitle">
              Bangun Proyek Property, Estimasi Biaya, Kolaborasi, Temukan
              Designer & Contractor.
            </p>
          </div>

          <div class="hero-actions-row">
            <button class="btn-action primary">
              <div class="btn-icon-wrap">
                <span class="material-symbols-rounded">add</span>
              </div>
              <div class="btn-text">
                <strong>Buat Proyek </strong>
                <span>Mulai proyek desain dari awal</span>
              </div>
            </button>
            <a href={url("/studio/proyek")} class="btn-action outline">
              <div class="btn-icon-wrap">
                <span class="material-symbols-rounded">folder_open</span>
              </div>
              <div class="btn-text">
                <strong>Proyek Saya</strong>
                <span>Lihat dan kelola proyek Anda</span>
              </div>
            </a>
            <button class="btn-action outline">
              <div class="btn-icon-wrap">
                <span class="material-symbols-rounded">upload</span>
              </div>
              <div class="btn-text">
                <strong>Upload Denah</strong>
                <span>Import file DWG, DXF, JPG</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div class="hero-right-column">
        <!-- Profile & Notifications -->
        <div class="dashboard-profile-bar">
          <button
            type="button"
            class="icon-badge"
            aria-label="Notifikasi studio"
          >
            <span class="material-symbols-rounded">notifications_none</span>
            <span class="icon-badge-count">3</span>
          </button>

          <a href={url("/studio/profil")} class="user-pill">
            {#if $user?.picture || $user?.avatar}
              <img
                src={$user?.picture || $user?.avatar}
                alt={userName}
                class="user-avatar-img"
              />
            {:else}
              <span class="user-avatar">{userInitials}</span>
            {/if}
            <span class="user-copy">
              <strong>{userName}</strong>
              <span
                ><i
                  class="fa-solid fa-crown"
                  style="color: #f59e0b; margin-right: 3px; font-size: 0.85em;"
                ></i>
                {userRole}</span
              >
            </span>
            <span class="material-symbols-rounded user-pill-caret"
              >expand_more</span
            >
          </a>
        </div>

        <!-- Token Card -->
        <aside class="token-card token-card-v3">
          <div class="token-card-top">
            <div class="token-card-copy">
              <div class="token-card-label">
                Token Studio
                <span class="material-symbols-rounded">help</span>
              </div>
              <div class="token-card-balance">
                <strong>125</strong>
                <span>Token</span>
              </div>
            </div>
            <div class="token-stack">
              <span class="material-symbols-rounded">stacks</span>
            </div>
          </div>

          <div class="token-card-mid">
            <div class="token-date">
              <span>Aktif hingga</span>
              <strong>30/07/2026</strong>
            </div>
            <a href={url("/studio/profil")} class="token-btn-compact">
              <span class="material-symbols-rounded">add_circle</span>
              Isi Token
            </a>
          </div>

          <div class="token-card-bottom">
            <p>Gunakan token untuk:</p>
            <div class="token-features-list">
              <div class="t-feature">
                <span class="material-symbols-rounded">check</span> Studio Design
              </div>
              <div class="t-feature">
                <span class="material-symbols-rounded">check</span> Render Denah
              </div>
              <div class="t-feature">
                <span class="material-symbols-rounded">check</span> Estimasi Biaya
              </div>
              <div class="t-feature">
                <span class="material-symbols-rounded">check</span> Fitur Premium
                Lainnya
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <section class="summary-grid">
      <div class="section-card projects-panel">
        <div class="section-head">
          <div>
            <h2>Proyek Terakhir</h2>
          </div>
          <a href={url("/studio/proyek")}>Lihat Semua</a>
        </div>

        <div class="project-grid">
          {#each recentProjects as project}
            <a
              href={url(`/studio/design?project=${project.id}`)}
              class="project-card"
            >
              <div class="project-thumb-wrap">
                <img
                  src={project.image}
                  alt={project.name}
                  class="project-thumb"
                />
                <span class="project-menu material-symbols-rounded"
                  >more_vert</span
                >
              </div>
              <div class="project-body">
                <strong>{project.name}</strong>
                <span>{formatShortDate(project.updated_at)}</span>
              </div>
              <div class="project-progress">
                <div
                  class="progress-line active"
                  style={`flex-basis:${Math.max(2, Math.min(100, project.progress))}%`}
                ></div>
                <small>{project.progress}%</small>
                <div
                  class="progress-line"
                  style={`flex-basis:${Math.max(0, 100 - project.progress)}%`}
                ></div>
              </div>
            </a>
          {/each}
        </div>
      </div>

      {#if latestEstimate}
        <div class="section-card estimate-panel">
          <div class="section-head">
            <div>
              <h2>Estimasi Biaya Terbaru</h2>
            </div>
            <a href={url("/studio/design")} class="btn-outline-sm">Lihat Semua</a>
          </div>

          <div class="estimate-overview">
            <img
              src={latestEstimate.image}
              alt={latestEstimate.title}
              class="estimate-thumb"
            />
            <div class="estimate-title-wrap">
              <strong>{latestEstimate.title}</strong>
              <span>Luas Bangunan {latestEstimate.area} m²</span>
            </div>
          </div>

          <div class="estimate-details">
            <div class="estimate-total-row">
              <span class="e-label">Total Estimasi</span>
              <strong class="e-amount green">{formatCurrency(latestEstimate.total)}</strong>
            </div>
            <div class="estimate-breakdown">
              <div class="e-breakdown-row">
                <span class="e-b-label">Material</span>
                <span class="e-b-val">Rp 280.000.000</span>
                <span class="e-b-pct">(66%)</span>
              </div>
              <div class="e-breakdown-row">
                <span class="e-b-label">Upah Pekerja</span>
                <span class="e-b-val">Rp 145.000.000</span>
                <span class="e-b-pct">(34%)</span>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </section>

    <section class="section-card showcase-panel">
      <div class="section-head">
        <div>
          <h2>Designer Pilihan</h2>
          <p>
            Temukan designer profesional untuk mewujudkan desain impian Anda
          </p>
        </div>
        <a href={url("/studio/design")}>Lihat Semua</a>
      </div>

      <div class="showcase-grid">
        {#each featuredDesigners as item}
          <article class="showcase-card">
            <div class="showcase-media">
              <img src={item.image} alt={item.name} />
              {#if item.badge}
                <span class="media-badge">{item.badge}</span>
              {/if}
              <button
                type="button"
                class="media-favorite"
                aria-label={`Simpan ${item.name}`}
              >
                <span class="material-symbols-rounded">favorite</span>
              </button>
            </div>
            <div class="showcase-body">
              <strong>{item.name}</strong>
              <div class="rating-row">
                <span class="material-symbols-rounded">star</span>
                <span>{item.rating}</span>
                <small>({item.reviews})</small>
              </div>
              <span>{item.meta}</span>
              <div class="showcase-footer">
                <small>{item.price}</small>
                <span class="material-symbols-rounded">arrow_forward</span>
              </div>
            </div>
          </article>
        {/each}
      </div>
    </section>

    <section class="section-card showcase-panel">
      <div class="section-head">
        <div>
          <h2>Kontraktor Pilihan</h2>
          <p>Temukan kontraktor terpercaya untuk membangun proyek Anda</p>
        </div>
        <a href={url("/studio/design")}>Lihat Semua</a>
      </div>

      <div class="showcase-grid">
        {#each featuredContractors as item}
          <article class="showcase-card">
            <div class="showcase-media">
              <img src={item.image} alt={item.name} />
              <button
                type="button"
                class="media-favorite"
                aria-label={`Simpan ${item.name}`}
              >
                <span class="material-symbols-rounded">favorite</span>
              </button>
            </div>
            <div class="showcase-body">
              <strong>{item.name}</strong>
              <div class="rating-row">
                <span class="material-symbols-rounded">star</span>
                <span>{item.rating}</span>
                <small>({item.reviews})</small>
              </div>
              <span>{item.meta}</span>
              <div class="showcase-footer">
                <small>{item.price}</small>
                <span class="material-symbols-rounded">arrow_forward</span>
              </div>
            </div>
          </article>
        {/each}
      </div>
    </section>

    <section class="section-card showcase-panel template-panel">
      <div class="section-head">
        <div>
          <h2>Template Design Populer</h2>
          <p>
            Mulai lebih cepat dengan template siap pakai yang bisa Anda
            sesuaikan
          </p>
        </div>
        <a href={url("/studio/design")}>Lihat Semua</a>
      </div>

      <div class="template-grid">
        {#each popularTemplates as item}
          <article class="template-card">
            <img src={item.image} alt={item.name} class="template-thumb" />
            <div class="template-meta-icon">
              <span class="material-symbols-rounded">{item.icon}</span>
            </div>
            <div class="template-copy">
              <strong>{item.name}</strong>
              <span>{item.meta}</span>
            </div>
          </article>
        {/each}
      </div>
    </section>
  </div>
</StudioLayout>

<style>
  .hub-page {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .hero-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 16px;
    align-items: start;
    margin-bottom: 16px;
  }

  .hero-main-content {
    display: flex;
    flex-direction: column;
    position: relative;
    background: #ffffff;
    border-radius: 24px;
    box-shadow: 0 12px 32px rgba(105, 77, 29, 0.04);
    overflow: hidden;
  }

  .hero-content-inner {
    position: relative;
    z-index: 1;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 20px;
  }

  .hero-title-area {
    margin-bottom: 8px;
  }

  .hero-title-area h1 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    color: #1a1814;
    line-height: 1.3;
  }

  .team-name {
    text-transform: uppercase;
  }

  .hero-subtitle {
    margin: 8px 0 0 0;
    font-size: 0.85rem;
    color: #555;
    font-weight: 500;
  }

  .wave-icon {
    display: inline-block;
    animation: wave 2.5s infinite;
    transform-origin: 70% 70%;
  }

  @keyframes wave {
    0% {
      transform: rotate(0deg);
    }
    10% {
      transform: rotate(14deg);
    }
    20% {
      transform: rotate(-8deg);
    }
    30% {
      transform: rotate(14deg);
    }
    40% {
      transform: rotate(-4deg);
    }
    50% {
      transform: rotate(10deg);
    }
    60% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }

  .features-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 8px;
  }

  .feature-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    gap: 8px;
  }

  .feature-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(223, 177, 64, 0.15);
  }

  .feature-icon .material-symbols-rounded {
    color: #dfb140;
    font-size: 1.2rem;
  }

  .feature-item strong {
    font-size: 0.8rem;
    color: #1a1814;
    line-height: 1.2;
  }

  .feature-item p {
    margin: 0;
    font-size: 0.65rem;
    color: #7b766b;
    line-height: 1.3;
  }

  .feature-divider {
    width: 1px;
    align-self: stretch;
    background: rgba(0, 0, 0, 0.06);
    margin: 4px 0;
  }

  /* 3 Action Buttons */
  .hero-actions-row {
    display: flex;
    gap: 10px;
    margin-top: 4px;
  }

  .btn-action {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 16px;
    min-height: 72px;
    border-radius: 16px;
    text-decoration: none;
    border: none;
    cursor: pointer;
    text-align: left;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
    box-shadow: 0 4px 16px rgba(105, 77, 29, 0.04);
  }

  .btn-action:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(105, 77, 29, 0.08);
  }

  .btn-action.primary {
    background: #11141a;
    color: #fff;
  }

  .btn-action.outline {
    background: #fff;
    border: 1px solid rgba(228, 218, 204, 0.6);
    color: #1a1814;
  }

  .btn-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #dfb140;
  }

  .btn-icon-wrap .material-symbols-rounded {
    font-size: 1.4rem;
  }

  .btn-text strong {
    display: block;
    font-size: 0.82rem;
    margin-bottom: 2px;
  }

  .btn-text span {
    display: block;
    font-size: 0.68rem;
    color: #7b766b;
  }

  .btn-action.primary .btn-text span {
    color: rgba(255, 255, 255, 0.6);
  }

  .hero-right-column {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* Profile Bar */
  .dashboard-profile-bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
  }

  .icon-badge {
    position: relative;
    width: 36px;
    height: 36px;
    border: 0;
    border-radius: 12px;
    background: transparent;
    color: #272727;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-badge .material-symbols-rounded {
    font-size: 1.15rem;
  }

  .icon-badge-count {
    position: absolute;
    top: 4px;
    right: 4px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #ef4444;
    color: #fff;
    font-size: 0.64rem;
    font-weight: 700;
  }

  .user-pill {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 4px 8px 4px 4px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.84);
    color: inherit;
    text-decoration: none;
    box-shadow: 0 4px 12px rgba(82, 60, 25, 0.05);
    border: 1px solid rgba(224, 215, 201, 0.6);
  }

  .user-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #1a1814;
    color: #fff;
    font-weight: 700;
    font-size: 0.9rem;
    letter-spacing: 0.04em;
  }

  .user-avatar-img {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    object-fit: cover;
  }

  .user-copy {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .user-copy strong {
    font-size: 0.84rem;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-copy span {
    color: #b18125;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .user-pill-caret {
    color: #59544b;
    font-size: 1.2rem;
  }

  /* Token Card V3 */
  .token-card-v3 {
    background: #11141a;
    border-radius: 20px;
    padding: 12px 14px;
    color: #fff;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-shadow: 0 16px 36px rgba(17, 18, 23, 0.15);
    position: relative;
    overflow: hidden;
  }

  .token-card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    z-index: 1;
  }

  .token-card-copy {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .token-card-label {
    display: flex;
    align-items: center;
    gap: 4px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.7rem;
  }

  .token-card-label .material-symbols-rounded {
    font-size: 0.7rem;
  }

  .token-card-balance {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  .token-card-balance strong {
    font-size: 2.4rem;
    line-height: 1;
    font-weight: 700;
  }

  .token-card-balance span {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.65rem;
  }

  .token-stack {
    color: #dfb140;
    margin-top: 4px;
  }

  .token-stack .material-symbols-rounded {
    font-size: 2.0rem;
    font-variation-settings: "FILL" 1;
  }

  .token-card-mid {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .token-card-bottom {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .token-card-bottom p {
    margin: 0;
    font-size: 0.6rem;
    color: rgba(255, 255, 255, 0.9);
  }

  .token-features-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px 4px;
  }

  .t-feature {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.55rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .t-feature .material-symbols-rounded {
    color: #dfb140;
    font-size: 0.7rem;
  }

  .token-date {
    display: flex;
    flex-direction: column;
  }

  .token-date span {
    color: #dfbf69;
    font-size: 0.65rem;
  }

  .token-date strong {
    color: #dfbf69;
    font-size: 0.75rem;
  }

  .token-btn-compact {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    text-decoration: none;
    color: #1a150b;
    font-size: 0.75rem;
    font-weight: 700;
    background: linear-gradient(180deg, #eec765 0%, #d8ae43 100%);
  }

  .token-btn-compact .material-symbols-rounded {
    font-size: 0.9rem;
  }

  .token-card-bottom {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .token-card-bottom p {
    margin: 0;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.9);
  }

  .token-features-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .t-feature {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .t-feature .material-symbols-rounded {
    color: #dfb140;
    font-size: 0.8rem;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 14px;
  }

  .section-card {
    border-radius: 16px;
    border: 1px solid rgba(224, 215, 201, 0.82);
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 12px 30px rgba(94, 70, 31, 0.04);
    padding: 12px 14px;
  }

  .section-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 12px;
  }

  .section-head h2 {
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.08;
    letter-spacing: -0.04em;
  }

  .section-head p {
    margin: 4px 0 0;
    color: #7c7568;
    font-size: 0.78rem;
  }

  .section-head a {
    color: #9b7428;
    font-weight: 700;
    text-decoration: none;
    white-space: nowrap;
  }

  .btn-outline-sm {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 10px;
    border: 1px solid #d4af37;
    border-radius: 8px;
    color: #9b7428 !important;
    font-size: 0.75rem;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.2s;
  }

  .btn-outline-sm:hover {
    background: rgba(212, 175, 55, 0.1);
  }

  .project-grid {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: 10px;
    padding-bottom: 8px;
    scrollbar-width: thin;
  }

  .project-grid::-webkit-scrollbar {
    display: none;
  }
  .project-grid {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .project-card {
    flex: 0 0 170px;
    scroll-snap-align: start;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .project-thumb-wrap {
    position: relative;
    height: 80px;
    border-radius: 12px;
    overflow: hidden;
    background: #ede7dd;
  }

  .project-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .project-menu {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: rgba(21, 21, 21, 0.34);
    backdrop-filter: blur(8px);
    font-size: 0.92rem;
  }

  .project-body {
    display: flex;
    flex-direction: column;
    gap: 0px;
  }

  .project-body strong {
    font-size: 0.72rem;
    line-height: 1.2;
  }

  .project-body span {
    color: #777065;
    font-size: 0.72rem;
  }

  .project-progress {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 2px;
  }

  .progress-line {
    height: 3px;
    background: #ece8df;
    border-radius: 2px;
  }

  .progress-line.active {
    background: #d5a73e;
  }

  .project-progress small {
    font-size: 0.65rem;
    color: #847b6f;
    font-weight: 700;
  }

  .estimate-panel {
    display: flex;
    flex-direction: column;
  }

  .estimate-overview {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding-bottom: 8px;
  }

  .estimate-thumb {
    width: 80px;
    height: 60px;
    border-radius: 10px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .estimate-title-wrap {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .estimate-title-wrap strong {
    font-size: 0.88rem;
    line-height: 1.12;
  }

  .estimate-title-wrap span {
    color: #7b766b;
    font-size: 0.72rem;
  }

  .estimate-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 16px;
  }

  .estimate-total-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 4px;
  }

  .e-label {
    font-size: 0.72rem;
    color: #746d62;
    font-weight: 600;
  }

  .e-amount.green {
    font-size: 1.05rem;
    font-weight: 700;
    color: #9b7428;
    line-height: 1;
  }

  .estimate-breakdown {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .e-breakdown-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.65rem;
  }

  .e-b-label {
    width: 70px;
    color: #746d62;
    font-weight: 600;
  }

  .e-b-val {
    color: #3d3a35;
    font-weight: 700;
  }

  .e-b-pct {
    margin-left: auto;
    color: #746d62;
    text-align: right;
    font-weight: 600;
  }

  .showcase-grid {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: 10px;
    padding-bottom: 8px;
    scrollbar-width: thin;
  }

  .showcase-grid::-webkit-scrollbar {
    display: none;
  }
  .showcase-grid {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .showcase-card {
    flex: 0 0 160px;
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(228, 218, 204, 0.95);
    border-radius: 14px;
    overflow: hidden;
    background: #fff;
  }

  .showcase-media {
    position: relative;
    height: 76px;
    background: #efe9e0;
  }

  .showcase-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .media-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    padding: 4px 6px;
    border-radius: 8px;
    background: #f7b91c;
    color: #fff;
    font-size: 0.62rem;
    font-weight: 800;
  }

  .media-favorite {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 50%;
    background: rgba(16, 16, 16, 0.34);
    color: #fff;
    backdrop-filter: blur(8px);
  }

  .media-favorite .material-symbols-rounded {
    font-size: 0.8rem;
    font-variation-settings: "FILL" 1;
  }

  .showcase-body {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 10px 9px;
  }

  .showcase-body strong {
    font-size: 0.76rem;
    line-height: 1.18;
  }

  .showcase-body > span {
    color: #767065;
    font-size: 0.7rem;
  }

  .rating-row {
    display: flex;
    align-items: center;
    gap: 3px;
    color: #8b6720;
    font-size: 0.68rem;
  }

  .rating-row .material-symbols-rounded {
    font-size: 0.8rem;
    font-variation-settings: "FILL" 1;
  }

  .rating-row small {
    color: #8e877b;
    font-size: 0.64rem;
  }

  .showcase-footer {
    margin-top: 1px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .showcase-footer small {
    color: #767065;
    font-size: 0.68rem;
    font-weight: 600;
  }

  .showcase-footer .material-symbols-rounded {
    color: #36332e;
    font-size: 0.88rem;
  }

  .template-grid {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: 10px;
    padding-bottom: 8px;
    scrollbar-width: thin;
  }

  .template-grid::-webkit-scrollbar {
    display: none;
  }
  .template-grid {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .template-card {
    flex: 0 0 145px;
    scroll-snap-align: start;
    border: 1px solid rgba(230, 220, 205, 0.95);
    border-radius: 14px;
    overflow: hidden;
    background: #fff;
  }

  .template-thumb {
    width: 100%;
    height: 60px;
    object-fit: cover;
    display: block;
  }

  .template-meta-icon {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: -15px 0 0 10px;
    position: relative;
    background: #fff8ea;
    color: #b98a2c;
    border: 1px solid rgba(215, 193, 148, 0.7);
    box-shadow: 0 10px 18px rgba(185, 138, 44, 0.14);
  }

  .template-meta-icon .material-symbols-rounded {
    font-size: 0.78rem;
  }

  .template-copy {
    padding: 10px 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .template-copy strong {
    font-size: 0.76rem;
  }

  .template-copy span {
    color: #7a756b;
    font-size: 0.7rem;
  }

  @media (max-width: 1380px) {
    .project-card {
      flex: 0 0 150px;
    }

    .showcase-card {
      flex: 0 0 145px;
    }

    .template-card {
      flex: 0 0 135px;
    }
  }

  @media (max-width: 1024px) {
    .hero-grid {
      grid-template-columns: 1fr;
    }

    .token-card {
      max-width: 400px;
    }

    .features-card {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .summary-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 840px) {
    .hero-actions-row {
      flex-direction: column;
    }

    .section-head h2 {
      font-size: 1.55rem;
    }
  }

  @media (max-width: 640px) {
    .features-card {
      grid-template-columns: 1fr;
    }

    .welcome-text h1 {
      font-size: 1.45rem;
    }

    .welcome-icon-wrap {
      width: 48px;
      height: 48px;
    }

    .welcome-icon-wrap .material-symbols-rounded {
      font-size: 1.8rem;
    }

    .token-card {
      grid-template-columns: 1fr;
    }

    .token-stack {
      display: none;
    }

    .token-card-balance strong {
      font-size: 3rem;
    }

    .project-thumb-wrap {
      height: 90px;
    }

    .estimate-overview {
      flex-direction: row;
    }

    .estimate-thumb {
      width: 120px;
      height: 90px;
    }

    .section-card {
      padding: 16px;
      border-radius: 16px;
    }

    .section-head {
      flex-direction: row;
      align-items: center;
    }
  }
</style>
