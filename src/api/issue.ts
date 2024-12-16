import axios from 'axios';
import { Request, Response } from 'express';
import { SampleData } from './types';

const DATA_URL = 'https://sampleapi.squaredup.com/integrations/v1/service-desk?datapoints=500';

export const GET = async (_req: Request, res: Response) => {
  try {
    const { data } = await axios.get<SampleData>(DATA_URL);
    const typeCounts = data.results.reduce((counts, item) => {
      counts[item.type] = (counts[item.type] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const total = data.results.length;
    const percentages = Object.entries(typeCounts).map(([type, count]) => ({
      type,
      percentage: ((count / total) * 100).toFixed(2),
    }));

    res.status(200).json(percentages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
