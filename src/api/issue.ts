import axios from 'axios';
import { SampleData } from './types';

const DATA_URL = 'https://sampleapi.squaredup.com/integrations/v1/service-desk?datapoints=500';

export const calculateCounts = (data: SampleData['results'], field: string) => {
    return data.reduce((counts, item) => {
        const fieldValue = (item[field as keyof typeof item] as string).toLowerCase();
        counts[fieldValue] = (counts[fieldValue] || 0) + 1;
        return counts;
    }, {} as Record<string, number>);
};

export const calculatePercentages = (counts: Record<string, number>, total: number) => {
    return Object.entries(counts).map(([field, count]) => ({
        field,
        percentage: ((count / total) * 100).toFixed(2),
    }));
};

export const getPercentageData = async (field: string) => {
    const { data } = await axios.get<SampleData>(DATA_URL);
    const counts = calculateCounts(data.results, field);
    const total = data.results.length;
    return calculatePercentages(counts, total);
};
