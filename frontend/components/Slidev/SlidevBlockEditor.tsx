'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Plus, Minus, Eye } from 'lucide-react'

interface Block {
  id: string
  function: string
  label: string
  description: string
  variables: Variable[]
}

interface Variable {
  name: string
  label: string
  _type: 'input' | 'textArea' | 'list' | 'select' | 'radio' | 'checkbox'
  description?: string
  defaultValue?: any
  selectList?: Array<{ label: string; value: string }>
  radioList?: Array<{ label: string; value: string }>
}

interface SlidevBlockEditorProps {
  blocks: Block[]
  variables: Record<string, any>
  onVariableChange: (name: string, value: any) => void
  onPreviewUpdate: () => void
}

export default function SlidevBlockEditor({
  blocks,
  variables,
  onVariableChange,
  onPreviewUpdate
}: SlidevBlockEditorProps) {
  const [expandedBlocks, setExpandedBlocks] = useState<string[]>([])

  const handleVariableChange = (name: string, value: any) => {
    onVariableChange(name, value)
    // Debounced preview update
    setTimeout(() => {
      onPreviewUpdate()
    }, 500)
  }

  const handleListAdd = (variableName: string) => {
    const currentList = variables[variableName] || []
    handleVariableChange(variableName, [...currentList, ''])
  }

  const handleListRemove = (variableName: string, index: number) => {
    const currentList = variables[variableName] || []
    const newList = currentList.filter((_: any, i: number) => i !== index)
    handleVariableChange(variableName, newList)
  }

  const handleListItemChange = (variableName: string, index: number, value: string) => {
    const currentList = variables[variableName] || []
    const newList = [...currentList]
    newList[index] = value
    handleVariableChange(variableName, newList)
  }

  const renderVariableInput = (variable: Variable) => {
    const value = variables[variable.name] || variable.defaultValue || ''

    switch (variable._type) {
      case 'input':
        return (
          <Input
            id={variable.name}
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            placeholder={variable.description}
          />
        )

      case 'textArea':
        return (
          <Textarea
            id={variable.name}
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            placeholder={variable.description}
            rows={3}
          />
        )

      case 'list':
        const listValue = Array.isArray(value) ? value : []
        return (
          <div className="space-y-2">
            {listValue.map((item: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={item}
                  onChange={(e) => handleListItemChange(variable.name, index, e.target.value)}
                  placeholder={`Item ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleListRemove(variable.name, index)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleListAdd(variable.name)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        )

      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(newValue) => handleVariableChange(variable.name, newValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {variable.selectList?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'radio':
        return (
          <RadioGroup
            value={value}
            onValueChange={(newValue) => handleVariableChange(variable.name, newValue)}
          >
            {variable.radioList?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${variable.name}-${option.value}`} />
                <Label htmlFor={`${variable.name}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={variable.name}
              checked={value}
              onCheckedChange={(checked) => handleVariableChange(variable.name, checked)}
            />
            <Label htmlFor={variable.name}>{variable.description}</Label>
          </div>
        )

      default:
        return (
          <Input
            id={variable.name}
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            placeholder={variable.description}
          />
        )
    }
  }

  if (blocks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No blocks available for this template.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Slide Configuration</h3>
        <Button onClick={onPreviewUpdate} variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          Update Preview
        </Button>
      </div>

      <Accordion type="multiple" value={expandedBlocks} onValueChange={setExpandedBlocks}>
        {blocks.map((block, index) => (
          <AccordionItem key={block.id} value={block.id}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between w-full mr-4">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">{index + 1}</Badge>
                  <div className="text-left">
                    <div className="font-medium">{block.label}</div>
                    <div className="text-sm text-gray-500">{block.description}</div>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                {block.variables.map((variable) => (
                  <div key={variable.name} className="space-y-2">
                    <Label htmlFor={variable.name} className="text-sm font-medium">
                      {variable.label}
                      {variable.description && (
                        <span className="text-gray-500 font-normal ml-1">
                          - {variable.description}
                        </span>
                      )}
                    </Label>
                    {renderVariableInput(variable)}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
