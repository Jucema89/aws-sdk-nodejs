//requiring path and fs modules
import * as path from 'path';
import * as fs from 'fs';
//joining path of directory 

function getListFilesInFolder(routeFolder: string) {
    const directoryPath = path.join(__dirname, routeFolder);
    // Passing directoryPath and callback function
    fs.readdir(directoryPath, function (err: NodeJS.ErrnoException | null, files: string[]) {
        // Handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        
        // Listing all files using forEach
        files.forEach(function (file: string) {    
            // Do whatever you want to do with the file
            console.log(file);
        });
    });
}

export { getListFilesInFolder }