<script>
  import AgentLayout from '../../components/AgentLayout.svelte'
</script>

<svelte:head>
  <title>Beli Paket Iklan — Cerdas Living</title>
</svelte:head>

<AgentLayout title="Beli Paket Iklan">
  <div class="pricing-header">
    <h1 class="pricing-title">Tingkatkan Performa Iklan Anda</h1>
    <p class="pricing-desc">Pilih paket ekslusif untuk menjangkau lebih banyak pembeli potensial dengan fitur-fitur premium dari Cerdas Living.</p>
  </div>

  <div class="pricing-container">
    
    <!-- Paket Premium -->
    <div class="pricing-card">
      <div class="pricing-head">
        <h3 class="pkg-name">Paket Premium Ekslusif</h3>
        <div class="pkg-price">
          <span class="currency">Rp</span>
          <span class="amount">49.999</span>
          <span class="period">/bln</span>
        </div>
      </div>
      <div class="pkg-body">
        <ul class="pkg-features">
          <li>
            <span class="material-symbols-rounded check">check_circle</span>
            <span><strong>5</strong> VIP Iklan Ekslusif with Cerdas 3DTours</span>
          </li>
          <li>
            <span class="material-symbols-rounded check">check_circle</span>
            <span><strong>5</strong> Generate Video Tiktok, Instagram Ekslusif</span>
          </li>
          <li>
            <span class="material-symbols-rounded check">check_circle</span>
            <span>Fiturs Ekslusif Youtube, Tiktok Preview</span>
          </li>
          <li>
            <span class="material-symbols-rounded check">check_circle</span>
            <span><strong>1000</strong> Token Studio Design</span>
          </li>
          <li>
            <span class="material-symbols-rounded check">check_circle</span>
            <span><strong>10</strong> Iklan Tambahan (Normal)</span>
          </li>
        </ul>
        <button type="button" class="btn-buy" onclick={() => alert('Fitur pembayaran sedang dalam pengembangan')}>
          Pilih Paket Premium
        </button>
      </div>
    </div>

    <!-- Paket VIP (Recommended) -->
    <div class="pricing-card vip-card">
      <div class="recom-badge">Paling Diminati</div>
      <div class="pricing-head">
        <h3 class="pkg-name text-gold">Paket VIP Ekslusif</h3>
        <div class="pkg-price text-gold">
          <span class="currency">Rp</span>
          <span class="amount">99.999</span>
          <span class="period">/bln</span>
        </div>
      </div>
      <div class="pkg-body">
        <ul class="pkg-features">
          <li>
            <span class="material-symbols-rounded check text-gold">check_circle</span>
            <span><strong>10</strong> VIP Iklan Ekslusif with Cerdas 3DTours</span>
          </li>
          <li>
            <span class="material-symbols-rounded check text-gold">check_circle</span>
            <span><strong>10</strong> Generate Video Tiktok, Instagram Ekslusif</span>
          </li>
          <li>
            <span class="material-symbols-rounded check text-gold">check_circle</span>
            <span>Fiturs Ekslusif Youtube, Tiktok Preview</span>
          </li>
          <li>
            <span class="material-symbols-rounded check text-gold">check_circle</span>
            <span><strong>1500</strong> Token Studio Design</span>
          </li>
          <li>
            <span class="material-symbols-rounded check text-gold">check_circle</span>
            <span><strong>25</strong> Iklan Tambahan (Normal)</span>
          </li>
        </ul>
        <button type="button" class="btn-buy btn-buy-gold" onclick={() => alert('Fitur pembayaran sedang dalam pengembangan')}>
          Pilih Paket VIP
        </button>
      </div>
    </div>

  </div>
</AgentLayout>

<style>
  .pricing-header {
    text-align: center;
    margin-bottom: 40px;
    padding: 20px 0;
  }
  .pricing-title {
    font-family: 'Playfair Display', serif;
    font-size: 2.2rem;
    font-weight: 800;
    color: #1A1A1A;
    margin-bottom: 12px;
  }
  .pricing-desc {
    font-size: 1.05rem;
    color: #6B6B6B;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }

  .pricing-container {
    display: flex;
    justify-content: center;
    gap: 32px;
    flex-wrap: wrap;
    max-width: 900px;
    margin: 0 auto 60px;
  }

  .pricing-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 24px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.03);
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
  }
  .pricing-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.08);
  }

  .vip-card {
    border: 2px solid #C9A84C;
    box-shadow: 0 15px 35px rgba(201,168,76,0.15);
  }
  .vip-card:hover {
    box-shadow: 0 25px 50px rgba(201,168,76,0.2);
  }

  .recom-badge {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #C9A84C, #E0B850);
    color: #ffffff;
    font-size: 0.8rem;
    font-weight: 700;
    padding: 6px 20px;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    z-index: 10;
  }

  .pricing-head {
    padding: 40px 32px 24px;
    text-align: center;
    background: #fafafa;
    border-bottom: 1px solid #e2e8f0;
  }
  .vip-card .pricing-head {
    background: #fdfaf4;
    border-bottom-color: rgba(201,168,76,0.2);
    padding-top: 50px;
  }

  .pkg-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0 0 16px;
    color: #334155;
  }
  .pkg-price {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    line-height: 1;
  }
  .currency { font-size: 1.2rem; font-weight: 700; margin-top: 6px; margin-right: 4px; }
  .amount { font-size: 3rem; font-weight: 800; letter-spacing: -1px; }
  .period { font-size: 1rem; font-weight: 500; color: #94a3b8; align-self: flex-end; margin-bottom: 6px; }

  .text-gold { color: #C9A84C !important; }

  .pkg-body {
    padding: 32px;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .pkg-features {
    list-style: none;
    padding: 0;
    margin: 0 0 32px 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex: 1;
  }
  .pkg-features li {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 0.95rem;
    color: #475569;
    line-height: 1.5;
  }
  .check {
    font-size: 20px;
    color: #10b981;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .btn-buy {
    width: 100%;
    padding: 14px;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 700;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #cbd5e1;
  }
  .btn-buy:hover {
    background: #e2e8f0;
    color: #0f172a;
  }

  .btn-buy-gold {
    background: linear-gradient(135deg, #C9A84C, #E0B850);
    color: #ffffff;
    border: none;
    box-shadow: 0 4px 14px rgba(201,168,76,0.3);
  }
  .btn-buy-gold:hover {
    background: linear-gradient(135deg, #b89842, #cfaa43);
    color: #ffffff;
    box-shadow: 0 6px 20px rgba(201,168,76,0.4);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    .pricing-container {
      flex-direction: column;
      align-items: center;
    }
  }
</style>
