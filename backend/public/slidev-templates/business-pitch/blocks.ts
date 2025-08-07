import { FullTemplate, IFunction, Template } from '../../../src/api/templates/template.model'

const templateHeadData: Template = {
    title: 'Business Pitch Presentation',
    description: 'Professional business pitch template with problem-solution structure',
    author: {
        name: 'MakeSlidev Team',
        url: {
            url: 'https://github.com/makeread-me/makeslidev',
            _type: 'Github',
        },
    },
    contributors: [],
    image: '',
    dateCreated: new Date('2025-01-07T00:00:00.000Z'),
    lastUpdated: new Date('2025-01-07T18:00:00.000Z'),
    tags: [
        {
            name: 'Business',
            url: 'business',
        },
        {
            name: 'Pitch',
            url: 'pitch',
        },
        {
            name: 'Slidev',
            url: 'slidev',
        },
    ],
    featured: true,
    folder: 'business-pitch',
    pageType: 'Slidev',
    startupBlocks: [
        'titleSlideMacro',
        'problemSlideMacro',
        'solutionSlideMacro',
        'marketSizeMacro',
        'businessModelMacro',
        'teamSlideMacro',
        'thankyouSlideMacro',
    ],
}

const templateBlocks: IFunction[] = [
    {
        id: 'titleSlideMacro',
        function: 'titleSlideMacro',
        label: 'Title Slide',
        description: 'Opening slide with company name and tagline',
        variables: [
            {
                label: 'Company Name',
                name: 'companyName',
                _type: 'input',
                description: 'Your company or project name',
            },
            {
                label: 'Tagline',
                name: 'tagline',
                _type: 'input',
                description: 'Brief company tagline or subtitle',
            },
            {
                label: 'Presenter Name',
                name: 'presenterName',
                _type: 'input',
                description: 'Name of the person presenting',
            },
            {
                label: 'Background Image',
                name: 'backgroundImage',
                _type: 'input',
                description: 'URL for background image (optional)',
            },
        ],
        order: 1,
    },
    {
        id: 'problemSlideMacro',
        function: 'problemSlideMacro',
        label: 'Problem Statement',
        description: 'Describe the problem your solution addresses',
        variables: [
            {
                label: 'Problem Title',
                name: 'problemTitle',
                _type: 'input',
                description: 'Main problem statement',
            },
            {
                label: 'Problem Description',
                name: 'problemDescription',
                _type: 'textArea',
                description: 'Detailed description of the problem',
            },
            {
                label: 'Pain Points',
                name: 'painPoints',
                _type: 'list',
                description: 'List of specific pain points (one per line)',
            },
        ],
        order: 2,
    },
    {
        id: 'solutionSlideMacro',
        function: 'solutionSlideMacro',
        label: 'Solution Overview',
        description: 'Present your solution to the problem',
        variables: [
            {
                label: 'Solution Title',
                name: 'solutionTitle',
                _type: 'input',
                description: 'Main solution statement',
            },
            {
                label: 'Solution Description',
                name: 'solutionDescription',
                _type: 'textArea',
                description: 'How your solution addresses the problem',
            },
            {
                label: 'Key Features',
                name: 'keyFeatures',
                _type: 'list',
                description: 'Main features of your solution',
            },
        ],
        order: 3,
    },
    {
        id: 'marketSizeMacro',
        function: 'marketSizeMacro',
        label: 'Market Size',
        description: 'Show the market opportunity',
        variables: [
            {
                label: 'Market Size Number',
                name: 'marketSizeNumber',
                _type: 'input',
                description: 'Market size (e.g., $10B, 50M users)',
            },
            {
                label: 'Market Description',
                name: 'marketDescription',
                _type: 'textArea',
                description: 'Description of the market opportunity',
            },
            {
                label: 'Target Audience',
                name: 'targetAudience',
                _type: 'input',
                description: 'Who is your target customer',
            },
        ],
        order: 4,
    },
    {
        id: 'businessModelMacro',
        function: 'businessModelMacro',
        label: 'Business Model',
        description: 'How you make money',
        variables: [
            {
                label: 'Revenue Model',
                name: 'revenueModel',
                _type: 'input',
                description: 'How you generate revenue',
            },
            {
                label: 'Pricing Strategy',
                name: 'pricingStrategy',
                _type: 'textArea',
                description: 'Your pricing approach',
            },
            {
                label: 'Revenue Projections',
                name: 'revenueProjections',
                _type: 'input',
                description: 'Expected revenue numbers',
            },
        ],
        order: 5,
    },
    {
        id: 'teamSlideMacro',
        function: 'teamSlideMacro',
        label: 'Team',
        description: 'Introduce your team',
        variables: [
            {
                label: 'Team Members',
                name: 'teamMembers',
                _type: 'list',
                description: 'Team member names and roles',
            },
            {
                label: 'Team Description',
                name: 'teamDescription',
                _type: 'textArea',
                description: 'Why your team is uniquely qualified',
            },
        ],
        order: 6,
    },
    {
        id: 'thankyouSlideMacro',
        function: 'thankyouSlideMacro',
        label: 'Thank You & Contact',
        description: 'Closing slide with contact information',
        variables: [
            {
                label: 'Contact Email',
                name: 'contactEmail',
                _type: 'input',
                description: 'Email for follow-up',
            },
            {
                label: 'Website',
                name: 'website',
                _type: 'input',
                description: 'Company website URL',
            },
            {
                label: 'Call to Action',
                name: 'callToAction',
                _type: 'input',
                description: 'What you want the audience to do next',
            },
        ],
        order: 7,
    },
]

const fullTemplate: FullTemplate = {
    template: templateHeadData,
    blocks: templateBlocks,
}

export default fullTemplate
