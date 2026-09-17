import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

export interface RadarDataPoint {
  axe: string;
  score: number;
  moyenneEquipe?: number;
  cible?: number;
  fullMark?: number;
}

interface RadarChartCompProps {
  data: RadarDataPoint[];
  collaborateurNom?: string;
  hauteur?: number;
  afficherMoyenneEquipe?: boolean;
}

export const RadarChartComp: React.FC<RadarChartCompProps> = ({
  data,
  collaborateurNom = 'Collaborateur',
  hauteur = 280,
  afficherMoyenneEquipe = true
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-xs text-slate-400 italic">
        Données insuffisantes pour tracer le graphique en toile
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div style={{ width: '100%', height: hauteur }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="axe"
              tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: '#94a3b8', fontSize: 9 }}
            />

            {/* Radar for the Individual */}
            <Radar
              name={collaborateurNom}
              dataKey="score"
              stroke="#2563eb"
              fill="#3b82f6"
              fillOpacity={0.4}
              strokeWidth={2}
            />

            {/* Radar for Team Average */}
            {afficherMoyenneEquipe && (
              <Radar
                name="Moyenne Équipe"
                dataKey="moyenneEquipe"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.15}
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
            )}

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 shadow-lg text-xs">
                      <p className="font-bold text-slate-800 mb-1">
                        {payload[0].payload.axe}
                      </p>
                      {payload.map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4 py-0.5">
                          <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                            <span
                              className="w-2 h-2 rounded-full inline-block"
                              style={{ backgroundColor: entry.color }}
                            />
                            {entry.name} :
                          </span>
                          <span className="font-bold text-slate-900">
                            {Number(entry.value).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              iconType="circle"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
