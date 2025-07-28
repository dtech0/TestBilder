import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, FormInput, Shield, DollarSign, Database, Zap, GraduationCap } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <section className="container mx-auto px-4 py-20 lg:py-10">
        <div className="text-center max-w-5xl mx-auto">

          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-8">
            <Zap className="w-4 h-4 mr-2" />
            Professional Question Paper Generator
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            - Create Like Professionals -
            <span className="text-blue-600 block">Make Ready to Print Question Papers</span>
            <span className="text-gray-700 text-3xl md:text-4xl font-normal block mt-4">
              Without Any Formatting Hassle
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your questions into professional exam papers instantly. No design skills needed, no charges
            required, completely secure.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <Link href="/demo/MCQ">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-10 py-4 text-lg font-semibold rounded-xl"
              >
                <FileText className="w-6 h-6 mr-3" /> 
                View MCQ Sample Papers
              </Button>
            </Link>
            <Link href="/demo/CQ">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <FormInput className="w-6 h-6 mr-3" />
                View CQ Sample Papers
              </Button>
            </Link>
            <Link href="/demo/SQ">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-10 py-4 text-lg font-semibold rounded-xl"
              >
                <FileText className="w-6 h-6 mr-3" />
                View SQ Sample Papers
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">100% Free</h3>
              <p className="text-gray-600 text-sm">No hidden charges or subscription fees</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">No Formatting</h3>
              <p className="text-gray-600 text-sm">Auto-formats to professional standards</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Save Previous</h3>
              <p className="text-gray-600 text-sm">All Complete and Incomplete questions are recorded</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Secure</h3>
              <p className="text-gray-600 text-sm">Zero risk of question paper leaks</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl">
            <div className="flex items-center justify-center mb-6">
              <GraduationCap className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Perfect for Educational Institutions</h2>
            </div>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              From school tests to college examinations, create professional question papers that meet academic
              standards instantly.
            </p>

            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-4">
                <div className="text-3xl font-bold text-blue-600 mb-2">Schools</div>
                <p className="text-gray-600">Class tests, term exams, board preparations</p>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-blue-600 mb-2">Colleges</div>
                <p className="text-gray-600">Semester exams, entrance tests, assessments</p>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-blue-600 mb-2">Coaching</div>
                <p className="text-gray-600">Mock tests, practice papers, competitions</p>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Create Your First Professional Question Paper?
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of educators who trust our platform for their examination needs.
            </p>
            <Link href="/createQuestionPrimaryInfo">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-12 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {"Get Started Now - It's Free!"}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
