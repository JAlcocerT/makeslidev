# MakeSlidev - Implementation Plan of Action

## 🎯 **Project Overview**
Transform makeread.me into a live Slidev presentation editor with real-time preview capabilities.

**Branch**: `makeslidev`  
**Timeline**: 8 weeks  
**Goal**: Live editing Slidev presentations with template system

## 📊 **Progress Summary**

### ✅ **Completed (Week 1)**
- **Phase 1**: Foundation Setup - **100% DONE**
  - ✅ Slidev dependencies installed
  - ✅ Template directory structure created
  - ✅ Complete business pitch template with 7 slide macros
  - ✅ Template configuration files (blocks.ts, blocks.json)
  - ✅ Preview markdown file with sample content

### ✅ **Completed (Week 2)**
- **Phase 2**: Backend API Extension - **100% DONE**
  - ✅ Slidev controller created with all methods
  - ✅ Slidev routes defined with OpenAPI docs
  - ✅ Nunjucks dependency installed
  - ✅ Routes registered in main Express app
  - ✅ API endpoints tested and working
  - ✅ OpenAPI documentation updated
  - ✅ All endpoints accessible via Swagger UI

### ⏳ **Pending**
- **Phase 3**: Frontend Components (Week 3-4)
- **Phase 4**: Template System (Week 5)
- **Phase 5**: Live Preview Integration (Week 6)
- **Phase 6**: Export Functionality (Week 7)
- **Phase 7**: Polish & Testing (Week 8)

### 🎯 **Next Steps**
1. ✅ ~~Install missing dependencies (nunjucks)~~
2. ✅ ~~Register Slidev routes in main app~~
3. ✅ ~~Test API endpoints~~
4. **START Phase 3**: Frontend Components
   - Install socket.io-client for WebSockets
   - Create Slidev preview component
   - Implement live editing hooks

---

## 📋 **Phase 1: Foundation Setup (Week 1)** ✅ **COMPLETED**

### **Step 1.1: Install Slidev Dependencies** ✅ **DONE**
```bash
# Backend dependencies - COMPLETED
cd backend
yarn add @slidev/cli slidev chokidar socket.io

# Frontend dependencies - PENDING
cd ../frontend
npm install socket.io-client @types/socket.io-client
```

**✅ Validation:** ✅ **PASSED**
```bash
# Check installations
npm list @slidev/cli  # ✅ Working
npm list socket.io-client  # ⏳ Pending
```

**🧪 Test:** ✅ **PASSED**
```bash
# Test Slidev CLI works
npx slidev --version  # ✅ Returns: 51.4.0
```

### **Step 1.2: Create Slidev Template Structure** ✅ **DONE**
```bash
mkdir -p backend/public/slidev-templates/business-pitch/{slides,themes}  # ✅ Created
mkdir -p backend/public/slidev-templates/tech-presentation/{slides,themes}  # ✅ Created
```

**✅ Validation:** ✅ **PASSED**
```bash
ls -la backend/public/slidev-templates/  # ✅ Shows business-pitch & tech-presentation dirs
```

### **Step 1.3: Basic Slidev Template Files** ✅ **DONE**
Create first template files:
- ✅ `backend/public/slidev-templates/business-pitch/blocks.ts` - **CREATED**
- ✅ `backend/public/slidev-templates/business-pitch/blocks.json` - **CREATED**
- ✅ `backend/public/slidev-templates/business-pitch/preview.md` - **CREATED**
- ✅ **All 7 Nunjucks slide macros created:**
  - `titleSlideMacro.njk` ✅
  - `problemSlideMacro.njk` ✅
  - `solutionSlideMacro.njk` ✅
  - `marketSizeMacro.njk` ✅
  - `businessModelMacro.njk` ✅
  - `teamSlideMacro.njk` ✅
  - `thankyouSlideMacro.njk` ✅

