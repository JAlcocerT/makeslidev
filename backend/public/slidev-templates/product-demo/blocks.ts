import { IFunction } from '../../../src/api/templates/template.model'

export const productDemoBlocks: Record<string, IFunction> = {
  productIntroMacro: {
    id: "productIntroMacro",
    function: "productIntroMacro",
    label: "Product Introduction",
    description: "Introduce your product with key features",
    order: 1,
    variables: [
      {
        label: "Product Name",
        name: "productName",
        _type: "input",
        description: "Name of your product"
      },
      {
        label: "Product Tagline",
        name: "productTagline",
        _type: "input",
        description: "Brief description of what your product does"
      },
      {
        label: "Key Features",
        name: "keyFeatures",
        _type: "list",
        description: "Main features of your product"
      },
      {
        label: "Product Screenshot",
        name: "productScreenshot",
        _type: "input",
        description: "URL to product screenshot or demo image"
      }
    ]
  },
  problemStatementMacro: {
    id: "problemStatementMacro",
    function: "problemStatementMacro",
    label: "Problem Statement",
    description: "Define the problem your product solves",
    order: 2,
    variables: [
      {
        label: "Problem Title",
        name: "problemTitle",
        _type: "input",
        description: "Title for the problem section"
      },
      {
        label: "Problem Description",
        name: "problemDescription",
        _type: "textarea",
        description: "Detailed description of the problem"
      },
      {
        label: "Pain Points",
        name: "painPoints",
        _type: "list",
        description: "Specific pain points users experience"
      },
      {
        label: "Current Solutions",
        name: "currentSolutions",
        _type: "list",
        description: "Existing solutions and their limitations"
      }
    ]
  },
  liveDemo: {
    id: "liveDemo",
    function: "liveDemo",
    label: "Live Demo",
    description: "Interactive product demonstration",
    order: 3,
    variables: [
      {
        label: "Demo Title",
        name: "demoTitle",
        _type: "input",
        description: "Title for the demo section"
      },
      {
        label: "Demo Steps",
        name: "demoSteps",
        _type: "list",
        description: "Step-by-step demo walkthrough"
      },
      {
        label: "Demo URL",
        name: "demoUrl",
        _type: "input",
        description: "Link to live demo or video"
      },
      {
        label: "Key Highlights",
        name: "keyHighlights",
        _type: "list",
        description: "Important points to highlight during demo"
      }
    ]
  },
  technicalArchitectureMacro: {
    id: "technicalArchitectureMacro",
    function: "technicalArchitectureMacro",
    label: "Technical Architecture",
    description: "Show the technical foundation of your product",
    order: 4,
    variables: [
      {
        label: "Architecture Title",
        name: "architectureTitle",
        _type: "input",
        description: "Title for architecture section"
      },
      {
        label: "Tech Stack",
        name: "techStack",
        _type: "list",
        description: "Technologies and frameworks used"
      },
      {
        label: "Architecture Diagram",
        name: "architectureDiagram",
        _type: "input",
        description: "URL to architecture diagram"
      },
      {
        label: "Key Benefits",
        name: "keyBenefits",
        _type: "list",
        description: "Technical benefits and advantages"
      },
      {
        label: "Scalability",
        name: "scalability",
        _type: "textarea",
        description: "How the architecture scales"
      }
    ]
  },
  userFeedbackMacro: {
    id: "userFeedbackMacro",
    function: "userFeedbackMacro",
    label: "User Feedback",
    description: "Show testimonials and user feedback",
    order: 5,
    variables: [
      {
        label: "Testimonials",
        name: "testimonials",
        _type: "list",
        description: "User testimonials and quotes"
      },
      {
        label: "Usage Statistics",
        name: "usageStatistics",
        _type: "list",
        description: "Key usage metrics and statistics"
      },
      {
        label: "Case Studies",
        name: "caseStudies",
        _type: "list",
        description: "Success stories and case studies"
      }
    ]
  },
  roadmapMacro: {
    id: "roadmapMacro",
    function: "roadmapMacro",
    label: "Product Roadmap",
    description: "Future plans and upcoming features",
    order: 6,
    variables: [
      {
        label: "Roadmap Title",
        name: "roadmapTitle",
        _type: "input",
        description: "Title for roadmap section"
      },
      {
        label: "Upcoming Features",
        name: "upcomingFeatures",
        _type: "list",
        description: "Features planned for future releases"
      },
      {
        label: "Timeline",
        name: "timeline",
        _type: "list",
        description: "Release timeline and milestones"
      },
      {
        label: "Community Requests",
        name: "communityRequests",
        _type: "list",
        description: "Features requested by the community"
      }
    ]
  }
}

export default productDemoBlocks
