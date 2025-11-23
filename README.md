# Amazing-Frog Water Station Dashboard

A modern Angular 20 application for visualizing USGS water monitoring station data, featuring real-time streamflow and gage height charts.

🌐 **Live Demo:** [www.puddledude.com](https://www.puddledude.com)

## Features

- 📊 Interactive time series charts for streamflow and gage height data
- 🗺️ Cascading location selection (State → County → Monitoring Location)
- 🔄 Real-time data from USGS Water Data Services API
- 📱 Responsive design for desktop and mobile
- 🎨 Material Design UI with Angular Material

## Technology Stack

- **Angular 20.3** - Modern standalone components
- **TypeScript 5.9** - Type-safe development
- **RxJS 7.8** - Reactive data streams
- **Chart.js 4.4** - Interactive time series visualizations
- **Angular Material** - UI components and theming

## Development

### Prerequisites

- Node.js 18+ and npm
- Angular CLI 20.3+

### Setup

```bash
# Install dependencies
npm install

# Add Angular Material (if not already added)
ng add @angular/material

# Start development server
npm start
```

Navigate to `http://localhost:4200/`

### Build

```bash
# Development build
npm run build

# Production build for GitHub Pages
npm run build:github
```

## Deployment to GitHub Pages with Custom Domain

### 1. Build for Production

```bash
npm run build:github
```

This creates the `docs/` folder with your built application.

### 2. Configure Custom Domain

The `public/CNAME` file contains your custom domain:
```
www.puddledude.com
```

This file is automatically copied to `docs/CNAME` during the build.

### 3. Push to GitHub

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### 4. Enable GitHub Pages

1. Go to your repository settings on GitHub
2. Navigate to **Pages** section
3. Under **Source**, select:
   - Branch: `main`
   - Folder: `/docs`
4. Click **Save**

### 5. Configure DNS at Namecheap

1. Log in to your Namecheap account
2. Go to **Domain List** → Select `puddledude.com`
3. Click **Manage** → **Advanced DNS**
4. Add these records:

| Type  | Host | Value                    | TTL       |
|-------|------|--------------------------|-----------|
| CNAME | www  | YOUR-USERNAME.github.io  | Automatic |
| A     | @    | 185.199.108.153          | Automatic |
| A     | @    | 185.199.109.153          | Automatic |
| A     | @    | 185.199.110.153          | Automatic |
| A     | @    | 185.199.111.153          | Automatic |

Replace `YOUR-USERNAME` with your actual GitHub username.

### 6. Verify Custom Domain in GitHub

1. Back in GitHub repository settings → **Pages**
2. Under **Custom domain**, enter: `www.puddledude.com`
3. Click **Save**
4. Wait for DNS check to complete (may take a few minutes)
5. Enable **Enforce HTTPS** once DNS is verified

### 7. Wait for DNS Propagation

DNS changes can take 5-48 hours to propagate globally. You can check status at:
- https://www.whatsmydns.net/

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── dashboard/         # Main dashboard component
│   │   ├── chart/             # Reusable chart component
│   │   └── site-card/         # Station info card
│   ├── services/
│   │   ├── usgs-api.service.ts      # USGS API integration
│   │   └── error-handler.service.ts # Centralized error handling
│   ├── models/
│   │   ├── api.models.ts            # API response types
│   │   └── domain.models.ts         # Domain models
│   ├── app.ts                 # Root component
│   ├── app.config.ts          # App configuration
│   └── app.routes.ts          # Routing
├── index.html
├── main.ts
└── styles.scss
```

## API Documentation

This application uses the [USGS Water Data Services API](https://api.waterdata.usgs.gov/ogcapi/v0/openapi):

- **States**: Lists all US states
- **Counties**: Lists counties within a state
- **Monitoring Locations**: Stream monitoring stations
- **Time Series Data**: Daily mean values for:
  - Streamflow (parameter code 00060)
  - Gage Height (parameter code 00065)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Contributing

Pull requests are welcome! Please ensure:
1. Code follows Angular style guide
2. All tests pass
3. New features include tests
4. Commit messages are descriptive

## Troubleshooting

### Custom Domain Not Working

1. Verify DNS records at Namecheap are correct
2. Check DNS propagation: https://www.whatsmydns.net/
3. Ensure CNAME file exists in `docs/` folder
4. Verify GitHub Pages settings show custom domain

### Charts Not Rendering

1. Check browser console for errors
2. Verify Chart.js and chartjs-adapter-date-fns are installed
3. Ensure monitoring location has data for the selected time period

### API Errors

1. Check network tab for failed requests
2. Verify USGS API is accessible: https://api.waterdata.usgs.gov/ogcapi/v0
3. Check if monitoring location has data available

## Contact

For questions or support, please open an issue on GitHub.
