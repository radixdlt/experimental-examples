package main

import (
	"encoding/hex"
	"strings"
	"testing"
)

const Mnemonic24Words0 = "bright club bacon dinner achieve pull grid save ramp cereal blush woman humble limb repeat video sudden possible story mask neutral prize goose mandate"
const Mnemonic24Words1 = "zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo vote"

func test_assert(t *testing.T, condition bool, message string) {
	if !condition {
			t.Fatalf(message)
	}
}

func test(t *testing.T, mnemonic string, passphrase string, netwokrId uint8, index uint32, _ string, privateKey string, publicKey string, _ string, address string) {
	var privKey, pubKey, addr = derive_account_from_mnemonic(netwokrId, mnemonic, passphrase, index)
	test_assert(t, strings.Compare(hex.EncodeToString(privKey), privateKey) == 0, "private key differs")
	test_assert(t, strings.Compare(hex.EncodeToString(pubKey), publicKey) == 0, "public key differs")
	test_assert(t, strings.Compare(addr.AsStr(), address) == 0, "address differs")
}

func TestDeriveAccountMnemonic0WithoutPassphraseMainnetIndex0(t *testing.T) {
	test(t,
		Mnemonic24Words0,
		"",
		1,
		0,
		"m/44H/1022H/1H/525H/1460H/0H",
		"7b21b62816c6349293abc3a8c37470f917ae621ada2eb8d5124250e83b78f7ef",
		"6224937b15ec4017a036c0bd6999b7fa2b9c2f9452286542fd56f6a3fb6d33ed",
		"6facb00a836864511fdf8f181382209e64e83ad462288ea1bc7868f236fb8033",
		"account_rdx128vge9xzep4hsn4pns8qch5uqld2yvx6f3gfff786du7vlk6w6e6k4",
	)
}


func TestDeriveAccountMnemonic0WithoutPassphraseMainnetIndex1(t *testing.T) {
	test(t,
		Mnemonic24Words0,
		"",
		1,
		1,
		"m/44H/1022H/1H/525H/1460H/1H",
		"e153431a8e55f8fde4d6c5377ea4f749fd28a6f196c7735ce153bd16bcbfcd6e",
		"a8d6fb3b7f3627b4589c2b663e8cc9b4d49df7013220ac0edd7e22e6cc608fa6",
		"6facb00a836864511fdf8f181382209e64e83ad462288ea1bc7868f236fb8033",
		"account_rdx129xapgx582768wrkd54mq0a8lhp8aqp5vkkc8u2jfavujktl0tatcs",
	);
}


func TestDeriveAccountMnemonic0WithPassphraseMainnetIndex0(t *testing.T) {
	test(t,
		Mnemonic24Words0,
		"radix",
		1,
		0,
		"m/44H/1022H/1H/525H/1460H/0H",
		"cf52dbc7bb2663223e99fb31799281b813b939440a372d0aa92eb5f5b8516003",
		"d24cc6af91c3f103d7f46e5691ce2af9fea7d90cfb89a89d5bba4b513b34be3b",
		"3c986ebf9dcd9167a97036d3b2c997433e85e6cc4e4422ad89269dac7bfea240",
		"account_rdx12yy8n09a0w907vrjyj4hws2yptrm3rdjv84l9sr24e3w7pk7nuxst8",
	);
}


func TestDeriveAccountMnemonic0WithPassphraseMainnetIndex1(t *testing.T) {
	test(t,
		Mnemonic24Words0,
		"radix",
		1,
		1,
		"m/44H/1022H/1H/525H/1460H/1H",
		"6b736e59d41c5ba47dc427ebee9990426441e01db4abee5c44192492c269d8e0",
		"08740a2fd178c40ce71966a6537f780978f7f00548cfb59196344b5d7d67e9cf",
		"3c986ebf9dcd9167a97036d3b2c997433e85e6cc4e4422ad89269dac7bfea240",
		"account_rdx129a9wuey40lducsf6yu232zmzk5kscpvnl6fv472r0ja39f3hced69",
	);
}


