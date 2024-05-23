import { Response } from "express";

export const handleHttp = (res: Response, error_name: string, error: any) => {
    //TODO: crear una base de datos 0 servicio externo (sentry, Bugsnag raygun...) para log de errores 
    console.error(error)
    res.status(500).send({
        success: false,
        data: error_name,
        message: error
    })
}

export const badRequestHttp = (res: Response, error_name: string, error: any) => {
    //TODO: crear una base de datos 0 servicio externo (sentry, Bugsnag raygun...) para log de errores 
    console.error(error)
    res.status(400).send({
        success: false,
        data: error_name,
        message: error
    })
}