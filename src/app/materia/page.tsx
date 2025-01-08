// app/materia/page.tsx
"use client"

import { FormMateria } from "../../components/Editor/FormMateria"

export default function CriarMateria() {
  return (
    <div className="min-h-screen bg-[#1C1C24] p-6">
      <FormMateria />
    </div>
  )
}