#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// Configuration
const MARKET_CAP_THRESHOLD = 200_000_000_000; // $200B
const US_EXCHANGES = ['NYSE', 'NASDAQ', 'AMEX', 'BATS'];
const EU_EXCHANGES = ['LSE', 'FRA', 'AMS', 'SWX', 'BIT', 'BME', 'CPH', 'EPA'];

// API Configuration
const POLYGON_BASE_URL = 'https://api.polygon.io';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

class StockDataFetcher {
    constructor() {
        this.polygonApiKey = process.env.IEX_API_KEY; // Using IEX_API_KEY secret name for Polygon.io key
        this.finnhubApiKey = process.env.FINNHUB_API_KEY;
        
        if (!this.polygonApiKey) {
            console.warn('POLYGON_API_KEY not found, using sample data');
        }
        
        if (!this.finnhubApiKey) {
            console.warn('FINNHUB_API_KEY not found, limited European data');
        }
    }

    async fetchStockData() {
        console.log('Starting stock data fetch...');
        
        try {
            let stocks = [];
            
            if (this.polygonApiKey) {
                // Fetch US stocks from Polygon.io
                const usStocks = await this.fetchUSStocks();
                stocks = stocks.concat(usStocks);
                console.log(`Fetched ${usStocks.length} US stocks`);
            }
            
            if (this.finnhubApiKey) {
                // Fetch European stocks from Finnhub
                const euStocks = await this.fetchEuropeanStocks();
                stocks = stocks.concat(euStocks);
                console.log(`Fetched ${euStocks.length} European stocks`);
            }
            
            if (stocks.length === 0) {
                console.log('No API keys available, using enhanced sample data');
                stocks = this.getSampleData();
            }
            
            // Filter by market cap threshold
            const filteredStocks = stocks.filter(stock => 
                stock.marketCap >= MARKET_CAP_THRESHOLD
            );
            
            // Sort by market cap (descending)
            filteredStocks.sort((a, b) => b.marketCap - a.marketCap);
            
            console.log(`Filtered to ${filteredStocks.length} stocks with market cap > $200B`);
            
            // Save to file
            await this.saveStockData(filteredStocks);
            
            console.log('Stock data fetch completed successfully');
            
        } catch (error) {
            console.error('Error fetching stock data:', error);
            
            // Fallback to sample data
            console.log('Using sample data as fallback');
            const sampleStocks = this.getSampleData();
            await this.saveStockData(sampleStocks);
        }
    }

    async fetchUSStocks() {
        const stocks = [];
        
        try {
            // Get list of major US stocks (S&P 500 components or similar)
            const majorTickers = [
                'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'BRK.A', 'BRK.B',
                'TSLA', 'META', 'UNH', 'JNJ', 'V', 'WMT', 'XOM', 'JPM', 'PG', 'MA',
                'CVX', 'HD', 'ABBV', 'PFE', 'KO', 'AVGO', 'PEP', 'TMO', 'COST',
                'MRK', 'BAC', 'NFLX', 'CRM', 'ACN', 'LLY', 'ADBE', 'CSCO', 'NKE',
                'DHR', 'TXN', 'VZ', 'QCOM', 'ABT', 'ORCL', 'WFC', 'AMD', 'INTC'
            ];
            
            // Fetch data in batches to respect rate limits (Polygon.io: 5 calls per minute for free tier)
            const batchSize = 5;
            for (let i = 0; i < majorTickers.length; i += batchSize) {
                const batch = majorTickers.slice(i, i + batchSize);
                const batchPromises = batch.map(ticker => this.fetchPolygonStock(ticker));
                
                const batchResults = await Promise.allSettled(batchPromises);
                
                batchResults.forEach((result, index) => {
                    if (result.status === 'fulfilled' && result.value) {
                        stocks.push(result.value);
                    } else {
                        console.warn(`Failed to fetch ${batch[index]}:`, result.reason);
                    }
                });
                
                // Rate limiting delay for Polygon.io free tier (5 calls per minute)
                if (i + batchSize < majorTickers.length) {
                    await this.delay(12000); // 12 second delay between batches
                }
            }
            
        } catch (error) {
            console.error('Error fetching US stocks:', error);
        }
        
        return stocks;
    }

