import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateTaskDto } from '../dto/create-task.dto';
import { SortOrder } from '../dto/pagination.dto';
import { QueryTaskDto } from '../dto/query-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { Task, TaskStatus } from '../model/task.model';

@Injectable()
export class TaskRepository {
  private readonly logger = new Logger(TaskRepository.name);

  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = new this.taskModel(createTaskDto);
    return task.save();
  }

  async findAll(
    query: QueryTaskDto,
  ): Promise<{ tasks: Task[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      type,
      assignedTo,
      organizationId,
      sortBy = 'dueDate',
      sortOrder = SortOrder.DESC,
      search,
    } = query;

    const filter: Record<string, any> = {};

    if (status) {
      filter.status = status;
    }
    if (priority) {
      filter.priority = priority;
    }
    if (type) {
      filter.type = type;
    }
    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }
    if (organizationId) {
      filter.organizationId = organizationId;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { assignedTo: { $regex: search, $options: 'i' } },
        { contributors: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions: Record<string, any> = {};
    sortOptions[sortBy] = sortOrder === SortOrder.ASC ? 1 : -1;

    const [tasks, total] = await Promise.all([
      this.taskModel
        .find(filter)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.taskModel.countDocuments(filter),
    ]);

    return { tasks, total };
  }

  async findById(id: string): Promise<Task | null> {
    return this.taskModel.findById(id).exec();
  }

  async filterTasks(
    ids: {
      leadId?: string;
      dealId?: string;
      contactId?: string;
      eventId?: string;
      noteId?: string;
      mailId?: string;
    },
    page: number,
    limit: number,
    status?: TaskStatus,
    sortBy: string = 'dueDate',
    sortOrder: SortOrder = SortOrder.DESC,
    search?: string,
  ): Promise<{ tasks: Task[]; total: number }> {
    const query: Record<string, any> = {};

    // Add any provided IDs to query
    for (const key of Object.keys(ids)) {
      const value = ids[key as keyof typeof ids];
      if (typeof value === 'string' && value.trim() !== '') {
        query[key] = value;
      }
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { assignedTo: { $regex: search, $options: 'i' } },
        { contributors: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions: Record<string, any> = {};
    sortOptions[sortBy] = sortOrder === SortOrder.ASC ? 1 : -1;

    const [tasks, total] = await Promise.all([
      this.taskModel
        .find(query)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.taskModel.countDocuments(query),
    ]);

    return { tasks, total };
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task | null> {
    return this.taskModel
      .findByIdAndUpdate(id, updateTaskDto, { new: true })
      .exec();
  }

  async softDelete(id: string, deletedBy: string): Promise<Task | null> {
    return this.taskModel
      .findByIdAndUpdate(id, { deletedBy }, { new: true })
      .exec();
  }

  async findOverdueTasks(): Promise<Task[]> {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);

    return this.taskModel
      .find({
        status: TaskStatus.PENDING,
        dueDate: {
          $lt: now, // Due date is less than current time
          $gte: oneMinuteAgo, // But not more than 1 minute ago
        },
      })
      .exec();
  }

  async updateTasksStatus(ids: string[], status: TaskStatus): Promise<number> {
    const result = await this.taskModel
      .updateMany(
        { _id: { $in: ids } },
        {
          $set: {
            status,
            updatedAt: new Date(),
          },
        },
      )
      .exec();
    return result.modifiedCount;
  }
}