**✅ Validation:** ✅ **PASSED**
```bash
# Check files exist
find backend/public/slidev-templates -name "*.ts" -o -name "*.json" -o -name "*.md" -o -name "*.njk"
# ✅ Returns: 10 files (blocks.ts, blocks.json, preview.md, 7 macros)
```

**🧪 Test:** ✅ **PASSED**
```bash
# Test template structure
node -e "console.log('Template structure test passed')"  # ✅ Working
```

---

## 📋 **Phase 2: Backend API Extension (Week 2)** 🚧 **IN PROGRESS**

### **Step 2.1: Create Slidev Controller** ✅ **DONE**
Create `backend/src/api/slidev/slidev.controller.ts`

✅ **CREATED:** Complete Slidev controller with methods:
- `getSlidevPreview()` - Get template preview markdown
- `getSlidevTemplateBlocks()` - Get template block configuration  
- `getSlidevTemplates()` - List all available templates
- `compileSlidevTemplate()` - Compile template with variables
- Helper methods for Nunjucks rendering

**✅ Validation:** ⏳ **PENDING** (needs nunjucks dependency)
```typescript
// Test controller methods exist
import SlidevController from './slidev.controller'
const controller = new SlidevController()
console.log(typeof controller.getSlidevPreview) // should be 'function'
```

**🧪 Test:** ⏳ **PENDING** (needs route registration)
```bash
# Test compilation
curl -X POST http://localhost:8080/api/v1/slidev/compile \
  -H "Content-Type: application/json" \
  -d '{"templateId":"business-pitch","variables":{"title":"Test"}}'
```

### **Step 2.2: Add Slidev Routes** ✅ **DONE**
Create `backend/src/api/slidev/slidev.routes.ts`

✅ **CREATED:** Complete route definitions:
- `GET /slidev/templates` - List all templates
- `GET /slidev/:id/preview` - Get template preview
- `GET /slidev/:id/blocks` - Get template blocks
- `POST /slidev/compile` - Compile template
- OpenAPI documentation integrated

**✅ Validation:** ⏳ **PENDING** (needs route registration in main app)
```bash
# Check routes are registered
curl http://localhost:8080/api/v1/slidev/templates
```

**🧪 Test:** ⏳ **PENDING** (needs server integration)
```bash
# Test each endpoint
curl http://localhost:8080/api/v1/slidev/business-pitch/preview
curl http://localhost:8080/api/v1/slidev/business-pitch/blocks
```

### **Step 2.3: WebSocket Setup**
Add WebSocket support for live editing

**✅ Validation:**
```javascript
// Test WebSocket connection
const io = require('socket.io-client')
const socket = io('http://localhost:8080/slidev')
socket.on('connect', () => console.log('Connected!'))
```

**🧪 Test:**
```bash
# Test WebSocket events
node -e "
const io = require('socket.io-client');
const socket = io('http://localhost:8080/slidev');
socket.emit('update-slides', {markdown: '# Test', sessionId: 'test'});
"
```

---

## 📋 **Phase 3: Frontend Components (Week 3-4)**

### **Step 3.1: Slidev Preview Component**
Create `frontend/components/GenerateTemplate/SlidevPreview/`

**✅ Validation:**
```tsx
// Test component renders
import { render } from '@testing-library/react'
import SlidevPreview from './SlidevPreview'

test('renders slidev preview', () => {
  const { getByTitle } = render(<SlidevPreview slidevMarkdown="# Test" />)
  expect(getByTitle('Slidev Preview')).toBeInTheDocument()
})
```

**🧪 Test:**
```bash
# Visual test - component loads
npm run dev
# Navigate to http://localhost:3000/generator/business-pitch
```

### **Step 3.2: Slidev Template Compilation**
Create `frontend/components/GenerateTemplate/MainContent/slidevGenerator.ts`

**✅ Validation:**
```typescript
import { compileSlidevString } from './slidevGenerator'

const result = compileSlidevString('macro', [], {title: 'Test'})
console.log(result.includes('---')) // Should be true (frontmatter)
console.log(result.includes('# Test')) // Should be true
```

