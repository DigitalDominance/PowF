"use client"

import React, { useState, useEffect } from "react"
import { ethers } from "ethers"
import { toast } from "sonner"
import { motion } from "framer-motion"
import {
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui"
import {
  ArrowRight,
  Plus,
  Check,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Balancer } from "react-wrap-balancer"
import PROOF_OF_WORK_JOB_ABI from "@/lib/contracts/ProofOfWorkJob.json"

const API = process.env.NEXT_PUBLIC_API_URL || ""

const fadeIn = (delay = 0, duration = 0.5) => ({
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { delay, duration, ease: "easeOut" } },
})
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }

export default function TaskPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const perPage = 6

  const [form, setForm] = useState({ name: "", desc: "", tags: "", pay: "" })
  const [loadingCreate, setLoadingCreate] = useState(false)
  const [loadingOfferId, setLoadingOfferId] = useState<string | null>(null)
  const [loadingRespId, setLoadingRespId] = useState<string | null>(null)

  // fetch tasks
  const load = async () => {
    try {
      const res = await fetch(`${API}/api/tasks?page=${page}&limit=${perPage}`)
      const data = await res.json()
      setTasks(data.tasks || data)
    } catch (e: any) {
      toast.error(e.message)
    }
  }
  useEffect(() => { load() }, [page])

  const onChange = (k: keyof typeof form, v: string) =>
    setForm(f => ({ ...f, [k]: v }))

  // create task
  const createTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingCreate(true)
    try {
      const payload = {
        taskName: form.name,
        taskDescription: form.desc,
        taskTags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        payAmount: form.pay,
      }
      await fetch(`${API}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      }).then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      toast.success("Task posted")
      setForm({ name: "", desc: "", tags: "", pay: "" })
      load()
    } catch (e: any) {
      toast.error(e.message || "Failed")
    }
    setLoadingCreate(false)
  }

  // send on-chain offer + record in DB
  const sendOffer = async (taskId: string, pay: string) => {
    setLoadingOfferId(taskId)
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const factory = new ethers.Contract(
        process.env.NEXT_PUBLIC_JOBFACTORY_ADDRESS!,
        PROOF_OF_WORK_JOB_ABI,
        signer
      )
      const wei = ethers.parseEther(pay)
      const tx = await factory.createJobFromTask(taskId, { value: wei })
      toast.info("Submitting tx…")
      await tx.wait()
      await fetch(`${API}/api/tasks/${taskId}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }).then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      toast.success("Offer sent")
      load()
    } catch (e: any) {
      toast.error(e.message || "Error")
    }
    setLoadingOfferId(null)
  }

  // accept/decline
  const respond = async (offerId: string, accept: boolean) => {
    setLoadingRespId(offerId)
    try {
      await fetch(`${API}/api/offers/${offerId}/${accept ? "accept" : "decline"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }).then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      toast.success(accept ? "Accepted" : "Declined")
      load()
    } catch (e: any) {
      toast.error(e.message || "Error")
    }
    setLoadingRespId(null)
  }

  return (
    <div className="flex flex-col items-center px-4 md:px-6 lg:px-8">
      {/* Hero */}
      <motion.div
        className="text-center py-12"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <motion.h1 variants={fadeIn(0.1)} className="text-4xl font-bold">
          <Balancer>Tasks & Offers</Balancer>
        </motion.h1>
        <motion.p variants={fadeIn(0.2)} className="mt-4 text-muted-foreground max-w-xl mx-auto">
          <Balancer>
            Workers post tasks with KAS pay. Employers send offers on-chain here. Accept or decline in one place.
          </Balancer>
        </motion.p>
      </motion.div>

      {/* Create */}
      <motion.section
        className="w-full max-w-lg bg-background p-6 rounded-2xl shadow-lg mb-12"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <motion.h2 variants={fadeIn(0.1)} className="text-2xl font-semibold mb-4">
          Create Task
        </motion.h2>
        <form onSubmit={createTask} className="space-y-4">
          <div>
            <Label>Task Name</Label>
            <Input
              value={form.name}
              onChange={e => onChange("name", e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={form.desc}
              onChange={e => onChange("desc", e.target.value)}
              rows={3}
              required
            />
          </div>
          <div>
            <Label>Tags</Label>
            <Input
              placeholder="a,b,c"
              value={form.tags}
              onChange={e => onChange("tags", e.target.value)}
            />
          </div>
          <div>
            <Label>Pay (KAS)</Label>
            <Input
              type="number"
              step="0.01"
              value={form.pay}
              onChange={e => onChange("pay", e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loadingCreate}>
            {loadingCreate
              ? <><Loader2 className="animate-spin mr-2"/> Posting…</>
              : <><Plus className="mr-2"/> Post Task</>
            }
          </Button>
        </form>
      </motion.section>

      {/* Listings */}
      <motion.section
        className="w-full"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <motion.h2 variants={fadeIn(0.1)} className="text-2xl font-semibold mb-6">
          Available Tasks
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((t, i) => (
            <motion.div key={t._id} variants={fadeIn(i * 0.1)}>
              <div className="bg-background rounded-2xl p-4 shadow hover:shadow-md transition">
                <h3 className="text-lg font-semibold">{t.taskName}</h3>
                <p className="text-sm mt-2">{t.taskDescription}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {t.taskTags.map((tag: string) => <Badge key={tag}>{tag}</Badge>)}
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="font-medium">{t.payAmount} KAS</span>
                  <Button
                    size="sm"
                    disabled={loadingOfferId === t._id}
                    onClick={() => sendOffer(t._id, t.payAmount)}
                  >
                    {loadingOfferId === t._id
                      ? <Loader2 className="animate-spin mr-1"/>
                      : <ArrowRight className="mr-1"/>
                    }
                    Offer
                  </Button>
                </div>
                {t.offers?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Offers</h4>
                    <div className="space-y-2">
                      {t.offers.map((o: any) => (
                        <div
                          key={o._id}
                          className="flex justify-between items-center bg-muted/10 p-2 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar size={24}>
                              <AvatarImage src={`https://effigy.im/a/${o.employerAddress}.svg`} />
                              <AvatarFallback>{o.employerAddress.slice(2,6)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{o.employerAddress}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              disabled={loadingRespId === o._id}
                              onClick={() => respond(o._id, true)}
                            >
                              <Check />
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              disabled={loadingRespId === o._id}
                              onClick={() => respond(o._id, false)}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft />
          </Button>
          <span>Page {page}</span>
          <Button size="sm" disabled={tasks.length < perPage} onClick={() => setPage(p => p + 1)}>
            <ChevronRight />
          </Button>
        </div>
      </motion.section>
    </div>
  )
}
