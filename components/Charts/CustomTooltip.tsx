interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string | number;
  }
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white p-3 rounded-md border shadow-md">
          <p className="label">{`Year: ${label}`}</p> {/* Display the year */}
          <ul className="list">
            {payload.map((entry, index) => (
              <li key={`item-${index}`} style={{ color: entry.color }}>
              <span>{entry.name}:</span> 
              <span style={{ color: 'black', marginLeft: '5px' }}>
                {entry.value.toLocaleString()+" ฿"}
              </span>
            </li>
            ))}
          </ul>
        </div>
      );
    }
  
    return null;
  };

  export default CustomTooltip;