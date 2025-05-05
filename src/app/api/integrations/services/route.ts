// app/api/integrations/services/route.ts
import { NextResponse } from 'next/server';

// Mock data for connected services
const MOCK_SERVICES = [
  {
    id: 'svc_1',
    providerId: 'plaid',
    name: 'Plaid',
    logoUrl: '/images/integrations/plaid.png',
    status: 'active',
    connectedDate: '2025-03-15T00:00:00Z',
    lastSyncDate: '2025-05-02T10:30:00Z',
    domain: 'finance'
  },
  {
    id: 'svc_2',
    providerId: 'coinbase',
    name: 'Coinbase',
    logoUrl: '/images/integrations/coinbase.png',
    status: 'active',
    connectedDate: '2025-04-01T00:00:00Z',
    lastSyncDate: '2025-05-02T10:30:00Z',
    domain: 'finance'
  },
  {
    id: 'svc_3',
    providerId: 'epic_mychart',
    name: 'Epic MyChart',
    logoUrl: '/images/integrations/epic.png',
    status: 'needs_attention',
    connectedDate: '2025-03-20T00:00:00Z',
    lastSyncDate: '2025-04-20T08:15:00Z',
    domain: 'healthcare'
  }
];

export async function GET() {
  // In a real app, fetch connected services from the database
  return NextResponse.json(MOCK_SERVICES);
}