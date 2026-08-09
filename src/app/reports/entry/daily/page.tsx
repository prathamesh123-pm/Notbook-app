
"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  ArrowLeft, Save, ListTodo, User, Clock, RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, useDoc, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"

function DailyWorkReportForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const editId = searchParams.get('edit')

  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState({
    reportHeading: "दैनिक कामकाज अहवाल",
    date: new Date().toISOString().split('T')[0],
    repName: "", repId: "", shift: "MORN",
    workType: "OFFICE", summary: "", problems: "", actionTaken: ""
  })

  const reportRef = useMemoFirebase(() => {
    if (!db || !user || !editId) return null
    return doc(db, 'users', user.uid, 'dailyWorkReports', editId)
  }, [db, user, editId])

  const { data: existingReport, isLoading } = useDoc(reportRef)

  useEffect(() => {
    setMounted(true)
    if (user && !editId) setFormData(prev => ({...prev, repName: user.displayName || ""}))
  }, [user, editId])

  useEffect(() => {
    if (existingReport && existingReport.fullData) {
      setFormData(existingReport.fullData)
    }
  }, [existingReport])

  const handleSave = () => {
    if (!db || !user) return
    
    const reportData = {
      type: 'Daily Work Report',
      date: formData.date,
      reportDate: formData.date,
      generatedByUserId: user.uid,
      summary: formData.reportHeading,
      overallSummary: formData.reportHeading,
      fullData: { ...formData },
      updatedAt: new Date().toISOString()
    }

    if (editId) {
      const docRef = doc(db, 'users', user.uid, 'dailyWorkReports', editId)
      updateDocumentNonBlocking(docRef, reportData)
      toast({ title: "यशस्वी", description: "अहवाल अपडेट झाला." })
    } else {
      const colRef = collection(db, 'users', user.uid, 'dailyWorkReports')
      addDocumentNonBlocking(colRef, { ...reportData, createdAt: new Date().toISOString() })
      toast({ title: "यशस्वी", description: "अहवाल जतन झाला." })
    }
    
    router.push('/reports')
  }

  if (!mounted || isLoading) return <div className="p-20 text-center font-black uppercase text-[10px] opacity-50 animate-pulse">लोड होत आहे...</div>

  return (
    <div className="compact-form-container">
      <div className="flex items-center gap-2 border-b pb-2 mb-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/reports')} className="h-8 w-8 shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="min-w-0">
          <h2 className="text-xs font-black uppercase truncate flex items-center gap-1.5"><ListTodo className="h-3.5 w-3.5 text-primary" /> {editId ? 'कामकाज अपडेट' : 'दैनिक कामकाज (DAILY)'}</h2>
          <p className="text-[8px] font-bold text-muted-foreground uppercase">{formData.date}</p>
        </div>
      </div>

      <div className="space-y-3 pb-20">
        <Card className="compact-card p-3 border-primary/20 bg-primary/5">
          <div className="space-y-1">
            <Label className="compact-label text-primary">अहवालाचे शीर्षक (Report Heading) *</Label>
            <Input className="compact-input h-10 border-primary/20 font-black text-primary text-base" value={formData.reportHeading} onChange={e => setFormData({...formData, reportHeading: e.target.value})} />
          </div>
        </Card>

        <Card className="compact-card p-3">
          <div className="flex items-center gap-1.5 border-b border-primary/10 pb-1 mb-2">
            <User className="h-3 w-3 text-primary" />
            <h3 className="text-[9px] font-black uppercase text-primary tracking-widest">प्रतिनिधी माहिती</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div className="space-y-0.5"><Label className="compact-label">अहवाल सादरकर्त्याचे नाव</Label><Input className="compact-input font-black" value={formData.repName} readOnly /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="compact-label">अधिकारी आयडी (Emp ID)</Label><Input className="compact-input" value={formData.repId} onChange={e => setFormData({...formData, repId: e.target.value})} /></div>
              <div className="space-y-0.5"><Label className="compact-label">कामाची शिफ्ट</Label>
                <RadioGroup value={formData.shift} onValueChange={v => setFormData({...formData, shift: v})} className="flex gap-2">
                  <div className="compact-radio-item p-1"><RadioGroupItem value="MORN" id="s-m" className="h-2.5 w-2.5"/><Label htmlFor="s-m" className="compact-radio-label">सकाळ</Label></div>
                  <div className="compact-radio-item p-1"><RadioGroupItem value="EVE" id="s-e" className="h-2.5 w-2.5"/><Label htmlFor="s-e" className="compact-radio-label">संध्याकाळ</Label></div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </Card>

        <Card className="compact-card p-3">
          <div className="space-y-3">
            <div className="space-y-0.5"><Label className="compact-label">केलेल्या कामाचा सविस्तर सारांश</Label><Textarea className="compact-input h-20 p-2 text-[10px]" value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label text-rose-600">कामात आलेले अडथळे किंवा समस्या</Label><Textarea className="compact-input h-16 p-2 text-[10px]" value={formData.problems} onChange={e => setFormData({...formData, problems: e.target.value})} /></div>
            <div className="space-y-0.5"><Label className="compact-label text-emerald-600">समस्येवर केलेली कार्यवाही</Label><Textarea className="compact-input h-16 p-2 text-[10px]" value={formData.actionTaken} onChange={e => setFormData({...formData, actionTaken: e.target.value})} /></div>
          </div>
        </Card>

        <Button onClick={handleSave} className="compact-button w-full bg-primary text-white shadow-lg mb-10 h-11 uppercase font-black">
          {editId ? <RefreshCw className="h-4 w-4 mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
          {editId ? 'अहवाल अपडेट करा' : 'अहवाल जतन करा'}
        </Button>
      </div>
    </div>
  )
}

export default function DailyWorkReportPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black uppercase text-[10px] opacity-50 animate-pulse">लोड होत आहे...</div>}>
      <DailyWorkReportForm />
    </Suspense>
  )
}
