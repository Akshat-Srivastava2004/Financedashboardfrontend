"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Filter, TrendingUp, TrendingDown, Trash2, Edit } from "lucide-react"
import { apiClient, type ExpenseItem } from "@/lib/api"

interface ExpensesProps {
  expenses: ExpenseItem[]
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseItem[]>>
  onExpenseUpdate: () => void
  onBudgetUpdate: () => void
}

export default function Expenses({ expenses, setExpenses, onExpenseUpdate, onBudgetUpdate }: ExpensesProps) {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: 0,
    category: "",
    date: new Date().toISOString().split("T")[0],
    type: "expense" as "income" | "expense",
  })

  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await apiClient.createExpense({
        description: newExpense.description,
        amount: newExpense.amount,
        category: newExpense.category,
        date: newExpense.date,
        type: newExpense.type,
      })

      if (response.success) {
        // Add the new expense to local state
        setExpenses([response.data, ...expenses])

        // Reset form and close modal
        setNewExpense({
          description: "",
          amount: 0,
          category: "",
          date: new Date().toISOString().split("T")[0],
          type: "expense",
        })
        setIsAddExpenseOpen(false)

        // Refresh data
        onExpenseUpdate()
        onBudgetUpdate() // Update budgets since spent amounts may have changed
      }
    } catch (error) {
      console.error("Error saving expense:", error)
      setError("Failed to create expense. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return

    try {
      const response = await apiClient.deleteExpense(expenseId)

      if (response.success) {
        // Remove from local state
        setExpenses(expenses.filter((expense) => expense._id !== expenseId))
        onExpenseUpdate()
        onBudgetUpdate() // Update budgets since spent amounts may have changed
      }
    } catch (error) {
      console.error("Error deleting expense:", error)
      setError("Failed to delete expense. Please try again.")
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Expense Management</h2>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500" onClick={() => setIsAddExpenseOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Add Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Expense/Income</h3>
            <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newExpense.type}
                  onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value as "income" | "expense" })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                  disabled={isLoading}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                  min="0"
                  step="0.01"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsAddExpenseOpen(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-500" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Expense"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Expense Tracking</CardTitle>
          <CardDescription>Monitor and categorize your expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search expenses..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
          <div className="space-y-4">
            {expenses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No expenses recorded yet. Add your first expense!</p>
              </div>
            ) : (
              expenses.map((expense) => (
                <div
                  key={expense._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        expense.type === "income" ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      {expense.type === "income" ? (
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{expense.description}</h3>
                      <p className="text-sm text-gray-600">{expense.category}</p>
                      <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-4">
                    <div>
                      <p
                        className={`text-lg font-bold ${expense.type === "income" ? "text-green-600" : "text-red-600"}`}
                      >
                        {expense.type === "income" ? "+" : "-"}${expense.amount.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExpense(expense._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
