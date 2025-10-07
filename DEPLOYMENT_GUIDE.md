# 🚀 TENG ML Platform - Deployment Guide

## Quick Deployment to GitHub Pages (5 minutes)

### Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon → **"New repository"**
3. Repository name: `teng-ml-platform` (or your choice)
4. Description: "TENG Machine Learning Platform for Performance Prediction"
5. Set to **Public** (required for free GitHub Pages)
6. Click **"Create repository"**

### Step 2: Upload Files

**Option A: Web Interface (Easiest)**

1. Click **"uploading an existing file"** link
2. Drag and drop ALL these files:
   - `index.html`
   - `style.css`
   - `script.js`
   - `teng_database.xlsx`
   - `teng_database.json`
   - `README.md`
   - `DEPLOYMENT_GUIDE.md`
3. Commit message: "Initial commit - TENG ML Platform"
4. Click **"Commit changes"**

**Option B: Git Command Line**

```bash
# Navigate to the folder with your files
cd /path/to/teng_ml_deploy

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - TENG ML Platform"

# Add remote (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/teng-ml-platform.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to repository **Settings** (gear icon)
2. Scroll down to **"Pages"** in the left sidebar
3. Under **"Source"**:
   - Branch: `main` (or `master`)
   - Folder: `/ (root)`
4. Click **"Save"**
5. Wait 1-2 minutes for deployment

### Step 4: Access Your Website

Your site will be available at:
```
https://YOUR_USERNAME.github.io/teng-ml-platform/
```

Example:
```
https://burhanbeycan.github.io/teng-ml-platform/
```

---

## Updating the Database

### Method 1: GitHub Web Interface

1. Go to your repository
2. Click on `teng_database.xlsx`
3. Click the pencil icon (Edit)
4. Upload new version
5. Commit changes
6. **Important**: Also update `teng_database.json` for faster loading

### Method 2: Local Edit + Push

1. Clone repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/teng-ml-platform.git
   cd teng-ml-platform
   ```

2. Edit `teng_database.xlsx` in Excel

3. Regenerate JSON (optional but recommended):
   ```python
   python3 << 'EOF'
   import openpyxl
   import json
   
   wb = openpyxl.load_workbook('teng_database.xlsx')
   ws = wb.active
   headers = [cell.value for cell in ws[1]]
   materials = []
   
   for row in ws.iter_rows(min_row=2, values_only=True):
       material = {}
       for i, header in enumerate(headers):
           value = row[i] if i < len(row) else None
           if value is None:
               value = 0 if header in ['Loading', 'Thickness', 'Voc', 'Isc', 'Power'] else ''
           material[header] = value
       materials.append(material)
   
   with open('teng_database.json', 'w') as f:
       json.dump(materials, f, indent=2)
   
   print(f"Generated JSON with {len(materials)} materials")
   EOF
   ```

4. Commit and push:
   ```bash
   git add teng_database.xlsx teng_database.json
   git commit -m "Update database with new materials"
   git push
   ```

5. Website updates automatically in 1-2 minutes!

---

## Testing Locally Before Deployment

### Python Server
```bash
cd teng_ml_deploy
python3 -m http.server 8000
# Open: http://localhost:8000
```

### Node.js Server
```bash
cd teng_ml_deploy
npx http-server -p 8000
# Open: http://localhost:8000
```

### PHP Server
```bash
cd teng_ml_deploy
php -S localhost:8000
# Open: http://localhost:8000
```

---

## Troubleshooting

### ❌ GitHub Pages shows 404 Error

**Solution**:
1. Check Settings → Pages → ensure branch is `main` and folder is `/ (root)`
2. Verify `index.html` is in the root directory (not in a subfolder)
3. Wait 2-5 minutes after enabling Pages
4. Try accessing with `/index.html` at the end of URL

### ❌ Database not loading

