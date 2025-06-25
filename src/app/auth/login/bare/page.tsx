export default function BareLoginPage() {
  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Life Navigator Login</h1>
      <p>If you can see this, Next.js is working!</p>
      
      <form action="/api/auth/login" method="POST">
        <div style={{ marginBottom: '10px' }}>
          <label>
            Email:<br />
            <input 
              type="email" 
              name="email" 
              defaultValue="demo@lifenavigator.ai"
              style={{ width: '100%', padding: '8px' }}
            />
          </label>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>
            Password:<br />
            <input 
              type="password" 
              name="password" 
              defaultValue="demo123"
              style={{ width: '100%', padding: '8px' }}
            />
          </label>
        </div>
        
        <button type="submit" style={{ padding: '10px 20px' }}>
          Login
        </button>
      </form>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e3f2fd' }}>
        <strong>Demo Credentials:</strong><br />
        Email: demo@lifenavigator.ai<br />
        Password: demo123
      </div>
    </div>
  );
}