<script>
    import Layout from '../components/Layout.svelte';
</script>

<Layout>
    <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 px-6">
        <div class="max-w-5xl mx-auto">
            <!-- Header Section -->
            <div class="text-center mb-16 animate-fade-in-up">
                <h1 class="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-amber-600 mb-6 tracking-tight">
                    Tentang Cerdas Living
                </h1>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    Masa depan desain interior dan arsitektur yang interaktif, cerdas, dan terjangkau untuk semua orang.
                </p>
            </div>

            <!-- Intro Section -->
            <div class="bg-white rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-12 animate-fade-in-up hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                <p class="text-gray-700 leading-relaxed text-lg mb-6">
                    Selamat datang di <strong>Cerdas Living</strong>, inovasi untuk menjembatani kebutuhan desain interior, arsitektur, dan real estat di era digital.
                </p>
                <p class="text-gray-700 leading-relaxed text-lg">
                    Kami percaya bahwa mendesain rumah atau ruangan impian harusnya mudah, interaktif, dan menyenangkan. Oleh karena itu, kami membangun ekosistem digital yang tidak hanya menampilkan listing properti berkualitas, namun juga menyediakan alat desain 3D mutakhir yang dapat diakses langsung dari peramban Anda.
                </p>
            </div>

            <!-- Content Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                <!-- Visi & Misi -->
                <div class="bg-white rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1 md:col-span-2">
                    <div class="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
                        <span class="material-symbols-rounded text-3xl text-amber-600">visibility</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h2 class="text-2xl font-bold text-gray-900 mb-4">Visi Kami</h2>
                            <p class="text-gray-600 leading-relaxed">
                                Menjadi platform <em>one-stop solution</em> terbaik di Asia Tenggara yang mengintegrasikan pencarian properti, eksplorasi material bangunan, dan teknologi desain 3D yang interaktif.
                            </p>
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold text-gray-900 mb-4">Misi Kami</h2>
                            <ul class="list-disc pl-5 space-y-2 text-gray-600">
                                <li>Menghubungkan klien, agen, arsitek, dan kontraktor dalam satu platform kolaboratif.</li>
                                <li>Memberikan pengalaman simulasi desain yang realistis dan instan menggunakan teknologi AI.</li>
                                <li>Membangun ekosistem e-commerce material bangunan dan furnitur yang terpercaya.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Card 1 -->
                <div class="bg-white rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1">
                    <div class="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
                        <span class="material-symbols-rounded text-3xl text-orange-600">architecture</span>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-4">Revolusi Desain 3D</h2>
                    <p class="text-gray-600 leading-relaxed">
                        Cerdas Living menghadirkan <strong>Studio 3D Builder</strong> langsung di peramban Anda. Tanpa perlu mengunduh aplikasi berat, Anda bisa merancang rumah, mengatur furnitur, dan memvisualisasikan ruangan impian secara seketika (real-time).
                    </p>
                </div>

                <!-- Card 2 -->
                <div class="bg-white rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1">
                    <div class="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center mb-6">
                        <span class="material-symbols-rounded text-3xl text-yellow-600">smart_toy</span>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-4">Didukung Kecerdasan Buatan (AI)</h2>
                    <p class="text-gray-600 leading-relaxed">
                        Desain menjadi lebih pintar. Cerdas Living dilengkapi dengan Asisten AI yang siap membantu memberikan rekomendasi gaya, tata letak, hingga pemilihan material bangunan yang paling sesuai dengan anggaran Anda.
                    </p>
                </div>

                <!-- Card 3 -->
                <div class="bg-white rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1 md:col-span-2">
                    <div class="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                        <span class="material-symbols-rounded text-3xl text-emerald-600">public</span>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-4">Ekosistem Terintegrasi</h2>
                    <p class="text-gray-600 leading-relaxed">
                        Kami bukan sekadar alat gambar. Cerdas Living mengintegrasikan dunia desain dengan realitas konstruksi. Temukan furnitur asli dari vendor lokal, hubungi agen properti, hingga dapatkan estimasi biaya bahan bangunan (RAB) langsung dari desain yang Anda buat.
                    </p>
                </div>
            </div>
        </div>
    </div>
</Layout>

<style>
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
        animation: fadeInUp 0.8s ease-out forwards;
    }
</style>