    async fetchPolygonStock(ticker) {
        try {
            // Get ticker details for company info and market cap
            const detailsUrl = `${POLYGON_BASE_URL}/v3/reference/tickers/${ticker}?apikey=${this.polygonApiKey}`;
            
            const detailsResponse = await fetch(detailsUrl);
            
            if (!detailsResponse.ok) {
                throw new Error(`HTTP error for ${ticker}: ${detailsResponse.status}`);
            }
            
            const detailsData = await detailsResponse.json();
            
            if (!detailsData.results) {
                throw new Error(`No data found for ${ticker}`);
            }
            
            const tickerInfo = detailsData.results;
            
            // Calculate market cap from shares outstanding and current price
            // Note: Polygon.io doesn't directly provide market cap, so we'll use a fallback approach
            const marketCap = tickerInfo.market_cap || (tickerInfo.share_class_shares_outstanding * (tickerInfo.last_quote?.close || 100));
            
            if (!marketCap || marketCap < MARKET_CAP_THRESHOLD) {
                return null;
            }
            
            return {
                ticker: ticker,
                companyName: tickerInfo.name,
                marketCap: marketCap,
                market: 'US',
                exchange: this.mapPolygonExchange(tickerInfo.primary_exchange),
                domain: this.extractDomain(tickerInfo.homepage_url),
                sector: tickerInfo.sic_description || 'Unknown'
            };
            
        } catch (error) {
            console.warn(`Error fetching ${ticker}:`, error.message);
            return null;
        }
    }

    mapPolygonExchange(exchange) {
        const exchangeMap = {
            'XNYS': 'NYSE',
            'XNAS': 'NASDAQ',
            'ARCX': 'NYSE Arca',
            'BATS': 'BATS',
            'IEXG': 'IEX'
        };
        return exchangeMap[exchange] || exchange || 'NASDAQ';
    }

    async fetchEuropeanStocks() {
        const stocks = [];
        
        try {
            // Major European stocks
            const europeanTickers = [
                { symbol: 'ASML.AS', name: 'ASML Holding N.V.', domain: 'asml.com' },
                { symbol: 'NESN.SW', name: 'Nestlé S.A.', domain: 'nestle.com' },
                { symbol: 'NOVO-B.CO', name: 'Novo Nordisk A/S', domain: 'novonordisk.com' },
                { symbol: 'MC.PA', name: 'LVMH Moët Hennessy Louis Vuitton SE', domain: 'lvmh.com' },
                { symbol: 'RMS.PA', name: 'Hermès International S.A.', domain: 'hermes.com' },
                { symbol: 'SAP.DE', name: 'SAP SE', domain: 'sap.com' },
                { symbol: 'OR.PA', name: "L'Oréal S.A.", domain: 'loreal.com' },
                { symbol: 'TTE.PA', name: 'TotalEnergies SE', domain: 'totalenergies.com' }
            ];
            
            for (const stock of europeanTickers) {
                try {
                    const stockData = await this.fetchFinnhubStock(stock);
                    if (stockData) {
                        stocks.push(stockData);
                    }
                    
                    // Rate limiting delay
                    await this.delay(1100); // Finnhub allows 60 calls per minute
                    
                } catch (error) {
                    console.warn(`Error fetching ${stock.symbol}:`, error.message);
                }
            }
            
        } catch (error) {
            console.error('Error fetching European stocks:', error);
        }
        
        return stocks;
    }

    async fetchFinnhubStock(stockInfo) {
        try {
            const quoteUrl = `${FINNHUB_BASE_URL}/quote?symbol=${stockInfo.symbol}&token=${this.finnhubApiKey}`;
            const profileUrl = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${stockInfo.symbol}&token=${this.finnhubApiKey}`;
            
            const [quoteResponse, profileResponse] = await Promise.all([
                fetch(quoteUrl),
                fetch(profileUrl)
            ]);
            
            if (!quoteResponse.ok || !profileResponse.ok) {
                throw new Error(`HTTP error for ${stockInfo.symbol}`);
            }
            
            const quoteData = await quoteResponse.json();
            const profileData = await profileResponse.json();
            
            const marketCap = profileData.marketCapitalization * 1000000; // Finnhub returns in millions
            
            if (!marketCap || marketCap < MARKET_CAP_THRESHOLD) {
                return null;
            }
            
            return {
                ticker: stockInfo.symbol,
                companyName: stockInfo.name,
                marketCap: marketCap,
                market: 'EU',
                exchange: this.getExchangeFromSymbol(stockInfo.symbol),
                domain: stockInfo.domain,
                sector: profileData.finnhubIndustry || 'Unknown'
            };
            
        } catch (error) {
            console.warn(`Error fetching ${stockInfo.symbol}:`, error.message);
            return null;
        }
    }

    getExchangeFromSymbol(symbol) {
        if (symbol.includes('.AS')) return 'AMS';
        if (symbol.includes('.SW')) return 'SWX';
        if (symbol.includes('.CO')) return 'CPH';
        if (symbol.includes('.PA')) return 'EPA';
        if (symbol.includes('.DE')) return 'FRA';
        return 'EU';
    }

    extractDomain(website) {
        if (!website) return '';
        try {
            const url = new URL(website.startsWith('http') ? website : `https://${website}`);
            return url.hostname.replace('www.', '');
        } catch {
            return '';
        }
    }

