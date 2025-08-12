import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum TaskType {
  CALL = 'Call',
  EMAIL = 'Email',
  MEETING = 'Meeting',
  REMINDER = 'Reminder',
  OTHER = 'Other',
}

export enum TaskStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  OVERDUE = 'Overdue',
}

export enum TaskPriority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
}

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ required: true })
  title: string;

  @Prop() leadId?: string;
  @Prop() dealId?: string;
  @Prop() contactId?: string;
  @Prop() eventId?: string;
  @Prop() noteId?: string;
  @Prop() mailId?: string;
  @Prop() taskId?: string;

  @Prop({
    type: String,
    enum: TaskType,
    default: TaskType.REMINDER,
  })
  type: TaskType;

  @Prop({
    type: String,
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({
    type: String,
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Prop({ required: true })
  assignedTo: string;

  @Prop({ type: [String], default: [] })
  contributors: string[];

  @Prop()
  description: string;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ required: true })
  organizationId: string;

  @Prop()
  updatedBy?: string;

  @Prop()
  deletedBy?: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
