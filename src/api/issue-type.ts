import { Request, Response } from 'express';
import { getPercentageData } from './issue';

export const GET = async (_req: Request, res: Response) => {
  try {
    const percentages = await getPercentageData('type');
    res.status(200).json(percentages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
