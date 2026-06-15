<script>
    import { Link  } from 'svelte-routing';
    import Layout from '../../components/Layout.svelte';
    import { url } from '../../lib/url.svelte.js';

    let { site_config = {}, testimonials = {} } = $props();
    let list = $derived(testimonials?.data || []);

    /** @param {string} d */
    function formatDate(d) {
        if (!d) return '';
        return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    /** @param {string} filename */
    function staffImg(filename) {
        if (!filename) return null;
        if (filename.startsWith('http')) return filename;
        return `http://localhost/studiocerdas/public/upload/staff/${filename}`;
    }
</script>



<Layout title="Testimonial Pelanggan">
    <!-- Header Hero -->
    <div class="testi-hero">
        <div class="testi-hero-bg"></div>
        <div class="container" style="position: relative; text-align: center; padding: 64px 0 56px;">
            <div class="section-label" style="color: rgba(201,168,76,0.8); justify-content: center;">Apa Kata Mereka</div>
            <h1 class="testi-title">Testimonial Pengguna</h1>
            <p class="testi-subtitle">Apa kata mereka yang telah menggunakan layanan Cerdas Living untuk mendapatkan hunian dan lifestyle terbaik.</p>
        </div>
    </div>

    <!-- Main Grid Content -->
    <div class="container" style="padding-top: 56px; padding-bottom: 80px;">
        {#if list.length > 0}
            <div class="testi-grid">
                {#each list as t}
                    <div class="testi-card">
                        <div class="testi-card-body">
                            <div class="testi-card-header">
                                <div class="rating-stars">
                                    {#each Array(5) as _, i}
                                        <span class="star {i < (t.rating || 5) ? 'active' : ''}">★</span>
                                    {/each}
                                </div>
                                <span class="quote-mark">“</span>
                            </div>
                            <h4 class="testi-card-title">"{t.title}"</h4>
                            <p class="testi-card-text">"{t.testimonial}"</p>
                        </div>

                        <!-- Footer Profile -->
                        <div class="testi-card-footer">
                            <div class="avatar-box">
                                {#if t.foto}
                                    <img src={staffImg(t.foto)} alt={t.nama} class="avatar-img" />
                                {:else}
                                    <div class="avatar-placeholder">{t.nama?.substring(0, 1) || 'C'}</div>
                                {/if}
                            </div>
                            <div class="profile-info">
                                <div class="profile-name">{t.nama}</div>
                                <div class="profile-meta">
                                    <span class="verified-tag">
                                        {t.is_verified_purchase ? 'Verified Client' : 'Loyal Customer'}
                                    </span>
                                    <span class="testi-date">{formatDate(t.created_at)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>

            <!-- Pagination Indicator -->
            {#if testimonials.links && testimonials.last_page > 1}
                <div class="testi-pagination">
                    <div class="pagination-info">
                        Menampilkan {testimonials.from} - {testimonials.to} dari {testimonials.total} testimonial
                    </div>
                    <!-- Svelte Inertia standard pagination link integration if needed -->
                    <div class="pagination-links">
                        {#each testimonials.links as link}
                            {#if link.url}
                                <Link to={link.url} class="page-link {link.active ? 'active' : ''}">
                                    {@html link.label}
                                </Link>
                            {:else}
                                <span class="page-link disabled">{@html link.label}</span>
                            {/if}
                        {/each}
                    </div>
                </div>
            {/if}
        {:else}
            <div class="testi-empty">
                <div style="font-size: 3.5rem; margin-bottom: 16px;">💬</div>
                <h3>Belum ada testimonial</h3>
                <p>Jadilah yang pertama memberikan ulasan pengalaman terbaik Anda!</p>
            </div>
        {/if}
    </div>

    <!-- CTA Section -->
    <div class="testi-cta-section">
        <div class="container text-center">
            <h2>Punya pengalaman menarik bersama Cerdas Living?</h2>
            <p>Ulasan Anda sangat berarti bagi kami untuk terus meningkatkan kualitas pelayanan dari waktu ke waktu.</p>
            <Link to={url('/testimoni/kirim')} class="btn btn-gold btn-lg btn-cta">
                Tulis Ulasan Sekarang
            </Link>
        </div>
    </div>
</Layout>

<style>
    .testi-hero {
        background: linear-gradient(135deg, #1a1611 0%, #2b2520 100%);
        color: white;
        position: relative;
        overflow: hidden;
        border-bottom: 1px solid var(--border);
    }

    .testi-hero-bg {
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse 60% 80% at 50% 50%, rgba(201, 168, 76, 0.08) 0%, transparent 60%);
        pointer-events: none;
    }

    .testi-title {
        font-family: 'Playfair Display', serif;
        font-size: clamp(2rem, 5vw, 3.2rem);
        font-weight: 800;
        margin-top: 8px;
        margin-bottom: 16px;
        background: linear-gradient(135deg, #fff 0%, #dcd7cd 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .testi-subtitle {
        color: var(--text-4);
        max-width: 560px;
        margin: 0 auto;
        font-size: 0.95rem;
        line-height: 1.7;
    }

    .testi-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
    }

    @media (max-width: 1024px) {
        .testi-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 768px) {
        .testi-grid {
            grid-template-columns: 1fr;
        }
        .testi-title {
            font-size: 2.2rem;
        }
    }

    .testi-card {
        background: var(--white);
        border: 1px solid var(--border);
        border-radius: var(--radius-xl);
        padding: 32px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 380px;
        box-shadow: var(--shadow-sm);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .testi-card:hover {
        box-shadow: var(--shadow-xl);
        transform: translateY(-5px);
        border-color: transparent;
    }

    .testi-card-body {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }

    .testi-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .rating-stars {
        display: flex;
        gap: 2px;
    }

    .star {
        font-size: 1.15rem;
        color: var(--border);
    }

    .star.active {
        color: #f59e0b;
    }

    .quote-mark {
        font-family: 'Playfair Display', serif;
        font-size: 3.5rem;
        color: var(--border-light);
        line-height: 0;
        margin-top: 24px;
        user-select: none;
    }

    .testi-card-title {
        font-family: 'Playfair Display', serif;
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--text-1);
        margin-bottom: 12px;
        line-height: 1.4;
    }

    .testi-card-text {
        font-size: 0.85rem;
        color: var(--text-2);
        line-height: 1.7;
        font-style: italic;
    }

    .testi-card-footer {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid var(--border-light);
    }

    .avatar-box {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        overflow: hidden;
        border: 2px solid var(--gold-light);
        background: var(--surface-2);
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .avatar-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .avatar-placeholder {
        font-family: 'Playfair Display', serif;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--gold);
    }

    .profile-info {
        flex-grow: 1;
        min-width: 0;
    }

    .profile-name {
        font-size: 0.88rem;
        font-weight: 700;
        color: var(--text-1);
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .profile-meta {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .verified-tag {
        font-size: 0.62rem;
        font-weight: 700;
        color: var(--primary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .testi-date {
        font-size: 0.68rem;
        color: var(--text-3);
    }

    .testi-pagination {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        margin-top: 48px;
    }

    .pagination-info {
        font-size: 0.82rem;
        color: var(--text-3);
        font-weight: 500;
    }

    .pagination-links {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
        justify-content: center;
    }

    :global(.page-link) {
        padding: 6px 12px;
        border-radius: 6px;
        border: 1px solid var(--border);
        font-size: 0.82rem;
        color: var(--text-2);
        text-decoration: none;
        background: var(--white);
        transition: all 0.2s;
    }

    :global(.page-link:hover:not(.disabled)) {
        border-color: var(--gold);
        color: var(--gold);
    }

    :global(.page-link.active) {
        background: var(--text-1);
        color: var(--gold);
        border-color: var(--text-1);
    }

    :global(.page-link.disabled) {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .testi-empty {
        text-align: center;
        padding: 80px 24px;
        background: var(--white);
        border: 1px dashed var(--border);
        border-radius: var(--radius-xl);
        color: var(--text-3);
    }

    .testi-empty h3 {
        color: var(--text-1);
        font-weight: 700;
        margin-bottom: 6px;
    }

    .testi-cta-section {
        background: var(--surface-2);
        border-top: 1px solid var(--border);
        padding: 64px 24px;
    }

    .testi-cta-section h2 {
        font-family: 'Playfair Display', serif;
        font-size: 1.8rem;
        font-weight: 700;
        color: var(--text-1);
        margin-bottom: 12px;
    }

    .testi-cta-section p {
        font-size: 0.95rem;
        color: var(--text-2);
        max-width: 520px;
        margin: 0 auto 24px;
    }


</style>
