<!DOCTYPE html>
<html lang="en">
<head>
    <title>Binance Pro Terminal - Server Linked</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <link rel="icon" type="image/png" href="https://cryptologos.cc/logos/bnb-bnb-logo.png?v=029">
    
    <style>
        /* High-Performance Sharp Theme */
        body { background: #0b0e11; color: #EAECEF; font-family: 'Inter', -apple-system, sans-serif; margin: 0; min-height: 100vh; display: flex; flex-direction: column; overflow-x: hidden; }
        .panel { background: #181a20; border: 1px solid #2b3139; border-radius: 4px; }
        .overlay { background: #1e2329; border: 1px solid #2b3139; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
        .neo-input { background: #0b0e11; border: 1px solid #363c4e; color: white; outline: none; transition: border-color 0.1s; border-radius: 4px; }
        .neo-input:focus, .neo-input:hover { border-color: #F3BA2F; }
        .neo-btn { background: #2b3139; border: 1px solid #2b3139; color: #EAECEF; transition: background 0.1s; border-radius: 4px; }
        .neo-btn:hover { background: #F3BA2F; color: #0b0e11; border-color: #F3BA2F; }
        .icon-btn { display: flex; align-items: center; justify-content: center; background: transparent; border: 1px solid transparent; border-radius: 4px; color: #848E9C; transition: 0.1s; }
        .icon-btn:hover { background: #2b3139; color: #F3BA2F; }
        .text-muted { color: #848E9C; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=range] { -webkit-appearance: none; width: 100%; background: transparent; cursor: pointer; }
        input[type=range]:focus { outline: none; }
        input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 4px; background: #363c4e; border-radius: 2px; }
        input[type=range]::-webkit-slider-thumb { height: 16px; width: 16px; border-radius: 2px; background: #F3BA2F; -webkit-appearance: none; margin-top: -6px; border: 2px solid #0b0e11; }
        .modal-overlay { transition: opacity 0.1s; z-index: 9999; background: rgba(0,0,0,0.8); }
        .modal-content { transition: transform 0.1s; }
        .modal-hidden { opacity: 0; pointer-events: none; }
        .modal-hidden .modal-content { transform: scale(0.98) translateY(5px); }
        .modal-active { opacity: 1; pointer-events: auto; }
        .modal-active .modal-content { transform: scale(1) translateY(0); }
        .tf-btn { padding: 4px 10px; border-radius: 4px; font-size: 10px; font-weight: 800; color: #848E9C; cursor: pointer; transition: 0.1s; }
        .tf-btn.active { background: #2b3139; color: #F3BA2F; }
        .tf-btn:hover:not(.active) { color: #EAECEF; background: #1e2329; }
        .dropdown-menu { transform-origin: top; transition: transform 0.1s, opacity 0.1s; z-index: 100; }
        .dropdown-hidden { transform: scaleY(0); opacity: 0; pointer-events: none; }
        .dropdown-active { transform: scaleY(1); opacity: 1; pointer-events: auto; }
        .flash-up { animation: flashUp 0.3s; }
        .flash-down { animation: flashDown 0.3s; }
        @keyframes flashUp { 0% { background-color: rgba(52,211,153,0.2); } 100% { background-color: transparent; } }
        @keyframes flashDown { 0% { background-color: rgba(251,113,133,0.2); } 100% { background-color: transparent; } }
        .code-area { font-family: 'Fira Code', monospace; line-height: 1.5; tab-size: 4; }
        select option { background: #1e2329; color: white; }
        .spinner { border: 2px solid #2b3139; border-top-color: #F3BA2F; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .dramatic-box { background: linear-gradient(145deg, #1e2329 0%, #15181e 100%); border: 1px solid #2b3139; box-shadow: 5px 5px 15px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.05); transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; }
        .dramatic-box:hover { transform: scale(1.05) translateY(-5px); border-color: #F3BA2F; z-index: 10; box-shadow: 0 20px 30px rgba(0,0,0,0.9), 0 0 15px rgba(243,186,47,0.2), inset 0 1px 2px rgba(255,255,255,0.1); }
        .dramatic-box:active { transform: scale(0.98); }
        .card-row { background: #0b0e11; border: 1px solid #2b3139; border-radius: 4px; transition: all 0.1s; }
        .card-row:hover { border-color: #363c4e; transform: translateX(2px); }
    </style>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>

    <div class="w-full bg-[#0b0e11] border-b border-[#2b3139] px-4 py-1.5 flex items-center gap-3 overflow-x-auto no-scrollbar shrink-0">
        <span class="text-[9px] uppercase font-black text-muted tracking-widest flex-shrink-0">Connected Wallets:</span>
        <div id="wallet-tabs" class="flex gap-2 items-center flex-shrink-0"></div>
        <button onclick="addWallet()" class="text-[9px] uppercase font-black text-[#F3BA2F] hover:bg-[#F3BA2F] hover:text-black transition flex-shrink-0 px-2 py-0.5 border border-[#F3BA2F] rounded ml-2">+ Create New</button>
        <div id="server-bot-status" class="ml-auto text-[9px] font-black uppercase text-green-400 bg-[#1e2329] px-2 py-0.5 border border-[#2b3139] rounded flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Server Bot Active
        </div>
    </div>

    <header class="flex flex-col shrink-0 z-50 sticky top-0 bg-[#181a20] border-b border-[#2b3139]">
        <div class="flex justify-between items-center p-3 md:p-4 max-w-[1600px] w-full mx-auto">
            <div class="flex items-center gap-4 md:gap-6">
                <div class="flex items-center gap-2">
                    <img src="https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=029" class="w-6 h-6">
                    <h2 class="text-base font-black uppercase tracking-tight text-white hidden sm:block">Binance <span class="text-[#F3BA2F]">Pro</span></h2>
                </div>
                <div class="flex gap-1 bg-[#0b0e11] border border-[#2b3139] p-0.5 rounded">
                    <button onclick="switchApp('terminal')" id="nav-terminal" class="px-4 py-1.5 rounded text-[11px] font-black uppercase tracking-widest bg-[#F3BA2F] text-black">Terminal</button>
                    <button onclick="switchApp('wallet')" id="nav-wallet" class="px-4 py-1.5 rounded text-[11px] font-black uppercase tracking-widest text-muted hover:text-white transition">Wallet</button>
                </div>
            </div>
            <div class="flex items-center gap-2 md:gap-3">
                <button onclick="toggleModal('history-modal')" class="neo-btn px-4 py-1.5 rounded font-black text-[10px] uppercase tracking-widest hidden sm:flex">History</button>
                <button onclick="toggleModal('settings-modal')" class="icon-btn w-8 h-8" title="Settings">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </button>
            </div>
        </div>
    </header>

    <div id="app-terminal" class="w-full">
        <main class="flex flex-col p-2 md:p-4 gap-4 w-full max-w-[1600px] mx-auto">
            
            <section class="panel p-4 md:p-6 flex flex-col relative overflow-hidden">
                <div class="flex items-center gap-2 mb-2 z-10">
                    <h1 class="text-[10px] font-black uppercase tracking-widest text-[#F3BA2F]">Active Wallet Net Value</h1>
                </div>
                
                <div class="flex items-end gap-2 z-10 flex-wrap">
                    <span id="hero-currency-sym" class="text-3xl md:text-4xl lg:text-5xl font-black text-[#F3BA2F]">$</span>
                    <h2 id="hero-total-balance" class="text-4xl md:text-5xl lg:text-6xl font-black text-white font-mono tracking-tighter">0.00</h2>
                    <select id="currency-select" onchange="setCurrency(this.value)" class="bg-transparent text-[#F3BA2F] font-black text-sm md:text-base outline-none ml-2 cursor-pointer border-b border-[#F3BA2F] pb-1 mb-2 uppercase hover:text-white transition"><option value="USD">USD</option><option value="AED">AED</option><option value="EUR">EUR</option><option value="GBP">GBP</option></select>

                    <div class="flex flex-col mb-1 md:mb-2 ml-4">
                        <span id="hero-daily-pnl" class="text-xs md:text-sm font-black text-green-400 tracking-wide">+ 0.00</span>
                        <span id="hero-daily-roi" class="text-[9px] md:text-[10px] font-black text-green-500 bg-[#0b0e11] px-2 py-0.5 rounded border border-[#2b3139] mt-1">+0.00% Today</span>
                    </div>
                </div>
                
                <div class="border-t border-[#2b3139] pt-4 mt-4 z-10">
                    <div class="flex justify-between items-center mb-3">
                        <h3 class="text-[10px] font-black uppercase tracking-widest text-muted">Quick Asset View</h3>
                    </div>
                    <div id="terminal-asset-list" class="flex flex-wrap gap-2"></div>
                </div>
            </section>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div class="lg:col-span-9 flex flex-col gap-4">
                    
                    <div class="panel p-3 md:p-4 flex flex-col gap-3 border-l-4 border-l-[#F3BA2F]">
                        <div class="flex justify-between items-center border-b border-[#2b3139] pb-2">
                            <div class="flex items-center gap-2">
                                <div class="w-2 h-2 bg-[#F3BA2F]"></div>
                                <h3 class="text-[10px] font-black uppercase tracking-widest text-[#F3BA2F]">Auto-Quant Engine (v8.0 Deep Signals)</h3>
                            </div>
                            <div class="flex gap-2">
                                <button onclick="toggleModal('ai-code-modal')" class="text-[9px] font-black uppercase bg-[#F3BA2F] text-black hover:bg-yellow-400 px-2 py-0.5 rounded transition shadow-md">Edit Logic</button>
                            </div>
                        </div>

                        <div class="grid grid-cols-3 md:grid-cols-6 gap-2 text-[9px] font-mono border-b border-[#2b3139] pb-2">
                            <div class="flex flex-col"><span class="text-muted uppercase font-sans">RSI (14)</span><span id="ai-rsi" class="text-white">--</span></div>
                            <div class="flex flex-col"><span class="text-muted uppercase font-sans">SMA (20)</span><span id="ai-sma" class="text-white">--</span></div>
                            <div class="flex flex-col"><span class="text-muted uppercase font-sans">Volatility</span><span id="ai-vol" class="text-white">--</span></div>
                            <div class="flex flex-col"><span class="text-muted uppercase font-sans">Buy Vol 15m</span><span id="ai-b15" class="text-white">--</span></div>
                            <div class="flex flex-col"><span class="text-muted uppercase font-sans">Buy Vol 1h</span><span id="ai-b1h" class="text-white">--</span></div>
                            <div class="flex flex-col"><span class="text-muted uppercase font-sans">Whale Sent.</span><span id="ai-whale" class="text-white">--</span></div>
                        </div>

                        <div class="flex flex-col md:flex-row gap-3">
                            <div class="flex-1 grid grid-cols-2 gap-3">
                                <div class="bg-[#0b0e11] border border-[#2b3139] p-2 rounded flex flex-col justify-between group">
                                    <div class="flex justify-between items-center mb-1"><span class="text-[9px] text-muted font-black uppercase tracking-widest">Short-Term (Scalp)</span><span id="ai-short-conf" class="text-[8px] font-mono text-[#F3BA2F]">0% Conf</span></div>
                                    <div class="flex justify-between items-end mt-1"><span id="ai-short-signal" class="text-xs font-black uppercase text-white">ANALYZING...</span><button id="ai-short-btn" onclick="executeAISuggestion('short')" class="px-2 py-1 bg-[#1e2329] border border-[#2b3139] group-hover:border-[#F3BA2F] text-[#F3BA2F] rounded text-[8px] font-black uppercase transition hidden">Trade</button></div>
                                </div>
                                <div class="bg-[#0b0e11] border border-[#2b3139] p-2 rounded flex flex-col justify-between group">
                                    <div class="flex justify-between items-center mb-1"><span class="text-[9px] text-muted font-black uppercase tracking-widest">Long-Term (Swing)</span><span id="ai-long-conf" class="text-[8px] font-mono text-[#F3BA2F]">0% Conf</span></div>
                                    <div class="flex justify-between items-end mt-1"><span id="ai-long-signal" class="text-xs font-black uppercase text-white">ANALYZING...</span><button id="ai-long-btn" onclick="executeAISuggestion('long')" class="px-2 py-1 bg-[#1e2329] border border-[#2b3139] group-hover:border-[#F3BA2F] text-[#F3BA2F] rounded text-[8px] font-black uppercase transition hidden">Trade</button></div>
                                </div>
                            </div>
                            <div class="w-full md:w-72 bg-[#0b0e11] border border-[#2b3139] p-2 rounded flex flex-col justify-start">
                                <span class="text-[8px] uppercase font-black text-[#F3BA2F] mb-1">Hedge Paper Trading (Live Algo)</span>
                                <div class="flex justify-between items-center font-mono text-xs font-black border-b border-[#2b3139] pb-1 mb-1"><span id="ai-paper-pnl" class="text-white">$0.00</span><span id="ai-paper-winrate" class="text-muted">Win: 0% (0/0)</span></div>
                                <div id="ai-active-papers-list" class="flex flex-col gap-1 overflow-y-auto no-scrollbar max-h-[100px] mt-1"><div class="text-[8px] text-muted text-center py-2 italic border border-dashed border-[#2b3139] rounded">Awaiting signals...</div></div>
                            </div>
                        </div>
                    </div>

                    <div class="panel p-4 md:p-6 flex flex-col relative min-h-[55vh] transition-colors duration-100" id="main-chart-wrapper">
                        <div class="flex justify-between items-start z-20">
                            <div class="relative w-fit">
                                <button onclick="toggleDropdown('term-dropdown')" class="neo-input px-3 py-2 rounded flex items-center gap-3 w-[150px] md:w-48 bg-[#0b0e11]">
                                    <div class="w-5 h-5 flex items-center justify-center" id="term-logo-container"><img id="term-logo" src="https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=029" class="w-5 h-5 rounded-full bg-[#1e2329] p-0.5 object-contain"></div>
                                    <span id="term-text" class="font-black text-sm uppercase text-white tracking-wide">BTC/USDT</span>
                                    <svg class="w-4 h-4 ml-auto text-[#F3BA2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                                </button>
                                <div id="term-dropdown" class="absolute top-full left-0 mt-1 w-48 overlay py-1 dropdown-menu dropdown-hidden z-50 overflow-y-auto max-h-[300px] no-scrollbar"></div>
                            </div>
                            <div class="flex flex-wrap bg-[#0b0e11] p-1 rounded border border-[#2b3139] justify-end max-w-[50%] sm:max-w-full">
                                <div class="tf-btn" onclick="setTimeframe('live')" id="tf-live">LIVE</div>
                                <div class="tf-btn active" onclick="setTimeframe('5m')" id="tf-5m">5m</div>
                                <div class="tf-btn" onclick="setTimeframe('1h')" id="tf-1h">1H</div>
                                <div class="tf-btn" onclick="setTimeframe('7d')" id="tf-7d">7D</div>
                                <div class="tf-btn" onclick="setTimeframe('1y')" id="tf-1y">1Y</div>
                                <div class="tf-btn" onclick="setTimeframe('max')" id="tf-max">MAX</div>
                            </div>
                        </div>

                        <div class="flex flex-wrap justify-between gap-4 sm:gap-6 mt-4 z-10 border-b border-[#2b3139] pb-3 items-end">
                            <div class="flex gap-4 sm:gap-6 shrink-0">
                                <div class="flex flex-col"><span class="text-[9px] text-muted uppercase tracking-widest">High</span><p class="text-xs font-mono text-green-400 font-black" id="stat-high">--</p></div>
                                <div class="flex flex-col"><span class="text-[9px] text-muted uppercase tracking-widest">Low</span><p class="text-xs font-mono text-pink-400 font-black" id="stat-low">--</p></div>
                            </div>
                            <div class="flex-grow flex justify-end items-end pointer-events-none min-w-0">
                                <h2 id="main-price" class="text-4xl sm:text-5xl md:text-6xl font-black text-white font-mono tracking-tighter leading-none truncate text-right max-w-full transition-colors duration-100">--</h2>
                            </div>
                        </div>

                        <div class="flex-grow mt-2 relative w-full h-full min-h-[300px] cursor-crosshair overflow-hidden rounded" id="canvas-container">
                            <canvas id="custom-chart" class="absolute inset-0 w-full h-full"></canvas>
                        </div>
                    </div>

                    <div class="panel flex flex-col h-[260px]">
                        <div class="flex flex-col p-3 border-b border-[#2b3139] shrink-0 bg-[#1e2329] gap-3">
                            <div class="flex justify-between items-center">
                                <div class="flex gap-4 items-center">
                                    <h3 class="text-[10px] font-black uppercase tracking-widest text-[#F3BA2F] hidden sm:block">Asset Block Logs</h3>
                                    <div class="flex gap-2">
                                        <button onclick="setLogFilter('all')" id="filter-all" class="text-[9px] font-black uppercase bg-[#F3BA2F] text-black px-2 py-0.5 rounded">All Txs</button>
                                        <button onclick="setLogFilter('whales')" id="filter-whales" class="text-[9px] font-black uppercase text-muted hover:text-[#EAECEF] px-2 py-0.5 rounded border border-transparent">Whales (>$25k)</button>
                                    </div>
                                </div>
                            </div>
                            <div class="w-full flex items-center gap-2">
                                <span class="text-[10px] font-black text-green-400 w-8" id="ratio-buy-text">50%</span>
                                <div class="flex-grow h-2.5 bg-[#0b0e11] rounded border border-[#2b3139] flex overflow-hidden">
                                    <div id="ratio-buy-bar" class="h-full bg-green-500 transition-all duration-300 shadow-[0_0_10px_rgba(34,197,94,0.5)]" style="width: 50%"></div>
                                    <div id="ratio-sell-bar" class="h-full bg-pink-500 transition-all duration-300 shadow-[0_0_10px_rgba(244,63,94,0.5)]" style="width: 50%"></div>
                                </div>
                                <span class="text-[10px] font-black text-pink-400 w-8 text-right" id="ratio-sell-text">50%</span>
                            </div>
                        </div>
                        <div class="flex-grow overflow-y-auto no-scrollbar p-2 flex flex-col gap-1" id="below-chart-log">
                            <div class="text-[9px] text-muted text-center py-4 italic">Awaiting on-chain / DEX block trades...</div>
                        </div>
                    </div>

                    <div class="panel flex flex-col min-h-[25vh]">
                        <div class="flex justify-between items-center p-3 border-b border-[#2b3139] shrink-0 bg-[#1e2329]">
                            <h3 class="text-[10px] font-black uppercase tracking-widest text-[#F3BA2F]">Active Trades</h3>
                        </div>
                        <div class="flex-grow overflow-y-auto no-scrollbar p-3 space-y-2" id="orders-body"></div>
                    </div>
                </div>

                <div class="lg:col-span-3 flex flex-col gap-4">
                    <div class="panel p-4 flex flex-col relative z-10">
                        <div class="flex justify-between items-center mb-4 border-b border-[#2b3139] pb-2">
                            <h3 class="text-[10px] font-black uppercase tracking-widest text-muted">Manual Execution</h3>
                            <select id="trade-wallet-select" onchange="switchWallet(this.value)" class="bg-[#0b0e11] text-[#F3BA2F] border border-[#2b3139] rounded px-1.5 py-1 text-[9px] uppercase font-black outline-none cursor-pointer"></select>
                        </div>
                        
                        <div class="flex gap-2 bg-[#0b0e11] p-1 border border-[#2b3139] rounded mb-5">
                            <button onclick="setSide('buy')" id="btn-buy" class="flex-1 py-3 rounded text-[10px] font-black uppercase tracking-widest bg-[#181a20] text-green-400 border border-[#2b3139]">Long / Buy</button>
                            <button onclick="setSide('sell')" id="btn-sell" class="flex-1 py-3 rounded text-[10px] font-black uppercase tracking-widest text-muted border border-transparent">Short / Sell</button>
                        </div>

                        <div class="space-y-5">
                            <div>
                                <div class="flex justify-between mb-1">
                                    <label class="text-[9px] font-black uppercase tracking-widest text-muted">Margin (USDT)</label>
                                    <span class="text-[9px] font-black text-[#F3BA2F] cursor-pointer" onclick="setMax()">MAX</span>
                                </div>
                                <input type="number" id="trade-margin" placeholder="0.00" class="w-full neo-input p-2 rounded text-base font-black font-mono text-center">
                            </div>

                            <div>
                                <div class="flex justify-between mb-2">
                                    <label class="text-[9px] font-black uppercase tracking-widest text-muted">Leverage</label>
                                    <span class="text-[9px] font-black text-black bg-[#F3BA2F] px-1.5 py-0.5 rounded"><span id="lev-val">10</span>x</span>
                                </div>
                                <input type="range" id="trade-lev" min="1" max="100" value="10" class="w-full">
                            </div>

                            <div class="p-3 bg-[#0b0e11] border border-[#2b3139] rounded space-y-2">
                                <div class="flex justify-between text-[9px] font-black uppercase"><span class="text-muted">Available</span><span class="text-white font-mono" id="ui-avail">0.00</span></div>
                                <div class="flex justify-between text-[9px] font-black uppercase border-t border-[#2b3139] pt-2"><span class="text-muted">Position Size</span><span class="text-[#F3BA2F] font-mono" id="ui-size">0.00</span></div>
                            </div>
                        </div>

                        <button onclick="executeOrder()" id="btn-execute" class="mt-4 w-full py-3 rounded font-black uppercase tracking-[0.1em] text-[11px] bg-green-500 text-black hover:bg-green-400 transition">Execute Long</button>
                    </div>

                    <div class="panel p-4 flex flex-col flex-grow relative z-10">
                        <div class="flex justify-between items-center mb-4 border-b border-[#2b3139] pb-2">
                            <h3 class="text-[10px] font-black uppercase tracking-widest text-muted">On-Chain Alpha</h3>
                            <select id="alpha-tf-select" onchange="setAlphaTimeframe(this.value)" class="bg-[#0b0e11] text-[#F3BA2F] border border-[#2b3139] rounded px-1.5 py-1 text-[9px] uppercase font-black outline-none cursor-pointer">
                                <option value="300000">5 Mins</option>
                                <option value="900000">15 Mins</option>
                                <option value="3600000">1 Hour</option>
                                <option value="18000000">5 Hours</option>
                                <option value="86400000" selected>24 Hours</option>
                            </select>
                        </div>
                        
                        <div class="mb-4">
                            <h4 class="text-[9px] font-bold uppercase tracking-widest text-green-400 mb-2 border-b border-[#2b3139] pb-1 flex justify-between"><span>Top Purchases</span> <span id="lbl-buy-tf">24H</span></h4>
                            <div id="ui-top-buys" class="space-y-1"></div>
                        </div>
                        
                        <div class="mb-4">
                            <h4 class="text-[9px] font-bold uppercase tracking-widest text-pink-400 mb-2 border-b border-[#2b3139] pb-1 flex justify-between"><span>Top Sells</span> <span id="lbl-sell-tf">24H</span></h4>
                            <div id="ui-top-sells" class="space-y-1"></div>
                        </div>

                        <div class="mt-auto">
                            <h4 class="text-[9px] font-bold uppercase tracking-widest text-[#F3BA2F] mb-2 border-b border-[#2b3139] pb-1">Whale Tracker</h4>
                            <div id="ui-top-holders" class="flex flex-col gap-1.5"></div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <div id="app-wallet" class="w-full hidden">
        <main class="flex flex-col p-2 md:p-6 gap-6 w-full max-w-[1400px] mx-auto">
            <div class="panel p-6 flex flex-col md:flex-row justify-between items-center md:items-start gap-6 border-t-2 border-t-[#F3BA2F]">
                <div class="flex flex-col w-full">
                    <div class="flex items-center justify-between border-b border-[#2b3139] pb-3 mb-4">
                        <div class="flex items-center gap-3">
                            <img src="https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=029" class="w-5 h-5">
                            <span class="text-white text-sm font-black uppercase tracking-widest">Binance Wallet <span class="bg-[#2b3139] text-[#F3BA2F] text-[9px] px-2 py-0.5 rounded ml-2">API Connected</span></span>
                        </div>
                        <select id="wallet-currency" onchange="setCurrency(this.value)" class="bg-[#0b0e11] border border-[#2b3139] text-[#F3BA2F] font-black text-xs rounded px-2 py-1 outline-none cursor-pointer"><option value="USD">USD</option><option value="AED">AED</option><option value="EUR">EUR</option><option value="GBP">GBP</option></select>
                    </div>
                    
                    <div class="flex flex-col md:flex-row justify-between items-center md:items-end w-full">
                        <div class="flex flex-col items-center md:items-start">
                            <span class="text-[10px] uppercase font-black text-muted tracking-widest mb-1">Total Net Worth (<span id="wallet-name-label">Main</span>)</span>
                            <div class="flex items-baseline gap-2">
                                <span id="wallet-currency-sym" class="text-3xl font-black text-[#F3BA2F]">$</span>
                                <h2 id="wallet-total-value" class="text-5xl font-black text-white font-mono tracking-tighter">0.00</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div class="flex justify-between items-end mb-4 border-b border-[#2b3139] pb-2">
                    <h3 class="text-[11px] font-black uppercase tracking-widest text-white border-l-2 border-[#F3BA2F] pl-2">My Assets</h3>
                </div>
                <div id="wallet-square-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2 pb-4"></div>
                <button id="show-more-btn" onclick="toggleShowMoreAssets()" class="w-full mt-3 py-2 bg-[#1e2329] border border-[#2b3139] text-white rounded font-black uppercase text-[9px] tracking-widest hover:bg-[#2b3139] transition hidden">Show More</button>
            </div>
        </main>
    </div>

    <div id="ai-code-modal" class="fixed inset-0 z-[100] modal-overlay modal-hidden flex items-center justify-center p-4">
        <div class="modal-content panel w-full max-w-2xl p-5 relative flex flex-col">
            <button onclick="toggleModal('ai-code-modal')" class="absolute top-4 right-4 text-muted hover:text-white"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            <h2 class="text-xs font-black uppercase tracking-widest text-white mb-2 border-b border-[#2b3139] pb-2">Edit Advanced Algorithmic Logic</h2>
            <textarea id="ai-logic-editor" class="code-area w-full h-[400px] bg-[#0b0e11] text-[#EAECEF] p-3 text-[10px] outline-none border border-[#2b3139] focus:border-[#F3BA2F] rounded resize-none mb-4" spellcheck="false"></textarea>
            <button onclick="saveAILogic()" class="w-full neo-btn py-3 rounded text-[10px] font-black uppercase bg-[#F3BA2F] text-black hover:bg-yellow-400">Save & Re-Compile Algo</button>
        </div>
    </div>

    <div id="history-modal" class="fixed inset-0 z-[100] modal-overlay modal-hidden flex items-center justify-center p-4">
        <div class="modal-content panel w-full max-w-lg p-0 relative max-h-[80vh] flex flex-col overflow-hidden">
            <div class="p-4 border-b border-[#2b3139] flex justify-between items-center bg-[#1e2329]">
                <h2 class="text-xs font-black uppercase tracking-widest text-white">Trade History</h2>
                <button onclick="toggleModal('history-modal')" class="text-muted hover:text-white"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
            <div class="flex-grow overflow-y-auto no-scrollbar p-3 space-y-2 bg-[#0b0e11]" id="history-body"></div>
        </div>
    </div>

    <script>
        // --- CORE DATA & ALGO STATE ---
        const ASSETS = [
            { id: 'BTCUSDT', name: 'BTC/USDT', icon: 'bitcoin-btc-logo.svg?v=029', gif: 'https://media.giphy.com/media/7FBY7h5Psqd20/giphy.gif', coin: 'BTC' }, 
            { id: 'ETHUSDT', name: 'ETH/USDT', icon: 'ethereum-eth-logo.svg?v=029', gif: 'https://media.giphy.com/media/USyYfvAGnuPpm/giphy.gif', coin: 'ETH' },
            { id: 'SOLUSDT', name: 'SOL/USDT', icon: 'solana-sol-logo.svg?v=029', coin: 'SOL' }, 
            { id: 'BNBUSDT', name: 'BNB/USDT', icon: 'bnb-bnb-logo.svg?v=029', coin: 'BNB' },
            { id: 'XRPUSDT', name: 'XRP/USDT', icon: 'xrp-xrp-logo.svg?v=029', coin: 'XRP' }, 
            { id: 'DOGEUSDT', name: 'DOGE/USDT', icon: 'dogecoin-doge-logo.svg?v=029', coin: 'DOGE' }, 
            { id: 'ADAUSDT', name: 'ADA/USDT', icon: 'cardano-ada-logo.svg?v=029', coin: 'ADA' }, 
            { id: 'DOTUSDT', name: 'DOT/USDT', icon: 'polkadot-new-dot-logo.svg?v=029', gif: 'https://media.tenor.com/Eemw48a6r58AAAAi/polkadot-crypto.gif', coin: 'DOT' }, 
            { id: 'MATICUSDT', name: 'MATIC/USDT', icon: 'polygon-matic-logo.svg?v=029', coin: 'MATIC' }, 
            { id: 'AVAXUSDT', name: 'AVAX/USDT', icon: 'avalanche-avax-logo.svg?v=029', coin: 'AVAX' },
            { id: 'ATOMUSDT', name: 'ATOM/USDT', icon: 'cosmos-atom-logo.svg?v=029', coin: 'ATOM' }
        ];

        const FX_RATES = { USD: 1, AED: 3.67, EUR: 0.92, GBP: 0.79, CAD: 1.36, AUD: 1.52 };
        const FX_SYM = { USD: '$', AED: 'د.إ', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$' };

        const defaultAlgoScript = `// Advanced Algorithmic Engine v8.0
let shortSide = 'WAIT', shortConf = 0, longSide = 'WAIT', longConf = 0;
if (prices.length < 26) return JSON.stringify({short:{side:'WAIT',lev:50,conf:0}, long:{side:'WAIT',lev:5,conf:0}});
function calcEMA(data, period) { let k = 2 / (period + 1); let emaData = [data[0]]; for(let i=1; i<data.length; i++) emaData.push(data[i] * k + emaData[i-1] * (1 - k)); return emaData; }
let ema9 = calcEMA(prices, 9); let ema12 = calcEMA(prices, 12); let ema26 = calcEMA(prices, 26);
let macdLine = ema12[ema12.length-1] - ema26[ema26.length-1];
let macdPrev = ema12[ema12.length-2] - ema26[ema26.length-2];
let macdHist = macdLine - macdPrev; 
let macdHistPrev = macdPrev - (ema12[ema12.length-3] - ema26[ema26.length-3]);
let macdAccel = macdHist - macdHistPrev; 
let mean = sma; let sumSq = prices.slice(-20).reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
let stdDev = Math.sqrt(sumSq / 20) || 1; 
let upperBB = mean + (2 * stdDev); let lowerBB = mean - (2 * stdDev);
let currentPrice = prices[prices.length-1];
let drop3Candles = (prices[prices.length-4] - currentPrice) / prices[prices.length-4]; 
let flowImbalance15m = (buyRatio15m - 0.5) * 2; let flowImbalance1h  = (buyRatio1h - 0.5) * 2; let whaleImbalance = (whaleSentiment - 0.5) * 2;
let isFlashDip = drop3Candles > 0.003 && rsi < 40 && flowImbalance15m > 0.3 && topBuysAmount > topSellsAmount;
let isShortBuy = rsi < 45 && macdAccel > 0 && currentPrice < lowerBB * 1.02 && buyRatio15m > 0.55;
let isShortSell = rsi > 65 && macdAccel < 0 && currentPrice > upperBB * 0.98 && buyRatio15m < 0.45;
if (isFlashDip) { shortSide = 'buy'; shortConf = 88 + Math.round(flowImbalance15m * 10); } else if (isShortBuy && topBuysAmount > topSellsAmount * 1.1) { shortSide = 'buy'; shortConf = 80 + Math.round(macdAccel * 100) + Math.round(flowImbalance15m * 10); } else if (isShortSell && topSellsAmount > topBuysAmount * 1.1) { shortSide = 'sell'; shortConf = 82 - Math.round(macdAccel * 100) - Math.round(flowImbalance15m * 10); } else if (volatility > stdDev * 3.5 && Math.abs(flowImbalance15m) > 0.7) { shortSide = flowImbalance15m > 0 ? 'buy' : 'sell'; shortConf = 75; }
let trendBullish = currentPrice > ema9[ema9.length-1] && ema9[ema9.length-1] > sma && macdLine > 0;
let trendBearish = currentPrice < ema9[ema9.length-1] && ema9[ema9.length-1] < sma && macdLine < 0;
let isLongBuy = whaleSentiment > 0.65 && trendBullish && buyRatio1h > 0.55; let isLongSell = whaleSentiment < 0.35 && trendBearish && buyRatio1h < 0.45;
if (isLongBuy) { longSide = 'buy'; longConf = 85 + Math.round(whaleImbalance * 10); } else if (isLongSell) { longSide = 'sell'; longConf = 85 + Math.round(Math.abs(whaleImbalance) * 10); } else if (Math.abs(whaleImbalance) > 0.7 && Math.abs(flowImbalance1h) > 0.5) { longSide = whaleImbalance > 0 ? 'buy' : 'sell'; longConf = 70; }
shortConf = Math.max(0, Math.min(99, shortConf)); longConf = Math.max(0, Math.min(99, longConf));
return JSON.stringify({ short: { side: shortSide, lev: 50, conf: shortConf }, long: { side: longSide, lev: 5, conf: longConf } });`;

        let dbBalance = <%= user ? user.usdt_balance : 0 %>; // EJS INJECTION: True DB Balance

        let appState = JSON.parse(localStorage.getItem('cloudquant_v12_algo')) || {
            activeWalletIdx: 0, currency: 'USD', aiLogic: defaultAlgoScript, globalTradeLogs: [], topHoldersSim: [], lastRunTime: Date.now(),
            aiStats: { wins: 0, losses: 0, pnl: 0, activePaper: [] }, 
            wallets: [{ id: 1, name: "Main API", usdtBalance: dbBalance, startOfDayValue: dbBalance, orders: [], history: [], manualAssets: {}, stakes: [] }]
        };

        // Sync local storage balance with DB on load to capture background trades
        if(appState.wallets[0].usdtBalance !== dbBalance && dbBalance > 0) {
            appState.wallets[0].usdtBalance = dbBalance;
        }
        
        const w = () => appState.wallets[appState.activeWalletIdx];

        let livePrices = {}; let ui = { side: 'buy', pair: 'BTCUSDT', price: 0, lastPrice: 0, lev: 10, timeframe: '5m', chartData: [], logFilter: 'all', alphaTfMs: 86400000 };
        let wsTicker, wsTrade, chartCtx; let flowData = { buy: 0, sell: 0 }; let canvasHoverPos = null; let isShowingAllAssets = false;
        let currentAISuggestion = null;

        // --- NEW: MEMORY GARBAGE COLLECTION ---
        function optimizeMemory() {
            const now = Date.now();
            // Delete logs older than 24 hours to prevent memory leak
            appState.globalTradeLogs = appState.globalTradeLogs.filter(l => (now - l.time) <= 86400000);
            
            // Strictly cap array sizes to avoid crashing localStorage
            if(appState.globalTradeLogs.length > 500) appState.globalTradeLogs = appState.globalTradeLogs.slice(0, 500);
            if(w().history.length > 50) w().history = w().history.slice(0, 50);
            
            // Clean up Top Holders Sim Data
            if(appState.topHoldersSim.length > 20) appState.topHoldersSim = appState.topHoldersSim.slice(0, 20);

            saveState();
            console.log("[SYS] Memory Optimized. Old data purged.");
        }
        setInterval(optimizeMemory, 60000); // Run every 60 seconds

        // --- NEW: SERVER-BOT SYNCING ---
        async function syncServerBot() {
            try {
                let res = await fetch('/api/trading/background-status');
                let data = await res.json();
                if(data && data.activeTrades !== undefined) {
                    const badge = document.getElementById('server-bot-status');
                    badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Server Bot Active (PnL: $${data.sessionPnl.toFixed(2)})`;
                    
                    // If server PnL changed DB balance, update our UI to match
                    if(data.dbBalance && w().usdtBalance !== data.dbBalance) {
                        w().usdtBalance = data.dbBalance;
                        updateWalletSystem();
                    }
                }
            } catch(e) {}
        }
        setInterval(syncServerBot, 10000); // Poll server every 10 seconds

        function switchApp(appName) {
            document.getElementById('app-terminal').style.display = appName === 'terminal' ? 'block' : 'none'; document.getElementById('app-wallet').style.display = appName === 'wallet' ? 'block' : 'none';
            document.getElementById('nav-terminal').className = appName === 'terminal' ? "px-4 py-1.5 rounded text-[11px] font-black uppercase tracking-widest bg-[#F3BA2F] text-black" : "px-4 py-1.5 rounded text-[11px] font-black uppercase tracking-widest text-muted hover:text-white transition";
            document.getElementById('nav-wallet').className = appName === 'wallet' ? "px-4 py-1.5 rounded text-[11px] font-black uppercase tracking-widest bg-[#F3BA2F] text-black" : "px-4 py-1.5 rounded text-[11px] font-black uppercase tracking-widest text-muted hover:text-white transition";
            if(appName === 'terminal') { setTimeout(setupCanvas, 50); drawChart(); } if(appName === 'wallet') updateWalletApp();
        }

        function init() {
            document.getElementById('currency-select').value = appState.currency || 'USD'; document.getElementById('wallet-currency').value = appState.currency || 'USD';
            buildTerminalDropdown(); refreshWorkspace(); document.getElementById('ai-logic-editor').value = appState.aiLogic; setupCanvas();
            connectMultiStream(); connectGlobalTradeStream(); triggerPairChange(); optimizeMemory(); syncServerBot();
            setInterval(updateWalletSystem, 1000);
        }

        function renderWalletTabs() {
            document.getElementById('wallet-tabs').innerHTML = appState.wallets.map((wallet, idx) => `<button onclick="switchWallet(${idx})" class="px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest transition border ${idx === appState.activeWalletIdx ? 'bg-[#F3BA2F] text-black border-[#F3BA2F]' : 'bg-[#1e2329] text-muted border-[#2b3139] hover:border-[#F3BA2F] hover:text-white'}">${wallet.name}</button>`).join('');
            document.getElementById('trade-wallet-select').innerHTML = appState.wallets.map((wl, idx) => `<option value="${idx}" ${idx === appState.activeWalletIdx ? 'selected' : ''}>${wl.name}</option>`).join('');
            document.getElementById('wallet-name-label').innerText = w().name;
        }

        function addWallet() { let n = prompt("Enter new wallet name:"); if(!n) return; appState.wallets.push({ id: Date.now(), name: n, usdtBalance: 0, startOfDayValue: 0, orders: [], history: [], manualAssets: {}, stakes: [] }); appState.activeWalletIdx = appState.wallets.length - 1; saveState(); refreshWorkspace(); connectMultiStream(); }
        function switchWallet(idx) { appState.activeWalletIdx = parseInt(idx); saveState(); refreshWorkspace(); connectMultiStream(); drawChart(); }
        function refreshWorkspace() { renderWalletTabs(); renderOrders(); renderHistory(); updateWalletApp(); updateUI(); }

        function getIconPath(coin) { if (coin === 'USDT') return 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=029'; const a = ASSETS.find(x => x.id.replace('USDT','') === coin || x.coin === coin); if (a && a.gif) return a.gif; if (a) return `https://cryptologos.cc/logos/${a.icon}`; return `https://ui-avatars.com/api/?name=${coin}&background=1e2329&color=F3BA2F&rounded=true`; }
        function getIconImg(coin, cls) { const a = ASSETS.find(x => x.id.replace('USDT','') === coin || x.coin === coin); let src = getIconPath(coin); let fallback = a ? `https://cryptologos.cc/logos/${a.icon}` : 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=029'; return `<img src="${src}" class="${cls} rounded bg-[#1e2329] p-0.5 border border-[#2b3139] object-contain" onerror="this.onerror=null;this.src='${fallback}';">`; }

        function setCurrency(c) { appState.currency = c; document.getElementById('currency-select').value = c; document.getElementById('wallet-currency').value = c; saveState(); updateWalletSystem(); updateWalletApp(); }
        function toggleDropdown(id) { const el = document.getElementById(id); if(el) { el.classList.toggle('dropdown-hidden'); el.classList.toggle('dropdown-active'); } }
        document.addEventListener('click', (e) => { const drop = document.getElementById('term-dropdown'); if(drop && !e.target.closest('#term-dropdown') && !e.target.closest(`[onclick="toggleDropdown('term-dropdown')"]`)) { drop.classList.add('dropdown-hidden'); drop.classList.remove('dropdown-active'); } });
        function toggleModal(id) { const el = document.getElementById(id); el.classList.toggle('modal-hidden'); el.classList.toggle('modal-active'); }

        function buildTerminalDropdown() { document.getElementById('term-dropdown').innerHTML = ASSETS.map(a => `<div onclick="selectPair('${a.id}', '${a.name}', '${a.coin}')" class="px-3 py-2 hover:bg-[#2b3139] cursor-pointer flex items-center gap-2 transition border-b border-[#2b3139]"><img src="${getIconPath(a.coin)}" onerror="this.onerror=null;this.src='https://cryptologos.cc/logos/${a.icon}';" class="w-5 h-5 rounded bg-[#1e2329] p-0.5 object-contain"><span class="text-[10px] font-black uppercase text-white tracking-widest">${a.name}</span></div>`).join(''); }
        function selectPair(id, name, coin) { ui.pair = id; document.getElementById('term-text').innerText = name; document.getElementById('term-logo-container').innerHTML = getIconImg(coin, 'w-5 h-5 w-full h-full'); toggleDropdown('term-dropdown'); triggerPairChange(); }

        function connectMultiStream() {
            let streamSet = new Set(['btcusdt@ticker', 'ethusdt@ticker', 'solusdt@ticker', 'xrpusdt@ticker']);
            if(wsTicker) wsTicker.close(); wsTicker = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${Array.from(streamSet).join('/')}`);
            wsTicker.onmessage = (e) => { const payload = JSON.parse(e.data); if(payload.data && payload.data.c) { livePrices[payload.data.s] = parseFloat(payload.data.c); if(payload.data.s === ui.pair) processMainTick(parseFloat(payload.data.c)); } };
            wsTicker.onclose = () => setTimeout(connectMultiStream, 3000); 
        }

        function connectGlobalTradeStream() {
            let tradeStreams = ['btcusdt@aggTrade', 'ethusdt@aggTrade'];
            if(wsTrade) wsTrade.close(); wsTrade = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${tradeStreams.join('/')}`);
            wsTrade.onmessage = (e) => {
                const payload = JSON.parse(e.data);
                if(payload.data && payload.data.e === 'aggTrade') {
                    const data = payload.data; const price = parseFloat(data.p), qty = parseFloat(data.q); const isBuy = !data.m, usdVal = price * qty; const pair = data.s;
                    if(usdVal < 1000) return; 
                    appState.globalTradeLogs.unshift({ addr: '0x' + Math.random().toString(16).substring(2, 8).toUpperCase(), isBuy, qty, price, usdVal, pair, time: Date.now() });
                    // Memory Cap (Immediate execution fallback)
                    if(appState.globalTradeLogs.length > 500) appState.globalTradeLogs.pop(); 

                    if(pair === ui.pair) {
                        if(isBuy) flowData.buy += usdVal; else flowData.sell += usdVal;
                        updateRatioBar(); renderOnChainAlpha(); renderGlobalLogs();
                        if(usdVal > 150000) {
                            let exist = appState.topHoldersSim.find(h => h.addr === '0xWHALE');
                            if(!exist) appState.topHoldersSim.push({addr: '0xWHALE', usd: usdVal, lastAction: isBuy ? 'BUY' : 'SELL', amt: Math.round(usdVal)});
                            renderTopHolders();
                        }
                    }
                }
            };
            wsTrade.onclose = () => setTimeout(connectGlobalTradeStream, 3000); 
        }

        function triggerPairChange() {
            ui.chartData = []; ui.price = livePrices[ui.pair] || 0; flowData = {buy:0, sell:0}; renderOnChainAlpha();
            document.getElementById('main-price').innerText = "Syncing..."; fetchChartData(); fetch24hStats(); renderTopHolders(); renderGlobalLogs();
        }

        async function fetch24hStats() {
            try { let res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${ui.pair}`); let data = await res.json();
                document.getElementById('stat-high').innerText = parseFloat(data.highPrice).toLocaleString(); document.getElementById('stat-low').innerText = parseFloat(data.lowPrice).toLocaleString();
            } catch(e){}
        }

        function updateWalletSystem() {
            let totalUsdValue = w().usdtBalance; let termHtml = createTerminalSimpleCard('USDT', w().usdtBalance, w().usdtBalance);
            w().orders.forEach(o => { let livePrice = livePrices[o.pair] || o.entry; totalUsdValue += o.margin; let pnl = o.side === 'buy' ? ((o.units * livePrice) - (o.margin * o.lev)) : ((o.margin * o.lev) - (o.units * livePrice)); totalUsdValue += pnl; });
            for (const [coin, amt] of Object.entries(w().manualAssets)) { let valUsd = amt * (livePrices[coin + 'USDT'] || 0); totalUsdValue += valUsd; termHtml += createTerminalSimpleCard(coin, amt, valUsd); }
            document.getElementById('terminal-asset-list').innerHTML = termHtml;
            
            let rate = FX_RATES[appState.currency] || 1; let sym = FX_SYM[appState.currency] || '$'; let localTotal = totalUsdValue * rate;
            document.getElementById('hero-currency-sym').innerText = sym; document.getElementById('hero-total-balance').innerText = localTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
            document.getElementById('wallet-currency-sym').innerText = sym; document.getElementById('wallet-total-value').innerText = localTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
            
            let dPnlUsd = totalUsdValue - (w().startOfDayValue || 1); let dPnlLocal = dPnlUsd * rate; let dRoi = (dPnlUsd / (w().startOfDayValue || 1)) * 100;
            const pnlEl = document.getElementById('hero-daily-pnl'); const roiEl = document.getElementById('hero-daily-roi');
            pnlEl.innerText = `${dPnlLocal >= 0 ? '+' : ''}${sym}${dPnlLocal.toFixed(2)}`; pnlEl.className = `text-xs md:text-sm font-black tracking-wide ${dPnlLocal >= 0 ? 'text-green-400' : 'text-pink-400'}`;
            roiEl.innerText = `${dPnlLocal >= 0 ? '+' : ''}${dRoi.toFixed(2)}% Today`; roiEl.className = `text-[9px] md:text-[10px] font-black px-1.5 py-0.5 rounded border mt-1 bg-[#0b0e11] ${dPnlLocal >= 0 ? 'text-green-400 border-green-500/30' : 'text-pink-400 border-pink-500/30'}`;
            appState.lastRunTime = Date.now(); 
        }

        function createTerminalSimpleCard(coin, amount, valueUsd) {
            let rate = FX_RATES[appState.currency] || 1; let sym = FX_SYM[appState.currency] || '$'; let valLocal = valueUsd * rate;
            const valStr = valueUsd >= 0 ? `${sym}${valLocal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '...';
            return `<div class="dramatic-box bg-[#1e2329] px-2 py-1.5 rounded flex items-center gap-2 cursor-pointer"><div class="w-4 h-4">${getIconImg(coin, 'w-full h-full')}</div><span class="text-[9px] font-black text-white uppercase">${coin}</span><span class="text-[9px] font-mono font-bold text-[#F3BA2F] ml-1">${valStr}</span></div>`;
        }

        function setupCanvas() {
            const container = document.getElementById('canvas-container'); const canvas = document.getElementById('custom-chart'); chartCtx = canvas.getContext('2d');
            function resize() { const rect = container.getBoundingClientRect(); if(rect.width === 0) return; const dpr = window.devicePixelRatio || 1; canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; chartCtx.scale(dpr, dpr); drawChart(); }
            window.addEventListener('resize', resize); setTimeout(resize, 100); 
            canvas.addEventListener('mousemove', (e) => { const rect = canvas.getBoundingClientRect(); canvasHoverPos = e.clientX - rect.left; drawChart(); }); canvas.addEventListener('mouseleave', () => { canvasHoverPos = null; drawChart(); });
        }

        async function fetchChartData() {
            if(ui.timeframe === 'live') { ui.chartData = []; return; }
            let interval = ui.timeframe; let limit = 100; if(interval === '7d') { interval = '4h'; limit = 42; } if(interval === '1y') { interval = '1d'; limit = 365; } if(interval === 'max') { interval = '1w'; limit = 500; } 
            try { let res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${ui.pair}&interval=${interval}&limit=${limit}`); let json = await res.json(); ui.chartData = json.map(d => ({ time: parseInt(d[0]), price: parseFloat(d[4]) })); drawChart(); calcAIEngine(); } catch(e) {}
        }

        function setTimeframe(tf) { ui.timeframe = tf; document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active')); document.getElementById(`tf-${tf}`).classList.add('active'); fetchChartData(); }

        function drawChart() {
            if(!chartCtx || ui.chartData.length < 2) return;
            const canvas = document.getElementById('custom-chart'); if(canvas.width === 0) return;
            const width = canvas.width / (window.devicePixelRatio || 1); const h = canvas.height / (window.devicePixelRatio || 1); const data = ui.chartData;
            chartCtx.clearRect(0, 0, width, h);
            const padYBottom = 20, padXRight = 70; const gW = width - padXRight, gH = h - padYBottom;
            const prices = data.map(d => d.price); const minPrice = Math.min(...prices); const maxPrice = Math.max(...prices); const range = maxPrice - minPrice || 1; 
            
            chartCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)'; chartCtx.lineWidth = 1; chartCtx.fillStyle = '#848E9C'; chartCtx.font = '9px monospace'; chartCtx.textAlign = 'left'; chartCtx.textBaseline = 'middle';
            for(let i=0; i<=4; i++) { const yPos = (i / 4) * gH; chartCtx.beginPath(); chartCtx.moveTo(0, yPos); chartCtx.lineTo(gW, yPos); chartCtx.stroke(); let gridPrice = maxPrice - (i / 4) * range; let gridText = gridPrice >= 1000 ? Math.round(gridPrice).toLocaleString() : gridPrice.toFixed(minPrice<1?4:2); chartCtx.fillText(gridText, gW + 6, yPos); }
            
            chartCtx.beginPath(); let points = [];
            for(let i = 0; i < data.length; i++) { const x = (i / (data.length - 1)) * gW; let y = ((maxPrice - data[i].price) / range) * (gH * 0.8) + (gH * 0.1); y = Math.max(5, Math.min(gH - 5, y)); points.push({x, y, p: data[i].price}); if(i === 0) chartCtx.moveTo(x, y); else chartCtx.lineTo(x, y); }
            chartCtx.lineTo(points[points.length-1].x, gH); chartCtx.lineTo(points[0].x, gH); chartCtx.closePath();
            let gradient = chartCtx.createLinearGradient(0, 0, 0, gH); gradient.addColorStop(0, 'rgba(243, 186, 47, 0.3)'); gradient.addColorStop(1, 'rgba(243, 186, 47, 0.0)'); chartCtx.fillStyle = gradient; chartCtx.fill();
            chartCtx.beginPath(); for(let i = 0; i < points.length; i++) { if(i === 0) chartCtx.moveTo(points[i].x, points[i].y); else chartCtx.lineTo(points[i].x, points[i].y); } chartCtx.strokeStyle = '#F3BA2F'; chartCtx.lineWidth = 2; chartCtx.lineJoin = 'round'; chartCtx.stroke();
            
            w().orders.forEach(o => {
                if(o.pair === ui.pair) {
                    let y = ((maxPrice - o.entry) / range) * (gH * 0.8) + (gH * 0.1);
                    if(y > 0 && y < gH) {
                        chartCtx.beginPath(); chartCtx.moveTo(0, y); chartCtx.lineTo(gW, y); chartCtx.strokeStyle = o.side === 'buy' ? '#34d399' : '#fb7185'; chartCtx.lineWidth = 1.5; chartCtx.setLineDash([4, 4]); chartCtx.stroke(); chartCtx.setLineDash([]);
                        chartCtx.fillStyle = o.side === 'buy' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 113, 133, 0.15)'; chartCtx.fillRect(gW - 60, y - 10, 60, 20); chartCtx.fillStyle = o.side === 'buy' ? '#34d399' : '#fb7185'; chartCtx.font = 'bold 9px monospace'; chartCtx.fillText(`${o.lev}x ${o.side.toUpperCase()}`, gW - 55, y);
                    }
                }
            });

            if(canvasHoverPos !== null && canvasHoverPos <= gW) {
                let closest = points.reduce((prev, curr) => Math.abs(curr.x - canvasHoverPos) < Math.abs(prev.x - canvasHoverPos) ? curr : prev);
                chartCtx.strokeStyle = 'rgba(255,255,255,0.3)'; chartCtx.lineWidth = 1; chartCtx.setLineDash([4, 4]); chartCtx.beginPath(); chartCtx.moveTo(closest.x, 0); chartCtx.lineTo(closest.x, gH); chartCtx.stroke();
                chartCtx.beginPath(); chartCtx.moveTo(0, closest.y); chartCtx.lineTo(gW, closest.y); chartCtx.stroke(); chartCtx.setLineDash([]); chartCtx.beginPath(); chartCtx.arc(closest.x, closest.y, 4, 0, Math.PI*2); chartCtx.fillStyle = '#F3BA2F'; chartCtx.fill();
            } else { const last = points[points.length-1]; chartCtx.beginPath(); chartCtx.arc(last.x, last.y, 4, 0, Math.PI*2); chartCtx.fillStyle = '#F3BA2F'; chartCtx.fill(); }
        }

        function processMainTick(newPrice) {
            const el = document.getElementById('main-price');
            if (ui.lastPrice !== 0 && newPrice !== ui.lastPrice) {
                const isUp = newPrice > ui.lastPrice; el.style.color = isUp ? '#34d399' : '#fb7185';
                const wrap = document.getElementById('main-chart-wrapper'); wrap.classList.remove('flash-up', 'flash-down'); void wrap.offsetWidth; wrap.classList.add(isUp ? 'flash-up' : 'flash-down');
                setTimeout(()=>el.style.color='white', 300);
            }
            ui.lastPrice = newPrice; ui.price = newPrice;
            if(ui.timeframe === 'live') { ui.chartData.push({time: Date.now(), price: newPrice}); if(ui.chartData.length > 50) ui.chartData.shift(); } else if (ui.chartData.length > 0) { ui.chartData[ui.chartData.length - 1].price = newPrice; }
            
            processAIPaperTrades(newPrice);
            if(Math.random() < 0.1) calcAIEngine(); 
            if(!canvasHoverPos) drawChart(); 
            
            el.innerText = newPrice.toLocaleString(undefined, {minimumFractionDigits: newPrice<1?4:2, maximumFractionDigits: newPrice<1?4:2});
            renderOrders(); 
        }

        function processAIPaperTrades(livePrice) {
            let active = appState.aiStats.activePaper;
            for(let t of active) { if(t.pair === ui.pair) { t.currentRoi = t.side === 'buy' ? ((livePrice - t.entry) / t.entry) * t.lev * 100 : ((t.entry - livePrice) / t.entry) * t.lev * 100; } }
            for (let i = active.length - 1; i >= 0; i--) {
                let trade = active[i];
                if (trade.pair !== ui.pair) continue;
                if (trade.currentRoi > 15 || trade.currentRoi < -10) {
                    if(trade.currentRoi > 0) appState.aiStats.wins++; else appState.aiStats.losses++;
                    appState.aiStats.pnl += (trade.margin * (trade.currentRoi/100));
                    active.splice(i, 1);
                }
            }
            renderAIStats(); 
        }

        function calcAIEngine() {
            if(ui.chartData.length < 21) return; 
            let gains = 0, losses = 0; const rsiData = ui.chartData.slice(-15);
            for(let i=1; i<rsiData.length; i++) { let diff = rsiData[i].price - rsiData[i-1].price; if(diff >= 0) gains += diff; else losses -= diff; }
            let rs = (gains/14) / ((losses/14) || 1); let rsi = 100 - (100 / (1 + rs));
            const smaData = ui.chartData.slice(-20); let sma = smaData.reduce((acc, val) => acc + val.price, 0) / 20;
            const prices = smaData.map(d => d.price); let vol = Math.max(...prices) - Math.min(...prices);

            let now = Date.now();
            let logs = appState.globalTradeLogs.filter(l => l.pair === ui.pair);
            let logs15 = logs.filter(l => now - l.time < 900000); let logs1h = logs.filter(l => now - l.time < 3600000);
            let b15 = logs15.filter(l=>l.isBuy).reduce((a,b)=>a+b.usdVal,0); let s15 = logs15.filter(l=>!l.isBuy).reduce((a,b)=>a+b.usdVal,0); let ratio15 = b15 / (b15+s15+1);
            let b1h = logs1h.filter(l=>l.isBuy).reduce((a,b)=>a+b.usdVal,0); let s1h = logs1h.filter(l=>!l.isBuy).reduce((a,b)=>a+b.usdVal,0); let ratio1h = b1h / (b1h+s1h+1);

            let whaleSent = ratio1h;
            let topBuysAmount = logs15.filter(l => l.isBuy).sort((a,b) => b.usdVal - a.usdVal).slice(0,5).reduce((a,b)=>a+b.usdVal,0);
            let topSellsAmount = logs15.filter(l => !l.isBuy).sort((a,b) => b.usdVal - a.usdVal).slice(0,5).reduce((a,b)=>a+b.usdVal,0);

            document.getElementById('ai-rsi').innerText = rsi.toFixed(1); document.getElementById('ai-sma').innerText = sma.toFixed(2); document.getElementById('ai-vol').innerText = vol.toFixed(2);
            document.getElementById('ai-b15').innerText = (ratio15*100).toFixed(0) + '%'; document.getElementById('ai-b1h').innerText = (ratio1h*100).toFixed(0) + '%'; document.getElementById('ai-whale').innerText = (whaleSent*100).toFixed(0) + '%';
            
            try {
                let fn = new Function('rsi', 'sma', 'volatility', 'prices', 'buyRatio15m', 'buyRatio1h', 'whaleSentiment', 'topBuysAmount', 'topSellsAmount', appState.aiLogic); 
                let resStr = fn(rsi, sma, vol, prices, ratio15, ratio1h, whaleSent, topBuysAmount, topSellsAmount);
                let res = JSON.parse(resStr);
                currentAISuggestion = res;

                const sEl = document.getElementById('ai-short-signal'); const sConf = document.getElementById('ai-short-conf'); const sBtn = document.getElementById('ai-short-btn');
                if (res.short.side === 'WAIT' || !res.short.side) { sEl.innerText = 'WAITING FOR SETUP'; sEl.className = 'text-xs font-black uppercase text-muted'; sConf.innerText = '--'; sBtn.classList.add('hidden'); } else { sConf.innerText = res.short.conf + '% Conf'; sEl.innerText = `${res.short.lev}x ${res.short.side}`; sEl.className = res.short.side === 'buy' ? 'text-xs font-black uppercase text-green-400' : 'text-xs font-black uppercase text-pink-400'; sBtn.classList.remove('hidden'); }

                const lEl = document.getElementById('ai-long-signal'); const lConf = document.getElementById('ai-long-conf'); const lBtn = document.getElementById('ai-long-btn');
                if (res.long.side === 'WAIT' || !res.long.side) { lEl.innerText = 'WAITING FOR SETUP'; lEl.className = 'text-xs font-black uppercase text-muted'; lConf.innerText = '--'; lBtn.classList.add('hidden'); } else { lConf.innerText = res.long.conf + '% Conf'; lEl.innerText = `${res.long.lev}x ${res.long.side}`; lEl.className = res.long.side === 'buy' ? 'text-xs font-black uppercase text-green-400' : 'text-xs font-black uppercase text-pink-400'; lBtn.classList.remove('hidden'); }

                if(Math.random() > 0.8 && appState.aiStats.activePaper.length < 6 && res.short.side !== 'WAIT') {
                    let hId = Date.now();
                    appState.aiStats.activePaper.push({ hedgeId: hId, pair: ui.pair, side: 'buy', lev: res.short.lev, entry: ui.price, margin: 500, currentRoi: 0 });
                    appState.aiStats.activePaper.push({ hedgeId: hId, pair: ui.pair, side: 'sell', lev: res.short.lev, entry: ui.price, margin: 500, currentRoi: 0 });
                }
            } catch(e) {}
        }

        function renderAIStats() {
            let total = appState.aiStats.wins + appState.aiStats.losses; let wr = total > 0 ? (appState.aiStats.wins / total) * 100 : 0;
            const pnlEl = document.getElementById('ai-paper-pnl'); pnlEl.innerText = (appState.aiStats.pnl >= 0 ? '+$' : '-$') + Math.abs(appState.aiStats.pnl).toFixed(2); pnlEl.className = appState.aiStats.pnl >= 0 ? "text-green-400 drop-shadow" : "text-pink-400";
            document.getElementById('ai-paper-winrate').innerText = `Win: ${wr.toFixed(0)}% (${appState.aiStats.wins}/${total})`;
            
            const listContainer = document.getElementById('ai-active-papers-list');
            if (appState.aiStats.activePaper.length === 0) listContainer.innerHTML = '<div class="text-[8px] text-muted text-center py-2 italic border border-dashed border-[#2b3139] rounded">Awaiting signals...</div>';
            else listContainer.innerHTML = appState.aiStats.activePaper.map(t => { let isProf = t.currentRoi >= 0; let pnlVal = t.margin * (t.currentRoi / 100); return `<div class="flex justify-between items-center bg-[#1e2329] px-2 py-1.5 rounded border ${isProf ? 'border-green-500/30' : 'border-pink-500/30'} shrink-0"><div class="flex flex-col"><span class="text-[9px] font-black uppercase text-white">${t.pair.replace('USDT','')} <span class="${t.side==='buy'?'text-green-400':'text-pink-400'}">${t.lev}x ${t.side}</span></span><span class="text-[7px] text-muted font-mono">Margin: $${t.margin.toFixed(0)}</span></div><div class="flex flex-col text-right"><span class="text-[10px] font-black font-mono ${isProf ? 'text-green-400' : 'text-pink-400'}">${isProf?'+':''}${t.currentRoi.toFixed(2)}%</span><span class="text-[8px] font-black font-mono ${isProf ? 'text-green-400' : 'text-pink-400'}">${isProf?'+':''}$${pnlVal.toFixed(2)}</span></div></div>`; }).join('');
        }

        function executeAISuggestion(type) {
            if(!currentAISuggestion || currentAISuggestion[type].side === 'WAIT') return alert("Algo is waiting for a setup.");
            let suggestion = currentAISuggestion[type];
            let amt = prompt(`[ALGO ${type.toUpperCase()}] Execute ${suggestion.lev}x ${suggestion.side.toUpperCase()}.\n\nEnter USDT Margin Amount:`);
            let margin = parseFloat(amt);
            if(!margin || margin <= 0 || margin > w().usdtBalance) return alert("Invalid margin or insufficient balance.");
            w().usdtBalance -= margin; w().orders.push({ id: Math.random().toString(36).substr(2, 9), pair: ui.pair, side: suggestion.side, margin: margin, lev: suggestion.lev, entry: ui.price, units: (margin * suggestion.lev) / ui.price, time: Date.now() });
            saveState(); renderOrders(); drawChart(); updateWalletSystem();
        }

        function saveAILogic() { appState.aiLogic = document.getElementById('ai-logic-editor').value; saveState(); toggleModal('ai-code-modal'); calcAIEngine(); }

        function updateRatioBar() {
            const t = flowData.buy + flowData.sell; let bPct = 50, sPct = 50; if(t > 0) { bPct = (flowData.buy/t)*100; sPct = (flowData.sell/t)*100; }
            document.querySelectorAll('#ratio-buy-bar').forEach(el => el.style.width = `${bPct}%`); document.querySelectorAll('#ratio-sell-bar').forEach(el => el.style.width = `${sPct}%`);
            document.querySelectorAll('#ratio-buy-text').forEach(el => el.innerText = `${bPct.toFixed(0)}%`); document.querySelectorAll('#ratio-sell-text').forEach(el => el.innerText = `${sPct.toFixed(0)}%`);
        }

        function setLogFilter(f) { ui.logFilter = f; document.getElementById('filter-all').className = f==='all' ? "text-[9px] font-black uppercase bg-[#F3BA2F] text-black px-2 py-0.5 rounded" : "text-[9px] font-black uppercase text-muted hover:text-white px-2 py-0.5 rounded border border-transparent hover:border-[#F3BA2F]"; document.getElementById('filter-whales').className = f==='whales' ? "text-[9px] font-black uppercase bg-[#F3BA2F] text-black px-2 py-0.5 rounded" : "text-[9px] font-black uppercase text-muted hover:text-white px-2 py-0.5 rounded border border-transparent hover:border-[#F3BA2F]"; renderGlobalLogs(); }

        function renderGlobalLogs() {
            const feed = document.getElementById('below-chart-log'); let filtered = appState.globalTradeLogs.filter(l => l.pair === ui.pair); if(ui.logFilter === 'whales') filtered = filtered.filter(l => l.usdVal >= 25000);
            if(filtered.length === 0) { feed.innerHTML = '<div class="text-[9px] text-muted text-center py-4 italic">Awaiting block trades...</div>'; return; }
            feed.innerHTML = filtered.slice(0, 50).map(l => { const cStr = l.isBuy ? 'text-green-400' : 'text-pink-400'; const bStr = l.isBuy ? 'border-green-500/30' : 'border-pink-500/30'; return `<div class="flex justify-between items-center px-3 py-1.5 rounded bg-[#1e2329] border ${bStr} shrink-0"><span class="text-[9px] font-mono text-muted w-16">${l.addr}</span><span class="text-[9px] font-black ${cStr} uppercase">${l.pair.replace('USDT','')} ${l.isBuy?'BUY':'SELL'} ${l.qty.toFixed(l.price<1?0:4)}</span><span class="text-[9px] font-mono text-white">$${l.usdVal.toLocaleString(undefined, {maximumFractionDigits:0})}</span></div>`; }).join('');
        }

        function setAlphaTimeframe(ms) { ui.alphaTfMs = parseInt(ms); const lbl = ms == 300000 ? "5M" : ms == 900000 ? "15M" : ms == 3600000 ? "1H" : ms == 18000000 ? "5H" : ms == 86400000 ? "24H" : "1W"; document.getElementById('lbl-buy-tf').innerText = lbl; document.getElementById('lbl-sell-tf').innerText = lbl; renderOnChainAlpha(); }

        function renderOnChainAlpha() {
            const buysContainer = document.getElementById('ui-top-buys'); const sellsContainer = document.getElementById('ui-top-sells');
            const now = Date.now(); const pairLogs = appState.globalTradeLogs.filter(l => l.pair === ui.pair && (now - l.time) <= ui.alphaTfMs);
            let buys = pairLogs.filter(l => l.isBuy).sort((a,b) => b.usdVal - a.usdVal).slice(0,5); let sells = pairLogs.filter(l => !l.isBuy).sort((a,b) => b.usdVal - a.usdVal).slice(0,5);
            if (buys.length === 0) buysContainer.innerHTML = `<div class="text-[9px] text-muted text-center italic py-2">No buys in timeframe</div>`; else buysContainer.innerHTML = buys.map(t => `<div class="flex justify-between items-center text-[10px] font-mono"><span class="text-white">${t.qty.toFixed(ui.price<1?0:4)} <span class="text-[8px] text-muted">${ui.pair.replace('USDT','')}</span></span><span class="text-green-400 font-black">$${t.usdVal.toLocaleString(undefined,{maximumFractionDigits:0})}</span></div>`).join('');
            if (sells.length === 0) sellsContainer.innerHTML = `<div class="text-[9px] text-muted text-center italic py-2">No sells in timeframe</div>`; else sellsContainer.innerHTML = sells.map(t => `<div class="flex justify-between items-center text-[10px] font-mono"><span class="text-white">${t.qty.toFixed(ui.price<1?0:4)} <span class="text-[8px] text-muted">${ui.pair.replace('USDT','')}</span></span><span class="text-pink-400 font-black">$${t.usdVal.toLocaleString(undefined,{maximumFractionDigits:0})}</span></div>`).join('');
        }

        function renderTopHolders() {
            document.getElementById('ui-top-holders').innerHTML = appState.topHoldersSim.map(h => { let actColor = h.lastAction.includes("BUY") || h.lastAction === "ACCUMULATING" ? "text-green-400" : h.lastAction === "HOLDING" ? "text-muted" : "text-pink-400"; return `<div class="flex justify-between items-center p-1.5 border border-[#2b3139] rounded bg-[#1e2329]"><div class="flex flex-col"><span class="text-[9px] font-mono text-white font-bold cursor-pointer hover:text-[#F3BA2F] transition">${h.addr}</span><span class="text-[8px] text-muted">Latest: <span class="${actColor} font-black">${h.lastAction} ${h.amt>0 ? '($'+h.amt.toLocaleString()+')':''}</span></span></div><div class="flex flex-col text-right"><span class="text-[9px] text-[#F3BA2F] font-black font-mono">$${(h.usd).toLocaleString()}</span></div></div>`; }).join('');
        }

        function setSide(side) { ui.side = side; document.getElementById('btn-buy').className = side==='buy' ? "flex-1 py-2.5 rounded text-[10px] font-black uppercase tracking-widest bg-[#1e2329] text-green-400 border border-green-500/50" : "flex-1 py-2.5 rounded text-[10px] font-black uppercase tracking-widest text-muted hover:text-green-400 border border-transparent"; document.getElementById('btn-sell').className = side==='sell' ? "flex-1 py-2.5 rounded text-[10px] font-black uppercase tracking-widest bg-[#1e2329] text-pink-400 border border-pink-500/50" : "flex-1 py-2.5 rounded text-[10px] font-black uppercase tracking-widest text-muted hover:text-pink-400 border border-transparent"; const exec = document.getElementById('btn-execute'); exec.innerText = side==='buy'?"Execute Long":"Execute Short"; exec.className = side==='buy'?"mt-4 w-full py-3 rounded font-black uppercase tracking-[0.2em] text-[11px] bg-green-500 text-black hover:bg-green-400 transition" : "mt-4 w-full py-3 rounded font-black uppercase tracking-[0.2em] text-[11px] bg-pink-500 text-black hover:bg-pink-400 transition"; }
        document.getElementById('trade-lev').addEventListener('input', (e) => { ui.lev = parseInt(e.target.value); document.getElementById('lev-val').innerText = ui.lev; calcSize(); }); document.getElementById('trade-margin').addEventListener('input', calcSize);
        function calcSize() { const m = parseFloat(document.getElementById('trade-margin').value) || 0; document.getElementById('ui-size').innerText = (m * ui.lev).toLocaleString(undefined, {minimumFractionDigits: 2}) + ' USDT'; }
        function setMax() { document.getElementById('trade-margin').value = Math.floor(w().usdtBalance * 100) / 100; calcSize(); }

        function executeOrder() {
            const m = parseFloat(document.getElementById('trade-margin').value); if (isNaN(m) || m <= 0) return; if (m > w().usdtBalance) return alert("Insufficient USDT.");
            w().usdtBalance -= m; w().orders.push({ id: Math.random().toString(36).substr(2, 9), pair: ui.pair, side: ui.side, margin: m, lev: ui.lev, entry: ui.price, units: (m * ui.lev) / ui.price, time: Date.now() });
            document.getElementById('trade-margin').value = ''; calcSize(); saveState(); renderOrders(); drawChart(); updateWalletSystem();
        }

        function renderOrders() {
            const container = document.getElementById('orders-body');
            if (w().orders.length === 0) { container.innerHTML = `<div class="p-4 text-center text-muted font-black uppercase text-[9px] border border-[#2b3139] border-dashed rounded">No Active Trades</div>`; return; }
            let html = '';
            w().orders.forEach(o => {
                let livePrice = livePrices[o.pair] || o.entry; let pnl = o.side === 'buy' ? ((o.units * livePrice) - (o.margin * o.lev)) : ((o.margin * o.lev) - (o.units * livePrice));
                let roi = (pnl / o.margin) * 100; const isProf = pnl >= 0; const coin = o.pair.replace('USDT', '');
                html += `<div class="card-row p-3 flex flex-col md:flex-row gap-3 items-center justify-between group"><div class="flex items-center justify-between w-full md:w-auto min-w-[120px] gap-2"><div class="flex items-center gap-2">${getIconImg(coin, 'w-5 h-5')}<span class="text-white font-black uppercase text-[10px]">${o.pair}</span></div><span class="px-2 py-0.5 rounded ${o.side==='buy'?'bg-[#1e2329] text-green-400 border border-green-500/20':'bg-[#1e2329] text-pink-400 border border-pink-500/20'} uppercase text-[8px] font-black">${o.lev}x ${o.side}</span></div><div class="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full text-[9px] md:flex-1 md:justify-around"><div class="flex flex-col"><span class="text-muted">Entry</span><span class="text-[#F3BA2F] font-mono">$${o.entry.toFixed(4)}</span></div><div class="flex flex-col"><span class="text-muted">Mark Price</span><span class="text-white font-mono">$${livePrice.toFixed(4)}</span></div><div class="flex flex-col"><span class="text-muted">Margin</span><span class="text-white font-mono">$${o.margin.toFixed(2)}</span></div><div class="flex flex-col"><span class="text-muted">Total Size</span><span class="text-white font-mono">$${(o.margin * o.lev).toFixed(2)}</span></div></div><div class="flex items-center justify-between w-full md:w-auto gap-4 border-t md:border-t-0 border-[#2b3139] pt-2 md:pt-0"><div class="flex flex-col text-right"><span class="text-muted text-[8px] uppercase">PnL / ROI</span><span class="${isProf?'text-green-400':'text-pink-400'} font-black font-mono text-[10px]">${isProf?'+':''}${roi.toFixed(2)}% | ${isProf?'+':''}$${pnl.toFixed(2)}</span></div><button onclick="closeOrder('${o.id}')" class="px-3 py-1.5 bg-[#1e2329] text-white rounded text-[8px] uppercase font-black transition border border-[#2b3139] hover:border-pink-500 hover:text-pink-400">Close</button></div></div>`;
            });
            container.innerHTML = html;
        }

        function closeOrder(id) {
            const idx = w().orders.findIndex(p => p.id === id); if(idx===-1) return; const o = w().orders[idx];
            let pnl = o.side === 'buy' ? ((o.units * (livePrices[o.pair]||o.entry)) - (o.margin * o.lev)) : ((o.margin * o.lev) - (o.units * (livePrices[o.pair]||o.entry)));
            w().usdtBalance += (o.margin + pnl); w().history.unshift({ pair: o.pair, pnl: pnl }); if(w().history.length > 50) w().history.pop();
            w().orders.splice(idx, 1); 
            
            // Sync new balance back to the database
            fetch('/admin/trading/sync', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ balance: w().usdtBalance }) });
            
            saveState(); renderOrders(); renderHistory(); drawChart(); updateWalletSystem();
        }

        function renderHistory() {
            const container = document.getElementById('history-body'); let html = '';
            w().history.forEach(h => { const coin = h.pair.replace('USDT', ''); html += `<div class="card-row p-2 flex justify-between items-center bg-[#1e2329]"><div class="flex items-center gap-2">${getIconImg(coin, 'w-4 h-4')}<span class="text-white font-black text-[9px] uppercase">${h.pair}</span></div><span class="font-black font-mono text-[10px] ${h.pnl>=0?'text-green-400':'text-pink-400'}">${h.pnl>=0?'+':''}$${h.pnl.toFixed(2)}</span></div>`; });
            container.innerHTML = html || `<div class="p-3 text-center text-muted text-[9px] uppercase font-black border border-[#2b3139] border-dashed rounded">No History</div>`;
        }

        function toggleShowMoreAssets() { isShowingAllAssets = !isShowingAllAssets; updateWalletApp(); }
        function updateWalletApp() {
            let totalUsdValue = w().usdtBalance; let rows = []; let rate = FX_RATES[appState.currency] || 1; let sym = FX_SYM[appState.currency] || '$';
            const addRow = (coin, amt) => { let valUsd = coin === 'USDT' ? amt : amt * (livePrices[coin + 'USDT'] || 0); totalUsdValue += valUsd; rows.push({ coin, amt, valUsd }); };
            addRow('USDT', w().usdtBalance); for (const [coin, amt] of Object.entries(w().manualAssets)) addRow(coin, amt); rows.sort((a,b) => b.valUsd - a.valUsd);
            let gridHtml = ''; let renderCount = isShowingAllAssets ? rows.length : Math.min(6, rows.length);
            for(let i=0; i<renderCount; i++) { let r = rows[i]; let valLocal = r.valUsd * rate; gridHtml += `<div class="dramatic-box panel p-4 flex flex-col items-center justify-center text-center gap-1.5 aspect-square cursor-pointer"><div class="w-8 h-8 md:w-10 md:h-10 mb-1">${getIconImg(r.coin, 'w-full h-full')}</div><span class="font-black text-white text-xs md:text-sm uppercase tracking-widest">${r.coin}</span><span class="font-mono text-muted text-[9px] md:text-[10px]">${r.amt.toLocaleString(undefined, {maximumFractionDigits: 4})}</span><span class="font-mono text-white font-bold mt-auto bg-[#0b0e11] w-full py-1 rounded border border-[#2b3139] text-[10px] md:text-xs">${sym}${valLocal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>`; }
            document.getElementById('wallet-square-grid').innerHTML = gridHtml; const btn = document.getElementById('show-more-btn'); if(rows.length > 6) { btn.classList.remove('hidden'); btn.innerText = isShowingAllAssets ? "Show Less" : "Show More Assets"; } else { btn.classList.add('hidden'); }
        }

        function updateUI() { document.getElementById('ui-avail').innerText = w().usdtBalance.toLocaleString(undefined, {minimumFractionDigits: 2}) + ' USDT'; renderAIStats(); }
        function saveState() { localStorage.setItem('cloudquant_v12_algo', JSON.stringify(appState)); updateUI(); }

        init();
    </script>
</body>
</html>
