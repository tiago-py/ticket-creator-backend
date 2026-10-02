import { ForbiddenException, UnprocessableEntityException } from '@nestjs/common';
import { RequestStatus, UserRole } from '@prisma/client';

export type Actor = { id: string; role: UserRole };

export class RequestPolicy {
  static assertCanRead(actor: Actor, requesterId: string) {
    if (actor.role === UserRole.SOLICITANTE && actor.id !== requesterId)
      throw new ForbiddenException('Você não pode acessar esta solicitação');
  }
  static assertOwner(actor: Actor, requesterId: string) {
    if (actor.id !== requesterId)
      throw new ForbiddenException('Somente o autor pode alterar esta solicitação');
  }
  static assertStatusTransition(actor: Actor, current: RequestStatus, next: RequestStatus) {
    if (actor.role !== UserRole.ATENDENTE)
      throw new ForbiddenException('Somente atendentes podem alterar o status');
    const allowed: Record<RequestStatus, RequestStatus | null> = {
      ABERTO: RequestStatus.EM_ATENDIMENTO,
      EM_ATENDIMENTO: RequestStatus.CONCLUIDO,
      CONCLUIDO: null,
    };
    if (allowed[current] !== next)
      throw new UnprocessableEntityException('Transição de status inválida');
  }
}
