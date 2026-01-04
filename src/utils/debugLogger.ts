/**
 * Debug logger that stores logs and makes them accessible
 */

interface LogEntry {
    timestamp: number;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    data?: any;
}

class DebugLogger {
    private logs: LogEntry[] = [];
    private maxLogs = 100;
    
    constructor() {
        // Make it accessible globally
        if (typeof window !== 'undefined') {
            (window as any).__debugLogs = this;
        }
    }
    
    info(message: string, data?: any) {
        this.addLog('info', message, data);
        console.log(`ℹ️ ${message}`, data);
    }
    
    warn(message: string, data?: any) {
        this.addLog('warn', message, data);
        console.warn(`⚠️ ${message}`, data);
    }
    
    error(message: string, data?: any) {
        this.addLog('error', message, data);
        console.error(`❌ ${message}`, data);
    }
    
    debug(message: string, data?: any) {
        this.addLog('debug', message, data);
        console.log(`🔍 ${message}`, data);
    }
    
    private addLog(level: LogEntry['level'], message: string, data?: any) {
        this.logs.push({
            timestamp: Date.now(),
            level,
            message,
            data
        });
        
        // Keep only recent logs
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
        
        // Notify listeners
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('debug-log', { 
                detail: { logs: this.logs }
            }));
        }
    }
    
    getLogs(): LogEntry[] {
        return this.logs;
    }
    
    clear() {
        this.logs = [];
    }
    
    getFormattedLogs(): string {
        return this.logs.map(log => {
            const time = new Date(log.timestamp).toLocaleTimeString();
            const prefix = {
                info: 'ℹ️',
                warn: '⚠️',
                error: '❌',
                debug: '🔍'
            }[log.level];
            return `${time} ${prefix} ${log.message}${log.data ? ': ' + JSON.stringify(log.data) : ''}`;
        }).join('\n');
    }
}

export const debugLogger = new DebugLogger();
