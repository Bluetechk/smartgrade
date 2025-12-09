import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  Search, 
  Bell, 
  HelpCircle,
  Menu,
  ChevronDown,
  Moon,
  Sun,
  Home,
  FileText,
  Settings
} from "lucide-react";
import { useTheme } from "next-themes";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell
} from "recharts";

// Sample data for charts
const enrollmentData = [
  { year: "2021", All: 2000, Grade: 500, Rewed: 300, "Bb-2": 200, final: 100 },
  { year: "2022", All: 2200, Grade: 550, Rewed: 350, "Bb-2": 250, final: 150 },
  { year: "2023", All: 2400, Grade: 600, Rewed: 400, "Bb-2": 300, final: 200 },
  { year: "2024", All: 2500, Grade: 650, Rewed: 450, "Bb-2": 350, final: 250 },
  { year: "2025", All: 2450, Grade: 600, Rewed: 400, "Bb-2": 300, final: 200 },
];

const attendanceData = [
  { month: "Jan", attendance: 92 },
  { month: "Feb", attendance: 94 },
  { month: "Mar", attendance: 93 },
  { month: "Apr", attendance: 95 },
  { month: "May", attendance: 94 },
  { month: "Jun", attendance: 96 },
  { month: "Jul", attendance: 93 },
  { month: "Aug", attendance: 95 },
  { month: "Sep", attendance: 94 },
  { month: "Oct", attendance: 96 },
  { month: "Nov", attendance: 95 },
  { month: "Dec", attendance: 94 },
];

const demographicsData = [
  { name: "Black", value: 57, color: "#3b82f6" },
  { name: "China", value: 30, color: "#10b981" },
  { name: "Germany", value: 17, color: "#f59e0b" },
  { name: "Putin", value: 1, color: "#94a3b8" },
];

const performanceData = [
  { month: "Jan", Excellent: 150000, Good: 100000, Average: 50000 },
  { month: "Feb", Excellent: 160000, Good: 110000, Average: 60000 },
  { month: "Mar", Excellent: 155000, Good: 105000, Average: 55000 },
  { month: "Apr", Excellent: 170000, Good: 120000, Average: 70000 },
  { month: "May", Excellent: 165000, Good: 115000, Average: 65000 },
  { month: "Jun", Excellent: 180000, Good: 130000, Average: 80000 },
  { month: "Jul", Excellent: 175000, Good: 125000, Average: 75000 },
  { month: "Aug", Excellent: 190000, Good: 140000, Average: 90000 },
  { month: "Sep", Excellent: 185000, Good: 135000, Average: 85000 },
  { month: "Oct", Excellent: 200000, Good: 150000, Average: 100000 },
  { month: "Nov", Excellent: 195000, Good: 145000, Average: 95000 },
  { month: "Dec", Excellent: 210000, Good: 160000, Average: 110000 },
];

