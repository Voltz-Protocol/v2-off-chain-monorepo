import { Contract, Signer, providers } from 'ethers';

export const getERC20TokenContract = (
  tokenAddress: string,
  subject: providers.Provider | Signer,
): Contract => {
  const abi: string[] = [
    `function approve(address, uint256) external returns (bool)`,
    `function balanceOf(address) external view returns (uint256)`,
    `function allowance(address,address) external view returns (uint256)`,
    `function approve(address,uint256) external returns (bool)`,
  ];

  const contract = new Contract(tokenAddress, abi, subject);

  return contract;
};
