
"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Archive, Search, X, Printer, Trash2, FileEdit, Truck, 
  MapPin, Calendar, AlertCircle, CheckCircle2, Info, FileCheck, Milk, User, TrendingDown, Layers, Filter, ShieldAlert, IndianRupee, Microscope, FileText, Download, RotateCcw, ChevronRight, ClipboardList, Settings, Droplets, Zap, ShieldCheck, ListPlus
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking, useDoc } from "@/firebase"
import { collection, doc, query, orderBy } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const ReportHeader = ({ title, date, subName, subId, shift }: any) => (
  <div className="w-full border-b-[3px] border-black pb-3 mb-4 text-center">
    <h1 className="text-[16pt] sm:text-[20pt] font-black uppercase tracking-tight text-slate-900 leading-tight mb-2">{title || "अधिकृत अहवाल"}</h1>
    <div className="flex flex-col sm:flex-row justify-between items-center text-[8pt] sm:text-[10pt] font-black uppercase text-slate-700 tracking-wider mt-2 border-t border-black/10 pt-2 gap-2">
      <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-left">
        <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {subName || "सुपरवायझर"} {subId && `(${subId})`}</span>
        {shift && <Badge variant="outline" className="h-5 text-[8px] border-black font-black py-0 px-2 uppercase">{shift}</Badge>}
      </div>
      <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {date}</span>
    </div>
  </div>
)

const SectionTitle = ({ icon: Icon, title, color = "text-primary" }: any) => (
  <div className={cn("flex items-center gap-2 border-b-2 border-black/10 pb-1 mb-2 mt-4 print:mt-6", "break-after-avoid")}>
    {Icon && <Icon className={cn("h-4 w-4", color)} />}
    <h3 className={cn("text-[9pt] font-black uppercase tracking-widest", color)}>{title}</h3>
  </div>
)

