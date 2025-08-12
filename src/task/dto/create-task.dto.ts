import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsDateString,
  IsArray,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { TaskType, TaskPriority, TaskStatus } from '../model/task.model';

export class CreateTaskDto {
  @ApiProperty({ description: 'Title of the task' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  leadId?: string;

  @ApiProperty({ required: false })
  dealId?: string;

  @ApiProperty({ required: false })
  contactId?: string;

  @ApiProperty({ required: false })
  eventId?: string;

  @ApiProperty({ required: false })
  noteId?: string;

  @ApiProperty({ required: false })
  mailId?: string;

  @ApiProperty({ required: false })
  taskId?: string;

  @ApiPropertyOptional({
    description: 'Type of task',
    enum: TaskType,
    default: TaskType.REMINDER,
  })
  @IsEnum(TaskType)
  @IsOptional()
  type?: TaskType;

  @ApiPropertyOptional({
    description: 'Status of the task',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({ description: 'Due date and time of the task' })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({
    description: 'Priority level of the task',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiProperty({ description: 'User ID of the person assigned to the task' })
  @IsString()
  @IsNotEmpty()
  assignedTo: string;

  @ApiPropertyOptional({
    description: 'Array of user IDs who are contributors to this task',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  contributors?: string[];

  @ApiPropertyOptional({ description: 'Detailed description of the task' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Organization ID' })
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty({ description: 'Created by' })
  @IsString()
  @IsNotEmpty()
  createdBy: string;
}
