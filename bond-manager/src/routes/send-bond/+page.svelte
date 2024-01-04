<script lang="ts">
  import Label from '$lib/components/Label.svelte';
  import Select from '$lib/components/Select.svelte';
  import Input from '$lib/components/Input.svelte';
  import Button from '$lib/components/Button.svelte';
  import { dAppToolkit, walletDataStore } from '$lib/stores/radix';
  import { derived, writable } from 'svelte/store';
  import SelectNft from '$lib/components/SelectNft.svelte';

  let accounts: { id: string; label: string }[] = [];
  let selectedFromAccount: string | undefined;
  let selectedToAccount: string | undefined;
  let selectedBondNft: string;
  let selectedProof: string;

  let status = writable<'initial' | 'sending'>('initial');

  $: {
    accounts =
      $walletDataStore?.accounts.map((account): { id: string; label: string } => ({
        id: account.address,
        label: account.label
      })) ?? [];
  }

  const handleSendToWallet = () => {
    status.set('sending');

    const [selectedBondNftResourceAddress, selectedBondNftId] = selectedBondNft!.split(':');
    const [selectedProofResourceAddress, selectedProofId] = selectedProof!.split(':');

    const transactionManifest = `
    CALL_METHOD
        Address("${selectedFromAccount}")
        "create_proof_of_non_fungibles"
        Address("${selectedProofResourceAddress}")
        Array<NonFungibleLocalId>(
            NonFungibleLocalId("${selectedProofId}")
        )
    ;

    CALL_METHOD
      Address("${selectedFromAccount}")
      "withdraw_non_fungibles"
      Address("${selectedBondNftResourceAddress}")
      Array<NonFungibleLocalId>(
          NonFungibleLocalId("${selectedBondNftId}")
      )
    ;

    TAKE_NON_FUNGIBLES_FROM_WORKTOP
        Address("${selectedBondNftResourceAddress}")
        Array<NonFungibleLocalId>(
            NonFungibleLocalId("${selectedBondNftId}")
        )
        Bucket("bucket1")
    ;
    CALL_METHOD
        Address("${selectedToAccount}")
        "try_deposit_or_abort"
        Bucket("bucket1")
        Enum<0u8>()
    ;`;

    $dAppToolkit?.walletApi
      .sendTransaction({
        transactionManifest,
        message: 'Sending bond'
      })
      .map(() => {
        $status = 'initial';
        selectedFromAccount = undefined;
        selectedToAccount = undefined;
        selectedBondNft = '';
        selectedProof = '';
      })
      .mapErr((error) => {
        $status = 'initial';
        console.error(error);
      });
  };

  let disabled = derived([status], ([$status]) => $status === 'sending');
  let isSendToWalletButtonDisabled = true;

  $: {
    isSendToWalletButtonDisabled =
      $status === 'sending' ||
      !selectedFromAccount ||
      !selectedToAccount ||
      !selectedBondNft ||
      !selectedProof;
  }
</script>

<div class="content">
  <div class="item">
    <Label disabled={$disabled}>Select from account</Label>
    <Select items={accounts} bind:selected={selectedFromAccount} disabled={$disabled} />
  </div>

  {#if selectedFromAccount}
    <div class="item">
      <Label disabled={$disabled}>Select Non Fungible Bond</Label>
      <SelectNft
        accountAddress={selectedFromAccount}
        bind:selected={selectedBondNft}
        disabled={$disabled}
      />
    </div>
  {/if}

  {#if selectedFromAccount}
    <div class="item">
      <Label disabled={$disabled}>Select manager badge to present</Label>
      <SelectNft
        accountAddress={selectedFromAccount}
        bind:selected={selectedProof}
        disabled={$disabled}
      />
    </div>
  {/if}

  <div class="item">
    <Label disabled={$disabled}>Send to account</Label>
    <Input bind:value={selectedToAccount} disabled={$disabled} />
  </div>

  <Button disabled={isSendToWalletButtonDisabled} on:click={() => handleSendToWallet()}>
    {#if $disabled}
      Sending
    {:else}
      Send to wallet
    {/if}
  </Button>
</div>

<style>
  .content {
    width: 40rem;
  }
  .item {
    margin-bottom: 1rem;
  }
</style>