func TestDeriveAccountMnemonic0WithoutPassphraseStokenetIndex0(t *testing.T) {
	test(t,
		Mnemonic24Words0,
		"",
		2,
		0,
		"m/44H/1022H/2H/525H/1460H/0H",
		"2e7def75661fcd8a8916866546a7713bc10fea728d46487f33e3fa09f538038c",
		"5fdfa89b784cc63fc90f67bd3481f6611a798a9581b414bf627f758075e95ca1",
		"6facb00a836864511fdf8f181382209e64e83ad462288ea1bc7868f236fb8033",
		"account_tdx_2_12x4rz8yh6t2qtpwdmzc2fvz9xvr00rvv37v7lk3eyh8re7z6r0xyw8",
	);
}


func TestDeriveAccountMnemonic0WithoutPassphraseStokenetIndex1(t *testing.T) {
	test(t,
		Mnemonic24Words0,
		"",
		2,
		1,
		"m/44H/1022H/2H/525H/1460H/1H",
		"c24fe54ad3cff0ba2627935e11f75fae12c477828d96fdfe3a707defa1d5db57",
		"0c6cf91e9b669bf09aeff687c86f6158f8fdfb23d0034bd3cb3f95c4443e9324",
		"6facb00a836864511fdf8f181382209e64e83ad462288ea1bc7868f236fb8033",
		"account_tdx_2_12xwkvs77drhw7lxnw2aewrs264yhhkln7zzpejye66q6gt5mc2kphn",
	);
}


func TestDeriveAccountMnemonic0WithPassphraseStokenetIndex0(t *testing.T) {
	test(t,
		Mnemonic24Words0,
		"radix",
		2,
		0,
		"m/44H/1022H/2H/525H/1460H/0H",
		"4ec345585ce49c35424288dba67d0608eec3972ea4d7a54afeaf4b2cd7687e80",
		"18c7409458a82281711b668f833b0485e8fb58a3ceb8a728882bf6b83d3f06a9",
		"3c986ebf9dcd9167a97036d3b2c997433e85e6cc4e4422ad89269dac7bfea240",
		"account_tdx_2_1289zm062j788dwrjefqkfgfeea5tkkdnh8htqhdrzdvjkql4kxceql",
	);
}


func TestDeriveAccountMnemonic0WithPassphraseStokenetIndex1(t *testing.T) {
	test(t,
		Mnemonic24Words0,
		"radix",
		2,
		1,
		"m/44H/1022H/2H/525H/1460H/1H",
		"f35325ea11511bfb16b0b846ae6d86ec9a91f978d4885463b57872627440ec1e",
		"26b3fd7f65f01ff8e418a56722fde9cc6fc18dc983e0474e6eb6c1cf3bd44f23",
		"3c986ebf9dcd9167a97036d3b2c997433e85e6cc4e4422ad89269dac7bfea240",
		"account_tdx_2_129663ef7fj8azge3y6sl73lf9vyqt53ewzlf7ul2l76mg5wyqlqlpr",
	);
}


func TestDeriveAccountMnemonic1WithoutPassphraseMainnetIndex0(t *testing.T) {
	test(t,
		Mnemonic24Words1,
		"",
		1,
		0,
		"m/44H/1022H/1H/525H/1460H/0H",
		"2bd55b473c972e32667582acd73653b67f7d56a74f9aab3f73126a7b7ad49de6",
		"cd0ace2fe890da0139d69d4414f146e5a36d4d76b65520d0d3d6967b1b57cb99",
		"3bf4636876a9c795486194d2eaff32790961ed9005e18a7ebe677f0947b54087",
		"account_rdx128dp80lfaywaqchg4fqymy76pqvl20mjmpw08839yfh4qz6us4ltaj",
	);
}


func TestDeriveAccountMnemonic1WithoutPassphraseMainnetIndex1(t *testing.T) {
	test(t,
		Mnemonic24Words1,
		"",
		1,
		1,
		"m/44H/1022H/1H/525H/1460H/1H",
		"af64f29665576e01e3fb10f9836e4b0fa066efe7a88f867f917be00620386f0b",
		"bb09890daf2ed7a89bcd69eb56f56bc9208a37a147c1d9804db4f12d185a46a6",
		"3bf4636876a9c795486194d2eaff32790961ed9005e18a7ebe677f0947b54087",
		"account_rdx129vlwaav373ucq6jewq6z722de5yd4ulklguv87u0ql0hmw5redatp",
	);
}


