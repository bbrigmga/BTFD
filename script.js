// Stock Screener Application
class StockScreener {
    constructor() {
        this.stocks = [];
        this.filteredStocks = [];
        this.currentMarketFilter = 'all';
        this.currentSortFilter = 'marketCap';
        this.logoCache = new Map();
        this.init();
    }

    async init() {
        await this.loadStockData();
        // Setup event listeners after data is loaded and DOM is ready
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Retry button
        const retryButton = document.getElementById('retry-button');
        if (retryButton) {
            retryButton.addEventListener('click', () => this.loadStockData());
        }

        // Wait a bit to ensure DOM is fully ready
        setTimeout(() => {
            // Filter controls
            const marketFilter = document.getElementById('market-filter');
            const sortFilter = document.getElementById('sort-filter');

            if (marketFilter) {
                // Create handler function
                this.handleMarketFilterChange = (e) => {
                    this.currentMarketFilter = e.target.value;
                    this.applyFilters();
                };
                
                // Add multiple event types for better compatibility
                marketFilter.addEventListener('change', this.handleMarketFilterChange);
                marketFilter.addEventListener('input', this.handleMarketFilterChange);
            }

            if (sortFilter) {
                // Create handler function
                this.handleSortFilterChange = (e) => {
                    this.currentSortFilter = e.target.value;
                    this.applyFilters();
                };
                
                // Add multiple event types for better compatibility
                sortFilter.addEventListener('change', this.handleSortFilterChange);
                sortFilter.addEventListener('input', this.handleSortFilterChange);
            }

            // Add polling mechanism as fallback for better browser compatibility
            this.startFilterPolling();
        }, 100);
    }

    startFilterPolling() {
        // Poll every 500ms to check if filter values have changed
        // This ensures filtering works even if change events don't fire properly
        setInterval(() => {
            const marketFilter = document.getElementById('market-filter');
            const sortFilter = document.getElementById('sort-filter');
            
            if (marketFilter && marketFilter.value !== this.currentMarketFilter) {
                this.currentMarketFilter = marketFilter.value;
                this.applyFilters();
            }
            
            if (sortFilter && sortFilter.value !== this.currentSortFilter) {
                this.currentSortFilter = sortFilter.value;
                this.applyFilters();
            }
        }, 500);
    }

