import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, BarChart3, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const GradingShowcase = () => {
  const sampleData = {
    periods: ["P1", "P2", "P3", "P4", "P5", "P6"],
    subjects: [
      { name: "Mathematics", scores: [85, 88, 92, 87, 90, 93], status: "excellent" },
      { name: "English", scores: [78, 82, 85, 88, 86, 89], status: "good" },
      { name: "Science", scores: [92, 90, 88, 91, 94, 95], status: "excellent" },
    ]
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 80) return "bg-blue-100 text-blue-800";
    if (score >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <section className="py-24 bg-white">
      <div className="container px-4 mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Comprehensive Grading System
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Track performance across six grading periods with real-time analytics and automated rankings
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sample Grade Table */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Trophy className="w-5 h-5 text-blue-600" />
                  Cody Fisher - Period 3 Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-200 bg-slate-50">
                        <th className="text-left py-4 px-4 font-semibold text-slate-700">Subject</th>
                        {sampleData.periods.map((period) => (
                          <th key={period} className="text-center py-4 px-2 font-semibold text-slate-700">
                            {period}
                          </th>
                        ))}
                        <th className="text-center py-4 px-2 font-semibold text-slate-700">Avg</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleData.subjects.map((subject, idx) => {
                        const avg = Math.round(subject.scores.reduce((a, b) => a + b) / subject.scores.length);
                        return (
                          <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4 font-semibold text-slate-900">{subject.name}</td>
                            {subject.scores.map((score, scoreIdx) => (
                              <td key={scoreIdx} className="text-center py-4 px-2">
                                <Badge className={`${getScoreBadgeColor(score)} border-0 font-semibold`}>
                                  {score}
                                </Badge>
                              </td>
                            ))}
                            <td className="text-center py-4 px-2 font-bold text-slate-900">{avg}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-200">
                  <div className="text-center">
                    <div className="text-slate-600 text-sm mb-1">Total Subjects</div>
                    <div className="text-3xl font-bold text-slate-900">14</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-600 text-sm mb-1">Class Average</div>
                    <div className="text-3xl font-bold text-slate-900">88.5%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-600 text-sm mb-1">Class Rank</div>
                    <div className="text-3xl font-bold text-blue-600">3rd</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Sidebar */}
          <div className="space-y-6">
            {/* Main Stats Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Overall Performance */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-700">Overall Average</span>
                      <span className="text-2xl font-bold text-blue-600">88.5%</span>
                    </div>
                    <div className="h-3 bg-white rounded-full overflow-hidden border border-slate-200">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full w-[88.5%]"></div>
                    </div>
                  </div>

                  {/* Improvement */}
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        Improvement
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">+5.2%</div>
                    <p className="text-xs text-slate-600 mt-1">From Period 1</p>
                  </div>

                  {/* Passed Subjects */}
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Passed
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">14 / 14</div>
                    <p className="text-xs text-slate-600 mt-1">All Subjects Passed</p>
                  </div>

                  {/* Status */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-green-900">Status</span>
                      <Badge className="bg-green-600 text-white border-0">Excellent</Badge>
                    </div>
                    <p className="text-xs text-green-700 mt-2">Consistent high performance across all subjects</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Action */}
            <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold h-12">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Full Analytics
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GradingShowcase;
