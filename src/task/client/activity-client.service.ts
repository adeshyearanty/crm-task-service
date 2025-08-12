import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ActivityClientService {
  private readonly logger = new Logger(ActivityClientService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private get API_BASE_URL(): string {
    const url = this.configService.get<string>('ACTIVITY_CLIENT_URL');
    if (!url) {
      this.logger.error('ACTIVITY_CLIENT_URL is not defined in configuration');
      throw new InternalServerErrorException(
        'Activity client base URL is not configured',
      );
    }
    return url;
  }

  async logActivity(payload: any): Promise<any> {
    try {
      const response: AxiosResponse = await this.httpService.axiosRef.post(
        `${this.API_BASE_URL}`,
        payload,
        {
          headers: {
            'x-api-key': this.configService.get<string>('X_API_KEY'),
          },
        },
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        'Error while logging activity',
        axiosError?.response?.data || axiosError.message,
      );
      throw new InternalServerErrorException('Failed to log activity');
    }
  }
}
