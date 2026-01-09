/**
 * PDF Export Utility - Generate PDF reports for measurements and progress
 * Uses jsPDF library for client-side PDF generation
 */

import { MeasurementLog, WorkoutSession, CorsetSession, ChastitySession } from "@/types";

export interface PDFExportOptions {
    includeMeasurements?: boolean;
    includeWorkouts?: boolean;
    includeCorset?: boolean;
    includeChastity?: boolean;
    includePhotos?: boolean;
    dateRange?: {
        start: number;
        end: number;
    };
}

/**
 * Generate a progress report PDF
 * Note: This returns the PDF data structure. 
 * In production, you'd use jsPDF library: npm install jspdf
 */
export async function generateProgressPDF(
    data: {
        measurements?: MeasurementLog[];
        workoutSessions?: WorkoutSession[];
        corsetSessions?: CorsetSession[];
        chastitySessions?: ChastitySession[];
    },
    options: PDFExportOptions = {}
): Promise<Blob> {
    // This is a placeholder implementation
    // In production, install jsPDF: npm install jspdf
    // Then use actual PDF generation
    
    const {
        includeMeasurements = true,
        includeWorkouts = true,
        includeCorset = true,
        includeChastity = true,
        dateRange,
    } = options;

    // Filter data by date range if specified
    const filterByDate = (items: any[]) => {
        if (!dateRange || !items) return items || [];
        return items.filter(item => {
            const itemDate = item.date || item.startDate;
            return itemDate >= dateRange.start && itemDate <= dateRange.end;
        });
    };

    const filteredMeasurements = includeMeasurements ? filterByDate(data.measurements || []) : [];
    const filteredWorkouts = includeWorkouts ? filterByDate(data.workoutSessions || []) : [];
    const filteredCorset = includeCorset ? filterByDate(data.corsetSessions || []) : [];
    const filteredChastity = includeChastity ? filterByDate(data.chastitySessions || []) : [];

    // Generate text content for PDF
    const content = generatePDFContent({
        measurements: filteredMeasurements,
        workoutSessions: filteredWorkouts,
        corsetSessions: filteredCorset,
        chastitySessions: filteredChastity,
    });

    // Create a simple text blob as placeholder
    // Replace this with jsPDF implementation in production
    const blob = new Blob([content], { type: 'application/pdf' });
    return blob;
}

/**
 * Generate PDF content as text (placeholder)
 */
