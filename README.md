# Stock Screener - Large Cap Stocks ($200B+)

A free, responsive stock screening website that displays US and European stocks with market capitalization over $200 billion. Features a modern card-based layout with company logos, real-time data updates, and mobile-responsive design.

## 🚀 Live Demo

Visit the live website: [Your GitHub Pages URL]

## ✨ Features

- **Large Cap Focus**: Only displays stocks with market cap > $200 billion
- **Global Coverage**: US and European markets
- **Real-time Data**: Daily updates at market close via GitHub Actions
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Company Logos**: Automatic logo fetching with fallbacks
- **Fast Performance**: Static site with CDN delivery
- **Offline Support**: Cached data for offline viewing
- **Filtering & Sorting**: Filter by market, sort by various criteria

## 📊 Data Sources

- **Primary**: [IEX Cloud](https://iexcloud.io/) - US market data
- **Secondary**: [Finnhub](https://finnhub.io/) - European market data
- **Logos**: [Clearbit Logo API](https://clearbit.com/logo) - Company logos

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (Grid/Flexbox), Vanilla JavaScript
- **Architecture**: JAMstack (JavaScript, APIs, Markup)
- **Hosting**: GitHub Pages
- **Automation**: GitHub Actions
- **APIs**: IEX Cloud, Finnhub, Clearbit Logo API

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

#### IEX Cloud (Required for US stocks)
1. Sign up at [IEX Cloud](https://iexcloud.io/)
2. Get your free API token (50,000 calls/month)
3. Note your publishable token

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
   - `IEX_API_KEY`: Your IEX Cloud token
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
// For US stocks
const majorTickers = [
    'AAPL', 'MSFT', 'GOOGL', 'YOUR_TICKER'
];

// For European stocks
const europeanTickers = [
    { symbol: 'ASML.AS', name: 'ASML Holding N.V.', domain: 'asml.com' }
];
```

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

- [IEX Cloud](https://iexcloud.io/) for US market data
- [Finnhub](https://finnhub.io/) for European market data
- [Clearbit](https://clearbit.com/logo) for company logos
- [GitHub Pages](https://pages.github.com/) for free hosting

---

**Built with ❤️ using modern web technologies**