"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Target, PieChart, CreditCard } from "lucide-react"
import { apiClient, type BudgetItem, type ExpenseItem, type OverviewData } from "@/lib/api"

interface OverviewProps {
  budgetData: BudgetItem[]
  expenses: ExpenseItem[]
}

export default function Overview({ budgetData, expenses }: OverviewProps) {
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const response = await apiClient.getOverview()
        if (response.success) {
          setOverviewData(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch overview data:", error)
        // Fallback to calculating from props
        const totalBudget = budgetData.reduce((sum, item) => sum + item.budget, 0)
        const totalSpent = budgetData.reduce((sum, item) => sum + item.spent, 0)
        const totalIncome = expenses.filter((e) => e.type === "income").reduce((sum, e) => sum + e.amount, 0)
        const totalExpenses = expenses.filter((e) => e.type === "expense").reduce((sum, e) => sum + e.amount, 0)

        setOverviewData({
          totalIncome,
          totalExpenses,
          netSavings: totalIncome - totalExpenses,
          totalBudget,
          totalSpent,
          budgetUsedPercentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
          budgets: budgetData,
          recentTransactions: expenses.slice(0, 5),
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchOverviewData()
  }, [budgetData, expenses])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!overviewData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Failed to load overview data</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Income</p>
                <p className="text-3xl font-bold">${overviewData.totalIncome.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-200" />
            </div>
            <div className="mt-4 flex items-center">
              <Badge className="bg-green-400/20 text-green-100">+12.5%</Badge>
              <span className="text-green-100 text-sm ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">Total Expenses</p>
                <p className="text-3xl font-bold">${overviewData.totalExpenses.toLocaleString()}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-200" />
            </div>
            <div className="mt-4 flex items-center">
              <Badge className="bg-red-400/20 text-red-100">-5.2%</Badge>
              <span className="text-red-100 text-sm ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Budget Used</p>
                <p className="text-3xl font-bold">{Math.round(overviewData.budgetUsedPercentage)}%</p>
              </div>
              <Target className="w-8 h-8 text-blue-200" />
            </div>
            <div className="mt-4">
              <Progress value={overviewData.budgetUsedPercentage} className="bg-blue-400/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Savings</p>
                <p className="text-3xl font-bold">${overviewData.netSavings.toLocaleString()}</p>
              </div>
              <PieChart className="w-8 h-8 text-purple-200" />
            </div>
            <div className="mt-4 flex items-center">
              <Badge className="bg-purple-400/20 text-purple-100">+8.3%</Badge>
              <span className="text-purple-100 text-sm ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Budget Overview
          </CardTitle>
          <CardDescription>Track your spending across different categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {overviewData.budgets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No budgets set up yet. Create your first budget to start tracking!</p>
              </div>
            ) : (
              overviewData.budgets.map((item) => (
                <div key={item._id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.category}</span>
                    <span className="text-sm text-gray-600">
                      ${item.spent} / ${item.budget}
                    </span>
                  </div>
                  <div className="relative">
                    <Progress value={(item.spent / item.budget) * 100} className="h-3" />
                    <div
                      className={`absolute top-0 left-0 h-3 rounded-full ${item.color}`}
                      style={{ width: `${Math.min((item.spent / item.budget) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={item.spent > item.budget ? "text-red-600" : "text-green-600"}>
                      {item.spent > item.budget ? "Over budget" : "On track"}
                    </span>
                    <span className="text-gray-500">${Math.max(item.budget - item.spent, 0)} remaining</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Recent Transactions
          </CardTitle>
          <CardDescription>Your latest financial activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {overviewData.recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No transactions yet. Add your first expense or income!</p>
              </div>
            ) : (
              overviewData.recentTransactions.map((expense) => (
                <div key={expense._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        expense.type === "income" ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      {expense.type === "income" ? (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-gray-600">{expense.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${expense.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      {expense.type === "income" ? "+" : "-"}${expense.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">{new Date(expense.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
