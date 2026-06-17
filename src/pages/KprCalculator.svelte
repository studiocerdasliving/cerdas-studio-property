<script>
    import Layout from '../components/Layout.svelte';
    
    const banks = [
        { 
            name: 'Bank BCA',
            logo: '/bank-logos/BCA.jpg',
            color: '#0066AE',
            rates: [
                { label: 'Fixed 1 Tahun', value: 2.75, fixedYears: 1 },
                { label: 'Fixed 3 Tahun', value: 3.75, fixedYears: 3 },
                { label: 'Fixed 5 Tahun', value: 4.75, fixedYears: 5 },
            ],
            floating: 11.00
        },
        { 
            name: 'Bank Mandiri',
            logo: '/bank-logos/Mandiri.jpg',
            color: '#003B70',
            rates: [
                { label: 'Fixed 1 Tahun', value: 2.55, fixedYears: 1 },
                { label: 'Fixed 3 Tahun', value: 3.99, fixedYears: 3 },
                { label: 'Fixed 5 Tahun', value: 4.99, fixedYears: 5 },
            ],
            floating: 12.00
        },
        { 
            name: 'Bank BNI',
            logo: '/bank-logos/BNI.jpg',
            color: '#F15921',
            rates: [
                { label: 'Fixed 1 Tahun', value: 2.75, fixedYears: 1 },
                { label: 'Fixed 3 Tahun', value: 3.75, fixedYears: 3 },
                { label: 'Fixed 5 Tahun', value: 4.75, fixedYears: 5 },
            ],
            floating: 12.50
        },
        { 
            name: 'Bank BRI',
            logo: '/bank-logos/BRI.jpg',
            color: '#003399',
            rates: [
                { label: 'Fixed 1 Tahun', value: 2.75, fixedYears: 1 },
                { label: 'Fixed 3 Tahun', value: 3.75, fixedYears: 3 },
                { label: 'Fixed 5 Tahun', value: 4.75, fixedYears: 5 },
            ],
            floating: 13.00
        },
        { 
            name: 'Bank BTN',
            logo: '/bank-logos/BTN.jpg',
            color: '#FFB300',
            rates: [
                { label: 'Fixed 1 Tahun', value: 2.99, fixedYears: 1 },
                { label: 'Fixed 3 Tahun', value: 3.99, fixedYears: 3 },
                { label: 'Fixed 5 Tahun', value: 4.99, fixedYears: 5 },
            ],
            floating: 12.50
        },
        { 
            name: 'Bank CIMB Niaga',
            logo: '/bank-logos/CIMB.jpg',
            color: '#E30613',
            rates: [
                { label: 'Fixed 3 Tahun', value: 4.25, fixedYears: 3 },
                { label: 'Fixed 5 Tahun', value: 5.50, fixedYears: 5 },
            ],
            floating: 11.00
        },
        { 
            name: 'Bank OCBC Indonesia',
            logo: '/bank-logos/OCBC.jpg',
            color: '#DA2127',
            rates: [
                { label: 'Fixed 3 Tahun', value: 3.99, fixedYears: 3 },
                { label: 'Fixed 5 Tahun', value: 4.99, fixedYears: 5 },
            ],
            floating: 11.50
        },
        { 
            name: 'Bank Panin',
            logo: '/bank-logos/Panin.jpg',
            color: '#004A97',
            rates: [
                { label: 'Fixed 1 Tahun', value: 2.50, fixedYears: 1 },
                { label: 'Fixed 3 Tahun', value: 3.50, fixedYears: 3 },
                { label: 'Fixed 5 Tahun', value: 4.50, fixedYears: 5 },
            ],
            floating: 10.50
        }
    ];

    let propertyPrice    = $state(500_000_000);
    let downPaymentPct   = $state(20);
    let selectedBankIdx  = $state(0);
    let selectedRateIdx  = $state(0);
    let tenorYears       = $state(15);
    let dropdownOpen     = $state(false);
    let rateDropdownOpen = $state(false);

    let bank          = $derived(banks[selectedBankIdx]);
    let activeRateIdx = $derived(Math.min(selectedRateIdx, bank.rates.length - 1));
    let activeRate    = $derived(bank.rates[activeRateIdx]);

    let fixedRate    = $derived(activeRate.value);
    let floatingRate = $derived(bank.floating);
    let fixedYears   = $derived(activeRate.fixedYears);
    let rateLabel    = $derived(activeRate.label);

    let downPayment   = $derived((propertyPrice * downPaymentPct) / 100);
    let principal     = $derived(propertyPrice - downPayment);
    let totalMonths   = $derived(tenorYears * 12);
    let floatingYears = $derived(Math.max(0, tenorYears - fixedYears));

    /**
     * Mixed rate KPR calculation:
     * Phase 1 (Fixed): cicilan dihitung anuitas berdasarkan total tenor, pakai fixed rate
     * Phase 2 (Floating): sisa pokok setelah masa fixed diangsur ulang dengan floating rate
     */
    let calc = $derived.by(() => {
        if (principal <= 0 || tenorYears <= 0) return {
            fixedMonthly: 0, floatingMonthly: 0,
            totalFixed: 0, totalFloating: 0,
            totalInterest: 0, totalPayment: 0,
            remainingAfterFixed: 0, isMixed: false
        };

        const totalM = tenorYears * 12;
        const fixedM = Math.min(fixedYears * 12, totalM);
        const floatM = totalM - fixedM;

        // --- FASE FIXED ---
        // Cicilan anuitas dihitung atas total tenor penuh dengan fixed rate
        const mfixed = (fixedRate / 100) / 12;
        let fixedMonthly = 0;
        if (mfixed === 0) {
            fixedMonthly = principal / totalM;
        } else {
            fixedMonthly = principal * (mfixed * Math.pow(1 + mfixed, totalM)) / (Math.pow(1 + mfixed, totalM) - 1);
        }

        // Hitung outstanding pokok setelah masa fixed selesai
        let remaining = principal;
        for (let m = 0; m < fixedM; m++) {
            const ip = remaining * mfixed;
            const pp = fixedMonthly - ip;
            remaining = Math.max(0, remaining - pp);
        }

        // --- FASE FLOATING ---
        let floatingMonthly = 0;
        const isMixed = floatM > 0;
        if (floatM > 0 && remaining > 0) {
            const mf = (floatingRate / 100) / 12;
            if (mf === 0) {
                floatingMonthly = remaining / floatM;
            } else {
                floatingMonthly = remaining * (mf * Math.pow(1 + mf, floatM)) / (Math.pow(1 + mf, floatM) - 1);
            }
        } else if (floatM === 0) {
            floatingMonthly = fixedMonthly;
        }

        const totalFixed    = fixedMonthly * fixedM;
        const totalFloating = floatingMonthly * floatM;
        const totalPayment  = totalFixed + totalFloating;
        const totalInterest = totalPayment - principal;

        return { fixedMonthly, floatingMonthly, totalFixed, totalFloating,
                 totalInterest, totalPayment, remainingAfterFixed: remaining, isMixed };
    });

    /** @param {number|string|null} n */
    function fmt(n) {
        if (!n || isNaN(Number(n)) || !isFinite(Number(n))) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(n));
    }

    /** @param {number} n @returns {string} */
    function terbilang(n) {
        if (!n || n <= 0) return 'Nol rupiah';
        /** @param {number} x @returns {string} */
        function cv(x) {
            const h = ['','satu','dua','tiga','empat','lima','enam','tujuh','delapan','sembilan','sepuluh','sebelas'];
            if (x < 12) return h[x];
            if (x < 20) return cv(x-10)+' belas';
            if (x < 100) return cv(Math.floor(x/10))+' puluh '+cv(x%10);
            if (x < 200) return 'seratus '+cv(x-100);
            if (x < 1000) return cv(Math.floor(x/100))+' ratus '+cv(x%100);
            if (x < 2000) return 'seribu '+cv(x-1000);
            if (x < 1e6) return cv(Math.floor(x/1000))+' ribu '+cv(x%1000);
            if (x < 1e9) return cv(Math.floor(x/1e6))+' juta '+cv(x%1e6);
            if (x < 1e12) return cv(Math.floor(x/1e9))+' milyar '+cv(x%1e9);
            return cv(Math.floor(x/1e12))+' triliun '+cv(x%1e12);
        }
        return cv(n).trim().replace(/\s+/g,' ') + ' rupiah';
    }

    /** @param {MouseEvent} e */
    function windowClick(e) {
        const t = /** @type {HTMLElement} */(e.target);
        if (!t.closest?.('.custom-dropdown')) { dropdownOpen = false; rateDropdownOpen = false; }
    }
