import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../contracts/config';
import type { 
  JobFactoryContract,
  ProofOfWorkJobContract,
  ReputationSystemContract,
  DisputeDAOContract,
  ZKResumeContract
} from '../contracts/types';
import { useMemo } from 'react';

export function useContracts() {
  const { provider } = useAppKitProvider();
  const { address } = useAppKitAccount();

  return useMemo(() => {
    if (!provider || !address) return null;

    const signer = provider.getSigner();

    const jobFactory = new ethers.Contract(
      CONTRACT_ADDRESSES.JOB_FACTORY,
      CONTRACT_ABIS.JOB_FACTORY,
      signer
    ) as JobFactoryContract;

    const getProofOfWorkJob = (address: string) => {
      return new ethers.Contract(
        address,
        CONTRACT_ABIS.PROOF_OF_WORK_JOB,
        signer
      ) as ProofOfWorkJobContract;
    };

    const getReputationSystem = (address: string) => {
      return new ethers.Contract(
        address,
        CONTRACT_ABIS.REPUTATION_SYSTEM,
        signer
      ) as ReputationSystemContract;
    };

    const getDisputeDAO = (address: string) => {
      return new ethers.Contract(
        address,
        CONTRACT_ABIS.DISPUTE_DAO,
        signer
      ) as DisputeDAOContract;
    };

    const getZKResume = (address: string) => {
      return new ethers.Contract(
        address,
        CONTRACT_ABIS.ZK_RESUME,
        signer
      ) as ZKResumeContract;
    };

    return {
      jobFactory,
      getProofOfWorkJob,
      getReputationSystem,
      getDisputeDAO,
      getZKResume
    };
  }, [provider, address]);
} 