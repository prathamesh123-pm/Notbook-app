
"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Plus, Search, Filter, ShieldAlert, History, Edit, CheckCircle2, 
  Trash2, MapPin, Calendar, User, Warehouse, X, ClipboardList, Info, AlertTriangle, RotateCcw
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { QualityMonitoringEntry, MonitoringReason } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc, query } from "firebase/firestore"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

const REASONS: Record<MonitoringReason, string> = {
  'Repeated Adulteration': 'वारंवार दूध भेसळ (Adulteration)',
  'Excessive Odor': 'दुधाला उग्र वास (Smell/Odor)',
  'Late Milk Arrival': 'दूध उशिरा पोहोचणे (Late Arrival)',
  'Poor Milk Quality': 'दुधाची प्रत निकृष्ट (Poor Quality)',
  'High Bacterial Contamination': 'बॅक्टेरियाचे प्रमाण जास्त (Bacterial)',
  'Irregular Milk Supply': 'अनियमित दूध पुरवठा (Irregular)',
  'Other': 'इतर (Other Reasons)'
}

const SectionTitle = ({ icon: Icon, title, color = "text-primary" }: any) => (
  <div className={cn("flex items-center gap-1.5 border-b pb-1 mb-2 mt-3", color === 'text-primary' ? 'border-primary/20' : 'border-black/20')}>
    {Icon && <Icon className={cn("h-3.5 w-3.5", color)} />}
    <h3 className={cn("text-[10px] font-black uppercase tracking-wider", color)}>{title}</h3>
  </div>
)

