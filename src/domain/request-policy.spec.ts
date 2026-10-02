import { ForbiddenException, UnprocessableEntityException } from '@nestjs/common';
import { RequestStatus, UserRole } from '@prisma/client';
import { RequestPolicy } from './request-policy';
describe('RequestPolicy', () => {
  const owner = { id: 'owner', role: UserRole.SOLICITANTE };
  const attendant = { id: 'agent', role: UserRole.ATENDENTE };
  it('impede solicitante de ler solicitação alheia', () =>
    expect(() => RequestPolicy.assertCanRead(owner, 'other')).toThrow(ForbiddenException));
  it('permite ao atendente ler qualquer solicitação', () =>
    expect(() => RequestPolicy.assertCanRead(attendant, 'other')).not.toThrow());
  it('reserva edição e exclusão ao autor', () =>
    expect(() => RequestPolicy.assertOwner(attendant, 'owner')).toThrow(ForbiddenException));
  it('impede solicitante de alterar status', () =>
    expect(() =>
      RequestPolicy.assertStatusTransition(
        owner,
        RequestStatus.ABERTO,
        RequestStatus.EM_ATENDIMENTO,
      ),
    ).toThrow(ForbiddenException));
  it('aceita a sequência obrigatória', () => {
    expect(() =>
      RequestPolicy.assertStatusTransition(
        attendant,
        RequestStatus.ABERTO,
        RequestStatus.EM_ATENDIMENTO,
      ),
    ).not.toThrow();
    expect(() =>
      RequestPolicy.assertStatusTransition(
        attendant,
        RequestStatus.EM_ATENDIMENTO,
        RequestStatus.CONCLUIDO,
      ),
    ).not.toThrow();
  });
  it('impede pular ou retroceder status', () => {
    expect(() =>
      RequestPolicy.assertStatusTransition(
        attendant,
        RequestStatus.ABERTO,
        RequestStatus.CONCLUIDO,
      ),
    ).toThrow(UnprocessableEntityException);
    expect(() =>
      RequestPolicy.assertStatusTransition(
        attendant,
        RequestStatus.CONCLUIDO,
        RequestStatus.ABERTO,
      ),
    ).toThrow(UnprocessableEntityException);
  });
});
