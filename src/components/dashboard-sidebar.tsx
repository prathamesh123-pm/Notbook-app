"use client"

import * as React from "react"
import { 
  LayoutDashboard, ListTodo, MapPin, LogOut, Milk, 
  ClipboardCheck, Archive, UserCircle, Warehouse, 
  X, FileEdit, Users, Thermometer, Layers
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useAuth } from "@/firebase"
import { signOut } from "firebase/auth"

const items = [
  {
    title: "डॅशबोर्ड",
    url: "/dashboard",
    icon: LayoutDashboard,
    sub: "Overview"
  },
  {
    title: "दैनिक अहवाल",
    url: "/daily-report",
    icon: ClipboardCheck,
    sub: "Report"
  },
  {
    title: "कामकाज नोंद",
    url: "/work-log",
    icon: ListTodo,
    sub: "Tasks"
  },
  {
    title: "ERP रिपोर्ट",
    url: "/reports/entry/route-allocation",
    icon: Layers,
    sub: "ERP Report"
  },
  {
    title: "सप्लायर मास्टर",
    url: "/suppliers",
    icon: Users,
    sub: "Master List"
  },
  {
    title: "चिलिंग सेंटर",
    url: "/chilling-centers",
    icon: Thermometer,
    sub: "Chilling Units"
  },
  {
    title: "संकलन केंद्र",
    url: "/centers",
    icon: Warehouse,
    sub: "Centers"
  },
  {
    title: "रूट माहिती",
    url: "/routes",
    icon: MapPin,
    sub: "Routes"
  },
  {
    title: "अहवाल पहा",
    url: "/reports",
    icon: Archive,
    sub: "Archive"
  },
  {
    title: "फॉर्म बिल्डर",
    url: "/form-builder",
    icon: FileEdit,
    sub: "Word Editor"
  },
  {
    title: "प्रोफाईल",
    url: "/profile",
    icon: UserCircle,
    sub: "Profile"
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const auth = useAuth()
  const [mounted, setMounted] = React.useState(false)
  const { setOpenMobile, isMobile } = useSidebar()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const handleLogout = async () => {
    if (confirm("बाहेर पडायचे आहे का?")) {
      try {
        await signOut(auth)
        router.push('/login')
      } catch (error) {
        console.error("Logout failed:", error)
      }
    }
  }

  if (!mounted) return null;

  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-white">
      <SidebarHeader className="px-4 py-6 bg-white relative border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/30 shrink-0 transform transition-transform hover:scale-105 duration-300">
            <Milk className="h-7 w-7" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden min-w-0">
            <span className="font-headline text-lg font-black tracking-tight text-slate-900 truncate uppercase">
              संकलन नोंदवही
            </span>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] truncate opacity-60">Daily Register</span>
          </div>
        </div>
        {isMobile && (
          <Button 
            type="button"
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-6 h-10 w-10 rounded-full hover:bg-slate-50 text-slate-400"
            onClick={() => setOpenMobile(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        )}
      </SidebarHeader>
      
      <SidebarContent className="bg-white px-2 mt-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-4 uppercase tracking-[0.3em] text-[10px] font-black text-slate-300 group-data-[collapsible=icon]:hidden">
            मुख्य मेनू (Navigation)
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {items.map((item) => {
                const isActive = pathname === item.url || (item.url !== '/dashboard' && pathname?.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      onClick={handleLinkClick}
                      className={cn(
                        "flex h-12 items-center gap-4 rounded-2xl px-4 transition-all duration-300 group",
                        isActive 
                          ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]" 
                          : "hover:bg-slate-50 text-slate-500 hover:text-primary"
                      )}
                    >
                      <Link href={item.url} className="flex items-center gap-4">
                        <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-primary")} />
                        <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                          <span className="font-black tracking-tight text-[12px] uppercase leading-none">{item.title}</span>
                          <span className={cn("text-[8px] font-black uppercase mt-1 tracking-widest", isActive ? "text-white/60" : "text-slate-300")}>{item.sub}</span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto p-4 group-data-[collapsible=icon]:hidden">
        <Card className="bg-slate-50 border-none rounded-2xl p-4 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <LogOut className="h-12 w-12" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Logout Session</p>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-11 rounded-xl px-4 font-black uppercase text-[11px] tracking-widest bg-white shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>बाहेर पडा</span>
          </Button>
        </Card>
      </div>
      <SidebarRail />
    </Sidebar>
  )
}
