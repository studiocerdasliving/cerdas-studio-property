<script>
  import { Router, Route } from "svelte-routing";
  import ComposerRythmeViews from "./composer-rythme/ComposerRythmeViews.svelte";
  import LoginModal from "./components/LoginModal.svelte";
  import RegisterModal from "./components/RegisterModal.svelte";
  import { onMount } from "svelte";
  import { StudioLoginModal, StudioRegisterModal, EjasaLoginModal, EjasaRegisterModal } from '@cerdas/shell';
  
  export let url = "";

  let showLoginModal = false;
  let showRegisterModal = false;
  let showStudioLoginModal = false;
  let showStudioRegisterModal = false;
  let showEjasaLoginModal = false;
  let showEjasaRegisterModal = false;

  onMount(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('login') === 'true') {
        showLoginModal = true;
    }
    if (searchParams.get('register') === 'true') {
        showRegisterModal = true;
    }

    const loginHandler = () => { showLoginModal = true; };
    const registerHandler = () => { showRegisterModal = true; };
    const studioLoginHandler = () => { showStudioLoginModal = true; };
    const studioRegisterHandler = () => { showStudioRegisterModal = true; };
    const ejasaLoginHandler = () => { showEjasaLoginModal = true; };
    const ejasaRegisterHandler = () => { showEjasaRegisterModal = true; };

    window.addEventListener('open-login-modal', loginHandler);
    window.addEventListener('open-register-modal', registerHandler);
    window.addEventListener('open-studio-login-modal', studioLoginHandler);
    window.addEventListener('open-studio-register-modal', studioRegisterHandler);
    window.addEventListener('open-ejasa-login-modal', ejasaLoginHandler);
    window.addEventListener('open-ejasa-register-modal', ejasaRegisterHandler);
    
    return () => {
      window.removeEventListener('open-login-modal', loginHandler);
      window.removeEventListener('open-register-modal', registerHandler);
      window.removeEventListener('open-studio-login-modal', studioLoginHandler);
      window.removeEventListener('open-studio-register-modal', studioRegisterHandler);
      window.removeEventListener('open-ejasa-login-modal', ejasaLoginHandler);
      window.removeEventListener('open-ejasa-register-modal', ejasaRegisterHandler);
    };
  });
</script>

<Router {url}>
  {#if showLoginModal}
    <LoginModal bind:open={showLoginModal} onSwitchToRegister={() => {showLoginModal=false; showRegisterModal=true;}} />
  {/if}
  {#if showRegisterModal}
    <RegisterModal bind:open={showRegisterModal} onSwitchToLogin={() => {showRegisterModal=false; showLoginModal=true;}} />
  {/if}
  {#if showStudioLoginModal}
    <StudioLoginModal bind:open={showStudioLoginModal} onClose={() => showStudioLoginModal=false} />
  {/if}
  {#if showStudioRegisterModal}
    <StudioRegisterModal bind:open={showStudioRegisterModal} onClose={() => showStudioRegisterModal=false} />
  {/if}
  {#if showEjasaLoginModal}
    <EjasaLoginModal bind:open={showEjasaLoginModal} onClose={() => showEjasaLoginModal=false} />
  {/if}
  {#if showEjasaRegisterModal}
    <EjasaRegisterModal bind:open={showEjasaRegisterModal} onClose={() => showEjasaRegisterModal=false} />
  {/if}
  <div>
    <Route path="/"><ComposerRythmeViews routeKey="/" /></Route>
    <Route path="/properti"><ComposerRythmeViews routeKey="/properti" /></Route>
    <Route path="/properti/:slug" let:params><ComposerRythmeViews routeKey="/properti/:slug" {params} /></Route>
    <Route path="/ai/assistant"><ComposerRythmeViews routeKey="/ai/assistant" /></Route>
    <Route path="/berita/:slug" let:params><ComposerRythmeViews routeKey="/berita/:slug" {params} /></Route>
    <Route path="/testimoni"><ComposerRythmeViews routeKey="/testimoni" /></Route>
    <Route path="/testimoni/kirim"><ComposerRythmeViews routeKey="/testimoni/kirim" /></Route>
    <Route path="/kpr-calculator"><ComposerRythmeViews routeKey="/kpr-calculator" /></Route>
    <Route path="/gallery"><ComposerRythmeViews routeKey="/gallery" /></Route>
    <Route path="/viewer"><ComposerRythmeViews routeKey="/viewer" /></Route>
    <Route path="/kontak"><ComposerRythmeViews routeKey="/kontak" /></Route>
    <Route path="/tentang"><ComposerRythmeViews routeKey="/tentang" /></Route>
    <Route path="/privasi"><ComposerRythmeViews routeKey="/privasi" /></Route>
    <Route path="/syarat"><ComposerRythmeViews routeKey="/syarat" /></Route>
    <Route path="/agent/login"><ComposerRythmeViews routeKey="/agent/login" /></Route>
    <Route path="/login"><ComposerRythmeViews routeKey="/login" /></Route>
    <Route path="/register"><ComposerRythmeViews routeKey="/register" /></Route>
    <Route path="/agent/register"><ComposerRythmeViews routeKey="/agent/register" /></Route>
    <Route path="/pasang-iklan"><ComposerRythmeViews routeKey="/pasang-iklan" /></Route>
    <Route path="/agent/dashboard"><ComposerRythmeViews routeKey="/agent/dashboard" /></Route>
    <Route path="/agent/beli-paket-iklan"><ComposerRythmeViews routeKey="/agent/beli-paket-iklan" /></Route>
    <Route path="/agent/profil"><ComposerRythmeViews routeKey="/agent/profil" /></Route>
    <Route path="/agent/iklan"><ComposerRythmeViews routeKey="/agent/iklan" /></Route>
    <Route path="/agent/iklan/tambah"><ComposerRythmeViews routeKey="/agent/iklan/tambah" /></Route>
    <Route path="/agent/iklan/:id/edit" let:params><ComposerRythmeViews routeKey="/agent/iklan/:id/edit" {params} /></Route>
  </div>
</Router>
