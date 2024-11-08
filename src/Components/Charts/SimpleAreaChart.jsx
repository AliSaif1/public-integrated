import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SimpleAreaChart = ({ budgets }) => {
  // Get the current date
  const currentDate = new Date();

  // Prepare month names for the last 6 months
  const monthNames = [];
  for (let i = 0; i < 6; i++) {
    // Get the month name (MMM format)
    const monthStr = currentDate.toLocaleString('default', { month: 'short' });
    monthNames.push(monthStr); // Push the month name to the array

    // Update the month for the next iteration
    currentDate.setMonth(currentDate.getMonth() - 1);
  }

  // Reverse monthNames and budgets to display correctly
  monthNames.reverse();
  budgets.reverse();

  // Prepare data for the chart
  const data = monthNames.map((month, index) => ({
    name: month,  // Month name for the x-axis
    Budget: budgets[index] || 0,  // Budget for the y-axis
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 5,
          right: 5,
          left: 5,
          bottom: 10,
        }}
      >
        <defs>
          <linearGradient id="gradient-1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1E90FF" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#87CEFA" stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
        <XAxis dataKey="name" axisLine={false} tickLine={false} padding={{ left: 30, right: 30 }} />
        <YAxis axisLine={false} tickLine={false} tickCount={5} />
        <Tooltip />
        <Area type="monotone" dataKey="Budget" stroke="#0A9B21" fill="url(#gradient-1)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default SimpleAreaChart;