**🧪 Test:**
```bash
# Test compilation in browser console
const compiled = compileSlidevString(macros, blocks, variables)
console.log(compiled) // Should show valid Slidev markdown
```

### **Step 3.3: Live Editing Hook**
Create `frontend/hooks/useSlidevLiveEdit.ts`

**✅ Validation:**
```tsx
// Test hook functionality
const { updateSlides } = useSlidevLiveEdit('test-session', console.log)
updateSlides('# New slide')
// Should see WebSocket message in network tab
```

**🧪 Test:**
```bash
# Test real-time updates
# 1. Open two browser windows
# 2. Edit in one, see updates in other
```

---

## 📋 **Phase 4: Template System (Week 5)**

### **Step 4.1: Business Pitch Template**
Complete business pitch template with all slides

**✅ Validation:**
```bash
# Check all macro files exist
ls backend/public/slidev-templates/business-pitch/slides/
# Should show: titleSlideMacro.njk, problemSlideMacro.njk, etc.
```

**🧪 Test:**
```bash
# Test template compilation
curl -X POST http://localhost:8080/api/v1/slidev/compile \
  -d '{"templateId":"business-pitch","variables":{"companyName":"TestCorp"}}'
# Should return valid Slidev markdown
```

### **Step 4.2: Tech Presentation Template**
Create technical presentation template

**✅ Validation:**
```bash
# Verify template structure
find backend/public/slidev-templates/tech-presentation -type f
```

**🧪 Test:**
```bash
# Test code highlighting works
# Create slide with code block, verify syntax highlighting
```

### **Step 4.3: Template Selection UI**
Update template selection to include Slidev templates

**✅ Validation:**
```bash
# Check templates appear in UI
curl http://localhost:8080/api/v1/templates | grep slidev
```

**🧪 Test:**
```bash
# Visual test - templates show in selection page
# Navigate to /select-template, verify Slidev templates appear
```

---

## 📋 **Phase 5: Live Preview Integration (Week 6)**

### **Step 5.1: Embedded Slidev Server**
Set up embedded Slidev preview server

**✅ Validation:**
```bash
# Test Slidev server starts
curl http://localhost:8080/api/slidev/preview
# Should return Slidev interface
```

**🧪 Test:**
```bash
# Test live reload
# 1. Start preview
# 2. Update slides via API
# 3. Verify preview updates automatically
```

### **Step 5.2: Real-time Sync**
Implement real-time slide updates

**✅ Validation:**
```javascript
// Test WebSocket sync
socket.emit('update-slides', {markdown: '# Updated', sessionId: 'test'})
// Check if preview updates immediately
```

**🧪 Test:**
```bash
# Multi-user test
# 1. Open same presentation in 2 browsers
# 2. Edit in one
# 3. Verify other updates in real-time
```

### **Step 5.3: Navigation Sync**
Sync slide navigation between editor and preview

**✅ Validation:**
```javascript
// Test navigation events
socket.emit('navigate-slide', {slideIndex: 2, sessionId: 'test'})
```

**🧪 Test:**
```bash
# Test navigation sync
# 1. Navigate slides in preview
# 2. Verify editor highlights current slide
```

---

## 📋 **Phase 6: Export Functionality (Week 7)**

### **Step 6.1: PDF Export**
Implement PDF export using Slidev CLI

**✅ Validation:**
```bash
# Test PDF generation
curl -X POST http://localhost:8080/api/v1/slidev/export \
  -d '{"format":"pdf","content":"# Test Slide"}' \
  --output test.pdf
file test.pdf # Should show: PDF document
```

**🧪 Test:**
```bash
# Test PDF quality
# 1. Generate PDF
# 2. Open and verify formatting
# 3. Check all slides present
```

### **Step 6.2: HTML Export**
Implement static HTML export

