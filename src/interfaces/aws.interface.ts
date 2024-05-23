export interface AwsResponse {
    success: boolean
    status: number
    message: string
    link: string
    file?: any
}

export interface UploadFile {
    file: File,
    type: TypeFile
    size: number
}

export type TypeFile = 'excel' | 'application' | 'word' | 'image' | 'video' | 'audio' | 'presentation' | 'pdf' | 'other'

export interface DataForFile {
    success: boolean
    folder: string,
    contentType: string
    message: string
}

export interface FileDataSave {
    aliadoId?: string
    solicitudId?: string
    creatorId?: string
    fieldName: string
    type: TypeFile
    name: string
    link: string
}

export interface File {
    id?: string
    solicitud?: string | null
    aliado?: string | null
    aliadoId?: string | null
    solicitudId?: string | null
    creatorId?: string | null
    fieldName: string
    type: TypeFile
    name: string
    link: string
    createdAt?: Date
    updatedAt?: Date
}

export interface GetAllFileFilters {
    isDeleted?: boolean
    includeDeleted?: boolean
}

export interface FileDataResponse {
    id: number
    aliadoId?: string
    solicitudId?: string
    creatorId?: string
    fieldName: string
    type: TypeFile
    name: string
    link: string
    updatedAt: string
    createdAt: string
}

export interface FileUploadSuccess {
    fieldname: string
    url: string
}

export interface DataCreateFile {
    idAliado?: string
    idSolicitud?: string
    idFacturacionSolicitud?: string
    idReporteError?: string
    type: TypeDataCreateFile
}

export type TypeDataCreateFile = 'normal' | 'solicitud' | 'facturacionSolicitud' | 'reporteError';