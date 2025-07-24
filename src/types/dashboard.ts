// Shared types for the dashboard components
export interface BudgetItem {
  category: string
  budget: number
  spent: number
  color: string
}

export interface ExpenseItem {
  id: number
  description: string
  amount: number
  category: string
  date: string
  type: "income" | "expense"
}

export interface NewExpense {
  description: string
  amount: number
  category: string
  date: string
  type: "income" | "expense"
}

export interface NewBudget {
  category: string
  budget: number
  spent: number
  color: string
}
