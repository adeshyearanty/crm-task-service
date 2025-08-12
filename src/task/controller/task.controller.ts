import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto, UpdateTaskStatusDto } from '../dto/update-task.dto';
import { TaskStatus } from '../model/task.model';
import { SortOrder } from '../dto/pagination.dto';
import { TaskService } from '../service/task.service';
import { FilterTasksDto } from '../dto/filter-tasks.dto';

@ApiTags('Tasks')
@Controller({
  version: '1',
  path: 'tasks',
})
export class TaskController {
  private readonly logger = new Logger('TaskController');
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated tasks with metadata',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: TaskStatus })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    default: 'dueDate',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description:
      'Search term for filtering tasks by title, description, assignee, or contributors',
  })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: TaskStatus,
    @Query('sortBy') sortBy: string = 'dueDate',
    @Query('sortOrder') sortOrder: SortOrder = SortOrder.DESC,
    @Query('search') search?: string,
  ) {
    return this.taskService.findAll({
      page,
      limit,
      status,
      sortBy,
      sortOrder,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiResponse({ status: 200, description: 'Task found' })
  findOne(@Param('id') id: string) {
    this.logger.log(`Finding task by ID: ${id}`);
    return this.taskService.findById(id);
  }

  @Post('filter')
  @ApiOperation({ summary: 'Filter tasks by related entity IDs' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated tasks for matching entities',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        leadId: { type: 'string' },
        dealId: { type: 'string' },
        contactId: { type: 'string' },
        eventId: { type: 'string' },
        noteId: { type: 'string' },
        mailId: { type: 'string' },
        page: { type: 'number', default: 1 },
        limit: { type: 'number', default: 10 },
        status: { enum: Object.values(TaskStatus) },
        sortBy: { type: 'string', default: 'dueDate' },
        sortOrder: { enum: Object.values(SortOrder), default: SortOrder.DESC },
        search: {
          type: 'string',
          description:
            'Search term for filtering tasks by title, description, assignee, or contributors',
        },
      },
    },
  })
  filterTasks(@Body() body: FilterTasksDto) {
    return this.taskService.filterTasks(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        deletedBy: {
          type: 'string',
          example: 'system',
        },
      },
      required: ['deletedBy'],
    },
  })
  remove(
    @Param('id') id: string,
    @Body() deleteTaskDto: { deletedBy: string },
  ) {
    return this.taskService.delete(id, deleteTaskDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update task status' })
  @ApiResponse({ status: 200, description: 'Task status updated successfully' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
  ) {
    return this.taskService.updateStatus(id, updateTaskStatusDto);
  }
}
