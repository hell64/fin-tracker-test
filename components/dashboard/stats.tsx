"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  PieChartIcon,
  BarChart3,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  getMonthlyData,
  getCategoryData,
  getBudgetData,
  getRecentTransactions,
  getSummaryData,
  type MonthlyData,
  type CategoryData,
  type BudgetData,
  type TransactionData,
  type SummaryData,
} from "@/app/actions/analitics";
import {
  SummaryCardSkeleton,
  ChartSkeleton,
  TransactionSkeleton,
} from "@/components/loading-skeleton";

const chartConfig = {
  income: {
    label: "Доходи",
    color: "hsl(var(--chart-1))",
  },
  expense: {
    label: "Витрати",
    color: "hsl(var(--chart-2))",
  },
  budget: {
    label: "Бюджет",
    color: "hsl(var(--chart-3))",
  },
  actual: {
    label: "Фактично",
    color: "hsl(var(--chart-4))",
  },
};

interface DashboardProps {
  userId?: string;
}

export default function Dashboard({ userId = "demo-user" }: DashboardProps) {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [budgetData, setBudgetData] = useState<BudgetData[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<
    TransactionData[]
  >([]);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);

  const [loading, setLoading] = useState({
    summary: true,
    monthly: true,
    category: true,
    budget: true,
    transactions: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch summary data
        const summary = await getSummaryData(userId);
        setSummaryData(summary);
        setLoading((prev) => ({ ...prev, summary: false }));

        // Fetch monthly data
        const monthly = await getMonthlyData(userId);
        setMonthlyData(monthly);
        setLoading((prev) => ({ ...prev, monthly: false }));

        // Fetch category data
        const category = await getCategoryData(userId);
        setCategoryData(category);
        setLoading((prev) => ({ ...prev, category: false }));

        // Fetch budget data
        const budget = await getBudgetData(userId);
        setBudgetData(budget);
        setLoading((prev) => ({ ...prev, budget: false }));

        // Fetch recent transactions
        const transactions = await getRecentTransactions(userId);
        setRecentTransactions(transactions);
        setLoading((prev) => ({ ...prev, transactions: false }));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Set all loading states to false on error
        setLoading({
          summary: false,
          monthly: false,
          category: false,
          budget: false,
          transactions: false,
        });
      }
    };

    fetchData();
  }, [userId]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-200">
              Фінансовий дашборд
            </h1>
            <p className="text-gray-600">
              Огляд ваших фінансів за останні 6 місяців
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {loading.summary ? (
            Array.from({ length: 4 }).map((_, i) => (
              <SummaryCardSkeleton key={i} />
            ))
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Загальний баланс
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {summaryData?.balance.toLocaleString("uk-UA")} ₴
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {summaryData?.balance && summaryData?.totalIncome ? (
                      <>
                        {summaryData.balance > 0 ? "+" : ""}
                        {(
                          (summaryData.balance / summaryData.totalIncome) *
                          100
                        ).toFixed(1)}
                        % від доходів
                      </>
                    ) : (
                      "Немає даних"
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Загальні доходи
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {summaryData?.totalIncome.toLocaleString("uk-UA")} ₴
                  </div>
                  <p className="text-xs text-muted-foreground">За 6 місяців</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Загальні витрати
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {summaryData?.totalExpense.toLocaleString("uk-UA")} ₴
                  </div>
                  <p className="text-xs text-muted-foreground">За 6 місяців</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Транзакцій
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {summaryData?.transactionCount}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    За поточний місяць
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income vs Expense Trend */}
          {loading.monthly ? (
            <ChartSkeleton />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Тренд доходів та витрат
                </CardTitle>
                <CardDescription>
                  Порівняння доходів і витрат по місяцях
                </CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="income"
                        stroke="var(--color-income)"
                        strokeWidth={3}
                        dot={{ fill: "var(--color-income)" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="expense"
                        stroke="var(--color-expense)"
                        strokeWidth={3}
                        dot={{ fill: "var(--color-expense)" }}
                      />
                    </LineChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Немає даних для відображення
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Category Distribution */}
          {loading.category ? (
            <ChartSkeleton />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Витрати по категоріях
                </CardTitle>
                <CardDescription>
                  Розподіл витрат за категоріями
                </CardDescription>
              </CardHeader>
              <CardContent>
                {categoryData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(name, value) => [`${name} - ${value}`]}
                          />
                        }
                      />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Немає даних для відображення
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Budget vs Actual */}
          {loading.budget ? (
            <ChartSkeleton />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Бюджет vs Фактичні витрати</CardTitle>
                <CardDescription>
                  Порівняння запланованого бюджету з фактичними витратами
                </CardDescription>
              </CardHeader>
              <CardContent>
                {budgetData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <BarChart data={budgetData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="budget"
                        fill="var(--color-budget)"
                        radius={4}
                      />
                      <Bar
                        dataKey="actual"
                        fill="var(--color-actual)"
                        radius={4}
                      />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Немає бюджетів для відображення
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Transactions */}
          {loading.transactions ? (
            <TransactionSkeleton />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Останні транзакції</CardTitle>
                <CardDescription>Нещодавні фінансові операції</CardDescription>
              </CardHeader>
              <CardContent>
                {recentTransactions.length > 0 ? (
                  <div className="space-y-4">
                    {recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">
                            {transaction.description || "Без опису"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {transaction.category || "Без категорії"} •{" "}
                            {new Date(transaction.date).toLocaleDateString(
                              "uk-UA"
                            )}
                          </p>
                        </div>
                        <div
                          className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                        >
                          {transaction.type === "income" ? "+" : ""}
                          {transaction.amount.toLocaleString("uk-UA")} ₴
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    Немає транзакцій для відображення
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Category Performance */}
        {/* {loading.category ? (
          <ChartSkeleton />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Детальна аналітика категорій</CardTitle>
              <CardDescription>
                Витрати по категоріях з відсотковим розподілом
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <BarChart data={categoryData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => [`${value} ₴`, "Витрати"]}
                        />
                      }
                    />
                    <Bar
                      dataKey="value"
                      fill="hsl(var(--chart-1))"
                      radius={4}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  Немає даних для відображення
                </div>
              )}
            </CardContent>
          </Card>
        )} */}
      </div>
    </div>
  );
}
