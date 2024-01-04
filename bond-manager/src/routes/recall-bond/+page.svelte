<script lang="ts">
  import { dAppToolkit, walletDataStore } from '$lib/stores/radix';
  import { derived, writable } from 'svelte/store';
  import Label from '$lib/components/Label.svelte';
  import Select from '$lib/components/Select.svelte';
  import Button from '$lib/components/Button.svelte';
  import SelectNft from '$lib/components/SelectNft.svelte';
  import Input from '$lib/components/Input.svelte';
  import type { StateNonFungibleLocationResponseItem } from '@radixdlt/radix-dapp-toolkit';
  import { createRecallBondsTransactionManifest } from '$lib/transaction-manifests/recall-bonds';

  let status = writable<'initial' | 'sending'>('initial');

  let accounts: { id: string; label: string }[] = [];
  let selectedFromAccount: string | undefined;
  let selectedProof: string;

  let nfResources: { id: string; label: string }[] = [];
  let selectedNfResource: string | undefined;

  let bondHolders: {
    nonFungibleId: string;
    vaultAddresses: string;
    resourceAddress: string;
    address: string;
    holderAddress: string;
  }[] = [];

  let selectedBondHolders: string[] = [];

  let disabled = derived([status], ([$status]) => $status === 'sending');

  let isSendToWalletButtonDisabled: boolean = true;

  $: {
    isSendToWalletButtonDisabled =
      $status === 'sending' ||
      !selectedFromAccount ||
      !selectedProof ||
      selectedBondHolders.length === 0;
  }
  accounts =
    $walletDataStore?.accounts.map((account): { id: string; label: string } => ({
      id: account.address,
      label: account.label
    })) ?? [];

  $: {
    if (selectedFromAccount)
      $dAppToolkit?.gatewayApi.state
        .getEntityDetailsVaultAggregated([selectedFromAccount], { explicitMetadata: ['name'] })
        .then(([response]) => {
          return Promise.all(
            response.non_fungible_resources.items
              .map((resource) => {
                const resourceNameValue = resource.explicit_metadata?.items.find(
                  (item) => item.key === 'name'
                )?.value;

                const resourceName =
                  resourceNameValue && resourceNameValue.typed.type === 'String'
                    ? resourceNameValue.typed.value
                    : 'Unnamed Resource';

                return {
                  id: resource.resource_address,
                  label: resourceName
                };
              })
              .flat(2)
          );
        })
        .then((items) => {
          nfResources = items;
        });
  }

  $: {
    if (selectedNfResource) {
      selectedBondHolders = [];
      $dAppToolkit?.gatewayApi.state
        .getNonFungibleIds(selectedNfResource)
        .then(({ items: ids }) => {
          return $dAppToolkit?.gatewayApi.state
            .getNonFungibleLocation(selectedNfResource!, ids)
            .then((locationResponse) => {
              const vaultAddresses = locationResponse
                .map((item) => item.owning_vault_address)
                .filter((item): item is string => !!item);

              const locationMap = locationResponse.reduce((acc, item, index) => {
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

  const handleSendToWallet = async () => {
    const [proofResourceAddress, proofId] = selectedProof.split(':');

    const bondsToRecall = bondHolders.map((item) => ({
      vaultAddress: item.vaultAddresses,
      bondNftId: item.nonFungibleId
    }));

    const transactionManifest = createRecallBondsTransactionManifest({
      accountAddress: selectedFromAccount!,
      proofResourceAddress: proofResourceAddress,
      proofId,
      bonds: bondsToRecall,
      bondResourceAddress: selectedNfResource!
    });

    $status = 'sending';
    $dAppToolkit?.walletApi
      .sendTransaction({ transactionManifest, message: 'Recalling bond' })
      .map(() => {
        $status = 'initial';
        selectedFromAccount = undefined;
        selectedNfResource = undefined;
      });
  };
</script>

<div class="content">
  <div class="item">
    <Label disabled={$disabled}>Select account to recall to</Label>
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

  {#if selectedNfResource}
    <div class="item">
      <Label disabled={$disabled}>Select bonds to recall</Label>

      {#if bondHolders.length === 0}
        <strong>No bonds to recall</strong>
      {:else}
        <ul class="recall-bond">
          {#each bondHolders as bondHolder}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <li
              class:selected={selectedBondHolders.includes(bondHolder.nonFungibleId)}
              class:disabled={$disabled}
              on:click={() => {
                selectedBondHolders = selectedBondHolders.includes(bondHolder.nonFungibleId)
                  ? selectedBondHolders.filter((item) => item !== bondHolder.nonFungibleId)
                  : [...selectedBondHolders, bondHolder.nonFungibleId];
              }}
            >
              <div>{bondHolder.nonFungibleId}</div>
              <div>{bondHolder.holderAddress}</div>
            </li>
          {/each}
        </ul>
      {/if}
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
      display: grid;
      gap: 0.5rem;
      padding: 0.5rem 0.5rem;
      border-bottom: 1px solid #ccc;
      grid-template-columns: 2rem 1fr;
      cursor: pointer;
      &.selected {
        background: #ccc;
      }
    }
  }
</style>
