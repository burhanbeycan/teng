# 🔋 TENG Machine Learning Platform

**Predict Triboelectric Nanogenerator Performance Without Experiments**

A comprehensive web-based platform that uses machine learning to predict TENG performance based on material properties and device parameters. Built with pure JavaScript - no backend required!

---

## ✨ Features

### 📊 Comprehensive Database
- **202 materials** from academic literature and research
- **81 descriptors** per material
- Covers multiple polymer types (CA, PTFE, PVDF, PI, PDMS, etc.)
- Various nanofillers (MXene, Ag, CNT, Graphene, etc.)
- Pagination system (10 materials per page, 21 pages total)

### 🤖 Machine Learning Predictions
- Predicts **4 key performance metrics**:
  - Open Circuit Voltage (Voc)
  - Short Circuit Current (Isc)
  - Power Density
  - Energy Density
- Linear regression models with feature normalization
- Current R² scores:
  - Isc: 0.345 (34.5% variance explained)
  - Power: 0.302 (30.2% variance explained)
  - Voc: 0.187 (18.7% variance explained)
- Models automatically retrain when database is updated

### 🔄 Easy Database Updates
- Simply edit `teng_database.xlsx` in GitHub
- Push changes to repository
- ML models automatically retrain with new data
- No coding required!

### 📱 User-Friendly Interface
- 4 intuitive tabs:
  1. **Performance Predictor** - Interactive ML predictions
  2. **Material Database** - Browse all 202 materials with pagination
  3. **CAMX Research** - Information about the research group
  4. **About** - Platform overview and statistics
- Responsive design for desktop and mobile
- Real-time parameter adjustment with sliders
- One-click preset loading for CAMX data

---

## 🚀 Quick Start

### Option 1: GitHub Pages (Recommended)

1. **Fork or create a new repository** on GitHub

2. **Upload these files** to your repository:
   ```
   index.html
   style.css
   script.js
   teng_database.xlsx
   teng_database.json
   README.md
   ```

3. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: main (or master) / root
   - Click Save

4. **Access your site**:
   - URL: `https://username.github.io/repository-name/`
   - Wait 1-2 minutes for deployment

### Option 2: Local Testing

1. **Download all files** to a folder

2. **Start a local server**:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js
   npx http-server -p 8000
   ```

3. **Open in browser**:
   ```
   http://localhost:8000
   ```

---

## 📝 How to Update the Database

### Method 1: Edit Excel File (Easiest)

1. **Open `teng_database.xlsx`** in Excel or Google Sheets

2. **Add your materials** following this format:
   | ID | Name | Polymer | Filler | Loading | Thickness | Voc | Isc | Power | Ref | DateAdded |
   |---|---|---|---|---|---|---|---|---|---|---|
   | NEW_001 | My Material | CA | MXene | 5 | 100 | 250 | 15 | 2.5 | Your 2025 | 2025-10-07 |

3. **Save and upload** to GitHub

4. **Regenerate JSON** (optional, for faster loading):
   ```python
   import openpyxl
   import json
   
   wb = openpyxl.load_workbook('teng_database.xlsx')
   ws = wb.active
   headers = [cell.value for cell in ws[1]]
   materials = []
   
   for row in ws.iter_rows(min_row=2, values_only=True):
       material = {headers[i]: row[i] for i in range(len(headers))}
       materials.append(material)
   
   with open('teng_database.json', 'w') as f:
       json.dump(materials, f, indent=2)
   ```

5. **Commit and push** both files to GitHub

6. **ML models will automatically retrain** with the new data!

### Method 2: Edit JSON Directly

1. Open `teng_database.json`
2. Add new material objects following the existing format
3. Save and push to GitHub

---

## 🏗️ Technical Architecture

### Frontend Stack
- **HTML5** - Structure and semantic markup
- **CSS3** - Responsive styling with flexbox/grid
- **Vanilla JavaScript** - No frameworks, pure JS
- **SheetJS** - Excel file reading in browser

### Machine Learning
- **Custom Linear Regression** implementation
- **Feature normalization** (z-score standardization)
- **Gradient descent** optimization with adaptive learning rate
- **R² score** calculation for model evaluation
- Training on 164 materials with complete data

### Data Flow
```
Excel/JSON → Load Database → Train ML Models → Make Predictions
     ↓              ↓                ↓                ↓
  GitHub      Browser Cache    Model Weights    Display Results
