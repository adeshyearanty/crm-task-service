import { Test, TestingModule } from '@nestjs/testing';

import { CreateTaskDto } from '../dto/create-task.dto';
import { FilterTasksDto } from '../dto/filter-tasks.dto';
import { SortOrder } from '../dto/pagination.dto';
import { UpdateTaskDto, UpdateTaskStatusDto } from '../dto/update-task.dto';
import { Task, TaskPriority, TaskStatus, TaskType } from '../model/task.model';
import { TaskService } from '../service/task.service';
import { TaskController } from './task.controller';

describe('TaskController', () => {
  let controller: TaskController;

  const mockTaskService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    filterTasks: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updateStatus: jest.fn(),
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

  const mockPaginatedResponse = {
    data: [mockTask],
    meta: {
      total: 1,
      page: 1,
      lastPage: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
        dueDate: new Date('2024-01-01').toISOString(),
        assignedTo: 'user-1',
        contributors: ['user-2'],
        createdBy: 'user-1',
        organizationId: 'org-1',
      };

      mockTaskService.create.mockResolvedValue(mockTask);

      const result = await controller.create(createTaskDto);

      expect(mockTaskService.create).toHaveBeenCalledWith(createTaskDto);
      expect(result).toEqual(mockTask);
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks with default parameters', async () => {
      mockTaskService.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll();

      expect(mockTaskService.findAll).toHaveBeenCalledWith({
        page: undefined,
        limit: undefined,
        status: undefined,
        sortBy: 'dueDate',
        sortOrder: SortOrder.DESC,
        search: undefined,
      });
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should return paginated tasks with custom parameters', async () => {
      const page = 2;
      const limit = 20;
      const status = TaskStatus.COMPLETED;
      const sortBy = 'title';
      const sortOrder = SortOrder.ASC;
      const search = 'test';

      mockTaskService.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll(
        page,
        limit,
        status,
        sortBy,
        sortOrder,
        search,
      );

      expect(mockTaskService.findAll).toHaveBeenCalledWith({
        page,
        limit,
        status,
        sortBy,
        sortOrder,
        search,
      });
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('findOne', () => {
    it('should return a task by ID', async () => {
      const taskId = 'task-id-1';
      mockTaskService.findById.mockResolvedValue(mockTask);

      const result = await controller.findOne(taskId);

      expect(mockTaskService.findById).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(mockTask);
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

      mockTaskService.filterTasks.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.filterTasks(filterDto);

      expect(mockTaskService.filterTasks).toHaveBeenCalledWith(filterDto);
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should filter tasks without search parameter', async () => {
      const filterDto: FilterTasksDto = {
        leadId: 'lead-1',
        page: 1,
        limit: 10,
      };

      mockTaskService.filterTasks.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.filterTasks(filterDto);

      expect(mockTaskService.filterTasks).toHaveBeenCalledWith(filterDto);
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const taskId = 'task-id-1';
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        description: 'Updated Description',
        updatedBy: 'user-1',
      };

      const updatedTask = { ...mockTask, ...updateTaskDto };
      mockTaskService.update.mockResolvedValue(updatedTask);

      const result = await controller.update(taskId, updateTaskDto);

      expect(mockTaskService.update).toHaveBeenCalledWith(
        taskId,
        updateTaskDto,
      );
      expect(result).toEqual(updatedTask);
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      const taskId = 'task-id-1';
      const deleteTaskDto = { deletedBy: 'user-1' };

      mockTaskService.delete.mockResolvedValue(mockTask);

      const result = await controller.remove(taskId, deleteTaskDto);

      expect(mockTaskService.delete).toHaveBeenCalledWith(
        taskId,
        deleteTaskDto,
      );
      expect(result).toEqual(mockTask);
    });
  });

  describe('updateStatus', () => {
    it('should update task status', async () => {
      const taskId = 'task-id-1';
      const updateTaskStatusDto: UpdateTaskStatusDto = {
        status: TaskStatus.COMPLETED,
        updatedBy: 'user-1',
      };

      const updatedTask = { ...mockTask, status: TaskStatus.COMPLETED };
      mockTaskService.updateStatus.mockResolvedValue(updatedTask);

      const result = await controller.updateStatus(taskId, updateTaskStatusDto);

      expect(mockTaskService.updateStatus).toHaveBeenCalledWith(
        taskId,
        updateTaskStatusDto,
      );
      expect(result).toEqual(updatedTask);
    });
  });
});