func TestDeriveAccountMnemonic1WithPassphraseMainnetIndex0(t *testing.T) {
	test(t,
		Mnemonic24Words1,
		"foo",
		1,
		0,
		"m/44H/1022H/1H/525H/1460H/0H",
		"37947aece03dfbbe89672cb5b1caba88629625739750db7b8b0d8cb4bd5631f8",
		"111ae3183e7b93c0f751bbfbc8aba6888434d889e3805f8941669e3194721290",
		"883882e1d9d47b98090163bb4b369ae00349507693d856b1854de103dfe52793",
		"account_rdx12xg8ncs6xd8fr9t3gzx3sv3k8nmu8q4ekgxaahdlnxhn2rfrh04k2w",
	);
}


func TestDeriveAccountMnemonic1WithPassphraseMainnetIndex1(t *testing.T) {
	test(t,
		Mnemonic24Words1,
		"foo",
		1,
		1,
		"m/44H/1022H/1H/525H/1460H/1H",
		"431fc569aac0a7fe55c7537b9c46977c66eb50cd6383795ecef64a6fb2aa39aa",
		"e24df52deaa191fd247d1f0c10d55ff9251c1b7b50e61125bb419bd28e76b4c2",
		"883882e1d9d47b98090163bb4b369ae00349507693d856b1854de103dfe52793",
		"account_rdx12ydzkre4ujmn5mz2rddqt5mytl7ek52c7fgks48fusj32rfs0ns40n",
	);
}


func TestDeriveAccountMnemonic1WithoutPassphraseStokenetIndex0(t *testing.T) {
	test(t,
		Mnemonic24Words1,
		"",
		2,
		0,
		"m/44H/1022H/2H/525H/1460H/0H",
		"b5ecb0b6b928a198cb1a6bb87b0b67a5ae675961ea4b835e9aad8629828600ab",
		"12d9d790ef471e11738ff7ba3f99d1ddc58d969c9a796848f8e4af01d294c263",
		"3bf4636876a9c795486194d2eaff32790961ed9005e18a7ebe677f0947b54087",
		"account_tdx_2_129t4rk8hyu9ekz9jgxcveprkm40dly5f4tc426sdqz7fa7mtgkmmff",
	);
}


func TestDeriveAccountMnemonic1WithoutPassphraseStokenetIndex1(t *testing.T) {
	test(t,
		Mnemonic24Words1,
		"",
		2,
		1,
		"m/44H/1022H/2H/525H/1460H/1H",
		"2b2e6ce6abe0ab7ac7eb15d0809f4a44809ef979449bdd3550a5791a86e927ca",
		"2b1414b927a03ade597127bdaa90db93f60518795141ab5c451649f4997acddb",
		"3bf4636876a9c795486194d2eaff32790961ed9005e18a7ebe677f0947b54087",
		"account_tdx_2_128cplhpppm0295zxf9507tlng8zf539jv9rc2pmaymkft36qpt7slj",
	);
}


func TestDeriveAccountMnemonic1WithPassphraseStokenetIndex0(t *testing.T) {
	test(t,
		Mnemonic24Words1,
		"foo",
		2,
		0,
		"m/44H/1022H/2H/525H/1460H/0H",
		"a5f1c8d8433416b147c09ce6a5dd83bb77cab9d344ea9ea458d4a0c45b30ec7a",
		"810b03bf9c767f66e0e8caca015873c96bf7df0c5a28884f30a9a2837386cb7b",
		"883882e1d9d47b98090163bb4b369ae00349507693d856b1854de103dfe52793",
		"account_tdx_2_129kc6c9fhmsgstj4kv8ycc76z7nf36j46saav84lwt6ttdpeq44w6l",
	);
}


func TestDeriveAccountMnemonic1WithPassphraseStokenetIndex1(t *testing.T) {
	test(t,
		Mnemonic24Words1,
		"foo",
		2,
		1,
		"m/44H/1022H/2H/525H/1460H/1H",
		"df60dafc61032f3bb0bd48ef6ba4bed03b93f5f87277d47456655736f4be709f",
		"eb04aaa6721c86fd71f9e7e5173f7a176a11c9e9407f39bbe998bc3bb12f03e5",
		"883882e1d9d47b98090163bb4b369ae00349507693d856b1854de103dfe52793",
		"account_tdx_2_129peacgfcj99m8ty9s2z09u7n3dhf6ps0n6mlz5ttex7mnfrzyjtt5",
	);
}