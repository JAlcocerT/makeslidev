# makeread.me - Technical Architecture & Implementation Guide

## 🏗️ **Architecture Overview**

makeread.me is a full-stack web application that enables users to generate professional README.md files through a live markdown editing interface.

The application follows a modern microservices architecture with **real-time template rendering**.

### Tech Stack

- **Frontend**: Next.js 13+ (React 18, TypeScript, Tailwind CSS)
- **Backend**: Express.js (Node.js, TypeScript)
- **Template Engine**: Nunjucks for dynamic markdown generation
- **State Management**: TanStack Query (React Query)
- **UI Components**: Radix UI + shadcn/ui
- **Content Management**: Contentlayer for MDX processing
- **API Documentation**: OpenAPI/Swagger with TSOA

---

## 🎯 **Core Functionality: Live Markdown Editing**

### **Template System Architecture**

The application uses a sophisticated template system built on **Nunjucks macros** that enables real-time markdown generation:

```typescript
// Core compilation function
export const compileString = (
  macros: string,
  templateBlocks: IFunction[],
  variables: Record<string, any>
): string => {
  nunjucks.configure({ autoescape: false, lstripBlocks: true })
  
  const specificTemplate = macros
  const index = combineMacroIntoOrderedFunctionString(templateBlocks)
  let variableString = mapVariableObjectToString(variables)
  
  const string = `${variableString} ${specificTemplate} ${index}`
  const renderedString = nunjucks.renderString(string, {})
  return renderedString
}
```

### **Template Block System**

Each README template is composed of **modular blocks** (macros) that users can:
- ✅ **Add/Remove** dynamically
- ✅ **Reorder** via drag-and-drop
- ✅ **Configure** with custom variables
- ✅ **Preview** in real-time

#### **Block Structure**

```typescript
interface IFunction {
  id: string
  function: string        // Macro name (e.g., "projectHeaderMacro")
  label: string          // Display name
  description: string    // Block description
  variables: Variable[]  // Configurable inputs
  order: number         // Display order
}
```

#### **Variable Types**

- `input` - Single line text
- `textArea` - Multi-line text
- `checkBox` - Boolean toggle
- `list` - Array of items
- `object` - Nested object structure
- `select` - Dropdown selection
- `radio` - Radio button group

---

## 🔄 **Live Editing Workflow**

### **1. Template Selection**
```
User selects template → Backend loads template blocks → Frontend renders editor
```

### **2. Real-time Compilation**
```
User modifies variables → Frontend triggers compilation → Nunjucks renders markdown → Preview updates
```

### **3. Block Management**
```
User adds/removes blocks → Template structure updates → Compilation re-runs → Live preview
```

### **Data Flow Diagram**

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Frontend  │    │   Backend    │    │  Templates  │
│             │    │              │    │             │
│ ┌─────────┐ │    │ ┌──────────┐ │    │ ┌─────────┐ │
│ │ Editor  │◄┼────┼─│    API   │◄┼────┼─│ Blocks  │ │
│ └─────────┘ │    │ └──────────┘ │    │ └─────────┘ │
│ ┌─────────┐ │    │ ┌──────────┐ │    │ ┌─────────┐ │
│ │Preview  │ │    │ │ Template │ │    │ │ Macros  │ │
│ └─────────┘ │    │ │ Engine   │ │    │ └─────────┘ │
└─────────────┘    └──────────────┘    └─────────────┘
```

---

## 📁 **Project Structure**

```
makeread.me/
├── frontend/                    # Next.js Frontend
│   ├── app/                    # App Router (Next.js 13+)
│   │   ├── generator/          # Template editor pages
│   │   ├── select-template/    # Template selection
│   │   └── articles/           # Blog/documentation
│   ├── components/             # React components
│   │   ├── GenerateTemplate/   # Core editor components
│   │   │   ├── MainContent/    # Main editor interface
│   │   │   │   ├── generator.ts # Template compilation logic
│   │   │   │   ├── Editor/     # Form inputs & controls
│   │   │   │   └── Preview/    # Markdown preview
│   │   │   └── Sidebar/        # Block management
│   │   └── SelectTemplate/     # Template browser
│   ├── openAPI/               # Generated API client
│   └── lib/                   # Utilities & configurations
│
├── backend/                    # Express.js Backend
│   ├── src/
│   │   ├── api/
│   │   │   └── templates/      # Template management API
│   │   │       ├── template.controller.ts
│   │   │       ├── template.model.ts
│   │   │       └── template.routes.ts
│   │   └── api-docs/          # OpenAPI documentation
│   └── public/                # Template definitions
│       ├── purplebooth-a-good-readme-template/
│       │   ├── blocks.ts      # Template configuration
│       │   ├── blocks.json    # Block definitions
│       │   ├── macros/        # Nunjucks macro files
│       │   │   ├── projectHeaderMacro.njk
│       │   │   ├── gettingStartedMacro.njk
│       │   │   └── ...
│       │   └── preview.md     # Template preview
│       └── [other-templates]/
│
└── Makefile                   # Development automation
```

---

## 🔧 **Template Creation Guide**

### **Step 1: Create Template Directory**
```bash
mkdir backend/public/your-template-name/
```

### **Step 2: Define Template Metadata** (`blocks.ts`)

```typescript
import { FullTemplate, IFunction, Template } from '../../src/api/templates/template.model'

