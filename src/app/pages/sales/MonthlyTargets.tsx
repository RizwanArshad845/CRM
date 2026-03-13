import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Target } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StatCard } from '../../components/shared/StatCard';
import { cls } from '../../styles/classes';
import { useAuth } from '../../context/AuthContext';
import {
  MONTHLY_DATA, LAST_6_MONTHS, SALES_BY_AREA,
  AGENT_TARGETS,
} from '../../data/mockData';

function pctColor(pct: number) {
  if (pct >= 90) return 'text-green-600';
  if (pct >= 70) return 'text-yellow-600';
  return 'text-red-600';
}

const AGENT_NAMES = [...new Set(AGENT_TARGETS.map(t => t.agentName))];

export function MonthlyTargets() {
  const { user } = useAuth();
  const progressPct = Math.round((MONTHLY_DATA.revenueAchieved / MONTHLY_DATA.revenueTarget) * 100);

  // Each agent sees only their own target history
  const myTargets = AGENT_TARGETS.filter(t => t.agentName === user?.name);

  return (
    <div className={cls.page}>
      <div className={cls.gridResponsive2}>
        <StatCard icon={<Target className="h-4 w-4 text-blue-500" />} title="Monthly Target" value={`$${MONTHLY_DATA.revenueTarget.toLocaleString()}`} subtitle="Revenue goal" />
        <StatCard icon={<TrendingUp className="h-4 w-4 text-green-500" />} title="Achieved" value={`$${MONTHLY_DATA.revenueAchieved.toLocaleString()}`} subtitle={`${progressPct}% of target`} valueClassName="text-green-600" />
        <StatCard icon={<TrendingDown className="h-4 w-4 text-orange-500" />} title="Remaining" value={`$${MONTHLY_DATA.revenueLeft.toLocaleString()}`} subtitle={`${100 - progressPct}% left`} valueClassName="text-orange-600" />
        <StatCard icon={<ShoppingCart className="h-4 w-4 text-purple-500" />} title="Total Sales" value={String(MONTHLY_DATA.totalSales)} subtitle="Deals closed" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Progress</CardTitle>
          <CardDescription>Progress towards the monthly revenue target</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cls.list}>
            <div className={cls.row}>
              <span className={cls.label}>Progress</span>
              <span className={cls.metric}>{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-4" />
          </div>
        </CardContent>
      </Card>

      {/* My Target History — last 3 months + current */}
      <Card>
        <CardHeader>
          <CardTitle>My Target History — Last 3 Months</CardTitle>
          <CardDescription>Your personal monthly target vs achieved</CardDescription>
        </CardHeader>
        <CardContent>
          {myTargets.length === 0 ? (
            <p className={cls.hint}>No target data found for your account.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {['Month', 'Target', 'Achieved', '% Hit'].map(h => (
                      <th key={h} className={cls.tableHead}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {myTargets.map(t => {
                    const pct = t.target > 0 ? Math.round((t.achieved / t.target) * 100) : 0;
                    return (
                      <tr key={t.id} className={cls.tableRow}>
                        <td className={`${cls.tableCell} ${cls.heading}`}>{t.month}</td>
                        <td className={`${cls.tableCell} font-mono`}>${t.target.toLocaleString()}</td>
                        <td className={`${cls.tableCell} font-mono`}>{t.achieved > 0 ? `$${t.achieved.toLocaleString()}` : <span className={cls.hint}>—</span>}</td>
                        <td className={cls.tableCell}>
                          {t.achieved > 0
                            ? <span className={`font-bold ${pctColor(pct)}`}>{pct}%</span>
                            : <span className={cls.hint}>In progress</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
