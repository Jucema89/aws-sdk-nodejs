import "dotenv/config"
import fs from 'fs';

import {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand,
    PutObjectCommandOutput,
    DeleteObjectCommandOutput
} from "@aws-sdk/client-s3";
import { AwsResponse, DataForFile, FileDataSave, TypeFile } from "../interfaces/aws.interface";
import { removeLocalFile } from "../utils/files.handler";
import { Readable } from "node:stream";

//==Folders in S3==
//pdf
//images
//excel
//word
//others

export class AWSService {

    client = new S3Client({
        region: process.env.AWS_BUCKET_REGION
    });

    //ext Files Availables: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types

    private imageExtensionsAvailable = [
        'png', 'jpg', 'jpeg', 'gif'
    ]

    private pdfExtensionsAvailable = [
        'pdf', 'PDF'
    ]

    private excelExtensionsAvaliable = [
        'xls', 'xlsx',
    ]

    private wordExtensionsAvaliable = [
        'docx', 'doc',
    ]

    private audioExtensionsAvaliable = [
        'aac', 'mp3', 'oga', 'wav', 'weba'
    ]

    private videoExtensionsAvaliable = [
        'wav', 'webm', 'ogv', 'mp4',
    ]

    private presentationsExtensionsAvaliable = [
        'ppt', 'pptx'
    ]

    private othersExtensionsAvaliable = [
        'xml', 'svg', 'zip'
    ]

    private selectFolder = {
        excel: 'excel',
        application: 'pdf',
        pdf: 'pdf',
        word: 'word',
        image: 'images',
        video: 'others',
        audio: 'others',
        presentation: 'others',
        other: 'others'
    }

    async getFile(folder: string, fileKey: string) {
        const image = {
            Bucket: process.env.AWS_BUCKET,
            Key: `${folder}/${fileKey}`,
        }

        const command = new GetObjectCommand(image);
        return await this.client.send(command);
    }

    async viewFile(folder: string, fileKey: string): Promise<Readable> {
        const image = {
            Bucket: process.env.AWS_BUCKET,
            Key: `${folder}/${fileKey}`,
        };
    
        const command = new GetObjectCommand(image);
        const { Body } = await this.client.send(command);
        
        return Body as Readable;
    }

