# AWS-Node
![enter image description here](https://miro.medium.com/v2/resize:fit:1400/1*FnzUyVNfB2HsfOfI2uLfTg.jpeg)
Implementación de SDK de AWS dentro de Nodejs, conceptos mostrados:

- Manejo de archivos dentro de Nodejs: Usando Multer y sistema de File System para subida y eliminación de archivos
- Uso de SDK de AWS v3 para CRUD dentro de Bucket de S3
- Uso de MVC para creación de API rest

# Instalación y Uso
Debes tener la versión de Node 20 o superior.

1. `git clone `
2. Coloca las variables de entorno requeridas en el `.env`
3. `npm i`
4. `npm run dev`

## Rutas 

Estas son las rutas funcionales de la API. Asumiendo en ellas que el `PORT` es 3900, serian así:

|         ACCION       |RUTA               |PARAMETROS                         |
|----------------|-------------------------------|-----------------------------|
|Upload File|`'http://localhost:3900/api/file/upload'`            | `type` `fieldName` `file`            |
|View File          |`http://localhost:3900/api/file/view/${FOLDER}/${NAME}`            | `${NAME}` `${FOLDER}`           |
|Download File       |`http://localhost:3900/api/file/download/${FOLDER}/${NAME}`| `${NAME}` `${FOLDER}` |
Delete File       |`http://localhost:3900/api/file/delete/${FOLDER}/${NAME}`| `${NAME}` `${FOLDER}`


## Parámetros y Variables

`${FOLDER}` hace referencia a la carpeta dentro del Bucket de S3 y `${NAME}` hace referencia al nombre del archivo. ej `/image/123456.png` 

para la subida de Files tenemos:
 - `type` : Tipo de archivo sobre el cual se realizan validaciones recibe uno de estos tipos: `'excel'  |  'application'  |  'word'  |  'image'  |  'video'  |  'audio'  |  'presentation'  |  'pdf'  |  'other'`
 - `fieldName` : Nombre del Archivo
 - `file`: Archivo

## Environment

Aqui puedes ver un ejemplo de las variables de Entorno: 
```
PORT=3900
ENVIRONMENT='local'
CORS_DOMAINS='http://localhost:4200, http://localhost:3000'
AWS_ACCESS_KEY_ID=AABBBCCCSSDDADS
AWS_SECRET_ACCESS_KEY=xsxsxsxsxsxsxssadfsdfx/
AWS_BUCKET=nameBucket
AWS_BUCKET_REGION=us-east-1
```
La creación de un Bucket no es compleja, pero debe tener cuidado con los permisos y de preferencia debería dejarlo todo lo más privado posible. Aqui una guía de creación de Buckets:
https://docs.aws.amazon.com/es_es/AmazonS3/latest/userguide/create-bucket-overview.html
