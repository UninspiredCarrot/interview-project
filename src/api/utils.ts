import axios from 'axios';
import { SampleData } from './types';

const DATA_URL = 'https://sampleapi.squaredup.com/integrations/v1/service-desk';

export const fetchData = async (
    datapoints?: number,
    priority?: "low" | "medium" | "high",
    type?: "problem" | "task" | "question",
    status?: "open" | "pending" | "closed",
): Promise<SampleData['results']> => {
    const params: Record<string, string | number> = {};

    if (priority) params.priority = priority;
    if (datapoints) params.datapoints = datapoints;
    if (type) params.type = type;
    if (status) params.status = status;

    const { data } = await axios.get<SampleData>(DATA_URL, { params });
    return data.results;
};

export const calculateCounts = (
    data: SampleData['results'],
    field: string
): Record<string, number> => {
    const counts: Record<string, number> = {};

    data.forEach(item => {
        const fieldValue = (item[field as keyof typeof item] as string).toLowerCase();
        if (counts[fieldValue] === undefined) {
            counts[fieldValue] = 1;
        } else {
            counts[fieldValue]++;
        }
    });

    return counts;
};

export const calculatePercentages = (
    counts: Record<string, number>,
    total: number
): { field: string, percentage: string }[] => {
    const percentages: { field: string, percentage: string }[] = [];

    for (const [field, count] of Object.entries(counts)) {
        percentages.push({
            field,
            percentage: ((count / total) * 100).toFixed(2),
        });
    }

    return percentages;
};

export const filterData = (
    data: SampleData['results'],
    filters: Partial<Record<keyof SampleData['results'][number], string>>
): SampleData['results'] => {
    return data.filter(item =>
        Object.entries(filters).every(([key, value]) =>
            item[key as keyof typeof item].toString().toLowerCase() === value.toLowerCase()
        )
    );
};

export const calculateTimeDifferences = (
    data: SampleData['results'],
    startField: keyof SampleData['results'][number],
    endField: keyof SampleData['results'][number]
): number[] => {
    return data.map(item => {
        const startTime = new Date(item[startField] as string).getTime();
        const endTime = new Date(item[endField] as string).getTime();
        return endTime - startTime;
    });
};

export const findMaxValueItem = (
    data: SampleData['results'],
    field: keyof SampleData['results'][number]
): SampleData['results'][number] | null => {
    let maxItem: SampleData['results'][number] | null = null;
    let maxTime = 0;

    data.forEach(item => {
        const fieldValue = new Date(item[field] as string).getTime();
        if (fieldValue > maxTime) {
            maxTime = fieldValue;
            maxItem = item;
        }
    });

    return maxItem;
}
