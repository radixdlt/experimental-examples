<script lang="ts">
  import Label from '$lib/components/Label.svelte';
  import Select from '$lib/components/Select.svelte';
  import Input from '$lib/components/Input.svelte';
  import * as z from 'zod';

  import { dAppToolkit, walletDataStore } from '$lib/stores/radix';
  import { derived, writable } from 'svelte/store';
  import type {
    EntityMetadataCollection,
    StateNonFungibleLocationResponseItem
  } from '@radixdlt/radix-dapp-toolkit';
  import Button from '$lib/components/Button.svelte';
  import BigNumber from 'bignumber.js';
  import { shortenAddress } from '$lib/utils/shorten-address';
  import { createDistributeDividendsTransactionManifest } from '$lib/transaction-manifests/distribute-dividends';

  let accounts: { id: string; label: string }[] = [];
  let selectedFromAccount: string | undefined;

  let nfResources: { id: string; label: string }[] = [];
  let selectedNfResource: string | undefined;

  let fungibleResources: { id: string; label: string }[] = [];
  let selectedFungibleResource: string | undefined;

  let valueToDistribute: string;

  let status = writable<'initial' | 'sending'>('initial');
  let disabled = derived([status], ([$status]) => $status === 'sending');

  let isSendToWalletButtonDisabled = true;

  $: {
    isSendToWalletButtonDisabled =
      $status === 'sending' ||
      !selectedFromAccount ||
      !valueToDistribute ||
      !selectedFungibleResource;
  }

  let bondHolders: {
    nonFungibleId: string;
    vaultAddresses: string;
    resourceAddress: string;
    address: string;
    holderAddress: string;
  }[] = [];

  $: {
    accounts =
      $walletDataStore?.accounts.map((account): { id: string; label: string } => ({
        id: account.address,
        label: account.label
      })) ?? [];
  }

  const getName = (explicit_metadata?: EntityMetadataCollection) => {
    const resourceNameValue = explicit_metadata?.items.find((item) => item.key === 'name')?.value;

    const resourceName =
      resourceNameValue && resourceNameValue.typed.type === 'String'
        ? resourceNameValue.typed.value
        : 'Unnamed Resource';

    return resourceName;
  };

  $: {
    if (selectedFromAccount)
      $dAppToolkit?.gatewayApi.state
        .getEntityDetailsVaultAggregated([selectedFromAccount], { explicitMetadata: ['name'] })
        .then(([response]) => {
          const nfResources = response.non_fungible_resources.items
            .map((resource) => ({
              id: resource.resource_address,
              label: getName(resource.explicit_metadata)
            }))
            .flat(2);

          const fungibleResources = response.fungible_resources.items.map((resource) => ({
            id: resource.resource_address,
            label: getName(resource.explicit_metadata)
          }));

          return { nfResources, fungibleResources };
        })
        .then((value) => {
          nfResources = value.nfResources;
          fungibleResources = value.fungibleResources;
        });
  }

  $: {
    if (selectedNfResource) {
      $dAppToolkit?.gatewayApi.state
        .getNonFungibleIds(selectedNfResource)
        .then(({ items: ids }) => {
          return $dAppToolkit?.gatewayApi.state
            .getNonFungibleLocation(selectedNfResource!, ids)
            .then((locationResponse) => {
              const vaultAddresses = locationResponse
                .map((item) => item.owning_vault_address)
                .filter((item): item is string => !!item);

              const locationMap = locationResponse.reduce((acc, item) => {
                if (item.owning_vault_address) {
                  if (acc[item.owning_vault_address]) acc[item.owning_vault_address].push(item);
                  else acc[item.owning_vault_address] = [item];
                }
                return acc;
              }, {} as Record<string, StateNonFungibleLocationResponseItem[]>);

              return $dAppToolkit?.gatewayApi.state
                .getEntityDetailsVaultAggregated(vaultAddresses, {
                  ancestorIdentities: true
                })
                .then((entityDetailResponse) => {
                  return entityDetailResponse
                    .map((item) => {
                      const items = locationMap[item.address];

                      return items.map(({ non_fungible_id: nonFungibleId }) => ({
                        nonFungibleId,
                        vaultAddresses: item.address,
                        resourceAddress: selectedNfResource!,
                        address: `${selectedNfResource}:${nonFungibleId}`,
                        holderAddress: item.ancestor_identities?.owner_address!
                      }));
                    })
                    .flat(2);
                })
                .then((items) => {
                  bondHolders = items.filter((item) => item.holderAddress !== selectedFromAccount);
                });
            });
        });
    }
  }

  let dividendsPerRecipient = '0';

  $: {
    dividendsPerRecipient = new BigNumber(valueToDistribute)
      .dividedBy(bondHolders.length)
      .toString();
  }

  const handleSendToWallet = () => {
    const transactionManifest = createDistributeDividendsTransactionManifest({
      accountAddress: selectedFromAccount!,
      resourceAddress: selectedFungibleResource!,
      amount: valueToDistribute,
      amountPerRecipient: dividendsPerRecipient,
      recipients: bondHolders.map((item) => item.holderAddress)
    });
    debugger;
    $status = 'sending';
    $dAppToolkit?.walletApi
      .sendTransaction({ transactionManifest, message: 'Distributing dividends' })
      .map(() => {
        $status = 'initial';
        selectedFromAccount = undefined;
        selectedNfResource = undefined;
        valueToDistribute = '0';
        bondHolders = [];
      });
  };