const ProfessionalParagraph = ({ label, content, icon: Icon }: { label: string, content: string, icon?: any }) => {
  if (!content) return null;
  return (
    <div className="mb-4 text-left w-full break-inside-avoid">
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        <span className="text-[8pt] font-black uppercase text-primary tracking-widest">{label}</span>
      </div>
      <div className="p-3 bg-slate-50 border-l-4 border-primary rounded-r-lg shadow-sm print:shadow-none print:border-slate-400">
        <p className="text-[9pt] sm:text-[11pt] font-medium leading-relaxed text-slate-800 whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  )
}

const TableRenderer = ({ title, data, columns, color = "text-primary" }: any) => {
  if (!data || data.length === 0) return null;
  return (
    <div className="mb-5 w-full break-inside-avoid">
      <h4 className={cn("text-[9pt] font-black uppercase tracking-widest mb-1.5", color)}>{title}</h4>
      <div className="border-[1.5px] border-black overflow-hidden rounded-sm w-full">
        <ScrollArea className="w-full">
          <table className="w-full border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-black h-8">
                {columns.map((col: any) => (
                  <th key={col.key} className={cn("p-1.5 text-[8pt] font-black border-r border-black last:border-0 uppercase text-center whitespace-nowrap", col.className)}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row: any, idx: number) => (
                <tr key={idx} className="border-b border-black last:border-0 h-8 hover:bg-slate-50">
                  {columns.map((col: any) => (
                    <td key={col.key} className={cn("p-1.5 text-[9pt] font-bold border-r border-black last:border-0 whitespace-nowrap text-center", col.cellClassName)}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const { user } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()

  const reportsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, 'users', user.uid, 'dailyWorkReports'), orderBy('createdAt', 'desc'))
  }, [db, user])

  const { data: reports, isLoading } = useCollection(reportsQuery)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [mounted, setMounted] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, 'users', user.uid)
  }, [db, user])
  
  const { data: profile } = useDoc(profileRef)

  useEffect(() => setMounted(true), [])

  const deleteReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!db || !user) return
    if (confirm("हटवायचे आहे का?")) {
      deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'dailyWorkReports', id))
      if (selectedReport?.id === id) setSelectedReport(null)
      toast({ title: "यशस्वी", description: "अहवाल हटवण्यात आला." })
    }
  }

  const editReport = (report: any, e: React.MouseEvent) => {
    e.stopPropagation()
    const routesMap: Record<string, string> = {
      'Route Visit': '/daily-report',
      'Daily Office Work': '/daily-report',
      'Field Visit': '/daily-report',
      'Transport Breakdown Report': '/reports/entry/breakdown',
      'Daily Work Report': '/reports/entry/daily',
      'FSSAI Center Inspection': '/reports/entry/fssai',
      'Milk Procurement Survey': '/reports/entry/survey',
      'Collection Center Audit': '/reports/entry/audit',
      'Chilling Report': '/reports/entry/chilling',
      'Seizure & Penalty': '/reports/entry/seizure',
      'Official Document': '/form-builder',
      'Route Allocation Report': '/reports/entry/route-allocation',
      'Custom Form': `/forms/${report.formId}`
    }
    const path = routesMap[report.type]
    if (path) router.push(`${path}?edit=${report.id}`)
  }

  const reportTypes = useMemo(() => {
    if (!reports) return []
    return Array.from(new Set(reports.map(r => r.type))).filter(Boolean).sort()
  }, [reports])

  const filteredReports = useMemo(() => {
    const list = reports || []
    return list.filter(r => {
      const matchesSearch = 
        r.type?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.fullData?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || r.type === typeFilter;
      let matchesDate = true;
      if (fromDate) matchesDate = matchesDate && r.date >= fromDate;
      if (toDate) matchesDate = matchesDate && r.date <= toDate;
      return matchesSearch && matchesType && matchesDate;
    })
  }, [reports, searchQuery, typeFilter, fromDate, toDate])

  const handleExportCSV = () => {
    if (!filteredReports.length) return;
    const headers = ["तारीख", "प्रकार", "सादरकर्ता", "सारांश"];
    const rows = filteredReports.map(r => [r.date, r.type, r.fullData?.name || "सुपरवायझर", r.summary.replace(/,/g, " ")]);
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `reports_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  }

  if (!mounted || isLoading) return <div className="p-20 text-center font-black uppercase text-[10px] opacity-50 animate-pulse">लोड होत आहे...</div>

  const labelMap: Record<string, string> = {
    // Primary Info
    name: "नाव / सादरकर्ता",
    supplierId: "सप्लायर आयडी",
    centerName: "केंद्र नाव",
    centerCode: "केंद्र कोड",
    ownerName: "मालक नाव",
    mobile: "मोबाईल नंबर",
    address: "पत्ता",
    village: "गाव",
    district: "जिल्हा",
    taluka: "तालुका",
    operatorName: "ऑपरेटर नाव",
    foundation_year: "स्थापना वर्ष",
    
    // Milk Metrics
    cowQty: "गाय दूध (L)",
    cowFat: "गाय फॅट (%)",
    cowSnf: "गाय SNF (%)",
    bufQty: "म्हेस दूध (L)",
    bufFat: "म्हेस फॅट (%)",
    bufSnf: "म्हेस SNF (%)",
    totalMilk: "एकूण दूध (L)",
    morningQty: "सकाळ दूध (L)",
    eveningQty: "सायंकाळ दूध (L)",
    fat: "फॅट प्रमाण (%)",
    snf: "SNF प्रमाण (%)",
    tempAtArrival: "सुरुवातीचे तापमान (°C)",
    tempAfterChilling: "चिलिंग तापमान (°C)",
    
    // Infrastructure & Technical
    scaleBrand: "काटा ब्रँड",
    fatMachineBrand: "मशीन ब्रँड",
    chemicalsStock: "केमिकल स्टॉक",
    batteryCondition: "बॅटरी स्थिती",
    milkCansCount: "मिल्क कॅन संख्या",
    iceBlocks: "बर्फ लाद्या संख्या",
    computerAvailable: "POP / कॉम्प्युटर",
    upsInverterAvailable: "UPS / इनव्हर्टर",
    solarAvailable: "सोलर सिस्टम",
    adulterationKitInfo: "भेसळ तपासणी कीट",
    fssaiNumber: "FSSAI क्र.",
    fssaiNo: "FSSAI क्र.",
    fssaiExpiry: "FSSAI मुदत",
    validDate: "मुदत तारीख",
    licenseStatus: "परवाना स्थिती",
    waterSource: "पाणी स्रोत",
    waterSupply: "पाणी पुरवठा",
    powerBackup: "पॉवर बॅकअप",
    hygieneGrade: "स्वच्छता ग्रेड",
    hygieneStandard: "स्वच्छता दर्जा",
    staffUniform: "स्टाफ युनिफॉर्म",
    fssaiDisplay: "FSSAI डिस्प्ले",
    iceBankStatus: "IBT स्थिती",
    
    // Logistics & Breakdown
    vehicleNo: "गाडी नंबर",
    vehicleType: "वाहन प्रकार",
    driverName: "ड्रायव्हर नाव",
    routeName: "रूट नाव",
    breakdownTime: "बिघाड वेळ",
    location: "ठिकाण",
    reason: "कारण / समस्या",
    severity: "बिघाड स्वरूप",
    estimatedRepairCost: "दुरुस्ती खर्च (₹)",
    estimatedRepairTime: "दुरुस्ती वेळ (तास)",
    recoveryVehicleNo: "पर्यायी गाडी",
    recoveryArrivalTime: "पोहोच वेळ",
    milkHot: "दूध गरम झाले का?",
    milkSour: "दूध खराब झाले का?",
    
    // Daily Work / Report
    reportHeading: "अहवाल शीर्षक",
    shift: "शिफ्ट",
    slipNo: "स्लिप नंबर",
    vehicleNumber: "वाहन नंबर",
    routeOutTime: "जाण्याची वेळ",
    routeInTime: "येण्याची वेळ",
    totalKm: "एकूण किमी",
    visitPerson: "कोणाची भेट",
    visitPurpose: "भेटीचा उद्देश",
    officeTaskSubject: "कामाचा विषय",
    achievements: "आजची कामगिरी",
    problems: "समस्या",
    actionsTaken: "केलेली कार्यवाही",
    dailyProblems: "महत्त्वाचे प्रॉब्लेम्स",
    
    // Survey Stats
    total_producers: "एकूण उत्पादक",
    active_producers: "सक्रिय उत्पादक",
    total_animals: "एकूण जनावरे",
    cows: "गाई संख्या",
    buffalo: "म्हशी संख्या",
    calves: "वासरे संख्या",
    morning_collection_time: "सकाळ संकलन वेळ",
    evening_collection_time: "सायंकाळ संकलन वेळ",
    type: "केंद्राचा प्रकार",
    facility: "उपलब्ध सुविधा",
    
    // Seizure
    seizureQty: "जप्त दूध (L)",
    fineAmount: "दंड रक्कम (₹)",
    actionTaken: "केलेली कारवाई"
  }

  const renderGenericData = (data: any) => {
    if (!data) return null;
    const entries = Object.entries(data).filter(([key, val]) => {
      return typeof val !== 'object' && 
             !['reportHeading', 'name', 'idNumber', 'repId', 'isWordDoc', 'content', 'title', 'id', 'date', 'reportDate', 'generatedByUserId', 'createdAt', 'updatedAt', 'linkedReportId', 'reportType', 'formTitle', 'formId'].includes(key) && 
             val !== "" && val !== null;
    });

    if (entries.length === 0) return null;

    return (
      <div className="w-full border-2 border-black mb-6 overflow-hidden rounded-sm break-inside-avoid">
        <ScrollArea className="w-full">
          <table className="w-full text-[9pt] min-w-[300px]">
            <tbody>
              {entries.map(([key, val]) => (
                <tr key={key} className="border-b border-black last:border-0 h-10 hover:bg-slate-50">
                  <td className="p-2 bg-slate-50 font-black border-r border-black w-1/3 uppercase tracking-tighter">{labelMap[key] || key.toUpperCase()}</td>
                  <td className="p-2 font-bold uppercase">{String(val === true ? 'हो (YES)' : val === false ? 'नाही (NO)' : val)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10 px-1 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-3 no-print">
        <div>
          <h2 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Archive className="h-6 w-6 text-primary" /> अहवाल संग्रहालय (ARCHIVE)
          </h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Centralized Records Management</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="h-10 rounded-xl font-black uppercase text-[10px] border-2 border-black gap-2 shadow-sm hover:bg-slate-100">
            <Download className="h-4 w-4" /> EXCEL EXPORT
          </Button>
          <div className="bg-primary/10 px-4 py-2 rounded-xl text-primary font-black text-[11px] border-2 border-primary/20 uppercase shadow-inner">
            एकूण: {reports?.length || 0}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Filters & List Sidebar */}
        <div className="lg:col-span-4 space-y-3 no-print">
          <Card className="border-2 border-black rounded-2xl overflow-hidden bg-white shadow-xl">
            <div className="p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="शोधा (नाव/कोड)..." className="pl-10 h-10 border-2 border-black rounded-xl font-bold uppercase text-[11px]" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-10 border-2 border-black rounded-xl font-black uppercase text-[10px]"><SelectValue placeholder="सर्व अहवाल" /></SelectTrigger>
                  <SelectContent>{['all', ...reportTypes].map(t => <SelectItem key={t} value={t} className="font-black text-[10px] uppercase">{t === 'all' ? 'सर्व अहवाल' : t}</SelectItem>)}</SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input type="date" className="h-10 border-2 border-black rounded-xl font-black text-[10px] p-2 flex-1" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                  <Input type="date" className="h-10 border-2 border-black rounded-xl font-black text-[10px] p-2 flex-1" value={toDate} onChange={e => setToDate(e.target.value)} />
                  <Button variant="ghost" size="icon" className="h-10 w-10 border-2 border-black rounded-xl text-rose-500 hover:bg-rose-50" onClick={() => { setSearchQuery(""); setTypeFilter("all"); setFromDate(""); setToDate(""); }}><RotateCcw className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-2xl">
            <ScrollArea className="h-[450px] lg:h-[700px] w-full">
              <Table>
                <TableHeader className="bg-slate-100 sticky top-0 z-10 border-b-2 border-black">
                  <TableRow className="h-10">
                    <TableHead className="font-black text-[9px] uppercase p-3 text-slate-600">तारीख & प्रकार</TableHead>
                    <TableHead className="font-black text-[9px] uppercase p-3 text-slate-600">सारांश</TableHead>
                    <TableHead className="w-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((r) => (
                    <TableRow key={r.id} className={cn("cursor-pointer hover:bg-primary/5 transition-all border-b border-black/5 last:border-0", selectedReport?.id === r.id ? "bg-primary/5" : "bg-white")} onClick={() => setSelectedReport(r)}>
                      <TableCell className="p-3 align-top">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black">{r.date}</span>
                          <Badge variant="outline" className="h-4 px-1.5 text-[7px] font-black uppercase border-primary/30 text-primary w-fit truncate max-w-[80px] bg-primary/5">{r.type}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="p-3 align-top">
                        <h4 className="font-black text-[11px] uppercase truncate text-slate-900 leading-tight mb-1">{r.summary || "No Title"}</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase truncate">सादरकर्ता: {r.fullData?.name || "सुपरवायझर"}</p>
                      </TableCell>
                      <TableCell className="p-3 align-middle text-right">
                        <ChevronRight className={cn("h-4 w-4 text-slate-300 transition-transform", selectedReport?.id === r.id ? "rotate-90 text-primary" : "")} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {!filteredReports.length && <TableRow><TableCell colSpan={3} className="p-20 text-center opacity-30 italic font-black uppercase text-[11px]">नाही सापडले</TableCell></TableRow>}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>

        {/* Detail Report Viewer */}
        <Card className="lg:col-span-8 border-2 border-black shadow-2xl bg-white rounded-3xl overflow-hidden min-h-[600px] flex flex-col">
          {selectedReport ? (
            <div className="flex flex-col h-full">
               <div className="p-3 px-5 border-b-2 border-black bg-muted/5 flex justify-between items-center no-print">
                 <div className="flex gap-3 items-center">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedReport(null)} className="h-10 w-10 text-slate-400 hover:bg-slate-200 rounded-full lg:hidden"><X className="h-6 w-6" /></Button>
                    <Badge className="bg-primary/20 text-primary border-none uppercase text-[10px] font-black px-3 py-1">{selectedReport.type}</Badge>
                 </div>
                 <div className="flex gap-2">
                   <Button variant="outline" size="sm" className="h-10 rounded-xl font-black uppercase text-[10px] border-2 border-black gap-2 hover:bg-slate-100" onClick={() => window.print()}><Printer className="h-4 w-4" /> प्रिंट (PRINT)</Button>
                   <Button variant="outline" size="sm" className="h-10 rounded-xl font-black uppercase text-[10px] border-2 border-black text-primary hover:bg-primary/5" onClick={(e) => editReport(selectedReport, e)}><FileEdit className="h-4 w-4" /> बदल (EDIT)</Button>
                   <Button variant="outline" size="sm" className="h-10 rounded-xl font-black uppercase text-[10px] border-2 border-black text-rose-600 hover:bg-rose-50" onClick={(e) => deleteReport(selectedReport.id, e)}><Trash2 className="h-4 w-4" /> हटवा</Button>
                 </div>
               </div>
               
               <ScrollArea className="flex-1 bg-slate-200 shadow-inner">
                  <div className="bg-white p-4 sm:p-12 printable-report w-full max-w-[210mm] mx-auto min-h-[297mm] shadow-2xl print:shadow-none my-4 print:my-0">
                    <ScrollArea className="w-full">
                        <div className="flex flex-col items-center">
                          <ReportHeader 
                            title={selectedReport.fullData?.reportHeading || selectedReport.fullData?.formTitle || selectedReport.summary} 
                            date={selectedReport.date} 
                            subName={selectedReport.fullData?.name || profile?.displayName || "सुपरवायझर"} 
                            subId={selectedReport.fullData?.idNumber || selectedReport.fullData?.repId || profile?.employeeId} 
                            shift={selectedReport.fullData?.shift} 
                          />
                          
                          <SectionTitle icon={ClipboardList} title="अहवाल तपशील (REPORT DATA)" />
                          {renderGenericData(selectedReport.fullData)}

                          {selectedReport.type === 'Custom Form' && selectedReport.fullData?.dynamicFields && (
                            <div className="w-full border-2 border-black mb-6 overflow-hidden rounded-sm break-inside-avoid">
                                <table className="w-full text-[9pt]">
                                    <tbody>
                                        {selectedReport.fullData.dynamicFields.map((field: any, idx: number) => (
                                            <tr key={idx} className="border-b border-black last:border-0 h-10 hover:bg-slate-50">
                                                <td className="p-2 bg-slate-50 font-black border-r border-black w-1/3 uppercase tracking-tighter">{field.label}</td>
                                                <td className="p-2 font-bold uppercase">{String(field.value)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                          )}

                          {selectedReport.type === 'Official Document' && (
                            <div className="w-full py-4 text-left font-body leading-relaxed prose prose-sm max-w-none text-[10pt] border-t-2 border-black/5 mt-4" dangerouslySetInnerHTML={{ __html: selectedReport.fullData?.content || "" }} />
                          )}

                          {selectedReport.type === 'Route Allocation Report' && (
                            <div className="space-y-6 pt-4 w-full">
                              {['morningRoutes', 'eveningRoutes', 'tankerRoutes', 'extCanRoutes', 'extTankerRoutes'].map(k => (
                                <TableRenderer key={k} title={k.replace(/([A-Z])/g, ' $1').toUpperCase()} data={selectedReport.fullData?.[k]} columns={[{ key: 'routeId', label: 'ID', className: 'w-12' }, { key: 'routeCode', label: 'Code', className: 'w-16' }, { key: 'routeName', label: 'Route Name', className: 'text-left px-4' }, { key: 'requested', label: 'Req', render: (v: any) => v ? '✓' : '-', className: 'w-10' }, { key: 'allocated', label: 'Alloc', render: (v: any) => v ? '✓' : '-', className: 'w-10' }]} />
                              ))}
                            </div>
                          )}

                          {selectedReport.type === 'Transport Breakdown Report' && (
                            <TableRenderer title="नुकसान तपशील (LOSS LOG)" color="text-rose-700" data={selectedReport.fullData?.centerLosses} columns={[{ key: 'centerCode', label: 'कोड', className: 'w-14' }, { key: 'centerName', label: 'केंद्र/गवळी नाव', className: 'text-left px-4' }, { key: 'milkType', label: 'प्रकार', className: 'w-14' }, { key: 'qtyLiters', label: 'दूध (L)', className: 'w-16' }, { key: 'lossAmount', label: 'नुकसान (₹)', className: 'w-20 text-right pr-4', cellClassName: 'font-black text-rose-600' }]} />
                          )}

                          {selectedReport.fullData?.routeVisitLogs && (
                            <TableRenderer title="रूट व्हिजिट लॉग (VISIT LOGS)" data={selectedReport.fullData.routeVisitLogs} columns={[{ key: 'centerCode', label: 'कोड', className: 'w-14' }, { key: 'supplierName', label: 'केंद्राचे नाव', className: 'text-left px-4' }, { key: 'arrivalTime', label: 'पोहोच', className: 'w-16' }, { key: 'departureTime', label: 'सुटका', className: 'w-16' }, { key: 'fullCans', label: 'F-Cans', className: 'w-14' }, { key: 'iceUsed', label: 'बर्फ', className: 'w-16' }]} />
                          )}

                          {selectedReport.fullData?.sub_gavali_info && selectedReport.fullData.sub_gavali_info.length > 0 && (
                            <TableRenderer title="सब-गवळी माहिती (SUB-GAVALI)" data={selectedReport.fullData.sub_gavali_info} columns={[{ key: 'name', label: 'नाव', className: 'text-left px-4' }, { key: 'mobile', label: 'मोबाईल' }, { key: 'cow_qty', label: 'गाय (L)' }, { key: 'buf_qty', label: 'म्हेस (L)' }, { key: 'producers', label: 'उत्पादक' }]} />
                          )}

                          <div className="w-full pt-4 space-y-4">
                            <ProfessionalParagraph icon={AlertCircle} label="महत्त्वाचे प्रॉब्लेम्स / निरीक्षणे" content={selectedReport.fullData?.dailyProblems || selectedReport.fullData?.problems || selectedReport.fullData?.detailedRemarks} />
                            <ProfessionalParagraph icon={CheckCircle2} label="केलेली कार्यवाही / निष्कर्ष" content={selectedReport.fullData?.actionTaken || selectedReport.fullData?.actionsTaken || selectedReport.fullData?.efforts_taken || selectedReport.fullData?.observations} />
                            
                            {selectedReport.fullData?.remarkPoints && (
                              <div className="mt-4 break-inside-avoid">
                                <h4 className="text-[9pt] font-black uppercase text-primary mb-2 flex items-center gap-1.5"><ListPlus className="h-4 w-4" /> अतिरिक्त मुद्दे</h4>
                                <ul className="space-y-1 list-disc list-inside bg-slate-50 p-4 rounded-xl border border-black/5">
                                  {selectedReport.fullData.remarkPoints.map((p: string, i: number) => (
                                    <li key={i} className="text-[10pt] font-bold text-slate-700">{p}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          <div className="w-full mt-auto pt-24 grid grid-cols-2 gap-20 text-center uppercase font-black text-[10pt] tracking-widest border-t-2 border-black">
                            <div className="pt-2 border-t-2 border-black/20">प्राधिकृत स्वाक्षरी</div>
                            <div className="pt-2 border-t-2 border-black/20">अधिकारी शिक्का</div>
                          </div>
                        </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </div>
                  <ScrollBar orientation="vertical" />
               </ScrollArea>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-10 p-20 text-center uppercase">
              <Archive className="h-20 w-20 mb-4" />
              <h4 className="font-black tracking-[0.4em] text-sm">अहवाल निवडा</h4>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
