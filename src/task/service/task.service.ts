import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { ActivityClientService } from '../client/activity-client.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { FilterTasksDto } from '../dto/filter-tasks.dto';
import { PaginatedResponse, SortOrder } from '../dto/pagination.dto';
import { QueryTaskDto } from '../dto/query-task.dto';
import { UpdateTaskDto, UpdateTaskStatusDto } from '../dto/update-task.dto';
import { Task, TaskStatus } from '../model/task.model';
import { TaskRepository } from '../repository/task.repository';
import { ActivityType } from '../types/activity.type';
import { buildActivityLogFromDto } from '../utils/activity.utils';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly activityClientService: ActivityClientService,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = await this.taskRepository.create(createTaskDto);

    const logDto = buildActivityLogFromDto(
      task,
      ActivityType.TASK_CREATED,
      `Task created by ${createTaskDto.createdBy}`,
      createTaskDto.createdBy,
      String(task._id),
    );

    await this.activityClientService.logActivity(logDto);

    return task;
  }

  async findAll(queryDto: QueryTaskDto): Promise<PaginatedResponse<any>> {
    const { tasks, total } = await this.taskRepository.findAll(queryDto);
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const lastPage = Math.ceil(total / limit);

    return {
      data: tasks,
      meta: {
        total,
        page,
        lastPage,
        hasNextPage: page < lastPage,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findById(id: string): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async filterTasks(dto: FilterTasksDto): Promise<PaginatedResponse<any>> {
    const {
      leadId,
      dealId,
      contactId,
      eventId,
      noteId,
      mailId,
      page = 1,
      limit = 10,
      status,
      sortBy = 'dueDate',
      sortOrder = SortOrder.DESC,
      search,
    } = dto;

    const { tasks, total } = await this.taskRepository.filterTasks(
      { leadId, dealId, contactId, eventId, noteId, mailId },
      page,
      limit,
      status,
      sortBy,
      sortOrder,
      search,
    );

    const lastPage = Math.ceil(total / limit);

    return {
      data: tasks,
      meta: {
        total,
        page,
        lastPage,
        hasNextPage: page < lastPage,
        hasPreviousPage: page > 1,
      },
    };
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepository.update(id, updateTaskDto);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const logDto = buildActivityLogFromDto(
      task,
      ActivityType.TASK_UPDATED,
      `Task updated by ${updateTaskDto.updatedBy}`,
      updateTaskDto.updatedBy || 'system',
      String(task._id),
    );

    await this.activityClientService.logActivity(logDto);

    return task;
  }

  async delete(
    id: string,
    deleteTaskDto: { deletedBy: string },
  ): Promise<Task> {
    const task = await this.taskRepository.softDelete(
      id,
      deleteTaskDto.deletedBy,
    );
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const logDto = buildActivityLogFromDto(
      task,
      ActivityType.TASK_DELETED,
      `Task deleted by ${deleteTaskDto.deletedBy}`,
      deleteTaskDto.deletedBy || 'system',
      String(task._id),
    );

    await this.activityClientService.logActivity(logDto);

    return task;
  }

  async updateStatus(
    id: string,
    updateTaskStatusDto: UpdateTaskStatusDto,
  ): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    task.status = updateTaskStatusDto.status;
    await task.save();

    const logDto = buildActivityLogFromDto(
      task,
      ActivityType.TASK_UPDATED,
      `Task updated by ${updateTaskStatusDto.updatedBy}`,
      updateTaskStatusDto.updatedBy || 'system',
      String(task._id),
    );

    await this.activityClientService.logActivity(logDto);

    return task;
  }

  @Cron('0 * * * *') // Run every hour
  async checkOverdueTasks() {
    try {
      const now = new Date();
      const overdueTasks = await this.taskRepository.findOverdueTasks();

      if (overdueTasks.length > 0) {
        const taskIds = overdueTasks.map((task: Task) => String(task._id));
        await this.taskRepository.updateTasksStatus(
          taskIds,
          TaskStatus.OVERDUE,
        );

        // Use Promise.all for concurrent execution
        await Promise.all(
          overdueTasks.map(async (task) => {
            const logDto = buildActivityLogFromDto(
              task,
              ActivityType.TASK_UPDATED,
              `Task updated by system`,
              'system',
              String(task._id),
            );

            await this.activityClientService.logActivity(logDto);
          }),
        );

        this.logger.debug(
          `Updated ${overdueTasks.length} tasks to OVERDUE status at ${now.toISOString()}`,
        );

        // Log details of each overdue task for debugging
        overdueTasks.forEach((task) => {
          this.logger.debug(
            `Task ${String(task._id)} (${task.title}) marked as overdue. Due date was: ${task.dueDate instanceof Date ? task.dueDate.toISOString() : String(task.dueDate)}`,
          );
        });
      }
    } catch (error) {
      this.logger.error('Error checking for overdue tasks:', error);
    }
  }
}
