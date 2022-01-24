import { Transfer } from './types/schema';
import { Transfer as TransferEvent } from './types/erc20/erc20';
import { addToken } from './utils/tokens';

export function handleTransfer(event: TransferEvent): void {
  addToken(event.address.toHex());

  let transactionHash = event.transaction.hash.toHex();
  let transfer = new Transfer(transactionHash);
  transfer.from = event.params.from.toHex();
  transfer.to = event.params.to.toHex();
  transfer.value = event.params.value;
  transfer.save();
}
