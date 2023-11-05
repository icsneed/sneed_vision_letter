import { Actor, HttpAgent } from '@dfinity/agent';
import _SERVICE from '../asset-canister/service';
import { idlFactory } from '../asset-canister/idl';

export async function getLetterHtml() {
  const agent = new HttpAgent({
    host:
      DFX_NETWORK === 'ic'
        ? `https://${LETTER_CANISTER_ID}.ic0.app`
        : `http://127.0.0.1:8000/?canisterId=${LETTER_CANISTER_ID}`,
  });
  const actor = Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId: LETTER_CANISTER_ID,
  });

  const html = await actor.get({
    key: '/index.html',
    accept_encodings: ['identity'],
  });

  return new TextDecoder().decode(html.content);
}
