"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft, Save, Truck, Plus, Trash2, RefreshCw, Layers, CopyCheck, LayoutList, Settings2, AlertCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, addDocumentNonBlocking, useDoc, useMemoFirebase, updateDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { cn } from "@/lib/utils"

interface AllocationEntry {
  id: string;
  routeId: string;
  routeCode: string;
  routeName: string;
  requested: boolean;
  allocated: boolean;
}

const AllocationSection = ({ 
  title, 
  section, 
  color, 
  data, 
  isManageMode, 
  onAdd, 
  onUpdate, 
  onRemove 
}: { 
  title: string, 
  section: string, 
  color: string, 
  data: AllocationEntry[], 
  isManageMode: boolean,
  onAdd: (s: string) => void,
  onUpdate: (s: string, id: string, u: Partial<AllocationEntry>) => void,
  onRemove: (s: string, id: string) => void
}) => (
  <Card className="compact-card p-3 border-muted-foreground/10 text-left">
    <div className="flex items-center justify-between border-b pb-1 mb-2">
      <h3 className={`text-[10px] font-black uppercase ${color} tracking-widest flex items-center gap-1.5`}>
        <Layers className="h-3 w-3" /> {title}
      </h3>
      {isManageMode && (
        <Button size="sm" variant="outline" onClick={() => onAdd(section)} className="h-6 text-[8px] font-black uppercase px-2 rounded-lg border-primary/20 text-primary">
          <Plus className="h-3 w-3 mr-1" /> जोडा
        </Button>
      )}
    </div>
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-1 px-1 text-[7px] font-black uppercase text-muted-foreground text-center">
        <div className="col-span-2">ID</div>
        <div className="col-span-2">Code</div>
        <div className={cn(isManageMode ? "col-span-7" : "col-span-4", "text-left")}>Route Name</div>
        {!isManageMode && <div className="col-span-2">Req</div>}
        {!isManageMode && <div className="col-span-2">Alloc</div>}
        {isManageMode && <div className="col-span-1"></div>}
      </div>
      {data.map((entry) => (
        <div key={entry.id} className="grid grid-cols-12 gap-1 items-center bg-muted/5 p-1 rounded-lg border border-muted-foreground/5">
          {isManageMode ? (
            <>
              <Input 
                value={entry.routeId || ""} 
                onChange={e => onUpdate(section, entry.id, { routeId: e.target.value })} 
                placeholder="ID"
                className="col-span-2 h-8 text-[10px] p-1 bg-white border-none font-black shadow-inner text-center" 
              />
              <Input 
                value={entry.routeCode || ""} 
                onChange={e => onUpdate(section, entry.id, { routeCode: e.target.value })} 
                placeholder="Code"
                className="col-span-2 h-8 text-[10px] p-1 bg-white border-none font-black shadow-inner text-center" 
              />
              <Input 
                value={entry.routeName || ""} 
                onChange={e => onUpdate(section, entry.id, { routeName: e.target.value })} 
                placeholder="Route Name"
                className="col-span-7 h-8 text-[10px] p-1 bg-white border-none font-bold shadow-inner" 
              />
              <div className="col-span-1 flex justify-end">
                <Button variant="ghost" size="icon" onClick={() => onRemove(section, entry.id)} className="h-7 w-7 text-rose-400">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="col-span-2 text-[9px] font-black truncate px-1 text-center">{entry.routeId || "---"}</div>
              <div className="col-span-2 text-[9px] font-black truncate px-1 text-center">{entry.routeCode || "---"}</div>
              <div className="col-span-4 text-[10px] font-bold truncate px-1 uppercase text-left">{entry.routeName || "---"}</div>
              <div className="col-span-2 flex justify-center">
                <input 
                  type="checkbox" 
                  checked={entry.requested} 
                  onChange={e => onUpdate(section, entry.id, { requested: e.target.checked })} 
                  className="h-4 w-4 accent-primary cursor-pointer" 
                />
              </div>
              <div className="col-span-2 flex justify-center">
                <input 
                  type="checkbox" 
                  checked={entry.allocated} 
                  onChange={e => onUpdate(section, entry.id, { allocated: e.target.checked })} 
                  className="h-4 w-4 accent-primary cursor-pointer" 
                />
              </div>
            </>
          )}
        </div>
      ))}
      {data.length === 0 && (
        <p className="text-[8px] text-center italic opacity-30 py-2">रूट यादी कोरी आहे. 'लिस्ट बदल करा' वर क्लिक करून रूट जोडा.</p>
      )}
    </div>
  </Card>
);

function RouteAllocationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const editId = searchParams.get('edit')

  const [mounted, setMounted] = useState(false)
  const [isManageMode, setIsManageMode] = useState(false) 
  
  const [formData, setFormData] = useState({
    reportHeading: "Daily Tanker & Can Route Request & Allocation Report",
    date: new Date().toISOString().split('T')[0],
    morningRoutes: [] as AllocationEntry[],
    eveningRoutes: [] as AllocationEntry[],
    tankerRoutes: [] as AllocationEntry[],
    extCanRoutes: [] as AllocationEntry[],
    extTankerRoutes: [] as AllocationEntry[],
    dailyProblems: ""
  })

  const templateRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, 'users', user.uid, 'settings', 'routeAllocationTemplate')
  }, [db, user])

  const reportRef = useMemoFirebase(() => {
    if (!db || !user || !editId) return null
    return doc(db, 'users', user.uid, 'dailyWorkReports', editId)
  }, [db, user, editId])

  const { data: templateData } = useDoc(templateRef)
  const { data: existingReport, isLoading } = useDoc(reportRef)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (templateData && !editId && mounted) {
      setFormData(prev => ({
        ...prev,
        morningRoutes: (templateData.morningRoutes || []).map((r: any) => ({ ...r, requested: false, allocated: false })),
        eveningRoutes: (templateData.eveningRoutes || []).map((r: any) => ({ ...r, requested: false, allocated: false })),
        tankerRoutes: (templateData.tankerRoutes || []).map((r: any) => ({ ...r, requested: false, allocated: false })),
        extCanRoutes: (templateData.extCanRoutes || []).map((r: any) => ({ ...r, requested: false, allocated: false })),
        extTankerRoutes: (templateData.extTankerRoutes || []).map((r: any) => ({ ...r, requested: false, allocated: false })),
      }))
    }
  }, [templateData, editId, mounted])

  useEffect(() => {
    if (existingReport && existingReport.fullData) {
      setFormData(prev => ({ ...prev, ...existingReport.fullData }))
    }
  }, [existingReport])

  const handleAddEntry = useCallback((section: string) => {
    const newEntry: AllocationEntry = {
      id: crypto.randomUUID(),
      routeId: "",
      routeCode: "",
      routeName: "",
      requested: false,
      allocated: false
    }
    setFormData(prev => ({ 
      ...prev, 
      [section]: [...(prev[section as keyof typeof prev] as AllocationEntry[]), newEntry] 
    }))
  }, [])

  const handleUpdateEntry = useCallback((section: string, id: string, updates: Partial<AllocationEntry>) => {
    setFormData(prev => ({
      ...prev,
      [section]: (prev[section as keyof typeof prev] as AllocationEntry[]).map(e => e.id === id ? { ...e, ...updates } : e)
    }))
  }, [])

  const handleRemoveEntry = useCallback((section: string, id: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: (prev[section as keyof typeof prev] as AllocationEntry[]).filter(e => e.id !== id)
    }))
  }, [])

  const saveAsTemplate = () => {
    if (!db || !user || !templateRef) return
    const template = {
      morningRoutes: formData.morningRoutes.map(({ id, routeId, routeCode, routeName }) => ({ id, routeId, routeCode, routeName })),
      eveningRoutes: formData.eveningRoutes.map(({ id, routeId, routeCode, routeName }) => ({ id, routeId, routeCode, routeName })),
      tankerRoutes: formData.tankerRoutes.map(({ id, routeId, routeCode, routeName }) => ({ id, routeId, routeCode, routeName })),
      extCanRoutes: formData.extCanRoutes.map(({ id, routeId, routeCode, routeName }) => ({ id, routeId, routeCode, routeName })),
      extTankerRoutes: formData.extTankerRoutes.map(({ id, routeId, routeCode, routeName }) => ({ id, routeId, routeCode, routeName })),
      updatedAt: new Date().toISOString()
    }
    setDocumentNonBlocking(templateRef, template, { merge: true })
    toast({ title: "टेम्पलेट जतन झाले", description: "पुढच्या वेळी हे रूट्स आपोआप येतील." })
    setIsManageMode(false)
  }

  const handleSave = () => {
    if (!db || !user) return
    
    const reportData = {
      type: 'Route Allocation Report',
      date: formData.date,
      reportDate: formData.date,
      generatedByUserId: user.uid,
      summary: formData.reportHeading,
      overallSummary: formData.reportHeading,
      fullData: { ...formData, name: user.displayName || "सुपरवायझर" },
      updatedAt: new Date().toISOString()
    }

    if (editId) {
      const docRef = doc(db, 'users', user.uid, 'dailyWorkReports', editId)
      updateDocumentNonBlocking(docRef, reportData)
      toast({ title: "यशस्वी", description: "अहवाल अपडेट झाला." })
    } else {
      addDocumentNonBlocking(collection(db, 'users', user.uid, 'dailyWorkReports'), {
        ...reportData,
        createdAt: new Date().toISOString()
      })
      toast({ title: "यशस्वी", description: "अहवाल जतन झाला." })
    }
    router.push('/reports')
  }

  if (!mounted || isLoading) return <div className="p-20 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="compact-form-container max-w-[650px] pb-20 px-2">
      <div className="flex items-center gap-2 border-b pb-2 mb-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/reports')} className="h-8 w-8 shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="min-w-0 text-left">
          <h2 className="text-sm font-black uppercase truncate flex items-center gap-1.5"><Truck className="h-4 w-4 text-primary" /> ERP रिपोर्ट</h2>
          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{formData.date}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4 bg-white p-1 rounded-xl border border-muted-foreground/10 shadow-sm">
        <Button 
          variant={!isManageMode ? "default" : "ghost"} 
          className="flex-1 h-9 font-black uppercase text-[9px] rounded-lg gap-1.5"
          onClick={() => setIsManageMode(false)}
        >
          <LayoutList className="h-3.5 w-3.5" /> रूट लिस्ट पहा
        </Button>
        <Button 
          variant={isManageMode ? "default" : "ghost"} 
          className="flex-1 h-9 font-black uppercase text-[9px] rounded-lg gap-1.5"
          onClick={() => setIsManageMode(true)}
        >
          <Settings2 className="h-3.5 w-3.5" /> लिस्ट बदल करा
        </Button>
      </div>

      <div className="space-y-3">
        <Card className="compact-card p-3 border-primary/20 bg-primary/5 text-left">
          <div className="space-y-1">
            <Label className="compact-label text-primary">अहवालाचे शीर्षक *</Label>
            <Input className="compact-input h-10 border-primary/20 font-black text-primary text-base" value={formData.reportHeading} onChange={e => setFormData({...formData, reportHeading: e.target.value})} />
          </div>
        </Card>

        <Card className="compact-card p-3 text-left"><div className="space-y-0.5"><Label className="compact-label">तारीख</Label><Input type="date" className="compact-input h-9" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div></Card>

        <AllocationSection title="Can Route Morning (Internal)" section="morningRoutes" color="text-blue-600" data={formData.morningRoutes} isManageMode={isManageMode} onAdd={handleAddEntry} onUpdate={handleUpdateEntry} onRemove={handleRemoveEntry} />
        <AllocationSection title="Can Route Evening (Internal)" section="eveningRoutes" color="text-indigo-600" data={formData.eveningRoutes} isManageMode={isManageMode} onAdd={handleAddEntry} onUpdate={handleUpdateEntry} onRemove={handleRemoveEntry} />
        <AllocationSection title="Internal Tanker Route" section="tankerRoutes" color="text-rose-600" data={formData.tankerRoutes} isManageMode={isManageMode} onAdd={handleAddEntry} onUpdate={handleUpdateEntry} onRemove={handleRemoveEntry} />
        <AllocationSection title="External Can Route" section="extCanRoutes" color="text-emerald-600" data={formData.extCanRoutes} isManageMode={isManageMode} onAdd={handleAddEntry} onUpdate={handleUpdateEntry} onRemove={handleRemoveEntry} />
        <AllocationSection title="External Tanker Route" section="extTankerRoutes" color="text-amber-600" data={formData.extTankerRoutes} isManageMode={isManageMode} onAdd={handleAddEntry} onUpdate={handleUpdateEntry} onRemove={handleRemoveEntry} />

        {!isManageMode && (
          <Card className="compact-card p-3 border-rose-100 bg-rose-50/20">
            <div className="space-y-1">
              <Label className="compact-label text-rose-600 flex items-center gap-1.5"><AlertCircle className="h-3 w-3" /> आजचे महत्त्वाचे प्रॉब्लेम्स / निरीक्षणे (Daily Text Pad)</Label>
              <Textarea 
                value={formData.dailyProblems} 
                onChange={e => setFormData({...formData, dailyProblems: e.target.value})} 
                className="min-h-[100px] text-[11px] font-bold bg-white border border-rose-100 rounded-lg p-3 shadow-inner"
                placeholder="उदा. गाडी वेळेवर आली नाही, केंद्रावरील काटा बंद आहे इ."
              />
            </div>
          </Card>
        )}

        <div className="flex flex-col gap-2 pt-4">
          {isManageMode ? (
            <Button type="button" onClick={saveAsTemplate} className="w-full h-11 font-black uppercase text-[10px] tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
              <CopyCheck className="h-4 w-4 mr-2" /> ही यादी टेम्पलेट म्हणून जतन करा
            </Button>
          ) : (
            <Button onClick={handleSave} className="w-full bg-primary text-white shadow-xl shadow-primary/20 h-12 uppercase font-black tracking-widest rounded-xl transition-all active:scale-95">
              {editId ? <RefreshCw className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />} {editId ? 'अहवाल अद्ययावत करा' : 'अहवाल जतन करा (SUBMIT)'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RouteAllocationPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>}>
      <RouteAllocationForm />
    </Suspense>
  )
}
