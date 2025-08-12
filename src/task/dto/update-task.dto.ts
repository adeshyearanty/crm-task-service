import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TaskPriority, TaskStatus, TaskType } from '../model/task.model';

export class UpdateTaskDto {
  @ApiPropertyOptional({ description: 'Title of the task' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Type of task',
    enum: TaskType,
  })
  @IsEnum(TaskType)
  @IsOptional()
  type?: TaskType;

  @ApiPropertyOptional({
    description: 'Status of the task',
    enum: TaskStatus,
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({ description: 'Due date and time of the task' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Priority level of the task',
    enum: TaskPriority,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'User ID of the person assigned to the task',
  })
  @IsString()
  @IsOptional()
  assignedTo?: string;

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

  @ApiPropertyOptional({
    description: 'User ID of the person who updated the task',
  })
  @IsString()
  @IsOptional()
  updatedBy?: string;
}

export class UpdateTaskStatusDto {
  @ApiProperty({
    description: 'New status of the task',
    enum: TaskStatus,
    example: TaskStatus.COMPLETED,
  })
  @IsEnum(TaskStatus)
  @IsNotEmpty()
  status: TaskStatus;

  @ApiPropertyOptional({
    description: 'User ID of the person who updated the task',
  })
  @IsString()
  @IsOptional()
  updatedBy?: string;
}
