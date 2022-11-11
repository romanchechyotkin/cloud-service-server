import {
    Body,
    Controller,
    Get,
    Post, Query, Req, Res,
    UnauthorizedException,
    UploadedFiles,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {File, FileDocument} from "./files.schema";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {FilesService} from "./files.service";
import {FilesGuard} from "./guards/files.guard";
import {FilesInterceptor} from "@nestjs/platform-express";
import {UsersService} from "../users/users.service";
import * as path from "path";
import * as fs from "fs";
import {Response} from "express";

@Controller('files')
export class FilesController {

    constructor(@InjectModel (File.name) private fileModel: Model<FileDocument>,
                private userService: UsersService,
                private fileService: FilesService) {}

    @UseGuards(FilesGuard)
    @Post('')
    async createDir(
        @Body() createFileDto,
        @Req() req
    ) {
        const file = new this.fileModel({
            name: createFileDto.name,
            type: createFileDto.type,
            parent: createFileDto.parent,
            user: req.user.user._id
        })
        const parentFile = await this.fileModel.findOne({_id: createFileDto.parent})
        if (!parentFile) {
            file.path = createFileDto.name
            await this.fileService.createDir(file)
        } else {
            file.path = `${parentFile.path}\\${file.name}`
            await this.fileService.createDir(file)
            parentFile.childs.push(file._id)
            await parentFile.save()
        }
        await file.save()
        return file
    }

    @UseGuards(FilesGuard)
    @Get()
    async getFiles(@Req() req) {
        const files = await this.fileModel.find({user: req.user.user._id, parent: req.query.parent})
        return files
    }

    @UseGuards(FilesGuard)
    @Post("/uploadFile")
    @UseInterceptors(FilesInterceptor('file'))
    async uploadFile(@UploadedFiles() files: Array<Express.Multer.File>,
                     @Body() fileDto,
                     @Req() req
    ) {
        const file = files[0]

        const parent = await this.fileModel.findOne({user: req.user.user._id, _id: fileDto.parent})
        const user = await this.userService.findOneById(req.user.user._id)

        if (user.usedSpace + file.size > user.diskSpace) {
            throw new UnauthorizedException(`full disk space`)
        }

        user.usedSpace = user.usedSpace + file.size

        let userFilePath;
        const filePath = path.join(__dirname, "..", "..", "usersFiles")

        if (parent) {
            userFilePath = `${filePath}\\${user._id}\\${parent.path}\\${file.originalname}`
        } else {
            userFilePath = `${filePath}\\${user._id}\\${file.originalname}`
        }

        if (fs.existsSync(userFilePath)) {
            throw new UnauthorizedException(`already exists`)
        }

        fs.writeFileSync(userFilePath, file.buffer)

        const type = file.originalname.split('.').pop()
        const dbFile = await this.fileModel.create({
            name: file.originalname,
            type,
            size: file.size,
            path: parent?.path,
            parent: parent?._id,
            user: user._id
        })

        await dbFile.save()
        await user.save()

        return dbFile
    }

    @UseGuards(FilesGuard)
    @Get('/download')
    async download(@Res() res: Response, @Req() req, @Query("id") id: string) {
        const file = await this.fileModel.findOne({_id: id, user: req.user.user._id})
        const filePath = path.join(__dirname, "..", "..", "usersFiles", req.user.user._id, file.path, file.name)
        console.log(filePath)
        if (fs.existsSync(filePath)) {
            res.download(filePath, file.name)
        } else {
            throw new UnauthorizedException(`Download error`)
        }
    }

}
