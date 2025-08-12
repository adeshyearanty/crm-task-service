import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Lead Status
import { HttpModule } from '@nestjs/axios';
import { ActivityClientService } from './client/activity-client.service';
import { TaskController } from './controller/task.controller';
import { Task, TaskSchema } from './model/task.model';
import { TaskRepository } from './repository/task.repository';
import { TaskService } from './service/task.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    HttpModule,
  ],
  controllers: [TaskController],
  providers: [TaskService, TaskRepository, ActivityClientService],
})
export class TaskModule {}
