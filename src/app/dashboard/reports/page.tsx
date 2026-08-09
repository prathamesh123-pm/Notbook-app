"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Archive, Calendar, ArrowRight, FileText, ClipboardList, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { useRouter } from "next/navigation"

export default function ReportsPage() {
  const { user } = useUser()
  const db = useFirestore()
  const router = useRouter()
  
  const reportsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, 'users', user.uid, 'dailyWorkReports'), orderBy('createdAt', 'desc'))
  }, [db, user])

  const { data: reports, isLoading } = useCollection(reportsQuery)
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const filteredReports = useMemo(() => {
    const list = reports || []
    return list.filter(r => 
      r.type?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.summary?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [reports, searchQuery])

  if (!mounted || isLoading) return <div className="p-20 text-center font-black uppercase text-[10px] opacity-50 animate-pulse">लोड होत आहे...</div>

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full pb-10 px-2 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Archive className="h-6 w-6 text-primary" /> अहवाल संग्रहालय (ARCHIVE)
          </h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Historical operational data and logs</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-xl text-primary font-black text-[10px] border border-primary/10 uppercase">
          <FileText className="h-4 w-4" /> एकूण अहवाल: {reports?.length || 0}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
        <input 
          placeholder="अहवाल प्रकार किंवा मजकूर शोधा..." 
          className="w-full pl-10 h-12 bg-white border border-muted-foreground/10 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary shadow-sm"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filteredReports.map((report) => (
          <Card key={report.id} className="border shadow-none hover:shadow-xl transition-all rounded-2xl overflow-hidden border-muted-foreground/10 border-l-4 border-l-primary group cursor-pointer" onClick={() => router.push('/reports')}>
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        <ClipboardList className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm uppercase tracking-tight text-slate-900">{report.type}</h4>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold">
                          <Calendar className="h-3 w-3" /> {report.date}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-black uppercase opacity-50">ID: {report.id.slice(0, 8)}</Badge>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">अहवाल सारांश (Summary)</p>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2 italic">
                      {report.summary || "No summary available."}
                    </p>
                  </div>
                </div>

                <Button variant="ghost" size="sm" className="gap-2 font-black uppercase text-[10px] text-primary hover:bg-primary/5 rounded-xl">
                  अहवाल उघडा <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredReports.length === 0 && (
          <div className="p-20 text-center bg-muted/5 rounded-3xl border-2 border-dashed border-muted-foreground/10 flex flex-col items-center gap-3 opacity-30">
            <Archive className="h-12 w-12" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">अहवाल सापडले नाहीत</p>
          </div>
        )}
      </div>
    </div>
  )
}
