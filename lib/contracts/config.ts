import JobFactoryABI from './abis/JobFactory.json';
import ProofOfWorkJobABI from './abis/ProofOfWorkJob.json';
import ReputationSystemABI from './abis/ReputationSystem.json';
import DisputeDAOABI from './abis/DisputeDAO.json';
import ZKResumeABI from './abis/ZKResume.json';

export const CONTRACT_ADDRESSES = {
  JOB_FACTORY: '0xE245f8DF3DC10e0CDCC917023D5B240e8BC24D08',
  // These will be dynamically created by the factory
  PROOF_OF_WORK_JOB: '',
  REPUTATION_SYSTEM: '',
  DISPUTE_DAO: '',
  ZK_RESUME: ''
} as const;

export const CONTRACT_ABIS = {
  JOB_FACTORY: JobFactoryABI,
  PROOF_OF_WORK_JOB: ProofOfWorkJobABI,
  REPUTATION_SYSTEM: ReputationSystemABI,
  DISPUTE_DAO: DisputeDAOABI,
  ZK_RESUME: ZKResumeABI
} as const; 