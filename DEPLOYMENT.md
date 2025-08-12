# P-Town POS Deployment Guide

This guide covers deploying the P-Town POS system to production environments.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git for version control

### Build for Production
```bash
# Install dependencies
npm install

# Build optimized production version
npm run build

# Test the build locally
npm run serve
```

## 📦 Build Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Standard production build |
| `npm run build:prod` | Production build without source maps |
| `npm run build:analyze` | Build and serve for analysis |
| `npm run serve` | Serve built files locally |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Check code quality |
| `npm run format` | Format code with Prettier |

## 🌐 Deployment Options

### Option 1: Netlify Deployment

#### Automatic Deployment (Recommended)
1. Connect your GitHub repository to Netlify
2. Set build settings:
   - **Build command**: `npm run build:prod`
   - **Publish directory**: `build`
   - **Node version**: `18`

#### Manual Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
npm run deploy:netlify
```

#### Environment Variables (Netlify)
Set these in your Netlify dashboard:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
GENERATE_SOURCEMAP=false
REACT_APP_ENV=production
```

### Option 2: Firebase Hosting

#### Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize (if not already done)
firebase init hosting

# Deploy
npm run deploy:firebase
```

#### Configuration
The `firebase.json` is already configured with:
- Optimized caching headers
- SPA routing support
- Asset compression

### Option 3: Custom Server

#### Using the deployment script
```bash
# Make script executable (Linux/Mac)
chmod +x deploy.sh

# Run deployment script
./deploy.sh
```

## 🔧 Configuration Files

### Environment Variables
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
# Edit .env with your actual values
```

### Build Optimization
The build process includes:
- ✅ Code minification and compression
- ✅ CSS optimization and bundling
- ✅ Asset optimization
- ✅ Source map generation (disabled in production)
- ✅ Bundle analysis capabilities

### Security Headers
Both Netlify and Firebase configurations include:
- Content Security Policy
- XSS Protection
- Frame Options
- Content Type Options
- Referrer Policy

## 📊 Performance Optimizations

### Implemented Optimizations
- **Code Splitting**: Automatic with React lazy loading
- **Asset Caching**: Long-term caching for static assets
- **Compression**: Gzip compression enabled
- **Bundle Size**: Optimized to ~65KB total (gzipped)
- **CSS Optimization**: Minified and bundled
- **Image Optimization**: Automatic compression

### Monitoring
- Bundle size analysis with `npm run build:analyze`
- Performance monitoring via browser dev tools
- Lighthouse audits recommended

## 🔒 Security Considerations

### Implemented Security Features
- Environment variable protection
- Secure headers configuration
- Firebase security rules
- Input validation and sanitization
- XSS protection

### Best Practices
1. Never commit `.env` files
2. Use environment-specific configurations
3. Regularly update dependencies
4. Monitor for security vulnerabilities
5. Implement proper authentication

## 🐛 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Environment Variable Issues
- Ensure all `REACT_APP_` prefixed variables are set
- Check for typos in variable names
- Verify Firebase configuration

#### Deployment Issues
- Check build logs for errors
- Verify deployment settings match requirements
- Ensure all dependencies are installed

### Performance Issues
- Run `npm run build:analyze` to identify large bundles
- Check network tab for slow-loading assets
- Verify caching headers are working

## 📈 Monitoring & Analytics

### Built-in Analytics
- Firebase Analytics integration
- Performance monitoring
- Error tracking capabilities

### Recommended Tools
- Google Analytics
- Firebase Performance Monitoring
- Sentry for error tracking
- Lighthouse for performance audits

## 🔄 CI/CD Pipeline

### GitHub Actions (Recommended)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build:prod
      - run: npm run deploy:netlify
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

## 📞 Support

For deployment issues:
1. Check this documentation
2. Review build logs
3. Check environment configuration
4. Verify all dependencies are installed
5. Test locally before deploying

---

**Last Updated**: January 2025
**Version**: 1.0.0