**Solution**:
1. Check browser console (F12) for errors
2. Verify `teng_database.json` is uploaded
3. Ensure JSON is valid (use [JSONLint](https://jsonlint.com/))
4. Clear browser cache (Ctrl+Shift+Delete)
5. Hard refresh page (Ctrl+Shift+R)

### ❌ ML models not training

**Solution**:
1. Check console for "✅ Models trained!" message
2. Ensure database has at least 10 materials with complete data
3. Verify SheetJS library loads (check Network tab in DevTools)
4. Try loading JSON instead of Excel (faster and more reliable)

### ❌ Predictions showing "---"

**Solution**:
1. Wait for models to finish training (check console)
2. Click "Predict Performance" button
3. Ensure input values are reasonable
4. Check console for JavaScript errors

### ❌ Changes not appearing after push

**Solution**:
1. Wait 2-5 minutes for GitHub Pages to rebuild
2. Check Actions tab for build status
3. Clear browser cache
4. Try incognito/private browsing mode
5. Check commit history to verify files were updated

---

## Performance Optimization

### 1. Use JSON Instead of Excel
- JSON loads 10x faster than Excel parsing
- Always regenerate JSON after Excel updates
- Browser caches JSON for repeat visits

### 2. Enable Compression
Add `.htaccess` file (if using Apache):
```apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
</IfModule>
```

### 3. Add Service Worker (Advanced)
Create `sw.js` for offline caching:
```javascript
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('teng-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/style.css',
        '/script.js',
        '/teng_database.json'
      ]);
    })
  );
});
```

---

## Custom Domain (Optional)

### Step 1: Buy Domain
- Namecheap, GoDaddy, Google Domains, etc.
- Example: `teng-ml.com`

### Step 2: Configure DNS
Add these DNS records:
```
Type: A
Host: @
Value: 185.199.108.153

Type: A
Host: @
Value: 185.199.109.153

Type: A
Host: @
Value: 185.199.110.153

Type: A
Host: @
Value: 185.199.111.153

Type: CNAME
Host: www
Value: YOUR_USERNAME.github.io
```

### Step 3: Configure GitHub Pages
1. Go to Settings → Pages
2. Custom domain: `teng-ml.com`
3. Save
4. Wait for DNS propagation (up to 24 hours)
5. Enable "Enforce HTTPS"

---

## Security Best Practices

### 1. Enable HTTPS
- Automatically enabled on GitHub Pages
- Protects data in transit
- Required for modern web features

### 2. Content Security Policy
Add to `index.html` `<head>`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.sheetjs.com; style-src 'self' 'unsafe-inline';">
```

### 3. Validate User Input
Already implemented in `script.js`:
- Input sanitization
- Range validation
- Type checking

---

## Monitoring & Analytics

### Add Google Analytics
Add to `index.html` before `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Track Usage
Monitor:
- Page views
- Prediction counts
- Popular materials
- User demographics
- Device types

---

## Backup & Version Control

### Regular Backups
```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/teng-ml-platform.git

# Create backup
tar -czf teng-backup-$(date +%Y%m%d).tar.gz teng-ml-platform/

# Store safely (external drive, cloud storage)
```

### Version Tags
```bash
# Tag important versions
git tag -a v1.0 -m "Initial release with 202 materials"
git push origin v1.0

# List tags
git tag -l

# Checkout specific version
git checkout v1.0
```

---

## Collaboration

### Multiple Contributors

1. **Add collaborators**:
   - Settings → Collaborators → Add people

2. **Branch workflow**:
   ```bash
   # Create feature branch
   git checkout -b add-new-materials
   
   # Make changes
   # ...
   
   # Commit and push
   git add .
   git commit -m "Add 50 new PTFE materials"
   git push origin add-new-materials
   ```

3. **Create Pull Request**:
   - Go to repository on GitHub
   - Click "Pull requests" → "New pull request"
   - Select your branch
   - Add description
   - Request review
   - Merge after approval

---

## Support & Resources

### Documentation
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Git Tutorial](https://git-scm.com/doc)
- [Markdown Guide](https://www.markdownguide.org/)

### Community
- Create GitHub Issues for bugs
- Discussions for questions
- Pull Requests for contributions

### Contact
- **Email**: burhan.beycan@metu.edu.tr
- **Institution**: METU Materials Engineering
- **GitHub**: [Repository Issues]

---

## Checklist

Before going live, verify:

- [ ] All files uploaded to GitHub
- [ ] GitHub Pages enabled
- [ ] Website loads correctly
- [ ] Database displays all 202 materials
- [ ] Pagination works (21 pages)
- [ ] ML predictions work
- [ ] All 4 tabs functional
- [ ] Mobile responsive
- [ ] Console shows no errors
- [ ] README.md is complete
- [ ] License file added (if needed)
- [ ] Contact information updated

---

## Next Steps

1. ✅ Deploy to GitHub Pages
2. 📢 Share with research group
3. 📝 Publish paper with platform link
4. 🔄 Regular database updates
5. 📊 Monitor usage and feedback
6. 🚀 Add new features based on user needs

---

**Deployment Time**: ~5 minutes  
**Maintenance**: ~10 minutes/month  
**Cost**: FREE (GitHub Pages)

Good luck with your deployment! 🎉
