import { Test, TestingModule } from '@nestjs/testing';
import { YeastarService } from './yeastar.service';

describe('YeastarService', () => {
  let service: YeastarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YeastarService],
    }).compile();

    service = module.get<YeastarService>(YeastarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
