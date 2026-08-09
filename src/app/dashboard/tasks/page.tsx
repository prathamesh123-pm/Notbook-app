
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Task, TaskStatus } from "@/lib/types"
import { Plus, Trash2, CheckCircle2, Clock, ListTodo, Search } from "lucide-react"

export default function WorkLogPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDesc, setNewTaskDesc] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<string>("all")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = JSON.parse(localStorage.getItem('procurepal_tasks') || '[]')
    setTasks(stored)
  }, [])

  const saveTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks)
    localStorage.setItem('procurepal_tasks', JSON.stringify(updatedTasks))
  }

  const addTask = () => {
    if (!newTaskTitle) return
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      description: newTaskDesc,
      assignedTo: "Procurement Manager",
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    saveTasks([newTask, ...tasks])
    setNewTaskTitle("")
    setNewTaskDesc("")
  }

  const updateStatus = (taskId: string, status: TaskStatus) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, status } : t)
    saveTasks(updated)
  }

  const deleteTask = (taskId: string) => {
    saveTasks(tasks.filter(t => t.id !== taskId))
  }

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    const matchesTab = activeTab === 'all' || t.status === activeTab
    return matchesSearch && matchesTab
  })

  if (!mounted) {
    return <div className="p-8 text-center text-muted-foreground italic">Loading work log...</div>
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground">Work Log</h2>
          <p className="text-muted-foreground mt-1">Manage and track your daily procurement duties.</p>
        </div>
        <Button onClick={() => document.getElementById('new-task-form')?.scrollIntoView({ behavior: 'smooth' })} className="gap-2">
          <Plus className="h-4 w-4" /> New Task
        </Button>
      </div>

      <Card id="new-task-form" className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Add New Work Item</CardTitle>
          <CardDescription>Create a specific task or observation for your log.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Work Item Title</Label>
              <Input 
                id="title" 
                placeholder="e.g. Monthly Collection Review" 
                value={newTaskTitle} 
                onChange={(e) => setNewTaskTitle(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Short Description (Optional)</Label>
              <Input 
                id="desc" 
                placeholder="Details..." 
                value={newTaskDesc} 
                onChange={(e) => setNewTaskDesc(e.target.value)} 
              />
            </div>
            <div className="md:col-span-3">
              <Button onClick={addTask} className="w-full gap-2">
                <Plus className="h-4 w-4" /> Save Task
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Done</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search tasks..." 
              className="pl-9" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value={activeTab} className="grid gap-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <Card key={task.id} className="border-none shadow-sm transition-all hover:shadow-md">
                <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full">
                    <div className={`p-2 rounded-full ${task.status === 'completed' ? 'bg-green-100' : 'bg-amber-100'}`}>
                      {task.status === 'completed' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Clock className="h-4 w-4 text-amber-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-base truncate">{task.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground/60">Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <Select 
                      value={task.status} 
                      onValueChange={(val: TaskStatus) => updateStatus(task.id, val)}
                    >
                      <SelectTrigger className="w-[130px] h-9">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Done</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 bg-card rounded-xl border border-dashed border-muted-foreground/30">
              <ListTodo className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <h3 className="text-lg font-medium text-muted-foreground">No tasks logged for today</h3>
              <p className="text-sm text-muted-foreground/60">Fill in the form above to start tracking your work.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
