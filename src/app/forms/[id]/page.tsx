"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft, Save, Sparkles, FileCheck
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, useDoc, useMemoFirebase, addDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { FormDefinition } from "@/lib/types"

export default function FormEntryPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const formId = params.id as string

  const formRef = useMemoFirebase(() => {
    if (!db || !user || !formId) return null
    return doc(db, 'users', user.uid, 'formDefinitions', formId)
  }, [db, user, formId])

  const { data: form, isLoading } = useDoc<FormDefinition>(formRef)
  
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})

  useEffect(() => setMounted(true), [])

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData({ ...formData, [fieldId]: value })
  }

  const handleSaveSubmission = () => {
    if (!db || !user || !form) return

    // Validation
    const missing = form.fields.filter(f => f.required && !formData[f.id])
    if (missing.length > 0) {
      toast({ title: "त्रुटी", description: "सर्व अनिवार्य रकाने भरा.", variant: "destructive" })
      return
    }

    // Convert formData to readable summary
    const summaryParts = form.fields.map(f => `${f.label}: ${formData[f.id] || '-'}`)
    const overallSummary = summaryParts.join(' | ')

    const submission = {
      type: 'Custom Form',
      formTitle: form.title,
      formId: form.id,
      date: new Date().toISOString().split('T')[0],
      reportDate: new Date().toISOString().split('T')[0],
      generatedByUserId: user.uid,
      summary: overallSummary,
      overallSummary: overallSummary,
      fullData: {
        name: user.displayName || "User",
        formTitle: form.title,
        dynamicFields: form.fields.map(f => ({
          label: f.label,
          value: formData[f.id] || '-',
          type: f.type
        })),
        rawFormData: formData
      },
      createdAt: new Date().toISOString()
    }

    const reportsRef = collection(db, 'users', user.uid, 'dailyWorkReports')
    addDocumentNonBlocking(reportsRef, submission)
    
    toast({ title: "यशस्वी", description: "अहवाल जतन करण्यात आला." })
    router.push('/reports')
  }

  if (!mounted || isLoading) return <div className="p-10 text-center italic font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>
  if (!form) return <div className="p-10 text-center font-black">फॉर्म सापडला नाही.</div>

  return (
    <div className="space-y-4 max-w-3xl mx-auto w-full pb-10 px-2 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 border-b pb-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/forms')} className="rounded-full h-10 w-10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h2 className="text-xl font-black uppercase tracking-tight truncate">{form.title}</h2>
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">माहिती नोंदणी (DATA ENTRY)</p>
        </div>
      </div>

      <Card className="border shadow-none bg-white rounded-3xl overflow-hidden border-muted-foreground/10">
        <CardHeader className="py-4 px-6 border-b bg-primary/5 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <FileCheck className="h-4 w-4" /> तपशील भरा
          </CardTitle>
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-5">
            {form.fields.map((field) => (
              <div key={field.id} className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">
                  {field.label} {field.required && <span className="text-destructive">*</span>}
                </Label>
                
                {field.type === 'textarea' ? (
                  <Textarea 
                    value={formData[field.id] || ""} 
                    onChange={e => handleInputChange(field.id, e.target.value)}
                    className="min-h-[100px] text-[11px] font-bold bg-muted/20 border-none rounded-2xl p-4 focus-visible:ring-primary shadow-inner"
                    placeholder="..."
                  />
                ) : (
                  <Input 
                    type={field.type}
                    value={formData[field.id] || ""} 
                    onChange={e => handleInputChange(field.id, e.target.value)}
                    className="h-12 text-[11px] font-bold bg-muted/20 border-none rounded-2xl px-4 focus-visible:ring-primary shadow-inner"
                    placeholder="..."
                  />
                )}
              </div>
            ))}
          </div>

          <Button onClick={handleSaveSubmission} className="w-full font-black h-12 shadow-2xl shadow-primary/20 rounded-2xl uppercase text-[11px] mt-4">
            <Save className="h-4 w-4 mr-2" /> अहवाल जतन करा (SUBMIT)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
