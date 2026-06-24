export interface IPlatformSetting {
  _id?:                  string;
  platformName:          string;
  supportEmail?:         string;
  pricePerBuilding:      number;   // used to compute subscription quotes
  pricePerUnit:          number;   // used to compute subscription quotes
  currency:              string;   // e.g. 'usd'
  maintenanceMode:       boolean;
  maxFeaturedBuildings:  number;
  updatedBy?:            string;
  createdAt?:            Date;
  updatedAt?:            Date;
}
