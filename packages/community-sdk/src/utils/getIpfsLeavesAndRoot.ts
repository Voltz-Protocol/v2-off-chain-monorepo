import axios from 'axios';
import { LeafInfo } from '../types';
import { ethers } from 'ethers';

const ipfsLeavesCID = `QmQbcRJHqjJGTzugS3QexDMCdx159EjzAVkygPzUCL2tWP`;
const ipfsLeavesURI = `https://ipfs.io/ipfs/${ipfsLeavesCID}`;

export async function getIpfsData(): Promise<{
  leaves: Array<{
    owner: string;
    badgesCount: number;
  }>;
  root: string;
}> {
  const data = await axios.get(ipfsLeavesURI, {
    headers: {
      Accept: 'text/plain',
    },
  });

  const snaphots: Array<{
    owner: string;
    badgesCount: number;
  }> = data.data.snapshot;

  const root = ethers.utils.hexZeroPad(data.data.root, 32);

  return { leaves: snaphots, root };
}

export async function getLeavesAndRootFromIpfs(ownerAddress: string): Promise<{
  leaves: Array<LeafInfo>;
  root: string;
  numberOfAccessPasses: number;
}> {
  const { leaves, root } = await getIpfsData();

  let numberOfAccessPasses = 0;
  const subgraphSnapshots: Array<LeafInfo> = leaves.map((entry) => {
    if (entry.owner.toLowerCase() === ownerAddress.toLowerCase()) {
      numberOfAccessPasses = entry.badgesCount;
    }
    return {
      account: entry.owner.toLowerCase(),
      numberOfAccessPasses: entry.badgesCount,
    };
  });

  return {
    leaves: subgraphSnapshots,
    root,
    numberOfAccessPasses,
  };
}
