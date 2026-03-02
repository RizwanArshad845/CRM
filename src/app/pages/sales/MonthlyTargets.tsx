import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Target } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StatCard } from '../../components/shared/StatCard';
import { cls } from '../../styles/classes';
import { MONTHLY_DATA, LAST_6_MONTHS, SALES_BY_PRODUCT, SALES_BY_AREA } from '../../data/mockData';

const PERFORMANCE_ITEMS = [
  { icon: <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />, bg: 'bg-blue-100 dark:bg-blue-900', label: 'Total Sales', getValue: () => String(MONTHLY_DATA.totalSales) },
  { icon: <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />, bg: 'bg-green-100 dark:bg-green-900', label: 'Average Deal Size', getValue: () => `$${MONTHLY_DATA.averageDealSize.toLocaleString()}` },
  { icon: <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />, bg: 'bg-purple-100 dark:bg-purple-900', label: 'Conversion Rate', getValue: () => `${MONTHLY_DATA.conversionRate}%` },
  { icon: <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />, bg: 'bg-orange-100 dark:bg-orange-900', label: 'Daily Average', getValue: () => `$${Math.round(MONTHLY_DATA.revenueAchieved / 12).toLocaleString()}` },
];

export function MonthlyTargets() {
  const progressPct = Math.round((MONTHLY_DATA.revenueAchieved / MONTHLY_DATA.revenueTarget) * 100);

  return (
    <div className={cls.page}>
      {/* Summary Cards */}
      <div className={cls.gridResponsive2}>
        <StatCard icon={<Target className="h-4 w-4 text-blue-500" />} title="Monthly Target" value={`$${MONTHLY_DATA.revenueTarget.toLocaleString()}`} subtitle="Revenue goal" />
        <StatCard icon={<TrendingUp className="h-4 w-4 text-green-500" />} title="Achieved" value={`$${MONTHLY_DATA.revenueAchieved.toLocaleString()}`} subtitle={`${progressPct}% of target`} valueClassName="text-green-600" />
        <StatCard icon={<TrendingDown className="h-4 w-4 text-orange-500" />} title="Remaining" value={`$${MONTHLY_DATA.revenueLeft.toLocaleString()}`} subtitle={`${100 - progressPct}% left`} valueClassName="text-orange-600" />
      </div>

      {/* Progress */}
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

      {/* Trend Graph */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={LAST_6_MONTHS}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={v => `$${Number(v).toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#27AE60" strokeWidth={2} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Indicators</CardTitle>
            <CardDescription>Key metrics for this month</CardDescription>
          </CardHeader>
          <CardContent className={cls.section}>
            {PERFORMANCE_ITEMS.map(({ icon, bg, label, getValue }) => (
              <div key={label} className={cls.inline + ' ' + cls.item}>
                <div className={`p-2 ${bg} rounded mr-3`}>{icon}</div>
                <div>
                  <p className={cls.hint}>{label}</p>
                  <p className={cls.metric}>{getValue()}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sales by Product */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Product Type</CardTitle>
            <CardDescription>Distribution across products</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={SALES_BY_PRODUCT} cx="50%" cy="50%" outerRadius={80}
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  dataKey="value"
                >
                  {SALES_BY_PRODUCT.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className={`mt-4 ${cls.list}`}>
              {SALES_BY_PRODUCT.map(item => (
                <div key={item.name} className={`${cls.row} text-sm`}>
                  <div className={cls.inline}>
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className={cls.heading}>{item.value} sales</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales by Area */}
      <Card>
        <CardHeader>
          <CardTitle>Sales by Service Area</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={SALES_BY_AREA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="area" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#27AE60" name="Number of Sales" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
