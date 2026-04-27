import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import MonitorStats from "./MonitorStats";
import UptimeChart from "./UptimeChart";
import ResponseTimeChart from "./ResponseTimeChart";
import StatusHistory from "./StatusHistory";
import RecentEvents from "./RecentEvents";
import MonitorDetails from "./MonitorDetails";
import AlertSettings from "./AlertSettings";

interface DetailsDashboardProps {
  monitor: {
    id: string;
    name: string;
    url: string;
    status: "up" | "down" | "warning";
    uptimePercentage: number;
    responseTime: number;
    checkFrequency: number;
    statusHistory: {
      status: "up" | "down";
      length: number;
    }[];
    responseTimeHistory: { 
      name: string; 
      responseTime: number 
    }[];
    recentEvents: {
      id: number;
      type: "up" | "down" | "warning" | "info";
      timestamp: Date;
      duration: string | null;
      message: string;
    }[];
    monitoringSince: Date;
    regions: string[];
    checks: {
      total: number;
      success: number;
      failed: number;
    };
    alertsEnabled: boolean;
    alertChannels: string[];
    blockchainLogs?: {
      _id: string;
      message: string;
      metadata?: { signature?: string };
      createdAt: string;
    }[];
  };
}

const DetailsDashboard: React.FC<DetailsDashboardProps> = ({ monitor }) => {
  return (
    <div className="space-y-6">
      <MonitorStats 
        uptime={monitor.uptimePercentage}
        responseTime={monitor.responseTime}
        checks={monitor.checks}
        monitoringSince={monitor.monitoringSince}
      />
      
      <Tabs defaultValue="uptime" className="space-y-4">
        <TabsList className="bg-gray-800/40 border border-gray-700 w-full justify-start">
          <TabsTrigger value="uptime">Uptime</TabsTrigger>
          <TabsTrigger value="response">Response Time</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
        </TabsList>
        
        <TabsContent value="uptime" className="space-y-4">
          <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-6">
            <div className="h-[400px]">
              <StatusHistory statusHistory={monitor.statusHistory} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="response" className="space-y-4">
          <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-6">
            <div className="h-[400px]">
              <ResponseTimeChart data={monitor.responseTimeHistory} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="events" className="space-y-4">
          <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-6">
            <RecentEvents events={monitor.recentEvents} />
          </div>
        </TabsContent>

        <TabsContent value="blockchain" className="space-y-4">
          <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-6 max-h-[400px] overflow-y-auto">
            <h3 className="text-lg font-medium text-white mb-4">Blockchain Transactions</h3>
            {monitor.blockchainLogs && monitor.blockchainLogs.length > 0 ? (
              <div className="space-y-3">
                {monitor.blockchainLogs.map(log => (
                  <div key={log._id} className="p-3 bg-gray-900/50 rounded-md border border-gray-700">
                    <p className="text-sm text-gray-300">{log.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(log.createdAt).toLocaleString()}</p>
                    {log.metadata?.signature && (
                      <a href={`https://explorer.solana.com/tx/${log.metadata.signature}?cluster=devnet`} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 block break-all">
                        View on Explorer: {log.metadata.signature}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No blockchain transactions found for this website yet.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Uptime Chart</h3>
          <div className="h-[200px]">
            <UptimeChart statusHistory={monitor.statusHistory} />
          </div>
        </div>
        
        <MonitorDetails 
          checkFrequency={monitor.checkFrequency}
          regions={monitor.regions}
        />
      </div>
      
      <AlertSettings 
        alertsEnabled={monitor.alertsEnabled}
        alertChannels={monitor.alertChannels}
      />
    </div>
  );
};

export default DetailsDashboard;
