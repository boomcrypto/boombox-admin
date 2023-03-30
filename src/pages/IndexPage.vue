<template>
  <q-page padding>
    <div class="row q-col-gutter-xl">
      <div class="col-12">
        <q-card flat class="boom-card">
          <q-card-section>
            By default, we assume you will be using FAST Pool for pooling your
            community's delegation. If that is not the case, you will need to
            provide your own reward address below.
          </q-card-section>
          <q-form>
            <q-input
              v-model="adminContract"
              type="text"
              label="Admin Contract"
              hint="Change this at your own risk."
            />
            <q-input
              v-model="boomboxTrait"
              type="text"
              label="Existing NFT Contract Id"
            />
            <q-input
              v-model="startingCycle"
              type="text"
              label="Starting Cycle"
            />
            <div class="column">
              Number of Cycles
              <q-radio
                v-model="numberOfCycles"
                name="shape"
                val="1"
                label="1 cycle"
                color="accent"
              />
              <q-radio
                v-model="numberOfCycles"
                name="shape"
                val="2"
                label="2 cycles"
                color="accent"
              />
              <q-radio
                v-model="numberOfCycles"
                name="shape"
                val="3"
                label="3 cycles"
                color="accent"
              />
              <q-radio
                v-model="numberOfCycles"
                name="shape"
                val="6"
                label="6 cycles"
                color="accent"
              />
              <q-radio
                v-model="numberOfCycles"
                name="shape"
                val="12"
                label="12 cycles"
                color="accent"
              />
            </div>
            <q-input
              v-model="minStackingAmount"
              type="text"
              label="Minimum Stacking Amount"
            />
            <q-input
              v-model="rewardAddress"
              type="text"
              label="Reward Address"
            />
            <q-input v-model="owner" type="text" label="Owner" />
            <q-card-actions align="center">
              <q-btn
                no-caps
                color="accent"
                label="Add Custom Boombox"
                class="q-mt-md"
                @click="onAdd"
              />
            </q-card-actions>
          </q-form>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import {
  standardPrincipalCV,
  uintCV,
  contractPrincipalCV,
  tupleCV,
  bufferCV,
  cvToString,
} from "@stacks/transactions";
import { openContractCall } from "@stacks/connect";
import { poxAddressToTuple } from "@stacks/stacking";

const boomboxTrait = ref("");
const startingCycle = ref("");
const numberOfCycles = ref("2");
const minStackingAmount = ref("40");
const rewardAddress = ref("bc1qs0kkdpsrzh3ngqgth7mkavlwlzr7lms2zv3wxe");
const owner = ref("");
const distributionTrait = ref("");
const adminContract = ref(
  "SPMS4E9RQ4GCGG68R6D15PKV01TYNCBPYZG1ZMFE.boombox-admin-v5"
);
const adminContractAddress = ref("SPMS4E9RQ4GCGG68R6D15PKV01TYNCBPYZG1ZMFE");
const adminContractName = ref("boombox-admin-v5");
const stxAddress = ref("SPMS4E9RQ4GCGG68R6D15PKV01TYNCBPYZG1ZMFE");

console.log(
  "decoded address",
  cvToString(poxAddressToTuple(rewardAddress.value))
);

async function onAdd() {
  console.log("boomboxTrait", boomboxTrait.value);
  console.log("startingCycle", startingCycle.value);
  console.log("numberOfCycles", numberOfCycles.value);
  console.log("minStackingAmount", minStackingAmount.value);
  console.log("rewardAddress", rewardAddress.value);
  console.log("owner", owner.value);

  const functionName = "add-boombox";
  const [contractAddress, contractName] = boomboxTrait.value.split(".");
  let functionArgs;
  try {
    functionArgs = [
      // nft-contract
      contractPrincipalCV(contractAddress, contractName),
      uintCV(startingCycle.value), // cycle
      uintCV(numberOfCycles.value), //  locking-period
      uintCV(minStackingAmount.value * 1000000), // minimum-amount
      poxAddressToTuple(rewardAddress.value), // reward address
      standardPrincipalCV(owner.value), // owner
      contractPrincipalCV(
        "SPMS4E9RQ4GCGG68R6D15PKV01TYNCBPYZG1ZMFE",
        "distribution-b56-user"
      ), // distribution trait
    ];
  } catch (error) {
    console.log("error creating function args: ", error);
  }
  try {
    await openContractCall({
      contractAddress: adminContractAddress,
      contractName: adminContractName,
      functionName,
      functionArgs,
      stxAddress: stxAddress,
      onFinish: async (data) => {
        console.log("done");
      },
    });
  } catch (e) {
    console.log("Error adding boombox:", e);
  }
}
</script>
