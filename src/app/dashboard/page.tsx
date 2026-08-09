"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ListTodo, MapPin, TrendingUp, Warehouse, Calendar, Milk, ArrowUpRight, ShieldAlert } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase"
import { collection, doc } from "firebase/firestore"

export default function DashboardOverview() {
  const { user } = useUser()
  const db = useFirestore()
  const [mounted, setMounted] = useState(false)

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, 'users', user.uid)
  }, [db, user])

  const tasksQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'tasks')
  }, [db, user])

  const routesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'routes')
  }, [db, user])

  const suppliersQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'suppliers')
  }, [db, user])

  const { data: userData } = useDoc(userDocRef)
  const { data: tasks } = useCollection(tasksQuery)
  const { data: routes } = useCollection(routesQuery)
  const { data: suppliers } = useCollection(suppliersQuery)

  useEffect(() => setMounted(true), [])

  const stats = useMemo(() => {
    const allSupps = suppliers || []
    const totalCow = allSupps.reduce((acc, s) => acc + (Number(s.cowMilk?.quantity) || 0), 0)
    const totalBuf = allSupps.reduce((acc, s) => acc + (Number(s.buffaloMilk?.quantity) || 0), 0)
    
    return {
      cowMilk: totalCow,
      bufMilk: totalBuf,
      totalMilk: totalCow + totalBuf,
      activeRoutes: routes?.length || 0,
      totalPoints: allSupps.length,
      pendingTasks: (tasks || [])?.filter(t => t.status === 'pending').length || 0
    }
  }, [tasks, routes, suppliers])

  if (!mounted) return <div className="flex items-center justify-center h-[80vh] text-muted-foreground animate-pulse font-black uppercase text-xs">लोड होत आहे...</div>

  const statCards = [
    { title: "एकूण दूध (Total Milk)", value: `${stats.totalMilk.toFixed(1)} L`, subValue: `गाय: ${stats.cowMilk.toFixed(1)} | म्हैस: ${stats.bufMilk.toFixed(1)}`, icon: Milk, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "सक्रिय रूट (Routes)", value: stats.activeRoutes, subValue: "वाहन व लॉजिस्टिक", icon: MapPin, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "सप्लायर्स (Suppliers)", value: stats.totalPoints, subValue: "गवळी व सेंटर्स", icon: Warehouse, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "प्रलंबित कामे (Tasks)", value: stats.pendingTasks, subValue: "तात्काळ लक्ष द्या", icon: ListTodo, color: "text-rose-600", bg: "bg-rose-50" },
  ]

  const actions = [
    { title: "दैनिक अहवाल", sub: "Report", href: "/daily-report", color: "bg-blue-600", icon: Calendar },
    { title: "कामकाज नोंद", sub: "Work Log", href: "/work-log", color: "bg-orange-600", icon: ListTodo },
    { title: "जप्ती व दंड", sub: "Seizure", href: "/reports/entry/seizure", color: "bg-amber-600", icon: ShieldAlert },
    { title: "रूट माहिती", sub: "Routes", href: "/routes", color: "bg-emerald-600", icon: MapPin },
  ]

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full pb-10 px-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between border-b pb-4">
        <div className="space-y-0.5 text-left">
          <h2 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded-lg text-white shadow-md"><TrendingUp className="h-5 w-5" /></div> डॅशबोर्ड
          </h2>
          <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest ml-1 opacity-70">
            {userData?.displayName ? `स्वागत आहे, ${userData.displayName}` : "तुमच्या कार्याचा सारांश"}
          </p>
        </div>
        <Badge variant="outline" className="w-fit px-3 py-1.5 rounded-xl border-primary/20 bg-white shadow-sm text-primary font-black text-[10px] uppercase">
          <Calendar className="h-3.5 w-3.5 mr-1.5" /> {new Date().toLocaleDateString('mr-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Badge>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border shadow-sm hover:shadow-xl transition-all bg-white overflow-hidden rounded-2xl relative border-muted-foreground/5 group">
            <CardContent className="p-4 flex flex-col gap-2 text-left">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}><stat.icon className="h-5 w-5" /></div>
                <ArrowUpRight className={`h-4 w-4 ${stat.color} opacity-0 group-hover:opacity-100 transition-all`} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">{stat.title}</p>
                <div className="text-xl font-black tracking-tighter text-slate-900">{stat.value}</div>
                <p className="text-[8px] text-muted-foreground font-bold uppercase opacity-60 truncate">{stat.subValue}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black flex items-center gap-2 uppercase tracking-[0.2em] text-slate-400 ml-1"><div className="w-6 h-[1.5px] bg-slate-200" /> झटपट पर्याय</h3>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => (
            <Link key={action.title} href={action.href} className="group">
              <Card className="border shadow-sm hover:shadow-2xl transition-all cursor-pointer bg-white overflow-hidden rounded-2xl h-full flex flex-col items-center justify-center p-4 text-center group-hover:-translate-y-0.5 border-muted-foreground/5">
                <div className={`p-3 rounded-xl ${action.color} text-white shadow-lg mb-3 group-hover:scale-110 transition-transform`}><action.icon className="h-5 w-5" /></div>
                <h4 className="font-black text-[11px] text-slate-900 uppercase tracking-tight">{action.title}</h4>
                <p className="text-[8px] text-muted-foreground font-bold uppercase mt-0.5 opacity-50">{action.sub}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
