import { Request, Response } from 'express';
import { fetchData,
        filterData,
        calculateTimeDifferences
} from './utils';

export const GET = async (_req: Request, res: Response) => {
    try {
        const data = await fetchData(500);
        const highPriorityIssues = filterData(data, { priority: 'high', status: 'solved' });

        if (highPriorityIssues.length === 0) {
            return res.json({ averageSolveTime: null });
        }

        const timeDifferences = calculateTimeDifferences(highPriorityIssues, 'created', 'updated');
        const totalTime = timeDifferences.reduce((total, time) => total + time, 0);
        const averageSolveTime = totalTime / timeDifferences.length;

        res.json({ averageSolveTime });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
};
