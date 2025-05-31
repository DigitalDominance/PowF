import { ethers } from 'ethers';

export interface JobFactoryContract extends ethers.Contract {
  createJob: (
    payType: number,
    weeklyPay: ethers.BigNumberish,
    durationWeeks: ethers.BigNumberish,
    totalPay: ethers.BigNumberish,
    title: string,
    description: string,
    numPositions: ethers.BigNumberish
  ) => Promise<ethers.ContractTransaction>;
  
  PLATFORM_FEE_BPS: () => Promise<number>;
  feeRecipient: () => Promise<string>;
}

export interface ProofOfWorkJobContract extends ethers.Contract {
  employer: () => Promise<string>;
  payType: () => Promise<number>;
  weeklyPay: () => Promise<ethers.BigNumber>;
  durationWeeks: () => Promise<ethers.BigNumber>;
  totalPay: () => Promise<ethers.BigNumber>;
  createdAt: () => Promise<ethers.BigNumber>;
  positions: () => Promise<ethers.BigNumber>;
  
  assignWorker: (worker: string) => Promise<ethers.ContractTransaction>;
  setActive: (active: boolean) => Promise<ethers.ContractTransaction>;
  releaseWeekly: () => Promise<ethers.ContractTransaction>;
  releaseOneOff: () => Promise<ethers.ContractTransaction>;
  openDispute: () => Promise<ethers.ContractTransaction>;
}

export interface ReputationSystemContract extends ethers.Contract {
  workerScore: (address: string) => Promise<ethers.BigNumber>;
  employerScore: (address: string) => Promise<ethers.BigNumber>;
}

export interface DisputeDAOContract extends ethers.Contract {
  createDispute: (job: string, jobId: ethers.BigNumberish) => Promise<ethers.ContractTransaction>;
  vote: (id: ethers.BigNumberish, support: boolean) => Promise<ethers.ContractTransaction>;
  finalize: (id: ethers.BigNumberish) => Promise<ethers.ContractTransaction>;
  disputes: (id: ethers.BigNumberish) => Promise<[string, string, boolean, ethers.BigNumber, ethers.BigNumber]>;
}

export interface ZKResumeContract extends ethers.Contract {
  submitProof: (proof: string, pubSignals: ethers.BigNumberish[]) => Promise<ethers.ContractTransaction>;
  proofs: (address: string) => Promise<string>;
}