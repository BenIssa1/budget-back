import { Test, TestingModule } from '@nestjs/testing';
import { YeastarController } from './yeastar.controller';

describe('YeastarController', () => {
  let controller: YeastarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YeastarController],
    }).compile();

    controller = module.get<YeastarController>(YeastarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
