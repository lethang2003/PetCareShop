import { Request, Response } from 'express';

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const files = req.files as Express.Multer.File[]; // Lấy mảng file

        if (!files || files.length === 0) {
            res.status(400).json({
                success: false,
                error: true,
                message: 'No files uploaded',
            });
            return;
        }

        res.status(200).json({
            success: true,
            error: false,
            message: 'Images uploaded successfully',
            data: {
                urls: files.map(file => file.path),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: true,
            message: 'Internal server error',
        });
    }
};
