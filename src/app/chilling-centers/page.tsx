
"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Plus, Search, Thermometer, Edit, X, ChevronRight,
  Printer, Milk, ShieldCheck, Box, Truck, 
  Zap, Warehouse, User, MapPin, CheckCircle2,
  Trash2, Droplets, Sun, Waves, Wind, FlaskConical, Shirt, Clock, FileText,
  Users, Activity, ClipboardCheck, ChevronUp, ChevronDown, Building2, Users2, Sparkles, Briefcase, PlusCircle, Laptop,
  Flame, Scale, HeartPulse, ShieldAlert, History, AlertTriangle, Info, TrendingUp, HelpCircle, Wallet
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { ChillingCenter, Supplier, SupplierType, ChillingRouteItem, TankItem, TankerLogItem, QualityMonitoringEntry, MonitoringReason, SurveyData, CompetitorData, EquipmentItem } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc, query, where } from "firebase/firestore"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const SectionTitle = ({ icon: Icon, title, color = "text-primary" }: any) => (
  <div className={cn("flex items-center gap-1.5 border-b pb-1 mb-2 mt-3", color === 'text-primary' ? 'border-primary/20' : 'border-black/20')}>
    {Icon && <Icon className={cn("h-3.5 w-3.5", color)} />}
    <h3 className={cn("text-[10px] font-black uppercase tracking-wider", color)}>{title}</h3>
  </div>
)

const REASONS: Record<MonitoringReason, string> = {
  'Repeated Adulteration': 'सतत दूधामध्ये भेसळ आढळणे',
  'Excessive Odor': 'दुधाला जास्त वास येणे',
  'Late Milk Arrival': 'दूध उशिरा चिलिंग सेंटरवर पोहोचणे',
  'Poor Milk Quality': 'दूध गुणवत्तेमध्ये वारंवार तक्रारी येणे',
  'High Bacterial Contamination': 'बॅक्टेरियाचे प्रमाण जास्त (Bacterial)',
  'Irregular Milk Supply': 'अनियमित दूध पुरवठा (Irregular)',
  'Other': 'इतर विशेष कारणे'
}

const SurveyFields = ({ data, onUpdate, hideProducers = false }: { data: SurveyData, onUpdate: (updates: Partial<SurveyData>) => void, hideProducers?: boolean }) => {
  const addCompetitor = () => {
    const newComp: CompetitorData = { id: crypto.randomUUID(), name: "", count: "0", producers: "0", milk: "0", status: "" };
    onUpdate({ competitors: [...(data.competitors || []), newComp] });
  };

  const removeCompetitor = (id: string) => {
    onUpdate({ competitors: (data.competitors || []).filter(c => c.id !== id) });
  };

  const updateCompetitor = (id: string, updates: Partial<CompetitorData>) => {
    onUpdate({ competitors: (data.competitors || []).map(c => c.id === id ? { ...c, ...updates } : c) });
  };

  return (
    <div className="space-y-6 mt-4 p-4 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 text-left">
      <div>
        <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 flex items-center gap-2"><Activity className="h-3 w-3" /> जनावरांची माहिती (A)</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="space-y-1"><Label className="text-[8px] font-black uppercase">एकूण जनावरे</Label><Input value={data.animals?.total || "0"} onChange={e => onUpdate({ animals: { ...data.animals, total: e.target.value } } as any)} className="h-8 text-[10px] border-black font-black" /></div>
          <div className="space-y-1"><Label className="text-[8px] font-black uppercase">गाय संख्या</Label><Input value={data.animals?.cows || "0"} onChange={e => onUpdate({ animals: { ...data.animals, cows: e.target.value } } as any)} className="h-8 text-[10px] border-black font-black" /></div>
          <div className="space-y-1"><Label className="text-[8px] font-black uppercase">म्हेस संख्या</Label><Input value={data.animals?.buffaloes || "0"} onChange={e => onUpdate({ animals: { ...data.animals, buffaloes: e.target.value } } as any)} className="h-8 text-[10px] border-black font-black" /></div>
          <div className="space-y-1"><Label className="text-[8px] font-black uppercase">दुभती</Label><Input value={data.animals?.milking || "0"} onChange={e => onUpdate({ animals: { ...data.animals, milking: e.target.value } } as any)} className="h-8 text-[10px] border-black font-black" /></div>
          <div className="space-y-1"><Label className="text-[8px] font-black uppercase">भाकड</Label><Input value={data.animals?.dry || "0"} onChange={e => onUpdate({ animals: { ...data.animals, dry: e.target.value } } as any)} className="h-8 text-[10px] border-black font-black" /></div>
          <div className="space-y-1"><Label className="text-[8px] font-black uppercase">इतर</Label><Input value={data.animals?.others || "0"} onChange={e => onUpdate({ animals: { ...data.animals, others: e.target.value } } as any)} className="h-8 text-[10px] border-black font-black" /></div>
        </div>
      </div>

      {!hideProducers && (
        <div>
          <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 flex items-center gap-2"><Users2 className="h-3 w-3" /> उत्पादक माहिती (B)</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1"><Label className="text-[8px] font-black uppercase">एकूण उत्पादक</Label><Input value={data.producers?.total || "0"} onChange={e => onUpdate({ producers: { ...data.producers, total: e.target.value } } as any)} className="h-8 text-[10px] border-black font-black" /></div>
            <div className="space-y-1"><Label className="text-[8px] font-black uppercase">नियमित</Label><Input value={data.producers?.regular || "0"} onChange={e => onUpdate({ producers: { ...data.producers, regular: e.target.value } } as any)} className="h-8 text-[10px] border-black font-black" /></div>
            <div className="space-y-1"><Label className="text-[8px] font-black uppercase">नवीन</Label><Input value={data.producers?.new || "0"} onChange={e => onUpdate({ producers: { ...data.producers, new: e.target.value } } as any)} className="h-8 text-[10px] border-black font-black" /></div>
            <div className="space-y-1"><Label className="text-[8px] font-black uppercase">संभाव्य</Label><Input value={data.producers?.potential || "0"} onChange={e => onUpdate({ producers: { ...data.producers, potential: e.target.value } } as any)} className="h-8 text-[10px] border-black font-black" /></div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3 border-b-2 border-rose-200 pb-1">
          <h4 className="text-[10px] font-black uppercase text-rose-600 flex items-center gap-2"><ShieldAlert className="h-3 w-3" /> स्पर्धक डेअरी माहिती (C)</h4>
          <Button size="sm" onClick={addCompetitor} className="h-6 text-[8px] font-black uppercase bg-rose-600 text-white rounded-lg shadow-md border-none">+ स्पर्धक जोडा</Button>
        </div>
        <div className="border-2 border-rose-100 rounded-xl overflow-hidden shadow-sm bg-white">
          <ScrollArea className="w-full">
            <Table className="text-[10px] min-w-[700px]">
              <TableHeader className="bg-rose-50/50">
                <TableRow className="h-8 border-b-2 border-rose-100">
                  <TableHead className="font-black text-[9px] uppercase px-2">स्पर्धक नाव</TableHead>
                  <TableHead className="font-black text-[9px] uppercase px-2 text-center">संख्या</TableHead>
                  <TableHead className="font-black text-[9px] uppercase px-2 text-center">उत्पादक</TableHead>
                  <TableHead className="font-black text-[9px] uppercase px-2 text-center">अंदाजे दूध</TableHead>
                  <TableHead className="font-black text-[9px] uppercase px-2">स्थिती</TableHead>
                  <TableHead className="w-10 px-2"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data.competitors || []).map((comp) => (
                  <TableRow key={comp.id} className="h-10 border-b last:border-0 hover:bg-rose-50/20">
                    <TableCell className="p-1"><Input value={comp.name} onChange={e => updateCompetitor(comp.id, { name: e.target.value })} className="h-7 text-[10px] border-none font-bold bg-transparent shadow-none" placeholder="डेअरी नाव" /></TableCell>
                    <TableCell className="p-1"><Input value={comp.count} onChange={e => updateCompetitor(comp.id, { count: e.target.value })} className="h-7 text-[10px] border-none text-center font-black bg-transparent shadow-none" /></TableCell>
                    <TableCell className="p-1"><Input value={comp.producers} onChange={e => updateCompetitor(comp.id, { producers: e.target.value })} className="h-7 text-[10px] border-none text-center font-black bg-transparent shadow-none" /></TableCell>
                    <TableCell className="p-1"><Input value={comp.milk} onChange={e => updateCompetitor(comp.id, { milk: e.target.value })} className="h-7 text-[10px] border-none text-center font-black bg-transparent shadow-none" /></TableCell>
                    <TableCell className="p-1"><Input value={comp.status} onChange={e => updateCompetitor(comp.id, { status: e.target.value })} className="h-7 text-[10px] border-none font-bold bg-transparent shadow-none" placeholder="उदा. स्पर्धा जास्त" /></TableCell>
                    <TableCell className="p-1 text-center"><Button variant="ghost" size="icon" onClick={() => removeCompetitor(comp.id)} className="h-7 w-7 text-rose-400 p-0"><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
                  </TableRow>
                ))}
                {(!data.competitors || data.competitors.length === 0) && (
                  <TableRow><TableCell colSpan={6} className="h-12 text-center italic opacity-30 font-bold">एकही स्पर्धक जोडलेला नाही.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h4 className="text-[10px] font-black uppercase text-primary mb-3 flex items-center gap-2"><Sparkles className="h-3 w-3" /> आमच्या सुविधा (D)</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { k: 'feed', l: 'पशुखाद्य' }, { k: 'vet', l: 'पशुवैद्यकीय' }, { k: 'ai', l: 'कृत्रिम रेतन' },
              { k: 'insurance', l: 'विमा' }, { k: 'loan', l: 'कर्ज' }, { k: 'training', l: 'प्रशिक्षण' },
              { k: 'bonus', l: 'बोनस योजना' }
            ].map(f => (
              <div key={f.k} className="flex items-center space-x-2 bg-white p-1.5 rounded border-2 border-black">
                <Checkbox checked={(data.our_facilities as any)?.[f.k] || false} onCheckedChange={v => onUpdate({ our_facilities: { ...data.our_facilities, [f.k]: !!v } } as any)} className="h-3 w-3" />
                <Label className="text-[8px] font-black uppercase leading-none">{f.l}</Label>
              </div>
            ))}
            <Input placeholder="इतर..." value={data.our_facilities?.other || ""} onChange={e => onUpdate({ our_facilities: { ...data.our_facilities, other: e.target.value } } as any)} className="h-7 text-[9px] border-black col-span-2 font-bold" />
          </div>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase text-rose-600 mb-3 flex items-center gap-2"><ShieldAlert className="h-3 w-3" /> स्पर्धक सुविधा (E)</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { k: 'feed', l: 'पशुखाद्य' }, { k: 'vet', l: 'पशुवैद्यकीय' }, { k: 'bonus', l: 'बोनस' },
              { k: 'rate', l: 'जास्त दर' }, { k: 'loan', l: 'कर्ज' }, { k: 'free', l: 'मोफत सेवा' }
            ].map(f => (
              <div key={f.k} className="flex items-center space-x-2 bg-white p-1.5 rounded border-2 border-rose-300">
                <Checkbox checked={(data.comp_facilities as any)?.[f.k] || false} onCheckedChange={v => onUpdate({ comp_facilities: { ...data.comp_facilities, [f.k]: !!v } } as any)} className="h-3 w-3 border-rose-300" />
                <Label className="text-[8px] font-black uppercase leading-none">{f.l}</Label>
              </div>
            ))}
            <Input placeholder="इतर..." value={data.comp_facilities?.other || ""} onChange={e => onUpdate({ comp_facilities: { ...data.comp_facilities, other: e.target.value } } as any)} className="h-7 text-[9px] border-black col-span-2 font-bold" />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 flex items-center gap-2"><Info className="h-3 w-3" /> इतर माहिती (F)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1"><Label className="text-[8px] font-black uppercase">संकलन परिस्थिती</Label><Input value={data.other_info?.situation || ""} onChange={e => onUpdate({ other_info: { ...data.other_info, situation: e.target.value } } as any)} className="h-8 text-[10px] border-black font-bold" /></div>
          <div className="space-y-1"><Label className="text-[8px] font-black uppercase">वाढीची संधी</Label><Input value={data.other_info?.opportunity || ""} onChange={e => onUpdate({ other_info: { ...data.other_info, opportunity: e.target.value } } as any)} className="h-8 text-[10px] border-black font-bold" /></div>
          <div className="space-y-1"><Label className="text-[8px] font-black uppercase">प्रमुख अडचणी</Label><Input value={data.other_info?.problems || ""} onChange={e => onUpdate({ other_info: { ...data.other_info, problems: e.target.value } } as any)} className="h-8 text-[10px] border-black font-bold" /></div>
          <div className="space-y-1"><Label className="text-[8px] font-black uppercase">विशेष निरीक्षण</Label><Input value={data.other_info?.observation || ""} onChange={e => onUpdate({ other_info: { ...data.other_info, observation: e.target.value } } as any)} className="h-8 text-[10px] border-black font-bold" /></div>
          <div className="space-y-1"><Label className="text-[8px] font-black uppercase">अधिकारी टिप्पणी</Label><Input value={data.other_info?.official_note || ""} onChange={e => onUpdate({ other_info: { ...data.other_info, official_note: e.target.value } } as any)} className="h-8 text-[10px] border-black font-bold" /></div>
          <div className="space-y-1"><Label className="text-[8px] font-black uppercase">अतिरिक्त नोंद (Remarks)</Label><Input value={data.other_info?.remarks || ""} onChange={e => onUpdate({ other_info: { ...data.other_info, remarks: e.target.value } } as any)} className="h-8 text-[10px] border-black font-bold" /></div>
        </div>
      </div>
    </div>
  )
}

