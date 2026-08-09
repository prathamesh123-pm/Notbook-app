"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  FileEdit, ChevronRight, Sparkles, LayoutGrid
} from "lucide-react"
import Link from "next/link"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection } from "firebase/firestore"
import { FormDefinition } from "@/lib/types"

export default function FormsListPage() {
  const { user } = useUser()
  const db = useFirestore()
  const [mounted, setMounted] = useState(false)

  const formsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'formDefinitions')
  }, [db, user])

  const { data: forms, isLoading } = useCollection<FormDefinition>(formsQuery)

  useEffect(() => setMounted(true), [])

  if (!mounted || isLoading) return <div className="p-10 text-center italic font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full pb-10 px-2 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1 border-b pb-4 px-1">
        <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2 text-foreground uppercase tracking-tight">
          <FileEdit className="h-6 w-6 text-primary" /> फॉर्म निवडा (FORMS)
        </h2>
        <p className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em] ml-1">Select a form to enter data</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {forms && forms.length > 0 ? (
          forms.map((form) => (
            <Link key={form.id} href={`/forms/${form.id}`}>
              <Card className="border shadow-none hover:shadow-xl transition-all bg-white overflow-hidden group rounded-2xl cursor-pointer border-muted-foreground/10 hover:border-primary/20 h-full flex flex-col">
                <CardHeader className="p-5 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <LayoutGrid className="h-5 w-5" />
                    </div>
                    <Sparkles className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <CardTitle className="mt-4 font-black text-base uppercase tracking-tight text-slate-900 group-hover:text-primary">{form.title}</CardTitle>
                  <CardDescription className="text-[9px] font-bold uppercase text-muted-foreground mt-1">{form.fields.length} माहितीचे रकाने</CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0 mt-auto">
                  <div className="flex items-center justify-between text-primary font-black uppercase text-[9px] tracking-[0.2em] pt-4 border-t border-muted-foreground/5">
                    माहिती भरा (ENTER)
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-32 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center gap-4 opacity-30">
             <FileEdit className="h-12 w-12 text-slate-300" />
             <div className="space-y-1">
               <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">अजून कोणताही फॉर्म तयार केलेला नाही</h3>
               <p className="text-[9px] font-bold">फॉर्म बिल्डरमध्ये जाऊन नवीन फॉर्म तयार करा.</p>
             </div>
             <Button asChild variant="outline" className="h-9 text-[10px] font-black uppercase rounded-xl">
               <Link href="/form-builder">फॉर्म बिल्डर कडे जा</Link>
             </Button>
          </div>
        )}
      </div>
    </div>
  )
}