function generatePDFContent(data: {
    measurements: MeasurementLog[];
    workoutSessions: WorkoutSession[];
    corsetSessions: CorsetSession[];
    chastitySessions: ChastitySession[];
}): string {
    const lines: string[] = [];
    
    lines.push('═══════════════════════════════════════════');
    lines.push('        AURA - PROGRESS REPORT');
    lines.push('═══════════════════════════════════════════');
    lines.push('');
    lines.push(`Generated: ${new Date().toLocaleDateString()}`);
    lines.push('');

    // Measurements Section
    if (data.measurements.length > 0) {
        lines.push('───────────────────────────────────────────');
        lines.push('BODY MEASUREMENTS');
        lines.push('───────────────────────────────────────────');
        lines.push('');
        
        const latest = data.measurements[0];
        const oldest = data.measurements[data.measurements.length - 1];
        
        lines.push('LATEST MEASUREMENTS:');
        if (latest.values?.waist) lines.push(`  Waist: ${latest.values.waist}"`);
        if (latest.values?.hips) lines.push(`  Hips: ${latest.values.hips}"`);
        if (latest.values?.bust) lines.push(`  Bust: ${latest.values.bust}"`);
        if (latest.values?.weight) lines.push(`  Weight: ${latest.values.weight} lbs`);
        lines.push(`  Date: ${new Date(latest.date).toLocaleDateString()}`);
        lines.push('');

        if (data.measurements.length > 1) {
            lines.push('PROGRESS TRACKING:');
            const waistChange = (latest.values?.waist || 0) - (oldest.values?.waist || 0);
            const hipsChange = (latest.values?.hips || 0) - (oldest.values?.hips || 0);
            const weightChange = (latest.values?.weight || 0) - (oldest.values?.weight || 0);
            
            if (waistChange !== 0) lines.push(`  Waist: ${waistChange > 0 ? '+' : ''}${waistChange.toFixed(1)}"`);
            if (hipsChange !== 0) lines.push(`  Hips: ${hipsChange > 0 ? '+' : ''}${hipsChange.toFixed(1)}"`);
            if (weightChange !== 0) lines.push(`  Weight: ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} lbs`);
            lines.push(`  Period: ${Math.floor((latest.date - oldest.date) / (1000 * 60 * 60 * 24))} days`);
        }
        lines.push('');
    }

    // Workouts Section
    if (data.workoutSessions.length > 0) {
        lines.push('───────────────────────────────────────────');
        lines.push('WORKOUT SUMMARY');
        lines.push('───────────────────────────────────────────');
        lines.push('');
        lines.push(`Total Workouts: ${data.workoutSessions.length}`);
        
        const totalDuration = data.workoutSessions.reduce((sum, w) => sum + (w.duration || 0), 0);
        lines.push(`Total Duration: ${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`);
        lines.push('');
        
        lines.push('RECENT SESSIONS:');
        data.workoutSessions.slice(0, 5).forEach(session => {
            lines.push(`  ${new Date(session.date).toLocaleDateString()} - ${session.duration || 0} min`);
            if (session.notes) lines.push(`    "${session.notes}"`);
        });
        lines.push('');
    }

    // Corset Training Section
    if (data.corsetSessions.length > 0) {
        lines.push('───────────────────────────────────────────');
        lines.push('CORSET TRAINING');
        lines.push('───────────────────────────────────────────');
        lines.push('');
        
        const completedSessions = data.corsetSessions.filter(s => s.endDate);
        const totalHours = completedSessions.reduce((sum, s) => {
            const duration = (s.endDate! - s.startDate) / (1000 * 60 * 60);
            return sum + duration;
        }, 0);
        
        lines.push(`Total Sessions: ${completedSessions.length}`);
        lines.push(`Total Training Time: ${totalHours.toFixed(1)} hours`);
        
        if (completedSessions.length > 0) {
            const latest = completedSessions[0];
            if (latest.waistBefore && latest.waistCorseted) {
                const reduction = latest.waistBefore - latest.waistCorseted;
                lines.push(`Latest Reduction: ${reduction.toFixed(1)}"`);
            }
        }
        lines.push('');
    }

    // Chastity Section
    if (data.chastitySessions.length > 0) {
        lines.push('───────────────────────────────────────────');
        lines.push('CHASTITY TRACKING');
        lines.push('───────────────────────────────────────────');
        lines.push('');
        
        const activeSession = data.chastitySessions.find(s => !s.endDate);
        if (activeSession) {
            const days = Math.floor((Date.now() - activeSession.startDate) / (1000 * 60 * 60 * 24));
            lines.push(`ACTIVE SESSION: ${days} days locked`);
            if (activeSession.cageModel) lines.push(`  Device: ${activeSession.cageModel}`);
            lines.push('');
        }
        
        const completedSessions = data.chastitySessions.filter(s => s.endDate);
        lines.push(`Total Completed Sessions: ${completedSessions.length}`);
        
        const totalDays = completedSessions.reduce((sum, s) => {
            const days = (s.endDate! - s.startDate) / (1000 * 60 * 60 * 24);
            return sum + days;
        }, 0);
        
        if (completedSessions.length > 0) {
            lines.push(`Total Days Locked: ${Math.floor(totalDays)}`);
            lines.push(`Average Session: ${(totalDays / completedSessions.length).toFixed(1)} days`);
        }
        lines.push('');
    }

    lines.push('═══════════════════════════════════════════');
    lines.push('       END OF REPORT');
    lines.push('═══════════════════════════════════════════');

    return lines.join('\n');
}

/**
 * Download PDF as file
 */
export function downloadPDF(blob: Blob, filename: string = 'aura-progress-report.pdf') {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Generate and download progress PDF
 * Usage: 
 *   const blob = await generateProgressPDF(data, options);
 *   downloadPDF(blob, 'my-progress-report.pdf');
 */
export async function exportProgressReport(
    data: {
        measurements?: MeasurementLog[];
        workoutSessions?: WorkoutSession[];
        corsetSessions?: CorsetSession[];
        chastitySessions?: ChastitySession[];
    },
    options?: PDFExportOptions
): Promise<void> {
    const blob = await generateProgressPDF(data, options);
    const filename = `aura-progress-${new Date().toISOString().split('T')[0]}.txt`;
    downloadPDF(blob, filename);
}

/**
 * Component-ready hook for PDF export
 */
export function usePDFExport() {
    const [isGenerating, setIsGenerating] = useState(false);

    const exportPDF = async (
        data: Parameters<typeof generateProgressPDF>[0],
        options?: PDFExportOptions
    ) => {
        setIsGenerating(true);
        try {
            await exportProgressReport(data, options);
        } catch (error) {
            console.error('PDF export failed:', error);
            throw error;
        } finally {
            setIsGenerating(false);
        }
    };

    return { exportPDF, isGenerating };
}

// For production use, install jsPDF and implement actual PDF generation:
// npm install jspdf
// 
// import jsPDF from 'jspdf';
// 
// export async function generateProgressPDF(...) {
//   const doc = new jsPDF();
//   doc.setFontSize(20);
//   doc.text('Aura - Progress Report', 20, 20);
//   // ... add content
//   return doc.output('blob');
// }

import { useState } from "react";
