"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Route } from "@/lib/types"
import { Plus, MapPin, Truck, Users, IndianRupee, Trash2, ArrowRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import Link from "next/link"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RoutesPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const routesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, 'routes'), orderBy('updatedAt', 'desc'))
  }, [db, user])

  const { data: routes, isLoading } = useCollection<Route>(routesQuery)
  const [isAddingRoute, setIsAddingRoute] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const [formData, setFormData] = useState({ 
    name: "", 
    distanceKm: "", 
    vehicle: "", 
    costPerKm: "",
    initialSuppliers: "0" 
  })

  useEffect(() => setMounted(true), [])

  const handleAddRoute = () => {
    if (!formData.name || !formData.distanceKm || !formData.vehicle || !db) return
    const newRoute = {
      name: formData.name,
      distanceKm: Number(formData.distanceKm),
      vehicle: formData.vehicle,
      costPerKm: Number(formData.costPerKm) || 0,
      supplierIds: [],
      updatedAt: new Date().toISOString()
    }
    addDocumentNonBlocking(collection(db, 'routes'), newRoute)
    setFormData({ name: "", distanceKm: "", vehicle: "", costPerKm: "", initialSuppliers: "0" })
    setIsAddingRoute(false)
    toast({ title: "यशस्वी", description: "नवीन रूट जोडण्यात आला आहे." })
  }

  const deleteRoute = (id: string) => {
    if (!db) return
    if (confirm("तुम्हाला खात्री आहे की हा रूट हटवायचा आहे?")) {
      deleteDocumentNonBlocking(collection(db, 'routes'), id)
      toast({ title: "यशस्वी", description: "रूट हटवण्यात आला." })
    }
  }

  if (!mounted || isLoading) return <div className="p-20 text-center font-black uppercase text-[10px] opacity-50 animate-pulse">लोड होत आहे...</div>

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full pb-10 px-2 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" /> दूध संकलन रूट (ROUTES)
          </h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Logistics, costing, and supplier network</p>
        </div>
        <Dialog open={isAddingRoute} onOpenChange={setIsAddingRoute}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-xl shadow-primary/20 h-10 px-6 rounded-xl font-black uppercase text-[10px]">
              <Plus className="h-4 w-4" /> नवीन रूट जोडा
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="font-black uppercase tracking-widest text-sm">नवीन रूट तयार करा</DialogTitle>
              <DialogDescription className="text-[10px] uppercase">संकलन नेटवर्कमध्ये नवीन रूट समाविष्ट करा.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">रूटचे नाव *</Label>
                <Input placeholder="उदा. रस्तापूर रूट" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-11 rounded-xl bg-muted/20 border-none font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">अंतर (KM)</Label>
                  <Input type="number" placeholder="40" value={formData.distanceKm} onChange={e => setFormData({...formData, distanceKm: e.target.value})} className="h-11 rounded-xl bg-muted/20 border-none font-bold" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">दर (₹/KM)</Label>
                  <Input type="number" step="0.01" placeholder="0.85" value={formData.costPerKm} onChange={e => setFormData({...formData, costPerKm: e.target.value})} className="h-11 rounded-xl bg-muted/20 border-none font-bold" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">नेमलेले वाहन</Label>
                <Input placeholder="उदा. टाटा एस" value={formData.vehicle} onChange={e => setFormData({...formData, vehicle: e.target.value})} className="h-11 rounded-xl bg-muted/20 border-none font-bold" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingRoute(false)} className="rounded-xl font-black uppercase text-[10px]">रद्द करा</Button>
              <Button onClick={handleAddRoute} className="rounded-xl font-black uppercase text-[10px] px-8 shadow-lg shadow-primary/20">रूट जतन करा</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {routes && routes.length > 0 ? (
          routes.map((route) => (
            <Card key={route.id} className="border shadow-none hover:shadow-xl transition-all rounded-2xl overflow-hidden border-muted-foreground/10 bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg" onClick={() => deleteRoute(route.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="mt-4 font-black text-lg uppercase tracking-tight text-slate-900">{route.name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 font-bold uppercase text-[9px] opacity-60">
                  <Truck className="h-3 w-3" /> {route.vehicle}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-2 text-[11px] font-bold uppercase text-slate-600">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary/50" />
                  <span>{route.supplierIds?.length || 0} सक्रिय सप्लायर्स</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary/50" />
                  <span>एकूण अंतर: {route.distanceKm} KM</span>
                </div>
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-primary/50" />
                  <span>रेट: ₹{route.costPerKm} / KM</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t border-muted-foreground/5">
                 <Button variant="ghost" className="w-full justify-between text-primary font-black uppercase text-[10px] tracking-widest h-11 px-4 hover:bg-primary/5 group" asChild>
                    <Link href={`/routes/${route.id}`}>
                      सप्लायर व्यवस्थापन <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                 </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-muted/5 rounded-3xl border-2 border-dashed border-muted-foreground/10 flex flex-col items-center gap-3 opacity-30">
             <MapPin className="h-12 w-12" />
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">एकही रूट सापडला नाही</h3>
          </div>
        )}
      </div>
    </div>
  )
}
