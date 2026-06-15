<script>
    import Layout from '../components/Layout.svelte';
    
    // Bank Data
    const banks = [
        { 
            name: 'BCA', logo: 'https://logo.clearbit.com/bca.co.id',
            rates: [
                { label: 'Fixed 1 Tahun', value: 2.75 },
                { label: 'Fixed 3 Tahun', value: 3.75 },
                { label: 'Fixed 5 Tahun', value: 4.75 },
                { label: 'Floating', value: 11.00 }
            ]
        },
        { 
            name: 'Bank Mandiri', logo: 'https://logo.clearbit.com/bankmandiri.co.id',
            rates: [
                { label: 'Fixed 1 Tahun', value: 2.55 },
                { label: 'Fixed 3 Tahun', value: 3.99 },
                { label: 'Fixed 5 Tahun', value: 4.99 },
                { label: 'Floating', value: 12.00 }
            ]
        },
        { 
            name: 'BNI', logo: 'https://logo.clearbit.com/bni.co.id',
            rates: [
                { label: 'Fixed 1 Tahun', value: 2.75 },
                { label: 'Fixed 3 Tahun', value: 3.75 },
                { label: 'Fixed 5 Tahun', value: 4.75 },
                { label: 'Floating', value: 12.50 }
            ]
        },
        { 
            name: 'BRI', logo: 'https://logo.clearbit.com/bri.co.id',
            rates: [
                { label: 'Fixed 1 Tahun', value: 2.75 },
                { label: 'Fixed 3 Tahun', value: 3.75 },
                { label: 'Fixed 5 Tahun', value: 4.75 },
                { label: 'Floating', value: 13.00 }
            ]
        },
        { 
            name: 'BTN', logo: 'https://logo.clearbit.com/btn.co.id',
            rates: [
                { label: 'Fixed 1 Tahun', value: 2.99 },
                { label: 'Fixed 3 Tahun', value: 3.99 },
                { label: 'Fixed 5 Tahun', value: 4.99 },
                { label: 'Floating', value: 12.50 }
            ]
        },
        { 
            name: 'CIMB Niaga', logo: 'https://logo.clearbit.com/cimbniaga.co.id',
            rates: [
                { label: 'Fixed 3 Tahun', value: 4.25 },
                { label: 'Fixed 5 Tahun', value: 5.50 },
                { label: 'Floating', value: 11.00 }
            ]
        },
        { 
            name: 'OCBC', logo: 'https://logo.clearbit.com/ocbc.id',
            rates: [
                { label: 'Fixed 3 Tahun', value: 3.99 },
                { label: 'Fixed 5 Tahun', value: 4.99 },
                { label: 'Floating', value: 11.50 }
            ]
        },
        { 
            name: 'Panin Bank', logo: 'https://logo.clearbit.com/panin.co.id',
            rates: [
                { label: 'Fixed 1 Tahun', value: 2.50 },
                { label: 'Fixed 3 Tahun', value: 3.50 },
                { label: 'Fixed 5 Tahun', value: 4.50 },
                { label: 'Floating', value: 10.50 }
            ]
        },
        { 
            name: 'Custom (Input Manual)', logo: '',
            rates: [
                { label: 'Custom Rate', value: 5.00 }
            ]
        }
    ];

    let propertyPrice = $state(500000000);
    let downPaymentPercent = $state(20);
    let selectedBankIndex = $state(0); // Default to BCA
    let selectedRateIndex = $state(0);
    let customInterestRate = $state(7.00);
    let tenorYears = $state(15);
    
    let dropdownOpen = $state(false);
    let rateDropdownOpen = $state(false);
    
    // Reactivity
    let activeRateIndex = $derived(Math.min(selectedRateIndex, banks[selectedBankIndex].rates.length - 1));
    let isCustom = $derived(selectedBankIndex === banks.length - 1);
    
    let interestRate = $derived(
        isCustom 
            ? customInterestRate 
            : banks[selectedBankIndex].rates[activeRateIndex].value
    );
    let rateTypeLabel = $derived(
        isCustom
            ? "Custom Rate"
            : banks[selectedBankIndex].rates[activeRateIndex].label
    );
    
    let downPayment = $derived((propertyPrice * downPaymentPercent) / 100);
    let principal = $derived(propertyPrice - downPayment);
    let monthlyInterest = $derived((interestRate / 100) / 12);
    let totalMonths = $derived(tenorYears * 12);
    
    let monthlyPayment = $derived((principal * monthlyInterest * Math.pow(1 + monthlyInterest, totalMonths)) / (Math.pow(1 + monthlyInterest, totalMonths) - 1));
    let totalPayment = $derived(monthlyPayment * totalMonths);
    let totalInterest = $derived(totalPayment - principal);
    
    /** @param {number|string|null} num */
    function formatCurrency(num) {
        if (!num || isNaN(Number(num)) || !isFinite(Number(num))) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(num));
    }

    /** @param {number} angka */
    function terbilang(angka) {
        if (!angka || angka <= 0) return 'Nol rupiah';
        
        /** 
         * @param {number} n 
         * @returns {string}
         */
        function convert(n) {
            const huruf = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
            if (n < 12) return huruf[n];
            if (n < 20) return convert(n - 10) + " belas";
            if (n < 100) return convert(Math.floor(n / 10)) + " puluh " + convert(n % 10);
            if (n < 200) return "seratus " + convert(n - 100);
            if (n < 1000) return convert(Math.floor(n / 100)) + " ratus " + convert(n % 100);
            if (n < 2000) return "seribu " + convert(n - 1000);
            if (n < 1000000) return convert(Math.floor(n / 1000)) + " ribu " + convert(n % 1000);
            if (n < 1000000000) return convert(Math.floor(n / 1000000)) + " juta " + convert(n % 1000000);
            if (n < 1000000000000) return convert(Math.floor(n / 1000000000)) + " milyar " + convert(n % 1000000000);
            if (n < 1000000000000000) return convert(Math.floor(n / 1000000000000)) + " triliun " + convert(n % 1000000000000);
            return "";
        }
        
        let hasil = convert(angka).trim().replace(/\s+/g, ' ');
        return hasil + " rupiah";
    }

    // click outside handler for dropdown
    /** @param {MouseEvent} e */
    function windowClick(e) {
        const target = /** @type {HTMLElement} */ (e.target);
        if (!target.closest?.('.custom-dropdown')) {
            dropdownOpen = false;
            rateDropdownOpen = false;
        }
    }
