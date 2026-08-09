"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Route } from "@/lib/types"
import { Plus, MapPin, Truck, Edit, ChevronRight, AlertTriangle, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"

export default function RoutesPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const routesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'routes')
  }, [db, user])

  const suppliersQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'suppliers')
  }, [db, user])

  const { data: routes, isLoading } = useCollection(routesQuery)
  const { data: suppliers } = useCollection(suppliersQuery)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentRouteId, setCurrentRouteId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  
  const [formData, setFormData] = useState({ 
    name: "", 
    distanceKm: "", 
    vehicle: "", 
    costPerKm: "",
    iceBlocks: "0"
  })

  useEffect(() => setMounted(true), [])

  const handleOpenAdd = () => {
    setIsEditing(false)
    setCurrentRouteId(null)
    setFormData({ name: "", distanceKm: "", vehicle: "", costPerKm: "", iceBlocks: "0" })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (route: Route) => {
    setIsEditing(true)
    setCurrentRouteId(route.id)
    setFormData({
      name: route.name,
      distanceKm: String(route.distanceKm),
      vehicle: route.vehicle,
      costPerKm: String(route.costPerKm),
      iceBlocks: String(route.iceBlocks || 0)
    })
    setIsDialogOpen(true)
  }

  const handleSaveRoute = () => {
    if (!formData.name || !formData.distanceKm || !formData.vehicle || !db || !user) {
      toast({ title: "त्रुटी", description: "कृपया आवश्यक माहिती भरा.", variant: "destructive" })
      return
    }

    const routeData = {
      name: formData.name, 
      distanceKm: Number(formData.distanceKm), 
      vehicle: formData.vehicle, 
      costPerKm: Number(formData.costPerKm) || 0,
      iceBlocks: Number(formData.iceBlocks) || 0,
      updatedAt: new Date().toISOString()
    }

    if (isEditing && currentRouteId) {
      const docRef = doc(db, 'users', user.uid, 'routes', currentRouteId)
      updateDocumentNonBlocking(docRef, routeData)
      toast({ title: "यशस्वी", description: "रूटची माहिती अद्ययावत केली." })
    } else {
      const colRef = collection(db, 'users', user.uid, 'routes')
      addDocumentNonBlocking(colRef, routeData)
      toast({ title: "यशस्वी", description: "नवीन रूट जोडला गेला." })
    }

    setIsDialogOpen(false)
  }

  const handleDeleteRoute = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!db || !user) return
    if (confirm("तुम्हाला खात्री आहे की हा रूट हटवायचा आहे? या रूटमधील सर्व सप्लायर्स अन-असाईन होतील.")) {
      const docRef = doc(db, 'users', user.uid, 'routes', id)
      deleteDocumentNonBlocking(docRef)
      toast({ title: "यशस्वी", description: "रूट हटवण्यात आला." })
    }
  }

  const getRouteMilkTotals = (routeId: string) => {
    const routeSupps = suppliers?.filter(s => s.routeId === routeId) || []
    const totalCow = routeSupps.reduce((acc, s) => acc + (s.cowMilk?.quantity || 0), 0)
    const totalBuf = routeSupps.reduce((acc, s) => acc + (s.buffaloMilk?.quantity || 0), 0)
    return { totalCow, totalBuf, pointsCount: routeSupps.length }
  }

  if (!mounted || isLoading) return <div className="p-10 text-center italic font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="space-y-4 max-w-6xl mx-auto w-full pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-2 border-b pb-4">
        <div className="space-y-0.5">
          <h2 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2 uppercase tracking-tight">
            <Truck className="h-6 w-6 text-primary" /> रूट (ROUTES)
          </h2>
          <p className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em] ml-1">Logistics & Costing</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button asChild variant="outline" className="flex-1 sm:flex-none gap-1.5 font-black h-10 text-[10px] px-4 rounded-xl border-destructive text-destructive hover:bg-destructive/5 uppercase">
            <Link href="/routes/breakdown"><AlertTriangle className="h-4 w-4" /> ब्रेकडाऊन</Link>
          </Button>
          <Button type="button" onClick={handleOpenAdd} className="flex-1 sm:flex-none gap-1.5 shadow-md font-black h-10 text-[10px] px-5 rounded-xl uppercase shadow-primary/20">
            <Plus className="h-4 w-4" /> नवीन रूट
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 px-2">
        {routes && routes.length > 0 ? (
          routes.map((route) => {
            const totals = getRouteMilkTotals(route.id)
            return (
              <Card key={route.id} className="border shadow-none hover:shadow-md transition-all bg-white overflow-hidden flex flex-col rounded-2xl border-t-4 border-t-primary border-muted-foreground/10">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-primary/10 text-primary font-black py-0.5 px-2.5 rounded-full text-[9px] uppercase border border-primary/10 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {route.distanceKm} KM
                    </span>
                    <div className="flex gap-1">
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/5 rounded-full" onClick={(e) => handleOpenEdit(route)}><Edit className="h-4 w-4" /></Button>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/5 rounded-full" onClick={(e) => handleDeleteRoute(route.id, e)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <CardTitle className="mt-1 font-black text-lg uppercase tracking-tight text-slate-900">{route.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5 font-black text-muted-foreground uppercase text-[9px] tracking-tight opacity-60"><Truck className="h-3 w-3 text-primary" /> {route.vehicle}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-4 pt-0 flex-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-center"><div className="text-blue-600 font-black text-[8px] uppercase tracking-tighter">गाय (COW)</div><p className="text-lg font-black text-blue-900">{totals.totalCow.toFixed(1)}L</p></div>
                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 text-center"><div className="text-amber-600 font-black text-[8px] uppercase tracking-tighter">म्हेस (BUF)</div><p className="text-lg font-black text-amber-900">{totals.totalBuf.toFixed(1)}L</p></div>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 bg-muted/20 p-2.5 rounded-xl border border-muted-foreground/5 text-[7px] font-black uppercase text-center opacity-80">
                    <div className="space-y-0.5"><div className="text-muted-foreground">सप्लायर</div><div className="text-foreground text-[10px]">{totals.pointsCount}</div></div>
                    <div className="space-y-0.5"><div className="text-muted-foreground leading-tight">कॉस्टिंग</div><div className="text-foreground text-[10px]">₹{route.costPerKm}</div></div>
                    <div className="space-y-0.5"><div className="text-muted-foreground">बर्फ</div><div className="text-foreground text-[10px]">{route.iceBlocks || 0}</div></div>
                  </div>
                </CardContent>
                <CardFooter className="p-0 border-t mt-auto border-muted-foreground/10">
                   <Button variant="ghost" className="w-full justify-between text-primary font-black uppercase text-[9px] tracking-[0.2em] h-11 px-5 hover:bg-primary/5 rounded-none" asChild>
                      <Link href={`/routes/${route.id}`}><span>सप्लायर व्यवस्थापन</span><ChevronRight className="h-4 w-4" /></Link>
                   </Button>
                </CardFooter>
              </Card>
            )
          })
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center gap-2 opacity-20">
             <MapPin className="h-12 w-12 text-slate-300" /><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">एकही रूट उपलब्ध नाही</h3>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-0 overflow-hidden bg-white border-none shadow-2xl">
          <DialogHeader className="p-4 bg-primary text-white">
            <DialogTitle className="text-base font-black uppercase tracking-widest">{isEditing ? 'माहिती बदला (EDIT ROUTE)' : 'नवीन रूट (NEW ROUTE)'}</DialogTitle>
            <DialogDescription className="text-[9px] text-white/70 uppercase">रूटचे तपशील भरा.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 p-6 bg-white">
            <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-primary tracking-widest">रूटचे नाव</Label><Input placeholder="उदा. रस्तापूर रूट" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-11 text-[11px] rounded-2xl bg-muted/20 border-none font-black p-4 shadow-inner" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-primary tracking-widest">अंतर (KM)</Label><Input type="number" value={formData.distanceKm} onChange={(e) => setFormData({...formData, distanceKm: e.target.value})} className="h-11 text-[11px] rounded-2xl bg-muted/20 border-none font-black p-4 shadow-inner" /></div>
              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-primary tracking-widest">दर प्रति KM (₹)</Label><Input type="number" step="0.01" value={formData.costPerKm} onChange={(e) => setFormData({...formData, costPerKm: e.target.value})} className="h-11 text-[11px] rounded-2xl bg-muted/20 border-none font-black p-4 shadow-inner" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-primary tracking-widest">वाहन नाव</Label><Input value={formData.vehicle} onChange={(e) => setFormData({...formData, vehicle: e.target.value})} className="h-11 text-[11px] rounded-2xl bg-muted/20 border-none font-black p-4 shadow-inner" /></div>
              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-primary tracking-widest">बर्फाचे प्रमाण</Label><Input type="number" value={formData.iceBlocks} onChange={(e) => setFormData({...formData, iceBlocks: e.target.value})} className="h-11 text-[11px] rounded-2xl bg-muted/20 border-none font-black p-4 shadow-inner" /></div>
            </div>
          </div>
          <DialogFooter className="p-4 border-t bg-muted/10 gap-2 flex justify-end">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="font-black h-10 text-[10px] rounded-2xl px-6 border-primary/20 uppercase">रद्द</Button>
            <Button type="button" onClick={handleSaveRoute} className="font-black h-10 text-[10px] rounded-2xl px-10 shadow-lg shadow-primary/20 uppercase">जतन करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
