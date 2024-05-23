import { Request, Response } from 'express';
import { handleHttp } from '../utils/error.handle';
import { AWSService } from "../services/aws.service";
import { AwsResponse, TypeFile } from "../interfaces/aws.interface";
import { Readable } from 'node:stream';
import { removeLocalFile } from '../utils/files.handler';


const awsService = new AWSService()

async function upload(req: Request, res: Response) {
    try {
        const type: TypeFile = req.body.type

        if (req.file) {
            const fileUpload: Express.Multer.File = req.file

            //Upload To AWS
            const responseAWS: AwsResponse = await awsService.uploadFile(fileUpload, type)

            console.log('fileUpload = ', fileUpload)
            //Remove in folder upload
            //await removeLocalFile(`${process.cwd()}/uploads/${fileUpload.filename}`)

            res.status(200).json({
                success: true,
                data: responseAWS
            })

        } else {
            res.status(404).json({
                succes: false,
                message: 'You did not send any file'
            })
        }

    } catch (error) {
        handleHttp(res, 'ERROR_UPLOAD_FILE', error)
    }
}

async function get(req: Request, res: Response) {
    try {
        const { folder, name } = req.params;
        
        const fileStream: Readable = await awsService.viewFile(folder, name);
        const contentType = getContentTypeFromFileName(name);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `inline; filename="${name}"`);

        // Send file flow to Client
        fileStream.pipe(res)

    } catch (error) {
        handleHttp(res, 'ERROR_GET_FILE', error)
    }
}


async function download(req: Request, res: Response) {
    try {
        const { folder, name } = req.params;
        const fileInAWS = await awsService.viewFile(folder, name);
        // Header for download file
        res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        fileInAWS.pipe(res)

      } catch (error) {
        handleHttp(res, 'ERROR_DOWNLOAD_FILES', error)
    }
}

async function remove(req: Request, res: Response){
    try {
        const { folder, name } = req.params;
        const deletFile = await awsService.removeFile(`${folder}/${name}`)
        console.log('deletFile == ', deletFile)

        if(deletFile){
            res.status(200).json({
                success: true,
                data: deletFile
            })
        } else {
            res.status(404).json({
                succes: false,
                message: 'You did not send any file'
            })
        }

    } catch (error) {
        handleHttp(res, 'ERROR_DELETE_FILES', error)
    }
}


function getContentTypeFromFileName(fileName: string): string {
    const extension = fileName.split('.').pop();
    switch (extension) {
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        // add more case for type file do you want handler
        default:
            return 'application/octet-stream'; // default when extension is unknow
    }
}

export {
    get,
    upload,
    download,
    remove
};