```

### File Structure
```
teng-ml-platform/
├── index.html              # Main HTML structure (4 tabs)
├── style.css               # Responsive CSS styling
├── script.js               # ML logic + UI interactions
├── teng_database.xlsx      # Excel database (202 materials)
├── teng_database.json      # JSON database (faster loading)
└── README.md               # This file
```

---

## 📊 Database Schema

### Material Properties
- **ID**: Unique identifier (e.g., CAMX_001, XU_015)
- **Name**: Descriptive name
- **Polymer**: Base polymer type (CA, PTFE, PVDF, PI, PDMS, etc.)
- **Filler**: Nanofiller type (MXene, Ag, CNT, Graphene, None)
- **Loading**: Filler loading percentage (0-20%)
- **Thickness**: Film thickness in micrometers (20-200 μm)

### Performance Metrics
- **Voc**: Open circuit voltage (V)
- **Isc**: Short circuit current (μA)
- **Power**: Power density (W/m²)

### Metadata
- **Ref**: Literature reference
- **DateAdded**: Date added to database

---

## 🎯 Use Cases

### For Researchers
- **Predict performance** before experiments
- **Optimize material selection** based on ML predictions
- **Compare different compositions** quickly
- **Save time and resources** by avoiding unsuccessful experiments

### For Students
- **Learn about TENGs** interactively
- **Explore material-performance relationships**
- **Understand ML applications** in materials science

### For Industry
- **Rapid prototyping** of TENG designs
- **Material screening** for specific applications
- **Cost-effective R&D** with predictive modeling

---

## 📈 Model Performance

### Current Metrics (164 training samples)
- **Isc R²: 0.345** - Moderate predictive power
- **Power R²: 0.302** - Acceptable for screening
- **Voc R²: 0.187** - Improving with more data

### Expected Improvements
- **Target R² > 0.90** with 500+ materials
- **Better feature engineering** (surface area, crystallinity, etc.)
- **Advanced algorithms** (Random Forest, Neural Networks)

### Limitations
- Simple linear model with 4 features
- Limited to materials similar to training data
- Does not account for all physical factors

---

## 🔬 CAMX Research

This platform was developed by the **CAMX Research Group** at **METU Materials Engineering**, led by **Burhan Beycan** and **Prof. Emrah Unalan**.

### Research Focus
- Cellulose Acetate (CA) - MXene nanocomposites
- Triboelectric nanogenerators for energy harvesting
- Sustainable and eco-friendly TENG materials
- Machine learning for materials design

### Publications
- Beycan, B. et al. (2025) - CA-MXene TENGs (In preparation)
- Based on comprehensive literature review of 200+ papers

---

## 🛠️ Customization

### Change Colors
Edit `style.css`:
```css
:root {
    --primary-color: #6366f1;    /* Main theme color */
    --secondary-color: #8b5cf6;  /* Accent color */
    --background: #0f172a;       /* Dark background */
}
```

### Add New Polymer Types
Edit `script.js` - `encodePolymer()` function:
```javascript
function encodePolymer(polymer) {
    const polymers = {
        'PTFE': 10, 'PVDF': 9, 'PI': 8, 'CA': 7,
        'YOUR_POLYMER': 11  // Add here
    };
    return polymers[polymer] || 5;
}
```

### Modify Prediction Algorithm
Edit `script.js` - `LinearRegression` class:
- Adjust learning rate (default: 0.1)
- Change iterations (default: 2000)
- Add regularization
- Implement different algorithms

---

## 📄 License

This project is open source and available for academic and research purposes.

**Citation**:
```
Beycan, B., Unalan, E. (2025). TENG Machine Learning Platform. 
METU Materials Engineering. https://github.com/your-repo
```

---

## 🤝 Contributing

We welcome contributions!

### How to Contribute
1. **Add materials** from your research
2. **Improve ML models** with better algorithms
3. **Enhance UI/UX** with new features
4. **Report bugs** or suggest improvements
5. **Share your results** using the platform

### Contact
- **Email**: burhan.beycan@metu.edu.tr
- **Institution**: METU Materials Engineering
- **GitHub**: [Create issues for bugs/features]

---

## 🐛 Troubleshooting

### Database not loading?
- Check browser console for errors (F12)
- Verify `teng_database.json` is in the same directory
- Ensure file is valid JSON (use JSONLint.com)
- Clear browser cache and reload

### Predictions showing "---"?
- Wait for models to train (check console for "✅ Models trained!")
- Ensure at least 10 materials in database
- Check that materials have complete data (no missing values)

### GitHub Pages not updating?
- Wait 2-5 minutes after pushing changes
- Check Actions tab for build status
- Verify branch and folder settings in Pages configuration
- Try hard refresh (Ctrl+Shift+R)

### Excel file not recognized?
- Use `.xlsx` format (not `.xls`)
- Ensure first row contains headers
- Check column names match expected format
- No empty rows at the top

---

## 📚 References

### Key Literature Sources
1. Xu, L. et al. (2025) - Comprehensive TENG review
2. Doganay, D. et al. (2021) - Cotton-PTFE TENGs
3. Yang, W. et al. (2022) - Cellulose-MXene composites
4. [+199 more papers in database]

### ML & Data Science
- Scikit-learn documentation (for algorithm reference)
- Feature engineering for materials science
- Regression analysis best practices

---

## 🎓 Educational Resources

### Learn More About TENGs
- [What is a TENG?](https://en.wikipedia.org/wiki/Triboelectric_nanogenerator)
- [Triboelectric Series](https://en.wikipedia.org/wiki/Triboelectric_effect)
- [Energy Harvesting Applications](https://www.nature.com/subjects/energy-harvesting)

### Machine Learning in Materials
- Materials Informatics
- Predictive Modeling
- Data-Driven Materials Design

---

## 📊 Statistics

- **Total Materials**: 202
- **Polymer Types**: 12
- **Nanofiller Types**: 11
- **Average Power**: 1.38 W/m²
- **Maximum Power**: 4.24 W/m²
- **Database Size**: 50 KB (JSON), 17 KB (Excel)
- **Training Time**: < 2 seconds
- **Prediction Time**: < 10 milliseconds

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Advanced ML algorithms (Random Forest, XGBoost)
- [ ] More descriptors (surface area, crystallinity, etc.)
- [ ] 3D visualization of material-performance space
- [ ] Export predictions to CSV/Excel
- [ ] Batch prediction mode
- [ ] User accounts and saved configurations
- [ ] API for programmatic access
- [ ] Mobile app version

### Community Requests
- Submit feature requests via GitHub Issues
- Vote on proposed features
- Contribute code via Pull Requests

---

## ⭐ Acknowledgments

- **METU Materials Engineering** for research support
- **Literature authors** for data contribution
- **Open source community** for tools and libraries
- **Students and researchers** for testing and feedback

---

**Built with ❤️ by CAMX Research Group**

*Last Updated: October 7, 2025*
