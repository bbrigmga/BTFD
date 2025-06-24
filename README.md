# Stock Screener - Large Cap Stocks ($200B+)

A free, responsive stock screening website that displays US and European stocks with market capitalization over $200 billion. Features a modern card-based layout with company logos, real-time data updates, and mobile-responsive design. Uses a hybrid approach with the top 100 S&P 500 companies for comprehensive US coverage while maintaining curated European stock selection.

## 🚀 Live Demo

Visit the live website: [Your GitHub Pages URL]

## ✨ Features

- **Large Cap Focus**: Only displays stocks with market cap > $200 billion
- **Hybrid Coverage**: Top 100 S&P 500 companies (US) + curated European selection
- **Real-time Data**: Daily updates at market close via GitHub Actions
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Company Logos**: Automatic logo fetching with fallbacks
- **Fast Performance**: Static site with CDN delivery
- **Offline Support**: Cached data for offline viewing
- **Filtering & Sorting**: Filter by market, sort by various criteria

## 📊 Data Sources & Coverage

- **US Stocks**: [Polygon.io](https://polygon.io/) - Top 100 S&P 500 companies by market cap
- **European Stocks**: [Finnhub](https://finnhub.io/) - Curated selection of major EU companies
- **Company Logos**: [Clearbit Logo API](https://clearbit.com/logo) - Automatic logo fetching
- **Coverage Strategy**: Hybrid approach combining comprehensive US coverage with targeted European selection

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (Grid/Flexbox), Vanilla JavaScript
- **Architecture**: JAMstack (JavaScript, APIs, Markup)
- **Hosting**: GitHub Pages
- **Automation**: GitHub Actions
- **APIs**: Polygon.io, Finnhub, Clearbit Logo API

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/stock-screener.git
cd stock-screener
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Locally

```bash
# Option 1: Using npm script (requires Python)
npm run dev

# Option 2: Using npx serve
npx serve .

# Option 3: Using Python directly
python -m http.server 8000
```

Open your browser to `http://localhost:8000`

## 🔧 Setup for Production

### 1. Get API Keys

#### Polygon.io (Required for US stocks)
1. Sign up at [Polygon.io](https://polygon.io/)
2. Get your free API key (5 calls/minute, 50,000 calls/month)
3. Note your API key

#### Finnhub (Optional for European stocks)
1. Sign up at [Finnhub](https://finnhub.io/)
2. Get your free API key (60 calls/minute)

### 2. Configure GitHub Repository

#### Enable GitHub Pages
1. Go to your repository settings
2. Navigate to "Pages" section
3. Set source to "GitHub Actions"

#### Add API Keys as Secrets
1. Go to repository Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `POLYGON_API_KEY`: Your Polygon.io API key
   - `FINNHUB_API_KEY`: Your Finnhub API key (optional)

### 3. Update Configuration

Edit the following files with your information:

#### `package.json`
```json
{
  "repository": {
    "url": "git+https://github.com/YOURUSERNAME/YOURREPO.git"
  },
  "homepage": "https://YOURUSERNAME.github.io/YOURREPO/"
}
```

#### `README.md`
- Update the live demo URL
- Update repository URLs
- Add your name/organization

### 4. Deploy

Push your changes to the main branch:

```bash
git add .
git commit -m "Initial setup"
git push origin main
```

The GitHub Action will automatically:
1. Fetch the latest stock data
2. Update the `data/stocks.json` file
3. Deploy to GitHub Pages

## 📁 Project Structure

```
stock-screener/
├── index.html              # Main application entry point
├── styles.css              # All styles and responsive design
├── script.js               # Frontend application logic
├── data/
│   └── stocks.json         # Stock data (auto-updated)
├── scripts/
│   └── fetch-data.js       # Data fetching script
├── .github/
│   └── workflows/
│       └── update-data.yml # Automated deployment
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## 🔄 Data Updates

The stock data is automatically updated:

- **Schedule**: Daily at 5:00 PM ET (after US market close)
- **Trigger**: GitHub Actions workflow
- **Process**: 
  1. Fetch data from APIs
  2. Filter stocks with market cap > $200B
  3. Sort by market cap (descending)
  4. Update `data/stocks.json`
  5. Deploy to GitHub Pages

### Manual Update

To manually trigger a data update:

```bash
# Run locally
npm run fetch-data

# Or trigger GitHub Action
# Go to Actions tab → Update Stock Data → Run workflow
```

## 🎨 Customization

### Adding New Stocks

Edit `scripts/fetch-data.js` and add tickers to the appropriate arrays:

```javascript
// For US stocks (add to majorTickers array - Top 100 S&P 500)
const majorTickers = [
    'AAPL', 'MSFT', 'GOOGL', 'YOUR_TICKER'
    // ... Top 100 S&P 500 companies by market cap already included
];

// For European stocks (add to europeanTickers array)
const europeanTickers = [
    { symbol: 'YOUR_SYMBOL.EX', name: 'Company Name', domain: 'company.com' }
    // ... 18+ carefully selected European stocks already included
];
```

**Current Stock Coverage:**
- **US Stocks**: Top 100 S&P 500 companies by market capitalization, ensuring comprehensive coverage of all mega-cap (>$1T) and large-cap stocks
- **European Stocks**: 18+ carefully selected major European companies from Netherlands, Switzerland, Denmark, France, Germany, and UK
- **Total Expected**: 60-70+ stocks with market cap > $200B (depending on current market conditions)
- **Coverage Strategy**: Hybrid approach maximizes US market coverage while maintaining quality European representation

### Styling Changes

All styles are in `styles.css`:
- Modify CSS custom properties for colors
- Adjust grid layout in `.stock-grid`
- Update card styles in `.stock-card`

### Functionality Changes

Main application logic is in `script.js`:
- Modify filtering logic in `applyFilters()`
- Update card rendering in `createStockCard()`
- Add new features in the `StockScreener` class

## 📱 Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Privacy & Security

- No user data collection
- No cookies or tracking
- All data fetched from public APIs
- Client-side processing only
- HTTPS enforced via GitHub Pages

## 📈 Performance

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)

## 🐛 Troubleshooting

### Common Issues

#### Data Not Loading
1. Check if `data/stocks.json` exists
2. Verify API keys are set correctly
3. Check browser console for errors
4. Try manual data fetch: `npm run fetch-data`

#### GitHub Actions Failing
1. Verify API keys are added as repository secrets
2. Check Actions tab for error details
3. Ensure repository has Pages enabled
4. Verify workflow file syntax

#### Logos Not Displaying
1. Check browser console for CORS errors
2. Verify domain names in stock data
3. Clearbit Logo API may be rate-limited

### Getting Help

1. Check the [Issues](https://github.com/yourusername/stock-screener/issues) page
2. Review GitHub Actions logs
3. Test locally with `npm run dev`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ⚠️ Disclaimer

This website is for informational purposes only and does not constitute investment advice. Stock prices and market capitalizations are subject to change. Always consult with a qualified financial advisor before making investment decisions.

## 🙏 Acknowledgments

- [Polygon.io](https://polygon.io/) for US market data
- [Finnhub](https://finnhub.io/) for European market data
- [Clearbit](https://clearbit.com/logo) for company logos
- [GitHub Pages](https://pages.github.com/) for free hosting

---

**Built with ❤️ using modern web technologies**