import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TaskStatus, TaskPriority, TaskType } from '../model/task.model';
import { PaginationDto, SortOrder } from './pagination.dto';

export class QueryTaskDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter tasks by status',
    enum: TaskStatus,
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Filter tasks by priority',
    enum: TaskPriority,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'Filter tasks by type',
    enum: TaskType,
  })
  @IsEnum(TaskType)
  @IsOptional()
  type?: TaskType;

  @ApiPropertyOptional({
    description: 'Filter tasks by assigned user ID',
  })
  @IsString()
  @IsOptional()
  assignedTo?: string;

  @ApiPropertyOptional({
    description: 'Filter tasks by organization ID',
  })
  @IsString()
  @IsOptional()
  organizationId?: string;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'dueDate',
    default: 'dueDate',
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'dueDate';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;
}
