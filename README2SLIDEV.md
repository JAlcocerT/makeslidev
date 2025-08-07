# README to Slidev - Live Presentation Editor

## 🎯 **Concept Overview**

Transform the makeread.me architecture to create **Slidev templates** with live editing capabilities. Users can select presentation templates, customize content through forms, and see real-time slide previews.

## 🏗️ **Architecture Adaptation**

### **Current vs Slidev Architecture**

| Component | README System | Slidev System |
|-----------|---------------|---------------|
| **Templates** | Markdown files | Slidev markdown with frontmatter |
| **Output** | README.md | Presentation slides |
| **Preview** | Markdown render | Live slide preview |
| **Blocks** | README sections | Slide templates |

### **Tech Stack Additions**

- **Slidev**: Vue-based presentation framework
- **Slidev Parser**: Extract slide structure
- **Live Preview**: Embedded Slidev renderer
- **Export Options**: PDF, HTML, SPA

---

## 🔄 **Implementation Steps**

### **Phase 1: Template System Adaptation**

#### **1.1 Create Slidev Template Structure**
```
backend/public/slidev-templates/
├── business-pitch/
│   ├── blocks.ts              # Template metadata
│   ├── blocks.json           # Slide block definitions
│   ├── slides/               # Slidev slide macros
│   │   ├── titleSlideMacro.njk
│   │   ├── contentSlideMacro.njk
│   │   ├── imageTextMacro.njk
│   │   └── thankyouMacro.njk
│   ├── preview.md            # Full slidev preview
│   └── theme.css             # Custom styling
```

#### **1.2 Slidev Block Structure**
```typescript
interface SlidevBlock extends IFunction {
  slideType: 'title' | 'content' | 'image' | 'quote' | 'section'
  layout?: string              // Slidev layout name
  transition?: string          // Slide transition
  background?: string          // Background config
}
```

#### **1.3 Sample Slidev Macro**
```njk
<!-- slides/titleSlideMacro.njk -->
{% macro titleSlideMacro() %}
---
layout: cover
background: {{ backgroundImage || 'https://source.unsplash.com/1920x1080/business' }}
---

# {{ presentationTitle }}

{{ subtitle }}

<div class="pt-12">
  <span @click="$slidev.nav.next" class="px-2 py-1 rounded cursor-pointer" hover="bg-white bg-opacity-10">
    Press Space for next page <carbon:arrow-right class="inline"/>
  </span>
</div>

<div class="abs-br m-6 flex gap-2">
  <button @click="$slidev.nav.openInEditor()" title="Open in Editor" class="text-xl slidev-icon-btn opacity-50 !border-none !hover:text-white">
    <carbon:edit />
  </button>
  <a href="{{ githubUrl }}" target="_blank" alt="GitHub" title="Open in GitHub"
    class="text-xl slidev-icon-btn opacity-50 !border-none !hover:text-white">
    <carbon-logo-github />
  </a>
</div>
{% endmacro %}
```

### **Phase 2: Frontend Modifications**

#### **2.1 Slidev Preview Component**
```typescript
// components/GenerateTemplate/SlidevPreview/SlidevPreview.tsx
import { useEffect, useRef, useState } from 'react'

const SlidevPreview = ({ slidevMarkdown }: { slidevMarkdown: string }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Send markdown to embedded Slidev instance
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({
        type: 'UPDATE_SLIDES',
        markdown: slidevMarkdown
      }, '*')
    }
  }, [slidevMarkdown])

  return (
    <div className="h-full w-full">
      {isLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          <span className="ml-2">Loading slides...</span>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src="/api/slidev/preview"
        className="w-full h-full border-0"
        onLoad={() => setIsLoading(false)}
        title="Slidev Preview"
      />
    </div>
  )
}
```

#### **2.2 Enhanced Template Compilation**
```typescript
// components/GenerateTemplate/MainContent/slidevGenerator.ts
export const compileSlidevString = (
  macros: string,
  templateBlocks: IFunction[],
  variables: Record<string, any>
): string => {
  nunjucks.configure({ autoescape: false, lstripBlocks: true })
  
  // Slidev frontmatter
  const frontmatter = `---
theme: ${variables.theme || 'default'}
background: ${variables.background || 'https://source.unsplash.com/1920x1080/gradient'}
class: text-center
highlighter: shiki
lineNumbers: false
info: |
  ## ${variables.presentationTitle || 'Slidev Presentation'}
  ${variables.description || 'Generated with makeread.me'}
drawings:
  persist: false
