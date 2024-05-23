import { Router } from 'express';
import { download, get, remove, upload } from '../controllers/file.controller';
import { check } from 'express-validator';
import multerMiddleware from '../middleware/file-upload';
import { validateFields } from '../middleware/validate-fields';

const router = Router();

router
    .post("/upload",
        multerMiddleware.single("file"),
        check('type', 'el tipo de archivo es requerido').not().isEmpty(),
        check('fieldName', 'El fieldName es requerido').not().isEmpty(),
        validateFields,
        upload
    )
 
    .get("/view/:folder/:name",
        get
    )

    .get("/download/:folder/:name",
        download
    )

    .delete("/delete/:folder/:name",
        remove
    )

export { router }
