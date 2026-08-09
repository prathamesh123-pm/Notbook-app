"use client"

import { useState, useEffect, useMemo, Suspense, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Supplier, Route, EquipmentItem, SupplierType } from "@/lib/types"
import { 
  Plus, Search, Filter, Phone, Trash2, Milk, X, 
  Edit, CheckCircle2, Box, Wallet, User, Printer, ShieldCheck, Clock, Layers, TrendingDown,
  Building2, Activity, ChevronDown, ChevronUp, Users2, PlusCircle, Info, MapPin, Laptop, Zap, Sun, RotateCcw, ShieldAlert
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

const SectionTitle = ({ icon: Icon, title, color = "text-primary" }: any) => (
  <div className={cn("flex items-center gap-1.5 border-b-2 pb-1 mb-2 mt-4", color === 'text-primary' ? 'border-primary/20' : 'border-black/20')}>
    {Icon && <Icon className={cn("h-4 w-4", color)} />}
    <h3 className={cn("text-[11px] font-black uppercase tracking-wider", color)}>{title}</h3>
  </div>
)

const CompactTable = ({ title, data, columns, onAdd, onRemove, onUpdate, color = "text-primary" }: any) => (
  <div className="space-y-1.5 mb-4">
    <div className="flex items-center justify-between">
      <h3 className={cn("text-[10px] font-black uppercase tracking-wider", color)}>{title}</h3>
      <Button variant="outline" size="sm" onClick={onAdd} className="h-6 text-[8px] font-black border-black px-2 rounded-lg">+ जोडा</Button>
    </div>
    <div className="border border-black rounded-lg overflow-hidden shadow-sm bg-white">
      <ScrollArea className="w-full">
        <Table className="text-[9px] min-w-[600px] uppercase">
          <TableHeader className="bg-slate-50 h-7">
            <TableRow>
              {columns.map((col: any) => (
                <TableHead key={col.key} className={cn("h-7 px-2 text-center font-black border-r border-black/10 last:border-0", col.className)}>{col.label}</TableHead>
              ))}
              <TableHead className="w-8 h-7"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data || []).map((row: any) => (
              <TableRow key={row.id} className="h-8 border-t border-black/5">
                {columns.map((col: any) => (
                  <TableCell key={col.key} className="p-0 border-r border-black/5">
                    {col.type === 'select' ? (
                       <select 
                         value={row[col.key] || ""} 
                         onChange={e => onUpdate(row.id, { [col.key]: e.target.value })}
                         className="w-full h-7 text-[9px] font-bold bg-transparent outline-none text-center"
                       >
                         {col.options.map((opt: any) => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
                       </select>
                    ) : (
                      <Input 
                        type={col.type || "text"}
                        value={row[col.key] || ""} 
                        onChange={e => onUpdate(row.id, { [col.key]: e.target.value })} 
                        className="h-7 border-none text-[10px] text-center font-bold bg-transparent outline-none focus-visible:ring-0 px-1" 
                      />
                    )}
                  </TableCell>
                ))}
                <TableCell className="p-0 text-center">
                  <Button variant="ghost" size="icon" onClick={() => onRemove(row.id)} className="h-7 w-7 text-rose-500 p-0"><X className="h-3 w-3"/></Button>
                </TableCell>
              </TableRow>
            ))}
            {(!data || data.length === 0) && (
              <TableRow><TableCell colSpan={columns.length + 1} className="h-10 text-center italic text-[9px] opacity-30">अजून माहिती जोडलेली नाही</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  </div>
)

function SuppliersListPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const initialRouteFilter = searchParams.get('route') || 'all'

  const routesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'routes')
  }, [db, user])

  const suppliersQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'suppliers')
  }, [db, user])

  const { data: routes } = useCollection<Route>(routesQuery)
  const { data: suppliers, isLoading } = useCollection<Supplier>(suppliersQuery)

  const [searchQuery, setSearchQuery] = useState("")
  const [routeFilter, setRouteFilter] = useState(initialRouteFilter)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState<any>({
    supplierId: "", name: "", address: "", mobile: "", routeId: "none", 
    supplierType: "Center", operatorName: "", foundation_year: "",
    internal_gothas: [], sub_gavali_info: [], collection_areas: [],
    morning_collection_time: "", evening_collection_time: "", total_producers: "0", active_producers: "0",
    total_animals: "0", cows: "0", buffalo: "0", calves: "0",
    longTermProducers: [], decreasingProducers: [], local_gavali: [], lss_details: [],
    competitor_facilities: [], sub_routes: [],
    milk_decrease_reasons: "", efforts_taken: "", required_actions: "",
    fssaiNumber: "", fssaiExpiry: "", scaleBrand: "", fatMachineBrand: "",
    cowQty: "0", cowFat: "0", cowSnf: "0", bufQty: "0", bufFat: "0", bufSnf: "0",
    computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
    milkCansCount: "0", iceBlocks: "0", adulterationKitInfo: "",
    equipment: [], additionalInfo: "", hygiene: {},
    gotha_area: "", fodder_area: "", morning_milking_time: "", evening_milking_time: "", gotha_breeds: []
  })

  useEffect(() => setMounted(true), [])

  const resetFormData = useCallback(() => {
    setFormData({ 
      supplierId: "", name: "", address: "", mobile: "", routeId: "none", 
      supplierType: "Center", operatorName: "", foundation_year: "",
      internal_gothas: [], sub_gavali_info: [], collection_areas: [],
      morning_collection_time: "", evening_collection_time: "", total_producers: "0", active_producers: "0",
      total_animals: "0", cows: "0", buffalo: "0", calves: "0",
      longTermProducers: [], decreasingProducers: [], local_gavali: [], lss_details: [],
      competitor_facilities: [], sub_routes: [],
      milk_decrease_reasons: "", efforts_taken: "", required_actions: "",
      fssaiNumber: "", fssaiExpiry: "", scaleBrand: "", fatMachineBrand: "",
      cowQty: "0", cowFat: "0", cowSnf: "0", bufQty: "0", bufFat: "0", bufSnf: "0",
      computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
      milkCansCount: "0", iceBlocks: "0", adulterationKitInfo: "",
      equipment: [], additionalInfo: "", hygiene: {},
      gotha_area: "", fodder_area: "", morning_milking_time: "", evening_milking_time: "", gotha_breeds: []
    })
  }, [])

  const addRow = (key: string, initial: any) => setFormData((p: any) => ({ ...p, [key]: [...(p[key] || []), { id: crypto.randomUUID(), ...initial }] }))
  const removeRow = (key: string, id: string) => setFormData((p: any) => ({ ...p, [key]: (p[key] || []).filter((r: any) => r.id !== id) }))
  const updateRow = (key: string, id: string, u: any) => setFormData((p: any) => ({ ...p, [key]: (p[key] || []).map((r: any) => r.id === id ? { ...r, ...u } : r) }))

  const handleSave = () => {
    if (!formData.name || !formData.supplierId || !db || !user) {
      toast({ title: "त्रुटी", description: "नाव आणि आयडी आवश्यक आहे.", variant: "destructive" })
      return
    }

    const data = {
      ...formData,
      routeId: formData.routeId === "none" ? "" : formData.routeId,
      cowMilk: { quantity: Number(formData.cowQty) || 0, fat: Number(formData.cowFat) || 0, snf: Number(formData.cowSnf) || 0 },
      buffaloMilk: { quantity: Number(formData.bufQty) || 0, fat: Number(formData.bufFat) || 0, snf: Number(formData.bufSnf) || 0 },
      producer_center: {
        additional_details: {
          morning_collection_time: formData.morning_collection_time,
          evening_collection_time: formData.evening_collection_time,
          total_producers: Number(formData.total_producers) || 0,
          active_producers: Number(formData.active_producers) || 0,
          total_animals: Number(formData.total_animals) || 0,
          cows: Number(formData.cows) || 0,
          buffalo: Number(formData.buffalo) || 0,
          calves: Number(formData.calves) || 0,
          internal_gothas: formData.internal_gothas,
          sub_gavali_info: formData.sub_gavali_info,
          collection_areas: formData.collection_areas,
          longTermProducers: formData.longTermProducers,
          decreasingProducers: formData.decreasingProducers,
          local_gavali: formData.local_gavali,
          lss_details: formData.lss_details,
          competitor_facilities: formData.competitor_facilities,
          sub_routes: formData.sub_routes,
          milk_decrease_reasons: formData.milk_decrease_reasons,
          efforts_taken: formData.efforts_taken,
          required_actions: formData.required_actions,
          foundation_year: formData.foundation_year,
          gotha_hygiene_checklist: formData.hygiene,
          gotha_area: formData.gotha_area,
          fodder_area: formData.fodder_area,
          morning_milking_time: formData.morning_milking_time,
          evening_milking_time: formData.evening_milking_time,
          gotha_breeds: formData.gotha_breeds
        }
      },
      updatedAt: new Date().toISOString()
    }

    if (dialogMode === 'add') {
      addDocumentNonBlocking(collection(db, 'users', user.uid, 'suppliers'), data)
      toast({ title: "यशस्वी", description: "सप्लायर जतन झाला." })
    } else if (dialogMode === 'edit' && selectedSupplier) {
      updateDocumentNonBlocking(doc(db, 'users', user.uid, 'suppliers', selectedSupplier.id), data)
      toast({ title: "यशस्वी", description: "माहिती अद्ययावत झाली." })
    }
    setIsDialogOpen(false)
    resetFormData()
  }

  const prepareEdit = (supp: Supplier) => {
    setSelectedSupplier(supp)
    setDialogMode('edit')
    const d = supp.producer_center?.additional_details || {};
    setFormData({
      ...supp,
      routeId: supp.routeId || "none",
      cowQty: String(supp.cowMilk?.quantity || 0),
      cowFat: String(supp.cowMilk?.fat || 0),
      cowSnf: String(supp.cowMilk?.snf || 0),
      bufQty: String(supp.buffaloMilk?.quantity || 0),
      bufFat: String(supp.buffaloMilk?.fat || 0),
      bufSnf: String(supp.buffaloMilk?.snf || 0),
      morning_collection_time: d.morning_collection_time || "",
      evening_collection_time: d.evening_collection_time || "",
      total_producers: String(d.total_producers || 0),
      active_producers: String(d.active_producers || 0),
      total_animals: String(d.total_animals || 0),
      cows: String(d.cows || 0),
      buffalo: String(d.buffalo || 0),
      calves: String(d.calves || 0),
      internal_gothas: d.internal_gothas || [],
      sub_gavali_info: d.sub_gavali_info || [],
      collection_areas: d.collection_areas || [],
      longTermProducers: d.longTermProducers || [],
      decreasingProducers: d.decreasingProducers || [],
      local_gavali: d.local_gavali || [],
      lss_details: d.lss_details || [],
      competitor_facilities: d.competitor_facilities || [],
      sub_routes: d.sub_routes || [],
      milk_decrease_reasons: d.milk_decrease_reasons || "",
      efforts_taken: d.efforts_taken || "",
      required_actions: d.required_actions || "",
      foundation_year: d.foundation_year || "",
      hygiene: d.gotha_hygiene_checklist || {},
      gotha_area: d.gotha_area || "",
      fodder_area: d.fodder_area || "",
      morning_milking_time: d.morning_milking_time || "",
      evening_milking_time: d.evening_milking_time || "",
      gotha_breeds: d.gotha_breeds || []
    })
    setIsDialogOpen(true)
  }

  const deleteSupplier = (id: string) => {
    if (!db || !user) return
    if (confirm("हटवायचे आहे का?")) {
      deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'suppliers', id))
      setSelectedSupplier(null)
      toast({ title: "यशस्वी", description: "सप्लायर हटवला." })
    }
  }

  const filteredSuppliers = useMemo(() => {
    return (suppliers || []).filter(s => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = (s.name || "").toLowerCase().includes(q) || (s.mobile || "").includes(q) || (s.supplierId || "").toString().includes(q);
      const matchesRoute = routeFilter === 'all' || (routeFilter === 'none' ? !s.routeId : s.routeId === routeFilter);
      return matchesSearch && matchesRoute;
    })
  }, [suppliers, searchQuery, routeFilter])

  if (!mounted) return <div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="space-y-4 max-w-full mx-auto w-full pb-10 px-2 animate-in fade-in duration-500 overflow-x-hidden text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4 no-print">
        <div>
          <h2 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" /> सप्लायर मास्टर (SUPPLIERS)
          </h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Master Profile Management</p>
        </div>
        <Button onClick={() => { setDialogMode('add'); resetFormData(); setIsDialogOpen(true); }} className="gap-2 shadow-xl shadow-primary/20 h-10 px-6 rounded-xl font-black uppercase text-[10px] w-full md:w-auto">
          <Plus className="h-4 w-4" /> नवीन सप्लायर जोडा
        </Button>
      </div>

      {!selectedSupplier ? (
        <div className="bg-white rounded-2xl border-2 border-black shadow-2xl overflow-hidden no-print w-full overflow-x-auto">
          <div className="p-4 border-b bg-slate-50 flex gap-2 items-center">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="नाव किंवा कोडने शोधा..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-10 border-2 border-black rounded-xl font-black uppercase text-xs" />
             </div>
             <Select value={routeFilter} onValueChange={setRouteFilter}>
               <SelectTrigger className="w-40 h-10 border-2 border-black rounded-xl font-black uppercase text-[9px]"><Filter className="h-3 w-3 mr-1"/><SelectValue placeholder="रूट" /></SelectTrigger>
               <SelectContent>
                 <SelectItem value="all" className="font-bold">सर्व रूट</SelectItem>
                 {(routes || []).map(r => <SelectItem key={r.id} value={r.id} className="font-bold">{r.name}</SelectItem>)}
               </SelectContent>
             </Select>
          </div>
          <ScrollArea className="w-full">
            <Table className="min-w-[600px]">
              <TableHeader><TableRow className="bg-muted/30 h-10"><TableHead className="font-black text-[9px] uppercase px-4 whitespace-nowrap">केंद्र तपशील</TableHead><TableHead className="font-black text-[9px] uppercase text-center whitespace-nowrap">रूट</TableHead><TableHead className="font-black text-[9px] uppercase text-right px-4">क्रिया</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredSuppliers.map((supp) => (
                  <TableRow key={supp.id} className="cursor-pointer hover:bg-primary/5 h-14" onClick={() => setSelectedSupplier(supp)}>
                    <TableCell className="py-2 px-4"><div className="flex flex-col gap-0.5"><span className="font-black text-[12px] uppercase truncate">{supp.name}</span><div className="flex items-center gap-1.5"><Badge variant="outline" className="h-4 px-1.5 text-[8px] font-black border-none bg-primary/5 text-primary">ID: {supp.supplierId}</Badge><span className="text-[9px] text-muted-foreground font-black uppercase flex items-center gap-1"><Phone className="h-3 w-3" /> {supp.mobile}</span></div></div></TableCell>
                    <TableCell className="text-center"><Badge className="h-5 px-2 text-[8px] font-black uppercase border-none bg-emerald-100 text-emerald-700">{supp.routeId ? routes?.find(r => r.id === supp.routeId)?.name || '...' : 'Unassigned'}</Badge></TableCell>
                    <TableCell className="text-right px-4"><div className="flex gap-1 justify-end"><Button variant="ghost" size="icon" className="h-9 w-9" onClick={(e) => { e.stopPropagation(); prepareEdit(supp); }}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-9 w-9 text-rose-500" onClick={(e) => { e.stopPropagation(); deleteSupplier(supp.id); }}><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      ) : (
        <div className="bg-white border-2 border-black rounded-sm w-full max-w-[210mm] mx-auto p-4 sm:p-10 flex flex-col items-center animate-in slide-in-from-right-2 duration-300 relative shadow-2xl">
           <Button variant="ghost" size="icon" onClick={() => setSelectedSupplier(null)} className="absolute top-4 right-4 h-10 w-10 text-slate-400 hover:bg-slate-100 rounded-xl no-print"><X className="h-6 w-6" /></Button>
           <div className="w-full flex items-center justify-between no-print mb-6 border-b pb-2">
             <Badge className="bg-primary/10 text-primary border-none uppercase text-[10px] font-black">{selectedSupplier.supplierType} PROFILE</Badge>
             <div className="flex gap-2">
               <Button variant="outline" size="sm" className="h-8 rounded-xl font-black uppercase text-[10px] border-2 border-black" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1.5" /> प्रिंट</Button>
               <Button variant="outline" size="sm" className="h-8 rounded-xl font-black uppercase text-[10px] border-2 border-black" onClick={() => prepareEdit(selectedSupplier)}><Edit className="h-4 w-4 mr-1.5" /> बदल करा</Button>
             </div>
           </div>
           <div className="w-full border-b-[4px] border-black pb-3 mb-8 text-center"><h3 className="text-[22pt] font-black uppercase text-primary tracking-[0.1em]">{selectedSupplier.name}</h3><p className="text-[11pt] font-black text-muted-foreground uppercase tracking-widest mt-1">आयडी: {selectedSupplier.supplierId} | सविस्तर अहवाल</p></div>
           <div className="w-full text-left space-y-8">
             <div className="grid grid-cols-2 gap-10">
               <div className="space-y-4">
                 <h4 className="text-[11px] font-black uppercase text-primary border-b-2 border-black pb-1">१) प्राथमिक माहिती</h4>
                 <div className="space-y-2 text-[12px] font-bold">
                   <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>ऑपरेटर</span><span>{selectedSupplier.operatorName || "-"}</span></div>
                   <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>मोबाईल</span><span>{selectedSupplier.mobile || "-"}</span></div>
                   <div className="flex flex-col"><span>पत्ता</span><span className="font-medium text-slate-600 leading-relaxed">{selectedSupplier.address || "-"}</span></div>
                 </div>
               </div>
               <div className="space-y-4">
                 <h4 className="text-[11px] font-black uppercase text-primary border-b-2 border-black pb-1">२) परवाना & तांत्रिक</h4>
                 <div className="space-y-2 text-[12px] font-bold">
                   <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>FSSAI क्र.</span><span>{selectedSupplier.fssaiNumber || "-"}</span></div>
                   <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>काटा ब्रँड</span><span>{selectedSupplier.scaleBrand || "-"}</span></div>
                 </div>
               </div>
             </div>

             <div className="space-y-3">
               <h4 className="text-[11px] font-black uppercase text-primary border-b-2 border-black pb-1">३) साहित्याची यादी (INVENTORY)</h4>
               <div className="border-2 border-black rounded-sm overflow-hidden">
                 <ScrollArea className="w-full">
                   <table className="w-full border-collapse min-w-[300px]">
                     <thead>
                       <tr className="bg-slate-100">
                         <th className="p-2 border border-black text-left uppercase text-[9px] font-black">साहित्य नाव</th>
                         <th className="p-2 border border-black text-center uppercase text-[9px] font-black">नग</th>
                         <th className="p-2 border border-black text-right uppercase text-[9px] font-black">मालकी हक्क</th>
                       </tr>
                     </thead>
                     <tbody>
                       {(selectedSupplier.equipment || []).map((it, idx) => (
                         <tr key={idx} className="font-bold border-b border-black h-10">
                           <td className="p-2 border border-black text-[11px] uppercase">{it.name}</td>
                           <td className="p-2 border border-black text-center text-[11px]">{it.quantity}</td>
                           <td className="p-2 border border-black text-right uppercase text-[9px]">{it.ownership === 'Company' ? 'डेअरी (DAIRY)' : 'स्वतःची (SELF)'}</td>
                         </tr>
                       ))}
                       {(!selectedSupplier.equipment || selectedSupplier.equipment.length === 0) && (
                         <tr><td colSpan={3} className="p-4 text-center italic text-[10px] opacity-30">कोणतेही साहित्य नोंदवलेले नाही.</td></tr>
                       )}
                     </tbody>
                   </table>
                   <ScrollBar orientation="horizontal" />
                 </ScrollArea>
               </div>
             </div>
           </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[98vw] w-[98vw] p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white flex flex-col h-[92vh] text-left">
          <DialogHeader className="p-3 bg-primary text-white shrink-0">
            <DialogTitle className="text-sm font-black uppercase tracking-widest">{dialogMode === 'add' ? 'नवीन सप्लायर फॉर्म' : 'माहिती अद्ययावत करा'}</DialogTitle>
            <DialogDescription className="text-[8px] text-white/70 uppercase">सविस्तर १६+ कलमी फॉर्म (मोबाईल ऑप्टिमाइज्ड)</DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 bg-white">
            <div className="p-3 space-y-6 pb-32">
              <div className="max-w-[950px] mx-auto space-y-6">
                
                <div className="space-y-3">
                  <SectionTitle icon={User} title="१) प्राथमिक माहिती" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase">सप्लायर प्रकार</Label>
                      <Select value={formData.supplierType} onValueChange={(v: SupplierType) => setFormData({...formData, supplierType: v})}>
                        <SelectTrigger className="h-8 border-2 border-black font-black text-[10px]"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Center" className="font-bold">उत्पादक केंद्र</SelectItem><SelectItem value="Gavali" className="font-bold">गवळी</SelectItem><SelectItem value="Gotha" className="font-bold">गोठा</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase">नाव *</Label><Input value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="h-8 border-2 border-black font-bold text-xs" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase">आयडी (ID) *</Label><Input value={formData.supplierId || ""} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="h-8 border-2 border-black font-bold text-xs" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase">मोबाईल</Label><Input value={formData.mobile || ""} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-8 border-2 border-black font-bold text-xs" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase">ऑपरेटर</Label><Input value={formData.operatorName || ""} onChange={e => setFormData({...formData, operatorName: e.target.value})} className="h-8 border-2 border-black text-xs" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase">स्थापना वर्ष</Label><Input placeholder="YYYY" value={formData.foundation_year || ""} onChange={e => setFormData({...formData, foundation_year: e.target.value})} className="h-8 border-2 border-black text-xs" /></div>
                    <div className="col-span-2 space-y-1"><Label className="text-[9px] font-black uppercase">पत्ता</Label><Input value={formData.address || ""} onChange={e => setFormData({...formData, address: e.target.value})} className="h-8 border-2 border-black text-xs" /></div>
                  </div>
                </div>

                {(formData.supplierType === 'Gavali' || formData.supplierType === 'Center') && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b-2 border-indigo-200 pb-1">
                      <h3 className="text-[10px] font-black uppercase text-indigo-700 flex items-center gap-1.5"><Users2 className="h-4 w-4"/> सब-गवळी माहिती (SUB-GAVALI INFO)</h3>
                      <Button size="sm" onClick={() => addRow('sub_gavali_info', { name: "", mobile: "", area: "", method: "Spot", producers: "0", animals: "0", cow_qty: "0", cow_fat: "0", cow_snf: "0", buf_qty: "0", buf_fat: "0", buf_snf: "0", note: "" })} className="h-7 text-[8px] font-black bg-indigo-600 text-white rounded-lg shadow-lg">+ सब-गवळी जोडा</Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {formData.sub_gavali_info.map((sg: any, idx: number) => (
                        <Card key={sg.id} className="border-2 border-indigo-100 overflow-hidden rounded-xl shadow-md bg-white">
                          <div className="p-1.5 bg-indigo-50 flex justify-between items-center border-b border-indigo-100">
                            <span className="text-[9px] font-black uppercase text-indigo-700">SG-{idx + 1} सब-गवळी</span>
                            <Button variant="ghost" size="icon" onClick={() => removeRow('sub_gavali_info', sg.id)} className="h-6 w-6 text-rose-500"><X className="h-3 w-3" /></Button>
                          </div>
                          <div className="p-3 space-y-4">
                             <div className="grid grid-cols-2 gap-2">
                               <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-50">नाव</Label><Input value={sg.name} onChange={e => updateRow('sub_gavali_info', sg.id, { name: e.target.value })} className="h-8 text-[10px] border-black font-bold" /></div>
                               <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-50">मोबाईल</Label><Input value={sg.mobile} onChange={e => updateRow('sub_gavali_info', sg.id, { mobile: e.target.value })} className="h-8 text-[10px] border-black font-bold" /></div>
                               <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-50">संकलन एरिया</Label><Input value={sg.area} onChange={e => updateRow('sub_gavali_info', sg.id, { area: e.target.value })} className="h-8 text-[10px] border-black font-bold" /></div>
                               <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-50">पद्धत</Label>
                                 <Select value={sg.method} onValueChange={v => updateRow('sub_gavali_info', sg.id, { method: v })}>
                                   <SelectTrigger className="h-8 text-[9px] border-black font-black"><SelectValue /></SelectTrigger>
                                   <SelectContent><SelectItem value="Spot" className="font-bold">Spot</SelectItem><SelectItem value="Route" className="font-bold">Route</SelectItem></SelectContent>
                                 </Select>
                               </div>
                               <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-50 text-emerald-600">एकूण उत्पादक</Label><Input type="number" value={sg.producers} onChange={e => updateRow('sub_gavali_info', sg.id, { producers: e.target.value })} className="h-8 text-[10px] border-black font-black text-center" /></div>
                               <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-50 text-indigo-600">एकूण जनावरे</Label><Input type="number" value={sg.animals} onChange={e => updateRow('sub_gavali_info', sg.id, { animals: e.target.value })} className="h-8 text-[10px] border-black font-black text-center" /></div>
                             </div>

                             <div className="space-y-2">
                               <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                  <Label className="text-[8px] font-black uppercase text-blue-600 block mb-1">गाय दूध (COW Q/F/S)</Label>
                                  <div className="grid grid-cols-3 gap-1">
                                    <Input type="number" placeholder="Qty" value={sg.cow_qty} onChange={e => updateRow('sub_gavali_info', sg.id, { cow_qty: e.target.value })} className="h-7 text-[10px] border-blue-400 text-center font-black" />
                                    <Input type="number" placeholder="Fat" value={sg.cow_fat} onChange={e => updateRow('sub_gavali_info', sg.id, { cow_fat: e.target.value })} className="h-7 text-[10px] border-blue-400 text-center font-black" />
                                    <Input type="number" placeholder="SNF" value={sg.cow_snf} onChange={e => updateRow('sub_gavali_info', sg.id, { cow_snf: e.target.value })} className="h-7 text-[10px] border-blue-400 text-center font-black" />
                                  </div>
                               </div>
                               <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                                  <Label className="text-[8px] font-black uppercase text-amber-600 block mb-1">म्हेस दूध (BUF Q/F/S)</Label>
                                  <div className="grid grid-cols-3 gap-1">
                                    <Input type="number" placeholder="Qty" value={sg.buf_qty} onChange={e => updateRow('sub_gavali_info', sg.id, { buf_qty: e.target.value })} className="h-7 text-[10px] border-amber-400 text-center font-black" />
                                    <Input type="number" placeholder="Fat" value={sg.buf_fat} onChange={e => updateRow('sub_gavali_info', sg.id, { buf_fat: e.target.value })} className="h-7 text-[10px] border-amber-400 text-center font-black" />
                                    <Input type="number" placeholder="SNF" value={sg.buf_snf} onChange={e => updateRow('sub_gavali_info', sg.id, { buf_snf: e.target.value })} className="h-7 text-[10px] border-amber-400 text-center font-black" />
                                  </div>
                               </div>
                             </div>
                             
                             <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-50">महत्त्वाची माहिती / शेरा</Label><Textarea value={sg.note} onChange={e => updateRow('sub_gavali_info', sg.id, { note: e.target.value })} className="h-12 text-[10px] border-black p-1.5" /></div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b-2 border-amber-200 pb-1">
                        <SectionTitle icon={Building2} title="अंतर्गत मोठे गोठे (INTERNAL GOTHAS)" color="text-amber-700" />
                        <Button size="sm" onClick={() => addRow('internal_gothas', { id: crypto.randomUUID(), isOpen: true, owner_name: "", code: "", location: "", area: "", fodder_area: "", morning_time: "", evening_time: "", breeds: [], hygiene: {} })} className="h-7 text-[8px] font-black bg-amber-600 text-white rounded-lg shadow-lg">+ गोठा जोडा</Button>
                      </div>
                      <div className="space-y-3">
                        {formData.internal_gothas.map((g: any, gIdx: number) => (
                          <Card key={g.id} className="border-2 border-amber-100 overflow-hidden rounded-xl shadow-sm">
                            <div className={cn("p-2 flex items-center justify-between cursor-pointer", g.isOpen ? "bg-amber-100" : "bg-amber-50")} onClick={() => updateRow('internal_gothas', g.id, { isOpen: !g.isOpen })}>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-amber-600 text-white font-black text-[8px] h-5">G-{gIdx + 1}</Badge>
                                <span className="text-[9px] font-black uppercase text-amber-900">गोठा: {g.owner_name || '---'}</span>
                              </div>
                              <div className="flex gap-1.5"><Button size="icon" variant="ghost" className="h-6 w-6 text-rose-400" onClick={(e) => { e.stopPropagation(); removeRow('internal_gothas', g.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>{g.isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</div>
                            </div>
                            {g.isOpen && (
                              <div className="p-3 bg-white space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase">मालक</Label><Input value={g.owner_name} onChange={e => updateRow('internal_gothas', g.id, { owner_name: e.target.value })} className="h-7 border-black text-[10px]" /></div>
                                  <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase">कोड</Label><Input value={g.code} onChange={e => updateRow('internal_gothas', g.id, { code: e.target.value })} className="h-7 border-black text-[10px]" /></div>
                                  <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase">लोकेशन</Label><Input value={g.location} onChange={e => updateRow('internal_gothas', g.id, { location: e.target.value })} className="h-7 border-black text-[10px]" /></div>
                                  <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase">एरिया</Label><Input value={g.area} onChange={e => updateRow('internal_gothas', g.id, { area: e.target.value })} className="h-7 border-black text-[10px]" /></div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between"><span className="text-[9px] font-black uppercase text-rose-600">जातीनुसार जनावरे (Breed Table)</span><Button size="sm" variant="outline" onClick={() => {
                                    const breeds = g.breeds || [];
                                    updateRow('internal_gothas', g.id, { breeds: [...breeds, { id: crypto.randomUUID(), breed: "", count: "0", avg: "0" }] });
                                  }} className="h-5 text-[7px] border-black px-1.5">+ जोडा</Button></div>
                                  <div className="border border-black rounded-lg overflow-hidden shadow-sm">
                                    <ScrollArea className="w-full">
                                      <Table className="text-[8px] min-w-[300px]">
                                        <TableHeader className="bg-slate-50 h-6"><TableRow><TableHead className="h-6 px-1">ब्रीड</TableHead><TableHead className="h-6 px-1 text-center">नग</TableHead><TableHead className="h-6 px-1 text-center">Avg(L)</TableHead><TableHead className="h-6 w-6"></TableHead></TableRow></TableHeader>
                                        <TableBody>
                                          {(g.breeds || []).map((b: any) => (
                                            <TableRow key={b.id} className="h-7"><TableCell className="p-0 border-r"><Input value={b.breed} onChange={e => {
                                              const breeds = g.breeds.map((br: any) => br.id === b.id ? { ...br, breed: e.target.value } : br);
                                              updateRow('internal_gothas', g.id, { breeds });
                                            }} className="h-6 border-none text-center font-bold" /></TableCell><TableCell className="p-0 border-r"><Input value={b.count} onChange={e => {
                                              const breeds = g.breeds.map((br: any) => br.id === b.id ? { ...br, count: e.target.value } : br);
                                              updateRow('internal_gothas', g.id, { breeds });
                                            }} className="h-6 border-none text-center font-bold" /></TableCell><TableCell className="p-0 border-r"><Input value={b.avg} onChange={e => {
                                              const breeds = g.breeds.map((br: any) => br.id === b.id ? { ...br, avg: e.target.value } : br);
                                              updateRow('internal_gothas', g.id, { breeds });
                                            }} className="h-6 border-none text-center font-bold" /></TableCell><TableCell className="p-0 text-center"><Button variant="ghost" size="icon" onClick={() => {
                                              const breeds = g.breeds.filter((br: any) => br.id !== b.id);
                                              updateRow('internal_gothas', g.id, { breeds });
                                            }} className="h-6 w-6 text-rose-500"><X className="h-3 w-3"/></Button></TableCell></TableRow>
                                          ))}</TableBody>
                                      </Table>
                                      <ScrollBar orientation="horizontal" />
                                    </ScrollArea>
                                  </div>
                                </div>
                                <div className="space-y-1.5"><span className="text-[9px] font-black uppercase text-emerald-700">स्वच्छता चेकलिस्ट</span><div className="grid grid-cols-2 gap-1 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                                  {['फरशी स्वच्छता', 'जनावरे स्वच्छता', 'भांडी निर्जंतुक', 'कामगार स्वच्छता', 'सांडपाणी निचरा', 'स्वच्छ पाणी/चारा'].map((label) => (
                                    <div key={label} className="flex items-center space-x-1.5 bg-white p-1 rounded border border-emerald-100 shadow-sm">
                                      <Checkbox id={`hyg-${g.id}-${label}`} checked={g.hygiene?.[label] || false} onCheckedChange={(v) => updateRow('internal_gothas', g.id, { hygiene: { ...g.hygiene, [label]: !!v } })} className="h-3 w-3 border-emerald-400" />
                                      <Label htmlFor={`hyg-${g.id}-${label}`} className="text-[8px] font-bold text-slate-700">{label}</Label>
                                    </div>
                                  ))}
                                </div></div>
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {formData.supplierType === 'Gotha' && (
                  <div className="space-y-4">
                    <SectionTitle icon={Building2} title="२) गोठा आकारमान & दूध वेळ" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">गोठा एरिया</Label><Input placeholder="उदा. १० गुंठे" value={formData.gotha_area || ""} onChange={e => setFormData({...formData, gotha_area: e.target.value})} className="h-8 border-2 border-black text-xs" /></div>
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">चारा एरिया</Label><Input placeholder="उदा. २ एकर" value={formData.fodder_area || ""} onChange={e => setFormData({...formData, fodder_area: e.target.value})} className="h-8 border-2 border-black text-xs" /></div>
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">सकाळ वेळ</Label><Input type="time" value={formData.morning_milking_time || ""} onChange={e => setFormData({...formData, morning_milking_time: e.target.value})} className="h-8 border-2 border-black text-xs" /></div>
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">सायंकाळ वेळ</Label><Input type="time" value={formData.evening_milking_time || ""} onChange={e => setFormData({...formData, evening_milking_time: e.target.value})} className="h-8 border-2 border-black text-xs" /></div>
                    </div>
                    <CompactTable title="ब्रीड माहिती" data={formData.gotha_breeds || []} columns={[{ key: 'breed', label: 'जात' }, { key: 'count', label: 'नग' }, { key: 'avg_milk', label: 'सरासरी (L)' }]} onAdd={() => addRow('gotha_breeds', { breed: "", count: "0", avg_milk: "0" })} onRemove={(id: string) => removeRow('gotha_breeds', id)} onUpdate={(id: string, u: any) => updateRow('gotha_breeds', id, u)} />
                    <div className="space-y-1.5"><span className="text-[9px] font-black uppercase text-emerald-700">स्वच्छता चेकलिस्ट</span><div className="grid grid-cols-2 gap-1 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                      {['फरशी स्वच्छता', 'जनावरे स्वच्छता', 'भांडी निर्जंतुक', 'कामगार स्वच्छता', 'सांडपाणी निचरा', 'स्वच्छ पाणी/चारा'].map((label) => (
                        <div key={label} className="flex items-center space-x-1.5 bg-white p-1 rounded border border-emerald-100 shadow-sm">
                          <Checkbox id={`gotha-hyg-${label}`} checked={formData.hygiene?.[label] || false} onCheckedChange={(v) => setFormData({...formData, hygiene: { ...formData.hygiene, [label]: !!v } })} className="h-3 w-3 border-emerald-400" />
                          <Label htmlFor={`gotha-hyg-${label}`} className="text-[8px] font-bold text-slate-700">{label}</Label>
                        </div>
                      ))}
                    </div></div>
                  </div>
                )}

                <div className="space-y-4">
                  <SectionTitle icon={Clock} title="३) संकलन वेळ & उत्पादक सारांश" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">सकाळ वेळ</Label><Input type="time" value={formData.morning_collection_time || ""} onChange={e => setFormData({...formData, morning_collection_time: e.target.value})} className="h-8 border-2 border-black text-xs" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">सायंकाळ वेळ</Label><Input type="time" value={formData.evening_collection_time || ""} onChange={e => setFormData({...formData, evening_collection_time: e.target.value})} className="h-8 border-2 border-black text-xs" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">एकूण उत्पादक</Label><Input type="number" value={formData.total_producers || "0"} onChange={e => setFormData({...formData, total_producers: e.target.value})} className="h-8 border-2 border-black text-center font-black" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">सक्रिय उत्पादक</Label><Input type="number" value={formData.active_producers || "0"} onChange={e => setFormData({...formData, active_producers: e.target.value})} className="h-8 border-2 border-black text-center font-black text-emerald-600" /></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <SectionTitle icon={Activity} title="४) जनावरांची माहिती" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase">एकूण</Label><Input type="number" value={formData.total_animals || "0"} onChange={e => setFormData({...formData, total_animals: e.target.value})} className="h-8 border-2 border-black text-center font-black" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase">गाई</Label><Input type="number" value={formData.cows || "0"} onChange={e => setFormData({...formData, cows: e.target.value})} className="h-8 border-2 border-black text-center font-black text-blue-600" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase">म्हशी</Label><Input type="number" value={formData.buffalo || "0"} onChange={e => setFormData({...formData, buffalo: e.target.value})} className="h-8 border-2 border-black text-center font-black text-amber-600" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase">वासरे</Label><Input type="number" value={formData.calves || "0"} onChange={e => setFormData({...formData, calves: e.target.value})} className="h-8 border-2 border-black text-center font-black text-slate-500" /></div>
                  </div>
                </div>

                {formData.supplierType === 'Center' && (
                  <div className="space-y-6">
                    <CompactTable 
                      title="२+ वर्ष जुने उत्पादक" 
                      data={formData.longTermProducers} 
                      columns={[
                        { key: 'producer_name', label: 'नाव', className: 'text-left' },
                        { key: 'previous_milk', label: 'जुने दूध' },
                        { key: 'current_milk', label: 'सध्याचे दूध' },
                        { key: 'previous_animals', label: 'जुनी जनावरे' },
                        { key: 'current_animals', label: 'नवी जनावरे' }
                      ]} 
                      onAdd={() => addRow('longTermProducers', { producer_name: "", previous_milk: "0", current_milk: "0", previous_animals: "0", current_animals: "0" })} 
                      onRemove={(id: string) => removeRow('longTermProducers', id)} 
                      onUpdate={(id: string, u: any) => updateRow('longTermProducers', id, u)}
                    />
                    <CompactTable 
                      title="दूध घट विश्लेषण" 
                      data={formData.decreasingProducers} 
                      color="text-rose-600"
                      columns={[
                        { key: 'producer_name', label: 'नाव', className: 'text-left' },
                        { key: 'previous_milk', label: 'जुने दूध' },
                        { key: 'current_milk', label: 'नवे दूध' },
                        { key: 'previous_animals', label: 'जुनी जनावरे' },
                        { key: 'current_animals', label: 'नवी जनावरे' },
                        { key: 'reason', label: 'कारण', className: 'min-w-[120px]' }
                      ]} 
                      onAdd={() => addRow('decreasingProducers', { producer_name: "", previous_milk: "0", current_milk: "0", previous_animals: "0", current_animals: "0", reason: "" })} 
                      onRemove={(id: string) => removeRow('decreasingProducers', id)} 
                      onUpdate={(id: string, u: any) => updateRow('decreasingProducers', id, u)}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CompactTable 
                    title="स्थानिक गवळी" 
                    data={formData.local_gavali} 
                    columns={[
                      { key: 'name', label: 'नाव' },
                      { key: 'code', label: 'कोड' },
                      { key: 'mhais_dudh', label: 'म्हेस दूध' },
                      { key: 'gay_dudh', label: 'गाय दूध' },
                      { key: 'animals_count', label: 'जनावरे संख्या' }
                    ]} 
                    onAdd={() => addRow('local_gavali', { name: "", code: "", mhais_dudh: "0", gay_dudh: "0", animals_count: "0" })} 
                    onRemove={(id: string) => removeRow('local_gavali', id)} 
                    onUpdate={(id: string, u: any) => updateRow('local_gavali', id, u)} 
                  />
                  <CompactTable title="LSS & सुविधा" data={formData.lss_details} columns={[{ key: 'facility_name', label: 'सुविधा' }, { key: 'status', label: 'स्थिती' }, { key: 'remark', label: 'शेरा' }]} onAdd={() => addRow('lss_details', { facility_name: "", status: "OK", remark: "" })} onRemove={(id: string) => removeRow('lss_details', id)} onUpdate={(id: string, u: any) => updateRow('lss_details', id, u)} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <CompactTable title="स्पर्धक डेअरी" data={formData.competitor_facilities} color="text-rose-600" columns={[{ key: 'dairy_name', label: 'नाव' }, { key: 'gay_dudh', label: 'गाय' }, { key: 'mhais_dudh', label: 'म्हेस' }, { key: 'rate', label: 'दर' }, { key: 'facility', label: 'सुविधा' }]} onAdd={() => addRow('competitor_facilities', { dairy_name: "", gay_dudh: "0", mhais_dudh: "0", rate: "0", facility: "" })} onRemove={(id: string) => removeRow('competitor_facilities', id)} onUpdate={(id: string, u: any) => updateRow('competitor_facilities', id, u)} />
                   <CompactTable title="अंतर्गत उप-रूट माहिती" data={formData.sub_routes} columns={[{ key: 'vehicle', label: 'गाडी' }, { key: 'km', label: 'किमी' }, { key: 'area', label: 'परिसर' }, { key: 'producers', label: 'उत्पादक' }, { key: 'milk', label: 'दूध(L)' }]} onAdd={() => addRow('sub_routes', { vehicle: "", km: "0", area: "", producers: "0", milk: "0" })} onRemove={(id: string) => removeRow('sub_routes', id)} onUpdate={(id: string, u: any) => updateRow('sub_routes', id, u)} />
                </div>

                <div className="space-y-4">
                  <SectionTitle icon={TrendingDown} title="विशेष विश्लेषण & उपाययोजना" color="text-rose-600" />
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase">दूध कमी होण्याची कारणे</Label><Textarea value={formData.milk_decrease_reasons || ""} onChange={e => setFormData({...formData, milk_decrease_reasons: e.target.value})} className="h-14 border-2 border-black text-xs" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase">सेंटरने केलेले प्रयत्न</Label><Textarea value={formData.efforts_taken || ""} onChange={e => setFormData({...formData, efforts_taken: e.target.value})} className="h-14 border-2 border-black text-xs" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase">दूध वाढवण्यासाठी उपाय</Label><Textarea value={formData.required_actions || ""} onChange={e => setFormData({...formData, required_actions: e.target.value})} className="h-14 border-2 border-black text-xs" /></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <SectionTitle icon={ShieldCheck} title="परवाना & तांत्रिक" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase">FSSAI क्र.</Label><Input value={formData.fssaiNumber || ""} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-8 border-2 border-black text-xs" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase">मुदत तारीख</Label><Input type="date" value={formData.fssaiExpiry || ""} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-8 border-2 border-black text-xs" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase">काटा ब्रँड</Label><Input value={formData.scaleBrand || ""} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-8 border-2 border-black text-xs" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase">मशीन ब्रँड</Label><Input value={formData.fatMachineBrand || ""} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-8 border-2 border-black text-xs" /></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <SectionTitle icon={Wallet} title="व्यावसायिक & दूध तपशील" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-2 bg-blue-50 border-2 border-blue-100 rounded-xl space-y-1.5">
                       <Label className="text-[10px] font-black text-blue-600 uppercase">गाय दूध Q/F/S</Label>
                       <div className="grid grid-cols-3 gap-1">
                         <Input type="number" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} placeholder="Q" className="h-7 border-blue-500 text-center font-black text-[10px]" />
                         <Input type="number" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} placeholder="F" className="h-7 border-blue-500 text-center font-black text-[10px]" />
                         <Input type="number" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} placeholder="S" className="h-7 border-blue-500 text-center font-black text-[10px]" />
                       </div>
                    </div>
                    <div className="p-2 bg-amber-50 border-2 border-amber-100 rounded-xl space-y-1.5">
                       <Label className="text-[10px] font-black text-amber-600 uppercase">म्हेस दूध Q/F/S</Label>
                       <div className="grid grid-cols-3 gap-1">
                         <Input type="number" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} placeholder="Q" className="h-7 border-amber-500 text-center font-black text-[10px]" />
                         <Input type="number" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} placeholder="F" className="h-7 border-amber-500 text-center font-black text-[10px]" />
                         <Input type="number" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} placeholder="S" className="h-7 border-amber-500 text-center font-black text-[10px]" />
                       </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <SectionTitle icon={Box} title="इन्व्हेन्टरी & स्टेटस" />
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                     <div className="flex flex-col items-center gap-1 p-2 bg-slate-50 rounded-xl border-2 border-black cursor-pointer" onClick={() => setFormData({...formData, computerAvailable: !formData.computerAvailable})}><Laptop className={cn("h-4 w-4", formData.computerAvailable ? 'text-primary' : 'text-slate-300')} /><span className="text-[8px] font-black uppercase">POP: {formData.computerAvailable ? 'हो' : 'नाही'}</span></div>
                     <div className="flex flex-col items-center gap-1 p-2 bg-slate-50 rounded-xl border-2 border-black cursor-pointer" onClick={() => setFormData({...formData, upsInverterAvailable: !formData.upsInverterAvailable})}><Zap className={cn("h-4 w-4", formData.upsInverterAvailable ? 'text-amber-500' : 'text-slate-300')} /><span className="text-[8px] font-black uppercase">UPS: {formData.upsInverterAvailable ? 'हो' : 'नाही'}</span></div>
                     <div className="flex flex-col items-center gap-1 p-2 bg-slate-50 rounded-xl border-2 border-black cursor-pointer" onClick={() => setFormData({...formData, solarAvailable: !formData.solarAvailable})}><Sun className={cn("h-4 w-4", formData.solarAvailable ? 'text-emerald-500' : 'text-slate-300')} /><span className="text-[8px] font-black uppercase">बर्फ: {formData.iceBlocks > 0 ? 'हो' : 'नाही'}</span></div>
                     <div className="flex flex-col items-center gap-1 p-1.5 bg-slate-50 rounded-xl border-2 border-black col-span-2"><span className="text-[7px] font-black uppercase opacity-40">CANS / ICE</span><div className="flex gap-1"><Input type="number" placeholder="CANS" value={formData.milkCansCount} onChange={e => setFormData({...formData, milkCansCount: e.target.value})} className="h-6 w-12 border-none text-center bg-transparent font-black text-[10px]" /><Input type="number" placeholder="ICE" value={formData.iceBlocks} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-6 w-12 border-none text-center bg-transparent font-black text-[10px]" /></div></div>
                  </div>
                  <div className="space-y-1"><Label className="text-[9px] font-black uppercase">भेसळ तपासणी कीट</Label><Input value={formData.adulterationKitInfo || ""} onChange={e => setFormData({...formData, adulterationKitInfo: e.target.value})} className="h-8 border-2 border-black text-xs" /></div>
                  
                  <CompactTable 
                    title="साहित्याची यादी (ASSETS)" 
                    data={formData.equipment} 
                    columns={[
                      { key: 'name', label: 'नाव' },
                      { key: 'quantity', label: 'नग', type: 'number' },
                      { 
                        key: 'ownership', 
                        label: 'मालकी', 
                        type: 'select', 
                        options: [
                          { v: 'Company', l: 'DAIRY' },
                          { v: 'Self', l: 'SWATACHYA MALKIKE' }
                        ] 
                      }
                    ]} 
                    onAdd={() => addRow('equipment', { name: "", quantity: "1", ownership: "Company" })} 
                    onRemove={(id: string) => removeRow('equipment', id)} 
                    onUpdate={(id: string, u: any) => updateRow('equipment', id, u)} 
                  />
                </div>

                <div className="space-y-1">
                  <SectionTitle icon={Info} title="विशेष शेरा (REMARK)" color="text-slate-500" />
                  <Textarea value={formData.additionalInfo || ""} onChange={e => setFormData({...formData, additionalInfo: e.target.value})} className="h-16 border-2 border-black p-2 text-xs" />
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-3 border-t bg-muted/10 shrink-0 flex flex-row gap-3 no-print">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1 h-12 rounded-xl font-black uppercase text-[11px] border-2 border-black bg-white">रद्द</Button>
            <Button onClick={handleSave} className="flex-[2] h-12 rounded-xl shadow-2xl shadow-primary/30 font-black uppercase text-[11px] tracking-widest bg-primary text-white flex items-center justify-center gap-2"><CheckCircle2 className="h-5 w-5" /> माहिती जतन करा (SAVE)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function SuppliersPage() {
  return <Suspense fallback={<div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>}><SuppliersListPage /></Suspense>
}