transition: slide-left
title: ${variables.presentationTitle || 'Presentation'}
---`

  const specificTemplate = macros
  const slidesContent = combineSlidesIntoOrderedString(templateBlocks)
  let variableString = mapVariableObjectToString(variables)
  
  const fullContent = `${frontmatter}\n\n${variableString} ${specificTemplate} ${slidesContent}`
  const renderedString = nunjucks.renderString(fullContent, {})
  
  return renderedString
}

const combineSlidesIntoOrderedString = (blocks: SlidevBlock[]) => {
  return blocks
    .map((block, index) => {
      const slideBreak = index > 0 ? '\n---\n' : ''
      const layoutConfig = block.layout ? `layout: ${block.layout}\n` : ''
      const transitionConfig = block.transition ? `transition: ${block.transition}\n` : ''
      
      let variableArray: string[] = []
      block.variables.forEach((variable: any) => {
        variableArray.push(variable.name)
      })

      return `${slideBreak}${layoutConfig}${transitionConfig}\n{{- ${block.function}(${variableArray.join(", ")}) -}}`
    })
    .join('\n')
}
```

### **Phase 3: Backend Enhancements**

#### **3.1 Slidev Template Controller**
```typescript
// backend/src/api/slidev/slidev.controller.ts
export default class SlidevController {
  public async getSlidevPreview(id: string): Promise<ServiceResponse<string | null>> {
    try {
      const filePath = `./public/slidev-templates/${id}/preview.md`
      if (!fs.existsSync(filePath)) {
        return new ServiceResponse(ResponseStatus.Failed, 'Slidev template not found', null, StatusCodes.NOT_FOUND)
      }
      
      const slidevContent: string = fs.readFileSync(filePath, 'utf8')
      return new ServiceResponse<string>(ResponseStatus.Success, 'Success', slidevContent, StatusCodes.OK)
    } catch (ex) {
      return new ServiceResponse(ResponseStatus.Failed, 'Failed to get slidev preview', null, StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  public async compileSlidevTemplate(request: CompileSlidevRequest): Promise<ServiceResponse<string | null>> {
    try {
      // Use existing compilation logic but for Slidev format
      const compiled = await this.compileSlidevWithVariables(request.templateId, request.variables, request.blocks)
      return new ServiceResponse<string>(ResponseStatus.Success, 'Compiled successfully', compiled, StatusCodes.OK)
    } catch (ex) {
      return new ServiceResponse(ResponseStatus.Failed, 'Compilation failed', null, StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  public async generateSlidevExport(format: 'pdf' | 'html' | 'spa', content: string): Promise<ServiceResponse<Buffer | null>> {
    // Integration with Slidev CLI for export
    const tempFile = `./temp/slides-${Date.now()}.md`
    fs.writeFileSync(tempFile, content)
    
    try {
      const command = `npx slidev export ${tempFile} --format ${format}`
      const result = await exec(command)
      const exportedFile = fs.readFileSync(result.outputPath)
      
      return new ServiceResponse<Buffer>(ResponseStatus.Success, 'Export successful', exportedFile, StatusCodes.OK)
    } catch (ex) {
      return new ServiceResponse(ResponseStatus.Failed, 'Export failed', null, StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
```

#### **3.2 Live Preview Server**
```typescript
// backend/src/api/slidev/preview.routes.ts
import express from 'express'
import { createSlidevServer } from '@slidev/cli'

const router = express.Router()

// Embedded Slidev server for live preview
router.get('/preview', async (req, res) => {
  try {
    // Create temporary Slidev instance
    const slidevServer = await createSlidevServer({
      entry: './temp/preview-slides.md',
      theme: 'default',
      port: 0, // Dynamic port
      open: false,
      remote: false
    })
    
    // Proxy to Slidev server
    res.redirect(`http://localhost:${slidevServer.port}`)
  } catch (error) {
    res.status(500).json({ error: 'Failed to start Slidev preview' })
  }
})

// Update slides endpoint for live editing
router.post('/update-slides', (req, res) => {
  const { markdown } = req.body
  
  // Write to temporary file
  fs.writeFileSync('./temp/preview-slides.md', markdown)
  
  // Notify Slidev to reload
  // This would require WebSocket integration with Slidev
  res.json({ success: true })
})
```

### **Phase 4: Live Editing Implementation**

#### **4.1 Real-time Updates with WebSockets**
```typescript
// backend/src/websocket/slidevSocket.ts
import { Server as SocketIOServer } from 'socket.io'
import chokidar from 'chokidar'

export const setupSlidevWebSocket = (io: SocketIOServer) => {
  const slidevNamespace = io.of('/slidev')
  
  slidevNamespace.on('connection', (socket) => {
    console.log('Slidev client connected')
    
    // Listen for slide updates from frontend
    socket.on('update-slides', async (data) => {
      const { markdown, sessionId } = data
      
      // Write to session-specific file
      const filePath = `./temp/slides-${sessionId}.md`
      fs.writeFileSync(filePath, markdown)
      
      // Broadcast update to all clients in session
      socket.to(sessionId).emit('slides-updated', { markdown })
    })
    
    // Watch for file changes (if using Slidev CLI)
    const watcher = chokidar.watch('./temp/slides-*.md')
    watcher.on('change', (path) => {
      const content = fs.readFileSync(path, 'utf8')
      socket.emit('file-changed', { content })
    })
    
    socket.on('disconnect', () => {
      console.log('Slidev client disconnected')
      watcher.close()
    })
  })
}
```

#### **4.2 Frontend WebSocket Integration**
```typescript
// hooks/useSlidevLiveEdit.ts
import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

