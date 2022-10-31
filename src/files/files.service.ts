import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {FileDocument, File} from "./files.schema";
import * as path from "path";
import * as fs from "fs";

@Injectable()
export class FilesService {

    constructor(@InjectModel (File.name) private fileModel: Model<FileDocument>) {}

    async createDir(file) {
        const filePath = path.join(__dirname, "..", "..", "usersFiles", `${file.user}`, `${file.path}`)
        return new Promise((resolve, reject) => {
            try {
                if (!fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath)
                    return resolve({message: 'File was created'})
                } else {
                    return reject({message: "File already exist"})
                }
            } catch (e) {
                return reject({message: 'File error'})
            }
        })
    }

}