const StatisticalDashboard = () => {
  const { theme, setTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#94a3b8"];

  // Chart configuration
  const chartConfig = {
    All: { label: "All", color: "#3b82f6" },
    Grade: { label: "Grade", color: "#60a5fa" },
    Rewed: { label: "Rewed", color: "#10b981" },
    "Bb-2": { label: "Bb-2", color: "#f59e0b" },
    final: { label: "final", color: "#059669" },
    attendance: { label: "Attendance", color: "#3b82f6" },
    Excellent: { label: "Excellent", color: "#3b82f6" },
    Good: { label: "Good", color: "#10b981" },
    Average: { label: "Average", color: "#f59e0b" },
    Black: { label: "Black", color: "#3b82f6" },
    China: { label: "China", color: "#10b981" },
    Germany: { label: "Germany", color: "#f59e0b" },
    Putin: { label: "Putin", color: "#94a3b8" },
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-blue-900 text-white shadow-lg"
        aria-label="Toggle menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} fixed md:static inset-y-0 left-0 z-40 bg-blue-900 dark:bg-blue-950 text-white transition-all duration-200 flex flex-col flex-shrink-0`}>
        {/* Branding */}
        <div className="p-4 border-b border-blue-800 dark:border-blue-900">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-6 h-6 text-white" />
            {!sidebarCollapsed && <span className="text-lg font-bold">School</span>}
          </div>
        </div>

        {/* Hamburger Menu */}
        <div className="p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:block p-2 rounded hover:bg-blue-800 dark:hover:bg-blue-900 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-2 rounded hover:bg-blue-800 dark:hover:bg-blue-900 transition-colors"
            aria-label="Close menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          <NavItem icon={Home} label="Dashboard" active={false} collapsed={sidebarCollapsed} />
          <NavItem icon={FileText} label="Reports" active={false} collapsed={sidebarCollapsed} />
          <NavItem icon={Users} label="Students" active={true} collapsed={sidebarCollapsed} />
          <NavItem icon={Users} label="Staff" active={false} collapsed={sidebarCollapsed} />
          <NavItem icon={GraduationCap} label="Academics" active={false} collapsed={sidebarCollapsed} />
          <NavItem icon={FileText} label="Reports" active={false} collapsed={sidebarCollapsed} />
          <NavItem icon={Settings} label="Settings" active={false} collapsed={sidebarCollapsed} />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search"
                  className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 w-full"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Toggle theme"
              >
                {mounted && theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative" aria-label="Help">
                <HelpCircle className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative" aria-label="Notifications">
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-semibold">4</span>
              </button>
              <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                <AvatarFallback className="bg-blue-600 text-white text-xs sm:text-sm">AU</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 sm:p-6 bg-slate-50 dark:bg-slate-900 overflow-x-hidden">
          {/* Title and Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Statistical Admin Dashboard</h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-slate-800">
                  <SelectValue placeholder="All Lisse Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Lisse Years</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
                + Create a Filtory
              </Button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard
              title="Total Students"
              value="2,450"
              icon={Users}
              color="bg-blue-500"
            />
            <MetricCard
              title="Active Staff"
              value="180"
              icon={Users}
              color="bg-green-500"
            />
            <MetricCard
              title="Avg. Attendance"
              value="94.5%"
              icon={Calendar}
              color="bg-orange-500"
            />
            <MetricCard
              title="Avg. GPA"
              value="3.2"
              icon={GraduationCap}
              color="bg-amber-700"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            {/* Enrollment by Grade Level */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 overflow-hidden">
              <CardHeader className="pb-1 pt-3 px-4">
                <CardTitle className="text-sm sm:text-base text-slate-900 dark:text-white break-words">Enrollment by Grade Level (Last 5 Years)</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto px-4 pb-3">
                <div className="min-w-0 w-full">
                  <ChartContainer config={chartConfig} className="h-[180px] sm:h-[200px] w-full">
                    <BarChart data={enrollmentData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <CartesianGrid stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="All" stackId="a" fill="#3b82f6" />
                      <Bar dataKey="Grade" stackId="a" fill="#60a5fa" />
                      <Bar dataKey="Rewed" stackId="a" fill="#10b981" />
                      <Bar dataKey="Bb-2" stackId="a" fill="#f59e0b" />
                      <Bar dataKey="final" stackId="a" fill="#059669" />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Attendance Trends */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 overflow-hidden">
              <CardHeader className="pb-1 pt-3 px-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <CardTitle className="text-sm sm:text-base text-slate-900 dark:text-white break-words">Monthly Attendance Trends</CardTitle>
                  <Select defaultValue="5">
                    <SelectTrigger className="w-full sm:w-[140px] bg-white dark:bg-slate-700">
                      <SelectValue placeholder="Last 5 Month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Last 5 Month</SelectItem>
                      <SelectItem value="12">Last 12 Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto px-4 pb-3">
                <div className="min-w-0 w-full">
                  <ChartContainer config={chartConfig} className="h-[180px] sm:h-[200px] w-full">
                    <LineChart data={attendanceData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <CartesianGrid stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: "Attendance", angle: -90, position: "insideLeft", style: { fontSize: '11px' } }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            {/* Student Demographics */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 overflow-hidden">
              <CardHeader className="pb-1 pt-3 px-4">
                <CardTitle className="text-sm sm:text-base text-slate-900 dark:text-white break-words">Student Demographics (Ethnicity)</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto px-4 pb-3">
                <div className="min-w-0 w-full">
                  <div className="flex items-center justify-center mb-3">
                    <ChartContainer config={chartConfig} className="h-[180px] sm:h-[200px] w-full max-w-md">
                      <PieChart>
                        <Pie
                          data={demographicsData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${value}%`}
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {demographicsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                  </div>
                  <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
                    {demographicsData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                        <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Performance by Subject */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 overflow-hidden">
              <CardHeader className="pb-1 pt-3 px-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <CardTitle className="text-sm sm:text-base text-slate-900 dark:text-white break-words">Academic Performance by Subject</CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full sm:w-[120px] bg-white dark:bg-slate-700">
                        <SelectValue placeholder="All Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subject</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full sm:w-[120px] bg-white dark:bg-slate-700">
                        <SelectValue placeholder="All Years" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto px-4 pb-3">
                <div className="min-w-0 w-full">
                  <ChartContainer config={chartConfig} className="h-[180px] sm:h-[200px] w-full">
                    <BarChart data={performanceData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <CartesianGrid stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: "Pricient", angle: -90, position: "insideLeft", style: { fontSize: '11px' } }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="Excellent" stackId="a" fill="#3b82f6" />
                      <Bar dataKey="Good" stackId="a" fill="#10b981" />
                      <Bar dataKey="Average" stackId="a" fill="#f59e0b" />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active, collapsed }: { icon: any; label: string; active: boolean; collapsed: boolean }) => {
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active
          ? "bg-blue-700 dark:bg-blue-800 text-white"
          : "text-blue-100 hover:bg-blue-800 dark:hover:bg-blue-900"
      } ${collapsed ? "justify-center" : ""}`}
    >
      <Icon className="w-5 h-5" />
      {!collapsed && <span className="font-medium">{label}</span>}
    </button>
  );
};

const MetricCard = ({ title, value, icon: Icon, color }: { title: string; value: string; icon: any; color: string }) => {
  return (
    <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm overflow-hidden">
      <CardContent className="pt-4 sm:pt-4 pb-4 sm:pb-4 px-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1 truncate">{title}</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate">{value}</p>
          </div>
          <div className={`${color} p-2 sm:p-3 rounded-lg flex-shrink-0`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticalDashboard;

