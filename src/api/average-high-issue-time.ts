import { Request, Response } from 'express';
import { calculateAverageCloseTime } from './issue';

export const GET = async (_req: Request, res: Response) => {
  try {
    const averageResolutionTime = await calculateAverageCloseTime();
    res.status(200).json({ averageResolutionTime });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