const EquipmentTable = ({ equipment, onAdd, onRemove, onUpdate }: { equipment: EquipmentItem[], onAdd: () => void, onRemove: (id: string) => void, onUpdate: (id: string, updates: Partial<EquipmentItem>) => void }) => (
  <div className="space-y-2 mt-4">
    <div className="flex items-center justify-between"><h4 className="text-[9px] font-black uppercase tracking-widest text-slate-500">साहित्याची यादी (INVENTORY)</h4><Button variant="outline" size="sm" onClick={onAdd} className="h-6 text-[8px] font-black px-2 border-black">+ जोडा</Button></div>
    <div className="border border-black rounded-lg overflow-hidden shadow-sm">
      <ScrollArea className="w-full">
        <Table className="text-[10px] min-w-[500px]">
          <TableHeader className="bg-slate-50 h-7">
            <TableRow>
              <TableHead className="h-7 px-2">नाव</TableHead>
              <TableHead className="h-7 px-2 text-center">नग</TableHead>
              <TableHead className="h-7 px-2">मालकी</TableHead>
              <TableHead className="w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipment.map(item => (
              <TableRow key={item.id} className="h-8">
                <TableCell className="p-0 border-r"><Input value={item.name} onChange={e => onUpdate(item.id, { name: e.target.value })} className="h-7 border-none text-[10px]" /></TableCell>
                <TableCell className="p-0 border-r"><Input type="number" value={item.quantity} onChange={e => onUpdate(item.id, { quantity: Number(e.target.value) })} className="h-7 border-none text-center text-[10px]" /></TableCell>
                <TableCell className="p-0 border-r"><select value={item.ownership} onChange={e => onUpdate(item.id, { ownership: e.target.value as any })} className="w-full h-7 bg-transparent text-[9px] outline-none px-1 font-bold"><option value="Company">डेअरी</option><option value="Self">स्वतःची</option></select></TableCell>
                <TableCell className="p-0 text-center"><Button variant="ghost" size="icon" onClick={() => onRemove(item.id)} className="h-7 w-7 text-rose-500 p-0"><X className="h-3 w-3" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  </div>
)

const BreedTable = ({ breeds, onAdd, onRemove, onUpdate }: { breeds: any[], onAdd: () => void, onRemove: (id: string) => void, onUpdate: (id: string, updates: any) => void }) => (
  <div className="space-y-2 mt-4">
    <div className="flex items-center justify-between"><h4 className="text-[9px] font-black uppercase tracking-widest text-slate-500">जनावरे ब्रीड प्रमाणे (BREED INFO)</h4><Button variant="outline" size="sm" onClick={onAdd} className="h-6 text-[8px] font-black px-2 border-black">+ जोडा</Button></div>
    <div className="border border-black rounded-lg overflow-hidden shadow-sm">
      <ScrollArea className="w-full">
        <Table className="text-[10px] min-w-[500px]">
          <TableHeader className="bg-slate-50 h-7">
            <TableRow>
              <TableHead className="h-7 px-2">जात (Breed)</TableHead>
              <TableHead className="h-7 px-2 text-center">नग</TableHead>
              <TableHead className="h-7 px-2 text-center">Avg(L)</TableHead>
              <TableHead className="w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {breeds?.map(item => (
              <TableRow key={item.id} className="h-8">
                <TableCell className="p-0 border-r"><Input value={item.breed} onChange={e => onUpdate(item.id, { breed: e.target.value })} className="h-7 border-none text-[10px]" /></TableCell>
                <TableCell className="p-0 border-r"><Input type="number" value={item.count} onChange={e => onUpdate(item.id, { count: e.target.value })} className="h-7 border-none text-center text-[10px]" /></TableCell>
                <TableCell className="p-0 border-r"><Input type="number" value={item.avg} onChange={e => onUpdate(item.id, { avg: e.target.value })} className="h-7 border-none text-center text-[10px]" /></TableCell>
                <TableCell className="p-0 text-center"><Button variant="ghost" size="icon" onClick={() => onRemove(item.id)} className="h-7 w-7 text-rose-500 p-0"><X className="h-3 w-3" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  </div>
)

