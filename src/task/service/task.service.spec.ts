import { Logger, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ActivityClientService } from '../client/activity-client.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { FilterTasksDto } from '../dto/filter-tasks.dto';
import { SortOrder } from '../dto/pagination.dto';
import { QueryTaskDto } from '../dto/query-task.dto';
import { UpdateTaskDto, UpdateTaskStatusDto } from '../dto/update-task.dto';
import { Task, TaskPriority, TaskStatus, TaskType } from '../model/task.model';
import { TaskRepository } from '../repository/task.repository';
import { ActivityType } from '../types/activity.type';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;

  const mockTaskRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    filterTasks: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    findOverdueTasks: jest.fn(),
    updateTasksStatus: jest.fn(),
  };

  const mockActivityClientService = {
    logActivity: jest.fn(),
  };

  const mockTask: Task = {
    _id: 'task-id-1',
    title: 'Test Task',
    description: 'Test Description',
    dueDate: new Date('2024-01-01'),
    assignedTo: 'user-1',
    contributors: ['user-2'],
    createdBy: 'user-1',
    organizationId: 'org-1',
    type: TaskType.REMINDER,
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
  } as Task;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: TaskRepository,
          useValue: mockTaskRepository,
        },
        {
          provide: ActivityClientService,
          useValue: mockActivityClientService,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new task and log activity', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
        dueDate: new Date('2024-01-01').toISOString(),
        assignedTo: 'user-1',
        contributors: ['user-2'],
        createdBy: 'user-1',
        organizationId: 'org-1',
      };

      mockTaskRepository.create.mockResolvedValue(mockTask);
      mockActivityClientService.logActivity.mockResolvedValue(undefined);

      const result = await service.create(createTaskDto);

      expect(mockTaskRepository.create).toHaveBeenCalledWith(createTaskDto);
      expect(mockActivityClientService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          activityType: ActivityType.TASK_CREATED,
          description: 'Task created by user-1',
          performedBy: 'user-1',
          taskId: 'task-id-1',
        }),
      );
      expect(result).toEqual(mockTask);
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks with default parameters', async () => {
      const queryDto: QueryTaskDto = {};
      const repositoryResponse = { tasks: [mockTask], total: 1 };

      mockTaskRepository.findAll.mockResolvedValue(repositoryResponse);

      const result = await service.findAll(queryDto);

      expect(mockTaskRepository.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual({
        data: [mockTask],
        meta: {
          total: 1,
          page: 1,
          lastPage: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });

    it('should return paginated tasks with custom parameters', async () => {
      const queryDto: QueryTaskDto = {
        page: 2,
        limit: 20,
        status: TaskStatus.COMPLETED,
        sortBy: 'title',
        sortOrder: SortOrder.ASC,
        search: 'important',
      };
      const repositoryResponse = { tasks: [mockTask], total: 1 };

      mockTaskRepository.findAll.mockResolvedValue(repositoryResponse);

      const result = await service.findAll(queryDto);

      expect(mockTaskRepository.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual({
        data: [mockTask],
        meta: {
          total: 1,
          page: 2,
          lastPage: 1,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      });
    });

    it('should handle pagination correctly', async () => {
      const queryDto: QueryTaskDto = {
        page: 1,
        limit: 5,
      };
      const repositoryResponse = { tasks: [mockTask], total: 10 };

      mockTaskRepository.findAll.mockResolvedValue(repositoryResponse);

      const result = await service.findAll(queryDto);

      expect(result.meta).toEqual({
        total: 10,
        page: 1,
        lastPage: 2,
        hasNextPage: true,
        hasPreviousPage: false,
      });
    });
  });

  describe('findById', () => {
    it('should return a task by ID', async () => {
      const taskId = 'task-id-1';
      mockTaskRepository.findById.mockResolvedValue(mockTask);

      const result = await service.findById(taskId);

      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException when task not found', async () => {
      const taskId = 'non-existent-id';
      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(service.findById(taskId)).rejects.toThrow(
        new NotFoundException(`Task with ID ${taskId} not found`),
      );
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
    });
  });

  describe('filterTasks', () => {
    it('should filter tasks with search parameter', async () => {
      const filterDto: FilterTasksDto = {
        leadId: 'lead-1',
        dealId: 'deal-1',
        page: 1,
        limit: 10,
        status: TaskStatus.PENDING,
        sortBy: 'dueDate',
        sortOrder: SortOrder.DESC,
        search: 'important',
      };
      const repositoryResponse = { tasks: [mockTask], total: 1 };

      mockTaskRepository.filterTasks.mockResolvedValue(repositoryResponse);

      const result = await service.filterTasks(filterDto);

      expect(mockTaskRepository.filterTasks).toHaveBeenCalledWith(
        { leadId: 'lead-1', dealId: 'deal-1' },
        1,
        10,
        TaskStatus.PENDING,
        'dueDate',
        SortOrder.DESC,
        'important',
      );
      expect(result).toEqual({
        data: [mockTask],
        meta: {
          total: 1,
          page: 1,
          lastPage: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });

    it('should filter tasks without search parameter', async () => {
      const filterDto: FilterTasksDto = {
        leadId: 'lead-1',
        page: 1,
        limit: 10,
      };
      const repositoryResponse = { tasks: [mockTask], total: 1 };

      mockTaskRepository.filterTasks.mockResolvedValue(repositoryResponse);

      const result = await service.filterTasks(filterDto);

      expect(mockTaskRepository.filterTasks).toHaveBeenCalledWith(
        { leadId: 'lead-1' },
        1,
        10,
        undefined,
        'dueDate',
        SortOrder.DESC,
        undefined,
      );
      expect(result).toEqual({
        data: [mockTask],
        meta: {
          total: 1,
          page: 1,
          lastPage: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });
  });

  describe('update', () => {
    it('should update a task and log activity', async () => {
      const taskId = 'task-id-1';
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        description: 'Updated Description',
        updatedBy: 'user-1',
      };

      const updatedTask = { ...mockTask, ...updateTaskDto };
      mockTaskRepository.update.mockResolvedValue(updatedTask);
      mockActivityClientService.logActivity.mockResolvedValue(undefined);

      const result = await service.update(taskId, updateTaskDto);

      expect(mockTaskRepository.update).toHaveBeenCalledWith(
        taskId,
        updateTaskDto,
      );
      expect(mockActivityClientService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          activityType: ActivityType.TASK_UPDATED,
          description: 'Task updated by user-1',
          performedBy: 'user-1',
          taskId: 'task-id-1',
        }),
      );
      expect(result).toEqual(updatedTask);
    });

    it('should throw NotFoundException when task not found', async () => {
      const taskId = 'non-existent-id';
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        updatedBy: 'user-1',
      };

      mockTaskRepository.update.mockResolvedValue(null);

      await expect(service.update(taskId, updateTaskDto)).rejects.toThrow(
        new NotFoundException(`Task with ID ${taskId} not found`),
      );
      expect(mockTaskRepository.update).toHaveBeenCalledWith(
        taskId,
        updateTaskDto,
      );
    });
  });

  describe('delete', () => {
    it('should delete a task and log activity', async () => {
      const taskId = 'task-id-1';
      const deleteTaskDto = { deletedBy: 'user-1' };

      mockTaskRepository.softDelete.mockResolvedValue(mockTask);
      mockActivityClientService.logActivity.mockResolvedValue(undefined);

      const result = await service.delete(taskId, deleteTaskDto);

      expect(mockTaskRepository.softDelete).toHaveBeenCalledWith(
        taskId,
        'user-1',
      );
      expect(mockActivityClientService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          activityType: ActivityType.TASK_DELETED,
          description: 'Task deleted by user-1',
          performedBy: 'user-1',
          taskId: 'task-id-1',
        }),
      );
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException when task not found', async () => {
      const taskId = 'non-existent-id';
      const deleteTaskDto = { deletedBy: 'user-1' };

      mockTaskRepository.softDelete.mockResolvedValue(null);

      await expect(service.delete(taskId, deleteTaskDto)).rejects.toThrow(
        new NotFoundException(`Task with ID ${taskId} not found`),
      );
      expect(mockTaskRepository.softDelete).toHaveBeenCalledWith(
        taskId,
        'user-1',
      );
    });
  });

  describe('updateStatus', () => {
    it('should update task status and log activity', async () => {
      const taskId = 'task-id-1';
      const updateTaskStatusDto: UpdateTaskStatusDto = {
        status: TaskStatus.COMPLETED,
        updatedBy: 'user-1',
      };

      const taskToUpdate = {
        ...mockTask,
        status: TaskStatus.PENDING,
        save: jest.fn().mockResolvedValue({
          ...mockTask,
          status: TaskStatus.COMPLETED,
        }),
      };

      mockTaskRepository.findById.mockResolvedValue(taskToUpdate);
      mockActivityClientService.logActivity.mockResolvedValue(undefined);

      const result = await service.updateStatus(taskId, updateTaskStatusDto);

      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(taskToUpdate.save).toHaveBeenCalled();
      expect(mockActivityClientService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          activityType: ActivityType.TASK_UPDATED,
          description: 'Task updated by user-1',
          performedBy: 'user-1',
          taskId: 'task-id-1',
        }),
      );
      expect(result.status).toBe(TaskStatus.COMPLETED);
      expect(result).toMatchObject({
        ...mockTask,
        status: TaskStatus.COMPLETED,
      });
    });

    it('should throw NotFoundException when task not found', async () => {
      const taskId = 'non-existent-id';
      const updateTaskStatusDto: UpdateTaskStatusDto = {
        status: TaskStatus.COMPLETED,
        updatedBy: 'user-1',
      };

      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateStatus(taskId, updateTaskStatusDto),
      ).rejects.toThrow(
        new NotFoundException(`Task with ID ${taskId} not found`),
      );
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
    });
  });

  describe('checkOverdueTasks', () => {
    it('should update overdue tasks and log activities', async () => {
      const overdueTasks = [
        { ...mockTask, _id: 'task-1' },
        { ...mockTask, _id: 'task-2' },
      ];

      mockTaskRepository.findOverdueTasks.mockResolvedValue(overdueTasks);
      mockTaskRepository.updateTasksStatus.mockResolvedValue(2);
      mockActivityClientService.logActivity.mockResolvedValue(undefined);

      await service.checkOverdueTasks();

      expect(mockTaskRepository.findOverdueTasks).toHaveBeenCalled();
      expect(mockTaskRepository.updateTasksStatus).toHaveBeenCalledWith(
        ['task-1', 'task-2'],
        TaskStatus.OVERDUE,
      );
      expect(mockActivityClientService.logActivity).toHaveBeenCalledTimes(2);
    });

    it('should handle no overdue tasks', async () => {
      mockTaskRepository.findOverdueTasks.mockResolvedValue([]);

      await service.checkOverdueTasks();

      expect(mockTaskRepository.findOverdueTasks).toHaveBeenCalled();
      expect(mockTaskRepository.updateTasksStatus).not.toHaveBeenCalled();
      expect(mockActivityClientService.logActivity).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      mockTaskRepository.findOverdueTasks.mockRejectedValue(error);

      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await service.checkOverdueTasks();

      expect(loggerSpy).toHaveBeenCalledWith(
        'Error checking for overdue tasks:',
        error,
      );
    });
  });
});
