
"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  FileText, Plus, Save, Printer, Download, Settings, 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, 
  Table as TableIcon, Image as ImageIcon, Undo, Redo,
  Eye, ZoomIn, ZoomOut, Maximize2, Shield, RefreshCw, X, Check, 
  Mail, Share2, Layers, Grid3X3, Link as LinkIcon, 
  Highlighter, Code, Sparkles, Box, FileSignature, Type as TypeIcon,
  Columns, Rows, Trash2, PlusCircle, Palette, FileBox, Layout as LayoutIcon,
  Search, Languages, ShieldCheck, Cpu, Terminal, Braces, Compass,
  MoveHorizontal, Scaling, FileType, StickyNote, ScanText, Ruler, RotateCcw
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking, useDoc, useMemoFirebase } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { useRouter, useSearchParams } from "next/navigation"

function EditorContent() {
  const { user } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const { toast } = useToast()

  const [mounted, setMounted] = useState(false)
  const [docTitle, setDocTitle] = useState("नवीन डॉक्युमेंट")
  const [zoom, setZoom] = useState(100)
  const editorRef = useRef<HTMLDivElement>(null)

  const reportRef = useMemoFirebase(() => {
    if (!db || !user || !editId) return null
    return doc(db, 'users', user.uid, 'dailyWorkReports', editId)
  }, [db, user, editId])

  const { data: existingReport, isLoading: isReportLoading } = useDoc(reportRef)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (existingReport && existingReport.fullData && existingReport.fullData.isWordDoc && editorRef.current) {
      setDocTitle(existingReport.fullData.title || "नवीन डॉक्युमेंट")
      editorRef.current.innerHTML = existingReport.fullData.content || ""
    }
  }, [existingReport])

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
  }

  const getParentTableInfo = () => {
    const selection = window.getSelection()
    if (!selection?.rangeCount) return { table: null, cell: null }
    let node: any = selection.getRangeAt(0).startContainer
    let cell = null
    let table = null

    while (node && node !== editorRef.current) {
      if (node.nodeName === 'TD' || node.nodeName === 'TH') cell = node
      if (node.nodeName === 'TABLE') {
        table = node
        break
      }
      node = node.parentNode
    }
    return { table, cell }
  }

  const handleInsertColumn = () => {
    const { table, cell } = getParentTableInfo()
    if (!table || !cell) {
      toast({ title: "त्रुटी", description: "प्रथम टेबलमधील सेल निवडा.", variant: "destructive" })
      return
    }
    const index = cell.cellIndex
    for (let i = 0; i < table.rows.length; i++) {
      const newCell = table.rows[i].insertCell(index + 1)
      newCell.innerHTML = '&nbsp;'
      newCell.style.border = '1px solid #ddd'
      newCell.style.padding = '4px'
      newCell.style.minWidth = '50px'
    }
    toast({ title: "यशस्वी", description: "कॉलम जोडला गेला." })
  }

  const handleRemoveColumn = () => {
    const { table, cell } = getParentTableInfo()
    if (!table || !cell) return
    const index = cell.cellIndex
    for (let i = 0; i < table.rows.length; i++) {
      table.rows[i].deleteCell(index)
    }
    if (table.rows[0]?.cells.length === 0) table.remove()
    toast({ title: "यशस्वी", description: "कॉलम काढला गेला." })
  }

  const handleInsertRow = () => {
    const { table, cell } = getParentTableInfo()
    if (!table || !cell) return
    const rowIndex = cell.parentNode.rowIndex
    const newRow = table.insertRow(rowIndex + 1)
    for (let i = 0; i < table.rows[0].cells.length; i++) {
      const newCell = newRow.insertCell(i)
      newCell.innerHTML = '&nbsp;'
      newCell.style.border = '1px solid #ddd'
      newCell.style.padding = '4px'
    }
    toast({ title: "यशस्वी", description: "ओळ जोडली गेली." })
  }

  const handleRemoveRow = () => {
    const { table, cell } = getParentTableInfo()
    if (!table || !cell) return
    const rowIndex = cell.parentNode.rowIndex
    table.deleteRow(rowIndex)
    if (table.rows.length === 0) table.remove()
    toast({ title: "यशस्वी", description: "ओळ काढला गेली." })
  }

  const handleSave = () => {
    if (!db || !user) {
      toast({ title: "त्रुटी", description: "लॉगिन आवश्यक आहे.", variant: "destructive" })
      return
    }
    const content = editorRef.current?.innerHTML
    
    const reportData = {
      type: 'Official Document',
      date: new Date().toISOString().split('T')[0],
      reportDate: new Date().toISOString().split('T')[0],
      generatedByUserId: user.uid,
      summary: `वर्ड दस्तऐवज: ${docTitle}`,
      overallSummary: `वर्ड दस्तऐवज: ${docTitle}`,
      fullData: { 
        title: docTitle, 
        content: content,
        isWordDoc: true,
        name: user.displayName || "सुपरवायझर"
      },
      updatedAt: new Date().toISOString()
    }

    if (editId) {
      const docRef = doc(db, 'users', user.uid, 'dailyWorkReports', editId)
      updateDocumentNonBlocking(docRef, reportData)
      toast({ title: "यशस्वी", description: "डॉक्युमेंट अहवाल अद्ययावत झाला." })
    } else {
      addDocumentNonBlocking(collection(db, 'users', user.uid, 'dailyWorkReports'), {
        ...reportData,
        createdAt: new Date().toISOString()
      })
      toast({ title: "यशस्वी", description: "डॉक्युमेंट अहवालात जतन झाले." })
    }
    router.push('/reports')
  }

  const handlePrint = () => window.print()

  if (!mounted || isReportLoading) return <div className="p-20 text-center italic font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  const RibbonGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex flex-col items-center border-r border-slate-200 px-1 last:border-0 h-full shrink-0">
      <div className="flex items-center gap-0.5 flex-1">{children}</div>
      <span className="text-[5px] font-black uppercase text-slate-400 mt-0.5 tracking-tighter">{label}</span>
    </div>
  )

  const ToolBtn = ({ icon: Icon, onClick, active = false, label, size = "sm" }: any) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-6 w-6 rounded-md transition-all ${active ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100'}`}
            onClick={onClick}
          >
            <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-[7px] font-black uppercase">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  const BigToolBtn = ({ icon: Icon, onClick, label, variant = "ghost" }: any) => (
    <Button 
      variant={variant} 
      className="h-10 w-9 flex flex-col items-center justify-center gap-0 p-0 hover:bg-slate-100 rounded-lg shrink-0"
      onClick={onClick}
    >
      <Icon className="h-3.5 w-3.5 text-slate-600" />
      <span className="text-[5px] font-black uppercase mt-0.5 leading-none">{label}</span>
    </Button>
  )

  const tabs = [
    { id: "file", label: "File" },
    { id: "home", label: "Home" },
    { id: "insert", label: "Insert" },
    { id: "design", label: "Design" },
    { id: "layout", label: "Layout" },
    { id: "view", label: "View" },
    { id: "review", label: "Review" },
    { id: "dev", label: "Dev" }
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-[900px] mx-auto w-full bg-slate-50 overflow-hidden rounded-xl border shadow-xl animate-in fade-in duration-500">
      <div className="h-6 bg-primary text-white flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-3 w-3" />
          <Input 
            value={docTitle} 
            onChange={(e) => setDocTitle(e.target.value)}
            className="h-4 bg-transparent border-none text-[10px] font-black uppercase text-white placeholder:text-white/50 w-32 focus-visible:ring-0 p-0 truncate"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[7px] font-black opacity-70 uppercase tracking-widest">Enterprise Edition</span>
          <Button variant="ghost" size="icon" className="h-4 w-4 text-white" onClick={() => router.push('/reports')}><X className="h-2.5 w-2.5" /></Button>
        </div>
      </div>

      <Tabs defaultValue="home" className="w-full shrink-0 bg-white border-b shadow-sm">
        <ScrollArea className="w-full bg-slate-100 border-b">
          <TabsList className="h-6 bg-transparent justify-start px-1 gap-0 overflow-visible">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="text-[7px] font-black uppercase h-full px-3 data-[state=active]:bg-white data-[state=active]:text-primary rounded-t-sm rounded-b-none border-x border-transparent data-[state=active]:border-slate-200"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>

        <div className="h-12 bg-white p-0.5">
          <div className="flex items-center gap-0.5 h-full px-1 min-w-max overflow-x-auto">
            <TabsContent value="file" className="m-0 h-full flex items-center gap-0.5">
              <RibbonGroup label="FILE">
                <BigToolBtn icon={Plus} label="NEW" onClick={() => { if(editorRef.current) editorRef.current.innerHTML = ""; setDocTitle("नवीन डॉक्युमेंट"); }} />
                <BigToolBtn icon={Save} label="SAVE" onClick={handleSave} />
                <BigToolBtn icon={Printer} label="PRINT" onClick={handlePrint} />
                <BigToolBtn icon={Download} label="EXPORT" />
              </RibbonGroup>
              <RibbonGroup label="SHARE">
                <BigToolBtn icon={Share2} label="SHARE" />
                <BigToolBtn icon={Mail} label="EMAIL" />
              </RibbonGroup>
            </TabsContent>

            <TabsContent value="home" className="m-0 h-full flex items-center gap-0.5">
              <RibbonGroup label="EDIT">
                <ToolBtn icon={Undo} label="Undo" onClick={() => execCommand('undo')} />
                <ToolBtn icon={Redo} label="Redo" onClick={() => execCommand('redo')} />
              </RibbonGroup>
              <RibbonGroup label="FONT">
                <select className="h-5 text-[8px] border rounded bg-slate-50 px-1 outline-none font-black" onChange={(e) => execCommand('fontName', e.target.value)}>
                  <option value="Inter">Inter</option>
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times</option>
                </select>
                <ToolBtn icon={Bold} label="Bold" onClick={() => execCommand('bold')} />
                <ToolBtn icon={Italic} label="Italic" onClick={() => execCommand('italic')} />
                <ToolBtn icon={Underline} label="Underline" onClick={() => execCommand('underline')} />
              </RibbonGroup>
              <RibbonGroup label="PARA">
                <ToolBtn icon={AlignLeft} label="Left" onClick={() => execCommand('justifyLeft')} />
                <ToolBtn icon={AlignCenter} label="Center" onClick={() => execCommand('justifyCenter')} />
                <ToolBtn icon={AlignRight} label="Right" onClick={() => execCommand('justifyRight')} />
                <ToolBtn icon={List} label="Bullets" onClick={() => execCommand('insertUnorderedList')} />
              </RibbonGroup>
            </TabsContent>

            <TabsContent value="insert" className="m-0 h-full flex items-center gap-0.5">
              <RibbonGroup label="OBJECTS">
                <BigToolBtn icon={Layers} label="PAGES" />
                <BigToolBtn icon={Grid3X3} label="TABLE" onClick={() => execCommand('insertHTML', '<table border="1" style="width:100%; border-collapse:collapse; margin:10px 0; border: 1px solid #ddd;"><tr><td style="padding:8px; border: 1px solid #ddd;">&nbsp;</td><td style="padding:8px; border: 1px solid #ddd;">&nbsp;</td></tr><tr><td style="padding:8px; border: 1px solid #ddd;">&nbsp;</td><td style="padding:8px; border: 1px solid #ddd;">&nbsp;</td></tr></table>')} />
              </RibbonGroup>
              <RibbonGroup label="TABLE TOOLS">
                <BigToolBtn icon={Columns} label="+ COL" onClick={handleInsertColumn} variant="outline" />
                <BigToolBtn icon={X} label="- COL" onClick={handleRemoveColumn} variant="outline" />
                <BigToolBtn icon={Rows} label="+ ROW" onClick={handleInsertRow} variant="outline" />
                <BigToolBtn icon={Trash2} label="- ROW" onClick={handleRemoveRow} variant="outline" />
              </RibbonGroup>
            </TabsContent>

            <TabsContent value="design" className="m-0 h-full flex items-center gap-0.5">
              <RibbonGroup label="THEMES">
                <BigToolBtn icon={Palette} label="THEMES" />
                <BigToolBtn icon={FileSignature} label="STYLE" />
              </RibbonGroup>
              <RibbonGroup label="PAGE BACKGROUND">
                <ToolBtn icon={LayoutIcon} label="WATERMARK" />
                <ToolBtn icon={Palette} label="COLOR" />
                <ToolBtn icon={Box} label="BORDERS" />
              </RibbonGroup>
            </TabsContent>

            <TabsContent value="layout" className="m-0 h-full flex items-center gap-0.5">
              <RibbonGroup label="PAGE SETUP">
                <BigToolBtn icon={Scaling} label="MARGINS" />
                <BigToolBtn icon={RotateCcw} label="ORIENT" />
                <BigToolBtn icon={Maximize2} label="SIZE" />
              </RibbonGroup>
              <RibbonGroup label="PARAGRAPH">
                <ToolBtn icon={MoveHorizontal} label="INDENT" />
                <ToolBtn icon={PlusCircle} label="SPACING" />
              </RibbonGroup>
            </TabsContent>

            <TabsContent value="view" className="m-0 h-full flex items-center gap-0.5">
              <RibbonGroup label="VIEWS">
                <BigToolBtn icon={Eye} label="READ" />
                <BigToolBtn icon={LayoutIcon} label="PRINT" variant="secondary" />
              </RibbonGroup>
              <RibbonGroup label="SHOW">
                <ToolBtn icon={Ruler} label="RULER" />
                <ToolBtn icon={Grid3X3} label="GRID" />
              </RibbonGroup>
              <RibbonGroup label="ZOOM">
                <BigToolBtn icon={ZoomIn} label="100%" onClick={() => setZoom(100)} />
                <BigToolBtn icon={Scaling} label="PAGE" />
              </RibbonGroup>
            </TabsContent>

            <TabsContent value="review" className="m-0 h-full flex items-center gap-0.5">
              <RibbonGroup label="PROOFING">
                <BigToolBtn icon={ScanText} label="SPELL" />
                <BigToolBtn icon={FileType} label="COUNT" />
              </RibbonGroup>
              <RibbonGroup label="LANGUAGE">
                <BigToolBtn icon={Languages} label="TRANS" />
              </RibbonGroup>
              <RibbonGroup label="PROTECT">
                <BigToolBtn icon={ShieldCheck} label="RESTRICT" />
              </RibbonGroup>
            </TabsContent>

            <TabsContent value="dev" className="m-0 h-full flex items-center gap-0.5">
              <RibbonGroup label="CODE">
                <BigToolBtn icon={Terminal} label="MACROS" />
                <BigToolBtn icon={Cpu} label="ADD-INS" />
              </RibbonGroup>
              <RibbonGroup label="CONTROLS">
                <ToolBtn icon={Box} label="CHECKBOX" />
                <ToolBtn icon={TypeIcon} label="TEXT" />
                <ToolBtn icon={PlusCircle} label="COMBO" />
              </RibbonGroup>
              <RibbonGroup label="XML">
                <BigToolBtn icon={Braces} label="MAPPING" />
              </RibbonGroup>
            </TabsContent>
          </div>
        </div>
      </Tabs>

      <ScrollArea className="flex-1 bg-slate-200 shadow-inner p-1 sm:p-4">
        <div 
          className="bg-white mx-auto shadow-2xl min-h-[1100px] p-6 sm:p-12 focus:outline-none transition-all duration-300 origin-top"
          style={{ 
            width: '100%',
            maxWidth: '210mm',
            transform: zoom !== 100 ? `scale(${zoom/100})` : 'none'
          }}
        >
          <div 
            ref={editorRef}
            contentEditable 
            suppressContentEditableWarning={true}
            className="w-full h-full min-h-[1000px] text-[12px] prose prose-sm max-w-none focus:outline-none font-body"
          >
            <p>येथे मजकूर लिहिण्यास सुरुवात करा...</p>
          </div>
        </div>
        <ScrollBar orientation="vertical" />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="h-4 bg-slate-100 border-t flex items-center justify-between px-3 text-[7px] font-black text-slate-500 uppercase shrink-0">
        <div className="flex items-center gap-3">
          <span className="bg-primary/10 text-primary px-1.5 rounded">PAGE 1 OF 1</span>
          <span className="flex items-center gap-1"><Check className="h-2 w-2 text-green-600" /> LIVE AUTOSAVE ENABLED</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="opacity-50">ZOOM</span>
          <input 
            type="range" 
            min="30" max="150" 
            value={zoom} 
            onChange={(e) => setZoom(Number(e.target.value))} 
            className="w-16 h-1 accent-primary cursor-pointer"
          />
          <span className="w-6">{zoom}%</span>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .shrink-0, tabs, header, nav, footer, .sidebar, .h-4 { display: none !important; }
          .flex-1 { background: white !important; padding: 0 !important; }
          .bg-white { box-shadow: none !important; border: none !important; width: 100% !important; margin: 0 !important; transform: none !important; }
        }
        [contenteditable]:empty:before {
          content: "येथे लिहा...";
          color: #cbd5e1;
          cursor: text;
        }
        table td {
          min-width: 50px;
          min-height: 20px;
        }
      `}</style>
    </div>
  )
}

export default function WordEditorPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center italic font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>}>
      <EditorContent />
    </Suspense>
  )
}
