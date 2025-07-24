"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Plus, Trash2, Edit } from "lucide-react"
import { apiClient, type BudgetItem } from "@/lib/api"

interface BudgetProps {
  budgetData: BudgetItem[]
  setBudgetData: (data: BudgetItem[]) => void
  onBudgetUpdate: () => void
}

export default function Budget({ budgetData, setBudgetData, onBudgetUpdate }: BudgetProps) {
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [newBudget, setNewBudget] = useState({
    category: "",
    budget: 0,
    color: `bg-${["blue", "green", "purple", "orange", "red", "yellow", "indigo", "pink"][Math.floor(Math.random() * 8)]}-500`,
  })

  const handleAddBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await apiClient.createBudget({
        category: newBudget.category,
        budget: newBudget.budget,
        color: newBudget.color,
      })

      if (response.success) {
        // Add the new budget to local state
        setBudgetData([...budgetData, response.data])

        // Reset form and close modal
        setNewBudget({
          category: "",
          budget: 0,
          color: `bg-${["blue", "green", "purple", "orange", "red", "yellow", "indigo", "pink"][Math.floor(Math.random() * 8)]}-500`,
        })
        setIsAddBudgetOpen(false)

        // Refresh budget data
        onBudgetUpdate()
      }
    } catch (error) {
      console.error("Error saving budget:", error)
      setError("Failed to create budget. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBudget = async (budgetId: string) => {
    if (!confirm("Are you sure you want to delete this budget?")) return

    try {
      const response = await apiClient.deleteBudget(budgetId)

      if (response.success) {
        // Remove from local state
        setBudgetData(budgetData.filter((budget) => budget._id !== budgetId))
        onBudgetUpdate()
      }
    } catch (error) {
      console.error("Error deleting budget:", error)
      setError("Failed to delete budget. Please try again.")
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Budget Management</h2>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500" onClick={() => setIsAddBudgetOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Budget Category
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Add Budget Category Modal */}
      {isAddBudgetOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Budget Category</h3>
            <form onSubmit={handleAddBudgetSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={newBudget.category}
                  onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Amount ($)</label>
                <input
                  type="number"
                  value={newBudget.budget}
                  onChange={(e) => setNewBudget({ ...newBudget, budget: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                  min="0"
                  step="0.01"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsAddBudgetOpen(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-500" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Budget Categories</CardTitle>
            <CardDescription>Manage your spending limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {budgetData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No budgets created yet. Add your first budget category!</p>
              </div>
            ) : (
              budgetData.map((item) => (
                <div key={item._id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{item.category}</h3>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBudget(item._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Spent: ${item.spent}</span>
                      <span>Budget: ${item.budget}</span>
                    </div>
                    <Progress value={(item.spent / item.budget) * 100} />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{Math.round((item.spent / item.budget) * 100)}% used</span>
                      <span>${item.budget - item.spent} left</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Insights</CardTitle>
            <CardDescription>AI-powered recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                <span className="font-medium text-yellow-800">Budget Alert</span>
              </div>
              <p className="text-sm text-yellow-700">
                You re approaching your Entertainment budget limit. Consider reducing spending in this category.
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="font-medium text-green-800">Great Job!</span>
              </div>
              <p className="text-sm text-green-700">
                You re under budget in Transportation this month. Keep up the good work!
              </p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span className="font-medium text-blue-800">Suggestion</span>
              </div>
              <p className="text-sm text-blue-700">
                Based on your spending patterns, consider increasing your Food & Dining budget by $100.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
