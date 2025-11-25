"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import api from "@/lib/api"
import { Check, X, User, Calendar, Mail, ArrowLeft, Clock, MoreVertical } from "lucide-react"
import Link from "next/link"

import LoadingSpinner from "@/app/components/(ui)/LoadingSpinner"
import ErrorDisplay from "@/app/components/(ui)/ErrorDisplay"

// --- Interfaces ---

interface Event {
    _id: string
    title: string
    date: string
    presenter: string
}

interface UserData {
    _id: string
    first_name: string
    last_name: string
    email: string
}

interface Assistance {
    _id: string
    event: string
    user: UserData
    status: "pending" | "approved" | "rejected" | "attended" | "cancelled"
    registeredAt: string
}

// --- Componente Principal ---

export default function EventAttendeesPage() {
    const params = useParams()
    const eventId = params.id as string
    const { user } = useAuth()

    // Estados
    const [event, setEvent] = useState<Event | null>(null)
    const [attendees, setAttendees] = useState<Assistance[]>([])

    // Estados UI
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    // --- Carga de Datos ---
    useEffect(() => {
        const fetchData = async () => {
            if (!eventId || !user) return
            setIsLoading(true)
            setError("")

            try {
                // 1. Info del evento
                const eventReq = await api.get(`/events/${eventId}`)
                const eventData = eventReq.data.value

                if (user.role !== "admin" && eventData.presenter !== user.id) {
                    setError("No tienes permiso para gestionar este evento.")
                    setIsLoading(false)
                    return
                }
                setEvent(eventData)

                // 2. Asistentes
                const attendeesReq = await api.get(`/assistance/event/${eventId}`)
                const validAttendees = attendeesReq.data.value.filter((a: Assistance) =>
                    ["pending", "approved", "attended", "rejected"].includes(a.status)
                )
                setAttendees(validAttendees)

            } catch (err: any) {
                console.error(err)
                setError("Error al cargar la información.")
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [eventId, user])


    // --- Acciones ---
    const handleUpdateStatus = async (assistanceId: string, newStatus: "approved" | "rejected") => {
        try {
            setAttendees(prev => prev.map(a =>
                a._id === assistanceId ? { ...a, status: newStatus } : a
            ))
            await api.patch(`/assistance/status/${assistanceId}`, { status: newStatus })
        } catch (err) {
            console.error("Error updating status", err)
        }
    }

    // --- Helpers de Renderizado ---
    const getStatusBadge = (status: string) => {
        const styles = {
            approved: 'bg-green-500/10 text-green-400 border-green-500/20',
            pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            attended: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
            cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
        }[status] || 'bg-gray-500/10 text-gray-400'

        const labels = {
            approved: 'Aprobado',
            pending: 'Pendiente',
            attended: 'Asistió',
            rejected: 'Rechazado',
            cancelled: 'Cancelado'
        }[status] || status

        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${styles}`}>
                {labels}
            </span>
        )
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className="min-h-screen text-white p-4 md:p-8" style={{ background: "linear-gradient(180deg, #1B293A 0%, #040711 10%)" }}>
            <div className="max-w-7xl mx-auto pb-20 md:pb-0"> {/* Padding bottom extra en móvil para scroll */}

                {/* Header */}
                <div className="mb-6 md:mb-8 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-800 pb-6">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold mb-2">Asistentes</h1>
                            {event && (
                                <h2 className="text-lg md:text-xl text-blue-400 font-medium flex items-center gap-2 truncate max-w-[300px] md:max-w-none">
                                    {event.title}
                                </h2>
                            )}
                        </div>
                    </div>
                </div>

                {error && <ErrorDisplay message={error} />}

                {!error && (
                    <div className="bg-[#0B1121] border border-gray-800 rounded-2xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Stats Header (Responsive) */}
                        <div className="p-4 md:p-6 border-b border-gray-800 bg-gray-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                Lista de Inscritos
                            </h3>

                            <div className="flex flex-wrap items-center gap-4 text-sm w-full md:w-auto">
                                <div className="flex items-center gap-1.5 bg-gray-900 md:bg-transparent px-3 py-1.5 md:p-0 rounded-lg md:rounded-none flex-1 md:flex-none justify-center">
                                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                                    <span className="text-gray-400 text-xs md:text-sm">Pendientes: {attendees.filter(a => a.status === 'pending').length}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-gray-900 md:bg-transparent px-3 py-1.5 md:p-0 rounded-lg md:rounded-none flex-1 md:flex-none justify-center">
                                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                    <span className="text-gray-400 text-xs md:text-sm">Aprobados: {attendees.filter(a => a.status === 'approved').length}</span>
                                </div>
                                <div className="hidden md:block px-3 py-1 bg-gray-800 rounded-lg text-white font-medium">
                                    Total: {attendees.length}
                                </div>
                            </div>
                        </div>

                        {/* --- LISTA DE ASISTENTES --- */}

                        {attendees.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                No hay personas inscritas en este evento aún.
                            </div>
                        ) : (
                            <>
                                {/* 1. VISTA MÓVIL (Tarjetas) - Visible solo en block md:hidden */}
                                <div className="block md:hidden p-4 space-y-4">
                                    {attendees.map((att) => (
                                        <div key={att._id} className="bg-gray-900/40 border border-gray-800 rounded-xl p-4 flex flex-col gap-4">
                                            {/* Card Header: Avatar + Nombre + Status */}
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-sm font-bold text-gray-300 shadow-inner">
                                                        {att.user?.first_name?.[0] || "?"}{att.user?.last_name?.[0] || "?"}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-white text-base">
                                                            {att.user?.first_name?.[0] || "?"} {att.user?.last_name?.[0] || "?"}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                            <Clock size={10} />
                                                            {new Date(att.registeredAt).toLocaleDateString("es-MX", { month: 'short', day: 'numeric' })}
                                                            {" · "}
                                                            {new Date(att.registeredAt).toLocaleTimeString("es-MX", { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </div>
                                                {getStatusBadge(att.status)}
                                            </div>

                                            {/* Card Body: Info Extra */}
                                            <div className="text-sm text-gray-400 bg-gray-950/50 p-3 rounded-lg flex items-center gap-2 border border-gray-800/50">
                                                <Mail size={14} className="text-gray-500" />
                                                <span className="truncate">{att.user?.email}</span>
                                            </div>

                                            {/* Card Footer: Botones (Grid para fácil touch) */}
                                            <div className="flex gap-3 pt-1">
                                                {(att.status === 'pending' || att.status === 'rejected') && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(att._id, 'approved')}
                                                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-white hover:cursor-pointer py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                                    >
                                                        <Check size={16} /> Aprobar
                                                    </button>
                                                )}

                                                {(att.status === 'pending' || att.status === 'approved') && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(att._id, 'rejected')}
                                                        className="flex-1 bg-red-500/10 text-red-400 hover:cursor-pointer hover:bg-red-500/20 border border-red-500/20 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                                    >
                                                        <X size={16} /> Rechazar
                                                    </button>
                                                )}

                                                {att.status === 'attended' && (
                                                    <div className="w-full text-center text-xs text-gray-500 py-2 italic">
                                                        Asistencia registrada
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* 2. VISTA ESCRITORIO (Tabla) - Visible solo en hidden md:block */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider bg-gray-900/20">
                                                <th className="p-4 font-medium min-w-[200px]">Nombre</th>
                                                <th className="p-4 font-medium">Correo</th>
                                                <th className="p-4 font-medium min-w-[150px]">Fecha Inscripción</th>
                                                <th className="p-4 font-medium text-center">Estatus</th>
                                                <th className="p-4 font-medium text-right min-w-[120px]">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {attendees.map((att) => (
                                                <tr key={att._id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold text-gray-300">
                                                                {att.user?.first_name?.[0] || "?"}{att.user?.last_name?.[0] || "?"}
                                                            </div>
                                                            <div className="font-medium text-white">
                                                                {att.user?.first_name || "?"} {att.user?.last_name || "?"}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-gray-400 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Mail size={14} className="opacity-50" /> {att.user?.email || "?"}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-gray-400 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Clock size={14} className="opacity-50" />
                                                            {new Date(att.registeredAt).toLocaleDateString("es-MX", {
                                                                year: 'numeric', month: 'short', day: 'numeric'
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {getStatusBadge(att.status)}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {(att.status === 'pending' || att.status === 'rejected') && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(att._id, 'approved')}
                                                                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 hover:cursor-pointer text-white transition-all tooltip-trigger"
                                                                    title="Aprobar"
                                                                >
                                                                    <Check size={18} />
                                                                </button>
                                                            )}

                                                            {(att.status === 'pending' || att.status === 'approved') && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(att._id, 'rejected')}
                                                                    className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:cursor-pointer transition-all"
                                                                    title="Rechazar"
                                                                >
                                                                    <X size={18} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}