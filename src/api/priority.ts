import { Request, Response } from 'express';
import { getPercentageData } from './issue';

export const GET = async (_req: Request, res: Response) => {
  try {
    const percentages = await getPercentageData('priority');
    res.status(200).json(percentages);
  } catch (error) {
    console.error('Error fetching or processing priority data:', error);
    res.status(500).json({ error: 'Failed to process priority data' });
  }
};
