import type { RadixDappToolkit, WalletData } from '@radixdlt/radix-dapp-toolkit';
import { writable } from 'svelte/store';

export const walletDataStore = writable<WalletData | undefined>(undefined);

export const dAppToolkit = writable<RadixDappToolkit | undefined>(undefined);
