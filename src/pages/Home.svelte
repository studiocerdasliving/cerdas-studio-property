<script>
  import { link } from "svelte-routing";
</script>

<main class="min-h-screen bg-slate-900 text-white font-sans selection:bg-blue-500 selection:text-white">
  <!-- Navbar -->
  <nav class="sticky top-0 z-50 backdrop-blur-lg bg-slate-900/80 border-b border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold">
            PS
          </div>
          <span class="font-semibold text-xl tracking-tight">Portal Studio</span>
        </div>
        
        <div class="hidden md:block">
          <div class="ml-10 flex items-baseline space-x-4">
            <a href="/" use:link class="px-3 py-2 rounded-md text-sm font-medium bg-slate-800 text-white hover:bg-slate-700 transition-colors">Beranda</a>
            <a href="/properti" use:link class="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">Properti</a>
            <a href="/ai" use:link class="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">AI Assistant</a>
            <a href="/studio" use:link class="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">Studio 3D</a>
          </div>
        </div>

        <div>
          <a href="/login" use:link class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-blue-500/20 inline-block">
            Login Agen
          </a>
        </div>
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <div class="relative overflow-hidden">
    <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
    <div class="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl"></div>
    <div class="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl"></div>
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative z-10 text-center">
      <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
        Masa Depan <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Properti</span> & <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Desain 3D</span>
      </h1>
      <p class="mt-4 text-xl text-slate-400 max-w-3xl mx-auto">
        Portal Cerdas untuk agen properti dan desainer interior. Didukung penuh oleh Gemini AI untuk pencarian pintar dan otomatisasi deskripsi properti.
      </p>
    </div>
  </div>
</main>
