import {
    Body,
    Controller, Delete,
    Get, HttpException, HttpStatus,
    Post, Query, Req, Res,
    UploadedFiles,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {File, FileDocument} from "./files.schema";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {FilesService} from "./files.service";
import {FilesGuard} from "./guards/files.guard";
import {FileFieldsInterceptor, FilesInterceptor} from "@nestjs/platform-express";
import {UsersService} from "../users/users.service";
import * as path from "path";
import * as fs from "fs";
import * as uuid from "uuid";
import {Response} from "express";
import {User, UserDocument} from "../users/user.schema";

@Controller('files')
export class FilesController {

    constructor(@InjectModel (File.name) private fileModel: Model<FileDocument>,
                @InjectModel (User.name) private userModel: Model<UserDocument>,
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
    async getFiles(@Req() req, @Query("sort") sort: string) {
        let files;
        switch (sort) {
            case ("name"):
                files = await this.fileModel.find({user: req.user.user._id, parent: req.query.parent}).sort({name: 1})
                break

            case ("size-greater"):
                files = await this.fileModel.find({user: req.user.user._id, parent: req.query.parent}).sort({fileSize: 1})
                break

            case ("size-lower"):
                files = await this.fileModel.find({user: req.user.user._id, parent: req.query.parent}).sort({fileSize: -1})
                break

            case ("type"):
                files = await this.fileModel.find({user: req.user.user._id, parent: req.query.parent}).sort({type: 1})
                break

            default:
                files = await this.fileModel.find({user: req.user.user._id, parent: req.query.parent})
                break

            case ("date"):
                files = await this.fileModel.find({user: req.user.user._id, parent: req.query.parent}).sort({date: -1})
                break
        }
        return files
    }

    @UseGuards(FilesGuard)
    @Post("/uploadFile")
    // @UseInterceptors(FilesInterceptor('file'))
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'file', maxCount: 1},
    ]))
    async uploadFile(@UploadedFiles() files,
                     @Body() fileDto,
                     @Req() req
    ) {
        try {
            const uploadFile = files.file
            const file = uploadFile[0]

            const parent = await this.fileModel.findOne({user: req.user.user._id, _id: fileDto.parent})
            let user = await this.userModel.findOne({_id: req.user.user._id})

            if (user.usedSpace + file.size > user.diskSpace) {
                throw new HttpException('full disk', HttpStatus.BAD_REQUEST)
            }

            await this.userModel.updateOne({_id: req.user.user._id}, {$inc: {usedSpace: file.size}})

            let userFilePath;
            const filePath = path.join(__dirname, "..", "..", "usersFiles")

            if (parent) {
                userFilePath = `${filePath}\\${user._id}\\${parent.path}\\${file.originalname}`
            } else {
                userFilePath = `${filePath}\\${user._id}\\${file.originalname}`
            }

            if (fs.existsSync(userFilePath)) {
                throw new HttpException('already exists', HttpStatus.BAD_REQUEST)
            }

            // fs.writeFile(userFilePath, file.buffer, {encoding: "utf-8"}, (err) => {
            //     if (err) {
            //         throw new HttpException(`${err}`, HttpStatus.BAD_REQUEST)
            //     }
            // })

            fs.writeFileSync(userFilePath, file.buffer)

            const type = file.originalname.split('.').pop()
            let pathFile = file.originalname
            if (parent) {
                pathFile = parent.path + "\\" + file.originalname
            }

            const dbFile = await this.fileModel.create({
                name: file.originalname,
                type,
                fileSize: file.size,
                path: pathFile,
                parent: parent?._id,
                user: user._id
            })

            await dbFile.save()
            await user.save()

            return {user: user, file: dbFile}
        } catch (e) {
            console.log(e)
        }
    }

    @UseGuards(FilesGuard)
    @Get('/download')
    async download(@Res() res: Response, @Req() req, @Query("id") id: string) {
        const file = await this.fileModel.findOne({_id: id, user: req.user.user._id})
        const filePath = path.join(__dirname, "..", "..", "usersFiles", req.user.user._id, file.path)
        if (fs.existsSync(filePath)) {
            res.download(filePath, file.name)
        } else {
            throw new HttpException('download error', HttpStatus.BAD_REQUEST)
        }
    }

    @UseGuards(FilesGuard)
    @Delete('/delete')
    async delete(@Res({ passthrough: true }) res: Response, @Req() req, @Query("id") id: string) {
        try {
            const file = await this.fileModel.findOne({_id: id, user: req.user.user._id})
            if (!file) {
                return res.status(400).json({message: 'file not found'})
            }

            await this.fileService.deleteFile(file, req.user.user._id)
            await this.fileModel.deleteOne({_id: file._id})

            const user = await this.userService.findOneById(req.user.user._id)
            user.usedSpace = user.usedSpace - file.fileSize
            await user.save()

            return user
        } catch (e) {
            return res.status(400).json({message: 'Dir is not empty'})
        }
    }

    @UseGuards(FilesGuard)
    @Get("/search")
    async search(@Query("searchName") searchName, @Req() req) {
        let files = await this.fileModel.find({user: req.user.user._id})
        files = files.filter(file => file.name.includes(searchName))
        return files
    }

    @UseGuards(FilesGuard)
    @Post("/avatar")
    @UseInterceptors(FilesInterceptor('file'))
    async uploadAvatar(@Req() req, @UploadedFiles() files: Array<Express.Multer.File>) {
        const file = files[0]
        const user = await this.userService.findOneById(req.user.user._id)
        const avatarName = uuid.v4() + '.jpg'
        const filePath = path.resolve(__dirname, '..', 'static')
        fs.writeFileSync(path.resolve(filePath, avatarName), file.buffer)
        user.avatar = avatarName
        await user.save()
        return user
    }
}
