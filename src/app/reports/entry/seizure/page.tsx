
"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft, Save, AlertCircle, Ban, IndianRupee, ShieldAlert, RefreshCw, PlusCircle, Trash2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, useDoc, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { ScrollArea } from "@/components/ui/scroll-area"

function SeizureReportForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const editId = searchParams.get('edit')

  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState({
    reportHeading: "जप्ती व दंड अहवाल",
    date: new Date().toISOString().split('T')[0],
    supplierName: "", supplierId: "", route: "",
    seizureQty: "", milkType: "MIX", 
    reason: "", fineAmount: "",
    actionTaken: "", notes: "",
    points: [""]
  })

  const reportRef = useMemoFirebase(() => {
    if (!db || !user || !editId) return null
    return doc(db, 'users', user.uid, 'dailyWorkReports', editId)
  }, [db, user, editId])

  const { data: existingReport, isLoading } = useDoc(reportRef)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (existingReport && existingReport.fullData) {
      setFormData(prev => ({ ...prev, ...existingReport.fullData }))
    }
  }, [existingReport])

  const addPoint = () => setFormData(prev => ({ ...prev, points: [...prev.points, ""] }))
  const removePoint = (index: number) => {
    if (formData.points.length > 1) {
      setFormData(prev => ({ ...prev, points: prev.points.filter((_, i) => i !== index) }))
    }
  }
  const updatePoint = (index: number, val: string) => {
    const updated = [...formData.points]
    updated[index] = val
    setFormData(prev => ({ ...prev, points: updated }))
  }

  const handleSave = () => {
    if (!db || !user || !formData.supplierName) {
      toast({ title: "त्रुटी", description: "पुरवठादाराचे नाव आवश्यक आहे.", variant: "destructive" })
      return
    }

    const filteredPoints = formData.points.filter(p => p.trim())
    
    const reportData = {
      type: 'Seizure & Penalty',
      date: formData.date,
      reportDate: formData.date,
      generatedByUserId: user.uid,
      summary: `जप्ती: ${formData.supplierName}. दंड: ₹${formData.fineAmount}.`,
      overallSummary: `जप्ती: ${formData.supplierName}. दंड: ₹${formData.fineAmount}.`,
      fullData: { 
        ...formData, 
        points: filteredPoints,
        name: user.displayName || "संकलन सुपरवायझर" 
      },
      updatedAt: new Date().toISOString()
    }

    if (editId) {
      const docRef = doc(db, 'users', user.uid, 'dailyWorkReports', editId)
      updateDocumentNonBlocking(docRef, reportData)
      toast({ title: "यशस्वी", description: "जप्ती अहवाल अपडेट झाला." })
    } else {
      const colRef = collection(db, 'users', user.uid, 'dailyWorkReports')
      addDocumentNonBlocking(colRef, { ...reportData, createdAt: new Date().toISOString() })
      toast({ title: "यशस्वी", description: "जप्ती अहवाल जतन झाला." })
    }
    
    router.push('/reports')
  }

  if (!mounted || isLoading) return <div className="p-20 text-center font-black uppercase text-[10px] opacity-50 animate-pulse">लोड होत आहे...</div>

  return (
    <div className="compact-form-container px-2 pb-20">
      <div className="flex items-center gap-2 border-b pb-2 mb-2">
        <Button variant="ghost" size="icon" onClick={() => router.push('/reports')} className="h-8 w-8 shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="min-w-0">
          <h2 className="text-xs font-black uppercase truncate flex items-center gap-1.5 text-destructive"><ShieldAlert className="h-3.5 w-3.5" /> {editId ? 'जप्ती अपडेट' : 'जप्ती व दंड (SEIZURE)'}</h2>
          <p className="text-[8px] font-bold text-muted-foreground uppercase">{formData.date}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Card className="compact-card p-3 border-primary/20 bg-primary/5">
          <div className="space-y-1">
            <Label className="compact-label text-primary">अहवालाचे शीर्षक (Report Heading) *</Label>
            <Input className="compact-input h-10 border-primary/20 font-black text-primary text-base" value={formData.reportHeading} onChange={e => setFormData({...formData, reportHeading: e.target.value})} />
          </div>
        </Card>

        <Card className="compact-card border-destructive/10 p-3">
          <div className="space-y-2">
            <h3 className="text-[9px] font-black uppercase text-destructive border-b pb-0.5 flex items-center gap-1"><Ban className="h-3 w-3" /> १) पुरवठादार किंवा केंद्राची माहिती</h3>
            <div className="space-y-1.5">
              <div className="space-y-0.5"><Label className="compact-label">पुरवठादार किंवा केंद्राचे पूर्ण नाव *</Label><Input className="compact-input h-9" value={formData.supplierName || ""} onChange={e => setFormData({...formData, supplierName: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5"><Label className="compact-label">पुरवठादार कोड (ID)</Label><Input className="compact-input h-9" value={formData.supplierId || ""} onChange={e => setFormData({...formData, supplierId: e.target.value})} /></div>
                <div className="space-y-0.5"><Label className="compact-label">रूटचे नाव</Label><Input className="compact-input h-9" value={formData.route || ""} onChange={e => setFormData({...formData, route: e.target.value})} /></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="compact-card p-3">
          <div className="space-y-2">
            <h3 className="text-[9px] font-black uppercase text-primary border-b pb-0.5 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> २) जप्तीचा तपशील</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="compact-label">जप्त दूध (Liters)</Label><Input type="number" className="compact-input h-9" value={formData.seizureQty || ""} onChange={e => setFormData({...formData, seizureQty: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="compact-label">जप्तीचे कारण</Label><Input className="compact-input h-9" value={formData.reason || ""} onChange={e => setFormData({...formData, reason: e.target.value})} /></div>
            </div>
            <div className="space-y-0.5"><Label className="compact-label">केलेली कारवाई</Label><Input className="compact-input h-9" value={formData.actionTaken || ""} onChange={e => setFormData({...formData, actionTaken: e.target.value})} /></div>
          </div>
        </Card>

        <Card className="compact-card p-3 bg-muted/5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[9px] font-black uppercase text-primary flex items-center gap-1"><PlusCircle className="h-3 w-3" /> ३) विशेष निरीक्षणे (Points)</h3>
            <Button type="button" variant="outline" size="sm" onClick={addPoint} className="h-6 text-[8px] font-black uppercase px-2 rounded-lg">जोडा</Button>
          </div>
          <div className="space-y-2">
            {formData.points.map((p, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input value={p} onChange={e => updatePoint(i, e.target.value)} placeholder="मुद्दा लिहा..." className="h-8 text-[10px] font-bold bg-white border-none rounded-lg" />
                <Button type="button" variant="ghost" size="icon" onClick={() => removePoint(i)} className="h-7 w-7 text-rose-400 shrink-0"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="compact-card p-3 bg-rose-50/30">
          <div className="space-y-1">
            <Label className="compact-label flex items-center gap-1"><IndianRupee className="h-3 w-3" /> दंडाची एकूण रक्कम (₹)</Label>
            <Input type="number" className="compact-input h-10 border-destructive/20 text-lg text-destructive" value={formData.fineAmount || ""} onChange={e => setFormData({...formData, fineAmount: e.target.value})} placeholder="0.00" />
          </div>
        </Card>

        <Button onClick={handleSave} className="compact-button w-full h-12 bg-destructive text-white shadow-xl shadow-destructive/20 mb-10 font-black uppercase tracking-widest transition-all active:scale-95">
          {editId ? <RefreshCw className="h-4 w-4 mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
          {editId ? 'जप्ती अहवाल अपडेट करा' : 'जप्ती अहवाल जतन करा'}
        </Button>
      </div>
    </div>
  )
}

export default function SeizureReportPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black uppercase text-[10px] opacity-50 animate-pulse">लोड होत आहे...</div>}>
      <SeizureReportForm />
    </Suspense>
  )
}