</script>

<svelte:window onclick={windowClick} />

<Layout title="Kalkulator KPR" description="Simulasi cicilan KPR mixed rate (fixed + floating) dari bank-bank terkemuka Indonesia.">

    <div class="hero">
        <div class="container hero-inner">
            <h1 class="hero-h1">Kalkulator KPR <span class="gold">Mixed Rate</span></h1>
            <p class="hero-sub">Hitung cicilan realistis dengan skema <strong>fixed rate + floating rate</strong> — persis seperti yang diterapkan bank sesungguhnya.</p>
            <div class="hero-pills">
                <span class="pill">✅ Fixed Rate Aktual</span>
                <span class="pill">✅ Floating Setelah Masa Fixed</span>
                <span class="pill">✅ 8 Bank Terkemuka</span>
            </div>
        </div>
    </div>

    <div class="container kpr-container">
        <div class="kpr-grid">

            <div class="kpr-card">

                <div class="kpr-form">

                    <div class="form-group">
                        <label for="propertyPrice">Harga Properti</label>
                        <div class="input-wrap prefix-wrap">
                            <span class="affix prefix">Rp</span>
                            <input id="propertyPrice" type="number"
                                value={propertyPrice}
                                oninput={(e) => {
                                    let t = /** @type {HTMLInputElement} */(e.currentTarget);
                                    let v = t.value.slice(0, 13);
                                    t.value = v;
                                    propertyPrice = parseInt(v) || 0;
                                }}
                                class="form-input with-prefix" />
                        </div>
                        <div class="terbilang">{terbilang(propertyPrice)}</div>
                    </div>

                    <div class="form-group">
                        <div class="label-row">
                            <label for="dpSlider">Uang Muka (DP)</label>
                            <span class="dp-badge">{downPaymentPct}% &nbsp;·&nbsp; {fmt(downPayment)}</span>
                        </div>
                        <input id="dpSlider" type="range" bind:value={downPaymentPct} min="0" max="90" class="slider" />
                        <div class="slider-ticks">
                            {#each [0,20,30,40,50,60,70,80,90] as t}
                                <span>{t}%</span>
                            {/each}
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="tenor">Tenor</label>
                            <div class="input-wrap suffix-wrap">
                                <input id="tenor" type="number" bind:value={tenorYears} min="1" max="30" class="form-input" />
                                <span class="affix suffix">Tahun</span>
                            </div>
                            <div class="hint">Maks. 30 tahun</div>
                        </div>

                        <div class="form-group">
                            <!-- svelte-ignore a11y_label_has_associated_control -->
                            <label>Pilih Bank</label>
                            <div class="custom-dropdown">
                                <!-- svelte-ignore a11y_click_events_have_key_events -->
                                <!-- svelte-ignore a11y_no_static_element_interactions -->
                                <div class="dd-selected {dropdownOpen?'open':''}" onclick={() => dropdownOpen=!dropdownOpen}>
                                    <div class="dd-left">
                                        {#if bank.logo}
                                            <img src={bank.logo} alt={bank.name}
                                                onerror={(e)=>{ /** @type {HTMLImageElement} */(e.currentTarget).style.display='none'; }}
                                                class="bk-logo" />
                                        {:else}
                                            <span class="bk-placeholder">🏦</span>
                                        {/if}
                                        <span class="dd-name">{bank.name}</span>
                                    </div>
                                    <span class="dd-arrow">{dropdownOpen ? '▲' : '▼'}</span>
                                </div>
                                {#if dropdownOpen}
                                    <div class="dd-menu">
                                        {#each banks as b, i}
                                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                                            <!-- svelte-ignore a11y_no_static_element_interactions -->
                                            <div class="dd-item {selectedBankIdx===i?'active':''}"
                                                onclick={() => { selectedBankIdx=i; selectedRateIdx=0; dropdownOpen=false; }}>
                                                {#if b.logo}
                                                    <img src={b.logo} alt={b.name}
                                                        onerror={(e)=>{ /** @type {HTMLImageElement} */(e.currentTarget).style.display='none'; }}
                                                        class="bk-logo" />
                                                {:else}
                                                    <span class="bk-placeholder">🏦</span>
                                                {/if}
                                                <span>{b.name}</span>
                                            </div>
                                        {/each}
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <!-- svelte-ignore a11y_label_has_associated_control -->
                            <label>Tipe Suku Bunga Fixed</label>
                            <div class="custom-dropdown">
                                <!-- svelte-ignore a11y_click_events_have_key_events -->
                                <!-- svelte-ignore a11y_no_static_element_interactions -->
                                <div class="dd-selected {rateDropdownOpen?'open':''}" onclick={() => rateDropdownOpen=!rateDropdownOpen}>
                                    <div class="dd-left">
                                        <span class="bk-placeholder">%</span>
                                        <span class="dd-name">{rateLabel}</span>
                                    </div>
                                    <span class="dd-arrow">{rateDropdownOpen ? '▲' : '▼'}</span>
                                </div>
                                {#if rateDropdownOpen}
                                    <div class="dd-menu">
                                        {#each bank.rates as r, i}
                                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                                            <!-- svelte-ignore a11y_no_static_element_interactions -->
                                            <div class="dd-item {selectedRateIdx===i?'active':''}"
                                                onclick={() => { selectedRateIdx=i; rateDropdownOpen=false; }}>
                                                <span class="bk-placeholder">%</span>
                                                <span>{r.label}</span>
                                                <span class="dd-rate-hint">{r.value}% p.a.</span>
                                            </div>
                                        {/each}
                                    </div>
                                {/if}
                            </div>
                        </div>

                        <div class="form-group">
                            <!-- svelte-ignore a11y_label_has_associated_control -->
                            <label>Rate Fixed Terpilih</label>
                            <div class="rate-chip">
                                <span class="rate-big">{fixedRate}%</span>
                                <span class="rate-label">p.a. &nbsp;·&nbsp; {fixedYears} tahun</span>
                            </div>
                        </div>
                    </div>

                    {#if floatingYears > 0}
                        <div class="mixed-info">
                            <div class="mi-phase fixed-phase">
                                <div class="mi-years">{fixedYears} Tahun Pertama</div>
                                <div class="mi-rate">{fixedRate}%</div>
                                <div class="mi-lbl">Suku Bunga Fixed</div>
                                <div class="mi-monthly">{fmt(calc.fixedMonthly)}<small>/bln</small></div>
                            </div>
                            <div class="mi-arrow">→</div>
                            <div class="mi-phase float-phase">
                                <div class="mi-years">{floatingYears} Tahun Berikutnya</div>
                                <div class="mi-rate">{floatingRate}%</div>
                                <div class="mi-lbl">Suku Bunga Floating</div>
                                <div class="mi-monthly">{fmt(calc.floatingMonthly)}<small>/bln</small></div>
                            </div>
                        </div>
                    {/if}

                </div>
            </div>

            <div class="kpr-summary">

                <div class="sum-bank-header">
                    {#if bank.logo}
                        <img src={bank.logo} alt={bank.name}
                            onerror={(e)=>{ /** @type {HTMLImageElement} */(e.currentTarget).style.display='none'; }}
                            class="sum-bank-logo" />
                    {:else}
                        <span style="font-size:2rem">🏦</span>
                    {/if}
                    <div>
                        <div class="sum-bank-name">{bank.name}</div>
                        <div class="sum-bank-scheme">
                            Fixed {fixedYears}Y @ {fixedRate}%{floatingYears > 0 ? ` + Floating ${floatingYears}Y @ ${floatingRate}%` : ''}
                        </div>
                    </div>
                </div>

                <div class="sum-main">
                    <div class="sum-label">Cicilan Masa Fixed</div>
                    <div class="sum-amount text-gradient-gold">{fmt(calc.fixedMonthly)}</div>
                    <div class="sum-sub">per bulan · {fixedYears} tahun pertama</div>
                    {#if calc.isMixed}
                        <div class="sum-floating-cta">
                            <span>Setelah masa fixed berakhir →</span>
                            <strong>{fmt(calc.floatingMonthly)}/bulan</strong>
                            <span class="fc-sub">(floating {floatingRate}% · {floatingYears} tahun)</span>
                        </div>
                    {/if}
                </div>

                <div class="sum-breakdown">
                    <div class="br-row">
                        <span>Harga Properti</span>
                        <span class="br-val">{fmt(propertyPrice)}</span>
                    </div>
                    <div class="br-row">
                        <span>Uang Muka ({downPaymentPct}%)</span>
                        <span class="br-val">{fmt(downPayment)}</span>
                    </div>
                    <div class="br-row highlight">
                        <span>Pokok Pinjaman</span>
                        <span class="br-val gold">{fmt(principal)}</span>
                    </div>
                </div>

                <div class="sum-details">
                    <div class="d-box">
                        <div class="d-lbl">TENOR</div>
                        <div class="d-val">{tenorYears} Tahun</div>
                        <div class="d-sub">{totalMonths} bulan</div>
                    </div>
                    <div class="d-box">
                        <div class="d-lbl">FIXED RATE</div>
                        <div class="d-val">{fixedRate}%</div>
                        <div class="d-sub">{fixedYears} tahun</div>
                    </div>
                    {#if calc.isMixed}
                        <div class="d-box">
                            <div class="d-lbl">FLOATING</div>
                            <div class="d-val">{floatingRate}%</div>
                            <div class="d-sub">{floatingYears} tahun</div>
                        </div>
                    {/if}
                    <div class="d-box">
                        <div class="d-lbl">SISA POKOK</div>
                        <div class="d-val-sm">{fmt(calc.remainingAfterFixed)}</div>
                        <div class="d-sub">setelah masa fixed</div>
                    </div>
                </div>

                <div class="sum-totals">
                    {#if calc.isMixed}
                        <div class="t-row">
                            <span>Total Bayar Fixed ({fixedYears}Y)</span>
                            <span>{fmt(calc.totalFixed)}</span>
                        </div>
                        <div class="t-row">
                            <span>Total Bayar Floating ({floatingYears}Y)</span>
                            <span>{fmt(calc.totalFloating)}</span>
                        </div>
                        <div class="t-divider"></div>
                    {/if}
                    <div class="t-row">
                        <span>Total Bunga</span>
                        <span class="c-red">{fmt(calc.totalInterest)}</span>
                    </div>
                    <div class="t-row grand">
                        <span>Total Pembayaran</span>
                        <span class="c-gold">{fmt(calc.totalPayment)}</span>
                    </div>
                </div>

                <div class="disclaimer">
                    <span class="disc-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                    </span>
                    <p>Cicilan <strong>fixed</strong> berlaku {fixedYears} tahun pertama pada {fixedRate}% p.a., kemudian beralih ke <strong>floating</strong> {floatingRate}% p.a. untuk {floatingYears} tahun sisanya. Nilai aktual bergantung pada provisi, asuransi jiwa, kebakaran, dan kebijakan masing-masing bank.</p>
                </div>
            </div>

        </div>
    </div>
</Layout>

<style>
    .hero {
        padding: 24px 0 24px;
        background: linear-gradient(160deg, var(--cream) 0%, var(--surface-2) 100%);
        border-bottom: 1px solid var(--border);
        text-align: center;
    }
    .hero-inner { display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .hero-h1 {
        font-family: 'Playfair Display', serif;
        font-size: clamp(1.8rem, 4vw, 2.6rem);
        font-weight: 800; color: var(--text-1); line-height: 1.2; margin: 0;
    }
    .hero-h1 .gold { color: var(--gold); }
    .hero-sub { font-size: 1.05rem; color: var(--text-2); max-width: 560px; margin: 0; line-height: 1.7; }
    .hero-pills { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
    .pill {
        padding: 6px 16px; border-radius: 999px;
        background: var(--white); border: 1px solid var(--border);
        font-size: 0.8rem; color: var(--text-2); font-weight: 500;
    }

    .kpr-container { padding-top: 24px; padding-bottom: 96px; }
    .kpr-grid { display: grid; grid-template-columns: 1fr 400px; gap: 36px; align-items: start; }
    @media (max-width: 960px) { .kpr-grid { grid-template-columns: 1fr; } }

    .kpr-card {
        background: var(--white); border: 1px solid var(--border);
        border-radius: var(--radius-xl); padding: 36px;
        box-shadow: 0 2px 16px rgba(0,0,0,0.06);
    }

    .kpr-form { display: flex; flex-direction: column; gap: 24px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    @media (max-width: 560px) { .form-row { grid-template-columns: 1fr; } }

    .form-group label, .form-group > label {
        display: block; font-size: 0.875rem; font-weight: 600;
        color: var(--text-2); margin-bottom: 8px;
    }
    .hint { font-size: 0.75rem; color: var(--text-3); margin-top: 5px; }
    .terbilang {
        font-size: 0.78rem; color: var(--gold); font-weight: 500;
        font-style: italic; text-transform: capitalize; margin-top: 6px;
    }

    .input-wrap { position: relative; display: flex; align-items: center; }
    .prefix-wrap .form-input { padding-left: 44px; }
    .suffix-wrap .form-input { padding-right: 60px; }
    .affix { position: absolute; font-weight: 600; color: var(--text-3); font-size: 0.9rem; pointer-events: none; user-select: none; }
    .prefix { left: 16px; }
    .suffix { right: 16px; }

    .form-input {
        width: 100%; padding: 12px 16px; border: 1.5px solid var(--border);
        border-radius: var(--radius-lg); font-family: inherit; font-size: 1rem;
        color: var(--text-1); background: var(--white); transition: all 0.2s; outline: none; box-sizing: border-box;
    }
    .form-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,168,76,0.15); }

    .label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .label-row label { margin-bottom: 0; }
    .dp-badge { font-size: 0.9rem; font-weight: 700; color: var(--gold); }
    .slider { appearance: none; -webkit-appearance: none; width: 100%; height: 6px; background: var(--border); border-radius: 4px; outline: none; }
    .slider::-webkit-slider-thumb {
        appearance: none; -webkit-appearance: none; width: 22px; height: 22px;
        border-radius: 50%; background: var(--gold); cursor: pointer;
        border: 3px solid var(--white); box-shadow: 0 1px 6px rgba(0,0,0,0.2); transition: transform 0.1s;
    }
    .slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
    .slider-ticks { display: flex; justify-content: space-between; font-size: 0.68rem; color: var(--text-3); margin-top: 6px; }

    .rate-chip {
        background: rgba(201,168,76,0.08); border: 1.5px solid rgba(201,168,76,0.3);
        border-radius: var(--radius-lg); padding: 10px 16px;
        display: flex; align-items: baseline; gap: 8px; height: 48px; box-sizing: border-box;
    }
    .rate-big  { font-size: 1.3rem; font-weight: 800; color: var(--gold); }
    .rate-label { font-size: 0.8rem; color: var(--text-2); }

    .custom-dropdown { position: relative; }
    .dd-selected {
        display: flex; align-items: center; justify-content: space-between;
        padding: 10px 14px; border: 1.5px solid var(--border);
        border-radius: var(--radius-lg); cursor: pointer; background: var(--white);
        transition: all 0.2s; user-select: none;
    }
    .dd-selected.open { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,168,76,0.15); }
    .dd-left { display: flex; align-items: center; gap: 10px; }
    .dd-name  { font-size: 0.95rem; color: var(--text-1); font-weight: 500; }
    .dd-arrow { font-size: 0.7rem; color: var(--text-3); }
    .bk-logo { width: 28px; height: 28px; object-fit: contain; border-radius: 6px; background: var(--surface-2); padding: 2px; }
    .bk-placeholder { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 1rem; background: var(--surface-2); border-radius: 6px; }
    .dd-menu {
        position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 50;
        background: var(--white); border: 1px solid var(--border);
        border-radius: var(--radius-lg); box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        max-height: 280px; overflow-y: auto; padding: 6px;
    }
    .dd-item {
        display: flex; align-items: center; gap: 10px; padding: 10px 12px;
        border-radius: var(--radius-sm); cursor: pointer; transition: background 0.15s;
        font-size: 0.9rem; color: var(--text-2);
    }
    .dd-item:hover { background: var(--surface-2); color: var(--text-1); }
    .dd-item.active { background: rgba(201,168,76,0.1); color: var(--gold-hover); font-weight: 600; }
    .dd-rate-hint { margin-left: auto; font-size: 0.75rem; color: var(--text-3); }

    .mixed-info {
        display: flex; align-items: center; gap: 12px;
        background: var(--surface-2); border: 1px solid var(--border);
        border-radius: var(--radius-lg); padding: 18px 20px;
    }
    .mi-phase { flex: 1; text-align: center; }
    .mi-years  { font-size: 0.72rem; color: var(--text-3); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .mi-rate   { font-size: 1.5rem; font-weight: 800; line-height: 1.1; }
    .mi-lbl    { font-size: 0.7rem; color: var(--text-3); margin-top: 2px; }
    .mi-monthly { font-size: 0.82rem; font-weight: 700; margin-top: 8px; }
    .mi-monthly small { font-size: 0.68rem; font-weight: 400; }
    .fixed-phase .mi-rate    { color: var(--gold); }
    .fixed-phase .mi-monthly { color: var(--gold); }
    .float-phase .mi-rate    { color: var(--text-2); }
    .float-phase .mi-monthly { color: var(--text-2); }
    .mi-arrow { font-size: 1.4rem; color: var(--border); flex-shrink: 0; }

    .kpr-summary {
        background: linear-gradient(145deg, #1A150F 0%, #2A241A 100%);
        border-radius: var(--radius-xl); padding: 28px;
        color: var(--cream); box-shadow: 0 8px 40px rgba(0,0,0,0.2);
        position: sticky; top: 90px; display: flex; flex-direction: column; gap: 20px;
    }

    .sum-bank-header {
        display: flex; align-items: center; gap: 14px;
        padding-bottom: 18px; border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .sum-bank-logo { width: 44px; height: 44px; object-fit: contain; border-radius: 10px; background: rgba(255,255,255,0.92); padding: 4px; }
    .sum-bank-name   { font-size: 1rem; font-weight: 700; color: var(--white); }
    .sum-bank-scheme { font-size: 0.72rem; color: var(--gold); margin-top: 3px; line-height: 1.4; }

    .sum-main { text-align: center; }
    .sum-label  { font-size: 0.72rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-bottom: 6px; }
    .sum-amount { font-size: clamp(1.6rem,4vw,2.4rem); font-weight: 800; line-height: 1.1; }
    .sum-sub    { font-size: 0.78rem; color: rgba(255,255,255,0.4); margin-top: 4px; }
    .sum-floating-cta {
        margin-top: 14px; padding: 12px 16px;
        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
        border-radius: var(--radius-lg); font-size: 0.8rem; color: rgba(255,255,255,0.55);
        display: flex; flex-direction: column; align-items: center; gap: 4px;
    }
    .sum-floating-cta strong { color: var(--gold); font-size: 1.05rem; }
    .fc-sub { font-size: 0.72rem; color: rgba(255,255,255,0.35); }

    .sum-breakdown { display: flex; flex-direction: column; gap: 10px; }
    .br-row { display: flex; justify-content: space-between; font-size: 0.88rem; color: rgba(255,255,255,0.6); }
    .br-val { font-weight: 600; color: var(--white); }
    .br-row.highlight { padding-top: 10px; border-top: 1px dashed rgba(255,255,255,0.15); }
    .br-row.highlight .br-val.gold { color: var(--gold); }

    .sum-details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .d-box { background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); border-radius: var(--radius-lg); padding: 14px 12px; text-align: center; }
    .d-lbl  { font-size: 0.68rem; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
    .d-val  { font-size: 1.15rem; font-weight: 700; color: var(--white); line-height: 1.2; }
    .d-val-sm { font-size: 0.78rem; font-weight: 700; color: var(--white); line-height: 1.4; word-break: break-word; }
    .d-sub  { font-size: 0.7rem; color: var(--gold); margin-top: 2px; }

    .sum-totals { background: rgba(0,0,0,0.3); border-radius: var(--radius-lg); padding: 18px; display: flex; flex-direction: column; gap: 10px; }
    .t-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: rgba(255,255,255,0.6); }
    .t-divider { border: none; border-top: 1px solid rgba(255,255,255,0.08); }
    .t-row .c-red  { color: #FFA8A8; font-weight: 600; }
    .t-row.grand { padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); color: var(--white); font-weight: 700; font-size: 0.92rem; }
    .t-row.grand .c-gold { color: var(--gold); font-size: 1.1rem; }

    .disclaimer { display: flex; gap: 10px; align-items: flex-start; font-size: 0.72rem; color: rgba(255,255,255,0.38); line-height: 1.6; }
    .disc-icon { flex-shrink: 0; font-size: 0.9rem; margin-top: 2px; color: rgba(255, 255, 255, 0.6); display: flex; align-items: center; justify-content: center; }
    .disclaimer strong { color: rgba(255,255,255,0.55); }
</style>
