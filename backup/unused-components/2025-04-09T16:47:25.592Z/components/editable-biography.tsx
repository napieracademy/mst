"use client"

import { EditableText } from "./editable-text"

interface EditableBiographyProps {
  biography: string | null
  personName: string
}

export function EditableBiography({ biography, personName }: EditableBiographyProps) {
  return (
    <EditableText
      text={biography}
      placeholder={`Nessuna biografia disponibile per ${personName}. Doppio click per aggiungerne una.`}
      label="Biografia"
    />
  )
}

