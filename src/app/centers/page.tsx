"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Warehouse, Plus, Search, MapPin, Edit, X, ChevronRight,
  Laptop, Zap, Sun, Box, Milk, ShieldCheck, Wallet, User, Printer, CheckCircle2, FlaskConical, Trash2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Supplier, EquipmentItem, SupplierType } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc, query, where } from "firebase/firestore"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CentersPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const centersQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, 'users', user.uid, 'suppliers'), where('supplierType', '==', 'Center'))
  }, [db, user])

  const { data: centers, isLoading } = useCollection<Supplier>(centersQuery)

  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedCenter, setSelectedCenter] = useState<Supplier | null>(null)
  
  const [formData, setFormData] = useState({
    name: "", supplierId: "", operatorName: "", mobile: "", address: "", routeId: "",
    fssaiNumber: "", fssaiExpiry: "",
    cowQty: "0", cowFat: "0", cowSnf: "0",
    bufQty: "0", bufFat: "0", bufSnf: "0",
    iceBlocks: "0", cattleFeedBrand: "", competition: "", paymentCycle: "10 Days",
    spaceOwnership: "Self" as 'Self' | 'Rented', hygieneGrade: "A",
    additionalNotes: "",
    scaleBrand: "", fatMachineBrand: "", chemicalsStock: "",
    batteryCondition: "", milkCansCount: "0",
    computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
    adulterationKitInfo: "",
    equipment: [] as EquipmentItem[]
  })

  useEffect(() => setMounted(true), [])

  const handleOpenAdd = () => {
    setDialogMode('add')
    setEditingId(null)
    setFormData({
      name: "", supplierId: "", operatorName: "", mobile: "", address: "", routeId: "",
      fssaiNumber: "", fssaiExpiry: "", cowQty: "0", cowFat: "0", cowSnf: "0",
      bufQty: "0", bufFat: "0", bufSnf: "0", iceBlocks: "0", cattleFeedBrand: "",
      competition: "", paymentCycle: "10 Days", spaceOwnership: "Self", hygieneGrade: "A",
      additionalNotes: "", scaleBrand: "", fatMachineBrand: "",
      chemicalsStock: "", batteryCondition: "", milkCansCount: "0",
      computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
      adulterationKitInfo: "",
      equipment: []
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (center: Supplier) => {
    setDialogMode('edit')
    setEditingId(center.id)
    setFormData({
      name: center.name || "", supplierId: center.supplierId || "", operatorName: center.operatorName || "",
      mobile: center.mobile || "", address: center.address || center.village || "", routeId: center.routeId || "",
      fssaiNumber: center.fssaiNumber || "", fssaiExpiry: center.fssaiExpiry || "",
      cowQty: String(center.cowMilk?.quantity || 0),
      cowFat: String(center.cowMilk?.fat || 0),
      cowSnf: String(center.cowMilk?.snf || 0),
      bufQty: String(center.buffaloMilk?.quantity || 0),
      bufFat: String(center.buffaloMilk?.fat || 0),
      bufSnf: String(center.buffaloMilk?.snf || 0),
      iceBlocks: String(center.iceBlocks || 0),
      cattleFeedBrand: center.cattleFeedBrand || "",
      competition: center.competition || "",
      paymentCycle: center.paymentCycle || "10 Days",
      spaceOwnership: center.spaceOwnership || "Self",
      hygieneGrade: center.hygieneGrade || "A",
      additionalNotes: center.additionalNotes || center.additionalInfo || "",
      scaleBrand: center.scaleBrand || "",
      fatMachineBrand: center.fatMachineBrand || "",
      chemicalsStock: center.chemicalsStock || "",
      batteryCondition: center.batteryCondition || "",
      milkCansCount: String(center.milkCansCount || 0),
      computerAvailable: center.computerAvailable || false,
      upsInverterAvailable: center.upsInverterAvailable || false,
      solarAvailable: center.solarAvailable || false,
      adulterationKitInfo: center.adulterationKitInfo || "",
      equipment: center.equipment || []
    })
    setIsDialogOpen(true)
  }

  const handleSaveCenter = () => {
    if (!formData.name || !formData.supplierId || !db || !user) {
      toast({ title: "त्रुटी", description: "नाव आणि आयडी आवश्यक आहे.", variant: "destructive" })
      return
    }

    const centerData = {
      ...formData, supplierType: 'Center' as SupplierType,
      cowMilk: { quantity: Number(formData.cowQty), fat: Number(formData.cowFat), snf: Number(formData.cowSnf) },
      buffaloMilk: { quantity: Number(formData.bufQty), fat: Number(formData.bufFat), snf: Number(formData.bufSnf) },
      iceBlocks: Number(formData.iceBlocks), milkCansCount: Number(formData.milkCansCount),
      updatedAt: new Date().toISOString()
    }

    if (dialogMode === 'add') {
      addDocumentNonBlocking(collection(db, 'users', user.uid, 'suppliers'), centerData)
      toast({ title: "यशस्वी", description: "नवीन केंद्र जोडण्यात आले." })
    } else if (editingId) {
      updateDocumentNonBlocking(doc(db, 'users', user.uid, 'suppliers', editingId), centerData)
      toast({ title: "यशस्वी", description: "केंद्राची माहिती अपडेट झाली." })
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    if (!db || !user) return
    if (confirm("तुम्हाला खात्री आहे की हे केंद्र हटवायचे आहे?")) {
      deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'suppliers', id))
      setSelectedCenter(null)
      toast({ title: "यशस्वी", description: "केंद्र हटवण्यात आले." })
    }
  }

  const addEquipmentRow = () => {
    setFormData({ ...formData, equipment: [...formData.equipment, { id: crypto.randomUUID(), name: "", quantity: 1, ownership: 'Company' }] })
  }

  const updateEquipmentRow = (id: string, updates: Partial<EquipmentItem>) => {
    setFormData({ ...formData, equipment: formData.equipment.map(e => e.id === id ? { ...e, ...updates } : e) })
  }

  const removeEquipmentRow = (id: string) => {
    setFormData({ ...formData, equipment: formData.equipment.filter(e => e.id !== id) })
  }

  const filteredCenters = useMemo(() => {
    return (centers || []).filter(center => {
      const q = searchQuery.toLowerCase()
      return center.name?.toLowerCase().includes(q) || center.supplierId?.toString().includes(q)
    })
  }, [centers, searchQuery])

  if (!mounted || isLoading) return <div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="space-y-4 max-w-4xl mx-auto w-full pb-10 px-2 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b pb-4 no-print text-center sm:text-left">
        <div className="min-w-0">
          <h2 className="text-xl font-black text-foreground flex items-center justify-center sm:justify-start gap-2 uppercase tracking-tight">
            <Warehouse className="h-6 w-6 text-primary" /> संकलन केंद्र (CENTERS)
          </h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Profile & Inventory</p>
        </div>
        <Button type="button" onClick={handleOpenAdd} size="sm" className="w-full sm:w-auto font-black h-10 text-[10px] rounded-xl px-6 uppercase shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-1.5" /> नवीन केंद्र
        </Button>
      </div>

      <div className="flex flex-col items-center space-y-4 w-full">
        <Card className="border shadow-2xl bg-white rounded-2xl overflow-hidden border-muted-foreground/10 no-print w-full">
          <div className="p-3 border-b bg-muted/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
              <input placeholder="केंद्राचे नाव किंवा कोड शोधा..." className="w-full pl-9 h-10 text-[12px] bg-white border border-muted-foreground/10 rounded-xl font-black uppercase outline-none focus:ring-2 focus:ring-primary shadow-inner" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <ScrollArea className="h-[200px]">
            <div className="divide-y divide-muted-foreground/5">
              {filteredCenters.map(center => (
                <div key={center.id} className={`p-3 cursor-pointer hover:bg-muted/50 flex justify-between items-center transition-colors ${selectedCenter?.id === center.id ? 'bg-primary/5 border-l-4 border-primary' : ''}`} onClick={() => setSelectedCenter(center)}>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-[12px] text-slate-900 truncate uppercase tracking-tight">{center.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="secondary" className="text-[8px] font-black h-4 px-1.5 rounded-md bg-muted/50 border-none">{center.supplierId}</Badge>
                      <span className="text-[9px] text-muted-foreground truncate flex items-center gap-1 font-bold">
                        <MapPin className="h-3 w-3" /> {center.address || "पत्ता नाही"}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {selectedCenter && (
          <div className="bg-white font-sans text-slate-900 border-[1.5px] border-black rounded-sm w-full max-w-[210mm] mx-auto p-8 printable-report flex flex-col items-center shadow-none mb-4 animate-in slide-in-from-right-2 duration-300">
            <div className="w-full flex items-center justify-between no-print mb-4 border-b pb-2">
              <Badge className="bg-primary/10 text-primary border-none uppercase text-[10px] font-black">CENTER PROFILE REPORT</Badge>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 rounded-xl font-black uppercase text-[10px]" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1.5" /> प्रिंट</Button>
                <Button variant="outline" size="sm" className="h-8 rounded-xl font-black uppercase text-[10px]" onClick={() => handleOpenEdit(selectedCenter)}><Edit className="h-4 w-4 mr-1.5" /> बदल करा</Button>
                <Button variant="outline" size="sm" className="h-8 rounded-xl font-black uppercase text-[10px] text-destructive border-destructive/20" onClick={() => handleDelete(selectedCenter.id)}><Trash2 className="h-4 w-4 mr-1.5" /> हटवा</Button>
                <Button variant="ghost" size="icon" onClick={() => setSelectedCenter(null)} className="h-8 w-8 text-slate-400 hover:bg-slate-100 rounded-xl"><X className="h-5 w-5" /></Button>
              </div>
            </div>

            <div className="w-full border-b-[4px] border-black pb-3 mb-6 text-center">
              <h3 className="text-[20pt] font-black uppercase text-primary tracking-[0.1em]">{selectedCenter.name}</h3>
              <p className="text-[11pt] font-black text-muted-foreground uppercase tracking-widest mt-1">आयडी: {selectedCenter.supplierId} | संकलन केंद्र अधिकृत अहवाल</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 w-full mb-6 text-left">
              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase text-primary tracking-[0.2em] border-b-2 border-black pb-1 mb-2">१) प्राथमिक माहिती (PRIMARY)</h4>
                <div className="space-y-2 text-[12px] font-bold">
                  <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">ऑपरेटर नाव</span><span>{selectedCenter.operatorName || "-"}</span></div>
                  <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">मोबाईल नंबर</span><span>{selectedCenter.mobile || "-"}</span></div>
                  <div className="flex flex-col gap-1"><span className="text-muted-foreground uppercase text-[10px]">पूर्ण पत्ता</span><span className="leading-relaxed">{selectedCenter.address || "-"}</span></div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase text-primary tracking-[0.2em] border-b-2 border-black pb-1 mb-2">२) परवाना व तांत्रिक (TECHNICAL)</h4>
                <div className="space-y-2 text-[12px] font-bold">
                  <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">FSSAI क्र.</span><span>{selectedCenter.fssaiNumber || "-"}</span></div>
                  <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">काटा ब्रँड नाव</span><span>{selectedCenter.scaleBrand || "-"}</span></div>
                  <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">मशीन ब्रँड</span><span>{selectedCenter.fatMachineBrand || "-"}</span></div>
                  <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">बॅटरी स्थिती</span><span>{selectedCenter.batteryCondition || "-"}</span></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 w-full mb-6 text-left">
              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase text-primary tracking-[0.2em] border-b-2 border-black pb-1 mb-2">३) व्यावसायिक माहिती (BUSINESS)</h4>
                <div className="space-y-2 text-[12px] font-bold">
                  <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">पेमेंट सायकल</span><span>{selectedCenter.paymentCycle || "10 Days"}</span></div>
                  <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">जागा मालकी</span><span>{selectedCenter.spaceOwnership === 'Self' ? 'स्वतःची' : 'भाड्याची'}</span></div>
                  <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">स्वच्छता ग्रेड</span><span className="font-black text-emerald-600 text-sm">{selectedCenter.hygieneGrade || "A"} GRADE</span></div>
                  <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">बर्फ लाद्या</span><span>{selectedCenter.iceBlocks || 0} नग</span></div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase text-blue-600 tracking-[0.2em] border-b-2 border-black pb-1 mb-2">४) दूध संकलन सारांश (MILK)</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-3 rounded-lg border-2 border-blue-600 flex justify-between items-center bg-blue-50/30">
                    <span className="text-[10px] font-black uppercase text-blue-600">गाय दूध (COW)</span>
                    <span className="text-base font-black">{selectedCenter.cowMilk?.quantity || 0} L <span className="text-[10px] opacity-60 ml-2">(F:{selectedCenter.cowMilk?.fat}% S:{selectedCenter.cowMilk?.snf}%)</span></span>
                  </div>
                  <div className="p-3 rounded-lg border-2 border-amber-600 flex justify-between items-center bg-amber-50/30">
                    <span className="text-[10px] font-black uppercase text-amber-600">म्हेस दूध (BUF)</span>
                    <span className="text-base font-black">{selectedCenter.buffaloMilk?.quantity || 0} L <span className="text-[10px] opacity-60 ml-2">(F:{selectedCenter.buffaloMilk?.fat}% S:{selectedCenter.buffaloMilk?.snf}%)</span></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full mb-8">
              <div className="p-3 border-2 border-black text-center rounded-lg bg-slate-50"><p className="text-[8px] font-black uppercase tracking-widest mb-1">POP / COMPUTER</p><p className="text-[12px] font-black">{selectedCenter.computerAvailable ? 'AVAILABLE' : 'NO'}</p></div>
              <div className="p-3 border-2 border-black text-center rounded-lg bg-slate-50"><p className="text-[8px] font-black uppercase tracking-widest mb-1">UPS / INVERTER</p><p className="text-[12px] font-black">{selectedCenter.upsInverterAvailable ? 'AVAILABLE' : 'NO'}</p></div>
              <div className="p-3 border-2 border-black text-center rounded-lg bg-slate-50"><p className="text-[8px] font-black uppercase tracking-widest mb-1">SOLAR SYSTEM</p><p className="text-[12px] font-black">{selectedCenter.solarAvailable ? 'AVAILABLE' : 'NO'}</p></div>
            </div>

            <div className="space-y-3 w-full text-left">
              <h4 className="text-[11px] font-black uppercase text-primary tracking-[0.2em] border-b-2 border-black pb-1 mb-2">५) साहित्याची यादी (INVENTORY ASSETS)</h4>
              <table className="w-full border-collapse border border-black shadow-sm">
                <thead>
                  <tr className="bg-slate-100 h-10">
                    <th className="p-3 border border-black text-left uppercase text-[10px] font-black w-[50%]">साहित्य नाव (Item)</th>
                    <th className="p-3 border border-black text-center uppercase text-[10px] font-black w-[15%]">नग</th>
                    <th className="p-3 border border-black text-right uppercase text-[10px] font-black w-[35%]">मालकी हक्क</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedCenter.equipment || []).map((it, idx) => (
                    <tr key={idx} className="font-bold border-b border-black h-10">
                      <td className="p-3 border border-black text-[12px] uppercase">{it.name}</td>
                      <td className="p-3 border border-black text-center text-[12px]">{it.quantity}</td>
                      <td className="p-3 border border-black text-right uppercase text-[10px]">{it.ownership === 'Self' ? 'स्वतःची' : 'डेअरीची'}</td>
                    </tr>
                  ))}
                  {(!selectedCenter.equipment || selectedCenter.equipment.length === 0) && (
                    <tr className="h-12"><td colSpan={3} className="p-4 text-center italic text-[11px] opacity-50 border border-black">कोणतेही साहित्य नोंदवलेले नाही.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="w-full mt-auto pt-24 grid grid-cols-2 gap-24 text-center uppercase font-black text-[11pt] tracking-[0.2em]">
              <div className="border-t-2 border-black pt-3">अधिकृत स्वाक्षरी</div>
              <div className="border-t-2 border-black pt-3">सुपरवायझर स्वाक्षरी</div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[600px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white">
          <DialogHeader className="p-4 bg-primary text-white sticky top-0 z-10">
            <DialogTitle className="text-base font-black uppercase tracking-widest">{dialogMode === 'add' ? 'नवीन केंद्र' : 'केंद्राची माहिती अद्ययावत करा'}</DialogTitle>
            <DialogDescription className="text-[9px] text-white/70 uppercase">केंद्राचा सविस्तर तपशील भरा.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] p-6 text-left">
            <div className="space-y-6 pb-10">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 flex items-center gap-2"><User className="h-4 w-4" /> १) प्राथमिक माहिती</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5 col-span-2"><Label className="text-[10px] font-black uppercase text-muted-foreground">केंद्राचे नाव *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">केंद्र आयडी (ID) *</Label><Input value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">ऑपरेटर नाव</Label><Input value={formData.operatorName} onChange={e => setFormData({...formData, operatorName: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5 col-span-2"><Label className="text-[10px] font-black uppercase text-muted-foreground">पत्ता</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> २) परवाना व तांत्रिक</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">FSSAI क्र.</Label><Input value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">मुदत तारीख</Label><Input type="date" value={formData.fssaiExpiry} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">काटा ब्रँड</Label><Input value={formData.scaleBrand} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">मशीन ब्रँड</Label><Input value={formData.fatMachineBrand} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">रसायन स्टॉक</Label><Input value={formData.chemicalsStock} onChange={e => setFormData({...formData, chemicalsStock: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">बॅटरी स्थिती</Label><Input value={formData.batteryCondition} onChange={e => setFormData({...formData, batteryCondition: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 flex items-center gap-2"><Wallet className="h-4 w-4" /> ३) व्यावसायिक व दूध तपशील</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">पेमेंट सायकल</Label><Input value={formData.paymentCycle} onChange={e => setFormData({...formData, paymentCycle: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">जागा</Label>
                      <Select value={formData.spaceOwnership} onValueChange={(v: 'Self' | 'Rented') => setFormData({...formData, spaceOwnership: v})}>
                        <SelectTrigger className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl font-black"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Self" className="font-bold">स्वतःची</SelectItem><SelectItem value="Rented" className="font-bold">भाड्याची</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">स्वच्छता ग्रेड</Label>
                      <Select value={formData.hygieneGrade} onValueChange={(v: string) => setFormData({...formData, hygieneGrade: v})}>
                        <SelectTrigger className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="A" className="font-bold">A Grade</SelectItem><SelectItem value="B" className="font-bold">B Grade</SelectItem><SelectItem value="C" className="font-bold">C Grade</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">बर्फ लाद्या संख्या</Label><Input type="number" value={formData.iceBlocks} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">स्पर्धा</Label><Input value={formData.competition} onChange={e => setFormData({...formData, competition: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">पशुखाद्य</Label><Input value={formData.cattleFeedBrand} onChange={e => setFormData({...formData, cattleFeedBrand: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div className="col-span-3 text-[10px] font-black uppercase text-blue-600 mb-1">गाय (Qty/F/S)</div>
                    <Input type="number" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold rounded-lg" placeholder="Qty" />
                    <Input type="number" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold rounded-lg" placeholder="Fat" />
                    <Input type="number" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold rounded-lg" placeholder="SNF" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                    <div className="col-span-3 text-[10px] font-black uppercase text-amber-600 mb-1">म्हेस (Qty/F/S)</div>
                    <Input type="number" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold rounded-lg" placeholder="Qty" />
                    <Input type="number" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold rounded-lg" placeholder="Fat" />
                    <Input type="number" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold rounded-lg" placeholder="SNF" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 flex items-center gap-2"><Box className="h-4 w-4" /> ४) साहित्य व स्टेटस</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="flex flex-col items-center gap-2 p-3 bg-muted/10 rounded-xl cursor-pointer hover:bg-muted/20 transition-all border border-muted-foreground/5" onClick={() => setFormData({...formData, computerAvailable: !formData.computerAvailable})}>
                      <Laptop className={`h-5 w-5 ${formData.computerAvailable ? 'text-primary' : 'text-slate-400'}`} />
                      <Label className="text-[9px] font-black uppercase cursor-pointer">POP: {formData.computerAvailable ? 'हो' : 'नाही'}</Label>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 bg-muted/10 rounded-xl cursor-pointer hover:bg-muted/20 transition-all border border-muted-foreground/5" onClick={() => setFormData({...formData, upsInverterAvailable: !formData.upsInverterAvailable})}>
                      <Zap className={`h-5 w-5 ${formData.upsInverterAvailable ? 'text-amber-500' : 'text-slate-400'}`} />
                      <Label className="text-[9px] font-black uppercase cursor-pointer">UPS: {formData.upsInverterAvailable ? 'हो' : 'नाही'}</Label>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 bg-muted/10 rounded-xl cursor-pointer hover:bg-muted/20 transition-all border border-muted-foreground/5" onClick={() => setFormData({...formData, solarAvailable: !formData.solarAvailable})}>
                      <Sun className={`h-5 w-5 ${formData.solarAvailable ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <Label className="text-[9px] font-black uppercase cursor-pointer">सोलर: {formData.solarAvailable ? 'हो' : 'नाही'}</Label>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 bg-muted/10 rounded-xl cursor-pointer hover:bg-muted/20 transition-all border border-muted-foreground/5">
                      <Label className="text-[8px] font-black uppercase opacity-50">Cans</Label>
                      <Input type="number" value={formData.milkCansCount} onChange={e => setFormData({...formData, milkCansCount: e.target.value})} className="h-6 text-[10px] bg-white border-none rounded text-center" />
                    </div>
                  </div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">Adulteration Kit (भेसळ तपासणी कीट)</Label><Input value={formData.adulterationKitInfo} onChange={e => setFormData({...formData, adulterationKitInfo: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" placeholder="उदा. हो, चितळे कीट" /></div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between"><h4 className="text-[11px] font-black uppercase tracking-widest">साहित्याची यादी (INVENTORY)</h4><Button variant="outline" type="button" size="sm" onClick={addEquipmentRow} className="h-7 text-[9px] font-black px-3 rounded-xl border-primary/20 text-primary">जोडा</Button></div>
                    <div className="space-y-2">
                      {formData.equipment.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-muted/10 p-2 rounded-xl border border-muted-foreground/5">
                          <div className="col-span-6"><Input value={item.name} onChange={e => updateEquipmentRow(item.id, {name: e.target.value})} className="h-8 text-[11px] px-3 bg-white border-none rounded-lg font-bold" placeholder="साहित्य" /></div>
                          <div className="col-span-2"><Input type="number" value={item.quantity} onChange={e => updateEquipmentRow(item.id, {quantity: Number(e.target.value)})} className="h-8 text-[11px] px-0 text-center bg-white border-none rounded-lg font-black" /></div>
                          <div className="col-span-3">
                            <Select value={item.ownership} onValueChange={v => updateEquipmentRow(item.id, {ownership: v as any})}>
                              <SelectTrigger className="h-8 text-[10px] px-2 bg-white border-none rounded-lg font-black shadow-inner"><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="Self" className="font-bold">स्वतः</SelectItem><SelectItem value="Company" className="font-bold">डेअरी</SelectItem></SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-1 flex justify-end"><Button variant="ghost" size="icon" onClick={() => removeEquipmentRow(item.id)} className="h-7 w-7 text-destructive hover:bg-destructive/10"><X className="h-4 w-4" /></Button></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground">विशेष शेरा</Label><Textarea value={formData.additionalNotes} onChange={e => setFormData({...formData, additionalNotes: e.target.value})} className="h-20 text-[12px] bg-muted/20 border-none rounded-2xl p-4 shadow-inner" /></div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 border-t bg-muted/5">
            <Button onClick={handleSaveCenter} className="w-full font-black uppercase text-[11px] h-12 rounded-2xl shadow-xl shadow-primary/20 tracking-widest transition-all active:scale-95"><CheckCircle2 className="h-5 w-5 mr-2" /> माहिती जतन करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
