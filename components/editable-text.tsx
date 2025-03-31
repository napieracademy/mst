"use client"

import { useState } from "react"

interface EditableTextProps {
  text: string | null
  placeholder: string
  label?: string
}

export function EditableText({ text, placeholder, label }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(text || "")

  const handleDoubleClick = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    setIsEditing(false)
    // In un'applicazione reale, qui si invierebbe il testo aggiornato a un'API
    console.log(`${label || "Testo"} salvato:`, editedText)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedText(text || "")
  }

  if (isEditing) {
    return (
      <div className="mt-2">
        <textarea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className="w-full h-48 p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          autoFocus
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition-colors"
          >
            Salva
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium transition-colors"
          >
            Annulla
          </button>
        </div>
      </div>
    )
  }

  return text ? (
    <p className="text-gray-200 mb-8 leading-relaxed" onDoubleClick={handleDoubleClick}>
      {text}
      <span className="block mt-2 text-xs text-gray-500 italic">Doppio click per modificare</span>
    </p>
  ) : (
    <p className="text-gray-400 italic mb-8" onDoubleClick={handleDoubleClick}>
      {placeholder}
    </p>
  )
}

