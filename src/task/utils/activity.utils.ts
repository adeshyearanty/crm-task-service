// utils/activity.util.ts
import {
  ActivityType,
  ActivityLogPayload,
  TaskActivityData,
} from '../types/activity.type';

export function buildActivityLogFromDto(
  dto: TaskActivityData,
  activityType: ActivityType,
  description: string,
  performedBy: string,
  taskId: string,
): ActivityLogPayload {
  const entityKeys = [
    'leadId',
    'dealId',
    'contactId',
    'eventId',
    'noteId',
    'mailId',
    'taskId',
  ] as const;

  const metadata: Record<string, any> = {
    taskTitle: dto.title,
    taskType: dto.type,
    dueDate: dto.dueDate,
  };

  const logDto: ActivityLogPayload = {
    activityType,
    description,
    performedBy,
    metadata,
    taskId, // always include taskId
  };

  // Dynamically include entity reference IDs (ONLY from incoming DTO)
  for (const key of entityKeys) {
    if (dto[key]) {
      (logDto as Record<string, any>)[key] = dto[key];
      metadata[key] = dto[key]; // also include inside metadata if needed
    }
  }

  return logDto;
}
