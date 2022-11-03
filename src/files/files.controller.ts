import {Body, Controller, Get, Post, Req, Res, UseGuards} from '@nestjs/common';
import {File, FileDocument} from "./files.schema";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {FilesService} from "./files.service";
import {FilesGuard} from "./guards/files.guard";

@Controller('files')
export class FilesController {

    constructor(@InjectModel (File.name) private fileModel: Model<FileDocument>,
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


}
