import axios from 'axios';
import { SampleData } from './types';

const DATA_URL = 'https://sampleapi.squaredup.com/integrations/v1/service-desk';

export const fetchData = async (
    datapoints?: number,
    priority?: string,
    type?: "problem" | "task" | "incident" | "question",
    status?: "new" | "open" | "pending" | "solved" | "hold",
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

// export const calculateCounts = (data: SampleData['results'], field: string) => {
//     return data.reduce((counts, item) => {
//         const fieldValue = (item[field as keyof typeof item] as string).toLowerCase();
//         counts[fieldValue] = (counts[fieldValue] || 0) + 1;
//         return counts;
//     }, {} as Record<string, number>);
// };

// export const calculatePercentages = (counts: Record<string, number>, total: number) => {
//     return Object.entries(counts).map(([field, count]) => ({
//         field,
//         percentage: ((count / total) * 100).toFixed(2),
//     }));
// };

// export const getPercentageData = async (field: string) => {
//     const { data } = await axios.get<SampleData>(DATA_URL);
//     const counts = calculateCounts(data.results, field);
//     const total = data.results.length;
//     return calculatePercentages(counts, total);
// };

// export const calculateAverageCloseTime = async () => {
//     const { data } = await axios.get<SampleData>(DATA_URL);
//     const highPriorityIssues = data.results.filter(item => item.priority.toLowerCase() === 'high' && item.status.toLowerCase() === 'solved');

//     const totalTime = highPriorityIssues.reduce((total, item) => {
//         const createdTime = new Date(item.created).getTime();
//         const updatedTime = new Date(item.updated).getTime();
//         const timeDifference = updatedTime - createdTime;
//         return total + timeDifference;
//     }, 0);

//     const averageTime = totalTime / highPriorityIssues.length;

//     return averageTime;
// }
