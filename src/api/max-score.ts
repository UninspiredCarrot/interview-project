import { Request, Response } from 'express';
import { fetchData,
        filterData,
        findMaxValueItem} from './utils';

export const GET = async (_req: Request, res: Response) => {
    try {
        const data = await fetchData();
        const highPriorityIssues = filterData(data, { priority: 'high', status: 'solved' });

        if (highPriorityIssues.length === 0) {
            return res.json({ satisfactionScore: null });
        }
        const longestIssue = findMaxValueItem(highPriorityIssues, 'updated');
        const satisfactionScore = longestIssue?.satisfaction_rating?.score || null;

        res.json({ satisfactionScore });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
};
