<script>
  import { Router, Route } from "svelte-routing";
  
  // Phase 1 (Blade Replicas)
  import Login from "./pages/Login.svelte";
  import Register from "./pages/Register.svelte";
  import Dashboard from "./pages/Dashboard.svelte";
  import Profil from "./pages/Profil.svelte";
  import Proyek from "./pages/Proyek.svelte";
  import Upload from "./pages/Upload.svelte";
  import Design from "./pages/Studio/Design.svelte";
  import LoginModal from "./components/LoginModal.svelte";
  import RegisterModal from "./components/RegisterModal.svelte";

  // Phase 2 (Inertia Replicas)
  import Landing from "./pages/Landing.svelte";
  import AiAssistant from "./pages/AiAssistant.svelte";
  import PropertyIndex from "./pages/Property/Index.svelte";
  import PropertyShow from "./pages/Property/Show.svelte";
  
  // Unused agent auth components removed
  import AgentProfil from "./pages/Agent/Profil.svelte";
  import AgentDashboard from "./pages/Agent/Dashboard/Index.svelte";
  import AgentIklanIndex from "./pages/Agent/Iklan/Index.svelte";
  import AgentIklanCreate from "./pages/Agent/Iklan/Create.svelte";
  import AgentIklanEdit from "./pages/Agent/Iklan/Edit.svelte";
  
  import BeritaShow from "./pages/Berita/Show.svelte";
  
  import TestimoniIndex from "./pages/Testimoni/Index.svelte";
  import TestimoniCreate from "./pages/Testimoni/Create.svelte";
  
  import Kontak from "./pages/Kontak.svelte";
  import Tentang from "./pages/Tentang.svelte";
  import Privasi from "./pages/Privasi.svelte";
  import Syarat from "./pages/Syarat.svelte";
  import KprCalculator from "./pages/KprCalculator.svelte";
  import Gallery from "./pages/Gallery.svelte";
  import Viewer from "./pages/Viewer.svelte";
  
  export let url = "";

  import { StudioLoginModal, StudioRegisterModal, EjasaLoginModal, EjasaRegisterModal } from '@cerdas/shell';

  let showLoginModal = false;
  let showRegisterModal = false;
  let showStudioLoginModal = false;
  let showStudioRegisterModal = false;
  let showEjasaLoginModal = false;
  let showEjasaRegisterModal = false;

  import { onMount } from "svelte";
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
    <!-- Public Routes -->
    <Route path="/"><Landing /></Route>
    <Route path="/properti"><PropertyIndex /></Route>
    <Route path="/properti/:slug" let:params><PropertyShow slug={params.slug} /></Route>
    <Route path="/ai/assistant"><AiAssistant /></Route>
    
    <Route path="/berita/:slug" let:params><BeritaShow slug={params.slug} /></Route>
    
    <Route path="/testimoni"><TestimoniIndex /></Route>
    <Route path="/testimoni/kirim"><TestimoniCreate /></Route>
    
    <Route path="/kpr-calculator"><KprCalculator /></Route>
    <Route path="/gallery"><Gallery /></Route>
    <Route path="/viewer"><Viewer /></Route>
    
    <Route path="/kontak"><Kontak /></Route>
    <Route path="/tentang"><Tentang /></Route>
    <Route path="/privasi"><Privasi /></Route>
    <Route path="/syarat"><Syarat /></Route>

    <!-- Agent Routes -->
    <Route path="/agent/login"><Login /></Route>
    <Route path="/pasang-iklan"><Register /></Route>
    <Route path="/agent/dashboard"><AgentDashboard /></Route>
    <Route path="/agent/profil"><AgentProfil /></Route>
    <Route path="/agent/iklan"><AgentIklanIndex /></Route>
    <Route path="/agent/iklan/tambah"><AgentIklanCreate /></Route>
    <Route path="/agent/iklan/:id/edit" let:params><AgentIklanEdit id={params.id} /></Route>

    <!-- Studio Routes (Phase 1) -->
    <Route path="/login"><Login /></Route>
    <Route path="/studio/login"><Login /></Route>
    <Route path="/studio/register"><Register /></Route>
    <Route path="/studio/hub"><Dashboard /></Route>
    <Route path="/studio/profil"><Profil /></Route>
    <Route path="/studio/proyek"><Proyek /></Route>
    <Route path="/studio/upload"><Upload /></Route>
    <Route path="/studio/design"><Design /></Route>
    <Route path="/design"><Design /></Route>
  </div>
</Router>