export const useSlidevLiveEdit = (sessionId: string, onSlidesUpdate: (markdown: string) => void) => {
  const socketRef = useRef<Socket>()
  
  useEffect(() => {
    socketRef.current = io('/slidev', {
      query: { sessionId }
    })
    
    socketRef.current.on('slides-updated', (data) => {
      onSlidesUpdate(data.markdown)
    })
    
    return () => {
      socketRef.current?.disconnect()
    }
  }, [sessionId, onSlidesUpdate])
  
  const updateSlides = (markdown: string) => {
    socketRef.current?.emit('update-slides', { markdown, sessionId })
  }
  
  return { updateSlides }
}
```

---

## 🎨 **Slidev Template Examples**

### **Business Pitch Template**
```markdown
---
theme: apple-basic
background: https://source.unsplash.com/1920x1080/business
class: text-center
---

# {{ companyName }}
## {{ tagline }}

{{ elevator_pitch }}

---
layout: image-right
image: https://source.unsplash.com/800x600/problem
---

# The Problem

{{ problem_description }}

<v-clicks>

- {{ pain_point_1 }}
- {{ pain_point_2 }}
- {{ pain_point_3 }}

</v-clicks>

---
layout: center
class: text-center
---

# Our Solution

{{ solution_description }}

---
layout: two-cols
---

# Market Size

{{ market_size_description }}

::right::

<div class="text-6xl text-blue-500 font-bold">
{{ market_size_number }}
</div>

{{ market_size_unit }}
```

### **Technical Presentation Template**
```markdown
---
theme: seriph
highlighter: shiki
lineNumbers: true
---

# {{ project_name }}
## {{ subtitle }}

{{ author_name }} - {{ date }}

---

# Architecture Overview

```mermaid
graph TD
    A[{{ component_a }}] --> B[{{ component_b }}]
    B --> C[{{ component_c }}]
    C --> D[{{ component_d }}]
```

---
layout: two-cols
---

# Code Example

```{{ programming_language }}
{{ code_snippet }}
```

::right::

# Key Features

<v-clicks>

- {{ feature_1 }}
- {{ feature_2 }}
- {{ feature_3 }}

</v-clicks>
```

---

## 🚀 **Implementation Roadmap**

### **Week 1-2: Core Infrastructure**
- [ ] Adapt template system for Slidev
- [ ] Create basic Slidev preview component
- [ ] Implement template compilation for Slidev format

### **Week 3-4: Live Editing**
- [ ] WebSocket integration for real-time updates
- [ ] Embedded Slidev preview server
- [ ] Live slide navigation sync

### **Week 5-6: Template Library**
- [ ] Business pitch templates
- [ ] Technical presentation templates
- [ ] Educational/tutorial templates
- [ ] Portfolio/showcase templates

### **Week 7-8: Advanced Features**
- [ ] Export functionality (PDF, HTML, SPA)
- [ ] Theme customization
- [ ] Animation and transition controls
- [ ] Collaborative editing

---

## 🎯 **Key Benefits**

### **For Users**
- ✅ **Visual Editing**: See slides as you build them
- ✅ **Professional Templates**: Ready-made presentation structures
- ✅ **Real-time Preview**: Instant feedback on changes
- ✅ **Export Options**: Multiple output formats

### **For Developers**
- ✅ **Reusable Architecture**: Leverages existing template system
- ✅ **Modular Design**: Easy to add new slide types
- ✅ **Live Reload**: Development-friendly workflow
- ✅ **Type Safety**: Full TypeScript support

---

## 🔧 **Technical Considerations**

### **Performance**
- **Debounced Updates**: Prevent excessive re-renders
- **Lazy Loading**: Load slides on demand
- **Caching**: Cache compiled templates
- **WebSocket Optimization**: Efficient real-time communication

### **Scalability**
- **Session Management**: Handle multiple concurrent users
- **Resource Cleanup**: Temporary file management
- **Load Balancing**: Distribute Slidev instances

### **Security**
- **Input Sanitization**: Prevent XSS in slide content
- **File System Isolation**: Secure temporary file handling
- **Rate Limiting**: Prevent abuse of compilation endpoints

---

## 🎪 **Demo Workflow**

1. **Template Selection**: User chooses "Business Pitch" template
2. **Form Filling**: User enters company name, problem, solution, etc.
3. **Live Preview**: Slides update in real-time as user types
4. **Slide Navigation**: User can navigate through slides while editing
5. **Export**: Generate PDF or HTML version of presentation
6. **Share**: Get shareable link to live presentation

---

## 💡 **Future Enhancements**

- **AI Content Generation**: Auto-generate slide content
- **Voice Narration**: Add audio to slides
- **Interactive Elements**: Polls, quizzes, Q&A
- **Collaboration**: Multiple users editing simultaneously
- **Analytics**: Track presentation engagement
- **Integration**: Connect with PowerPoint, Google Slides

---

**🚀 This adaptation transforms makeread.me into a powerful presentation builder with the same intuitive live editing experience!**
