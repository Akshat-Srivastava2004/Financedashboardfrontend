"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Download, TrendingUp, TrendingDown, PieChart } from "lucide-react"
import { apiClient, type BudgetItem, type ExpenseItem, type ReportData } from "@/lib/api"

interface ReportsProps {
  budgetData: BudgetItem[]
  expenses: ExpenseItem[]
}

export default function Reports({ budgetData, expenses }: ReportsProps) {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<"month" | "year" | "custom">("month")

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.getReports({ period: selectedPeriod })
        if (response.success) {
          setReportData(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch report data:", error)
        // Fallback to calculating from props
        const totalIncome = expenses.filter((e) => e.type === "income").reduce((sum, e) => sum + e.amount, 0)
        const totalExpenses = expenses.filter((e) => e.type === "expense").reduce((sum, e) => sum + e.amount, 0)

        setReportData({
          period: {
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            type: selectedPeriod,
          },
          summary: {
            totalIncome,
            totalExpenses,
            netSavings: totalIncome - totalExpenses,
          },
          categorySpending: [],
          monthlyTrend: [],
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReportData()
  }, [selectedPeriod, budgetData, expenses])

  const handleGenerateReport = async () => {
    // In a real app, this would generate and download a PDF report
    alert("Report generation feature coming soon!")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Failed to load report data</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Financial Reports</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as "month" | "year" | "custom")}
            className="px-3 py-2 border rounded-md"
          >
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500" onClick={handleGenerateReport}>
            <Download className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
            <CardDescription>Your financial performance this {selectedPeriod}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-green-600">Total Income</p>
                  <p className="text-2xl font-bold text-green-700">
                    ${reportData.summary.totalIncome.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm text-red-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-700">
                    ${reportData.summary.totalExpenses.toLocaleString()}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-blue-600">Net Savings</p>
                  <p className="text-2xl font-bold text-blue-700">${reportData.summary.netSavings.toLocaleString()}</p>
                </div>
                <PieChart className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending Analysis</CardTitle>
            <CardDescription>Breakdown of your expenses by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.categorySpending.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No spending data available for this period</p>
                </div>
              ) : (
                reportData.categorySpending.map((item, index) => {
                  const totalSpending = reportData.categorySpending.reduce((sum, cat) => sum + cat.total, 0)
                  const percentage = totalSpending > 0 ? Math.round((item.total / totalSpending) * 100) : 0

                  return (
                    <div key={item._id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-4 h-4 rounded-full bg-${["blue", "green", "purple", "orange", "red", "yellow"][index % 6]}-500`}
                        ></div>
                        <span className="font-medium">{item._id}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${item.total.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{percentage}%</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Goals</CardTitle>
          <CardDescription>Track your progress towards financial objectives</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Emergency Fund</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>$2,500 / $5,000</span>
                </div>
                <Progress value={50} />
                <p className="text-xs text-gray-600">50% complete</p>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Vacation Fund</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>$800 / $2,000</span>
                </div>
                <Progress value={40} />
                <p className="text-xs text-gray-600">40% complete</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
