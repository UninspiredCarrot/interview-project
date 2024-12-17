import React, { useEffect, useState, useMemo } from 'react';
import { SampleData } from 'api/types';
import axios from 'axios';

type priorityType = 'high' | 'normal' | 'low';
type priorityDirectionType = 'asc' | 'desc';
type idDirectionType = 'asc' | 'desc';
type statusType = 'new' | 'open' | 'pending' | 'solved' | 'hold';
type typeType = 'problem' | 'task' | 'incident' | 'question';

const Table = () => {
  const [data, setData] = useState<SampleData['results'] | []>([]);
  const [loading, setLoading] = useState(true);
  const [filterValue, setFilterValue] = useState('');
  const [config, setConfig] = useState<{
    priority?: priorityType;
    priorityDirection?: priorityDirectionType;
    // idDirection?: idDirectionType;
    status?: statusType;
    type?: typeType;
    organizationSearch?: string;
  }>({
    priority: undefined,
    priorityDirection: "desc",
    // idDirection: "asc",
    status: undefined,
    type: undefined,
    organizationSearch: undefined,
  });

  const [view, setView] = useState<'table' | 'summary'>('table');
  const [hiddenColumns, setHiddenColumns] = useState<(keyof SampleData['results'][0])[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<SampleData>('/api/data?datapoints=100');
        if (response.data && Array.isArray(response.data)) {
          setData(response.data);
        } else {
          console.error('Data fetch was empty');
          setData([]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns: { key: keyof SampleData['results'][0]; label: string }[] = [
    { key: 'id', label: 'ID' },
    { key: 'subject', label: 'Subject' },
    { key: 'priority', label: 'Priority' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'assignee_id', label: 'Assignee' },
    { key: 'due', label: 'Due Date' },
    { key: 'organization_id', label: 'Organization' },
  ];

  const sortedData = useMemo(() => {
    const sortableData = [...data];
    sortableData.sort((a, b) => {
    const priorityOrder = { high: 3, normal: 2, low: 1 };
    return config.priorityDirection === 'asc'
        ? priorityOrder[a.priority.toLowerCase() as priorityType] - priorityOrder[b.priority.toLowerCase() as priorityType]
        : priorityOrder[b.priority.toLowerCase() as priorityType] - priorityOrder[a.priority.toLowerCase() as priorityType];
    });

    // if (config.idDirection) {
    //   sortableData.sort((a, b) => {
    //     return config.idDirection === 'asc' ? a.id - b.id : b.id - a.id;
    //   });
    // }
    return sortableData;
  }, [data, config]);

  const filteredData = useMemo(() => {
    return sortedData.filter((item) => {
      const priorityMatch = !config.priority || item.priority.toLowerCase() === config.priority.toLowerCase();
      const statusMatch = !config.status || item.status.toLowerCase() === config.status.toLowerCase();
      const typeMatch = !config.type || item.type.toLowerCase() === config.type.toLowerCase();
      const organizationMatch = !config.organizationSearch || item.organization_id.toLowerCase().includes(config.organizationSearch.toLowerCase());
      return priorityMatch && statusMatch && typeMatch && organizationMatch;
    });
  }, [sortedData, config]);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-600 font-bold';
      case 'normal':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const toggleColumnVisibility = (column: keyof SampleData['results'][0]) => {
    setHiddenColumns((prev) =>
      prev.includes(column) ? prev.filter((col) => col !== column) : [...prev, column]
    );
  };

  const toggleRowExpansion = (id: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

//   const handleIdSort = () => {
//     setConfig((prev) => ({
//       ...prev,
//       idDirection: prev.idDirection === 'asc' ? 'desc' : 'asc',
//     }));
//   };
  const handlePrioritySort = () => {
    setConfig((prev) => ({
      ...prev,
      priorityDirection: prev.priorityDirection === 'desc' ? 'asc' : 'desc',
    }));
  };

  const summaryStats = useMemo(() => {
    const stats: {
      ticketsByPriority: { [key in priorityType]?: number },
      ticketsByType: { [key in typeType]?: number },
      ticketsByStatus: { [key in statusType]?: number },
      satisfactionRatings: { [key: number]: number },
    } = {
      ticketsByPriority: {},
      ticketsByType: {},
      ticketsByStatus: {},
      satisfactionRatings: {},
    };

    filteredData.forEach(item => {
      // Tickets by Priority
      stats.ticketsByPriority[item.priority as priorityType] =
        (stats.ticketsByPriority[item.priority as priorityType] || 0) + 1;

      // Tickets by Type
      stats.ticketsByType[item.type as typeType] =
        (stats.ticketsByType[item.type as typeType] || 0) + 1;

      // Tickets by Status
      stats.ticketsByStatus[item.status as statusType] =
        (stats.ticketsByStatus[item.status as statusType] || 0) + 1;

      // Satisfaction Ratings
      const score = item.satisfaction_rating?.score;
      if (score) {
        stats.satisfactionRatings[score] =
          (stats.satisfactionRatings[score] || 0) + 1;
      }
    });

    return stats;
  }, [filteredData]);

  const renderSummaryView = () => (
    <div className="rounded-lg bg-white p-4 shadow-md">
      <h2 className="mb-4 text-2xl font-bold">Service Desk Summary</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="mb-2 font-semibold">Tickets by Priority</h3>
          {Object.entries(summaryStats.ticketsByPriority).map(([priority, count]) => (
            <div key={priority} className="flex justify-between">
              <span>{priority}</span>
              <span>{count}</span>
            </div>
          ))}
        </div>
        <div>
          <h3 className="mb-2 font-semibold">Tickets by Type</h3>
          {Object.entries(summaryStats.ticketsByType).map(([type, count]) => (
            <div key={type} className="flex justify-between">
              <span>{type}</span>
              <span>{count}</span>
            </div>
          ))}
        </div>
        <div>
          <h3 className="mb-2 font-semibold">Tickets by Status</h3>
          {Object.entries(summaryStats.ticketsByStatus).map(([status, count]) => (
            <div key={status} className="flex justify-between">
              <span>{status}</span>
              <span>{count}</span>
            </div>
          ))}
        </div>
        <div>
          <h3 className="mb-2 font-semibold">Satisfaction Ratings</h3>
          {Object.entries(summaryStats.satisfactionRatings).map(([rating, count]) => (
            <div key={rating} className="flex justify-between">
              <span>{rating}</span>
              <span>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading data...</div>;
  }

  return (
    <div className="rounded-lg bg-white p-4 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Service Desk Issues</h1>
        <div className="flex items-center space-x-4">
            {/* Status Filter */}
            <select
            value={config.status}
            onChange={(e) => setConfig(prev => ({...prev, status: e.target.value as statusType}))}
            className="rounded border p-2"
            >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            </select>
          <input
            type="text"
            placeholder="Search organisation id"
            value={config.organizationSearch}
            onChange={(e) => setConfig(prev => ({...prev, organizationSearch: e.target.value}))}
            className="w-64 rounded border p-2"
          />
          <div className="relative">
            <button
              className="rounded border p-2 hover:bg-gray-100"
              onClick={(e) => e.currentTarget.nextElementSibling?.classList.toggle('hidden')}
            >
              👁️ Columns
            </button>
            <div className="absolute right-0 mt-2 hidden w-48 rounded border bg-white shadow-lg">
              {columns.map((column) => (
                <label key={column.key} className="flex items-center p-2 hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={!hiddenColumns.includes(column.key)}
                    onChange={() => toggleColumnVisibility(column.key)}
                    className="mr-2"
                  />
                  {column.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns
              .filter((col) => !hiddenColumns.includes(col.key))
              .map((column) => (
                <th
                key={column.key}
                onClick={() => {
                    if (column.key === 'priority') {
                    handlePrioritySort();
                    }
                }}
                className={`border bg-gray-100 p-2 ${
                    column.key === 'id' || column.key === 'priority' ? 'cursor-pointer hover:bg-gray-200' : ''
                }`}
                >
                {column.label}
                {/* {column.key === 'id' && config.idDirection && (
                    <span>{config.idDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                )} */}
                {column.key === 'priority' && config.priorityDirection && (
                    <span>{config.priorityDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                )}
                </th>


              ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item) => (
            <React.Fragment key={item.id}>
            <tr className="cursor-pointer hover:bg-gray-50"
                onClick={() => toggleRowExpansion(item.id)}>
              {columns
                .filter((col) => !hiddenColumns.includes(col.key))
                .map((column) => (
                  <td key={column.key} className="border p-2">
                    {column.key === 'priority' ? (
                      <span className={getPriorityColor(item[column.key])}>{item[column.key]}</span>
                    ) : (
                      String(item[column.key])
                    )}
                  </td>
                ))}
            </tr>
          {expandedRows.has(item.id) && (
                <tr>
                  <td colSpan={columns.length - hiddenColumns.length} className="bg-gray-50 p-4">
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                      <div>
                        <strong>Via Channel:</strong> {item.via.channel}
                      </div>
                      <div>
                        <strong>Source Name:</strong> {item.via.source.from.name}
                      </div>
                      <div>
                        <strong>Source Email:</strong> {item.via.source.from.email}
                      </div>
                      <div>
                        <strong>Organization ID:</strong> {item.organization_id}
                      </div>
                      <div>
                        <strong>Ticket Form ID:</strong> {item.ticket_form_id}
                      </div>
                      <div>
                        <strong>Satisfaction Score:</strong> {item.satisfaction_rating?.score || 'N/A'}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
            ))}
        </tbody>
      </table>

      <div className="mt-4">
        <button
          className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
          onClick={() => setView(view === 'table' ? 'summary' : 'table')}
        >
          {view === 'table' ? 'Switch to Summary View' : 'Switch to Table View'}
        </button>
      </div>

      {view === 'summary' && renderSummaryView()}
    </div>
  );
};

export default Table;
