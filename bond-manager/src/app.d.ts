// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      identityAddress: string;
      dAppDefinitionAddress: string;
      networkId: number;
    }
    // interface PageData {}
    // interface Platform {}
  }
}

export {};
