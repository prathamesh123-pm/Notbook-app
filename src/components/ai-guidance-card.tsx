"use client"

import { useState, useEffect } from "react"
import { Sparkles, RefreshCw, Lightbulb } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { generateGuidance } from "@/ai/flows/generate-guidance-flow"

interface AIGuidanceCardProps {
  context: string;
  formType: 'daily-report' | 'task' | 'breakdown' | 'center';
}

export function AIGuidanceCard({ context, formType }: AIGuidanceCardProps) {
  const [questions, setQuestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const fetchGuidance = async () => {
    setLoading(true)
    try {
      const result = await generateGuidance({ context, formType })
      setQuestions(result.questions)
    } catch (error) {
      console.error("AI Guidance failed", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (context.length > 5 || questions.length === 0) {
        fetchGuidance()
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [formType])

  if (questions.length === 0 && !loading) return null

  return (
    <Card className="border-none shadow-none bg-primary/5 rounded-xl overflow-hidden mt-4 border-l-4 border-l-primary">
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">AI मार्गदर्शक (AI GUIDANCE)</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-primary/50 hover:text-primary" 
            onClick={fetchGuidance}
            disabled={loading}
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <div className="space-y-2">
          {loading ? (
            <div className="space-y-2">
              <div className="h-3 w-3/4 bg-primary/10 animate-pulse rounded" />
              <div className="h-3 w-1/2 bg-primary/10 animate-pulse rounded" />
            </div>
          ) : (
            questions.map((q, i) => (
              <div key={i} className="flex items-start gap-2 group">
                <Lightbulb className="h-3 w-3 mt-0.5 text-amber-500 shrink-0" />
                <p className="text-[10px] font-bold text-slate-600 leading-tight group-hover:text-primary transition-colors italic">
                  {q}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
