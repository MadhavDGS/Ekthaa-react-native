import React from 'react';

// Import illustrations from svg-illustrations--noticons folder
import EmptyCustomers from '../../svg-illustrations--noticons/undraw_group-selfie_uih0.svg';
import NoData from '../../svg-illustrations--noticons/undraw_all-the-data_ijgn.svg';
import ComingSoon from '../../svg-illustrations--noticons/undraw_coming-soon_7lvi.svg';
import HappyCustomer from '../../svg-illustrations--noticons/undraw_happy-customer_4h84.svg';
import OnlinePayments from '../../svg-illustrations--noticons/undraw_online-payments_d5ef.svg';
import FinancialData from '../../svg-illustrations--noticons/undraw_financial-data_lbci.svg';
import Analytics from '../../svg-illustrations--noticons/undraw_real-time-analytics_50za.svg';
import Settings from '../../svg-illustrations--noticons/undraw_settings_alfp.svg';
import Authentication from '../../svg-illustrations--noticons/undraw_authentication_1evl.svg';
import DocumentReady from '../../svg-illustrations--noticons/undraw_document-ready_o5d5.svg';
import ToDoList from '../../svg-illustrations--noticons/undraw_to-do-list_o3jf.svg';
import CheckBoxes from '../../svg-illustrations--noticons/undraw_check-boxes_x5fg.svg';
import FAQ from '../../svg-illustrations--noticons/undraw_faq_pgxi.svg';
import Savings from '../../svg-illustrations--noticons/undraw_savings_d97f.svg';
import PieChart from '../../svg-illustrations--noticons/undraw_pie-chart_eo9h.svg';
import DataProcessing from '../../svg-illustrations--noticons/undraw_data-processing_ohfw.svg';
import SearchApp from '../../svg-illustrations--noticons/undraw_search-app_cpm0.svg';

// Illustration mapping
export const ILLUSTRATIONS = {
  emptyCustomers: EmptyCustomers,
  noData: NoData,
  comingSoon: ComingSoon,
  happyCustomer: HappyCustomer,
  onlinePayments: OnlinePayments,
  financialData: FinancialData,
  analytics: Analytics,
  settings: Settings,
  authentication: Authentication,
  documentReady: DocumentReady,
  toDoList: ToDoList,
  checkBoxes: CheckBoxes,
  faq: FAQ,
  savings: Savings,
  pieChart: PieChart,
  dataProcessing: DataProcessing,
  searchApp: SearchApp,
};

export type IllustrationName = keyof typeof ILLUSTRATIONS;

interface IllustrationProps {
  name: IllustrationName;
  width?: number;
  height?: number;
  style?: any;
}

export default function Illustration({ name, width = 200, height = 200, style }: IllustrationProps) {
  const IllustrationComponent = ILLUSTRATIONS[name];
  
  if (!IllustrationComponent) {
    return null;
  }
  
  return (
    <IllustrationComponent
      width={width}
      height={height}
      style={style}
    />
  );
}
