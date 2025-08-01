import { Platform } from "react-native";

export interface NetworkDiagnosticResult {
  test: string;
  success: boolean;
  error?: string;
  response?: any;
  timing?: number;
}

export class NetworkDiagnostics {
  private static getApiBaseUrl(): string {
    if (typeof window !== "undefined") {
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      return `${protocol}//${hostname}:3001`;
    }

    const DEVELOPMENT_IP = "192.168.1.157";

    if (__DEV__ && process.env.NODE_ENV === "development") {
      return `http://${DEVELOPMENT_IP}:3001`;
    }

    return "http://localhost:3001";
  }

  static async runFullDiagnostic(): Promise<NetworkDiagnosticResult[]> {
    const results: NetworkDiagnosticResult[] = [];
    const baseUrl = this.getApiBaseUrl();

    console.log("🔍 Starting network diagnostics...");
    console.log(`📍 Platform: ${Platform.OS}`);
    console.log(`🌐 Base URL: ${baseUrl}`);

    // Test 1: Health Check
    results.push(await this.testHealthCheck(baseUrl));

    // Test 2: Basic API endpoint
    results.push(await this.testTasksEndpoint(baseUrl));

    // Test 3: Timer endpoint (if basic API works)
    if (results[1]?.success) {
      results.push(await this.testTimerEndpoint(baseUrl));
    }

    // Test 4: Network reachability
    results.push(await this.testNetworkReachability());

    return results;
  }

  private static async testHealthCheck(
    baseUrl: string,
  ): Promise<NetworkDiagnosticResult> {
    const startTime = Date.now();

    try {
      console.log("🔍 Testing health check...");

      const response = await fetch(`${baseUrl}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const timing = Date.now() - startTime;

      if (!response.ok) {
        return {
          test: "Health Check",
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          timing,
        };
      }

      const data = await response.json();

      return {
        test: "Health Check",
        success: true,
        response: data,
        timing,
      };
    } catch (error) {
      const timing = Date.now() - startTime;

      return {
        test: "Health Check",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timing,
      };
    }
  }

  private static async testTasksEndpoint(
    baseUrl: string,
  ): Promise<NetworkDiagnosticResult> {
    const startTime = Date.now();

    try {
      console.log("🔍 Testing tasks endpoint...");

      const response = await fetch(`${baseUrl}/api/tasks`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const timing = Date.now() - startTime;

      if (!response.ok) {
        return {
          test: "Tasks API",
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          timing,
        };
      }

      const data = await response.json();

      return {
        test: "Tasks API",
        success: true,
        response: { tasksCount: data.data?.length || 0, success: data.success },
        timing,
      };
    } catch (error) {
      const timing = Date.now() - startTime;

      return {
        test: "Tasks API",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timing,
      };
    }
  }

  private static async testTimerEndpoint(
    baseUrl: string,
  ): Promise<NetworkDiagnosticResult> {
    const startTime = Date.now();

    try {
      console.log("🔍 Testing timer endpoint...");

      // First, try to get a task to test with
      const tasksResponse = await fetch(`${baseUrl}/api/tasks`);
      const tasksData = await tasksResponse.json();

      if (
        !tasksData.success ||
        !tasksData.data ||
        tasksData.data.length === 0
      ) {
        return {
          test: "Timer API",
          success: false,
          error: "No tasks available to test timer endpoint",
          timing: Date.now() - startTime,
        };
      }

      const testTaskId = tasksData.data[0].id;

      // Test timer status endpoint
      const response = await fetch(
        `${baseUrl}/api/tasks/${testTaskId}/timer/status`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const timing = Date.now() - startTime;

      if (!response.ok) {
        return {
          test: "Timer API",
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          timing,
        };
      }

      const data = await response.json();

      return {
        test: "Timer API",
        success: true,
        response: { timerStatus: data.data?.status, success: data.success },
        timing,
      };
    } catch (error) {
      const timing = Date.now() - startTime;

      return {
        test: "Timer API",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timing,
      };
    }
  }

  private static async testNetworkReachability(): Promise<NetworkDiagnosticResult> {
    const startTime = Date.now();

    try {
      console.log("🔍 Testing network reachability...");

      // Test external connectivity
      const response = await fetch("https://httpbin.org/status/200", {
        method: "GET",
      });

      const timing = Date.now() - startTime;

      return {
        test: "Network Reachability",
        success: response.ok,
        response: { status: response.status, statusText: response.statusText },
        timing,
      };
    } catch (error) {
      const timing = Date.now() - startTime;

      return {
        test: "Network Reachability",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timing,
      };
    }
  }

  static async testSpecificUrl(url: string): Promise<NetworkDiagnosticResult> {
    const startTime = Date.now();

    try {
      console.log(`🔍 Testing specific URL: ${url}`);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const timing = Date.now() - startTime;

      if (!response.ok) {
        return {
          test: `Custom URL Test`,
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          timing,
        };
      }

      const data = await response.text();

      return {
        test: `Custom URL Test`,
        success: true,
        response: data.substring(0, 200), // First 200 chars
        timing,
      };
    } catch (error) {
      const timing = Date.now() - startTime;

      return {
        test: `Custom URL Test`,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timing,
      };
    }
  }

  static logResults(results: NetworkDiagnosticResult[]): void {
    console.log("\n🔍 NETWORK DIAGNOSTIC RESULTS");
    console.log("================================");

    results.forEach((result, index) => {
      const status = result.success ? "✅" : "❌";
      const timing = result.timing ? ` (${result.timing}ms)` : "";

      console.log(`${index + 1}. ${status} ${result.test}${timing}`);

      if (result.success && result.response) {
        console.log(`   Response: ${JSON.stringify(result.response)}`);
      }

      if (!result.success && result.error) {
        console.log(`   Error: ${result.error}`);
      }

      console.log("");
    });

    const successCount = results.filter((r) => r.success).length;
    const totalCount = results.length;

    console.log(`📊 Summary: ${successCount}/${totalCount} tests passed`);

    if (successCount < totalCount) {
      console.log("\n🔧 TROUBLESHOOTING TIPS:");
      console.log(
        "1. Make sure backend server is running (npm start in apps/backend)",
      );
      console.log("2. Check if your IP address has changed");
      console.log("3. Ensure your device and computer are on the same network");
      console.log("4. Try disabling VPN or firewall temporarily");
      console.log("5. Check if port 3001 is blocked");
    }
  }

  static getDebugInfo(): object {
    return {
      platform: Platform.OS,
      version: Platform.Version,
      isDev: __DEV__,
      nodeEnv: process.env.NODE_ENV,
      apiBaseUrl: this.getApiBaseUrl(),
      timestamp: new Date().toISOString(),
    };
  }
}

// Make available globally for debugging
if (__DEV__ && typeof global !== "undefined") {
  (global as any).NetworkDiagnostics = NetworkDiagnostics;
  console.log("🛠️ NetworkDiagnostics available globally for debugging");
}

export default NetworkDiagnostics;
