import { render, screen, waitFor } from '@/__tests__/utils/test-utils';
import DashboardPage from '@/app/dashboard/page';
import { useFinancial } from '@/hooks/useFinancial';
import { useHealth } from '@/hooks/useHealth';
import { useCareer } from '@/hooks/useCareer';
import { useEducation } from '@/hooks/useEducation';

// Mock hooks
jest.mock('@/hooks/useFinancial');
jest.mock('@/hooks/useHealth');
jest.mock('@/hooks/useCareer');
jest.mock('@/hooks/useEducation');
jest.mock('@/hooks/useAuth');

describe('Dashboard Page', () => {
  const mockFinancialData = {
    accounts: [
      {
        id: '1',
        name: 'Checking',
        balance: 5000,
        type: 'checking',
        institution_name: 'Test Bank',
      },
      {
        id: '2',
        name: 'Savings',
        balance: 10000,
        type: 'savings',
        institution_name: 'Test Bank',
      },
    ],
    totalBalance: 15000,
    monthlyIncome: 5000,
    monthlyExpenses: 3000,
    netWorth: 15000,
    recentTransactions: [
      {
        id: 't1',
        description: 'Grocery Store',
        amount: -150,
        date: new Date().toISOString(),
        category: 'Food',
      },
    ],
  };

  const mockHealthData = {
    upcomingAppointments: [
      {
        id: 'a1',
        title: 'Annual Checkup',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        provider: 'Dr. Smith',
      },
    ],
    healthScore: 85,
    activeGoals: 3,
    lastCheckup: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const mockCareerData = {
    currentRole: 'Senior Software Engineer',
    yearsExperience: 5,
    skills: ['React', 'TypeScript', 'Node.js'],
    upcomingInterviews: [],
    careerGoals: 2,
  };

  const mockEducationData = {
    enrolledCourses: [
      {
        id: 'c1',
        title: 'Advanced React Patterns',
        progress: 60,
        provider: 'Tech Academy',
      },
    ],
    completedCourses: 12,
    certificationsEarned: 3,
    learningStreak: 15,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useFinancial as jest.Mock).mockReturnValue({
      data: mockFinancialData,
      isLoading: false,
      error: null,
    });

    (useHealth as jest.Mock).mockReturnValue({
      data: mockHealthData,
      isLoading: false,
      error: null,
    });

    (useCareer as jest.Mock).mockReturnValue({
      data: mockCareerData,
      isLoading: false,
      error: null,
    });

    (useEducation as jest.Mock).mockReturnValue({
      data: mockEducationData,
      isLoading: false,
      error: null,
    });
  });

  describe('Initial Render', () => {
    it('renders all dashboard sections', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        // Header
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
        
        // Financial section
        expect(screen.getByText(/financial overview/i)).toBeInTheDocument();
        expect(screen.getByText('$15,000')).toBeInTheDocument(); // Total balance
        
        // Health section
        expect(screen.getByText(/health score/i)).toBeInTheDocument();
        expect(screen.getByText('85')).toBeInTheDocument();
        
        // Career section
        expect(screen.getByText(/career progress/i)).toBeInTheDocument();
        expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
        
        // Education section
        expect(screen.getByText(/learning progress/i)).toBeInTheDocument();
        expect(screen.getByText('15 day streak')).toBeInTheDocument();
      });
    });

    it('displays quick action buttons', () => {
      render(<DashboardPage />);

      expect(screen.getByRole('button', { name: /add account/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /schedule appointment/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /browse courses/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update resume/i })).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows loading skeletons while data is fetching', () => {
      (useFinancial as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<DashboardPage />);

      expect(screen.getAllByTestId('skeleton-loader')).toHaveLength(4);
    });
  });

  describe('Error States', () => {
    it('displays error message when data fetch fails', async () => {
      (useFinancial as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch financial data'),
      });

      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(/error loading financial data/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });
    });
  });

  describe('Data Visualization', () => {
    it('renders charts correctly', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        // Check for chart containers
        expect(screen.getByTestId('spending-chart')).toBeInTheDocument();
        expect(screen.getByTestId('net-worth-chart')).toBeInTheDocument();
        expect(screen.getByTestId('health-metrics-chart')).toBeInTheDocument();
      });
    });
  });

  describe('Interactivity', () => {
    it('navigates to detailed views on card click', async () => {
      const { user } = render(<DashboardPage />);

      const financialCard = screen.getByTestId('financial-overview-card');
      await user.click(financialCard);

      // Check navigation
      expect(window.location.pathname).toBe('/dashboard/finance');
    });

    it('refreshes data on pull-to-refresh', async () => {
      const { user } = render(<DashboardPage />);

      // Simulate pull-to-refresh
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      expect(useFinancial).toHaveBeenCalledTimes(2);
      expect(useHealth).toHaveBeenCalledTimes(2);
    });
  });

  describe('Real-time Updates', () => {
    it('updates financial data in real-time', async () => {
      const { rerender } = render(<DashboardPage />);

      // Update mock data
      const updatedFinancialData = {
        ...mockFinancialData,
        totalBalance: 16000,
      };

      (useFinancial as jest.Mock).mockReturnValue({
        data: updatedFinancialData,
        isLoading: false,
        error: null,
      });

      rerender(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('$16,000')).toBeInTheDocument();
      });
    });
  });

  describe('Personalization', () => {
    it('shows personalized insights based on user data', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        // Check for personalized insights
        expect(screen.getByText(/you're spending less than last month/i)).toBeInTheDocument();
        expect(screen.getByText(/health checkup due soon/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<DashboardPage />);

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /financial overview/i })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /health metrics/i })).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const { user } = render(<DashboardPage />);

      // Tab through interactive elements
      await user.tab();
      expect(screen.getByRole('button', { name: /add account/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /schedule appointment/i })).toHaveFocus();
    });
  });

  describe('Performance', () => {
    it('renders within acceptable time', () => {
      const start = performance.now();
      render(<DashboardPage />);
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // Should render in less than 100ms
    });

    it('memoizes expensive calculations', () => {
      const { rerender } = render(<DashboardPage />);

      const calculateSpy = jest.spyOn(console, 'log');
      
      rerender(<DashboardPage />);
      
      // Expensive calculations should not re-run on re-render
      expect(calculateSpy).not.toHaveBeenCalledWith('Recalculating...');
    });
  });
});