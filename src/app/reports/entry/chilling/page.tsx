
"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  ArrowLeft, Save, ShieldCheck, Thermometer, Droplets, Zap, RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, addDocumentNonBlocking, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"

function ChillingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    reportHeading: "चिलिंग सेंटर तपासणी अहवाल",
    date: new Date().toISOString().split('T')[0],
    centerName: "", tempAtArrival: "", tempAfterChilling: "",
    waterSupply: "OK", powerBackup: "AVAILABLE",
    hygieneStandard: "HIGH", staffUniform: "YES", fssaiDisplay: "YES",
    iceBankStatus: "NORMAL", storageCapacity: "",
    observations: ""
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

  const handleSave = () => {
    if (!db || !user || !formData.centerName) {
      toast({ title: "त्रुटी", description: "केंद्राचे नाव आवश्यक आहे.", variant: "destructive" })
      return
    }
    
    const report = {
      type: 'Chilling Report',
      date: formData.date,
      reportDate: formData.date,
      generatedByUserId: user.uid,
      summary: `चिलिंग: ${formData.centerName}. तापमान: ${formData.tempAfterChilling}°C.`,
      overallSummary: `चिलिंग: ${formData.centerName}. तापमान: ${formData.tempAfterChilling}°C.`,
      fullData: { ...formData },
      updatedAt: new Date().toISOString()
    }

    if (editId) {
      const docRef = doc(db, 'users', user.uid, 'dailyWorkReports', editId)
      updateDocumentNonBlocking(docRef, report)
      toast({ title: "यशस्वी", description: "चिलिंग अहवाल अद्ययावत झाला." })
    } else {
      addDocumentNonBlocking(collection(db, 'users', user.uid, 'dailyWorkReports'), {
        ...report,
        createdAt: new Date().toISOString()
      })
      toast({ title: "यशस्वी", description: "चिलिंग अहवाल जतन झाला." })
    }
    router.push('/reports')
  }

  if (!mounted || isLoading) return <div className="p-20 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="compact-form-container">
      <div className="flex items-center gap-2 border-b pb-2 mb-2">
        <Button variant="ghost" size="icon" onClick={() => router.push('/reports')} className="h-8 w-8 rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5 uppercase">
            <Thermometer className="h-4 w-4 text-primary" /> {editId ? 'चिलिंग अपडेट' : 'चिलिंग सेंटर (CHILLING)'}
          </h2>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{formData.date}</p>
        </div>
      </div>

      <Card className="compact-card p-3 border-primary/20 bg-primary/5 mb-3">
        <div className="space-y-1">
          <Label className="compact-label text-primary">अहवालाचे शीर्षक (Report Heading) *</Label>
          <Input className="compact-input h-10 border-primary/20 font-black text-primary text-base" value={formData.reportHeading} onChange={e => setFormData({...formData, reportHeading: e.target.value})} />
        </div>
      </Card>

      <Card className="compact-card">
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 border-b pb-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <h3 className="text-[10px] font-black uppercase text-primary tracking-widest">१) केंद्राची प्राथमिक माहिती</h3>
          </div>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="compact-label">चिलिंग केंद्राचे पूर्ण नाव *</Label>
              <Input className="compact-input" value={formData.centerName} onChange={e => setFormData({...formData, centerName: e.target.value})} placeholder="..." />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="compact-label">सुरुवातीचे तापमान (°C)</Label>
                <Input className="compact-input" type="number" value={formData.tempAtArrival} onChange={e => setFormData({...formData, tempAtArrival: e.target.value})} />
              </div>
              <div className="space-y-1">
                <Label className="compact-label">चिलिंग नंतरचे तापमान (°C)</Label>
                <Input className="compact-input" type="number" value={formData.tempAfterChilling} onChange={e => setFormData({...formData, tempAfterChilling: e.target.value})} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="compact-card">
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 border-b pb-1">
            <Droplets className="h-3.5 w-3.5 text-primary" />
            <h3 className="text-[10px] font-black uppercase text-primary tracking-widest">२) सुविधा व स्वच्छता</h3>
          </div>
          
          <div className="space-y-3">
            {[
              { label: 'पाणी पुरवठ्याची स्थिती', key: 'waterSupply', options: ['OK', 'NOT-OK'] },
              { label: 'पॉवर बॅकअप सुविधा उपलब्ध आहे का?', key: 'powerBackup', options: ['AVAILABLE', 'NONE'] },
              { label: 'स्वच्छतेचा दर्जा', key: 'hygieneStandard', options: ['HIGH', 'MEDIUM', 'LOW'] },
              { label: 'स्टाफने गणवेश घातला होता का?', key: 'staffUniform', options: ['YES', 'NO'] },
              { label: 'FSSAI परवाना लावला आहे का?', key: 'fssaiDisplay', options: ['YES', 'NO'] },
              { label: 'आईस बँकची सद्यस्थिती', key: 'iceBankStatus', options: ['NORMAL', 'CRITICAL'] },
            ].map((item) => (
              <div key={item.key} className="space-y-1">
                <Label className="compact-label">{item.label}</Label>
                <RadioGroup 
                  value={(formData as any)[item.key]} 
                  onValueChange={v => setFormData({...formData, [item.key]: v})}
                  className="compact-radio-group"
                >
                  {item.options.map(opt => (
                    <div key={opt} className="compact-radio-item">
                      <RadioGroupItem value={opt} id={`chill-${item.key}-${opt}`} className="h-2.5 w-2.5" />
                      <Label htmlFor={`chill-${item.key}-${opt}`} className="compact-radio-label">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="compact-card">
        <div className="space-y-1">
          <Label className="compact-label">अतिरिक्त निरीक्षणे (Observations)</Label>
          <Textarea 
            className="compact-input min-h-[60px] h-auto p-2" 
            value={formData.observations} 
            onChange={e => setFormData({...formData, observations: e.target.value})} 
            placeholder="..." 
          />
        </div>
      </Card>

      <Button onClick={handleSave} className="compact-button w-full bg-primary text-white shadow-primary/20 mb-10 h-11 uppercase font-black">
        {editId ? <RefreshCw className="h-4 w-4 mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
        {editId ? 'अहवाल अपडेट करा' : 'चिलिंग अहवाल जतन करा'}
      </Button>
    </div>
  )
}

export default function ChillingReportPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>}>
      <ChillingForm />
    </Suspense>
  )
}
