
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  Truck, AlertTriangle, Save, History, PlusCircle, X, RotateCcw, Trash2, Clock, MapPin, User, Wrench, IndianRupee, ShieldAlert, Milk, Phone, Settings
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { AIGuidanceCard } from "@/components/ai-guidance-card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface DetailedBreakdownLoss {
  id: string;
  centerCode: string;
  centerName: string;
  milkType: 'MIX' | 'COW';
  qtyLiters: string;
  lossAmount: string;
}

export default function BreakdownPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const breakdownsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'breakdowns')
  }, [db, user])

  const { data: records, isLoading } = useCollection(breakdownsQuery)
  const [mounted, setMounted] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
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
    centerLosses: [] as DetailedBreakdownLoss[],
    linkedReportId: ""
  })

  useEffect(() => setMounted(true), [])

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

  const handleSaveRecord = () => {
    if (!formData.routeName || !formData.vehicleNo || !db || !user) {
      toast({ title: "त्रुटी", description: "रूट आणि गाडी नंबर आवश्यक आहे.", variant: "destructive" })
      return
    }

    const totalLoss = (formData.centerLosses || []).reduce((acc, curr) => acc + (Number(curr.lossAmount) || 0), 0)
    const reportDate = new Date().toISOString().split('T')[0];
    
    const recordData = { 
      ...formData, 
      date: reportDate, 
      totalLossAmount: totalLoss, 
      updatedAt: new Date().toISOString() 
    }

    const reportData = {
      type: 'Transport Breakdown Report',
      date: reportDate,
      reportDate: reportDate,
      generatedByUserId: user.uid,
      summary: `ब्रेकडाऊन: ${formData.vehicleNo}. रूट: ${formData.routeName}. नुकसान: ₹${totalLoss}. पर्यायी सोय: ${formData.recoveryVehicleNo || '-'}.`,
      overallSummary: `वाहन: ${formData.vehicleNo}, ड्रायव्हर: ${formData.driverName}, नुकसान: ₹${totalLoss}`,
      fullData: {
        ...recordData,
        name: user.displayName || "संकलन सुपरवायझर",
        status: "EMERGENCY"
      },
      updatedAt: new Date().toISOString()
    };

    if (editingId) {
      const docRef = doc(db, 'users', user.uid, 'breakdowns', editingId)
      updateDocumentNonBlocking(docRef, recordData)
      
      if (formData.linkedReportId) {
        const reportRef = doc(db, 'users', user.uid, 'dailyWorkReports', formData.linkedReportId);
        updateDocumentNonBlocking(reportRef, reportData);
      }
      
      toast({ title: "यशस्वी", description: "नोंद अद्ययावत केली." })
    } else {
      const breakdownId = crypto.randomUUID();
      const reportId = `REP_BRK_${breakdownId}`;
      
      const colRef = doc(db, 'users', user.uid, 'breakdowns', breakdownId);
      setDocumentNonBlocking(colRef, { ...recordData, id: breakdownId, linkedReportId: reportId, createdAt: new Date().toISOString() }, { merge: true });
      
      const reportRef = doc(db, 'users', user.uid, 'dailyWorkReports', reportId);
      setDocumentNonBlocking(reportRef, { ...reportData, id: reportId, createdAt: new Date().toISOString() }, { merge: true });
      
      toast({ title: "यशस्वी", description: "नोंद जतन केली आणि अहवालात जोडली." })
    }
    
    resetForm()
  }

  const handleDeleteRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!db || !user) return
    if (confirm("तुम्हाला खात्री आहे की ही नोंद हटवायचा आहे?")) {
      const breakdown = records?.find(r => r.id === id);
      const docRef = doc(db, 'users', user.uid, 'breakdowns', id)
      deleteDocumentNonBlocking(docRef)
      
      if (breakdown?.linkedReportId) {
        const reportRef = doc(db, 'users', user.uid, 'dailyWorkReports', breakdown.linkedReportId);
        deleteDocumentNonBlocking(reportRef);
      }
      
      if (editingId === id) resetForm()
      toast({ title: "यशस्वी", description: "नोंद हटवण्यात आली." })
    }
  }

  const resetForm = () => { 
    setEditingId(null); 
    setFormData({ 
      routeName: "", vehicleNo: "", vehicleType: "", capacity: "", driverName: "", mobile: "", 
      breakdownTime: "", location: "", reason: "", severity: "MINOR",
      detailedReason: "", estimatedRepairTime: "", estimatedRepairCost: "0",
      recoveryVehicleNo: "", recoveryArrivalTime: "", milkHot: "NO", milkSour: "NO", centerLosses: [],
      linkedReportId: ""
    }) 
  }

  if (!mounted || isLoading) return <div className="p-10 text-center italic font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  // Added safeguard for reduce
  const currentTotalLoss = (formData.centerLosses || []).reduce((acc, curr) => acc + (Number(curr.lossAmount) || 0), 0);

  return (
    <div className="space-y-3 max-w-7xl mx-auto w-full pb-10 px-1 animate-in fade-in duration-500">
      <div className="flex flex-col gap-0.5 border-b pb-3 px-1">
        <h2 className="text-base font-black flex items-center gap-2 text-rose-600 uppercase tracking-tight">
          <Truck className="h-5 w-5" /> वाहन ब्रेकडाऊन (BREAKDOWN)
        </h2>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Vehicle Breakdown & Logistics Log</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start">
        <Card className="lg:col-span-8 border shadow-none bg-white rounded-xl overflow-hidden border-rose-100 mx-auto w-full">
          <CardHeader className="py-2 px-3 border-b flex flex-row items-center justify-between bg-rose-50/50">
            <span className="text-[10px] font-black uppercase flex items-center gap-2 text-rose-600 tracking-widest">
              <AlertTriangle className="h-3.5 w-3.5" /> {editingId ? 'माहिती बदला (EDIT)' : 'नवीन नोंद (NEW ENTRY)'}
            </span>
            <div className="flex gap-1">
              {editingId && <Button type="button" variant="ghost" size="sm" onClick={resetForm} className="h-6 text-[9px] font-black gap-1 uppercase"><RotateCcw className="h-3 w-3" /> रद्द</Button>}
            </div>
          </CardHeader>
          <CardContent className="p-3 space-y-5">
            <div className="space-y-3">
              <h4 className="text-[9px] font-black uppercase text-primary border-b pb-1 tracking-widest flex items-center gap-2">
                <User className="h-3 w-3" /> १) वाहन व ड्रायव्हर माहिती
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase opacity-60">रूट (ROUTE) *</Label><Input value={formData.routeName || ""} onChange={e => setFormData({...formData, routeName: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-black rounded-lg" /></div>
                <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase opacity-60">गाडी नंबर *</Label><Input value={formData.vehicleNo || ""} onChange={e => setFormData({...formData, vehicleNo: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-black rounded-lg" placeholder="MH..." /></div>
                <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase opacity-60">गाडीचा प्रकार</Label><Input value={formData.vehicleType || ""} onChange={e => setFormData({...formData, vehicleType: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-black rounded-lg" /></div>
                <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase opacity-60">गाडी क्षमता (L)</Label><Input value={formData.capacity || ""} onChange={e => setFormData({...formData, capacity: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-black rounded-lg" /></div>
                <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase opacity-60">ड्रायव्हरचे नाव</Label><Input value={formData.driverName || ""} onChange={e => setFormData({...formData, driverName: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-black rounded-lg" /></div>
                <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase opacity-60">ड्रायव्हर मोबाईल</Label><Input value={formData.mobile || ""} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-black rounded-lg" /></div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[9px] font-black uppercase text-rose-600 border-b pb-1 tracking-widest flex items-center gap-2">
                <Clock className="h-3 w-3" /> २) ब्रेकडाऊन तपशील
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase opacity-60">बिघाड वेळ</Label><Input type="time" value={formData.breakdownTime || ""} onChange={e => setFormData({...formData, breakdownTime: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-black rounded-lg" /></div>
                <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase opacity-60">लोकेशन (ठिकाण)</Label><Input value={formData.location || ""} onChange={e => setFormData({...formData, location: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-black rounded-lg" /></div>
                <div className="col-span-2 space-y-0.5"><Label className="text-[9px] font-black uppercase opacity-60">बिघाडाचे मुख्य कारण</Label><Input value={formData.reason || ""} onChange={e => setFormData({...formData, reason: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-black rounded-lg" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">बिघाडाचे स्वरूप</Label>
                  <RadioGroup value={formData.severity || "MINOR"} onValueChange={v => setFormData({...formData, severity: v})} className="flex gap-2">
                    <div className="flex items-center gap-1.5 bg-muted/10 px-3 py-1.5 rounded-lg border border-muted-foreground/5"><RadioGroupItem value="MINOR" id="sev-min" className="h-3 w-3" /><Label htmlFor="sev-min" className="text-[10px] font-black uppercase">छोटा</Label></div>
                    <div className="flex items-center gap-1.5 bg-muted/10 px-3 py-1.5 rounded-lg border border-muted-foreground/5"><RadioGroupItem value="MAJOR" id="sev-maj" className="h-3 w-3" /><Label htmlFor="sev-maj" className="text-[10px] font-black uppercase text-rose-600">मोठा</Label></div>
                  </RadioGroup>
                </div>
                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">सविस्तर वर्णन</Label><Textarea value={formData.detailedReason || ""} onChange={e => setFormData({...formData, detailedReason: e.target.value})} className="min-h-[60px] text-[11px] bg-muted/20 border-none font-medium rounded-lg p-2" /></div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[9px] font-black uppercase text-amber-600 border-b pb-1 tracking-widest flex items-center gap-2">
                <Settings className="h-3 w-3" /> ३) दुरुस्ती व पर्यायी सोय
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase opacity-60">दुरुस्ती वेळ (तास)</Label><Input value={formData.estimatedRepairTime || ""} onChange={e => setFormData({...formData, estimatedRepairTime: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-black rounded-lg" /></div>
                <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase opacity-60">अंदाजे खर्च (₹)</Label><Input type="number" value={formData.estimatedRepairCost || "0"} onChange={e => setFormData({...formData, estimatedRepairCost: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-black rounded-lg" /></div>
                <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase opacity-60">पर्यायी गाडी क्र.</Label><Input value={formData.recoveryVehicleNo || ""} onChange={e => setFormData({...formData, recoveryVehicleNo: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-black rounded-lg" /></div>
                <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase opacity-60">पर्यायी गाडी वेळ</Label><Input type="time" value={formData.recoveryArrivalTime || ""} onChange={e => setFormData({...formData, recoveryArrivalTime: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-black rounded-lg" /></div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[9px] font-black uppercase text-blue-600 border-b pb-1 tracking-widest flex items-center gap-2">
                <Milk className="h-3 w-3" /> ४) दुधाची स्थिती
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center justify-between p-2 bg-muted/10 rounded-xl border border-muted-foreground/5"><span className="text-[9px] font-black uppercase">दूध गरम झाले का?</span>
                  <RadioGroup value={formData.milkHot || "NO"} onValueChange={v => setFormData({...formData, milkHot: v})} className="flex gap-3">
                    <div className="flex items-center gap-1"><RadioGroupItem value="YES" id="mh-y" className="h-2.5 w-2.5"/><Label htmlFor="mh-y" className="text-[8px] font-black">हो</Label></div>
                    <div className="flex items-center gap-1"><RadioGroupItem value="NO" id="mh-n" className="h-2.5 w-2.5"/><Label htmlFor="mh-n" className="text-[8px] font-black">नाही</Label></div>
                  </RadioGroup>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/10 rounded-xl border border-muted-foreground/5"><span className="text-[9px] font-black uppercase">दूध खराब झाले का?</span>
                  <RadioGroup value={formData.milkSour || "NO"} onValueChange={v => setFormData({...formData, milkSour: v})} className="flex gap-3">
                    <div className="flex items-center gap-1"><RadioGroupItem value="YES" id="ms-y" className="h-2.5 w-2.5"/><Label htmlFor="ms-y" className="text-[8px] font-black">हो</Label></div>
                    <div className="flex items-center gap-1"><RadioGroupItem value="NO" id="ms-n" className="h-2.5 w-2.5"/><Label htmlFor="ms-n" className="text-[8px] font-black">नाही</Label></div>
                  </RadioGroup>
                </div>
              </div>
            </div>
            
            <AIGuidanceCard context={formData.detailedReason || formData.reason || ""} formType="breakdown" />

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-rose-700 tracking-[0.2em] flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5" /> नुकसान तपशील (LOSS LOG)</span>
                <Button type="button" size="sm" onClick={handleAddLossRow} className="h-7 text-[9px] bg-rose-600 text-white font-black uppercase rounded-lg shadow-md"><PlusCircle className="h-3.5 w-3.5 mr-1" /> जोडा</Button>
              </div>
              <div className="border rounded-xl overflow-hidden border-rose-100 shadow-inner">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="bg-rose-50/50 text-[8px] font-black border-b uppercase tracking-widest text-rose-700"><th className="p-2 text-left">कोड/गवळी नाव</th><th className="p-2 text-center">प्रकार</th><th className="p-2 text-center">Ltr</th><th className="p-2 text-right">रक्कम (₹)</th><th className="p-2 w-8"></th></tr>
                  </thead>
                  <tbody>
                    {(formData.centerLosses || []).map((loss) => (
                      <tr key={loss.id} className="border-b last:border-0 bg-white">
                        <td className="p-0 flex"><Input value={loss.centerCode || ""} onChange={e => updateLossRow(loss.id, { centerCode: e.target.value })} className="h-8 w-12 text-[10px] border-none font-black border-r rounded-none bg-transparent" /><Input value={loss.centerName || ""} onChange={e => updateLossRow(loss.id, { centerName: e.target.value })} className="h-8 text-[10px] border-none font-black rounded-none flex-1 bg-transparent" /></td>
                        <td className="p-0 text-center"><select value={loss.milkType || "MIX"} onChange={e => updateLossRow(loss.id, { milkType: e.target.value as any })} className="h-8 text-[9px] font-black bg-transparent border-none outline-none text-center"><option value="MIX">MIX</option><option value="COW">COW</option></select></td>
                        <td className="p-0"><Input type="number" value={loss.qtyLiters || ""} onChange={e => updateLossRow(loss.id, { qtyLiters: e.target.value })} className="h-8 text-[10px] border-none text-center font-black bg-transparent" /></td>
                        <td className="p-0"><Input type="number" value={loss.lossAmount || ""} onChange={e => updateLossRow(loss.id, { lossAmount: e.target.value })} className="h-8 text-[10px] border-none text-right font-black bg-transparent text-rose-600" /></td>
                        <td className="p-1"><Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveLossRow(loss.id)} className="h-7 w-7 text-rose-400 hover:bg-rose-50"><X className="h-3.5 w-3.5" /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end pt-2">
                <div className="bg-rose-600 text-white px-4 py-2 rounded-xl flex items-center gap-3 shadow-lg"><span className="text-[10px] font-black uppercase tracking-widest">एकूण नुकसान:</span><span className="text-sm font-black flex items-center"><IndianRupee className="h-3.5 w-3.5 mr-0.5" />{currentTotalLoss}</span></div>
              </div>
            </div>

            <Button type="button" onClick={handleSaveRecord} className="w-full font-black h-12 bg-rose-600 text-white hover:bg-rose-700 shadow-xl shadow-rose-200 rounded-xl uppercase text-xs tracking-widest transition-all active:scale-95"><Save className="h-4 w-4 mr-2" /> {editingId ? 'अद्ययावत करा (UPDATE)' : 'जतन करा (SAVE & REPORT)'}</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border shadow-none bg-white rounded-xl overflow-hidden border-muted-foreground/10 mx-auto w-full">
          <div className="bg-muted/10 py-3 px-3 border-b font-black text-[9px] uppercase flex items-center gap-2 tracking-[0.2em]"><History className="h-3.5 w-3.5 opacity-50" /> जुन्या नोंदी (LOGS)</div>
          <ScrollArea className="h-[600px]">
            <div className="p-2 space-y-2">
              {records?.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((record) => (
                <Card key={record.id} className="p-3 flex items-start justify-between border shadow-none bg-muted/5 rounded-xl border-muted-foreground/5 hover:bg-rose-50/50 transition-all cursor-pointer group" onClick={() => { setEditingId(record.id); setFormData(record); window.scrollTo({top: 0, behavior: 'smooth'}); }}>
                  <div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><h4 className="font-black text-[11px] truncate uppercase tracking-tight text-slate-900">{record.routeName || "N/A"}</h4><Badge className={`h-3 px-1 text-[6px] font-black uppercase border-none ${record.severity === 'MAJOR' ? 'bg-rose-500' : 'bg-amber-500'}`}>{record.severity || "MINOR"}</Badge></div><p className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5">{record.vehicleNo || "N/A"} | {record.vehicleType || "N/A"}</p><div className="flex items-center gap-2 mt-1"><span className="text-[8px] font-black text-rose-600 bg-rose-50 px-1 rounded">₹{record.totalLossAmount || 0}</span><span className="text-[8px] font-black text-muted-foreground opacity-50 uppercase">{record.date || "N/A"}</span></div></div>
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => handleDeleteRecord(record.id, e)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  )
}
