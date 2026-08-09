
"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { 
  UserCircle, 
  Save, 
  IdCard, 
  ShieldCheck, 
  Upload, 
  Trash2, 
  Maximize2, 
  X, 
  Image as ImageIcon,
  LogOut,
  Loader2
} from "lucide-react"
import Image from "next/image"
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking, useAuth } from "@/firebase"
import { doc, setDoc } from "firebase/firestore"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { user } = useUser()
  const db = useFirestore()
  const auth = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, 'users', user.uid)
  }, [db, user])

  const { data: userData, isLoading: isDocLoading } = useDoc(userDocRef)

  const [name, setName] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  const [photo, setPhoto] = useState<string | null>(null)
  const [isFullView, setIsFullView] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (userData) {
      setName(userData.displayName || "")
      setEmployeeId(userData.employeeId || "")
      setPhoto(userData.permissionPhoto || null)
    }
  }, [userData])

  const handleSaveProfile = async () => {
    if (!db || !user) return
    
    try {
      const docRef = doc(db, 'users', user.uid)
      await setDoc(docRef, {
        displayName: name,
        employeeId: employeeId,
        permissionPhoto: photo,
        email: user.email,
        updatedAt: new Date().toISOString()
      }, { merge: true })
      
      toast({ title: "प्रोफाईल जतन केली", description: "माहिती सुरक्षितपणे डेटाबेसवर सेव्ह झाली." })
    } catch (e) {
      toast({ title: "त्रुटी", description: "सेव्ह करताना अडचण आली.", variant: "destructive" })
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "मोठी फाईल", description: "२ एमबी पेक्षा कमी फोटो निवडा.", variant: "destructive" })
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setPhoto(base64String)
        toast({ title: "फोटो तयार", description: "जतन बटण दाबून सेव्ह करा." })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDeletePhoto = () => {
    if (confirm("हटवायचे आहे का?")) {
      setPhoto(null)
      toast({ title: "फोटो काढला", description: "जतन बटण दाबून बदल सेव्ह करा." })
    }
  }

  const handleLogout = async () => {
    if (confirm("बाहेर पडायचे आहे का?")) {
      await signOut(auth)
      router.push('/login')
    }
  }

  if (!mounted || isDocLoading) return <div className="p-20 text-center italic font-black uppercase text-[10px] opacity-50"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> लोड होत आहे...</div>

  return (
    <div className="space-y-4 max-w-4xl mx-auto w-full pb-10 px-2 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-xl font-headline font-black text-foreground tracking-tight flex items-center gap-2">
          <UserCircle className="h-6 w-6 text-primary" /> 
          प्रोफाईल (Profile)
        </h2>
        <Button variant="outline" size="sm" onClick={handleLogout} className="text-rose-600 border-rose-200 hover:bg-rose-50 font-black uppercase text-[9px] rounded-xl h-9 px-4">
          <LogOut className="h-3.5 w-3.5 mr-1.5" /> बाहेर पडा (LOGOUT)
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border shadow-none bg-white rounded-2xl overflow-hidden border-muted-foreground/10">
          <CardHeader className="bg-primary/5 border-b py-3 px-4">
            <CardTitle className="text-[10px] font-black flex items-center gap-2 uppercase tracking-widest text-primary">
              <IdCard className="h-4 w-4" /> वैयक्तिक माहिती (Personal Info)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-5">
            <div className="space-y-1">
              <Label className="font-black text-[9px] uppercase text-muted-foreground tracking-widest ml-1">पूर्ण नाव</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11 bg-muted/20 border-none rounded-xl font-bold text-sm px-4" />
            </div>
            <div className="space-y-1">
              <Label className="font-black text-[9px] uppercase text-muted-foreground tracking-widest ml-1">अधिकारी आयडी (Emp ID)</Label>
              <Input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="h-11 bg-muted/20 border-none rounded-xl font-bold text-sm px-4" />
            </div>
            <div className="space-y-1">
              <Label className="font-black text-[9px] uppercase text-muted-foreground tracking-widest ml-1">ईमेल (कायमस्वरूपी)</Label>
              <Input value={user?.email || ""} readOnly className="h-11 bg-slate-50 border-none rounded-xl font-bold text-sm px-4 opacity-60 cursor-not-allowed" />
            </div>
            <Button onClick={handleSaveProfile} className="w-full gap-2 font-black h-11 shadow-lg shadow-primary/20 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95">
              <Save className="h-4 w-4" /> माहिती जतन करा
            </Button>
          </CardContent>
        </Card>

        <Card className="border shadow-none bg-white rounded-2xl overflow-hidden border-muted-foreground/10">
          <CardHeader className="bg-primary/5 border-b py-3 px-4">
            <CardTitle className="text-[10px] font-black flex items-center gap-2 uppercase tracking-widest text-primary">
              <ShieldCheck className="h-4 w-4" /> परवानगी पत्र (Auth Letter)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 flex flex-col items-center justify-center min-h-[250px]">
            {photo ? (
              <div className="relative w-full max-w-[180px] group">
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border-2 border-primary/20 shadow-lg bg-muted">
                  <Image src={photo} alt="Auth Letter" fill className="object-contain" unoptimized />
                </div>
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-md" onClick={() => setIsFullView(true)}><Maximize2 className="h-4 w-4" /></Button>
                  <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full shadow-md" onClick={handleDeletePhoto}><Trash2 className="h-4 w-4" /></Button>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsFullView(true)} className="w-full mt-4 h-10 text-[9px] font-black uppercase rounded-xl border-primary/20">मोठे करून पहा</Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="p-6 rounded-full bg-primary/5 border-2 border-dashed border-primary/20"><ImageIcon className="h-10 w-10 text-slate-300" /></div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-400">पत्र अपलोड करा</p>
                  <Button onClick={() => fileInputRef.current?.click()} size="sm" className="gap-2 font-black rounded-xl px-8 h-10 text-[9px] uppercase tracking-widest shadow-md">फोटो निवडा</Button>
                </div>
              </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
          </CardContent>
        </Card>
      </div>

      {isFullView && photo && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white h-12 w-12 rounded-full hover:bg-white/10" onClick={() => setIsFullView(false)}><X className="h-8 w-8" /></Button>
          <div className="relative w-full h-full max-w-4xl max-h-[90vh]">
            <Image src={photo} alt="Permission Full View" fill className="object-contain" unoptimized />
          </div>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mt-4">संकलन नोंदवही अधिकृत दस्तऐवज</p>
        </div>
      )}
    </div>
  )
}
