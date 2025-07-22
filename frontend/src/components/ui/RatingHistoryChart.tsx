interface RatingPoint {
  date: string;
  rating: number;
  recipeName: string;
  recipeId: string;
}

interface RatingHistoryChartProps {
  data: RatingPoint[];
  height?: number;
  showTrend?: boolean;
  interactive?: boolean;
}

export default function RatingHistoryChart({ 
  data, 
  height = 200, 
  showTrend = true, 
  interactive = true 
}: RatingHistoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No rating history available</p>
      </div>
    );
  }

  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate chart dimensions
  const padding = 40;
  const width = 400;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);

  // Get min/max values
  const minRating = Math.min(...sortedData.map(d => d.rating));
  const maxRating = Math.max(...sortedData.map(d => d.rating));
  const ratingRange = Math.max(maxRating - minRating, 2); // Minimum range of 2

  const minDate = new Date(sortedData[0].date).getTime();
  const maxDate = new Date(sortedData[sortedData.length - 1].date).getTime();
  const dateRange = maxDate - minDate || 1;

  // Scale functions
  const scaleX = (date: string) => {
    const timestamp = new Date(date).getTime();
    return ((timestamp - minDate) / dateRange) * chartWidth;
  };

  const scaleY = (rating: number) => {
    return chartHeight - (((rating - minRating + 1) / (ratingRange + 2)) * chartHeight);
  };

  // Generate path for line chart
  const pathData = sortedData
    .map((point, index) => {
      const x = scaleX(point.date);
      const y = scaleY(point.rating);
      return `${index === 0 ? 'M' : 'L'} ${x + padding} ${y + padding}`;
    })
    .join(' ');

  // Calculate trend line (simple linear regression)
  const getTrendLine = () => {
    if (!showTrend || sortedData.length < 2) return null;

    const n = sortedData.length;
    const sumX = sortedData.reduce((sum, _, i) => sum + i, 0);
    const sumY = sortedData.reduce((sum, d) => sum + d.rating, 0);
    const sumXY = sortedData.reduce((sum, d, i) => sum + (i * d.rating), 0);
    const sumXX = sortedData.reduce((sum, _, i) => sum + (i * i), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const startY = intercept;
    const endY = slope * (n - 1) + intercept;

    const x1 = scaleX(sortedData[0].date) + padding;
    const y1 = scaleY(startY) + padding;
    const x2 = scaleX(sortedData[n - 1].date) + padding;
    const y2 = scaleY(endY) + padding;

    return { x1, y1, x2, y2, slope };
  };

  const trendLine = getTrendLine();

  // Get rating color
  const getRatingColor = (rating: number) => {
    if (rating >= 8.5) return 'fill-green-500 stroke-green-600';
    if (rating >= 7) return 'fill-blue-500 stroke-blue-600';
    if (rating >= 5.5) return 'fill-yellow-500 stroke-yellow-600';
    if (rating >= 4) return 'fill-orange-500 stroke-orange-600';
    return 'fill-red-500 stroke-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Rating History
        </h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Ratings</span>
          </div>
          {trendLine && (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-red-400"></div>
              <span>Trend ({trendLine.slope > 0 ? '↗' : trendLine.slope < 0 ? '↘' : '→'})</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <svg width={width} height={height} className="overflow-visible">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
              <path 
                d="M 40 0 L 0 0 0 30" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="0.5" 
                className="text-gray-300 dark:text-gray-600"
              />
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#grid)" />

          {/* Y-axis labels */}
          {[1, 3, 5, 7, 9, 10].map((rating) => (
            <g key={rating}>
              <line
                x1={padding - 5}
                y1={scaleY(rating) + padding}
                x2={padding}
                y2={scaleY(rating) + padding}
                stroke="currentColor"
                strokeWidth="1"
                className="text-gray-400 dark:text-gray-500"
              />
              <text
                x={padding - 10}
                y={scaleY(rating) + padding + 4}
                textAnchor="end"
                className="text-xs fill-current text-gray-600 dark:text-gray-400"
              >
                {rating}
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {sortedData.length > 1 && [0, Math.floor(sortedData.length / 2), sortedData.length - 1].map((index) => (
            <text
              key={index}
              x={scaleX(sortedData[index].date) + padding}
              y={height - 10}
              textAnchor="middle"
              className="text-xs fill-current text-gray-600 dark:text-gray-400"
            >
              {formatDate(sortedData[index].date)}
            </text>
          ))}

          {/* Trend line */}
          {trendLine && (
            <line
              x1={trendLine.x1}
              y1={trendLine.y1}
              x2={trendLine.x2}
              y2={trendLine.y2}
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4,4"
              className="text-red-400 dark:text-red-400"
              opacity="0.7"
            />
          )}

          {/* Rating line */}
          {sortedData.length > 1 && (
            <path
              d={pathData}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-500 dark:text-blue-400"
            />
          )}

          {/* Rating points */}
          {sortedData.map((point, index) => (
            <g key={index}>
              <circle
                cx={scaleX(point.date) + padding}
                cy={scaleY(point.rating) + padding}
                r="6"
                className={getRatingColor(point.rating)}
                strokeWidth="2"
              />
              {interactive && (
                <circle
                  cx={scaleX(point.date) + padding}
                  cy={scaleY(point.rating) + padding}
                  r="12"
                  fill="transparent"
                  className="cursor-pointer hover:fill-blue-100 dark:hover:fill-blue-900"
                  title={`${point.recipeName}: ${point.rating}/10 on ${formatDate(point.date)}`}
                />
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Statistics */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {Math.max(...sortedData.map(d => d.rating)).toFixed(1)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Highest</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {(sortedData.reduce((sum, d) => sum + d.rating, 0) / sortedData.length).toFixed(1)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Average</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {Math.min(...sortedData.map(d => d.rating)).toFixed(1)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Lowest</div>
        </div>
      </div>

      {/* Trend insight */}
      {trendLine && (
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {trendLine.slope > 0.1 ? (
              <span className="text-green-600 dark:text-green-400">
                📈 Your ratings are trending upward! Your coffee skills are improving.
              </span>
            ) : trendLine.slope < -0.1 ? (
              <span className="text-orange-600 dark:text-orange-400">
                📉 Your ratings are trending downward. Consider reviewing your recent recipes.
              </span>
            ) : (
              <span className="text-blue-600 dark:text-blue-400">
                📊 Your ratings are consistent. You have stable brewing skills.
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

// Sample data generator for testing
export const generateSampleRatingData = (): RatingPoint[] => {
  const recipes = [
    'Ethiopian Yirgacheffe',
    'Colombian Huila',
    'Guatemalan Antigua',
    'Kenyan AA',
    'Brazilian Santos',
    'Costa Rican Tarrazú'
  ];

  const data: RatingPoint[] = [];
  const today = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (11 - i) * 7); // Weekly intervals

    data.push({
      date: date.toISOString().split('T')[0],
      rating: 5 + Math.random() * 4 + Math.sin(i * 0.5) * 0.5, // 5-9 range with some variation
      recipeName: recipes[i % recipes.length],
      recipeId: `recipe-${i}`
    });
  }

  return data;
};