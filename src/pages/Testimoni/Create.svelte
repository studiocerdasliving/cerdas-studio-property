<script>
  import Layout from '../../components/Layout.svelte'
  import { apiFetch } from '../../lib/api.js'
  import { navigate } from 'svelte-routing'
  import { url } from '../../lib/url.svelte.js'

  let nama_user = $state('');
  let email = $state('');
  let komentar = $state('');
  let rating = $state(5);
  let id_property = $state(''); // Optional

  let isLoading = $state(false);
  let errorMsg = $state('');

  /** @param {Event} e */
  async function submitTestimoni(e) {
    e.preventDefault();
    isLoading = true;
    errorMsg = '';
    
    try {
      const payload = {
        nama_user, email, komentar, rating: typeof rating === 'string' ? parseInt(rating) : rating,
        id_property: id_property ? parseInt(id_property) : null
      };
      
      await apiFetch('/testimoni', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      alert('Testimoni berhasil dikirim! Terima kasih.');
      navigate(url('/testimoni'));
    } catch (error) {
      const err = /** @type {any} */ (error);
      errorMsg = err.message || 'Gagal menyimpan testimoni';
    } finally {
      isLoading = false;
    }
  }
</script>

<Layout title="Kirim Testimoni">
  <div class="container" style="padding: 60px 0; max-width: 600px;">
    <h1 style="font-family: 'Playfair Display', serif; font-size: 2rem; color: var(--text-1); text-align: center; margin-bottom: 32px;">Beri Ulasan Anda</h1>
    
    <form class="card" style="padding: 32px;" onsubmit={submitTestimoni}>
      {#if errorMsg}
        <div style="background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 12px 16px; border-radius: var(--radius); margin-bottom: 24px; font-size: 0.9rem;">
          {errorMsg}
        </div>
      {/if}

      <div class="form-group" style="margin-bottom: 20px;">
        <label class="form-label" for="nama">Nama Lengkap</label>
        <input class="form-input" id="nama" type="text" bind:value={nama_user} required placeholder="John Doe" />
      </div>

      <div class="form-group" style="margin-bottom: 20px;">
        <label class="form-label" for="email">Email</label>
        <input class="form-input" id="email" type="email" bind:value={email} required placeholder="john@example.com" />
      </div>

      <div class="form-group" style="margin-bottom: 20px;">
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label class="form-label">Rating (1-5)</label>
        <div style="display: flex; gap: 8px; margin-top: 8px;">
          {#each [1, 2, 3, 4, 5] as r}
            <button type="button" 
              onclick={() => rating = r}
              style="background: none; border: none; cursor: pointer; color: {rating >= r ? 'var(--gold)' : 'var(--border-light)'}; padding: 0;">
              <span class="material-symbols-rounded" style="font-size: 2rem; font-variation-settings: 'FILL' {rating >= r ? 1 : 0};">star</span>
            </button>
          {/each}
        </div>
      </div>

      <div class="form-group" style="margin-bottom: 32px;">
        <label class="form-label" for="komentar">Komentar / Ulasan</label>
        <textarea class="form-input" id="komentar" bind:value={komentar} required rows="4" placeholder="Pengalaman yang luar biasa..."></textarea>
      </div>

      <button type="submit" class="btn btn-gold btn-full" disabled={isLoading}>
        {isLoading ? 'Mengirim...' : 'Kirim Testimoni'}
      </button>
    </form>
  </div>
</Layout>
