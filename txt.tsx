import React, { useEffect, useState, useMemo } from 'react';
import { SampleData } from "api/types";
import axios from 'axios';

const EnhancedDataTable: React.FC = () => {
  const [data, setData] = useState<SampleData['results']>([]);
  const [loading, setLoading] = useState(true);

  // Enhanced filtering states
  const [filterConfig, setFilterConfig] = useState({
    priority: '',
    status: '',
    type: '',
    organizationSearch: '',
  });

  const [view, setView] = useState<'table' | 'summary'>('table');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<SampleData>('/api/data?datapoints=100');

        if (response.data && Array.isArray(response.data)) {
          // Sort by priority by default
          const sortedData = response.data.sort((a, b) => {
            const priorityOrder = { 'high': 3, 'normal': 2, 'low': 1 };
            return (priorityOrder[b.priority.toLowerCase() as keyof typeof priorityOrder] || 0) -
            (priorityOrder[a.priority.toLowerCase() as keyof typeof priorityOrder] || 0);          });
          setData(sortedData);
        } else {
          console.error("Invalid data format");
          setData([]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtering function with multiple criteria
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Priority filter
      const priorityMatch = !filterConfig.priority ||
        item.priority.toLowerCase() === filterConfig.priority.toLowerCase();

      // Status filter
      const statusMatch = !filterConfig.status ||
        item.status.toLowerCase() === filterConfig.status.toLowerCase();

      // Type filter
      const typeMatch = !filterConfig.type ||
        item.type.toLowerCase() === filterConfig.type.toLowerCase();

      // Organization search
      const organizationMatch = !filterConfig.organizationSearch ||
        item.organization_id.toLowerCase().includes(filterConfig.organizationSearch.toLowerCase());

      return priorityMatch && statusMatch && typeMatch && organizationMatch;
    });
  }, [data, filterConfig]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    const stats: {
      ticketsByPriority: { [key: string]: number },
      ticketsByType: { [key: string]: number },
      ticketsByStatus: { [key: string]: number },
      satisfactionRatings: { [key: string]: number },
    } = {
      ticketsByPriority: {},
      ticketsByType: {},
      ticketsByStatus: {},
      satisfactionRatings: {},
    };

    filteredData.forEach(item => {
      // Tickets by Priority
      stats.ticketsByPriority[item.priority] =
        (stats.ticketsByPriority[item.priority] || 0) + 1;

      // Tickets by Type
      stats.ticketsByType[item.type] =
        (stats.ticketsByType[item.type] || 0) + 1;

      // Tickets by Status
      stats.ticketsByStatus[item.status] =
        (stats.ticketsByStatus[item.status] || 0) + 1;

      // Satisfaction Ratings
      const score = item.satisfaction_rating?.score;
      if (score) {
        stats.satisfactionRatings[score] =
          (stats.satisfactionRatings[score] || 0) + 1;
      }
    });

    return stats;
  }, [filteredData]);

  // Render summary view
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

  // Render table view
  const renderTableView = () => (
    <div className="rounded-lg bg-white p-4 shadow-md">
      <div className="mb-4 flex space-x-2">
        {/* Priority Filter */}
        <select
          value={filterConfig.priority}
          onChange={(e) => setFilterConfig(prev => ({...prev, priority: e.target.value}))}
          className="rounded border p-2"
        >
          <option value="">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="normal">Normal Priority</option>
          <option value="low">Low Priority</option>
        </select>

        {/* Status Filter */}
        <select
          value={filterConfig.status}
          onChange={(e) => setFilterConfig(prev => ({...prev, status: e.target.value}))}
          className="rounded border p-2"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          {/* Add other statuses as needed */}
        </select>

        {/* Organization Search */}
        <input
          type="text"
          placeholder="Search Organization ID"
          value={filterConfig.organizationSearch}
          onChange={(e) => setFilterConfig(prev => ({...prev, organizationSearch: e.target.value}))}
          className="grow rounded border p-2"
        />
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border bg-gray-100 p-2">ID</th>
            <th className="border bg-gray-100 p-2">Priority</th>
            <th className="border bg-gray-100 p-2">Status</th>
            <th className="border bg-gray-100 p-2">Type</th>
            <th className="border bg-gray-100 p-2">Organization</th>
            <th className="border bg-gray-100 p-2">Subject</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(item => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="border p-2">{item.id}</td>
              <td className={`border p-2 ${
                item.priority.toLowerCase() === 'high' ? 'font-bold text-red-600' :
                item.priority.toLowerCase() === 'normal' ? 'text-yellow-500' :
                'text-green-500'
              }`}>
                {item.priority}
              </td>
              <td className="border p-2">{item.status}</td>
              <td className="border p-2">{item.type}</td>
              <td className="border p-2">{item.organization_id}</td>
              <td className="border p-2">{item.subject}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredData.length === 0 && (
        <div className="py-4 text-center text-gray-500">
          No issues found matching your filters
        </div>
      )}
    </div>
  );

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading data...</div>;
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setView(view === 'table' ? 'summary' : 'table')}
          className="rounded border bg-blue-500 p-2 text-white"
        >
          {view === 'table' ? 'View Summary' : 'View Table'}
        </button>
      </div>

      {view === 'table' ? renderTableView() : renderSummaryView()}
    </div>
  );
};

export default EnhancedDataTable;
