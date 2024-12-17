import { Request, Response } from 'express';
import { fetchData } from './utils';

export const GET = async (req: Request, res: Response): Promise<void> => {
    try {

        const { datapoints, priority, type, status } = req.query as {
            datapoints?: number;
            priority?: "high" | "normal" | "low";
            type?: "problem" | "task" | "incident" | "question";
            status?: "new" | "open" | "pending" | "solved" | "hold";
        };

        const results = await fetchData(
            datapoints,
            priority,
            type,
            status
        );

        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
};
