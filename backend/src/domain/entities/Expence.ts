export type ExpenseCategory =
  | 'repair'          
  | 'utility'         
  | 'salary'         
  | 'tax'             
  | 'renovation'     
  | 'cleaning'       
  | 'insurance'       
  | 'security'      
  | 'commission'     
  | 'legal'         
  | 'marketing'      
  | 'other';       

export type ExpenseStatus = 'pending' | 'paid' | 'cancelled';
export type ExpenseMethod = 'cash' | 'bank_transfer' | 'upi' | 'cheque' | 'card';

export interface IExpense {
  _id?:          string;
  buildingId:    string;       
  unitId?:       string;       
  category:      ExpenseCategory;
  title:         string;       
  description?:  string;
  amount:        number;
  date:          Date;        
  status:        ExpenseStatus;
  method:        ExpenseMethod;
  paidTo?:       string;      
  receiptUrl?:   string;      
  invoiceNumber?: string;
  recordedBy:    string;      
  createdAt?:    Date;
  updatedAt?:    Date;
}