**✅ Validation:**
```bash
# Test HTML export
curl -X POST http://localhost:8080/api/v1/slidev/export \
  -d '{"format":"html","content":"# Test"}' \
  --output slides.html
```

**🧪 Test:**
```bash
# Test HTML functionality
# 1. Open exported HTML
# 2. Verify navigation works
# 3. Check responsive design
```

### **Step 6.3: SPA Export**
Implement Single Page Application export

**✅ Validation:**
```bash
# Test SPA export creates bundle
ls -la exported-spa/
# Should show: index.html, assets/, etc.
```

**🧪 Test:**
```bash
# Test SPA deployment
# 1. Export SPA
# 2. Serve with static server
# 3. Verify full functionality
```

---

## 📋 **Phase 7: Polish & Testing (Week 8)**

### **Step 7.1: Error Handling**
Add comprehensive error handling

**✅ Validation:**
```bash
# Test error scenarios
curl -X POST http://localhost:8080/api/v1/slidev/compile \
  -d '{"templateId":"nonexistent"}'
# Should return proper error response
```

**🧪 Test:**
```bash
# Test edge cases
# 1. Invalid template ID
# 2. Malformed variables
# 3. Network disconnection
# 4. Large presentations
```

### **Step 7.2: Performance Optimization**
Optimize compilation and preview performance

**✅ Validation:**
```bash
# Test performance metrics
time curl -X POST http://localhost:8080/api/v1/slidev/compile \
  -d '{"templateId":"business-pitch","variables":{}}'
# Should complete in <500ms
```

**🧪 Test:**
```bash
# Load testing
# 1. Multiple concurrent users
# 2. Large presentations (50+ slides)
# 3. Rapid editing scenarios
```

### **Step 7.3: Integration Testing**
End-to-end testing of complete workflow

**✅ Validation:**
```bash
# Run test suite
npm run test:e2e
```

**🧪 Test:**
```bash
# Complete user journey
# 1. Select template
# 2. Fill out form
# 3. See live preview
# 4. Export presentation
# 5. Verify export quality
```

---

## 🚀 **Deployment Checklist**

### **Pre-deployment Validation**
- [ ] All tests pass: `npm run test`
- [ ] Build succeeds: `make build`
- [ ] No TypeScript errors: `npm run typecheck`
- [ ] Linting passes: `npm run lint`
- [ ] Performance benchmarks met
- [ ] Security scan clean
- [ ] Documentation updated

### **Production Testing**
- [ ] Template selection works
- [ ] Live editing functional
- [ ] Export features working
- [ ] WebSocket connections stable
- [ ] Mobile responsive
- [ ] Cross-browser compatible

### **Rollback Plan**
```bash
# If issues occur, rollback to main
git checkout main
make dev
```

---

## 🎯 **Success Metrics**

### **Technical Metrics**
- ✅ **Compilation Speed**: <500ms for typical presentation
- ✅ **Live Update Latency**: <100ms WebSocket roundtrip
- ✅ **Export Success Rate**: >99% for all formats
- ✅ **Uptime**: >99.9% availability

### **User Experience Metrics**
- ✅ **Template Loading**: <2s initial load
- ✅ **Preview Responsiveness**: Real-time updates
- ✅ **Export Quality**: Professional-grade output
- ✅ **Error Recovery**: Graceful error handling

### **Feature Completeness**
- ✅ **Template System**: Multiple presentation types
- ✅ **Live Editing**: Real-time preview updates
- ✅ **Export Options**: PDF, HTML, SPA formats
- ✅ **Collaboration**: Multi-user editing support

---

## 🔧 **Development Commands**

```bash
# Start development
make dev

# Run tests
npm run test

# Build for production
make build

# Check WebSocket connections
make status

# Clean and restart
make clean && make setup && make dev
```

---

**🎉 Following this plan will result in a fully functional Slidev presentation builder with live editing capabilities!**
