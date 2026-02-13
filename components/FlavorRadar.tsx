import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { FlavorProfile } from '../types';

interface FlavorRadarProps {
  flavor: FlavorProfile;
  readOnly?: boolean;
}

const FlavorRadar: React.FC<FlavorRadarProps> = ({ flavor }) => {
  const data = [
    { subject: '酸度', A: flavor.acidity, fullMark: 5 },
    { subject: '苦味', A: flavor.bitterness, fullMark: 5 },
    { subject: '焙度', A: flavor.roast, fullMark: 5 },
    { subject: '甜感', A: flavor.sweetness, fullMark: 5 },
  ];

  return (
    <div style={{ width: '100%', height: '14rem', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '0.5rem', padding: '0.5rem' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#8D6E63" strokeOpacity={0.3} />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#5D4037', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
          <Radar
            name="Flavor"
            dataKey="A"
            stroke="#5D4037"
            strokeWidth={2}
            fill="#5D4037"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FlavorRadar;