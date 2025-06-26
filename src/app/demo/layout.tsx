import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { DemoProvider } from '@/components/providers/demo-provider'

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DemoProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                  🔍 This is a demo preview. Data shown is for demonstration purposes only.
                </p>
              </div>
            </div>
            {children}
          </main>
        </div>
      </div>
    </DemoProvider>
  )
}