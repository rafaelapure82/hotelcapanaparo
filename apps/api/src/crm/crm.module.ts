import { Module, Global } from '@nestjs/common';
import { GuestService } from './guest.service';
import { GuestController } from './guest.controller';

@Global()
@Module({
  controllers: [GuestController],
  providers: [GuestService],
  exports: [GuestService],
})
export class CrmModule {}
