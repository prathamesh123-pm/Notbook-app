
"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldCheck, Upload, Trash2, Maximize2, X, Image as ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function PermissionsPage() {
  const [photo, setPhoto] = useState<string | null>(null)
  const [isFullView, setIsFullView] = useState(false)
  const [mounted, setMounted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    const storedPhoto = localStorage.getItem('procurenote_permission_photo')
    if (storedPhoto) {
      setPhoto(storedPhoto)
    }
  }, [])

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB Limit
        toast({
          title: "मोठी फाईल",
          description: "कृपया ५ एमबी पेक्षा कमी आकाराचा फोटो निवडा.",
          variant: "destructive"
        })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setPhoto(base64String)
        localStorage.setItem('procurenote_permission_photo', base64String)
        toast({
          title: "फोटो जतन केला",
          description: "तुमचे परवानगी पत्र यशस्वीरित्या अपलोड झाले आहे."
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDeletePhoto = () => {
    if (confirm("तुम्हाला हा फोटो हटवायचा आहे का?")) {
      setPhoto(null)
      localStorage.removeItem('procurenote_permission_photo')
      toast({
        title: "फोटो हटवला",
        description: "परवानगी पत्राचा फोटो काढून टाकला आहे."
      })
    }
  }

  if (!mounted) return null

  return (
    <div className="space-y-8 max-w-4xl mx-auto w-full pb-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-headline font-bold text-foreground tracking-tight flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" /> 
          Authorization & Permissions
        </h2>
        <p className="text-muted-foreground font-medium">येथे तुमचे परवानगी पत्र (Auth Letter) जतन करा जेणेकरून तुम्ही ते कोणालाही दाखवू शकाल.</p>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" /> परवानगी पत्राचा फोटो (Permission Letter Photo)
          </CardTitle>
          <CardDescription>
            तुमच्या अधिकृत कामासाठी लागणारे परवानगी पत्र येथे अपलोड करा.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px]">
          {photo ? (
            <div className="relative w-full max-w-md group">
              <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border-2 border-primary/20 shadow-lg">
                <Image 
                  src={photo} 
                  alt="Permission Letter" 
                  fill 
                  className="object-contain bg-muted"
                  unoptimized
                />
              </div>
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="h-9 w-9 rounded-full shadow-md"
                  onClick={() => setIsFullView(true)}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="destructive" 
                  className="h-9 w-9 rounded-full shadow-md"
                  onClick={handleDeletePhoto}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-6 flex justify-center">
                <Button onClick={() => setIsFullView(true)} className="gap-2 font-bold px-8">
                  <Maximize2 className="h-4 w-4" /> पूर्ण स्क्रीनवर पहा (Full View)
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 text-center py-10">
              <div className="p-8 rounded-full bg-primary/5 border-2 border-dashed border-primary/20">
                <Upload className="h-12 w-12 text-muted-foreground/40" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg">कोणताही फोटो अपलोड केलेला नाही</h3>
                <p className="text-sm text-muted-foreground max-w-xs">कृपया तुमच्या परवानगी पत्राचा स्पष्ट फोटो निवडा.</p>
              </div>
              <Button onClick={() => fileInputRef.current?.click()} className="gap-2 font-bold px-8">
                <Upload className="h-4 w-4" /> फोटो निवडा (Upload Photo)
              </Button>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handlePhotoUpload} 
          />
        </CardContent>
      </Card>

      {/* Full Screen View Modal */}
      {isFullView && photo && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 text-white hover:bg-white/10 h-12 w-12 rounded-full"
            onClick={() => setIsFullView(false)}
          >
            <X className="h-8 w-8" />
          </Button>
          <div className="relative w-full h-full max-w-4xl max-h-[90vh]">
            <Image 
              src={photo} 
              alt="Permission Full View" 
              fill 
              className="object-contain"
              unoptimized
            />
          </div>
          <p className="mt-4 text-white/60 font-bold text-xs uppercase tracking-widest">परवानगी पत्र - संकलन नोंदवही</p>
        </div>
      )}
    </div>
  )
}