</script>

<svelte:window onclick={windowClick} />

<Layout title="Kalkulator KPR" description="Hitung simulasi KPR untuk hunian impian Anda dengan Cerdas Living.">
    <!-- Hero / Header -->
    <div class="kpr-hero">
        <div class="container text-center">
            <h1 class="kpr-h1">Kalkulator KPR Cerdas</h1>
            <p class="kpr-subtitle">Simulasikan cicilan properti impian Anda berdasarkan suku bunga bank terbaik.</p>
        </div>
    </div>

    <div class="container kpr-container">
        <div class="kpr-grid">
            
            <!-- Left: Inputs -->
            <div class="kpr-card">
                <div class="kpr-card-header">
                    <span class="material-symbols-rounded">tune</span> Parameter Simulasi
                </div>
                
                <div class="kpr-form">
                    <!-- Harga Properti -->
                    <div class="form-group">
                        <label for="propertyPrice">Harga Properti</label>
                        <div class="input-prefix-wrap">
                            <span class="prefix">Rp</span>
                            <input 
                                id="propertyPrice" 
                                type="number" 
                                value={propertyPrice} 
                                oninput={(e) => {
                                    let target = /** @type {HTMLInputElement} */ (e.currentTarget);
                                    let val = target.value.toString();
                                    if(val.length > 12) {
                                        val = val.slice(0, 12);
                                        target.value = val;
                                    }
                                    propertyPrice = parseInt(val) || 0;
                                }}
                                class="form-input with-prefix" 
                            />
                        </div>
                        <div class="terbilang-text">{terbilang(propertyPrice)}</div>
                    </div>
                    
                    <!-- Uang Muka -->
                    <div class="form-group">
                        <div class="label-flex">
                            <label for="dpPercent">Uang Muka (DP)</label>
                            <span class="dp-value">{downPaymentPercent}% ({formatCurrency(downPayment)})</span>
                        </div>
                        <input id="dpPercent" type="range" bind:value={downPaymentPercent} min="0" max="100" class="range-slider" />
                    </div>
                    
                    <div class="form-row">
                        <!-- Tenor -->
                        <div class="form-group">
                            <label for="tenor">Tenor Waktu</label>
                            <div class="input-suffix-wrap">
                                <input id="tenor" type="number" bind:value={tenorYears} min="1" max="30" class="form-input" />
                                <span class="suffix">Tahun</span>
                            </div>
                        </div>

                        <!-- Pilih Bank -->
                        <div class="form-group">
                            <!-- svelte-ignore a11y_label_has_associated_control -->
                            <label>Suku Bunga Bank</label>
                            <div class="custom-dropdown">
                                <!-- svelte-ignore a11y_click_events_have_key_events -->
                                <!-- svelte-ignore a11y_no_static_element_interactions -->
                                <div class="dropdown-selected {dropdownOpen ? 'open' : ''}" onclick={() => dropdownOpen = !dropdownOpen}>
                                    <div class="selected-content">
                                        {#if banks[selectedBankIndex].logo}
                                            <img src={banks[selectedBankIndex].logo} alt="" onerror={(e) => { /** @type {HTMLImageElement} */ (e.currentTarget).style.display='none'; }} class="bank-icon" />
                                        {:else}
                                            <span class="material-symbols-rounded default-icon">tune</span>
                                        {/if}
                                        <span>{banks[selectedBankIndex].name}</span>
                                    </div>
                                    <span class="material-symbols-rounded drop-arrow">expand_more</span>
                                </div>
                                
                                {#if dropdownOpen}
                                    <div class="dropdown-menu">
                                        {#each banks as bank, i}
                                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                                            <!-- svelte-ignore a11y_no_static_element_interactions -->
                                            <div class="dropdown-item {selectedBankIndex === i ? 'active' : ''}" 
                                                 onclick={() => { selectedBankIndex = i; dropdownOpen = false; }}>
                                                {#if bank.logo}
                                                    <img src={bank.logo} alt="" onerror={(e) => { /** @type {HTMLImageElement} */ (e.currentTarget).style.display='none'; }} class="bank-icon" />
                                                {:else}
                                                    <span class="material-symbols-rounded default-icon">tune</span>
                                                {/if}
                                                {bank.name}
                                            </div>
                                        {/each}
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>

                    <div class="form-row">
                        <!-- Tipe Bunga -->
                        <div class="form-group">
                            <!-- svelte-ignore a11y_label_has_associated_control -->
                            <label>Tipe Suku Bunga</label>
                            <div class="custom-dropdown">
                                <!-- svelte-ignore a11y_click_events_have_key_events -->
                                <!-- svelte-ignore a11y_no_static_element_interactions -->
                                <div class="dropdown-selected {rateDropdownOpen ? 'open' : ''}" onclick={() => rateDropdownOpen = !rateDropdownOpen}>
                                    <div class="selected-content">
                                        <span class="material-symbols-rounded default-icon">percent</span>
                                        <span>{isCustom ? 'Custom Rate' : banks[selectedBankIndex].rates[activeRateIndex].label}</span>
                                    </div>
                                    {#if !isCustom}
                                    <span class="material-symbols-rounded drop-arrow">expand_more</span>
                                    {/if}
                                </div>
                                
                                {#if rateDropdownOpen && !isCustom}
                                    <div class="dropdown-menu">
                                        {#each banks[selectedBankIndex].rates as rate, i}
                                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                                            <!-- svelte-ignore a11y_no_static_element_interactions -->
                                            <div class="dropdown-item {selectedRateIndex === i ? 'active' : ''}" 
                                                 onclick={() => { selectedRateIndex = i; rateDropdownOpen = false; }}>
                                                <span class="material-symbols-rounded default-icon">percent</span>
                                                {rate.label}
                                            </div>
                                        {/each}
                                    </div>
                                {/if}
                            </div>
                        </div>

                        <!-- Custom Bunga / Estimasi -->
                        {#if isCustom}
                            <div class="form-group animate-fade">
                                <label for="customRate">Suku Bunga Custom</label>
                                <div class="input-suffix-wrap">
                                    <input id="customRate" type="number" bind:value={customInterestRate} step="0.1" class="form-input" />
                                    <span class="suffix">% p.a.</span>
                                </div>
                            </div>
                        {:else}
                            <div class="form-group">
                                <!-- svelte-ignore a11y_label_has_associated_control -->
                                <label>Estimasi Persentase</label>
                                <div class="bank-rate-info" style="margin-top: 0; padding: 10px 16px;">
                                    <strong>{interestRate}% p.a.</strong>
                                </div>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
            
            <!-- Right: Summary -->
            <div class="kpr-summary">
                <div class="summary-top">
                    <div class="summary-label">Estimasi Cicilan per Bulan</div>
                    <div class="summary-amount text-gradient-gold">{formatCurrency(monthlyPayment)}</div>
                </div>
                
                <div class="summary-breakdown">
                    <div class="breakdown-row">
                        <span>Harga Properti</span>
                        <span class="val">{formatCurrency(propertyPrice)}</span>
                    </div>
                    <div class="breakdown-row">
                        <span>Uang Muka (DP)</span>
                        <span class="val">{formatCurrency(downPayment)}</span>
                    </div>
                    <div class="breakdown-row highlight-row">
                        <span>Pokok Pinjaman</span>
                        <span class="val">{formatCurrency(principal)}</span>
                    </div>
                </div>

                <div class="summary-details">
                    <div class="detail-box">
                        <div class="d-label">Tenor</div>
                        <div class="d-val">{tenorYears} Tahun</div>
                        <div class="d-sub">({totalMonths} bulan)</div>
                    </div>
                    <div class="detail-box">
                        <div class="d-label">Bunga</div>
                        <div class="d-val">{interestRate}%</div>
                        <div class="d-sub">{rateTypeLabel}</div>
                    </div>
                </div>

                <div class="summary-totals">
                    <div class="t-row">
                        <span>Estimasi Total Bunga</span>
                        <span class="c-red">{formatCurrency(totalInterest)}</span>
                    </div>
                    <div class="t-row t-grand">
                        <span>Total Pembayaran</span>
                        <span class="c-gold">{formatCurrency(totalPayment)}</span>
                    </div>
                </div>
                
                <div class="summary-disclaimer">
                    <span class="material-symbols-rounded">info</span>
                    <p>Perhitungan ini hanyalah estimasi berdasarkan fixed rate. Nilai sebenarnya dapat berbeda tergantung pada suku bunga floating, provisi, asuransi, dan kebijakan masing-masing bank penyedia layanan KPR.</p>
                </div>
            </div>

        </div>
    </div>
</Layout>

<style>
    .kpr-hero {
        padding: 60px 0 40px;
        background: linear-gradient(to bottom, var(--cream) 0%, var(--surface-2) 100%);
        border-bottom: 1px solid var(--border);
    }
    .kpr-h1 {
        font-family: 'Playfair Display', serif;
        font-size: 2.5rem;
        font-weight: 800;
        color: var(--text-1);
        margin-bottom: 12px;
    }
    .kpr-subtitle {
        color: var(--text-2);
        font-size: 1.1rem;
    }

    .kpr-container {
        padding-top: 40px;
        padding-bottom: 80px;
    }
    .kpr-grid {
        display: grid;
        grid-template-columns: 1fr 420px;
        gap: 32px;
        align-items: start;
    }
    @media (max-width: 992px) {
        .kpr-grid { grid-template-columns: 1fr; }
    }

    /* Card & Forms */
    .kpr-card {
        background: var(--white);
        border: 1px solid var(--border);
        border-radius: var(--radius-xl);
        padding: 32px;
        box-shadow: var(--shadow);
    }
    .kpr-card-header {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-1);
        margin-bottom: 24px;
        display: flex;
        align-items: center;
        gap: 8px;
        border-bottom: 1px solid var(--border-light);
        padding-bottom: 16px;
    }
    .kpr-card-header .material-symbols-rounded {
        color: var(--gold);
    }

    .kpr-form { display: flex; flex-direction: column; gap: 24px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
    
    .form-group label {
        display: block;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-2);
        margin-bottom: 8px;
    }
    .terbilang-text {
        font-size: 0.8rem;
        color: var(--gold);
        font-weight: 500;
        margin-top: 6px;
        font-style: italic;
        text-transform: capitalize;
    }
    .label-flex {
        display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;
    }
    .label-flex label { margin-bottom: 0; }
    .dp-value { font-size: 0.95rem; font-weight: 700; color: var(--gold); }

    .input-prefix-wrap, .input-suffix-wrap { position: relative; display: flex; align-items: center; }
    .prefix { position: absolute; left: 16px; font-weight: 600; color: var(--text-3); font-size: 0.95rem; }
    .suffix { position: absolute; right: 16px; font-weight: 600; color: var(--text-3); font-size: 0.9rem; }
    
    .form-input {
        width: 100%;
        padding: 12px 16px;
        border: 1.5px solid var(--border);
        border-radius: var(--radius-lg);
        font-family: inherit;
        font-size: 1rem;
        color: var(--text-1);
        background: var(--white);
        transition: all 0.2s;
        outline: none;
    }
    .form-input.with-prefix { padding-left: 44px; }
    .input-suffix-wrap .form-input { padding-right: 64px; }
    .form-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,168,76,0.15); }

    .range-slider {
        width: 100%; height: 6px; background: var(--border); border-radius: 4px; outline: none; appearance: none;
    }
    .range-slider::-webkit-slider-thumb {
        appearance: none; width: 22px; height: 22px; border-radius: 50%; background: var(--gold); cursor: pointer; border: 3px solid var(--white); box-shadow: var(--shadow); transition: transform 0.1s;
    }
    .range-slider::-webkit-slider-thumb:hover { transform: scale(1.1); }
    
    /* Custom Dropdown */
    .custom-dropdown { position: relative; width: 100%; outline: none; }
    .dropdown-selected {
        display: flex; align-items: center; justify-content: space-between;
        width: 100%; padding: 10px 16px; border: 1.5px solid var(--border);
        border-radius: var(--radius-lg); font-size: 1rem; color: var(--text-1);
        background: var(--white); cursor: pointer; transition: all 0.2s;
    }
    .dropdown-selected.open { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,168,76,0.15); }
    .selected-content { display: flex; align-items: center; gap: 10px; }
    .bank-icon { width: 24px; height: 24px; object-fit: contain; border-radius: 4px; }
    .default-icon { color: var(--text-3); font-size: 1.2rem; }
    .drop-arrow { color: var(--text-3); }
    
    .dropdown-menu {
        position: absolute; top: calc(100% + 4px); left: 0; right: 0;
        background: var(--white); border: 1px solid var(--border);
        border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);
        z-index: 10; max-height: 250px; overflow-y: auto; padding: 6px;
    }
    .dropdown-item {
        display: flex; align-items: center; gap: 10px; padding: 10px 12px;
        font-size: 0.95rem; color: var(--text-2); cursor: pointer;
        border-radius: var(--radius-sm); transition: background 0.2s;
    }
    .dropdown-item:hover, .dropdown-item.active { background: var(--surface-2); color: var(--text-1); font-weight: 500; }
    .dropdown-item.active { background: rgba(201,168,76,0.1); color: var(--gold-hover); }

    .bank-rate-info {
        background: var(--surface-2);
        padding: 12px 16px;
        border-radius: var(--radius-lg);
        font-size: 0.9rem;
        color: var(--text-2);
        border-left: 4px solid var(--gold);
    }
    .bank-rate-info strong { color: var(--text-1); font-size: 1rem; }

    /* Summary Card (Dark Theme) */
    .kpr-summary {
        background: linear-gradient(145deg, #1A150F 0%, #2A241A 100%);
        border-radius: var(--radius-xl);
        padding: 32px;
        color: var(--cream);
        box-shadow: var(--shadow-lg);
        position: sticky;
        top: 100px;
    }
    .summary-top { text-align: center; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .summary-label { font-size: 0.95rem; color: rgba(255,255,255,0.7); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    .summary-amount { font-size: 2.8rem; font-weight: 800; line-height: 1.1; }

    .summary-breakdown { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
    .breakdown-row { display: flex; justify-content: space-between; font-size: 0.95rem; color: rgba(255,255,255,0.8); }
    .breakdown-row .val { font-weight: 600; color: var(--white); }
    .highlight-row { padding-top: 12px; margin-top: 4px; border-top: 1px dashed rgba(255,255,255,0.2); font-size: 1.05rem; }
    .highlight-row .val { color: var(--gold-light); }

    .summary-details { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .detail-box { background: rgba(0,0,0,0.2); padding: 16px; border-radius: var(--radius-lg); text-align: center; border: 1px solid rgba(255,255,255,0.05); }
    .d-label { font-size: 0.8rem; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .d-val { font-size: 1.25rem; font-weight: 700; color: var(--white); line-height: 1.2; }
    .d-sub { font-size: 0.75rem; color: var(--gold); margin-top: 2px; }

    .summary-totals { background: rgba(0,0,0,0.3); border-radius: var(--radius-lg); padding: 20px; display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
    .t-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; color: rgba(255,255,255,0.7); }
    .t-row .c-red { color: #FFA8A8; font-weight: 600; }
    .t-grand { margin-top: 8px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 1.05rem; color: var(--white); font-weight: 700; }
    .t-grand .c-gold { color: var(--gold); font-size: 1.2rem; }

    .summary-disclaimer { display: flex; gap: 10px; align-items: flex-start; font-size: 0.75rem; color: rgba(255,255,255,0.5); line-height: 1.5; }
    .summary-disclaimer .material-symbols-rounded { font-size: 1.1rem; color: var(--gold); flex-shrink: 0; }
</style>
