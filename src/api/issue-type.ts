import { Request, Response } from 'express';
import { fetchData,
    calculateCounts,
    calculatePercentages
} from './utils';

export const GET = async (_req: Request, res: Response) => {
  try {
    const data = await fetchData(500);

    const typeCounts = calculateCounts(data, 'type');
    const typePercentages = calculatePercentages(typeCounts, data.length);

    res.json(typePercentages);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