    async loadStockData() {
        this.showLoadingState();
        
        try {
            // Try to load from the generated data file first
            const response = await fetch('./data/stocks.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.stocks = data.stocks || [];
            this.updateLastUpdated(data.lastUpdated);
            
            if (this.stocks.length === 0) {
                throw new Error('No stock data available');
            }
            
            this.applyFilters();
            this.showStockGrid();
            
        } catch (error) {
            console.error('Failed to load stock data:', error);
            
            // Try to load cached data from localStorage
            const cachedData = this.loadCachedData();
            if (cachedData) {
                this.stocks = cachedData.stocks;
                this.updateLastUpdated(cachedData.lastUpdated);
                this.applyFilters();
                this.showStockGrid();
                this.showCacheNotice();
            } else {
                // Load sample data for demonstration
                this.loadSampleData();
                this.applyFilters();
                this.showStockGrid();
                this.showSampleDataNotice();
            }
        }
    }

    loadSampleData() {
        // Sample data for demonstration purposes
        this.stocks = [
            {
                ticker: 'AAPL',
                companyName: 'Apple Inc.',
                marketCap: 3000000000000,
                market: 'US',
                exchange: 'NASDAQ',
                domain: 'apple.com'
            },
            {
                ticker: 'MSFT',
                companyName: 'Microsoft Corporation',
                marketCap: 2800000000000,
                market: 'US',
                exchange: 'NASDAQ',
                domain: 'microsoft.com'
            },
            {
                ticker: 'GOOGL',
                companyName: 'Alphabet Inc.',
                marketCap: 1700000000000,
                market: 'US',
                exchange: 'NASDAQ',
                domain: 'google.com'
            },
            {
                ticker: 'AMZN',
                companyName: 'Amazon.com Inc.',
                marketCap: 1500000000000,
                market: 'US',
                exchange: 'NASDAQ',
                domain: 'amazon.com'
            },
            {
                ticker: 'TSLA',
                companyName: 'Tesla Inc.',
                marketCap: 800000000000,
                market: 'US',
                exchange: 'NASDAQ',
                domain: 'tesla.com'
            },
            {
                ticker: 'META',
                companyName: 'Meta Platforms Inc.',
                marketCap: 750000000000,
                market: 'US',
                exchange: 'NASDAQ',
                domain: 'meta.com'
            },
            {
                ticker: 'NVDA',
                companyName: 'NVIDIA Corporation',
                marketCap: 1800000000000,
                market: 'US',
                exchange: 'NASDAQ',
                domain: 'nvidia.com'
            },
            {
                ticker: 'BRK.A',
                companyName: 'Berkshire Hathaway Inc.',
                marketCap: 900000000000,
                market: 'US',
                exchange: 'NYSE',
                domain: 'berkshirehathaway.com'
            },
            {
                ticker: 'ASML',
                companyName: 'ASML Holding N.V.',
                marketCap: 300000000000,
                market: 'EU',
                exchange: 'AMS',
                domain: 'asml.com'
            },
            {
                ticker: 'NESN.SW',
                companyName: 'Nestlé S.A.',
                marketCap: 350000000000,
                market: 'EU',
                exchange: 'SWX',
                domain: 'nestle.com'
            }
        ];
        
        this.updateLastUpdated(new Date().toISOString());
    }

    loadCachedData() {
        try {
            const cached = localStorage.getItem('stockScreenerData');
            if (cached) {
                const data = JSON.parse(cached);
                const cacheAge = Date.now() - new Date(data.timestamp).getTime();
                const maxAge = 24 * 60 * 60 * 1000; // 24 hours
                
                if (cacheAge < maxAge) {
                    return data;
                }
            }
        } catch (error) {
            console.error('Failed to load cached data:', error);
        }
        return null;
    }

    cacheData() {
        try {
            const dataToCache = {
                stocks: this.stocks,
                lastUpdated: new Date().toISOString(),
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('stockScreenerData', JSON.stringify(dataToCache));
        } catch (error) {
            console.error('Failed to cache data:', error);
        }
    }

    applyFilters() {
        let filtered = [...this.stocks];

        // Apply market filter
        if (this.currentMarketFilter !== 'all') {
            filtered = filtered.filter(stock => stock.market === this.currentMarketFilter);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.currentSortFilter) {
                case 'marketCap':
                    return b.marketCap - a.marketCap;
                case 'ticker':
                    return a.ticker.localeCompare(b.ticker);
                case 'company':
                    return a.companyName.localeCompare(b.companyName);
                default:
                    return b.marketCap - a.marketCap;
            }
        });

        this.filteredStocks = filtered;
        this.updateStockCount();
        this.renderStockCards();
    }

    renderStockCards() {
        const stockGrid = document.getElementById('stock-grid');
        if (!stockGrid) return;

        stockGrid.innerHTML = '';

        this.filteredStocks.forEach(stock => {
            const card = this.createStockCard(stock);
            stockGrid.appendChild(card);
        });

        // Load logos after cards are rendered
        this.loadCompanyLogos();
    }

    createStockCard(stock) {
        const card = document.createElement('div');
        card.className = 'stock-card';
        card.setAttribute('data-symbol', stock.ticker);

        const marketCapFormatted = this.formatMarketCap(stock.marketCap);
        const marketClass = stock.market.toLowerCase();

        card.innerHTML = `
            <div class="card-header">
                <div class="company-logo placeholder" data-ticker="${stock.ticker}" data-domain="${stock.domain || ''}">
                    ${stock.ticker.charAt(0)}
                </div>
                <div class="stock-info">
                    <h3 class="ticker">${stock.ticker}</h3>
                    <p class="company-name">${stock.companyName}</p>
                </div>
            </div>
            <div class="card-body">
                <div class="market-cap">
                    <span class="label">Market Cap</span>
                    <span class="value">$${marketCapFormatted}</span>
                </div>
                <div class="market-badge ${marketClass}">
                    ${stock.market}
                </div>
            </div>
        `;

        return card;
    }

