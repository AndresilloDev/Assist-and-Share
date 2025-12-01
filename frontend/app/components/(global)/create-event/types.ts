export interface Presenter {
    _id: string
    first_name: string
    last_name: string
}

export interface EventFormData {
    title: string
    coverImage?: string;
    description: string
    capacity: number
    duration: number
    modality: "in-person" | "online" | "hybrid"
    date: string
    presenter: string
    location: string
    link: string
    requirements: string[]
    type: "workshop" | "seminar" | "conference"
    materials: string[]
}

export interface MaterialItem {
    name: string
    size: string
    url?: string
}

export interface QuizQuestion {
    text: string
    order: number
    tempId: number
}

export const EVENT_TYPE_OPTIONS = [
    { value: "conference", label: "Conferencia" },
    { value: "workshop", label: "Taller" },
    { value: "seminar", label: "Seminario" },
]

export const MODALITY_OPTIONS = [
    { value: "in-person", label: "Presencial" },
    { value: "online", label: "En línea" },
    { value: "hybrid", label: "Híbrido" },
]