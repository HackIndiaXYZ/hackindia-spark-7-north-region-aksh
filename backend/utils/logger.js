import { EventLog } from '../model/model.js';

/**
 * Log an event to the database.
 * 
 * @param {Object} params
 * @param {'VALIDATOR' | 'USER' | 'WEBSITE' | 'PAYOUT' | 'SYSTEM'} params.category - The category of the event.
 * @param {string} params.eventType - Specific type (e.g., 'SIGNUP', 'PAYOUT_INITIATED', 'STATUS_CHANGED').
 * @param {'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL' | 'AUDIT'} [params.severity='INFO'] - The severity level.
 * @param {string} [params.actorId] - The ID of the user/validator performing the action.
 * @param {string} [params.targetId] - The ID of the entity being acted upon (e.g., website ID).
 * @param {string} params.message - A human-readable description of the event.
 * @param {Object} [params.metadata] - Additional JSON context (e.g., latency, error messages).
 */
export async function logEvent({ category, eventType, severity = 'INFO', actorId, targetId, message, metadata }) {
    try {
        const logEntry = new EventLog({
            category,
            eventType,
            severity,
            actorId,
            targetId,
            message,
            metadata
        });
        
        await logEntry.save();
        
        // Also log to console for development visibility
        const metaStr = metadata ? ` | Meta: ${JSON.stringify(metadata)}` : '';
        const actorStr = actorId ? ` | Actor: ${actorId}` : '';
        const targetStr = targetId ? ` | Target: ${targetId}` : '';
        console.log(`[${severity}] [${category}] [${eventType}] ${message}${actorStr}${targetStr}${metaStr}`);
        
    } catch (error) {
        console.error('Failed to write event log to database:', error);
    }
}