    async downloadFile(folder: string, fileKey: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
          try {
            const command = new GetObjectCommand({
              Bucket: process.env.AWS_BUCKET,
              Key: `${folder}/${fileKey}`,
            });
    
            const response = await this.client.send(command);
    
            if (response.Body instanceof Readable) {
              const filePath = `${process.cwd()}/file/${fileKey}`;
              const fileStream = fs.createWriteStream(filePath);
    
              response.Body.pipe(fileStream);
    
              fileStream.on('finish', () => {
                console.log('Archivo guardado correctamente');
                resolve(filePath);
              });
    
              fileStream.on('error', (error) => {
                console.error('Error al guardar el archivo:', error);
                reject(error);
              });
            } else {
              console.error('El cuerpo no es de tipo stream.Readable');
              reject('El cuerpo no es de tipo stream.Readable');
            }
          } catch (error) {
            console.log('Error al descargar el archivo:', error);
            reject(error);
          }
        });
      }

    /**
     * 
     * @param file File To Upload
     * @param folder Folder into S3 in file saved
     * @returns {AwsResponse} Response with result and url/link to view file
     */
    uploadFile(file: Express.Multer.File, type: TypeFile): Promise<AwsResponse> {

        return new Promise(async (result, reject) => {
            try {

                const dataFile: DataForFile = await this.extensionValidator(type, file.filename);

                if (dataFile.success) {

                    const fileStream = fs.createReadStream(`${process.cwd()}/uploads/${file.filename}`);

                    let arrayString: string[] = file.filename.split('.');
                    const fileName = `${arrayString[0]}.${arrayString[1].toLowerCase()}`;

                    const params = {
                        Body: fileStream,
                        Bucket: process.env.AWS_BUCKET,
                        Key: `${dataFile.folder}/${fileName}`,
                        ContentType: `${dataFile.contentType}`,
                    };

                    const command = new PutObjectCommand(params);
                    const responseAws: PutObjectCommandOutput = await this.client.send(command);

                    if (responseAws.$metadata.httpStatusCode = 200) {

                        const resDelete = await removeLocalFile(`${process.cwd()}/uploads/${file.filename}`);

                        if (resDelete) {
                            result({
                                success: true,
                                status: 200,
                                message: 'File Save Successfully',
                                link: `${dataFile.folder}/${file.filename}`
                            })
                        }

                    } else {
                        result({
                            success: false,
                            status: 403,
                            link: '',
                            message: 'Cloud Error, We cant save this',
                        })
                    }

                } else {
                    result({
                        success: false,
                        status: 404,
                        message: dataFile.message,
                        link: ''
                    });
                }
            } catch (error) {
                console.log('error aws imagen = ', error);
                reject({
                    ok: false,
                    status: 500,
                    msg: 'Error de servidor subiendo Imagen',
                })
            }
        })
    }

    /**
    * Get file infolder and upload to AWS-S3
    * @param nameFile Name file to Upload
    * @returns {AwsResponse} Response with result and url/link to view file
    */
    uploadFromFolder(nameFile: string, type: TypeFile, folder: string = 'uploads'): Promise<AwsResponse> {

        return new Promise(async (result, reject) => {
            try {

                const dataFile: DataForFile = await this.extensionValidator(type, nameFile);

                if (dataFile.success) {

                    const fileStream = fs.createReadStream(`${process.cwd()}/${folder}/${nameFile}`);

                    let arrayString: string[] = nameFile.split('.');
                    const fileName = `${arrayString[0]}.${arrayString[1].toLowerCase()}`;

                    const params = {
                        Body: fileStream,
                        Bucket: process.env.AWS_BUCKET,
                        Key: `${dataFile.folder}/${fileName}`,
                        ContentType: `${dataFile.contentType}`,
                    };

                    const command = new PutObjectCommand(params);
                    const responseAws: PutObjectCommandOutput = await this.client.send(command);

                    if (responseAws.$metadata.httpStatusCode = 200) {

                        const resDelete = await removeLocalFile(`${process.cwd()}/${folder}/${nameFile}`);

                        if (resDelete) {
                            result({
                                success: true,
                                status: 200,
                                message: 'File Save Successfully',
                                link: `${dataFile.folder}/${nameFile}`
                            })
                        }

                    } else {
                        result({
                            success: false,
                            status: 403,
                            link: '',
                            message: 'Cloud Error, We cant save this',
                        })
                    }

                } else {
                    result({
                        success: false,
                        status: 404,
                        message: dataFile.message,
                        link: ''
                    });
                }
            } catch (error) {
                console.log('error aws imagen = ', error);
                reject({
                    ok: false,
                    status: 500,
                    msg: 'Error de servidor subiendo Imagen',
                })
            }
        })
    }

    /**
     * 
     * @param fileKey string key for file to remove
     * @returns {AwsResponse} response after remove file
     */
    removeFile(fileKey: string): Promise<AwsResponse> {
        return new Promise(async (result, reject) => {
            try {

                const image = {
                    Bucket: process.env.AWS_BUCKET,
                    Key: `${fileKey}`,
                }

                const command = new DeleteObjectCommand(image);
                const response: DeleteObjectCommandOutput = await this.client.send(command);

                const res = response['$metadata'];

                if (res.httpStatusCode == 204) {
                    result({
                        success: true,
                        status: 200,
                        message: 'File removed successfully',
                        link: ''
                    })
                } else {
                    result({
                        success: false,
                        status: res.httpStatusCode || 400,
                        message: 'File Not Found: We couldnt delete the file',
                        link: ''
                    })
                }

            } catch (error) {
                reject({
                    ok: false,
                    msg: 'Cloud Error: We couldnt delete the file'
                })
            }
        })
    }

    /**
     * 
     * @param files {Files[]} Array of files to Upload AWS
     * @returns {string[]} response with result and links array for images access
     */

    //TODO: Change this for using multipart include in AWS-SDK
    multiImagesUpload(files: Express.Multer.File[]): Promise<string[]> {

        return new Promise(async (result, reject) => {

            try {
                const count = files.length;
                const fileArray: string[] = [];

                for (let i = 0; i < count; i++) {

                    const nameArray: string[] = files[i].filename.split('.');
                    const ext: string = nameArray[nameArray.length - 1];

                    const type: TypeFile = this.getTypeOfExtension(ext)

                    let fileUpload = await this.uploadFile(files[i], type);

                    if (fileUpload.success) {
                        fileArray.push(fileUpload.link);
                    }
                }

                result(fileArray);

            } catch (error) {
                console.log('error multi imagen = ', error);
                reject(error)
            }
        })
    }

    multiFilesUpload(files: Express.Multer.File[]): Promise<FileDataSave[]> {

        return new Promise(async (result, reject) => {

            try {
                const count = files.length;
                const fileArray: FileDataSave[] = [];

                for (let i = 0; i < count; i++) {
                    const nameArray: string[] = files[i].filename.split('.');
                    const ext: string = nameArray[nameArray.length - 1];

                    const type: TypeFile = this.getTypeOfExtension(ext)

                    let fileUpload = await this.uploadFile(files[i], type);

                    if (fileUpload.success) {
                        fileArray.push({
                            type: type,
                            name: files[i].originalname,
                            fieldName: files[i].fieldname,
                            link: fileUpload.link
                        });
                    }
                }

                result(fileArray);

            } catch (error) {
                console.log('error multi imagen = ', error);
                reject(error)
            }
        })
    }

    /**
     * Check if the file extension and type match the established formats, return an object with the data needed for AWS CRUD actions related to that file.
     * @param type Tipo file selected
     * @param fileName File name with extension, on which the extension evaluation will be performed, 
     * @returns {DataForFile}
     */
    private extensionValidator(type: TypeFile, fileName: string):
        Promise<DataForFile> {

        return new Promise((result, reject) => {
            try {

                const nameArray: string[] = fileName.split('.');
                const ext: string = nameArray[nameArray.length - 1];

                let response: DataForFile = {
                    success: false,
                    folder: '',
                    contentType: 'image/jpeg',
                    message: 'success'
                }

                console.log('extension validator aws = ', type)

                switch (type) {
                    case 'excel':

                        if (this.excelExtensionsAvaliable.includes(ext)) {

                            response.success = true;
                            response.folder = this.selectFolder[type];
                            response.contentType = 'application/vnd.ms-excel'

                            result(response)

                        } else {
                            response.message = `Extension ${ext} Not valid in type ${type}`
                            result(response)
                        }

                        break;

                    case 'image':

                        if (this.imageExtensionsAvailable.includes(ext)) {

                            response.success = true;
                            response.folder = this.selectFolder[type];
                            response.contentType = 'image/jpeg'

                            result(response)

                        } else {
                            response.message = `Extension ${ext} Not valid in type ${type}`
                            result(response)
                        }


                        break;

                    case 'application':

                        if (this.pdfExtensionsAvailable.includes(ext)) {

                            response.success = true;
                            response.folder = this.selectFolder[type];
                            response.contentType = 'application/pdf'

                            result(response)

                        } else {
                            response.message = `Extension ${ext} Not valid in type ${type}`
                            result(response)
                        }

                        break;

                    case 'pdf':

                        if (this.pdfExtensionsAvailable.includes(ext)) {

                            response.success = true;
                            response.folder = this.selectFolder[type];
                            response.contentType = 'application/pdf'

                            result(response)

                        } else {
                            response.message = `Extension ${ext} Not valid in type ${type}`
                            result(response)
                        }

                        break;

                    case 'word':

                        if (this.wordExtensionsAvaliable.includes(ext)) {

                            response.success = true;
                            response.folder = this.selectFolder[type];
                            response.contentType = 'text/plain'

                            result(response)

                        } else {

                            response.message = `Extension ${ext} Not valid in type ${type}`
                            result(response)
                        }

                        break;

                    case 'video':

                        if (this.videoExtensionsAvaliable.includes(ext)) {

                            response.success = true;
                            response.folder = this.selectFolder[type];
                            response.contentType = `video/${ext}`

                            result(response)

                        } else {
                            response.message = `Extension ${ext} Not valid in type ${type}`
                            result(response)
                        }

                        break;

                    case 'audio':

                        if (this.audioExtensionsAvaliable.includes(ext)) {

                            response.success = true;
                            response.folder = this.selectFolder[type];
                            response.contentType = `audio/${ext}`

                            result(response)

                        } else {
                            response.message = `Extension ${ext} Not valid in type ${type}`
                            result(response)
                        }

                        break;

                    case 'presentation':

                        if (this.audioExtensionsAvaliable.includes(ext)) {

                            response.success = true;
                            response.folder = this.selectFolder[type];
                            response.contentType = `application/vnd.ms-powerpoint`

                            result(response)

                        } else {
                            response.message = `Extension ${ext} Not valid in type ${type}`
                            result(response)
                        }

                        break;

                    case 'other':

                        if (this.othersExtensionsAvaliable.includes(ext)) {

                            response.success = true;
                            response.folder = this.selectFolder[type];
                            response.contentType = 'application/*'

                            result(response)

                        } else {
                            response.message = `Extension ${ext} Not valid in type ${type}`;
                            result(response)
                        }

                        break;


                    default:
                        response.message = `Extension ${ext} not valid in any kind`;
                        result(response)

                        break;
                }

            } catch (error) {
                reject('Error Get folder to file')
            }
        })

    }

    /**
     * Get extension file and return the right type in list available extension
     * @param ext Ext File
     * @returns {TypeFile} Type file for save
     */
    getTypeOfExtension(ext: string): TypeFile {

        if (this.imageExtensionsAvailable.includes(ext)) {
            return 'image'
        }

        if (this.excelExtensionsAvaliable.includes(ext)) {
            return 'excel'
        }

        if (this.wordExtensionsAvaliable.includes(ext)) {
            return 'word'
        }

        if (this.videoExtensionsAvaliable.includes(ext)) {
            return 'video'
        }

        if (this.audioExtensionsAvaliable.includes(ext)) {
            return 'audio'
        }

        if (this.presentationsExtensionsAvaliable.includes(ext)) {
            return 'presentation'
        }

        if (this.pdfExtensionsAvailable.includes(ext)) {
            return 'application'
        }

        if (this.othersExtensionsAvaliable.includes(ext)) {
            return 'other'
        }

        return 'other'
    }

}