const PrintSurveyBlock = ({ title, data }: { title: string, data?: any }) => {
  if (!data) return null;
  const hasData = data.animals?.total || data.producers?.total || (data.competitors && data.competitors.length > 0);
  if (!hasData) return null;

  return (
    <div className="w-full mt-6 space-y-4 break-inside-avoid">
      <h4 className="text-[11px] font-black uppercase text-primary border-b-2 border-black pb-1 mb-2 tracking-widest">{title} - सर्वेक्षण विश्लेषण</h4>
      
      <div className="grid grid-cols-2 gap-8 text-[9px]">
        <div className="space-y-1.5">
          <p className="font-black border-b border-black/10 text-slate-400 uppercase text-[7px]">जनावरे & उत्पादक (A & B)</p>
          <div className="flex justify-between"><span>एकूण जनावरे (G:{data.animals?.cows}/M:{data.animals?.buffaloes})</span><span className="font-black">{data.animals?.total || 0}</span></div>
          <div className="flex justify-between"><span>दुभती / भाकड</span><span className="font-black">{data.animals?.milking || 0} / {data.animals?.dry || 0}</span></div>
          {data.producers?.total && <div className="flex justify-between"><span>एकूण उत्पादक (नियमित/नवीन)</span><span className="font-black">{data.producers?.total || 0} ({data.producers?.regular || 0} / {data.producers?.new || 0})</span></div>}
        </div>
        <div className="space-y-1.5">
          <p className="font-black border-b border-black/10 text-slate-400 uppercase text-[7px]">स्पर्धक विश्लेषण (COMPETITORS - C)</p>
          <table className="w-full text-[8px] border-collapse">
            <thead><tr className="bg-slate-50 border-b border-black/10"><th className="text-left p-0.5">नाव</th><th className="text-center p-0.5">उत्पादक</th><th className="text-right p-0.5">दूध</th></tr></thead>
            <tbody>
              {(data.competitors || []).map((c: any, i: number) => (
                <tr key={i} className="border-b border-black/5 last:border-0"><td className="p-0.5 font-bold uppercase">{c.name}</td><td className="text-center p-0.5">{c.producers}</td><td className="text-right p-0.5">{c.milk}L</td></tr>
              ))}
              {(!data.competitors || data.competitors.length === 0) && (<tr><td colSpan={3} className="text-center opacity-30 p-1">---</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-8 text-[9px]">
        <div className="space-y-1.5">
          <p className="font-black border-b border-black/10 text-slate-400 uppercase text-[7px]">दिलेल्या सुविधा (D & E)</p>
          <div className="space-y-1">
            <p className="italic leading-tight">आमच्या: {Object.entries(data.our_facilities || {}).filter(([k,v])=>v && k!=='other').map(([k])=>k.toUpperCase()).join(', ') || "---"}</p>
            <p className="italic leading-tight text-rose-600">स्पर्धक: {Object.entries(data.comp_facilities || {}).filter(([k,v])=>v && k!=='other').map(([k])=>k.toUpperCase()).join(', ') || "---"}</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="font-black border-b border-black/10 text-slate-400 uppercase text-[7px]">महत्त्वाची निरीक्षणे (F)</p>
          <p className="leading-tight font-medium text-slate-700">{data.other_info?.observation || "---"}</p>
          {data.other_info?.official_note && <p className="leading-tight font-black text-primary uppercase text-[7px]">टिप्पणी: {data.other_info.official_note}</p>}
        </div>
      </div>
    </div>
  )
}

const PrintNestedData = ({ title, data }: any) => {
    if (!data || data.length === 0) return null;
    return (
        <div className="w-full mt-6 break-inside-avoid">
            <h4 className="text-[10px] font-black uppercase text-primary border-b-2 border-black pb-1 mb-2">{title}</h4>
            <div className="border border-black rounded-sm overflow-hidden">
                <table className="w-full text-[8px] border-collapse">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="p-1 border border-black">तपशील (Details)</th>
                            <th className="p-1 border border-black text-center">माहिती (Value)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item: any, idx: number) => (
                            <tr key={idx}>
                                <td className="p-1 border border-black font-bold uppercase">{item.label}</td>
                                <td className="p-1 border border-black text-center">{String(item.value)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default function ChillingCentersPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const centersQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'chillingCenters')
  }, [db, user])

  const { data: centers, isLoading } = useCollection<ChillingCenter>(centersQuery)

  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedCenter, setSelectedCenter] = useState<ChillingCenter | null>(null)
  
  const [formData, setFormData] = useState<Partial<ChillingCenter>>({
    name: "", ownerName: "", code: "", address: "", mobile: "",
    cowMilk: { quantity: 0, fat: 0, snf: 0 },
    buffaloMilk: { quantity: 0, fat: 0, snf: 0 },
    hasBmc: false, hasIbt: false,
    hasEtp: false, hasSolar: false, hasHotWater: false, hasDrainage: false,
    hasLab: false, staffUniform: false,
    tanks: [], tankerLogs: [],
    morningTime: "", eveningTime: "",
    supplierCount: "0", fatMachineBrand: "",
    otherDairySupply: "",
    fssaiNumber: "", fssaiExpiry: "",
    waterSource: "Borewell", powerBackup: "Generator", hygieneGrade: "A",
    hasTransportLicenses: false, pestControlDone: false, 
    staffHealthCheckDone: false, calibrationDone: false, fireSafetyOk: false,
    routes: [], gavaliSuppliers: [], gothaSuppliers: [],
    animals: { total: "0", cows: "0", buffaloes: "0", milking: "0", dry: "0", others: "0" },
    producers: { total: "0", regular: "0", new: "0", potential: "0" },
    competitors: [],
    our_facilities: { feed: false, vet: false, ai: false, insurance: false, loan: false, training: false, bonus: false, other: "" },
    comp_facilities: { feed: false, vet: false, bonus: false, rate: false, loan: false, free: false, other: "" },
    other_info: { situation: "", opportunity: "", problems: "", observation: "", official_note: "", remarks: "" }
  })

  // State for monitoring tab inputs
  const [monitoringForm, setMonitoringForm] = useState({
    supplierType: 'Gavali' as any,
    supplierName: "",
    villageName: "",
    reason: 'Repeated Adulteration' as MonitoringReason,
    detailedRemarks: "",
    observationDate: new Date().toISOString().split('T')[0],
    status: 'Active' as any
  })

  const [activeSubTab, setActiveSubTab] = useState<'main' | 'routes' | 'gavali' | 'gotha' | 'monitoring'>('main')

  const monitoringQuery = useMemoFirebase(() => {
    if (!db || !user || !editingId) return null
    return query(
      collection(db, 'users', user.uid, 'qualityMonitoring'), 
      where('chillingCenterId', '==', editingId)
    )
  }, [db, user, editingId])

  const { data: monitoringEntries } = useCollection<QualityMonitoringEntry>(monitoringQuery)

  const sortedMonitoringEntries = useMemo(() => {
    return (monitoringEntries || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [monitoringEntries])

  useEffect(() => setMounted(true), [])

  const handleOpenAdd = useCallback(() => {
    setDialogMode('add'); setEditingId(null); setActiveSubTab('main');
    setFormData({
      name: "", ownerName: "", code: "", address: "", mobile: "",
      cowMilk: { quantity: 0, fat: 0, snf: 0 },
      buffaloMilk: { quantity: 0, fat: 0, snf: 0 },
      hasBmc: false, hasIbt: false,
      hasEtp: false, hasSolar: false, hasHotWater: false, hasDrainage: false,
      hasLab: false, staffUniform: false,
      tanks: [], tankerLogs: [],
      morningTime: "", eveningTime: "",
      supplierCount: "0", fatMachineBrand: "",
      otherDairySupply: "",
      fssaiNumber: "", fssaiExpiry: "",
      waterSource: "Borewell", powerBackup: "Generator", hygieneGrade: "A",
      hasTransportLicenses: false, pestControlDone: false, 
      staffHealthCheckDone: false, calibrationDone: false, fireSafetyOk: false,
      routes: [], gavaliSuppliers: [], gothaSuppliers: [],
      animals: { total: "0", cows: "0", buffaloes: "0", milking: "0", dry: "0", others: "0" },
      producers: { total: "0", regular: "0", new: "0", potential: "0" },
      competitors: [],
      our_facilities: { feed: false, vet: false, ai: false, insurance: false, loan: false, training: false, bonus: false, other: "" },
      comp_facilities: { feed: false, vet: false, bonus: false, rate: false, loan: false, free: false, other: "" },
      other_info: { situation: "", opportunity: "", problems: "", observation: "", official_note: "", remarks: "" }
    })
    setIsDialogOpen(true)
  }, [])

  const handleOpenEdit = useCallback((center: ChillingCenter) => {
    setDialogMode('edit'); setEditingId(center.id); setActiveSubTab('main');
    setFormData(center)
    setIsDialogOpen(true)
  }, [])

  const handleSave = () => {
    if (!formData.name || !formData.code || !db || !user) {
      toast({ title: "त्रुटी", description: "नाव आणि कोड आवश्यक आहे.", variant: "destructive" })
      return
    }
    const data = { ...formData, updatedAt: new Date().toISOString() }
    if (dialogMode === 'add') {
      addDocumentNonBlocking(collection(db, 'users', user.uid, 'chillingCenters'), data)
      toast({ title: "यशस्वी", description: "चिलिंग सेंटर जोडले गेले." })
    } else if (editingId) {
      updateDocumentNonBlocking(doc(db, 'users', user.uid, 'chillingCenters', editingId), data)
      toast({ title: "यशस्वी", description: "माहिती अद्ययावत झाली." })
    }
    setIsDialogOpen(false)
  }

  const handleAddMonitoring = () => {
    if (!db || !user || !editingId || !formData.name) {
       toast({ title: "त्रुटी", description: "प्रथम मुख्य माहिती जतन करा.", variant: "destructive" })
       return
    }
    if (!monitoringForm.supplierName || !monitoringForm.villageName) {
       toast({ title: "त्रुटी", description: "सप्लायर आणि गावाचे नाव आवश्यक आहे.", variant: "destructive" })
       return
    }

    const entry = {
      ...monitoringForm,
      chillingCenterId: editingId,
      chillingCenterName: formData.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'qualityMonitoring'), entry)
    setMonitoringForm({ ...monitoringForm, supplierName: "", villageName: "", detailedRemarks: "" })
    toast({ title: "यशस्वी", description: "निरीक्षण यादीत जोडले गेले." })
  }

  const toggleMonitoringStatus = (entry: QualityMonitoringEntry) => {
    if (!db || !user) return
    const newStatus = entry.status === 'Active' ? 'Resolved' : 'Active'
    updateDocumentNonBlocking(doc(db, 'users', user.uid, 'qualityMonitoring', entry.id), {
      status: newStatus,
      updatedAt: new Date().toISOString()
    })
  }

  const handleDeleteMonitoring = (id: string) => {
    if (!db || !user) return
    if (confirm("ही नोंद हटवायची आहे का?")) {
      deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'qualityMonitoring', id))
    }
  }

  const addTank = () => setFormData(prev => ({ ...prev, tanks: [...(prev.tanks || []), { id: crypto.randomUUID(), label: `टाकी ${(prev.tanks?.length || 0) + 1}`, capacity: "" }] }))
  const removeTank = (id: string) => setFormData(prev => ({ ...prev, tanks: prev.tanks?.filter(t => t.id !== id) }))
  const updateTank = (id: string, val: string) => setFormData(prev => ({ ...prev, tanks: prev.tanks?.map(t => t.id === id ? { ...t, capacity: val } : t) }))

  const addTankerLog = () => setFormData(prev => ({ ...prev, tankerLogs: [...(prev.tankerLogs || []), { id: crypto.randomUUID(), tankerNo: "", arrivalTime: "", departureTime: "", qtyFilled: "" }] }))
  const removeTankerLog = (id: string) => setFormData(prev => ({ ...prev, tankerLogs: prev.tankerLogs?.filter(t => t.id !== id) }))
  const updateTankerLog = (id: string, updates: Partial<TankerLogItem>) => setFormData(prev => ({ ...prev, tankerLogs: prev.tankerLogs?.map(t => t.id === id ? { ...t, ...updates } : t) }))

  const updateSubItem = (listKey: 'routes' | 'gavaliSuppliers' | 'gothaSuppliers', id: string, updates: any) => {
    setFormData(prev => {
      const list = (prev[listKey] as any[] || []);
      return {
        ...prev,
        [listKey]: list.map(item => item.id === id ? { ...item, ...updates } : item)
      }
    })
  }

  const summaryStats = useMemo(() => {
    if (!selectedCenter) return { gavalis: 0, producers: 0, totalAnimals: 0 };
    let totalGavalis = (selectedCenter.gavaliSuppliers?.length || 0);
    let totalProducers = Number(selectedCenter.producers?.total || 0);
    totalProducers += (selectedCenter.routes?.reduce((acc, r) => acc + Number(r.producerCount || 0), 0) || 0);
    let totalAnimals = Number(selectedCenter.animals?.total || 0);
    totalAnimals += (selectedCenter.routes?.reduce((acc, r) => acc + Number(r.animals?.total || 0), 0) || 0);
    return { gavalis: totalGavalis, producers: totalProducers, totalAnimals };
  }, [selectedCenter]);

  const filteredCenters = useMemo(() => {
    return (centers || []).filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || (c.code || "").toString().includes(searchQuery))
  }, [centers, searchQuery])

  // Logic to handle picking supplier in Tab 5
  const currentAvailableSuppliers = useMemo(() => {
    if (monitoringForm.supplierType === 'Gavali') return formData.gavaliSuppliers || [];
    if (monitoringForm.supplierType === 'Route') return formData.routes?.map(r => ({ name: r.routeName, address: r.collectionArea })) || [];
    if (monitoringForm.supplierType === 'Gotha') return formData.gothaSuppliers || [];
    return [];
  }, [monitoringForm.supplierType, formData]);

  if (!mounted || isLoading) return <div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10 px-2 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b pb-4 no-print text-center sm:text-left">
        <div className="min-w-0">
          <h2 className="text-xl font-black text-foreground flex items-center justify-center sm:justify-start gap-2 uppercase tracking-tight">
            <Thermometer className="h-6 w-6 text-primary" /> चिलिंग सेंटर (CHILLING)
          </h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Infrastructure & Analytics Audit</p>
        </div>
        <Button onClick={handleOpenAdd} className="w-full sm:w-auto font-black h-10 text-[10px] rounded-xl px-6 uppercase shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-1.5" /> नवीन चिलिंग सेंटर
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-4 border shadow-none bg-white rounded-2xl overflow-hidden no-print">
          <div className="p-3 border-b bg-muted/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
              <input placeholder="शोधा..." className="w-full pl-9 h-10 text-[12px] bg-white border-2 border-black rounded-xl font-black uppercase outline-none focus:ring-1 focus:ring-primary" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <ScrollArea className="h-[200px] lg:h-[600px]">
            <div className="divide-y">
              {filteredCenters.map(center => (
                <div key={center.id} className={`p-3 cursor-pointer hover:bg-primary/5 transition-colors ${selectedCenter?.id === center.id ? 'bg-primary/5 border-l-4 border-primary' : ''}`} onClick={() => setSelectedCenter(center)}>
                  <h4 className="font-black text-[12px] text-slate-900 truncate uppercase tracking-tight">{center.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge variant="secondary" className="text-[8px] font-black h-4 px-1.5 rounded-md">ID: {center.code}</Badge>
                    <span className="text-[9px] text-muted-foreground flex items-center gap-1 font-bold uppercase truncate"><MapPin className="h-3 w-3" /> {center.address || "---"}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="lg:col-span-8 border shadow-none bg-white rounded-3xl overflow-hidden min-h-[500px] flex flex-col items-center">
          {selectedCenter ? (
            <ScrollArea className="w-full h-full lg:max-h-[800px]">
              <div className="p-4 sm:p-8 space-y-6 printable-report flex flex-col items-center shadow-none w-full max-w-[210mm] mx-auto text-left bg-white font-sans text-slate-900">
                <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 no-print">
                   <div className="bg-primary/5 p-3 rounded-2xl border border-primary/10 text-center"><p className="text-[8px] font-black uppercase text-primary mb-1">एकूण गवळी</p><p className="text-xl font-black">{summaryStats.gavalis}</p></div>
                   <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 text-center"><p className="text-[8px] font-black uppercase text-emerald-600 mb-1">एकूण उत्पादक</p><p className="text-xl font-black">{summaryStats.producers}</p></div>
                   <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-center"><p className="text-[8px] font-black uppercase text-blue-600 mb-1">एकूण जनावरे</p><p className="text-xl font-black">{summaryStats.totalAnimals}</p></div>
                   <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 text-center"><p className="text-[8px] font-black uppercase text-amber-600 mb-1">एकूण दूध क्षमता</p><p className="text-xl font-black">{((selectedCenter.cowMilk?.quantity || 0) + (selectedCenter.buffaloMilk?.quantity || 0)).toFixed(1)}L</p></div>
                </div>

                <div className="w-full flex items-center justify-between no-print mb-4 border-b pb-2">
                  <Badge className="bg-primary/10 text-primary border-none uppercase text-[10px] font-black">CHILLING CENTER FULL AUDIT</Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 rounded-xl font-black uppercase text-[10px] border-2 border-black" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1.5" /> प्रिंट</Button>
                    <Button variant="outline" size="sm" className="h-8 rounded-xl font-black uppercase text-[10px] border-2 border-black text-primary" onClick={() => handleOpenEdit(selectedCenter)}><Edit className="h-4 w-4 mr-1.5" /> बदल करा</Button>
                  </div>
                </div>

                <div className="w-full border-b-[4px] border-black pb-3 mb-6 text-center">
                  <h3 className="text-[18pt] sm:text-[24pt] font-black uppercase text-primary tracking-[0.1em]">{selectedCenter.name}</h3>
                  <p className="text-[10pt] font-black text-muted-foreground uppercase tracking-widest mt-1">ID: {selectedCenter.code} | चिलिंग सेंटर सविस्तर सर्वेक्षण अहवाल</p>
                </div>
                
                <div className="grid grid-cols-2 gap-10 w-full mb-6 text-[12px] font-bold">
                  <div className="space-y-4">
                    <SectionTitle icon={Warehouse} title="१) प्राथमिक माहिती (PRIMARY)" color="text-primary" />
                    <div className="space-y-2">
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">मालक</span><span>{selectedCenter.ownerName || "-"}</span></div>
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">मोबाईल</span><span>{selectedCenter.mobile || "-"}</span></div>
                      <div className="flex flex-col gap-1"><span className="text-muted-foreground uppercase text-[10px]">पत्ता</span><span>{selectedCenter.address || "-"}</span></div>
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">केंद्राची वेळ</span><span>{selectedCenter.morningTime || "-"} / {selectedCenter.eveningTime || "-"}</span></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <SectionTitle icon={ShieldCheck} title="२) तांत्रिक & परवाना" color="text-primary" />
                    <div className="space-y-2">
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">FSSAI क्र.</span><span>{selectedCenter.fssaiNumber || "-"}</span></div>
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">पाणी स्रोत</span><span>{selectedCenter.waterSource || "-"}</span></div>
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">बॅकअप</span><span>{selectedCenter.powerBackup || "-"}</span></div>
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">ग्रेड</span><span className="font-black text-emerald-600">{selectedCenter.hygieneGrade || "A"} GRADE</span></div>
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-4">
                  <SectionTitle icon={Box} title="३) पायाभूत सुविधा & ऑडिट (INFRASTRUCTURE)" color="text-primary" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[9px] uppercase font-black">
                     {[
                       { l: 'ETP', v: selectedCenter.hasEtp }, { l: 'Solar', v: selectedCenter.hasSolar },
                       { l: 'Hot Water', v: selectedCenter.hasHotWater }, { l: 'Lab', v: selectedCenter.hasLab },
                       { l: 'Pest Control', v: selectedCenter.pestControlDone }, { l: 'Calibration', v: selectedCenter.calibrationDone },
                       { l: 'Fire Safety', v: selectedCenter.fireSafetyOk }, { l: 'Uniform', v: selectedCenter.staffUniform }
                     ].map(item => (
                       <div key={item.l} className="flex items-center gap-2 p-2 border-2 border-black bg-slate-50">
                         {item.v ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <X className="h-3 w-3 text-rose-500" />}
                         <span>{item.l}</span>
                       </div>
                     ))}
                  </div>
                </div>

                <div className="w-full mt-6 space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-primary border-b-2 border-black pb-1 mb-2 tracking-widest">४) स्टोरेज टँक (TANKS)</h4>
                  <div className="border-2 border-black rounded-sm overflow-hidden">
                    <ScrollArea className="w-full">
                      <table className="w-full border-collapse text-[10px] min-w-[300px]">
                        <thead className="bg-slate-50"><tr><th className="p-2 border border-black text-left">टाकी लेबल</th><th className="p-2 border border-black text-right">क्षमता (L)</th></tr></thead>
                        <tbody>
                          {(selectedCenter.tanks || []).map((t, idx) => (
                            <tr key={idx}><td className="p-2 border border-black font-bold uppercase">{t.label}</td><td className="p-2 border border-black text-right font-black">{t.capacity} L</td></tr>
                          ))}
                          {(!selectedCenter.tanks || selectedCenter.tanks.length === 0) && (<tr><td colSpan={2} className="p-4 text-center opacity-30 italic">माहिती उपलब्ध नाही</td></tr>)}
                        </tbody>
                      </table>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </div>
                </div>

                <div className="w-full mt-6 space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-primary border-b-2 border-black pb-1 mb-2 tracking-widest">५) टँकर येण्या-जाण्याच्या नोंदी (TANKER LOGS)</h4>
                  <div className="border-2 border-black rounded-sm overflow-hidden">
                    <ScrollArea className="w-full">
                      <table className="w-full border-collapse text-[10px] min-w-[500px]">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="p-2 border border-black text-left uppercase text-[8px] font-black">टँकर नंबर</th>
                            <th className="p-2 border border-black text-center uppercase text-[8px] font-black">येण्याची वेळ</th>
                            <th className="p-2 border border-black text-center uppercase text-[8px] font-black">जाण्याची वेळ</th>
                            <th className="p-2 border border-black text-right uppercase text-[8px] font-black">भरलेले दूध (L)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selectedCenter.tankerLogs || []).map((log, idx) => (
                            <tr key={idx}>
                              <td className="p-2 border border-black font-bold uppercase">{log.tankerNo}</td>
                              <td className="p-2 border border-black text-center">{log.arrivalTime}</td>
                              <td className="p-2 border border-black text-center">{log.departureTime}</td>
                              <td className="p-2 border border-black text-right font-black">{log.qtyFilled} L</td>
                            </tr>
                          ))}
                          {(!selectedCenter.tankerLogs || selectedCenter.tankerLogs.length === 0) && (
                            <tr><td colSpan={4} className="p-4 text-center opacity-30 italic">टँकरच्या कोणत्याही नोंदी नाहीत</td></tr>
                          )}
                        </tbody>
                      </table>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </div>
                </div>

                <PrintSurveyBlock title="सेंटर मुख्य सर्वेक्षण" data={selectedCenter} />
                
                {(selectedCenter.routes || []).map((r, idx) => (
                  <PrintSurveyBlock key={r.id} title={`रूट: ${r.routeName} विश्लेषण`} data={r} />
                ))}
                
                {(selectedCenter.gavaliSuppliers || []).map((s, idx) => (
                  <div key={s.id} className="w-full">
                    <PrintSurveyBlock title={`गवळी: ${s.name} सर्वेक्षण`} data={s as any} />
                    {s.producer_center?.additional_details?.sub_gavali_info && (
                        <div className="mt-2 ml-4">
                            <h5 className="text-[9px] font-black uppercase text-indigo-600 mb-1">सब-गवळी सविस्तर अहवाल (SUB-GAVALI)</h5>
                            <Table className="text-[8px] border-black border">
                                <TableHeader className="bg-indigo-50"><TableRow><TableHead className="p-1 border border-black">नाव</TableHead><TableHead className="p-1 border border-black">गाय(L)</TableHead><TableHead className="p-1 border border-black">म्हेस(L)</TableHead><TableHead className="p-1 border border-black">उत्पादक</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {s.producer_center.additional_details.sub_gavali_info.map((sg: any, sgIdx: number) => (
                                        <TableRow key={sgIdx}><TableCell className="p-1 border border-black">{sg.name}</TableCell><TableCell className="p-1 border border-black">{sg.cow_qty}L</TableCell><TableCell className="p-1 border border-black">{sg.buf_qty}L</TableCell><TableCell className="p-1 border border-black text-center">{sg.producers}</TableCell></TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                  </div>
                ))}
                
                {(selectedCenter.gothaSuppliers || []).map((s, idx) => (
                  <PrintSurveyBlock key={s.id} title={`गोठा: ${s.name} सर्वेक्षण`} data={s as any} />
                ))}

                <div className="w-full mt-10 pt-16 grid grid-cols-2 gap-20 text-center uppercase font-black text-[10pt] tracking-widest border-t-2 border-black">
                  <div className="pt-2">अधिकारी स्वाक्षरी</div>
                  <div className="pt-2">सेंटर मालक स्वाक्षरी</div>
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-20 p-20 text-center">
              <Warehouse className="h-16 w-16 mb-4" />
              <h4 className="font-black uppercase tracking-[0.3em] text-sm">चिलिंग सेंटर निवडा</h4>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[98vw] w-[98vw] p-0 overflow-hidden rounded-xl border-none shadow-2xl bg-white flex flex-col h-[90vh] text-left">
          <DialogHeader className="p-3 bg-primary text-white shrink-0">
            <DialogTitle className="text-sm font-black uppercase tracking-widest">{dialogMode === 'add' ? 'नवीन चिलिंग सेंटर' : 'माहिती अद्ययावत करा'}</DialogTitle>
            <DialogDescription className="text-[9px] text-white/70 uppercase">पायाभूत सुविधा, तांत्रिक आणि सविस्तर सर्वेक्षण.</DialogDescription>
          </DialogHeader>

          <div className="bg-slate-50 border-b flex overflow-x-auto no-print sticky top-0 z-20">
            {[
              { id: 'main', label: '१) मुख्य माहिती & सर्वेक्षण', icon: Warehouse },
              { id: 'routes', label: '२) रूट व्यवस्थापन', icon: Truck },
              { id: 'gavali', label: '३) गवळी माहिती', icon: Users },
              { id: 'gotha', label: '४) गोठा माहिती', icon: Building2 },
              { id: 'monitoring', label: '५) गुणवत्ता निरीक्षण यादी', icon: ShieldAlert },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveSubTab(tab.id as any)} className={cn("px-4 py-2 text-[10px] font-black uppercase flex items-center gap-2 border-r transition-all shrink-0", activeSubTab === tab.id ? "bg-white text-primary border-b-2 border-b-primary" : "text-slate-400 hover:bg-slate-100")}><tab.icon className="h-3.5 w-3.5" /> {tab.label}</button>
            ))}
          </div>

          <ScrollArea className="flex-1 bg-white">
            <div className="p-4 space-y-8 pb-24">
              
              {activeSubTab === 'main' && (
                <div className="space-y-8 max-w-[950px] mx-auto">
                  <div className="space-y-4">
                    <SectionTitle icon={Warehouse} title="१.१) प्राथमिक माहिती & परवाना" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="col-span-2 space-y-1"><Label className="text-[9px] font-black uppercase">सेंटरचे नाव *</Label><Input value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="h-8 border-2 border-black font-bold text-xs" /></div>
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">कोड नंबर *</Label><Input value={formData.code || ""} onChange={e => setFormData({...formData, code: e.target.value})} className="h-8 border-2 border-black font-bold text-xs" /></div>
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">मोबाईल</Label><Input value={formData.mobile || ""} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-8 border-2 border-black font-bold text-xs" /></div>
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">मालक</Label><Input value={formData.ownerName || ""} onChange={e => setFormData({...formData, ownerName: e.target.value})} className="h-8 border-2 border-black font-bold text-xs" /></div>
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">FSSAI क्र.</Label><Input value={formData.fssaiNumber || ""} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-8 border-2 border-black text-xs" /></div>
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">FSSAI मुदत</Label><Input type="date" value={formData.fssaiExpiry || ""} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-8 border-2 border-black text-xs" /></div>
                      <div className="col-span-2 space-y-1"><Label className="text-[9px] font-black uppercase">पत्ता</Label><Input value={formData.address || ""} onChange={e => setFormData({...formData, address: e.target.value})} className="h-8 border-2 border-black font-bold text-xs" /></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <SectionTitle icon={Clock} title="१.२) कामकाज वेळ & सप्लायर तपशील" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">सकाळ पोहोच वेळ = SANKALAN END TIME</Label><Input type="time" value={formData.morningTime || ""} onChange={e => setFormData({...formData, morningTime: e.target.value})} className="h-8 border-2 border-black text-xs" /></div>
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">सायंकाळ वेळ = SANKALAN END TIME</Label><Input type="time" value={formData.eveningTime || ""} onChange={e => setFormData({...formData, eveningTime: e.target.value})} className="h-8 border-2 border-black text-xs" /></div>
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">एकूण सप्लायर</Label><Input value={formData.supplierCount || "0"} onChange={e => setFormData({...formData, supplierCount: e.target.value})} className="h-8 border-2 border-black text-xs text-center font-black" /></div>
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">फॅट मशीन ब्रँड</Label><Input value={formData.fatMachineBrand || ""} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-8 border-2 border-black text-xs" /></div>
                      <div className="col-span-2 space-y-1"><Label className="text-[9px] font-black uppercase">इतर डेअरीला जाणारे दूध (तपशील)</Label><Input value={formData.otherDairySupply || ""} onChange={e => setFormData({...formData, otherDairySupply: e.target.value})} className="h-8 border-2 border-black text-xs" /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-xl space-y-2">
                           <Label className="text-[10px] font-black text-blue-600 uppercase">EKUN GAY DUDH (Qty/Fat/SNF)</Label>
                           <div className="grid grid-cols-3 gap-1">
                             <Input type="number" placeholder="Qty" value={formData.cowMilk?.quantity || ""} onChange={e => setFormData({...formData, cowMilk: { ...formData.cowMilk, quantity: Number(e.target.value) }})} className="h-8 border-blue-400 font-black text-center text-xs" />
                             <Input type="number" placeholder="Fat" value={formData.cowMilk?.fat || ""} onChange={e => setFormData({...formData, cowMilk: { ...formData.cowMilk, fat: Number(e.target.value) }})} className="h-8 border-blue-400 font-black text-center text-xs" />
                             <Input type="number" placeholder="SNF" value={formData.cowMilk?.snf || ""} onChange={e => setFormData({...formData, cowMilk: { ...formData.cowMilk, snf: Number(e.target.value) }})} className="h-8 border-blue-400 font-black text-center text-xs" />
                           </div>
                        </div>
                        <div className="p-3 bg-amber-50 border-2 border-amber-200 rounded-xl space-y-2">
                           <Label className="text-[10px] font-black text-amber-600 uppercase">EKUN MHAIS DUDH (Qty/Fat/SNF)</Label>
                           <div className="grid grid-cols-3 gap-1">
                             <Input type="number" placeholder="Qty" value={formData.buffaloMilk?.quantity || ""} onChange={e => setFormData({...formData, buffaloMilk: { ...formData.buffaloMilk, quantity: Number(e.target.value) }})} className="h-8 border-amber-400 font-black text-center text-xs" />
                             <Input type="number" placeholder="Fat" value={formData.buffaloMilk?.fat || ""} onChange={e => setFormData({...formData, buffaloMilk: { ...formData.buffaloMilk, fat: Number(e.target.value) }})} className="h-8 border-amber-400 font-black text-center text-xs" />
                             <Input type="number" placeholder="SNF" value={formData.buffaloMilk?.snf || ""} onChange={e => setFormData({...formData, buffaloMilk: { ...formData.buffaloMilk, snf: Number(e.target.value) }})} className="h-8 border-amber-400 font-black text-center text-xs" />
                           </div>
                        </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <SectionTitle icon={ShieldCheck} title="१.३) तांत्रिक, स्वच्छता & ऑडिट रकाने" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">पाणी स्रोत</Label>
                        <Select value={formData.waterSource} onValueChange={v => setFormData({...formData, waterSource: v})}>
                          <SelectTrigger className="h-8 border-2 border-black font-black text-[10px]"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="Borewell" className="font-bold">बोअरवेल</SelectItem><SelectItem value="Well" className="font-bold">विहीर</SelectItem><SelectItem value="Corporation" className="font-bold">नगरपालिका</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">पॉवर बॅकअप</Label>
                        <Select value={formData.powerBackup} onValueChange={v => setFormData({...formData, powerBackup: v})}>
                          <SelectTrigger className="h-8 border-2 border-black font-black text-[10px]"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="Generator" className="font-bold">जनरेटर</SelectItem><SelectItem value="UPS" className="font-bold">UPS/Inverter</SelectItem><SelectItem value="None" className="font-bold">काही नाही</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">हायजीन ग्रेड</Label>
                        <Select value={formData.hygieneGrade} onValueChange={v => setFormData({...formData, hygieneGrade: v})}>
                          <SelectTrigger className="h-8 border-2 border-black font-black text-[10px]"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="A" className="font-bold">A Grade</SelectItem><SelectItem value="B" className="font-bold">B Grade</SelectItem><SelectItem value="C" className="font-bold">C Grade</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-50 p-4 rounded-xl border-2 border-black">
                       {[
                         { k: 'hasBmc', l: 'BMC उपलब्ध', i: Droplets },
                         { k: 'hasIbt', l: 'IBT उपलब्ध', i: Wind },
                         { k: 'hasEtp', l: 'ETP उपलब्ध', i: Droplets },
                         { k: 'hasSolar', l: 'सोलर पॅनेल', i: Sun },
                         { k: 'hasHotWater', l: 'गरम पाण्याची सोय', i: Waves },
                         { k: 'hasDrainage', l: 'ड्रेनेज सिस्टीम', i: Wind },
                         { k: 'hasLab', l: 'प्रयोगशाळा (LAB)', i: FlaskConical },
                         { k: 'staffUniform', l: 'स्टाफ युनिफॉर्म', i: Shirt },
                         { k: 'hasTransportLicenses', l: 'वाहतूक परवाने', i: FileText },
                         { k: 'pestControlDone', l: 'पेस्ट कंट्रोल', i: ShieldAlert },
                         { k: 'staffHealthCheckDone', l: 'हेल्थ चेकअप', i: HeartPulse },
                         { k: 'calibrationDone', l: 'कॅलिब्रेशन (Weight)', i: Scale },
                         { k: 'fireSafetyOk', l: 'फायर सेफ्टी Ok', i: Flame },
                       ].map(item => (
                         <div key={item.k} className="flex items-center space-x-2 bg-white p-2 rounded border-2 border-black shadow-sm">
                           <Checkbox checked={(formData as any)[item.k] || false} onCheckedChange={v => setFormData({...formData, [item.k]: !!v})} />
                           <Label className="text-[9px] font-black uppercase leading-none cursor-pointer">{item.l}</Label>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <SectionTitle icon={Sparkles} title="१.४) मार्केट सर्वेक्षण विश्लेषण (SURVEY)" />
                    <SurveyFields data={formData as any} onUpdate={u => setFormData({ ...formData, ...u })} />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-1">
                      <SectionTitle icon={Box} title="१.५) टाक्यांची माहिती (STORAGE TANKS)" />
                      <Button size="sm" variant="outline" onClick={addTank} className="h-6 text-[8px] font-black border-black">+ जोडा</Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(formData.tanks || []).map((tank) => (
                        <div key={tank.id} className="flex gap-2 items-end bg-slate-50 p-2 rounded-xl border-2 border-black">
                          <div className="flex-1 space-y-1"><Label className="text-[8px] font-black uppercase">{tank.label}</Label><Input value={tank.capacity || ""} onChange={e => updateTank(tank.id, e.target.value)} placeholder="Cap (L)" className="h-8 border-none bg-white font-black text-xs text-center" /></div>
                          <Button size="icon" variant="ghost" onClick={() => removeTank(tank.id)} className="h-8 w-8 text-rose-500"><X className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-1">
                      <SectionTitle icon={Truck} title="१.६) टँकर येण्या-जाण्याच्या नोंदी (TANKER LOGS)" />
                      <Button size="sm" variant="outline" onClick={addTankerLog} className="h-6 text-[8px] font-black border-black">+ जोडा</Button>
                    </div>
                    <div className="border border-black rounded-xl overflow-hidden shadow-sm bg-white">
                      <ScrollArea className="w-full">
                        <Table className="text-[10px] min-w-[800px] uppercase">
                          <TableHeader className="bg-slate-50 h-8">
                            <TableRow>
                              <TableHead className="h-8 px-2 font-black border-r border-black/10">टँकर नंबर</TableHead>
                              <TableHead className="h-8 px-2 text-center font-black border-r border-black/10">येण्याची वेळ</TableHead>
                              <TableHead className="h-8 px-2 text-center font-black border-r border-black/10">जाण्याची वेळ</TableHead>
                              <TableHead className="h-8 px-2 text-right font-black border-r border-black/10">भरलेले दूध (L)</TableHead>
                              <TableHead className="w-10 h-8"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(formData.tankerLogs || []).map((log) => (
                              <TableRow key={log.id} className="h-10 border-t border-black/5">
                                <TableCell className="p-1 border-r border-black/5"><Input value={log.tankerNo} onChange={e => updateTankerLog(log.id, { tankerNo: e.target.value })} className="h-7 border-none text-[10px] font-bold" placeholder="MH..." /></TableCell>
                                <TableCell className="p-1 border-r border-black/5"><Input type="time" value={log.arrivalTime} onChange={e => updateTankerLog(log.id, { arrivalTime: e.target.value })} className="h-7 border-none text-[10px] text-center" /></TableCell>
                                <TableCell className="p-1 border-r border-black/5"><Input type="time" value={log.departureTime} onChange={e => updateTankerLog(log.id, { departureTime: e.target.value })} className="h-7 border-none text-[10px] text-center" /></TableCell>
                                <TableCell className="p-1 border-r border-black/5"><Input type="number" value={log.qtyFilled} onChange={e => updateTankerLog(log.id, { qtyFilled: e.target.value })} className="h-7 border-none text-[10px] text-right font-black" /></TableCell>
                                <TableCell className="p-1 text-center"><Button variant="ghost" size="icon" onClick={() => removeTankerLog(log.id)} className="h-7 w-7 text-rose-500 p-0"><X className="h-3 w-3" /></Button></TableCell>
                              </TableRow>
                            ))}
                            {(!formData.tankerLogs || formData.tankerLogs.length === 0) && (
                              <TableRow><TableCell colSpan={5} className="h-12 text-center italic opacity-30">टँकरच्या नोंदी जोडण्यासाठी वर '+' बटण दाबा</TableCell></TableRow>
                            )}
                          </TableBody>
                        </Table>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'routes' && (
                <div className="space-y-6 max-w-[950px] mx-auto">
                  <div className="flex items-center justify-between border-b-2 border-primary/20 pb-1">
                    <SectionTitle icon={Truck} title="रूट सर्वेक्षण & व्यवस्थापन" />
                    <Button size="sm" onClick={() => {
                       const newRoute: ChillingRouteItem = { 
                        id: crypto.randomUUID(), routeName: "", producerCount: "0", cows: "0", buffaloes: "0", distanceKm: "0", collectionArea: "", milkmanNames: "",
                        cowMilk: { quantity: 0, fat: 0, snf: 0 },
                        buffaloMilk: { quantity: 0, fat: 0, snf: 0 },
                        animals: { total: "0", cows: "0", buffaloes: "0", milking: "0", dry: "0", others: "0" },
                        producers: { total: "0", regular: "0", new: "0", potential: "0" },
                        competitors: [],
                        our_facilities: { feed: false, vet: false, ai: false, insurance: false, loan: false, training: false, bonus: false, other: "" },
                        comp_facilities: { feed: false, vet: false, bonus: false, rate: false, loan: false, free: false, other: "" },
                        other_info: { situation: "", opportunity: "", problems: "", observation: "", official_note: "", remarks: "" }
                      }
                      setFormData(prev => ({ ...prev, routes: [...(prev.routes || []), newRoute] }))
                    }} className="h-7 text-[9px] font-black uppercase px-4 bg-primary text-white rounded-lg shadow-lg"><Plus className="h-3.5 w-3.5 mr-1" /> नवीन रूट जोडा</Button>
                  </div>
                  <div className="space-y-4">
                    {(formData.routes || []).map((row, rIdx) => (
                      <Card key={row.id} className="border-2 border-black overflow-hidden rounded-2xl shadow-md bg-white">
                        <div className={cn("p-2 flex justify-between items-center cursor-pointer transition-colors", row.isSurveyOpen ? "bg-primary text-white" : "bg-slate-50 text-slate-900")} onClick={() => updateSubItem('routes', row.id, { isSurveyOpen: !row.isSurveyOpen })}>
                          <div className="flex items-center gap-3">
                            <Badge className={cn("font-black text-[9px] h-6", row.isSurveyOpen ? "bg-white text-primary" : "bg-primary text-white")}>#{rIdx + 1}</Badge>
                            <span className="text-[11px] font-black uppercase">{row.routeName || 'रूट नाव प्रलंबित'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="icon" variant="ghost" className={cn("h-7 w-7", row.isSurveyOpen ? "text-white/50 hover:text-white" : "text-rose-500")} onClick={(e) => { e.stopPropagation(); setFormData(prev => ({...prev, routes: prev.routes?.filter(item => item.id !== row.id)})); }}><Trash2 className="h-4 w-4" /></Button>
                            {row.isSurveyOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </div>
                        </div>
                        {row.isSurveyOpen && (
                          <div className="p-4 space-y-6 animate-in slide-in-from-top-2 duration-300">
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                               <div className="space-y-1"><Label className="text-[9px] font-black uppercase">रूट नाव *</Label><Input value={row.routeName || ""} onChange={e => updateSubItem('routes', row.id, { routeName: e.target.value })} className="h-8 border-2 border-black text-xs font-bold" /></div>
                               <div className="space-y-1"><Label className="text-[9px] font-black uppercase">अंतर (KM)</Label><Input type="number" value={row.distanceKm || "0"} onChange={e => updateSubItem('routes', row.id, { distanceKm: e.target.value })} className="h-8 border-2 border-black text-xs font-black" /></div>
                               <div className="space-y-1"><Label className="text-[9px] font-black uppercase">उत्पादक</Label><Input type="number" value={row.producerCount || "0"} onChange={e => updateSubItem('routes', row.id, { producerCount: e.target.value })} className="h-8 border-2 border-black text-xs font-black" /></div>
                               <div className="space-y-1"><Label className="text-[9px] font-black uppercase">संकलन एरिया</Label><Input value={row.collectionArea || ""} onChange={e => updateSubItem('routes', row.id, { collectionArea: e.target.value })} className="h-8 border-2 border-black text-xs font-bold" /></div>
                             </div>

                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-xl space-y-2">
                                  <Label className="text-[10px] font-black text-blue-600 uppercase">EKUN GAY DUDH (Qty/Fat/SNF)</Label>
                                  <div className="grid grid-cols-3 gap-1">
                                    <Input type="number" placeholder="Qty" value={row.cowMilk?.quantity || ""} onChange={e => updateSubItem('routes', row.id, { cowMilk: { ...row.cowMilk, quantity: Number(e.target.value) } })} className="h-8 border-blue-400 font-black text-center text-xs" />
                                    <Input type="number" placeholder="Fat" value={row.cowMilk?.fat || ""} onChange={e => updateSubItem('routes', row.id, { cowMilk: { ...row.cowMilk, fat: Number(e.target.value) } })} className="h-8 border-blue-400 font-black text-center text-xs" />
                                    <Input type="number" placeholder="SNF" value={row.cowMilk?.snf || ""} onChange={e => updateSubItem('routes', row.id, { cowMilk: { ...row.cowMilk, snf: Number(e.target.value) } })} className="h-8 border-blue-400 font-black text-center text-xs" />
                                  </div>
                                </div>
                                <div className="p-3 bg-amber-50 border-2 border-amber-200 rounded-xl space-y-2">
                                  <Label className="text-[10px] font-black text-amber-600 uppercase">EKUN MHAIS DUDH (Qty/Fat/SNF)</Label>
                                  <div className="grid grid-cols-3 gap-1">
                                    <Input type="number" placeholder="Qty" value={row.buffaloMilk?.quantity || ""} onChange={e => updateSubItem('routes', row.id, { buffaloMilk: { ...row.buffaloMilk, quantity: Number(e.target.value) } })} className="h-8 border-amber-400 font-black text-center text-xs" />
                                    <Input type="number" placeholder="Fat" value={row.buffaloMilk?.fat || ""} onChange={e => updateSubItem('routes', row.id, { buffaloMilk: { ...row.buffaloMilk, fat: Number(e.target.value) } })} className="h-8 border-amber-400 font-black text-center text-xs" />
                                    <Input type="number" placeholder="SNF" value={row.buffaloMilk?.snf || ""} onChange={e => updateSubItem('routes', row.id, { buffaloMilk: { ...row.buffaloMilk, snf: Number(e.target.value) } })} className="h-8 border-amber-400 font-black text-center text-xs" />
                                  </div>
                                </div>
                             </div>

                             <div className="border-t-2 border-dashed pt-4">
                               <h4 className="text-[10px] font-black uppercase text-primary mb-3 flex items-center gap-1.5"><HelpCircle className="h-4 w-4" /> रूट सर्वेक्षण विश्लेषण</h4>
                               <SurveyFields data={row} onUpdate={u => updateSubItem('routes', row.id, u)} />
                             </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeSubTab === 'gavali' && (
                <div className="space-y-6 max-w-[950px] mx-auto">
                  <div className="flex items-center justify-between border-b-2 border-primary/20 pb-1">
                    <SectionTitle icon={Users} title="गवळी माहिती & सर्वेक्षण" />
                    <Button size="sm" onClick={() => {
                        const newItem: Supplier = {
                          id: crypto.randomUUID(),
                          supplierId: "",
                          name: "",
                          address: "",
                          mobile: "",
                          routeId: "",
                          supplierType: 'Gavali',
                          updatedAt: new Date().toISOString(),
                          equipment: [],
                          cowMilk: { quantity: 0, fat: 0, snf: 0 },
                          buffaloMilk: { quantity: 0, fat: 0, snf: 0 },
                          animals: { total: "0", cows: "0", buffaloes: "0", milking: "0", dry: "0", others: "0" },
                          producers: { total: "0", regular: "0", new: "0", potential: "0" },
                          competitors: [],
                          our_facilities: { feed: false, vet: false, ai: false, insurance: false, loan: false, training: false, bonus: false, other: "" },
                          comp_facilities: { feed: false, vet: false, bonus: false, rate: false, loan: false, free: false, other: "" },
                          other_info: { situation: "", opportunity: "", problems: "", observation: "", official_note: "", remarks: "" },
                          producer_center: {
                            additional_details: {
                              morning_collection_time: "", evening_collection_time: "", start_year: "",
                              total_producers: 0, active_producers: 0, total_animals: 0, cows: 0, buffalo: 0, calves: 0,
                              sub_gavali_info: [], internal_gothas: [], local_employees: [],
                              milkman_gavali_details: [], competitor_dairies: [], sub_routes: [],
                              collection_areas: [],
                              gotha_hygiene_checklist: {
                                floor_cleaned: false, animal_cleaned: false, utensils_sanitized: false,
                                worker_hygiene: false, proper_drainage: false, clean_water_trough: false,
                                pest_control: false, health_records: false
                              }
                            }
                          }
                        }
                        setFormData(prev => ({ 
                          ...prev, 
                          gavaliSuppliers: [
                            ...(prev.gavaliSuppliers as any[] || []).map(item => ({ ...item, isOpen: false })), 
                            { ...newItem, isOpen: true }
                          ] 
                        }))
                    }} className="h-7 text-[9px] font-black uppercase px-4 bg-primary text-white rounded-lg shadow-lg"><Plus className="h-3.5 w-3.5 mr-1" /> नवीन गवळी जोडा</Button>
                  </div>
                  <div className="space-y-4">
                    {(formData.gavaliSuppliers || []).map((g, gIdx) => (
                        <Card key={g.id} className="border-2 border-black overflow-hidden rounded-2xl shadow-md bg-white">
                          <div className={cn("p-2 flex justify-between items-center cursor-pointer", g.isOpen ? "bg-primary text-white" : "bg-slate-50 text-slate-900")} onClick={() => updateSubItem('gavaliSuppliers', g.id, { isOpen: !g.isOpen })}>
                            <div className="flex items-center gap-3">
                              <Badge className={cn("font-black text-[9px] h-6", g.isOpen ? "bg-white text-primary" : "bg-primary text-white")}>#{gIdx + 1}</Badge>
                              <span className="text-[11px] font-black uppercase">{g.name || 'गवळी नाव प्रलंबित'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="icon" variant="ghost" className={cn("h-7 w-7", g.isOpen ? "text-white/50 hover:text-white" : "text-rose-500")} onClick={(e) => { e.stopPropagation(); setFormData(prev => ({...prev, gavaliSuppliers: prev.gavaliSuppliers?.filter(item => item.id !== g.id)})); }}><Trash2 className="h-4 w-4" /></Button>
                              {g.isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </div>
                          </div>
                          {g.isOpen && (
                            <div className="p-4 space-y-6 animate-in slide-in-from-top-2 duration-300">
                               <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                 <div className="space-y-1"><Label className="text-[9px] font-black uppercase">नाव *</Label><Input value={g.name || ""} onChange={e => updateSubItem('gavaliSuppliers', g.id, { name: e.target.value })} className="h-8 border-2 border-black text-xs font-bold" /></div>
                                 <div className="space-y-1"><Label className="text-[9px] font-black uppercase">गवळी कोड *</Label><Input value={g.supplierId || ""} onChange={e => updateSubItem('gavaliSuppliers', g.id, { supplierId: e.target.value })} className="h-8 border-2 border-black text-xs font-black" /></div>
                                 <div className="space-y-1"><Label className="text-[9px] font-black uppercase">मोबाईल</Label><Input value={g.mobile || ""} onChange={e => updateSubItem('gavaliSuppliers', g.id, { mobile: e.target.value })} className="h-8 border-2 border-black text-xs font-bold" /></div>
                               </div>
                               
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                                     <div className="col-span-3 text-[9px] font-black uppercase text-blue-600 mb-0.5">गाय दूध (COW Q/F/S)</div>
                                     <Input type="number" value={g.cowMilk?.quantity} onChange={e => updateSubItem('gavaliSuppliers', g.id, { cowMilk: { ...g.cowMilk, quantity: Number(e.target.value) } })} className="h-8 text-[10px] bg-white border-black font-bold" placeholder="L" />
                                     <Input type="number" value={g.cowMilk?.fat} onChange={e => updateSubItem('gavaliSuppliers', g.id, { cowMilk: { ...g.cowMilk, fat: Number(e.target.value) } })} className="h-8 text-[10px] bg-white border-black font-bold" placeholder="F" />
                                     <Input type="number" value={g.cowMilk?.snf} onChange={e => updateSubItem('gavaliSuppliers', g.id, { cowMilk: { ...g.cowMilk, snf: Number(e.target.value) } })} className="h-8 text-[10px] bg-white border-black font-bold" placeholder="S" />
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-amber-50/50 rounded-xl border border-amber-100">
                                     <div className="col-span-3 text-[9px] font-black uppercase text-amber-600 mb-0.5">म्हेस दूध (BUF Q/F/S)</div>
                                     <Input type="number" value={g.buffaloMilk?.quantity} onChange={e => updateSubItem('gavaliSuppliers', g.id, { buffaloMilk: { ...g.buffaloMilk, quantity: Number(e.target.value) } })} className="h-8 text-[10px] bg-white border-black font-bold" placeholder="L" />
                                     <Input type="number" value={g.buffaloMilk?.fat} onChange={e => updateSubItem('gavaliSuppliers', g.id, { buffaloMilk: { ...g.buffaloMilk, fat: Number(e.target.value) } })} className="h-8 text-[10px] bg-white border-black font-bold" placeholder="F" />
                                     <Input type="number" value={g.buffaloMilk?.snf} onChange={e => updateSubItem('gavaliSuppliers', g.id, { buffaloMilk: { ...g.buffaloMilk, snf: Number(e.target.value) } })} className="h-8 text-[10px] bg-white border-black font-bold" placeholder="S" />
                                  </div>
                               </div>

                               <div className="space-y-6 pt-4 border-t-2 border-dashed">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><Users2 className="h-4 w-4"/> सब-गवळी & गोठा माहिती</h4>
                                    <div className="flex gap-2">
                                      <Button size="sm" variant="outline" onClick={() => {
                                        const sub_gavali_info = [...(g.producer_center?.additional_details?.sub_gavali_info || []), { id: crypto.randomUUID(), name: "", mobile: "", area: "", method: "Spot", cow_qty: "0", cow_fat: "0", cow_snf: "0", buf_qty: "0", buf_fat: "0", buf_snf: "0", producers: "0", animals: "0", note: "" }];
                                        updateSubItem('gavaliSuppliers', g.id, { producer_center: { ...g.producer_center, additional_details: { ...g.producer_center?.additional_details, sub_gavali_info } } });
                                      }} className="h-6 text-[8px] font-black border-primary text-primary">+ सब-गवळी</Button>
                                      <Button size="sm" variant="outline" onClick={() => {
                                        const internal_gothas = [...(g.producer_center?.additional_details?.internal_gothas || []), { id: crypto.randomUUID(), owner_name: "", code: "", location: "", area: "", breeds: [], hygiene: {} }];
                                        updateSubItem('gavaliSuppliers', g.id, { producer_center: { ...g.producer_center, additional_details: { ...g.producer_center?.additional_details, internal_gothas } } });
                                      }} className="h-6 text-[8px] font-black border-amber-600 text-amber-600">+ गोठा</Button>
                                    </div>
                                  </div>

                                  {(g.producer_center?.additional_details?.sub_gavali_info || []).map((sg: any, sgIdx: number) => (
                                    <div key={sg.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                      <div className="flex justify-between items-center mb-2"><span className="text-[8px] font-black uppercase text-slate-400">SG-{sgIdx+1} सब-गवळी</span><Button size="icon" variant="ghost" onClick={() => {
                                        const sub_gavali_info = g.producer_center.additional_details.sub_gavali_info.filter((x:any) => x.id !== sg.id);
                                        updateSubItem('gavaliSuppliers', g.id, { producer_center: { ...g.producer_center, additional_details: { ...g.producer_center.additional_details, sub_gavali_info } } });
                                      }} className="h-5 w-5 text-rose-500"><X className="h-3 w-3"/></Button></div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase opacity-50">नाव</Label><Input value={sg.name} onChange={e => {
                                          const sub_gavali_info = g.producer_center.additional_details.sub_gavali_info.map((x:any) => x.id === sg.id ? { ...x, name: e.target.value } : x);
                                          updateSubItem('gavaliSuppliers', g.id, { producer_center: { ...g.producer_center, additional_details: { ...g.producer_center.additional_details, sub_gavali_info } } });
                                        }} className="h-7 text-[10px] border-black" /></div>
                                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase opacity-50">मोबाईल</Label><Input value={sg.mobile} onChange={e => {
                                          const sub_gavali_info = g.producer_center.additional_details.sub_gavali_info.map((x:any) => x.id === sg.id ? { ...x, mobile: e.target.value } : x);
                                          updateSubItem('gavaliSuppliers', g.id, { producer_center: { ...g.producer_center, additional_details: { ...g.producer_center.additional_details, sub_gavali_info } } });
                                        }} className="h-7 text-[10px] border-black" /></div>
                                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase opacity-50">संकलन एरिया</Label><Input value={sg.area} onChange={e => {
                                          const sub_gavali_info = g.producer_center.additional_details.sub_gavali_info.map((x:any) => x.id === sg.id ? { ...x, area: e.target.value } : x);
                                          updateSubItem('gavaliSuppliers', g.id, { producer_center: { ...g.producer_center, additional_details: { ...g.producer_center.additional_details, sub_gavali_info } } });
                                        }} className="h-7 text-[10px] border-black" /></div>
                                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase opacity-50">पद्धत</Label>
                                          <select value={sg.method} onChange={e => {
                                            const sub_gavali_info = g.producer_center.additional_details.sub_gavali_info.map((x:any) => x.id === sg.id ? { ...x, method: e.target.value } : x);
                                            updateSubItem('gavaliSuppliers', g.id, { producer_center: { ...g.producer_center, additional_details: { ...g.producer_center.additional_details, sub_gavali_info } } });
                                          }} className="h-7 w-full bg-white border border-black rounded text-[9px] font-black"><option value="Spot">Spot</option><option value="Route">Route</option></select>
                                        </div>
                                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase opacity-50">एकूण उत्पादक</Label><Input type="number" value={sg.producers} onChange={e => {
                                          const sub_gavali_info = g.producer_center.additional_details.sub_gavali_info.map((x:any) => x.id === sg.id ? { ...x, producers: e.target.value } : x);
                                          updateSubItem('gavaliSuppliers', g.id, { producer_center: { ...g.producer_center, additional_details: { ...g.producer_center.additional_details, sub_gavali_info } } });
                                        }} className="h-7 text-[10px] border-black text-center" /></div>
                                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase opacity-50">एकूण जनावरे</Label><Input type="number" value={sg.animals} onChange={e => {
                                          const sub_gavali_info = g.producer_center.additional_details.sub_gavali_info.map((x:any) => x.id === sg.id ? { ...x, animals: e.target.value } : x);
                                          updateSubItem('gavaliSuppliers', g.id, { producer_center: { ...g.producer_center, additional_details: { ...g.producer_center.additional_details, sub_gavali_info } } });
                                        }} className="h-7 text-[10px] border-black text-center" /></div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 mt-2">
                                        <div className="p-1.5 bg-blue-50/50 rounded border border-blue-200">
                                          <Label className="text-[8px] font-black uppercase text-blue-600 block mb-1">गाय दूध (Q/F/S)</Label>
                                          <div className="grid grid-cols-3 gap-1">
                                            <Input value={sg.cow_qty} onChange={e => {
                                              const sub_gavali_info = g.producer_center.additional_details.sub_gavali_info.map((x:any) => x.id === sg.id ? { ...x, cow_qty: e.target.value } : x);
                                              updateSubItem('gavaliSuppliers', g.id, { producer_center: { ...g.producer_center, additional_details: { ...g.producer_center.additional_details, sub_gavali_info } } });
                                            }} placeholder="Q" className="h-6 text-[9px] text-center border-blue-200" />
                                            <Input value={sg.cow_fat} onChange={e => {
                                              const sub_gavali_info = g.producer_center.additional_details.sub_gavali_info.map((x:any) => x.id === sg.id ? { ...x, cow_fat: e.target.value } : x);
                                              updateSubItem('gavaliSuppliers', g.id, { producer_center: { ...g.producer_center, additional_details: { ...g.producer_center.additional_details, sub_gavali_info } } });
                                            }} placeholder="F" className="h-6 text-[9px] text-center border-blue-200" />
                                            <Input value={sg.cow_snf} onChange={e => {
                                              const sub_gavali_info = g.producer_center.additional_details.sub_gavali_info.map((x:any) => x.id === sg.id ? { ...x, cow_snf: e.target.value } : x);
                                              updateSubItem('gavaliSuppliers', g.id, { producer_center: { ...g.producer_center, additional_details: { ...g.producer_center.additional_details, sub_gavali_info } } });
                                            }} placeholder="S" className="h-6 text-[9px] text-center border-blue-200" />
                                          </div>
                                        </div>
                                        <div className="p-1.5 bg-amber-50/50 rounded border border-amber-200">
                                          <Label className="text-[8px] font-black uppercase text-amber-600 block mb-1">म्हेस दूध (Q/F/S)</Label>
                                          <div className="grid grid-cols-3 gap-1">
                                            <Input value={sg.buf_qty} onChange={e => {
                                              const sub_gavali_info = g.producer_center.additional_details.sub_gavali_info.map((x:any) => x.id === sg.id ? { ...x, buf_qty: e.target.value } : x);
                                              updateSubItem('gavaliSuppliers', g.id, { producer_center: { ...g.producer_center, additional_details: { ...g.producer_center.additional_details, sub_gavali_info } } });
                                            }} placeholder="Q" className="h-6 text-[9px] text-center border-amber-200" />
                                            <Input value={sg.buf_fat} onChange={e => {
                                              const sub_gavali_info = g.producer_center.additional_details.sub_gavali_info.map((x:any) => x.id === sg.id ? { ...x, buf_fat: e.target.value } : x);
                                              updateSubItem('gavaliSuppliers', g.id, { producer_center: { ...g.producer_center, additional_details: { ...g.producer_center.additional_details, sub_gavali_info } } });
                                            }} placeholder="F" className="h-6 text-[9px] text-center border-amber-200" />
                                            <Input value={sg.buf_snf} onChange={e => {
                                              const sub_gavali_info = g.producer_center.additional_details.sub_gavali_info.map((x:any) => x.id === sg.id ? { ...x, buf_snf: e.target.value } : x);
                                              updateSubItem('gavaliSuppliers', g.id, { producer_center: { ...g.producer_center, additional_details: { ...g.producer_center.additional_details, sub_gavali_info } } });
                                            }} placeholder="S" className="h-6 text-[9px] text-center border-amber-200" />
                                          </div>
                                        </div>
                                      </div>
                                      <div className="mt-2 space-y-1"><Label className="text-[8px] font-black uppercase opacity-50">शेरा</Label><Input value={sg.note} onChange={e => {
                                          const sub_gavali_info = g.producer_center.additional_details.sub_gavali_info.map((x:any) => x.id === sg.id ? { ...x, note: e.target.value } : x);
                                          updateSubItem('gavaliSuppliers', g.id, { producer_center: { ...g.producer_center, additional_details: { ...g.producer_center.additional_details, sub_gavali_info } } });
                                        }} className="h-7 text-[10px] border-black" /></div>
                                    </div>
                                  ))}

                                  {(g.producer_center?.additional_details?.internal_gothas || []).map((igo: any, igoIdx: number) => (
                                    <div key={igo.id} className="p-3 bg-amber-50/30 rounded-xl border border-amber-200">
                                      <div className="flex justify-between items-center mb-2"><span className="text-[8px] font-black uppercase text-amber-600">G-{igoIdx+1} अंतर्गत गोठा</span><Button size="icon" variant="ghost" onClick={() => {
                                        const internal_gothas = g.producer_center.additional_details.internal_gothas.filter((x:any) => x.id !== igo.id);
                                        updateSubItem('gavaliSuppliers', g.id, { producer_center: { ...g.producer_center, additional_details: { ...g.producer_center.additional_details, internal_gothas } } });
                                      }} className="h-5 w-5 text-rose-500"><X className="h-3 w-3"/></Button></div>
                                      <div className="grid grid-cols-2 gap-2 mb-2">
                                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase opacity-50">मालक</Label><Input value={igo.owner_name} onChange={e => {
                                          const internal_gothas = g.producer_center.additional_details.internal_gothas.map((x:any) => x.id === igo.id ? { ...x, owner_name: e.target.value } : x);
                                          updateSubItem('gavaliSuppliers', g.id, { producer_center: { ...g.producer_center, additional_details: { ...g.producer_center.additional_details, internal_gothas } } });
                                        }} className="h-7 text-[10px] border-black" /></div>
                                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase opacity-50">कोड</Label><Input value={igo.code} onChange={e => {
                                          const internal_gothas = g.producer_center.additional_details.internal_gothas.map((x:any) => x.id === igo.id ? { ...x, code: e.target.value } : x);
                                          updateSubItem('gavaliSuppliers', g.id, { producer_center: { ...g.producer_center, additional_details: { ...g.producer_center.additional_details, internal_gothas } } });
                                        }} className="h-7 text-[10px] border-black" /></div>
                                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase opacity-50">लोकेशन</Label><Input value={igo.location} onChange={e => {
                                          const internal_gothas = g.producer_center.additional_details.internal_gothas.map((x:any) => x.id === igo.id ? { ...x, location: e.target.value } : x);
                                          updateSubItem('gavaliSuppliers', g.id, { producer_center: { ...g.producer_center, additional_details: { ...g.producer_center.additional_details, internal_gothas } } });
                                        }} className="h-7 text-[10px] border-black" /></div>
                                        <div className="space-y-1"><Label className="text-[8px] font-black uppercase opacity-50">एरिया</Label><Input value={igo.area} onChange={e => {
                                          const internal_gothas = g.producer_center.additional_details.internal_gothas.map((x:any) => x.id === igo.id ? { ...x, area: e.target.value } : x);
                                          updateSubItem('gavaliSuppliers', g.id, { producer_center: { ...g.producer_center, additional_details: { ...g.producer_center.additional_details, internal_gothas } } });
                                        }} className="h-7 text-[10px] border-black" /></div>
                                      </div>

                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between"><span className="text-[9px] font-black uppercase text-rose-600">जातीनुसार जनावरे</span><Button size="sm" variant="outline" onClick={() => {
                                          const breeds = igo.breeds || [];
                                          const internal_gothas = g.producer_center.additional_details.internal_gothas.map((x:any) => x.id === igo.id ? { ...x, breeds: [...breeds, { id: crypto.randomUUID(), breed: "", count: "0", avg: "0" }] } : x);
                                          updateSubItem('gavaliSuppliers', g.id, { producer_center: { ...g.producer_center, additional_details: { ...g.producer_center.additional_details, internal_gothas } } });
                                        }} className="h-5 text-[7px] border-black px-1.5">+ जोडा</Button></div>
                                        <div className="border border-black rounded-lg overflow-hidden shadow-sm bg-white">
                                          <ScrollArea className="w-full">
                                            <Table className="text-[8px] min-w-[300px]">
                                              <TableHeader className="bg-slate-50 h-6"><TableRow><TableHead className="h-6 px-1">ब्रीड</TableHead><TableHead className="h-6 px-1 text-center">नग</TableHead><TableHead className="h-6 px-1 text-center">Avg(L)</TableHead><TableHead className="h-6 w-6"></TableHead></TableRow></TableHeader>
                                              <TableBody>
                                                {(igo.breeds || []).map((b: any) => (
                                                  <TableRow key={b.id} className="h-7">
                                                    <TableCell className="p-0 border-r"><Input value={b.breed} onChange={e => {
                                                      const breeds = igo.breeds.map((br: any) => br.id === b.id ? { ...br, breed: e.target.value } : br);
                                                      const internal_gothas = g.producer_center.additional_details.internal_gothas.map((x:any) => x.id === igo.id ? { ...x, breeds } : x);
                                                      updateSubItem('gavaliSuppliers', g.id, { producer_center: { ...g.producer_center, additional_details: { ...g.producer_center.additional_details, internal_gothas } } });
                                                    }} className="h-6 border-none text-center font-bold" /></TableCell>
                                                    <TableCell className="p-0 border-r"><Input value={b.count} onChange={e => {
                                                      const breeds = igo.breeds.map((br: any) => br.id === b.id ? { ...br, count: e.target.value } : br);
                                                      const internal_gothas = g.producer_center.additional_details.internal_gothas.map((x:any) => x.id === igo.id ? { ...x, breeds } : x);
                                                      updateSubItem('gavaliSuppliers', g.id, { producer_center: { ...g.producer_center, additional_details: { ...g.producer_center.additional_details, internal_gothas } } });
                                                    }} className="h-6 border-none text-center font-bold" /></TableCell>
                                                    <TableCell className="p-0 border-r"><Input value={b.avg} onChange={e => {
                                                      const breeds = igo.breeds.map((br: any) => br.id === b.id ? { ...br, avg: e.target.value } : br);
                                                      const internal_gothas = g.producer_center.additional_details.internal_gothas.map((x:any) => x.id === igo.id ? { ...x, breeds } : x);
                                                      updateSubItem('gavaliSuppliers', g.id, { producer_center: { ...g.producer_center, additional_details: { ...g.producer_center.additional_details, internal_gothas } } });
                                                    }} className="h-6 border-none text-center font-bold" /></TableCell>
                                                    <TableCell className="p-0 text-center"><Button variant="ghost" size="icon" onClick={() => {
                                                      const breeds = igo.breeds.filter((br: any) => br.id !== b.id);
                                                      const internal_gothas = g.producer_center.additional_details.internal_gothas.map((x:any) => x.id === igo.id ? { ...x, breeds } : x);
                                                      updateSubItem('gavaliSuppliers', g.id, { producer_center: { ...g.producer_center, additional_details: { ...g.producer_center.additional_details, internal_gothas } } });
                                                    }} className="h-6 w-6 text-rose-500"><X className="h-3 w-3"/></Button></TableCell>
                                                  </TableRow>
                                                ))}</TableBody>
                                            </Table>
                                            <ScrollBar orientation="horizontal" />
                                          </ScrollArea>
                                        </div>
                                      </div>

                                      <div className="space-y-1.5 mt-2"><span className="text-[8px] font-black uppercase opacity-50">स्वच्छता चेकलिस्ट</span>
                                      <div className="grid grid-cols-2 gap-1">{['फरशी', 'जनावरे', 'भांडी', 'कामगार', 'सांडपाणी', 'पाणी/चारा'].map(l => (
                                        <div key={l} className="flex items-center gap-1.5 bg-white p-1 rounded border border-amber-100"><Checkbox checked={igo.hygiene?.[l]} onCheckedChange={v => {
                                          const internal_gothas = g.producer_center.additional_details.internal_gothas.map((x:any) => x.id === igo.id ? { ...x, hygiene: { ...x.hygiene, [l]: !!v } } : x);
                                          updateSubItem('gavaliSuppliers', g.id, { producer_center: { ...g.producer_center, additional_details: { ...g.producer_center.additional_details, internal_gothas } } });
                                        }} /><span className="text-[8px] font-bold">{l}</span></div>
                                      ))}</div></div>
                                    </div>
                                  ))}
                               </div>

                               <EquipmentTable equipment={g.equipment || []} onAdd={() => {
                                 const equipment = [...(g.equipment || []), { id: crypto.randomUUID(), name: "", quantity: 1, ownership: 'Company' }];
                                 updateSubItem('gavaliSuppliers', g.id, { equipment });
                               }} onRemove={(eqId) => {
                                 const equipment = (g.equipment || []).filter(e => e.id !== eqId);
                                 updateSubItem('gavaliSuppliers', g.id, { equipment });
                               }} onUpdate={(eqId, upds) => {
                                 const equipment = (g.equipment || []).map(e => e.id === eqId ? { ...e, ...upds } : e);
                                 updateSubItem('gavaliSuppliers', g.id, { equipment });
                               }} />
                               <div className="border-t-2 border-dashed pt-4">
                                  <h4 className="text-[10px] font-black uppercase text-primary mb-3 flex items-center gap-1.5"><HelpCircle className="h-4 w-4" /> गवळी वैयक्तिक सर्वेक्षण</h4>
                                  <SurveyFields data={g as any} onUpdate={u => updateSubItem('gavaliSuppliers', g.id, u)} />
                               </div>
                            </div>
                          )}
                        </Card>
                      ))}
                  </div>
                </div>
              )}

              {activeSubTab === 'gotha' && (
                <div className="space-y-6 max-w-[950px] mx-auto">
                  <div className="flex items-center justify-between border-b-2 border-amber-200 pb-1">
                    <SectionTitle icon={Building2} title="गोठा माहिती & सर्वेक्षण विश्लेषण" color="text-amber-700" />
                    <Button size="sm" onClick={() => {
                        const newItem: Supplier = {
                          id: crypto.randomUUID(),
                          supplierId: "",
                          name: "",
                          address: "",
                          mobile: "",
                          routeId: "",
                          supplierType: 'Gotha',
                          updatedAt: new Date().toISOString(),
                          equipment: [],
                          cowMilk: { quantity: 0, fat: 0, snf: 0 },
                          buffaloMilk: { quantity: 0, fat: 0, snf: 0 },
                          animals: { total: "0", cows: "0", buffaloes: "0", milking: "0", dry: "0", others: "0" },
                          producers: { total: "0", regular: "0", new: "0", potential: "0" },
                          competitors: [],
                          our_facilities: { feed: false, vet: false, ai: false, insurance: false, loan: false, training: false, bonus: false, other: "" },
                          comp_facilities: { feed: false, vet: false, bonus: false, rate: false, loan: false, free: false, other: "" },
                          other_info: { situation: "", opportunity: "", problems: "", observation: "", official_note: "", remarks: "" },
                          producer_center: {
                            additional_details: {
                              morning_collection_time: "", evening_collection_time: "", start_year: "",
                              total_producers: 0, active_producers: 0, total_animals: 0, cows: 0, buffalo: 0, calves: 0,
                              sub_gavali_info: [], internal_gothas: [], local_employees: [],
                              milkman_gavali_details: [], competitor_dairies: [], sub_routes: [],
                              collection_areas: [],
                              gotha_hygiene_checklist: {
                                floor_cleaned: false, animal_cleaned: false, utensils_sanitized: false,
                                worker_hygiene: false, proper_drainage: false, clean_water_trough: false,
                                pest_control: false, health_records: false
                              },
                              gotha_breeds: []
                            }
                          }
                        }
                        setFormData(prev => ({ 
                          ...prev, 
                          gothaSuppliers: [
                            ...(prev.gothaSuppliers as any[] || []).map(item => ({ ...item, isOpen: false })), 
                            { ...newItem, isOpen: true }
                          ] 
                        }))
                    }} className="h-7 text-[9px] font-black uppercase px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-lg border-none"><Plus className="h-3.5 w-3.5 mr-1" /> नवीन गोठा जोडा</Button>
                  </div>
                  <div className="space-y-4">
                    {(formData.gothaSuppliers || []).map((go, goIdx) => (
                        <Card key={go.id} className="border-2 border-black overflow-hidden rounded-2xl shadow-md bg-white">
                          <div className={cn("p-2 flex justify-between items-center cursor-pointer", go.isOpen ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-900")} onClick={() => updateSubItem('gothaSuppliers', go.id, { isOpen: !go.isOpen })}>
                            <div className="flex items-center gap-3">
                              <Badge className={cn("font-black text-[9px] h-6", go.isOpen ? "bg-white text-amber-600" : "bg-amber-600 text-white")}>#{goIdx + 1}</Badge>
                              <span className="text-[11px] font-black uppercase">{go.name || 'गोठा नाव प्रलंबित'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="icon" variant="ghost" className={cn("h-7 w-7", go.isOpen ? "text-white/50 hover:text-white" : "text-rose-500")} onClick={(e) => { e.stopPropagation(); setFormData(prev => ({...prev, gothaSuppliers: (prev.gothaSuppliers || []).filter(item => item.id !== go.id)})); }}><Trash2 className="h-4 w-4" /></Button>
                              {go.isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </div>
                          </div>
                          {go.isOpen && (
                            <div className="p-4 space-y-6 animate-in slide-in-from-top-2 duration-300">
                               <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                 <div className="space-y-1"><Label className="text-[9px] font-black uppercase">गोठा नाव *</Label><Input value={go.name || ""} onChange={e => updateSubItem('gothaSuppliers', go.id, { name: e.target.value })} className="h-8 border-2 border-black text-xs font-bold" /></div>
                                 <div className="space-y-1"><Label className="text-[9px] font-black uppercase">मालक नाव *</Label><Input value={go.operatorName || ""} onChange={e => updateSubItem('gothaSuppliers', go.id, { operatorName: e.target.value })} className="h-8 border-2 border-black text-xs font-bold" /></div>
                                 <div className="space-y-1"><Label className="text-[9px] font-black uppercase">मोबाईल</Label><Input value={go.mobile || ""} onChange={e => updateSubItem('gothaSuppliers', go.id, { mobile: e.target.value })} className="h-8 border-2 border-black text-xs font-bold" /></div>
                               </div>

                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                                     <div className="col-span-3 text-[9px] font-black uppercase text-blue-600 mb-0.5">गाय दूध (COW Q/F/S)</div>
                                     <Input type="number" value={go.cowMilk?.quantity} onChange={e => updateSubItem('gothaSuppliers', go.id, { cowMilk: { ...go.cowMilk, quantity: Number(e.target.value) } })} className="h-8 text-[10px] bg-white border-black font-bold" placeholder="L" />
                                     <Input type="number" value={go.cowMilk?.fat} onChange={e => updateSubItem('gavaliSuppliers', go.id, { cowMilk: { ...go.cowMilk, fat: Number(e.target.value) } })} className="h-8 text-[10px] bg-white border-black font-bold" placeholder="F" />
                                     <Input type="number" value={go.cowMilk?.snf} onChange={e => updateSubItem('gavaliSuppliers', go.id, { cowMilk: { ...go.cowMilk, snf: Number(e.target.value) } })} className="h-8 text-[10px] bg-white border-black font-bold" placeholder="S" />
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-amber-50/50 rounded-xl border border-amber-100">
                                     <div className="col-span-3 text-[9px] font-black uppercase text-amber-600 mb-0.5">म्हेस दूध (BUF Q/F/S)</div>
                                     <Input type="number" value={go.buffaloMilk?.quantity} onChange={e => updateSubItem('gothaSuppliers', go.id, { buffaloMilk: { ...go.buffaloMilk, quantity: Number(e.target.value) } })} className="h-8 text-[10px] bg-white border-black font-bold" placeholder="L" />
                                     <Input type="number" value={go.buffaloMilk?.fat} onChange={e => updateSubItem('gothaSuppliers', go.id, { buffaloMilk: { ...go.buffaloMilk, fat: Number(e.target.value) } })} className="h-8 text-[10px] bg-white border-black font-bold" placeholder="F" />
                                     <Input type="number" value={go.buffaloMilk?.snf} onChange={e => updateSubItem('gothaSuppliers', go.id, { buffaloMilk: { ...go.buffaloMilk, snf: Number(e.target.value) } })} className="h-8 text-[10px] bg-white border-black font-bold" placeholder="S" />
                                  </div>
                               </div>

                               <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1"><Label className="text-[9px] font-black uppercase">गोठा एरिया</Label><Input placeholder="उदा. १० गुंठे" value={go.gotha_area || ""} onChange={e => updateSubItem('gothaSuppliers', go.id, { gotha_area: e.target.value })} className="h-8 border-2 border-black text-xs" /></div>
                                  <div className="space-y-1"><Label className="text-[9px] font-black uppercase">चारा एरिया</Label><Input placeholder="उदा. २ एकर" value={go.fodder_area || ""} onChange={e => setFormData({...formData, fodder_area: e.target.value})} className="h-8 border-2 border-black text-xs" /></div>
                               </div>
                               <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  <div className="space-y-1"><Label className="text-[9px] font-black uppercase">सकाळ वेळ</Label><Input type="time" value={go.morning_milking_time || ""} onChange={e => updateSubItem('gothaSuppliers', go.id, { morning_milking_time: e.target.value })} className="h-8 border-2 border-black text-xs" /></div>
                                  <div className="space-y-1"><Label className="text-[9px] font-black uppercase">सायंकाळ वेळ</Label><Input type="time" value={go.evening_milking_time || ""} onChange={e => updateSubItem('gothaSuppliers', go.id, { evening_milking_time: e.target.value })} className="h-8 border-2 border-black text-xs" /></div>
                               </div>

                               <BreedTable breeds={go.producer_center?.additional_details?.gotha_breeds || []} onAdd={() => {
                                 const currentBreeds = go.producer_center?.additional_details?.gotha_breeds || [];
                                 const updatedBreeds = [...currentBreeds, { id: crypto.randomUUID(), breed: "", count: "0", avg: "0" }];
                                 updateSubItem('gothaSuppliers', go.id, { 
                                   producer_center: { 
                                     ...go.producer_center, 
                                     additional_details: { 
                                       ...go.producer_center?.additional_details, 
                                       gotha_breeds: updatedBreeds 
                                     } 
                                   } 
                                 });
                               }} onRemove={(id) => {
                                 const currentBreeds = go.producer_center?.additional_details?.gotha_breeds || [];
                                 const updatedBreeds = currentBreeds.filter((b: any) => b.id !== id);
                                 updateSubItem('gothaSuppliers', go.id, { 
                                   producer_center: { 
                                     ...go.producer_center, 
                                     additional_details: { 
                                       ...go.producer_center?.additional_details, 
                                       gotha_breeds: updatedBreeds 
                                     } 
                                   } 
                                 });
                               }} onUpdate={(id, updates) => {
                                 const currentBreeds = go.producer_center?.additional_details?.gotha_breeds || [];
                                 const updatedBreeds = currentBreeds.map((b: any) => b.id === id ? { ...b, ...updates } : b);
                                 updateSubItem('gothaSuppliers', go.id, { 
                                   producer_center: { 
                                     ...go.producer_center, 
                                     additional_details: { 
                                       ...go.producer_center?.additional_details, 
                                       gotha_breeds: updatedBreeds 
                                     } 
                                   } 
                                 });
                               }} />

                               <EquipmentTable equipment={go.equipment || []} onAdd={() => {
                                 const equipment = [...(go.equipment || []), { id: crypto.randomUUID(), name: "", quantity: 1, ownership: 'Company' }];
                                 updateSubItem('gothaSuppliers', go.id, { equipment });
                               }} onRemove={(eqId) => {
                                 const equipment = (go.equipment || []).filter(e => e.id !== eqId);
                                 updateSubItem('gothaSuppliers', go.id, { equipment });
                               }} onUpdate={(eqId, upds) => {
                                 const equipment = (go.equipment || []).map(e => e.id === eqId ? { ...e, ...upds } : e);
                                 updateSubItem('gavaliSuppliers', g.id, { equipment });
                               }} />
                               
                               <div className="border-t-2 border-dashed border-amber-200 pt-4">
                                  <h4 className="text-[10px] font-black uppercase text-amber-700 mb-3 flex items-center gap-1.5"><HelpCircle className="h-4 w-4" /> गोठा सर्वेक्षण विश्लेषण</h4>
                                  <SurveyFields data={go as any} onUpdate={u => updateSubItem('gothaSuppliers', go.id, u)} hideProducers={true} />
                               </div>
                            </div>
                          )}
                        </Card>
                      ))}
                  </div>
                </div>
              )}

              {activeSubTab === 'monitoring' && (
                <div className="space-y-6 max-w-[950px] mx-auto">
                  <div className="flex items-center justify-between border-b-2 border-rose-200 pb-1">
                    <SectionTitle icon={ShieldAlert} title="५) गुणवत्ता निरीक्षण यादी (QUALITY MONITORING)" color="text-rose-600" />
                  </div>
                  
                  <Card className="border-2 border-black p-4 bg-rose-50/20 rounded-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">सप्लायर प्रकार</Label>
                          <Select value={monitoringForm.supplierType} onValueChange={(v) => setMonitoringForm({...monitoringForm, supplierType: v, supplierName: "", villageName: ""})}>
                            <SelectTrigger className="h-9 text-[11px] border-2 border-black font-black"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="Gavali" className="font-bold">गवळी</SelectItem><SelectItem value="Route" className="font-bold">रूट (Village)</SelectItem><SelectItem value="Gotha" className="font-bold">गोठा</SelectItem></SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black uppercase opacity-60">सप्लायर निवडा / नाव *</Label>
                          <div className="flex gap-2">
                             <Select 
                               value={monitoringForm.supplierName} 
                               onValueChange={(val) => {
                                 const found = currentAvailableSuppliers.find((s: any) => (s.name || s.routeName) === val);
                                 setMonitoringForm({ ...monitoringForm, supplierName: val, villageName: found?.address || found?.village || "" });
                               }}
                             >
                               <SelectTrigger className="h-9 text-[11px] border-2 border-black font-black flex-1"><SelectValue placeholder="यादीतून निवडा" /></SelectTrigger>
                               <SelectContent>
                                  {currentAvailableSuppliers.map((s: any, i: number) => (
                                    <SelectItem key={i} value={s.name || s.routeName} className="font-bold">{s.name || s.routeName}</SelectItem>
                                  ))}
                                  {currentAvailableSuppliers.length === 0 && <SelectItem value="none" disabled>प्रथम सप्लायर जोडा</SelectItem>}
                               </SelectContent>
                             </Select>
                             <Input 
                               placeholder="किंवा नवीन नाव" 
                               value={monitoringForm.supplierName} 
                               onChange={e => setMonitoringForm({...monitoringForm, supplierName: e.target.value})} 
                               className="h-9 border-2 border-black rounded-xl font-bold text-xs flex-1" 
                             />
                          </div>
                        </div>
                        <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">गाव *</Label><Input value={monitoringForm.villageName} onChange={e => setMonitoringForm({...monitoringForm, villageName: e.target.value})} className="h-9 border-2 border-black rounded-xl font-bold text-xs" /></div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">समस्ये प्रकार (Reason) *</Label>
                          <Select value={monitoringForm.reason} onValueChange={(v: MonitoringReason) => setMonitoringForm({...monitoringForm, reason: v})}>
                            <SelectTrigger className="h-9 text-[11px] border-2 border-black font-black"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {Object.entries(REASONS).map(([k, v]) => <SelectItem key={k} value={k} className="font-bold text-xs">{v}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">तपशीलवार निरीक्षण</Label><Textarea value={monitoringForm.detailedRemarks} onChange={e => setMonitoringForm({...monitoringForm, detailedRemarks: e.target.value})} className="h-20 border-2 border-black font-medium text-xs p-2" placeholder="सविस्तर माहिती लिहा..." /></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                       <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">निरीक्षण तारीख</Label><Input type="date" value={monitoringForm.observationDate} onChange={e => setMonitoringForm({...monitoringForm, observationDate: e.target.value})} className="h-9 border-2 border-black text-xs font-black" /></div>
                       <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">स्थिती</Label>
                         <Select value={monitoringForm.status} onValueChange={(v) => setMonitoringForm({...monitoringForm, status: v})}>
                            <SelectTrigger className="h-9 border-2 border-black font-black text-[10px]"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="Active" className="font-bold">प्रलंबित (Active)</SelectItem><SelectItem value="Resolved" className="font-bold">निकाली (Resolved)</SelectItem></SelectContent>
                         </Select>
                       </div>
                    </div>
                    <Button onClick={handleAddMonitoring} className="w-full mt-4 h-10 font-black uppercase text-[11px] bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-200"><Plus className="h-4 w-4 mr-2" /> यादीत जोडा</Button>
                  </Card>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><History className="h-4 w-4" /> मागील निरीक्षणे (HISTORY)</h4>
                    <div className="border-2 border-black rounded-xl overflow-hidden shadow-sm bg-white">
                      <ScrollArea className="w-full">
                        <Table className="min-w-[800px]">
                          <TableHeader className="bg-slate-50">
                            <TableRow className="h-9 border-b-2 border-black">
                              <TableHead className="font-black text-[9px] uppercase px-3">दिनांक</TableHead>
                              <TableHead className="font-black text-[9px] uppercase px-3">सप्लायर / गाव</TableHead>
                              <TableHead className="font-black text-[9px] uppercase px-3">समस्या</TableHead>
                              <TableHead className="font-black text-[9px] uppercase text-center">स्थिती</TableHead>
                              <TableHead className="font-black text-[9px] uppercase text-right px-3">क्रिया</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedMonitoringEntries.map((entry) => (
                              <TableRow key={entry.id} className="h-12 border-b last:border-0 hover:bg-muted/30">
                                <TableCell className="px-3"><span className="text-[10px] font-black">{entry.observationDate}</span></TableCell>
                                <TableCell className="px-3">
                                  <div className="flex flex-col">
                                    <span className="font-black text-[11px] uppercase">{entry.supplierName}</span>
                                    <span className="text-[8px] font-bold text-muted-foreground">{entry.villageName} ({entry.supplierType})</span>
                                  </div>
                                </TableCell>
                                <TableCell className="px-3">
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-rose-600">{REASONS[entry.reason]}</span>
                                    {entry.detailedRemarks && <span className="text-[8px] italic opacity-60 line-clamp-1">{entry.detailedRemarks}</span>}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge onClick={() => toggleMonitoringStatus(entry)} className={cn("cursor-pointer h-5 px-2 text-[8px] font-black uppercase border-none", entry.status === 'Active' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700')}>
                                    {entry.status === 'Active' ? 'सक्रिय (Active)' : 'सुधारणा झाली (Resolved)'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="px-3 text-right">
                                  <Button variant="ghost" size="icon" onClick={() => handleDeleteMonitoring(entry.id)} className="h-8 w-8 text-rose-400"><Trash2 className="h-4 w-4" /></Button>
                                </TableCell>
                              </TableRow>
                            ))}
                            {sortedMonitoringEntries.length === 0 && (
                              <TableRow><TableCell colSpan={5} className="h-24 text-center opacity-30 italic font-black uppercase text-[10px]">निरीक्षण यादी कोरी आहे.</TableCell></TableRow>
                            )}
                          </TableBody>
                        </Table>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              )}

            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>

          <DialogFooter className="p-3 border-t bg-muted/10 shrink-0 flex flex-row gap-3 no-print">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1 h-12 rounded-xl font-black uppercase text-[11px] border-2 border-black bg-white">रद्द</Button>
            <Button onClick={handleSave} className="flex-[2] h-12 rounded-xl shadow-xl shadow-primary/30 font-black uppercase text-[11px] tracking-widest transition-all active:scale-95 bg-primary text-white flex items-center justify-center gap-2"><CheckCircle2 className="h-5 w-5" /> माहिती जतन करा (SAVE)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
