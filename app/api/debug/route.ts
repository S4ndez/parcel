import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import dns from 'dns';
import net from 'net';

// Helper to resolve a hostname
function resolveHost(hostname: string): Promise<string[]> {
  return new Promise((resolve) => {
    dns.resolve(hostname, (err, addresses) => {
      if (err) {
        resolve([]);
      } else {
        resolve(addresses);
      }
    });
  });
}

// Helper to test TCP connection to port 27017
function testTcpConnection(host: string, port: number, timeout = 4000): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let resolved = false;

    socket.setTimeout(timeout);

    socket.connect(port, host, () => {
      resolved = true;
      socket.destroy();
      resolve({ success: true });
    });

    socket.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve({ success: false, error: err.message });
      }
    });

    socket.on('timeout', () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve({ success: false, error: 'Connection timed out (port 27017 might be blocked by your network/firewall)' });
      }
    });
  });
}

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    dnsServers: dns.getServers(),
    publicIpCheck: null,
    dnsResolutions: {},
    portTests: {},
    dbConnection: null,
  };

  // 1. Fetch public IP from Node's perspective
  try {
    const ipRes = await fetch('https://api.ipify.org?format=json');
    if (ipRes.ok) {
      const data = await ipRes.json();
      diagnostics.publicIpCheck = {
        detectedIp: data.ip,
        matchesWhitelistedIp: data.ip === '59.176.70.105',
        note: data.ip === '59.176.70.105' 
          ? 'Matches the IP in your Atlas whitelist screenshot!' 
          : `WARNING: Your outgoing public IP is actually ${data.ip}, which is different from the whitelisted IP.`,
      };
    } else {
      diagnostics.publicIpCheck = { error: `Failed to fetch: ${ipRes.statusText}` };
    }
  } catch (err: any) {
    diagnostics.publicIpCheck = { error: err.message };
  }

  // Shard hosts to test
  const hosts = [
    'ac-kesgpcv-shard-00-00.rtepagl.mongodb.net',
    'ac-kesgpcv-shard-00-01.rtepagl.mongodb.net',
    'ac-kesgpcv-shard-00-02.rtepagl.mongodb.net',
  ];

  // 2. Test DNS resolutions
  for (const host of hosts) {
    const ips = await resolveHost(host);
    diagnostics.dnsResolutions[host] = ips.length > 0 ? ips : 'Failed to resolve';
  }

  // 3. Test TCP connection on 27017
  for (const host of hosts) {
    diagnostics.portTests[host] = await testTcpConnection(host, 27017);
  }

  // 4. Test actual DB Connection
  try {
    await connectDB();
    diagnostics.dbConnection = { success: true, message: 'Connected successfully!' };
  } catch (err: any) {
    diagnostics.dbConnection = { success: false, error: err.message };
  }

  return NextResponse.json(diagnostics);
}

