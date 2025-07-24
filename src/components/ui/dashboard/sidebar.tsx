"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DollarSign, Home, Target, Wallet, FileText, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  const navItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "budget", label: "Budget Control", icon: Target },
    { id: "expenses", label: "Expenses", icon: Wallet },
    { id: "reports", label: "Reports", icon: FileText },
  ]

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)

      // Call logout API
      const response = await apiClient.logout()

      if (response.success) {
        // Clear any local storage or session data if needed
        localStorage.clear()
        sessionStorage.clear()

        // Redirect to login page
        router.push("/login")
      }
    } catch (error) {
      console.error("Logout error:", error)
      // Even if API call fails, redirect to login for security
      router.push("/login")
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl border-r border-gray-200 z-40">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800">FinanceFlow</span>
        </div>
      </div>

      <nav className="p-4 space-y-2 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === item.id ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        <Link href="/">
          <Button variant="outline" className="w-full justify-start bg-transparent">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Button variant="ghost" className="w-full justify-start text-gray-600">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </div>
  )
}
