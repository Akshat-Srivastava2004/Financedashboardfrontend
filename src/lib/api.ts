const API_BASE_URL = "http://localhost:8000/api/v1/users"

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface BudgetItem {
  _id: string
  category: string
  budget: number
  spent: number
  color: string
}

interface ExpenseItem {
  _id: string
  description: string
  amount: number
  category: string
  date: string
  type: "income" | "expense"
}

interface ExpensesResponse {
  expenses: ExpenseItem[]
  totalPages: number
  currentPage: number
  total: number
}

interface OverviewData {
  totalIncome: number
  totalExpenses: number
  netSavings: number
  totalBudget: number
  totalSpent: number
  budgetUsedPercentage: number
  budgets: BudgetItem[]
  recentTransactions: ExpenseItem[]
}

interface ReportData {
  period: {
    startDate: string
    endDate: string
    type: string
  }
  summary: {
    totalIncome: number
    totalExpenses: number
    netSavings: number
  }
  categorySpending: Array<{
    _id: string
    total: number
    count: number
  }>
  monthlyTrend: Array<{
    _id: {
      year: number
      month: number
      type: string
    }
    total: number
  }>
}

// Add these interfaces at the top after the existing interfaces
interface User {
  _id: string
  FirstName: string
  LastName: string
  Email: string
  createdAt: string
  updatedAt: string
}

interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}
interface LogoutResponse {
  message: string
}

interface RegisterResponse {
  user: User
  message: string

}

interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Include cookies
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Auth methods
  async register(userData: {
    FirstName: string
    LastName: string
    Email: string
    Password: string
  }): Promise<ApiResponse<RegisterResponse>> {
    debugger
    return this.request("/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async login(credentials: { Email: string; Password: string }): Promise<ApiResponse<LoginResponse>> {
    return this.request("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }
  async logout(): Promise<ApiResponse<LogoutResponse>> {
    return this.request("/logout", {
      method: "POST",
    })
  }

  // Budget methods
  async getBudgets(): Promise<ApiResponse<BudgetItem[]>> {
    return this.request("/budgets", { method: "GET" })
  }

  async createBudget(budgetData: {
    category: string
    budget: number
    color?: string
  }): Promise<ApiResponse<BudgetItem>> {
    return this.request("/budgets", {
      method: "POST",
      body: JSON.stringify(budgetData),
    })
  }

  async updateBudget(
    budgetId: string,
    budgetData: {
      category: string
      budget: number
      color?: string
    },
  ): Promise<ApiResponse<BudgetItem>> {
    return this.request(`/budgets/${budgetId}`, {
      method: "PUT",
      body: JSON.stringify(budgetData),
    })
  }

  async deleteBudget(budgetId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/budgets/${budgetId}`, {
      method: "DELETE",
    })
  }

  // Expense methods
  async getExpenses(params?: {
    page?: number
    limit?: number
    type?: string
    category?: string
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<ExpensesResponse>> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const endpoint = `/expenses${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    return this.request(endpoint, { method: "GET" })
  }

  async createExpense(expenseData: {
    description: string
    amount: number
    category: string
    date: string
    type: "income" | "expense"
  }): Promise<ApiResponse<ExpenseItem>> {
    return this.request("/expenses", {
      method: "POST",
      body: JSON.stringify(expenseData),
    })
  }

  async updateExpense(
    expenseId: string,
    expenseData: {
      description: string
      amount: number
      category: string
      date: string
      type: "income" | "expense"
    },
  ): Promise<ApiResponse<ExpenseItem>> {
    return this.request(`/expenses/${expenseId}`, {
      method: "PUT",
      body: JSON.stringify(expenseData),
    })
  }

  async deleteExpense(expenseId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/expenses/${expenseId}`, {
      method: "DELETE",
    })
  }

  // Report methods
  async getOverview(params?: {
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<OverviewData>> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value)
        }
      })
    }

    const endpoint = `/overview${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    return this.request(endpoint, { method: "GET" })
  }

  async getReports(params?: {
    period?: "month" | "year" | "custom"
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<ReportData>> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value)
        }
      })
    }

    const endpoint = `/detailed${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    return this.request(endpoint, { method: "GET" })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

// Export types for use in components
export type { BudgetItem, ExpenseItem, OverviewData, ReportData, ExpensesResponse }
