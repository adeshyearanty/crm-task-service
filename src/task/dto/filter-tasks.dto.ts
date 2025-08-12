import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { TaskStatus } from '../model/task.model';
import { SortOrder } from '../dto/pagination.dto';

export class FilterTasksDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  leadId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dealId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contactId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  eventId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  noteId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mailId?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({ enum: TaskStatus, required: false })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({ required: false, default: 'dueDate' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'dueDate';

  @ApiProperty({ enum: SortOrder, required: false, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiProperty({
    required: false,
    description:
      'Search term for filtering tasks by title, description, assignee, or contributors',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
