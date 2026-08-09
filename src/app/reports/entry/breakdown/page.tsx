
"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  ArrowLeft, Save, Truck, AlertTriangle, Milk, User, IndianRupee, RefreshCw, PlusCircle, X, MapPin, Clock, Phone, Settings, Wrench, ShieldAlert
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, useDoc, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { AIGuidanceCard } from "@/components/ai-guidance-card"
import { Textarea } from "@/components/ui/textarea"

interface DetailedBreakdownLoss {
  id: string;
  centerCode: string;
  centerName: string;
  milkType: 'MIX' | 'COW';
  qtyLiters: string;
  lossAmount: string;
}

function BreakdownReportForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const editId = searchParams.get('edit')

  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState({
    reportHeading: "वाहन ब्रेकडाऊन अहवाल",
    date: new Date().toISOString().split('T')[0],
    routeName: "", 
    vehicleNo: "", 
    vehicleType: "",
    capacity: "",
    driverName: "",
    mobile: "",
    breakdownTime: "",
    location: "", 
    reason: "", 
    severity: "MINOR",
    detailedReason: "",
    estimatedRepairTime: "",
    estimatedRepairCost: "0",
    recoveryVehicleNo: "",
    recoveryArrivalTime: "",
    milkHot: "NO",
    milkSour: "NO",
    centerLosses: [] as DetailedBreakdownLoss[]
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
      setFormData(prev => ({
        ...prev,
        ...existingReport.fullData
      }))
    }
  }, [existingReport])

  const handleAddLossRow = () => {
    const newLoss: DetailedBreakdownLoss = { 
      id: crypto.randomUUID(), 
      centerCode: "", 
      centerName: "", 
      milkType: 'MIX',
      qtyLiters: "", 
      lossAmount: "" 
    }
    setFormData({ ...formData, centerLosses: [...(formData.centerLosses || []), newLoss] })
  }

  const handleRemoveLossRow = (id: string) => { 
    setFormData({ ...formData, centerLosses: (formData.centerLosses || []).filter(l => l.id !== id) }) 
  }

  const updateLossRow = (id: string, updates: Partial<DetailedBreakdownLoss>) => {
    setFormData({ ...formData, centerLosses: (formData.centerLosses || []).map(l => l.id === id ? { ...l, ...updates } : l) })
  }

  const handleSave = () => {
    if (!db || !user || !formData.vehicleNo) {
      toast({ title: "त्रुटी", description: "गाडी नंबर आवश्यक आहे.", variant: "destructive" })
      return
    }

    const totalLoss = (formData.centerLosses || []).reduce((acc, curr) => acc + (Number(curr.lossAmount) || 0), 0)
    
    const reportData = {
      type: 'Transport Breakdown Report',
      date: formData.date,
      reportDate: formData.date,
      generatedByUserId: user.uid,
      summary: `ब्रेकडाऊन: ${formData.vehicleNo}. रूट: ${formData.routeName}. नुकसान: ₹${totalLoss}.`,
      overallSummary: `गाडी: ${formData.vehicleNo}, ड्रायव्हर: ${formData.driverName}, नुकसान: ₹${totalLoss}`,
      fullData: { ...formData, totalLossAmount: totalLoss },
      updatedAt: new Date().toISOString()
    }

    if (editId) {
      const docRef = doc(db, 'users', user.uid, 'dailyWorkReports', editId)
      updateDocumentNonBlocking(docRef, reportData)
      toast({ title: "यशस्वी", description: "ब्रेकडाऊन अहवाल अपडेट झाला." })
    } else {
      const colRef = collection(db, 'users', user.uid, 'dailyWorkReports')
      addDocumentNonBlocking(colRef, { ...reportData, createdAt: new Date().toISOString() })
      toast({ title: "यशस्वी", description: "ब्रेकडाऊन अहवाल जतन झाला." })
    }
    
    router.push('/reports')
  }

  if (!mounted || isLoading) return <div className="p-20 text-center font-black uppercase text-[10px] opacity-50 animate-pulse">लोड होत आहे...</div>

  const currentTotalLoss = (formData.centerLosses || []).reduce((acc, curr) => acc + (Number(curr.lossAmount) || 0), 0);

  return (
    <div className="compact-form-container px-2 max-w-[650px] mx-auto pb-20">
      <div className="flex items-center gap-2 border-b pb-2 mb-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/reports')} className="h-8 w-8 shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="min-w-0">
          <h2 className="text-sm font-black uppercase truncate flex items-center gap-1.5 text-rose-600"><Truck className="h-4 w-4" /> {editId ? 'ब्रेकडाऊन अपडेट' : 'ब्रेकडाऊन अहवाल'}</h2>
          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{formData.date}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Card className="compact-card p-3 border-primary/20 bg-primary/5">
          <div className="space-y-1">
            <Label className="compact-label text-primary">अहवालाचे शीर्षक (Report Heading) *</Label>
            <Input className="compact-input h-10 border-primary/20 font-black text-primary text-base" value={formData.reportHeading} onChange={e => setFormData({...formData, reportHeading: e.target.value})} />
          </div>
        </Card>

        <Card className="compact-card p-3 border-rose-100 mx-auto w-full">
          <div className="flex items-center gap-1.5 border-b border-primary/10 pb-1 mb-2">
            <User className="h-3 w-3 text-primary" />
            <h3 className="text-[10px] font-black uppercase text-primary tracking-widest">१) गाडी व ड्रायव्हरची माहिती</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-0.5"><Label className="compact-label">दुध संकलन रूटचे नाव *</Label><Input value={formData.routeName || ""} onChange={e => setFormData({...formData, routeName: e.target.value})} className="compact-input h-9" /></div>
            <div className="space-y-0.5"><Label className="compact-label">गाडीचा नंबर (MH...) *</Label><Input value={formData.vehicleNo || ""} onChange={e => setFormData({...formData, vehicleNo: e.target.value})} className="compact-input h-9" placeholder="MH..." /></div>
            <div className="space-y-0.5">
              <Label className="compact-label">गाडीचा प्रकार (उदा. पिकअप)</Label>
              <Input value={formData.vehicleType || ""} onChange={e => setFormData({...formData, vehicleType: e.target.value})} className="compact-input h-9" placeholder="उदा. पिकअप" />
            </div>
            <div className="space-y-0.5"><Label className="compact-label">गाडीची दूध क्षमता (Liters)</Label><Input value={formData.capacity || ""} onChange={e => setFormData({...formData, capacity: e.target.value})} className="compact-input h-9" /></div>
            <div className="space-y-0.5"><Label className="compact-label">ड्रायव्हरचे नाव</Label><Input value={formData.driverName || ""} onChange={e => setFormData({...formData, driverName: e.target.value})} className="compact-input h-9" /></div>
            <div className="space-y-0.5"><Label className="compact-label">ड्रायव्हरचा मोबाईल नंबर</Label><Input value={formData.mobile || ""} onChange={e => setFormData({...formData, mobile: e.target.value})} className="compact-input h-9" /></div>
          </div>
        </Card>

        <Card className="compact-card p-3 bg-rose-50/20 border-rose-100 mx-auto w-full">
          <div className="flex items-center gap-1.5 border-b border-rose-200 pb-1 mb-2">
            <AlertTriangle className="h-3 w-3 text-rose-600" />
            <h3 className="text-[10px] font-black uppercase text-rose-600 tracking-widest">२) गाडी बिघाड झाल्याचा तपशील</h3>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-0.5"><Label className="compact-label">गाडी बिघाड झाल्याची वेळ</Label><Input type="time" value={formData.breakdownTime || ""} onChange={e => setFormData({...formData, breakdownTime: e.target.value})} className="compact-input h-9 bg-white" /></div>
              <div className="space-y-0.5"><Label className="compact-label">बिघाड झालेल्या ठिकाणाचे नाव</Label><Input value={formData.location || ""} onChange={e => setFormData({...formData, location: e.target.value})} className="compact-input h-9 bg-white" placeholder="उदा. रस्तापूर" /></div>
              <div className="col-span-2 space-y-0.5">
                <Label className="compact-label">बिघाड होण्याचे मुख्य कारण</Label>
                <Input value={formData.reason || ""} onChange={e => setFormData({...formData, reason: e.target.value})} className="compact-input h-9 bg-white" placeholder="उदा. टायर फुटणे / इंजिन प्रॉब्लेम" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="compact-label">बिघाडाचे स्वरूप (छोटा/मोठा)</Label>
                <RadioGroup value={formData.severity || "MINOR"} onValueChange={v => setFormData({...formData, severity: v})} className="flex gap-2">
                  <div className="compact-radio-item bg-white"><RadioGroupItem value="MINOR" id="sev-min" className="h-3 w-3" /><Label htmlFor="sev-min" className="compact-radio-label">छोटा</Label></div>
                  <div className="compact-radio-item bg-white"><RadioGroupItem value="MAJOR" id="sev-maj" className="h-3 w-3" /><Label htmlFor="sev-maj" className="compact-radio-label text-rose-600">मोठा</Label></div>
                </RadioGroup>
              </div>
              <div className="space-y-1.5">
                <Label className="compact-label">बिघाडाचे सविस्तर वर्णन</Label>
                <Textarea value={formData.detailedReason || ""} onChange={e => setFormData({...formData, detailedReason: e.target.value})} className="min-h-[60px] text-[11px] bg-white border-none font-medium rounded-lg p-2" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="compact-card p-3 border-primary/10 mx-auto w-full">
          <div className="flex items-center gap-1.5 border-b border-primary/10 pb-1 mb-2">
            <Settings className="h-3 w-3 text-primary" />
            <h3 className="text-[10px] font-black uppercase text-primary tracking-widest">३) दुरुस्ती व पर्यायी सोय</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-0.5"><Label className="compact-label">दुरुस्तीसाठी लागणारा वेळ (तास)</Label><Input value={formData.estimatedRepairTime || ""} onChange={e => setFormData({...formData, estimatedRepairTime: e.target.value})} className="compact-input h-9" placeholder="उदा. २ तास" /></div>
            <div className="space-y-0.5"><Label className="compact-label">दुरुस्तीसाठी लागणारा खर्च (₹)</Label><Input type="number" value={formData.estimatedRepairCost || "0"} onChange={e => setFormData({...formData, estimatedRepairCost: e.target.value})} className="compact-input h-9" /></div>
            <div className="space-y-0.5"><Label className="compact-label">दुध वाचवण्यासाठी पाठवलेली दुसरी गाडी</Label><Input value={formData.recoveryVehicleNo || ""} onChange={e => setFormData({...formData, recoveryVehicleNo: e.target.value})} className="compact-input h-9" placeholder="MH..." /></div>
            <div className="space-y-0.5"><Label className="compact-label">दुसरी गाडी पोहोचण्याची वेळ</Label><Input type="time" value={formData.recoveryArrivalTime || ""} onChange={e => setFormData({...formData, recoveryArrivalTime: e.target.value})} className="compact-input h-9" /></div>
          </div>
        </Card>

        <Card className="compact-card p-3 bg-blue-50/20 border-blue-100 mx-auto w-full">
          <div className="flex items-center gap-1.5 border-b border-blue-200 pb-1 mb-2">
            <Milk className="h-3 w-3 text-blue-600" />
            <h3 className="text-[10px] font-black uppercase text-blue-600 tracking-widest">४) दुधाची सद्यस्थिती</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-blue-100 shadow-sm">
              <span className="text-[9px] font-black uppercase">दूध गरम झाले होते का?</span>
              <RadioGroup value={formData.milkHot || "NO"} onValueChange={v => setFormData({...formData, milkHot: v})} className="flex gap-3">
                <div className="flex items-center gap-1"><RadioGroupItem value="YES" id="mh-y" className="h-2.5 w-2.5"/><Label htmlFor="mh-y" className="text-[8px] font-black">हो</Label></div>
                <div className="flex items-center gap-1"><RadioGroupItem value="NO" id="mh-n" className="h-2.5 w-2.5"/><Label htmlFor="mh-n" className="text-[8px] font-black">नाही</Label></div>
              </RadioGroup>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-blue-100 shadow-sm">
              <span className="text-[9px] font-black uppercase">दूध पूर्णपणे खराब झाले का?</span>
              <RadioGroup value={formData.milkSour || "NO"} onValueChange={v => setFormData({...formData, milkSour: v})} className="flex gap-3">
                <div className="flex items-center gap-1"><RadioGroupItem value="YES" id="ms-y" className="h-2.5 w-2.5"/><Label htmlFor="ms-y" className="text-[8px] font-black">हो</Label></div>
                <div className="flex items-center gap-1"><RadioGroupItem value="NO" id="ms-n" className="h-2.5 w-2.5"/><Label htmlFor="ms-n" className="text-[8px] font-black">नाही</Label></div>
              </RadioGroup>
            </div>
          </div>
        </Card>
        
        <AIGuidanceCard context={formData.detailedReason || formData.reason || ""} formType="breakdown" />

        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase text-rose-700 tracking-[0.2em] flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5" /> नुकसानीचा सविस्तर तक्ता (LOSS LOG)</span>
            <Button type="button" size="sm" onClick={handleAddLossRow} className="h-7 text-[9px] bg-rose-600 text-white font-black uppercase rounded-lg shadow-md"><PlusCircle className="h-3.5 w-3.5 mr-1" /> जोडा</Button>
          </div>
          <div className="border rounded-xl overflow-hidden border-rose-100 shadow-inner">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="bg-rose-50/50 text-[8px] font-black border-b uppercase tracking-widest text-rose-700">
                  <th className="p-2 text-left">कोड किंवा नाव</th>
                  <th className="p-2 text-center">प्रकार</th>
                  <th className="p-2 text-center">Ltr</th>
                  <th className="p-2 text-right">रक्कम (₹)</th>
                  <th className="p-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {(formData.centerLosses || []).map((loss) => (
                  <tr key={loss.id} className="border-b last:border-0 bg-white">
                    <td className="p-0 flex">
                      <Input placeholder="ID" value={loss.centerCode || ""} onChange={e => updateLossRow(loss.id, { centerCode: e.target.value })} className="h-8 w-12 text-[10px] border-none font-black border-r rounded-none bg-transparent" />
                      <Input placeholder="नाव" value={loss.centerName || ""} onChange={e => updateLossRow(loss.id, { centerName: e.target.value })} className="h-8 text-[10px] border-none font-black rounded-none flex-1 bg-transparent" />
                    </td>
                    <td className="p-0 text-center">
                      <select 
                        value={loss.milkType || "MIX"} 
                        onChange={e => updateLossRow(loss.id, { milkType: e.target.value as any })}
                        className="h-8 text-[9px] font-black bg-transparent border-none outline-none text-center"
                      >
                        <option value="MIX">MIX</option>
                        <option value="COW">COW</option>
                      </select>
                    </td>
                    <td className="p-0">
                      <Input type="number" placeholder="0" value={loss.qtyLiters || ""} onChange={e => updateLossRow(loss.id, { qtyLiters: e.target.value })} className="h-8 text-[10px] border-none text-center font-black bg-transparent" />
                    </td>
                    <td className="p-0">
                      <Input type="number" value={loss.lossAmount || ""} onChange={e => updateLossRow(loss.id, { lossAmount: e.target.value })} className="h-8 text-[10px] border-none text-right font-black bg-transparent text-rose-600" />
                    </td>
                    <td className="p-1">
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveLossRow(loss.id)} className="h-7 w-7 text-rose-400 hover:bg-rose-50"><X className="h-3.5 w-3.5" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end pt-2">
            <div className="bg-rose-600 text-white px-4 py-2 rounded-xl flex items-center gap-3 shadow-lg">
              <span className="text-[10px] font-black uppercase tracking-widest">एकूण आर्थिक नुकसान:</span>
              <span className="text-sm font-black flex items-center"><IndianRupee className="h-3.5 w-3.5 mr-0.5" />{currentTotalLoss}</span>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} className="compact-button w-full bg-rose-600 text-white shadow-xl shadow-rose-200 mt-4 mb-10 h-12 uppercase font-black tracking-[0.2em] transition-all active:scale-95">
          {editId ? <RefreshCw className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {editId ? 'ब्रेकडाऊन अहवाल अद्ययावत करा' : 'ब्रेकडाऊन अहवाल जतन करा'}
        </Button>
      </div>
    </div>
  )
}

export default function BreakdownReportPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black uppercase text-[10px] opacity-50 animate-pulse">लोड होत आहे...</div>}>
      <BreakdownReportForm />
    </Suspense>
  )
}
