
"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  ClipboardCheck, Truck, Plus, Trash2, MapPin, Briefcase, Save, ArrowLeft, ListPlus, Clock, RefreshCw, User, Car
} from "lucide-react"
import { useUser, useFirestore, useDoc, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { AIGuidanceCard } from "@/components/ai-guidance-card"

interface RouteVisitEntry {
  id: string;
  centerCode: string;
  supplierName: string;
  iceUsed: string;
  arrivalTime: string;
  departureTime: string;
  emptyCans: string;
  fullCans: string;
}

function DailyReportForm() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  const [mounted, setMounted] = useState(false)
  const [reportType, setReportType] = useState<string>("route-visit")

  const createId = () => typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2);

  const createEmptyRouteEntry = (): RouteVisitEntry => ({
    id: createId(),
    centerCode: "", supplierName: "", iceUsed: "", 
    arrivalTime: "", departureTime: "", emptyCans: "", fullCans: ""
  });

  const [formData, setFormData] = useState({
    reportHeading: "दैनिक अहवाल",
    name: "", idNumber: "", reportDate: "", shift: "सकाळ", slipNo: "",
    driverName: "", vehicleNumber: "", routeName: "", routeOutTime: "", routeInTime: "",
    startReading: "", endReading: "", totalKm: "0",
    routeVisitLogs: [] as RouteVisitEntry[],
    visitPerson: "", visitPurpose: "", visitDiscussion: "",
    travelVehicle: "स्वतःचे", travelStartKm: "", travelEndKm: "", travelTotalKm: "0",
    officeTaskSubject: "", officeTaskDetails: "", pendingOfficeWork: "",
    achievements: "", problems: "", actionsTaken: "", supervisorName: ""
  })

  const reportRef = useMemoFirebase(() => {
    if (!db || !user || !editId) return null
    return doc(db, 'users', user.uid, 'dailyWorkReports', editId)
  }, [db, user, editId])

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, 'users', user.uid)
  }, [db, user])

  const { data: existingReport, isLoading: isReportLoading } = useDoc(reportRef)
  const { data: profileData } = useDoc(profileRef)

  useEffect(() => {
    setMounted(true)
    setFormData(prev => ({ 
      ...prev, 
      reportDate: new Date().toISOString().split('T')[0], 
      routeVisitLogs: [createEmptyRouteEntry()]
    }))
  }, [])

  useEffect(() => {
    if (profileData && !editId) {
      setFormData(prev => ({ 
        ...prev, 
        name: profileData.displayName || user?.displayName || prev.name, 
        idNumber: profileData.employeeId || prev.idNumber, 
        supervisorName: profileData.displayName || prev.supervisorName 
      }))
    }
  }, [profileData, editId, user])

  useEffect(() => {
    if (existingReport && existingReport.fullData) {
      setFormData(prev => ({ ...prev, ...existingReport.fullData }))
      if (existingReport.fullData.reportType) setReportType(existingReport.fullData.reportType)
    }
  }, [existingReport])

  const addRouteEntry = () => setFormData(prev => ({ ...prev, routeVisitLogs: [...prev.routeVisitLogs, createEmptyRouteEntry()] }))
  const removeRouteEntry = (id: string) => { if (formData.routeVisitLogs.length > 1) setFormData(prev => ({ ...prev, routeVisitLogs: prev.routeVisitLogs.filter(e => e.id !== id) })) }
  const updateRouteEntry = (id: string, updates: Partial<RouteVisitEntry>) => setFormData(prev => ({ ...prev, routeVisitLogs: prev.routeVisitLogs.map(e => e.id === id ? { ...e, ...updates } : e) }))

  const handleSave = () => {
    if (!db || !user) return;
    const reportData = {
      type: reportType === "route-visit" ? "Route Visit" : reportType === "field-visit" ? "Field Visit" : "Daily Office Work",
      date: formData.reportDate,
      reportDate: formData.reportDate,
      generatedByUserId: user.uid,
      summary: formData.reportHeading,
      overallSummary: formData.reportHeading,
      fullData: { ...formData, reportType, name: formData.name || user.displayName || "सुपरवायझर" },
      updatedAt: new Date().toISOString()
    }
    if (editId) updateDocumentNonBlocking(doc(db, 'users', user.uid, 'dailyWorkReports', editId), reportData)
    else addDocumentNonBlocking(collection(db, 'users', user.uid, 'dailyWorkReports'), { ...reportData, createdAt: new Date().toISOString() })
    toast({ title: "यशस्वी", description: "अहवाल जतन झाला." })
    router.push('/reports')
  }

  if (!mounted || isReportLoading) return <div className="p-20 text-center font-black uppercase text-[10px] opacity-50 animate-pulse">लोड होत आहे...</div>

  return (
    <div className="compact-form-container px-1 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b pb-2 mb-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/reports')} className="h-8 w-8 shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="min-w-0"><h2 className="text-sm font-black uppercase truncate flex items-center gap-1.5"><ClipboardCheck className="h-4 w-4 text-primary" /> दैनिक अहवाल</h2></div>
      </div>

      <Card className="compact-card p-3 border-primary/20 bg-primary/5 mb-3">
        <div className="space-y-1"><Label className="compact-label text-primary">अहवालाचे शीर्षक (Report Heading) *</Label><Input className="compact-input h-10 border-primary/20 font-black text-primary text-base" value={formData.reportHeading} onChange={e => setFormData({...formData, reportHeading: e.target.value})} /></div>
      </Card>

      <Card className="compact-card p-3 mb-3"><div className="grid grid-cols-2 gap-3">
        <div className="space-y-0.5"><Label className="compact-label">तारीख</Label><Input className="compact-input h-8 bg-muted/20 border-none font-black" type="date" value={formData.reportDate || ""} onChange={e => setFormData({...formData, reportDate: e.target.value})} /></div>
        <div className="space-y-1"><Label className="compact-label">शिफ्ट</Label><RadioGroup value={formData.shift || "सकाळ"} onValueChange={v => setFormData({...formData, shift: v})} className="flex gap-2"><div className="compact-radio-item p-1"><RadioGroupItem value="सकाळ" id="sakal" className="h-2.5 w-2.5" /><Label htmlFor="sakal" className="compact-radio-label">सकाळ</Label></div><div className="compact-radio-item p-1"><RadioGroupItem value="संध्याकाळ" id="sandhya" className="h-2.5 w-2.5" /><Label htmlFor="sandhya" className="compact-radio-label">संध्याकाळ</Label></div></RadioGroup></div>
      </div></Card>

      <Tabs value={reportType} onValueChange={setReportType} className="w-full">
        <TabsList className="grid grid-cols-3 w-full mb-3 bg-muted/30 p-1 h-9 rounded-xl"><TabsTrigger value="route-visit" className="text-[9px] font-black gap-1.5"><Truck className="h-3 w-3" /> रूट व्हिजिट</TabsTrigger><TabsTrigger value="field-visit" className="text-[9px] font-black gap-1.5"><MapPin className="h-3 w-3" /> क्षेत्र भेट</TabsTrigger><TabsTrigger value="office-work" className="text-[9px] font-black gap-1.5"><Briefcase className="h-3 w-3" /> ऑफिस काम</TabsTrigger></TabsList>

        <TabsContent value="route-visit" className="space-y-3">
          <Card className="compact-card p-3 grid grid-cols-2 gap-2"><div className="space-y-0.5"><Label className="compact-label">SLIP No.</Label><Input className="compact-input h-8" value={formData.slipNo || ""} onChange={e => setFormData({...formData, slipNo: e.target.value})} /></div><div className="space-y-0.5"><Label className="compact-label">रूट नाव</Label><Input className="compact-input h-8" value={formData.routeName || ""} onChange={e => setFormData({...formData, routeName: e.target.value})} /></div><div className="space-y-0.5"><Label className="compact-label">वाहन क्र.</Label><Input className="compact-input h-8" value={formData.vehicleNumber || ""} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} /></div><div className="space-y-0.5"><Label className="compact-label">ड्रायव्हर नाव</Label><Input className="compact-input h-8" value={formData.driverName || ""} onChange={e => setFormData({...formData, driverName: e.target.value})} /></div></Card>
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1"><span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1.5"><ListPlus className="h-3 w-3" /> व्हिजिट लॉग</span><Button type="button" size="sm" onClick={addRouteEntry} className="h-7 text-[9px] px-3 rounded-lg font-black uppercase"><Plus className="h-3 w-3 mr-1" /> केंद्र जोडा</Button></div>
            {formData.routeVisitLogs.map((entry, index) => (
              <Card key={entry.id} className="compact-card p-3 relative border-primary/10">
                <div className="flex justify-between items-center mb-2"><span className="text-[9px] font-black text-muted-foreground opacity-40"># {index + 1}</span><Button type="button" variant="ghost" size="icon" onClick={() => removeRouteEntry(entry.id)} className="h-6 w-6 text-rose-400"><Trash2 className="h-3.5 w-3.5" /></Button></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2 flex gap-2"><div className="space-y-0.5 w-20"><Label className="text-[8px] font-black uppercase opacity-50">कोड</Label><Input className="compact-input h-8" value={entry.centerCode || ""} onChange={e => updateRouteEntry(entry.id, { centerCode: e.target.value })} /></div><div className="space-y-0.5 flex-1"><Label className="text-[8px] font-black uppercase opacity-50">केंद्राचे नाव</Label><Input className="compact-input h-8" value={entry.supplierName || ""} onChange={e => updateRouteEntry(entry.id, { supplierName: e.target.value })} /></div></div>
                  <div className="space-y-0.5"><Label className="compact-label">वेळ (IN/OUT)</Label><div className="flex gap-1"><Input className="compact-input h-8 text-center" type="time" value={entry.arrivalTime || ""} onChange={e => updateRouteEntry(entry.id, { arrivalTime: e.target.value })} /><Input className="compact-input h-8 text-center" type="time" value={entry.departureTime || ""} onChange={e => updateRouteEntry(entry.id, { departureTime: e.target.value })} /></div></div>
                  <div className="space-y-0.5"><Label className="compact-label">कॅन (E/F)</Label><div className="flex gap-1"><Input className="compact-input h-8 text-center" placeholder="E" value={entry.emptyCans || ""} onChange={e => updateRouteEntry(entry.id, { emptyCans: e.target.value })} /><Input className="compact-input h-8 text-center font-black text-primary" placeholder="F" value={entry.fullCans || ""} onChange={e => updateRouteEntry(entry.id, { fullCans: e.target.value })} /></div></div>
                  <div className="space-y-0.5 col-span-2"><Label className="compact-label">बर्फ वापर</Label><Input className="compact-input h-8" value={entry.iceUsed || ""} onChange={e => updateRouteEntry(entry.id, { iceUsed: e.target.value })} /></div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="field-visit" className="space-y-3">
          <Card className="compact-card p-3 space-y-4">
            <div className="space-y-2"><Label className="compact-label">कोणाची भेट घेतली?</Label><Input value={formData.visitPerson || ""} onChange={e => setFormData({...formData, visitPerson: e.target.value})} className="compact-input h-9" /></div>
            <div className="space-y-2"><Label className="compact-label">भेटीचा मुख्य उद्देश</Label><Input value={formData.visitPurpose || ""} onChange={e => setFormData({...formData, visitPurpose: e.target.value})} className="compact-input h-9" /></div>
            <div className="space-y-2"><Label className="compact-label">झालेली सविस्तर चर्चा</Label><Textarea value={formData.visitDiscussion || ""} onChange={e => setFormData({...formData, visitDiscussion: e.target.value})} className="min-h-[80px] text-[11px] bg-slate-50 border-none rounded-lg p-2" /></div>
          </Card>
        </TabsContent>

        <TabsContent value="office-work" className="space-y-3">
          <Card className="compact-card p-3 space-y-4">
            <div className="space-y-2"><Label className="compact-label">कामाचा मुख्य विषय</Label><Input value={formData.officeTaskSubject || ""} onChange={e => setFormData({...formData, officeTaskSubject: e.target.value})} className="compact-input h-9" /></div>
            <div className="space-y-2"><Label className="compact-label">कामाचा सविस्तर गोषवारा</Label><Textarea value={formData.officeTaskDetails || ""} onChange={e => setFormData({...formData, officeTaskDetails: e.target.value})} className="min-h-[100px] text-[11px] bg-slate-50 border-none rounded-lg p-2" /></div>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-none shadow-xl bg-slate-900 text-white rounded-2xl overflow-hidden mt-4">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1"><Label className="text-[9px] font-black uppercase text-emerald-400">आजची मोठी कामगिरी</Label><Textarea value={formData.achievements || ""} onChange={e => setFormData({...formData, achievements: e.target.value})} className="min-h-[50px] text-[10px] rounded-xl bg-white/10 border-none p-2 text-white" /></div>
            <div className="space-y-1"><Label className="text-[9px] font-black uppercase text-rose-400">महत्त्वाच्या समस्या</Label><Textarea value={formData.problems || ""} onChange={e => setFormData({...formData, problems: e.target.value})} className="min-h-[50px] text-[10px] rounded-xl bg-white/10 border-none p-2 text-white" /></div>
            <div className="space-y-1"><Label className="text-[9px] font-black uppercase text-blue-400">केलेली कार्यवाही</Label><Textarea value={formData.actionsTaken || ""} onChange={e => setFormData({...formData, actionsTaken: e.target.value})} className="min-h-[50px] text-[10px] rounded-xl bg-white/10 border-none p-2 text-white" /></div>
            <div className="space-y-1"><Label className="text-[9px] font-black uppercase text-slate-400">सुपरवायझरचे नाव</Label><Input value={formData.supervisorName || ""} onChange={e => setFormData({...formData, supervisorName: e.target.value})} className="h-9 text-[10px] rounded-xl bg-white/10 border-none px-2 text-white" /></div>
          </div>
          <Button type="button" onClick={handleSave} className="w-full font-black h-12 rounded-xl shadow-2xl bg-primary text-white text-xs uppercase tracking-widest">{editId ? <RefreshCw className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />} अहवाल जतन करा</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DailyReportPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black uppercase text-[10px] opacity-50 animate-pulse">लोड होत आहे...</div>}><DailyReportForm /></Suspense>
  )
}
