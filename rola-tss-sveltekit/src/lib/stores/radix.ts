import type { WalletData } from '@radixdlt/radix-dapp-toolkit';
import { writable } from 'svelte/store';

export const walletDataStore = writable<WalletData | undefined>(undefined);
