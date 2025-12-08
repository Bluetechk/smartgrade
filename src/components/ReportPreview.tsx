import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const ReportPreview = () => {
  const reportCards = [
    {
      title: "Periodic Attendance",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=300&fit=crop",
      description: "Monitor student attendance patterns and generate reports for each grading period.",
      features: ["Real-time tracking", "Automated alerts", "Parent notifications"]
    },
    {
      title: "Performance",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=300&fit=crop",
      description: "Track comprehensive academic performance across all subjects and assessment types.",
      features: ["Subject analysis", "Grade distribution", "Trend reports"]
    },
    {
      title: "Disciplinary Records",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=300&fit=crop",
      description: "Maintain complete disciplinary records and behavioral tracking for each student.",
      features: ["Incident logging", "Follow-up tracking", "Parent communication"]
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container px-4 mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Comprehensive Reporting
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Generate detailed reports with a single click. Everything your school needs to track student progress.
          </p>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {reportCards.map((report, index) => (
            <Card 
              key={index}
              className="border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group"
            >
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300">
                <img 
                  src={report.image} 
                  alt={report.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{report.title}</h3>
                <p className="text-slate-600 mb-4 text-sm leading-relaxed">{report.description}</p>
                <div className="space-y-2 mb-6">
                  {report.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                      {feature}
                    </div>
                  ))}
                </div>
                <Button 
                  variant="ghost" 
                  className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 w-full justify-start pl-0 group/btn"
                >
                  View Sample
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sample Report Display */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Report Preview */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-600 uppercase mb-4">Sample Report Card</h3>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 border-2 border-blue-200">
                  <div className="text-center mb-6">
                    <h4 className="text-2xl font-bold text-slate-900 mb-1">Academic Report Card</h4>
                    <p className="text-sm text-slate-600">Period 3 - Academic Year 2024/2025</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between pb-3 border-b border-blue-300">
                      <span className="font-medium text-slate-700">Student Name:</span>
                      <span className="font-semibold text-slate-900">Cody Fisher</span>
                    </div>
                    <div className="flex justify-between pb-3 border-b border-blue-300">
                      <span className="font-medium text-slate-700">Class:</span>
                      <span className="font-semibold text-slate-900">Senior High 3</span>
                    </div>
                    <div className="flex justify-between pb-3 border-b border-blue-300">
                      <span className="font-medium text-slate-700">Rank:</span>
                      <span className="font-semibold text-slate-900">5th / 45</span>
                    </div>
                  </div>

                  <div className="bg-white rounded p-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-slate-300">
                          <th className="text-left py-2 text-slate-700">Subject</th>
                          <th className="text-center py-2 text-slate-700">Score</th>
                          <th className="text-center py-2 text-slate-700">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <td className="py-2 text-slate-600">Mathematics</td>
                          <td className="text-center font-semibold text-slate-900">92</td>
                          <td className="text-center font-semibold text-green-600">A</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-2 text-slate-600">English</td>
                          <td className="text-center font-semibold text-slate-900">88</td>
                          <td className="text-center font-semibold text-green-600">A</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-2 text-slate-600">Science</td>
                          <td className="text-center font-semibold text-slate-900">85</td>
                          <td className="text-center font-semibold text-blue-600">B</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-slate-600">History</td>
                          <td className="text-center font-semibold text-slate-900">90</td>
                          <td className="text-center font-semibold text-green-600">A</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 pt-4 border-t-2 border-blue-300">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-700">Overall Average:</span>
                      <span className="text-3xl font-bold text-blue-600">88.75</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Report Features</h3>
                <p className="text-slate-600 mb-6">Our comprehensive reporting system provides:</p>
              </div>

              <div className="space-y-4">
                {[
                  { title: "Periodic Reports", desc: "Detailed reports for each grading period with subject breakdown" },
                  { title: "Semester Summaries", desc: "Combined analysis of first and second semester performance" },
                  { title: "Yearly Totals", desc: "Complete academic year overview with final rankings" },
                  { title: "Parent Reports", desc: "Simplified reports designed for easy parent understanding" },
                  { title: "Export Options", desc: "Download as PDF, Excel, or print directly" },
                  { title: "Performance Analytics", desc: "Visual charts and graphs for trend analysis" }
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0 mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{feature.title}</h4>
                      <p className="text-sm text-slate-600">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold mt-4">
                Try Sample Reports
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReportPreview;