const templateHeadData: Template = {
    title: 'Your Template Name',
    description: 'Template description',
    author: {
        name: 'Your Name',
        url: { url: 'https://github.com/yourusername', _type: 'Github' }
    },
    folder: 'your-template-name',
    pageType: 'ReadME',
    startupBlocks: ['headerMacro', 'installationMacro'], // Default blocks
    // ... other metadata
}
```

### **Step 3: Create Nunjucks Macros** (`macros/`)

```njk
<!-- macros/headerMacro.njk -->
{% macro headerMacro() %}
{% if projectTitle %}
# {{ projectTitle }}
{% endif %}
{% if projectDescription %}

{{ projectDescription }}
{% endif %}
{% endmacro %}
```

### **Step 4: Define Block Configuration** (`blocks.json`)
```json
{
  "headerMacro": {
    "id": "headerMacro",
    "function": "headerMacro",
    "label": "Project Header",
    "description": "Main project title and description",
    "variables": [
      {
        "label": "Project Title",
        "name": "projectTitle",
        "_type": "input",
        "description": "The name of your project"
      }
    ]
  }
}
```

### **Step 5: Create Preview** (`preview.md`)

```markdown
# Sample Project

This is a sample project description...

## Installation
...
```

---

## 🚀 **Development Setup**

### **Quick Start**
```bash
# Clone and setup
git clone <repository>
cd makeslidev

# Complete setup (installs dependencies, creates env files, builds contentlayer)
make setup

# Start development servers
make dev
```

### **Available Commands**
```bash
make help              # Show all commands
make install           # Install dependencies
make setup-env         # Setup environment files
make build-contentlayer # Build contentlayer files
make dev               # Start both servers
make build             # Production build
make lint              # Run linting
make clean             # Clean build artifacts
make status            # Check running processes
make stop              # Stop all processes
```

### **Development Workflow**
1. **Template Development**: Add templates in `backend/public/`
2. **Frontend Changes**: Modify components in `frontend/components/`
3. **API Changes**: Update controllers in `backend/src/api/`
4. **Live Reload**: Both servers support hot reloading

---

## 🔌 **API Endpoints**

### **Template Management**
```typescript
GET    /api/v1/template/:id/default-blocks    # Get template blocks
GET    /api/v1/template/:id/preview          # Get template preview
POST   /api/v1/template/compile              # Compile template with variables
```

### **Sidebar/Block Management**
```typescript
GET    /api/v1/sidebar/template-options      # Get available blocks
GET    /api/v1/sidebar/search               # Search blocks
```

### **OpenAPI Documentation**

- **Swagger UI**: `http://localhost:8080/api-docs`
- **JSON Schema**: `http://localhost:8080/swagger.json`

---

## 🎨 **Frontend Architecture**

### **State Management**
- **TanStack Query**: Server state management & caching
- **React State**: Local component state
- **Form State**: React Hook Form for complex forms

### **Component Hierarchy**
```
App
├── SelectTemplate (Template browser)
│   ├── TemplateCard
│   ├── PreviewModal
│   └── FilterSidebar
└── Generator (Template editor)
    ├── GeneratorSidebar (Block management)
    │   ├── SearchInput
    │   ├── BlockList
    │   └── MappedBlocks
    └── MainContent (Editor interface)
        ├── Editor (Form inputs)
        ├── Preview (Markdown preview)
        └── RawText (Raw markdown)
```

### **Real-time Preview System**
```typescript
// MainContent.tsx - Core editor logic
const MainContent = ({ templateId, templateBlocks, setTemplateBlocks }) => {
  const [variables, setVariables] = useState<Record<string, any>>({})
  const [output, setOutput] = useState<string>("")

  // Real-time compilation
  useEffect(() => {
    if (macros && templateBlocks.length > 0) {
      const compiledOutput = compileString(macros, templateBlocks, variables)
      setOutput(compiledOutput)
    }
  }, [macros, templateBlocks, variables])

  return (
    <TabContent
      Editor={<Editor variables={variables} setVariables={setVariables} />}
      Preview={<Preview output={output} />}
      RawText={<RawText output={output} />}
    />
  )
}
```

