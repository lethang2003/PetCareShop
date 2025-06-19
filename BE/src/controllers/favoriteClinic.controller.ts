import { Request, Response } from 'express';
import FavoriteClinic from '../models/favoriteClinic.model';

export const addFavoriteClinic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId, clinicId } = req.body;

    const favorite = new FavoriteClinic({ customerId, clinicId });
    await favorite.save();

    res.status(201).json({
      message: 'Added clinic to favorites successfully',
      success: true,
      error: false,
      data: favorite
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to add favorite clinic',
      success: false,
      error: true,
      data: null
    });
  }
};

export const removeFavoriteClinic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.body;
    const { clinicId } = req.params;

    const result = await FavoriteClinic.findOneAndDelete({ customerId, clinicId });

    if (!result) {
      res.status(404).json({
        message: 'Favorite clinic not found',
        success: false,
        error: true
      });
      return;
    }

    res.json({
      message: 'Removed clinic from favorites',
      success: true,
      error: false
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to remove favorite clinic',
      success: false,
      error: true
    });
  }
};

export const getFavoriteClinics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.query;

    const favorites = await FavoriteClinic.find({ customerId }).populate('clinicId');

    res.json({
      message: 'Favorite clinics retrieved successfully',
      success: true,
      error: false,
      data: favorites
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get favorite clinics',
      success: false,
      error: true,
      data: []
    });
  }
};