    getSampleData() {
        return [
            {
                ticker: 'AAPL',
                companyName: 'Apple Inc.',
                marketCap: 3000000000000,
                market: 'US',
                exchange: 'NASDAQ',
                domain: 'apple.com',
                sector: 'Technology'
            },
            {
                ticker: 'MSFT',
                companyName: 'Microsoft Corporation',
                marketCap: 2800000000000,
                market: 'US',
                exchange: 'NASDAQ',
                domain: 'microsoft.com',
                sector: 'Technology'
            },
            {
                ticker: 'GOOGL',
                companyName: 'Alphabet Inc.',
                marketCap: 1700000000000,
                market: 'US',
                exchange: 'NASDAQ',
                domain: 'google.com',
                sector: 'Technology'
            },
            {
                ticker: 'AMZN',
                companyName: 'Amazon.com Inc.',
                marketCap: 1500000000000,
                market: 'US',
                exchange: 'NASDAQ',
                domain: 'amazon.com',
                sector: 'Consumer Discretionary'
            },
            {
                ticker: 'NVDA',
                companyName: 'NVIDIA Corporation',
                marketCap: 1800000000000,
                market: 'US',
                exchange: 'NASDAQ',
                domain: 'nvidia.com',
                sector: 'Technology'
            },
            {
                ticker: 'BRK.A',
                companyName: 'Berkshire Hathaway Inc.',
                marketCap: 900000000000,
                market: 'US',
                exchange: 'NYSE',
                domain: 'berkshirehathaway.com',
                sector: 'Financial Services'
            },
            {
                ticker: 'TSLA',
                companyName: 'Tesla Inc.',
                marketCap: 800000000000,
                market: 'US',
                exchange: 'NASDAQ',
                domain: 'tesla.com',
                sector: 'Consumer Discretionary'
            },
            {
                ticker: 'META',
                companyName: 'Meta Platforms Inc.',
                marketCap: 750000000000,
                market: 'US',
                exchange: 'NASDAQ',
                domain: 'meta.com',
                sector: 'Technology'
            },
            {
                ticker: 'UNH',
                companyName: 'UnitedHealth Group Incorporated',
                marketCap: 500000000000,
                market: 'US',
                exchange: 'NYSE',
                domain: 'unitedhealthgroup.com',
                sector: 'Healthcare'
            },
            {
                ticker: 'JNJ',
                companyName: 'Johnson & Johnson',
                marketCap: 450000000000,
                market: 'US',
                exchange: 'NYSE',
                domain: 'jnj.com',
                sector: 'Healthcare'
            },
            {
                ticker: 'V',
                companyName: 'Visa Inc.',
                marketCap: 520000000000,
                market: 'US',
                exchange: 'NYSE',
                domain: 'visa.com',
                sector: 'Financial Services'
            },
            {
                ticker: 'ASML',
                companyName: 'ASML Holding N.V.',
                marketCap: 300000000000,
                market: 'EU',
                exchange: 'AMS',
                domain: 'asml.com',
                sector: 'Technology'
            },
            {
                ticker: 'NESN.SW',
                companyName: 'Nestlé S.A.',
                marketCap: 350000000000,
                market: 'EU',
                exchange: 'SWX',
                domain: 'nestle.com',
                sector: 'Consumer Staples'
            },
            {
                ticker: 'NOVO-B.CO',
                companyName: 'Novo Nordisk A/S',
                marketCap: 280000000000,
                market: 'EU',
                exchange: 'CPH',
                domain: 'novonordisk.com',
                sector: 'Healthcare'
            },
            {
                ticker: 'LVMH.PA',
                companyName: 'LVMH Moët Hennessy Louis Vuitton SE',
                marketCap: 400000000000,
                market: 'EU',
                exchange: 'EPA',
                domain: 'lvmh.com',
                sector: 'Consumer Discretionary'
            }
        ];
    }

    async saveStockData(stocks) {
        const data = {
            lastUpdated: new Date().toISOString(),
            dataSource: this.polygonApiKey ? 'Polygon.io API' : 'Sample Data',
            totalStocks: stocks.length,
            stocks: stocks
        };
        
        const dataDir = path.join(__dirname, '..', 'data');
        const filePath = path.join(dataDir, 'stocks.json');
        
        try {
            await fs.mkdir(dataDir, { recursive: true });
            await fs.writeFile(filePath, JSON.stringify(data, null, 2));
            console.log(`Saved ${stocks.length} stocks to ${filePath}`);
        } catch (error) {
            console.error('Error saving stock data:', error);
            throw error;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Run the script
if (require.main === module) {
    const fetcher = new StockDataFetcher();
    fetcher.fetchStockData().catch(error => {
        console.error('Script failed:', error);
        process.exit(1);
    });
}

module.exports = StockDataFetcher;