---

## 🔐 **Security & Performance**

### **Security Measures**
- ✅ **Input Sanitization**: All user inputs are sanitized
- ✅ **CORS Configuration**: Proper cross-origin settings
- ✅ **Rate Limiting**: API rate limiting implemented
- ✅ **Template Isolation**: Templates run in isolated contexts

### **Performance Optimizations**
- ✅ **Code Splitting**: Next.js automatic code splitting
- ✅ **Image Optimization**: Next.js Image component
- ✅ **Caching**: TanStack Query caching strategy
- ✅ **Debounced Inputs**: Reduced API calls on user input
- ✅ **Lazy Loading**: Components loaded on demand

---

## 🧪 **Testing Strategy**

### **Frontend Testing**
```bash
# Component testing
npm run test

# E2E testing
npm run test:e2e

# Type checking
npm run typecheck
```

### **Backend Testing**
```bash
# Unit tests
npm run test

# API testing
npm run test:api
```

---

## 📦 **Deployment**

### **Production Build**
```bash
make build    # Build both frontend and backend
make start    # Start production servers
```

### **Environment Variables**
```bash
# Backend (.env)
NODE_ENV=production
PORT=8080
MONGO_PRIVATE_URL=your_mongodb_url

# Frontend
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### **Docker Support**
```dockerfile
# Backend Dockerfile already included
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]
```

---

## 🤝 **Contributing to Templates**

### **Template Contribution Workflow**
1. **Fork Repository**
2. **Create Template Directory** in `backend/public/`
3. **Implement Required Files**:
   - `blocks.ts` - Template metadata
   - `blocks.json` - Block definitions  
   - `macros/*.njk` - Nunjucks macros
   - `preview.md` - Template preview
4. **Test Template** using the editor
5. **Submit Pull Request**

### **Template Best Practices**
- ✅ **Modular Design**: Break into logical blocks
- ✅ **Clear Variables**: Use descriptive variable names
- ✅ **Good Defaults**: Provide sensible default values
- ✅ **Documentation**: Include clear descriptions
- ✅ **Preview Quality**: Create comprehensive previews

---

## 🔍 **Troubleshooting**

### **Common Issues**

#### **Port Already in Use**
```bash
make stop    # Stop all processes
make status  # Check what's running
```

#### **Contentlayer Build Errors**
```bash
make build-contentlayer  # Rebuild contentlayer files
```

#### **Missing Dependencies**
```bash
make clean   # Clean node_modules
make install # Reinstall dependencies
```

#### **Template Not Loading**
1. Check template directory structure
2. Verify `blocks.ts` exports
3. Ensure macro syntax is correct
4. Check browser console for errors

### **Debug Mode**
```bash
# Enable debug logging
DEBUG=* make dev

# Check API responses
curl http://localhost:8080/api/v1/template/your-template/default-blocks
```

---

## 📚 **Resources & References**

### **Documentation**
- [Nunjucks Documentation](https://mozilla.github.io/nunjucks/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TanStack Query](https://tanstack.com/query/latest)
- [Radix UI](https://www.radix-ui.com/)

### **Template Examples**
- `purplebooth-a-good-readme-template` - Comprehensive template
- `othneildrew-best-readme-template` - Popular GitHub template
- `fernanda-kipper-readme-templates-*` - Modern templates

### **API Reference**
- OpenAPI Spec: `http://localhost:8080/swagger.json`
- Interactive Docs: `http://localhost:8080/api-docs`

---

## 🎯 **Key Takeaways for Reuse**

### **For Template Creators**
1. **Study Existing Templates**: Look at `backend/public/` examples
2. **Use Nunjucks Macros**: Modular, reusable template blocks
3. **Define Clear Variables**: Make templates user-friendly
4. **Test Thoroughly**: Use the live editor to validate

### **For Developers**
1. **Component Architecture**: Modular React components with clear separation
2. **State Management**: TanStack Query for server state, React state for UI
3. **Real-time Updates**: useEffect + debouncing for live previews
4. **Type Safety**: Full TypeScript implementation with Zod validation

### **For DevOps**
1. **Makefile Automation**: Complete development workflow automation
2. **Environment Management**: Proper env file handling
3. **Process Management**: Built-in start/stop/status commands
4. **Docker Ready**: Production deployment support

---

**🚀 Ready to build amazing README generators? Start with `make setup` and explore the template system!**
