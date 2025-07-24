"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/ui/dashboard/sidebar"
import Overview from "@/components/ui/dashboard/overview"
import Budget from "@/components/ui/dashboard/budget"
import Expenses from "@/components/ui/dashboard/expenses"
import Reports from "@/components/ui/dashboard/report"
import { Button } from "@/components/ui/button"
import { Bell, Download } from "lucide-react"
import { apiClient, type BudgetItem, type ExpenseItem } from "@/lib/api"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [budgetData, setBudgetData] = useState<BudgetItem[]>([])
  const [expenses, setExpenses] = useState<ExpenseItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch budgets and expenses in parallel
        const [budgetsResponse, expensesResponse] = await Promise.all([
          apiClient.getBudgets(),
          apiClient.getExpenses({ limit: 100 }),
        ])

        if (budgetsResponse.success) {
          setBudgetData(budgetsResponse.data)
        }

        if (expensesResponse.success) {
          setExpenses(expensesResponse.data.expenses)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
        setError("Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Function to refresh budget data
  const refreshBudgets = async () => {
    try {
      const response = await apiClient.getBudgets()
      if (response.success) {
        setBudgetData(response.data)
      }
    } catch (error) {
      console.error("Failed to refresh budgets:", error)
    }
  }

  // Function to refresh expense data
  const refreshExpenses = async () => {
    try {
      const response = await apiClient.getExpenses({ limit: 100 })
      if (response.success) {
        setExpenses(response.data.expenses)
      }
    } catch (error) {
      console.error("Failed to refresh expenses:", error)
    }
  }

  const renderActiveTab = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      )
    }

    switch (activeTab) {
      case "overview":
        return <Overview budgetData={budgetData} expenses={expenses} />
      case "budget":
        return <Budget budgetData={budgetData} setBudgetData={setBudgetData} onBudgetUpdate={refreshBudgets} />
      case "expenses":
        return (
          <Expenses
            expenses={expenses}
            setExpenses={setExpenses}
            onExpenseUpdate={refreshExpenses}
            onBudgetUpdate={refreshBudgets}
          />
        )
      case "reports":
        return <Reports budgetData={budgetData} expenses={expenses} />
      default:
        return <Overview budgetData={budgetData} expenses={expenses} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Financial Dashboard</h1>
            <p className="text-gray-600">Welcome to your finance dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {renderActiveTab()}
      </div>
    </div>
  )
}