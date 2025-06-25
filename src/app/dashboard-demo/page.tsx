export default function DashboardDemoPage() {
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Welcome to Life Navigator Dashboard</h1>
      <p>You are successfully logged in as: demo@lifenavigator.ai</p>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Available Features:</h2>
        <ul style={{ lineHeight: '2' }}>
          <li>📊 Finance Management</li>
          <li>💼 Career Development</li>
          <li>🎓 Education Planning</li>
          <li>🏥 Healthcare Tracking</li>
          <li>👨‍👩‍👧‍👦 Family Management</li>
          <li>📈 Insights & Analytics</li>
        </ul>
      </div>
      
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: '#f0f0f0',
        borderRadius: '8px'
      }}>
        <p><strong>Note:</strong> The full dashboard is currently experiencing rendering issues.</p>
        <p>Our team is working on fixing this. The demo account is properly authenticated.</p>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <a 
          href="/api/auth/logout"
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc2626',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            display: 'inline-block'
          }}
        >
          Logout
        </a>
      </div>
    </div>
  );
}