    async loadCompanyLogos() {
        const logoElements = document.querySelectorAll('.company-logo[data-domain]');
        
        logoElements.forEach(async (logoEl) => {
            const domain = logoEl.getAttribute('data-domain');
            const ticker = logoEl.getAttribute('data-ticker');
            
            if (!domain) return;
            
            try {
                await this.loadCompanyLogo(logoEl, domain, ticker);
            } catch (error) {
                console.warn(`Failed to load logo for ${ticker}:`, error);
            }
        });
    }

    async loadCompanyLogo(logoElement, domain, ticker) {
        // Check cache first
        if (this.logoCache.has(domain)) {
            const cachedUrl = this.logoCache.get(domain);
            if (cachedUrl) {
                this.displayLogo(logoElement, cachedUrl, ticker);
            }
            return;
        }

        // Try to load from Clearbit
        const logoUrl = `https://logo.clearbit.com/${domain}`;
        
        return new Promise((resolve) => {
            const img = new Image();
            
            img.onload = () => {
                this.logoCache.set(domain, logoUrl);
                this.displayLogo(logoElement, logoUrl, ticker);
                resolve();
            };
            
            img.onerror = () => {
                this.logoCache.set(domain, null);
                // Keep placeholder - no need to change anything
                resolve();
            };
            
            img.src = logoUrl;
        });
    }

    displayLogo(logoElement, logoUrl, ticker) {
        logoElement.innerHTML = '';
        logoElement.classList.remove('placeholder');
        logoElement.style.backgroundImage = `url(${logoUrl})`;
        logoElement.style.backgroundSize = 'contain';
        logoElement.style.backgroundRepeat = 'no-repeat';
        logoElement.style.backgroundPosition = 'center';
        logoElement.setAttribute('alt', `${ticker} logo`);
    }

    formatMarketCap(marketCap) {
        const billions = marketCap / 1000000000;
        if (billions >= 1000) {
            return `${(billions / 1000).toFixed(1)}T`;
        }
        return `${billions.toFixed(0)}B`;
    }

    updateLastUpdated(timestamp) {
        const lastUpdatedEl = document.getElementById('last-updated-time');
        if (lastUpdatedEl && timestamp) {
            const date = new Date(timestamp);
            const options = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
            };
            lastUpdatedEl.textContent = date.toLocaleDateString('en-US', options);
        }
    }

    updateStockCount() {
        const stockCountEl = document.getElementById('stock-count');
        if (stockCountEl) {
            stockCountEl.textContent = this.filteredStocks.length;
        }
    }

    showLoadingState() {
        document.getElementById('loading-state').style.display = 'flex';
        document.getElementById('error-state').style.display = 'none';
        document.getElementById('filters').style.display = 'none';
        document.getElementById('stock-grid').style.display = 'none';
    }

    showErrorState() {
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('error-state').style.display = 'flex';
        document.getElementById('filters').style.display = 'none';
        document.getElementById('stock-grid').style.display = 'none';
    }

    showStockGrid() {
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('error-state').style.display = 'none';
        document.getElementById('filters').style.display = 'flex';
        document.getElementById('stock-grid').style.display = 'grid';
    }

    showCacheNotice() {
        console.info('Displaying cached stock data');
        // Could add a visual indicator that data is from cache
    }

    showSampleDataNotice() {
        console.info('Displaying sample stock data for demonstration');
        // Could add a visual indicator that this is sample data
    }
}

// Utility functions
const MARKET_CAP_THRESHOLD = 200_000_000_000; // $200B

const US_EXCHANGES = ['NYSE', 'NASDAQ', 'AMEX', 'BATS'];
const EU_EXCHANGES = ['LSE', 'FRA', 'AMS', 'SWX', 'BIT', 'BME'];

function classifyMarket(exchange) {
    if (US_EXCHANGES.includes(exchange)) return 'US';
    if (EU_EXCHANGES.includes(exchange)) return 'EU';
    return 'OTHER';
}

function validateStockData(stock) {
    return (
        stock &&
        typeof stock.ticker === 'string' &&
        typeof stock.companyName === 'string' &&
        typeof stock.marketCap === 'number' &&
        stock.marketCap >= MARKET_CAP_THRESHOLD &&
        ['US', 'EU'].includes(stock.market)
    );
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StockScreener();
});

// Service Worker registration for offline capability (if available)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}