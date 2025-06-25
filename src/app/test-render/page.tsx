export default function TestRenderPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Render Page</h1>
      <p>If you can see this, Next.js is rendering correctly.</p>
      <p>Environment: {process.env.NODE_ENV}</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </div>
  );
}