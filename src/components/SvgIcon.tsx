import React from 'react';
import { StyleSheet } from 'react-native';

// Import all SVG icons from svg-pack
// Financial Icons
import DepositIcon from '../../svg-pack/deposit-svgrepo-com.svg';
import SavingsIcon from '../../svg-pack/savings-svgrepo-com.svg';
import LoanIcon from '../../svg-pack/loan-svgrepo-com.svg';
import CreditReportIcon from '../../svg-pack/credit-report-svgrepo-com.svg';
import CurrencyExchangeIcon from '../../svg-pack/currency-exchange-svgrepo-com.svg';
import TransactionRecordIcon from '../../svg-pack/transaction-record-svgrepo-com.svg';
import SafeIcon from '../../svg-pack/safe-svgrepo-com.svg';
import FinancialSecurityIcon from '../../svg-pack/financial-security-svgrepo-com.svg';

// Business
import BriefcaseIcon from '../../svg-pack/briefcase-svgrepo-com.svg';
import CompanyIcon from '../../svg-pack/company-svgrepo-com.svg';
import CooperateIcon from '../../svg-pack/cooperate-svgrepo-com.svg';
import HandbagIcon from '../../svg-pack/handbag-svgrepo-com.svg';

// Analytics
import DataTrendsIcon from '../../svg-pack/data-trends-svgrepo-com.svg';
import MarketAnalysisIcon from '../../svg-pack/market-analysis-svgrepo-com.svg';
import PerformanceIncreaseIcon from '../../svg-pack/performance-increase-svgrepo-com.svg';
import DeclinePerformanceIcon from '../../svg-pack/decline-in-performance-svgrepo-com.svg';
import StockMovementIcon from '../../svg-pack/stock-movement-svgrepo-com.svg';
import RiskAssessmentIcon from '../../svg-pack/risk-assessment-svgrepo-com.svg';
import TargetIcon from '../../svg-pack/target-svgrepo-com.svg';

// Customer
import CustomerServiceIcon from '../../svg-pack/customer-service-svgrepo-com.svg';
import SalesmanIcon from '../../svg-pack/salesman-svgrepo-com.svg';

// Features
import BenefitIcon from '../../svg-pack/benefit-svgrepo-com.svg';
import RewardIcon from '../../svg-pack/reward-svgrepo-com.svg';
import VerifiedIcon from '../../svg-pack/verified-svgrepo-com.svg';
import LikeIcon from '../../svg-pack/like-svgrepo-com.svg';
import IdeaIcon from '../../svg-pack/idea-svgrepo-com.svg';

// UI Elements
import CheckInIcon from '../../svg-pack/check-in-svgrepo-com.svg';
import SettingIcon from '../../svg-pack/setting-svgrepo-com.svg';
import HelpIcon from '../../svg-pack/help-svgrepo-com.svg';
import RecordIcon from '../../svg-pack/record-svgrepo-com.svg';
import NotesIcon from '../../svg-pack/notes-svgrepo-com.svg';
import MessageCenterIcon from '../../svg-pack/message-center-svgrepo-com.svg';
import HomeSmileIcon from '../../svg-pack/home-smile-angle-svgrepo-com.svg';

// Account
import OpenAccountIcon from '../../svg-pack/open-an-account-svgrepo-com.svg';
import PasswordManagementIcon from '../../svg-pack/password-management-svgrepo-com.svg';
import ProvidentFundIcon from '../../svg-pack/provident-fund-inquiry-svgrepo-com.svg';

// Mobile
import MobileBindingIcon from '../../svg-pack/mobile-phone-binding-svgrepo-com.svg';
import MobileTransferIcon from '../../svg-pack/mobile-phone-transfer-svgrepo-com.svg';

// Time
import PointInTimeIcon from '../../svg-pack/point-in-time-svgrepo-com.svg';
import DirectionIcon from '../../svg-pack/direction-svgrepo-com.svg';
import QualitativeChangeIcon from '../../svg-pack/qualitative-change-svgrepo-com.svg';
import TheGameIcon from '../../svg-pack/the-game-svgrepo-com.svg';

// Icon mapping
export const SVG_ICONS = {
  // Financial (8 icons)
  deposit: DepositIcon,
  savings: SavingsIcon,
  loan: LoanIcon,
  creditReport: CreditReportIcon,
  currencyExchange: CurrencyExchangeIcon,
  transactionRecord: TransactionRecordIcon,
  safe: SafeIcon,
  financialSecurity: FinancialSecurityIcon,
  
  // Business (4 icons)
  briefcase: BriefcaseIcon,
  company: CompanyIcon,
  cooperate: CooperateIcon,
  handbag: HandbagIcon,
  
  // Analytics (7 icons)
  dataTrends: DataTrendsIcon,
  marketAnalysis: MarketAnalysisIcon,
  performanceIncrease: PerformanceIncreaseIcon,
  declinePerformance: DeclinePerformanceIcon,
  stockMovement: StockMovementIcon,
  riskAssessment: RiskAssessmentIcon,
  target: TargetIcon,
  
  // Customer (2 icons)
  customerService: CustomerServiceIcon,
  salesman: SalesmanIcon,
  
  // Features (5 icons)
  benefit: BenefitIcon,
  reward: RewardIcon,
  verified: VerifiedIcon,
  like: LikeIcon,
  idea: IdeaIcon,
  
  // UI Elements (7 icons)
  checkIn: CheckInIcon,
  setting: SettingIcon,
  help: HelpIcon,
  record: RecordIcon,
  notes: NotesIcon,
  messageCenter: MessageCenterIcon,
  homeSmile: HomeSmileIcon,
  
  // Account (3 icons)
  openAccount: OpenAccountIcon,
  passwordManagement: PasswordManagementIcon,
  providentFund: ProvidentFundIcon,
  
  // Mobile (2 icons)
  mobileBinding: MobileBindingIcon,
  mobileTransfer: MobileTransferIcon,
  
  // Time (4 icons)
  pointInTime: PointInTimeIcon,
  direction: DirectionIcon,
  qualitativeChange: QualitativeChangeIcon,
  theGame: TheGameIcon,
};

export type SvgIconName = keyof typeof SVG_ICONS;

interface SvgIconProps {
  name: SvgIconName;
  size?: number;
  color?: string;
  style?: any;
}

export default function SvgIcon({ name, size = 24, color = '#5A9A8E', style }: SvgIconProps) {
  const IconComponent = SVG_ICONS[name];
  
  if (!IconComponent) {
    return null;
  }
  
  return (
    <IconComponent
      width={size}
      height={size}
      fill={color}
      style={style}
    />
  );
}