export default function QualityMonitoringPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const monitoringQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, 'users', user.uid, 'qualityMonitoring'))
  }, [db, user])

  const { data: entries, isLoading } = useCollection<QualityMonitoringEntry>(monitoringQuery)

  const sortedEntries = useMemo(() => {
    return (entries || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [entries])

  const [searchQuery, setSearchQuery] = useState("")
  const [villageFilter, setVillageFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<Partial<QualityMonitoringEntry>>({
    supplierType: 'Gavali',
    supplierName: "",
    villageName: "",
    chillingCenterName: "",
    observationDate: new Date().toISOString().split('T')[0],
    reason: 'Repeated Adulteration',
    detailedRemarks: "",
    status: 'Active'
  })

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const handleOpenAdd = () => {
    setDialogMode('add'); setEditingId(null);
    setFormData({
      supplierType: 'Gavali',
      supplierName: "",
      villageName: "",
      chillingCenterName: "",
      observationDate: new Date().toISOString().split('T')[0],
      reason: 'Repeated Adulteration',
      detailedRemarks: "",
      status: 'Active'
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (entry: QualityMonitoringEntry) => {
    setDialogMode('edit'); setEditingId(entry.id);
    setFormData(entry)
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.supplierName || !formData.villageName || !db || !user) {
      toast({ title: "त्रुटी", description: "सर्व अनिवार्य रकाने भरा.", variant: "destructive" })
      return
    }

    const data = { 
      ...formData, 
      updatedAt: new Date().toISOString() 
    }

    if (dialogMode === 'add') {
      addDocumentNonBlocking(collection(db, 'users', user.uid, 'qualityMonitoring'), {
        ...data,
        createdAt: new Date().toISOString()
      })
      toast({ title: "यशस्वी", description: "नवीन मॉनिटरिंग नोंद जोडली गेली." })
    } else if (editingId) {
      updateDocumentNonBlocking(doc(db, 'users', user.uid, 'qualityMonitoring', editingId), data)
      toast({ title: "यशस्वी", description: "माहिती अद्ययावत झाली." })
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    if (!db || !user) return
    if (confirm("ही नोंद कायमस्वरूपी हटवायची आहे का?")) {
      deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'qualityMonitoring', id))
      toast({ title: "यशस्वी", description: "नोंद हटवण्यात आली." })
    }
  }

  const filteredEntries = useMemo(() => {
    return sortedEntries.filter(e => {
      const matchesSearch = (e.supplierName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (e.villageName || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVillage = villageFilter === 'all' || e.villageName === villageFilter;
      const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
      const matchesType = typeFilter === 'all' || e.supplierType === typeFilter;
      return matchesSearch && matchesVillage && matchesStatus && matchesType;
    })
  }, [sortedEntries, searchQuery, villageFilter, statusFilter, typeFilter])

  const villages = useMemo(() => {
    return Array.from(new Set(sortedEntries.map(e => e.villageName))).sort()
  }, [sortedEntries])

  if (!mounted || isLoading) return <div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10 px-2 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4">
        <div className="min-w-0">
          <h2 className="text-xl font-black text-rose-600 flex items-center gap-2 uppercase tracking-tight">
            <ShieldAlert className="h-6 w-6" /> गुणवत्ता मॉनिटरिंग (QUALITY MONITORING)
          </h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Problematic Suppliers Observation List</p>
        </div>
        <Button onClick={handleOpenAdd} className="w-full sm:w-auto font-black h-10 text-[10px] rounded-xl px-6 uppercase shadow-lg shadow-rose-200 bg-rose-600 hover:bg-rose-700">
          <Plus className="h-4 w-4 mr-1.5" /> नवीन निरीक्षण जोडा
        </Button>
      </div>

      <Card className="border shadow-none bg-white rounded-2xl overflow-hidden no-print">
        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3 bg-muted/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
            <input 
              placeholder="सप्लायर किंवा गाव शोधा..." 
              className="w-full pl-9 h-10 text-[11px] bg-white border-2 border-black rounded-xl font-black uppercase outline-none focus:ring-1" 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
            />
          </div>
          <Select value={villageFilter} onValueChange={setVillageFilter}>
            <SelectTrigger className="h-10 border-2 border-black rounded-xl font-black uppercase text-[9px]">
              <MapPin className="h-3.5 w-3.5 mr-2 text-rose-600"/><SelectValue placeholder="गाव निवडा" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-bold">सर्व गावे</SelectItem>
              {villages.map(v => <SelectItem key={v} value={v} className="font-bold">{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-10 border-2 border-black rounded-xl font-black uppercase text-[9px]">
              <User className="h-3.5 w-3.5 mr-2 text-rose-600"/><SelectValue placeholder="प्रकार" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-bold">सर्व प्रकार</SelectItem>
              <SelectItem value="Gavali" className="font-bold">गवळी</SelectItem>
              <SelectItem value="Gotha" className="font-bold">गोठा</SelectItem>
              <SelectItem value="Route" className="font-bold">रूट (Village)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 border-2 border-black rounded-xl font-black uppercase text-[9px]">
              <History className="h-3.5 w-3.5 mr-2 text-rose-600"/><SelectValue placeholder="स्थिती" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-bold">सर्व स्थिती</SelectItem>
              <SelectItem value="Active" className="font-bold text-rose-600">Active (प्रलंबित)</SelectItem>
              <SelectItem value="Resolved" className="font-bold text-emerald-600">Resolved (निकाली)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full overflow-x-auto">
          <Table className="min-w-[1000px] border-t">
            <TableHeader className="bg-slate-50">
              <TableRow className="h-10 border-b-2 border-black">
                <TableHead className="font-black text-[9px] uppercase px-4 whitespace-nowrap">तारीख</TableHead>
                <TableHead className="font-black text-[9px] uppercase px-4 whitespace-nowrap">सप्लायर / गाव</TableHead>
                <TableHead className="font-black text-[9px] uppercase px-4 whitespace-nowrap">सेंटर</TableHead>
                <TableHead className="font-black text-[9px] uppercase px-4">मुख्य समस्या (Reason)</TableHead>
                <TableHead className="font-black text-[9px] uppercase text-center px-4">स्थिती</TableHead>
                <TableHead className="font-black text-[9px] uppercase text-right px-4">क्रिया</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id} className="h-14 hover:bg-muted/30 transition-colors border-b last:border-0">
                  <TableCell className="px-4 py-2">
                    <span className="text-[10px] font-black">{entry.observationDate}</span>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-black text-[11px] uppercase text-slate-900">{entry.supplierName}</span>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="h-3.5 px-1 text-[7px] font-black border-none bg-primary/5 text-primary uppercase">{entry.supplierType}</Badge>
                        <span className="text-[8px] text-muted-foreground font-black uppercase flex items-center gap-0.5"><MapPin className="h-2 w-2" /> {entry.villageName}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <span className="text-[9px] font-bold uppercase opacity-70">{entry.chillingCenterName || "---"}</span>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <div className="flex flex-col gap-1">
                      <span className={cn("text-[10px] font-black uppercase", entry.status === 'Active' ? 'text-rose-600' : 'text-slate-500')}>{REASONS[entry.reason]}</span>
                      {entry.detailedRemarks && <p className="text-[8px] font-medium text-slate-400 line-clamp-1 italic">{entry.detailedRemarks}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center">
                    <Badge className={cn("h-5 px-2 text-[8px] font-black uppercase border-none", entry.status === 'Active' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700')}>
                      {entry.status === 'Active' ? 'प्रलंबित (Active)' : 'निकाली (Resolved)'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-2 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleOpenEdit(entry)}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => handleDelete(entry.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEntries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-[10px] font-black opacity-30 uppercase italic">
                    कोणतीही निरीक्षणे सापडली नाहीत.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[550px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white">
          <DialogHeader className="p-4 bg-rose-600 text-white sticky top-0 z-10">
            <DialogTitle className="text-sm font-black uppercase tracking-widest">
              {dialogMode === 'add' ? 'नवीन मॉनिटरिंग नोंद' : 'निरीक्षण अद्ययावत करा'}
            </DialogTitle>
            <DialogDescription className="text-[8px] text-white/70 uppercase">दूध गुणवत्ता आणि सप्लायर समस्यांची नोंद ठेवा.</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[75vh] p-4 sm:p-6">
            <div className="space-y-6 pb-10">
              <div className="space-y-4">
                <SectionTitle icon={User} title="१) सप्लायर माहिती" color="text-rose-600" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">सप्लायर प्रकार</Label>
                    <Select value={formData.supplierType} onValueChange={(v: any) => setFormData({...formData, supplierType: v})}>
                      <SelectTrigger className="h-9 text-[11px] border-2 border-black rounded-xl font-black"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Gavali" className="font-bold">गवळी</SelectItem><SelectItem value="Gotha" className="font-bold">गोठा</SelectItem><SelectItem value="Route" className="font-bold">रूट (Village)</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">सप्लायर / रूट नाव *</Label><Input value={formData.supplierName} onChange={e => setFormData({...formData, supplierName: e.target.value})} className="h-9 border-2 border-black rounded-xl font-bold text-xs" /></div>
                  <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">गाव *</Label><Input value={formData.villageName} onChange={e => setFormData({...formData, villageName: e.target.value})} className="h-9 border-2 border-black rounded-xl font-bold text-xs" /></div>
                  <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">चिलिंग सेंटर</Label><Input value={formData.chillingCenterName} onChange={e => setFormData({...formData, chillingCenterName: e.target.value})} className="h-9 border-2 border-black rounded-xl font-bold text-xs" /></div>
                </div>
              </div>

              <div className="space-y-4">
                <SectionTitle icon={AlertTriangle} title="२) निरीक्षणाचा तपशील" color="text-rose-600" />
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">निरीक्षण तारीख</Label><Input type="date" value={formData.observationDate} onChange={e => setFormData({...formData, observationDate: e.target.value})} className="h-9 border-2 border-black rounded-xl font-black text-xs" /></div>
                    <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">सद्यस्थिती</Label>
                      <Select value={formData.status} onValueChange={(v: any) => setFormData({...formData, status: v})}>
                        <SelectTrigger className="h-9 border-2 border-black rounded-xl font-black text-[10px]"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Active" className="font-bold text-rose-600">Active (प्रलंबित)</SelectItem><SelectItem value="Resolved" className="font-bold text-emerald-600">Resolved (निकाली)</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">समस्येचे मुख्य कारण (Reason) *</Label>
                    <Select value={formData.reason} onValueChange={(v: any) => setFormData({...formData, reason: v})}>
                      <SelectTrigger className="h-10 border-2 border-black rounded-xl font-black text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(REASONS).map(([k, v]) => <SelectItem key={k} value={k} className="font-bold text-xs">{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">सविस्तर शेरा (Detailed Remarks)</Label><Textarea value={formData.detailedRemarks} onChange={e => setFormData({...formData, detailedRemarks: e.target.value})} className="h-24 border-2 border-black rounded-xl p-3 text-xs font-medium shadow-inner" placeholder="उदा. दुधाचा नमुना पॉझिटिव्ह आला आहे..." /></div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-4 border-t bg-muted/5 flex flex-row gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1 h-12 rounded-2xl font-black uppercase text-[11px] border-2 border-black bg-white">रद्द</Button>
            <Button onClick={handleSave} className="flex-[2] h-12 rounded-2xl shadow-xl shadow-rose-200 font-black uppercase text-[11px] tracking-widest transition-all active:scale-95 bg-rose-600 text-white flex items-center justify-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> माहिती जतन करा
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
