
"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Supplier, Route } from "@/lib/types"
import { Plus, Search, MapPin, Phone, Info, Milk, User, ChevronRight } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function RouteDetailsPage() {
  const params = useParams()
  const routeId = params.id as string

  const [route, setRoute] = useState<Route | null>(null)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedRoutes = JSON.parse(localStorage.getItem('procurepal_routes') || '[]')
    const storedSupps = JSON.parse(localStorage.getItem('procurepal_suppliers') || '[]')
    
    const currentRoute = storedRoutes.find((r: Route) => r.id === routeId)
    setRoute(currentRoute || null)
    setSuppliers(storedSupps.filter((s: Supplier) => s.routeId === routeId))
  }, [routeId])

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [suppliers, searchQuery])

  if (!mounted) return null

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      <div>
        <h2 className="text-3xl font-headline font-bold text-foreground">Route Details</h2>
        <p className="text-muted-foreground mt-1">Managing Path ID: {route?.id.slice(0, 8) || routeId.slice(0, 8)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left List Panel */}
        <Card className="lg:col-span-4 border-none shadow-sm flex flex-col">
          <CardHeader className="flex-none p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Suppliers</CardTitle>
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                placeholder="Filter suppliers..." 
                className="pl-8 h-8 text-xs" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full">
              <div className="divide-y">
                {filteredSuppliers.map(s => (
                  <div 
                    key={s.id}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${selectedSupplier?.id === s.id ? 'bg-primary/5 border-l-4 border-primary' : ''}`}
                    onClick={() => setSelectedSupplier(s)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm">{s.name}</h4>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">ID: {s.id.slice(0, 8)}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" /> {s.address}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right Detail Panel */}
        <Card className="lg:col-span-8 border-none shadow-sm flex flex-col">
          {selectedSupplier ? (
            <ScrollArea className="flex-1">
              <CardContent className="p-6 space-y-8">
                {/* Header Info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                  <div>
                    <h3 className="text-2xl font-bold font-headline">{selectedSupplier.name}</h3>
                    <p className="text-sm text-muted-foreground">Supplier ID: {selectedSupplier.id.slice(0, 12)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700 font-bold px-3 py-1">
                      {selectedSupplier.milkQuality || 'A+ Grade'}
                    </Badge>
                    <Badge variant="secondary" className="bg-primary/10 text-primary font-bold px-3 py-1">
                      {((selectedSupplier.cowMilk?.quantity || 0) + (selectedSupplier.buffaloMilk?.quantity || 0)).toFixed(1)} Total Liters
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Contacts */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Phone className="h-3 w-3" /> Contact Details
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Mobile Number</Label>
                        <p className="text-sm font-medium">{selectedSupplier.mobile}</p>
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Address</Label>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {selectedSupplier.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Competition */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Info className="h-3 w-3" /> Village Competition
                    </h4>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm italic">{selectedSupplier.competition || "Amul local collection center"}</p>
                    </div>
                  </div>
                </div>

                {/* Other Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Other Information</h4>
                  <div className="p-4 border rounded-lg bg-background">
                    <p className="text-sm text-muted-foreground">{selectedSupplier.additionalInfo || "Preferred morning collection."}</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Milk className="h-3 w-3" /> Cow Milk Metrics
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="h-8 py-0">QTY</TableHead>
                            <TableHead className="h-8 py-0">FAT</TableHead>
                            <TableHead className="h-8 py-0">SNF</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="py-2">{selectedSupplier.cowMilk?.quantity || 0}L</TableCell>
                            <TableCell className="py-2">{selectedSupplier.cowMilk?.fat || 0}%</TableCell>
                            <TableCell className="py-2">{selectedSupplier.cowMilk?.snf || 0}%</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Milk className="h-3 w-3 text-amber-600" /> Buffalo Milk Metrics
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="h-8 py-0">QTY</TableHead>
                            <TableHead className="h-8 py-0">FAT</TableHead>
                            <TableHead className="h-8 py-0">SNF</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="py-2">{selectedSupplier.buffaloMilk?.quantity || 0}L</TableCell>
                            <TableCell className="py-2">{selectedSupplier.buffaloMilk?.fat || 0}%</TableCell>
                            <TableCell className="py-2">{selectedSupplier.buffaloMilk?.snf || 0}%</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center flex-col gap-3">
              <User className="h-12 w-12 text-muted-foreground/30" />
              <div className="space-y-1">
                <h4 className="font-bold">No Supplier Selected</h4>
                <p className="text-sm text-muted-foreground">Select a supplier from the list to view full details.</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
