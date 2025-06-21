import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  GitBranch,
  Share2,
  Shield,
  Download,
  Smartphone,
} from "lucide-react";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Image
              src="logo.webp"
              alt="logo"
              height={50}
              width={40}
              />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">
                Family Tree Viewer
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main>
        {/* Hero Section */}
        <section className="bg-white dark:bg-gray-900 lg:grid lg:grid-cols-2 lg:min-h-screen">
          {/* Text Content */}
          <div className="flex items-center justify-center px-4 py-16 sm:px-6 lg:px-12 lg:py-32">
            <div className="max-w-xl text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
                Discover Your <span className="text-green-600">Family</span>{" "}
                Legacy
              </h1>

              <p className="mt-6 text-gray-700 dark:text-gray-300 text-base sm:text-lg">
                Modern family tree builder—connect generations, preserve
                memories, share your heritage.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/auth/signin"
                  className="rounded-md bg-green-600 px-6 py-3 text-white font-medium hover:bg-green-700 transition"
                >
                  Start Building
                </Link>
                <Link
                  href="/demo"
                  className="rounded-md border border-gray-300 dark:border-gray-700 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  view demo
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side Image - Only visible on lg+ */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-[90%] h-[500px] relative">
              <Image
                src="/hero-image.jpeg" // Ensure this file is in /public
                alt="Family Tree Illustration"
                fill
                className="object-contain rounded-lg shadow-lg"
                priority
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Everything You Need to Build Your Family Tree
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our comprehensive platform provides all the tools you need to
                create, manage, and share your family history.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Users className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle>Rich Member Profiles</CardTitle>
                  <CardDescription>
                    Create detailed profiles with photos, dates, biographies,
                    and life events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Birth and death dates</li>
                    <li>• Profile photographs</li>
                    <li>• Biographical information</li>
                    <li>• Life milestones</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <GitBranch className="h-12 w-12 text-green-600 mb-4" />
                  <CardTitle>Interactive Visualization</CardTitle>
                  <CardDescription>
                    Explore your family tree with zoom, pan, and clickable nodes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Zoomable tree interface</li>
                    <li>• Multiple relationship types</li>
                    <li>• Generational view</li>
                    <li>• Mobile responsive</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Share2 className="h-12 w-12 text-purple-600 mb-4" />
                  <CardTitle>Share & Collaborate</CardTitle>
                  <CardDescription>
                    Share your family tree publicly or collaborate with family
                    members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Public sharing links</li>
                    <li>• Privacy controls</li>
                    <li>• Family collaboration</li>
                    <li>• Access management</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-12 w-12 text-red-600 mb-4" />
                  <CardTitle>Secure & Private</CardTitle>
                  <CardDescription>
                    Your family data is protected with enterprise-grade security
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Encrypted data storage</li>
                    <li>• Secure authentication</li>
                    <li>• Audit logging</li>
                    <li>• GDPR compliant</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Download className="h-12 w-12 text-orange-600 mb-4" />
                  <CardTitle>Export & Backup</CardTitle>
                  <CardDescription>
                    Download your family tree in multiple formats for offline
                    access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• PDF export</li>
                    <li>• High-resolution images</li>
                    <li>• Data backup</li>
                    <li>• Print-ready formats</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Smartphone className="h-12 w-12 text-indigo-600 mb-4" />
                  <CardTitle>Mobile Friendly</CardTitle>
                  <CardDescription>
                    Access and edit your family tree from any device, anywhere
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Responsive design</li>
                    <li>• Touch-friendly interface</li>
                    <li>• Offline capabilities</li>
                    <li>• Cross-platform sync</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Your Family Tree?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of families who are preserving their heritage and
              connecting with their roots using our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  Create Free Account
                </Button>
              </Link>
              <Link href="/demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-blue-600"
                >
                  Try the Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 mr-2" />
                <span className="font-bold">Family Tree Viewer</span>
              </div>
              <p className="text-gray-400 text-sm">
                Build, visualize, and share your family history with our
                comprehensive family tree platform.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/demo" className="hover:text-white">
                    Demo
                  </Link>
                </li>
                <li>
                  <Link href="/features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-white">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Family Tree Viewer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