</script>

<div class="content">
  <div class="item">
    <Label disabled={$disabled}>Select from account</Label>
    <Select items={accounts} bind:selected={selectedFromAccount} disabled={$disabled} />
  </div>

  <!-- {#if selectedFromAccount}
    <div class="item">
      <Label disabled={$disabled}>Select bond resource</Label>
      <Select items={nfResources} bind:selected={selectedNfResource} disabled={$disabled} />
    </div>
  {/if} -->

  {#if selectedFromAccount}
    <div class="item">
      <Label disabled={$disabled}>Enter a resource address</Label>
      <Input bind:value={selectedNfResource} disabled={$disabled} />
    </div>
  {/if}

  {#if selectedFromAccount}
    <div class="item">
      <Label disabled={$disabled}>Select token to distribute</Label>
      <Select
        items={fungibleResources}
        bind:selected={selectedFungibleResource}
        disabled={$disabled}
      />
    </div>

    <div class="item">
      <Label disabled={$disabled}>Value to distribute</Label>
      <Input
        bind:value={valueToDistribute}
        disabled={$disabled}
        schema={z.string().refine(
          (value) => {
            const parsed = parseInt(value);
            return !isNaN(parsed) && parsed > 0;
          },
          { message: 'Must be a positive integer value' }
        )}
      />
    </div>
  {/if}

  {#if selectedNfResource}
    <div class="item">
      <Label disabled={$disabled}>Distribute dividends to:</Label>

      {#if bondHolders.length === 0}
        <strong>No recipients found</strong>
      {:else}
        <ul class="recall-bond">
          {#each bondHolders as bondHolder}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <li class:disabled={$disabled}>
              <div>{bondHolder.nonFungibleId}</div>
              <div>{bondHolder.holderAddress}</div>
              <div>
                Share:
                {#if dividendsPerRecipient === 'NaN'}
                  0
                {:else}
                  {dividendsPerRecipient}
                {/if}
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}

  <Button disabled={isSendToWalletButtonDisabled} on:click={() => handleSendToWallet()}>
    {#if $disabled}
      Sending
    {:else}
      Send to wallet
    {/if}
  </Button>
</div>

<style lang="scss">
  .content {
    width: 40rem;
  }
  .item {
    margin-bottom: 1rem;
  }
  .recall-bond {
    background: white;

    li {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.5rem 0.5rem;
      border-bottom: 1px solid #ccc;
      grid-template-columns: 2rem 1fr 1fr;
    }
  }
</style>
