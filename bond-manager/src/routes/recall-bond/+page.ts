import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = ({ url }) => {
  console.log("url.searchParams.get('txID')", url.searchParams.get('txID'));
  return {
    txID: url.searchParams.get('txID') as string,
    proof: url.searchParams.get('proof') as string,
    recipient: url.searchParams.get('recipient') as string,
    bondNft: url.searchParams.get('bondNft') as string,
    sender: url.searchParams.get('sender') as string
  };
};
