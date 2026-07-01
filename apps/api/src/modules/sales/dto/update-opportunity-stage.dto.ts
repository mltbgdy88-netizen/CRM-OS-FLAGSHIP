import { IsUUID } from 'class-validator';

export class UpdateOpportunityStageDto {
  @IsUUID()
  stageId!: string;
}
